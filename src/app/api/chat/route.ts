import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, RESPONSE_FORMAT } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const maxDuration = 60; // Vercel Hobby allows up to 60s

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Raw message request (e.g. from Story Generator)
    if (body.messages) {
      const systemMsg = body.messages.find((m: any) => m.role === 'system');
      const userMsg = body.messages.find((m: any) => m.role === 'user');

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemMsg?.content || '',
        messages: [{ role: 'user', content: userMsg?.content || '' }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      // Strip markdown code fences if present
      const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      try {
        return NextResponse.json(JSON.parse(clean));
      } catch {
        return NextResponse.json({ narrative: 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.', options: [{ id: 'A', text: 'Erneut versuchen' }] });
      }
    }

    const { gameState, userMessage, history } = body;

    // 2. Regular Game State request
    if (!gameState || !gameState.character) {
      throw new Error('Invalid GameState provided to GM.');
    }

    // Build system prompt
    const systemInstruction = buildSystemPrompt(gameState) + '\n\n' + RESPONSE_FORMAT;

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
      max_tokens: 1024,
      system: systemInstruction,
      messages: messages.slice(-20),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    try {
      return NextResponse.json(JSON.parse(clean));
    } catch {
      return NextResponse.json({ narrative: 'Der GM antwortet nicht wie erwartet. Bitte versuche es erneut.', options: [{ id: 'A', text: 'Erneut versuchen' }] });
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
