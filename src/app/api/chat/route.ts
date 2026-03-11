import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, getResponseFormat } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const maxDuration = 60; // Vercel Hobby allows up to 60s

export async function POST(req: Request) {
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
    messages.push({ role: 'user', content: userMessage });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemInstruction,
      messages: messages.slice(-20),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip markdown fences, handle various formats
    let clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    // Try to extract JSON if wrapped in other text
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      clean = jsonMatch[0];
    }

    try {
      return NextResponse.json(JSON.parse(clean));
    } catch {
      // If JSON parsing fails, wrap the raw text as narrative
      return NextResponse.json({
        narrative: text || 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.',
        options: [{ id: 'A', text: 'Erneut versuchen' }],
        stateChanges: {},
        mood: 'mysterious',
      });
    }

  } catch (error: any) {
    console.error('GM Error:', error);
    return NextResponse.json(
      {
        error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
