import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, getResponseFormat } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';

// In-memory rate limiter with automatic cleanup
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per window (tighter for cost control)
const RATE_WINDOW = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Periodic cleanup: remove expired entries every 5 minutes to prevent memory leak
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

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey: apiKey || '' });

export const maxDuration = 60; // Vercel Hobby allows up to 60s

export async function POST(req: Request) {
  // Origin check — only allow requests from same origin
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

    // 1. Raw message request (e.g. from Story Generator, IntroCrawl)
    if (body.messages) {
      const systemMsg = body.messages.find((m: { role: string; content: string }) => m.role === 'system');
      const userMsg = body.messages.find((m: { role: string; content: string }) => m.role === 'user');

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemMsg?.content || '',
        messages: [{ role: 'user', content: userMsg?.content || '' }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      // If caller requested raw text (e.g. IntroCrawl), return it directly
      if (body.rawText) {
        return NextResponse.json({ rawText: text.trim() });
      }

      // Strip markdown code fences if present
      const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      try {
        return NextResponse.json(JSON.parse(clean));
      } catch {
        return NextResponse.json({ narrative: 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.', options: [{ id: 'A', text: 'Erneut versuchen' }] });
      }
    }

    const { gameState, userMessage, history, language } = body;

    // 2. Regular Game State request
    if (!gameState || !gameState.character) {
      throw new Error('Invalid GameState provided to GM.');
    }

    // Sanitize user input: limit length, strip control characters
    const sanitizedMessage = typeof userMessage === 'string'
      ? userMessage.slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      : '';

    // Build system prompt (language-aware)
    const lang = language === 'en' ? 'en' : 'de';
    const systemInstruction = buildSystemPrompt(gameState, lang) + '\n\n' + getResponseFormat(lang);

    // Build conversation history for multi-turn
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: 'user', content: sanitizedMessage });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemInstruction,
      messages: messages.slice(-20),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip markdown fences, handle various formats
    let clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    // Try direct parse first, then balanced-brace extraction (safer than greedy regex)
    try {
      return NextResponse.json(JSON.parse(clean));
    } catch {
      const start = clean.indexOf('{');
      if (start !== -1) {
        let depth = 0;
        for (let i = start; i < clean.length; i++) {
          if (clean[i] === '{') depth++;
          else if (clean[i] === '}') depth--;
          if (depth === 0) {
            try { return NextResponse.json(JSON.parse(clean.slice(start, i + 1))); }
            catch { break; }
          }
        }
      }
      // All parsing failed — wrap raw text as narrative
      return NextResponse.json({
        narrative: text || 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.',
        options: [{ id: 'A', text: 'Erneut versuchen' }],
        stateChanges: {},
        mood: 'mysterious',
      });
    }

  } catch (error) {
    console.error('GM Error:', error);
    return NextResponse.json(
      { error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.' },
      { status: 500 }
    );
  }
}
