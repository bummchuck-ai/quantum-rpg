import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, getResponseFormat } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';
import { TIER_LIMITS } from '../../../lib/stripe';

// In-memory rate limiter with automatic cleanup
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per window (tighter for cost control)
const RATE_WINDOW = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (now - lastCleanup > 300_000) {
    lastCleanup = now;
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// --- Provider Setup ---
const geminiKey = process.env.GEMINI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

// Primary: Gemini, Fallback: Claude
async function callGemini(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build chat history for Gemini format
  const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const msg of messages.slice(0, -1)) {
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const chat = model.startChat({
    history,
    systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

async function callClaude(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  if (!anthropic) throw new Error('Anthropic API key not configured');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

async function callLLM(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  // Try Gemini first (primary)
  if (genAI) {
    try {
      return await callGemini(systemPrompt, messages);
    } catch (e) {
      console.warn('Gemini failed, trying Claude fallback:', e);
    }
  }

  // Fallback to Claude
  if (anthropic) {
    try {
      return await callClaude(systemPrompt, messages);
    } catch (e) {
      console.warn('Claude also failed:', e);
    }
  }

  throw new Error('No LLM provider available');
}

function parseGMResponse(text: string) {
  let clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    if (start !== -1) {
      let depth = 0;
      for (let i = start; i < clean.length; i++) {
        if (clean[i] === '{') depth++;
        else if (clean[i] === '}') depth--;
        if (depth === 0) {
          try { return JSON.parse(clean.slice(start, i + 1)); }
          catch { break; }
        }
      }
    }
    return {
      narrative: text || 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.',
      options: [{ id: 'A', text: 'Erneut versuchen' }],
      stateChanges: {},
      mood: 'mysterious',
    };
  }
}

export const maxDuration = 60;

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '';
  const host = req.headers.get('host') || '';
  if (origin && !origin.includes(host) && !origin.includes('localhost') && !origin.includes('vercel.app')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // --- Auth + Quota Check ---
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createServerClient();
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        userId = user.id;

        // Check quota (skip for raw/internal requests)
        if (!body.messages) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, daily_requests_used, daily_reset_at, credits')
            .eq('user_id', userId)
            .single();

          if (profile) {
            const dailyLimit = TIER_LIMITS[profile.subscription_tier] || 5;
            const { data: allowed } = await supabase.rpc('use_request', {
              p_user_id: userId,
              p_daily_limit: dailyLimit,
            });

            if (!allowed) {
              return NextResponse.json(
                { error: 'LIMIT_REACHED', dailyLimit, credits: profile.credits },
                { status: 429 }
              );
            }
          }
        }
      }
    }

    // If no auth and not a raw request, require login
    if (!userId && !body.messages) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // 1. Raw message request (e.g. from Story Generator, IntroCrawl)
    if (body.messages) {
      const systemMsg = body.messages.find((m: { role: string; content: string }) => m.role === 'system');
      const userMsg = body.messages.find((m: { role: string; content: string }) => m.role === 'user');

      const text = await callLLM(
        systemMsg?.content || '',
        [{ role: 'user' as const, content: userMsg?.content || '' }]
      );

      if (body.rawText) {
        return NextResponse.json({ rawText: text.trim() });
      }

      const parsed = parseGMResponse(text);
      return NextResponse.json(parsed);
    }

    const { gameState, userMessage, history, language } = body;

    // 2. Regular Game State request
    if (!gameState || !gameState.character) {
      throw new Error('Invalid GameState provided to GM.');
    }

    const sanitizedMessage = typeof userMessage === 'string'
      ? userMessage.slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      : '';

    const lang = language === 'en' ? 'en' : 'de';
    const systemInstruction = buildSystemPrompt(gameState, lang) + '\n\n' + getResponseFormat(lang);

    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: 'user', content: sanitizedMessage });

    const text = await callLLM(systemInstruction, messages.slice(-14));
    const parsed = parseGMResponse(text);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('GM Error:', error);
    return NextResponse.json(
      { error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.' },
      { status: 500 }
    );
  }
}
