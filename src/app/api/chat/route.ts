import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, RESPONSE_FORMAT } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';

// Initialisiere Gemini (API Key muss in .env.local stehen: GOOGLE_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Check if it's a raw message request (e.g. from Story Generator)
    if (body.messages) {
      const systemMsg = body.messages.find((m: any) => m.role === 'system');
      const userMsg = body.messages.find((m: any) => m.role === 'user');

      const model = genAI.getGenerativeModel({ 
          model: 'gemini-3-flash-preview',
          systemInstruction: systemMsg?.content || '',
          generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(userMsg?.content || '');
      const response = await result.response;
      return NextResponse.json(JSON.parse(response.text()));
    }

    const { gameState, userMessage } = body;

    // 2. Regular Game State request
    if (!gameState || !gameState.character) {
        throw new Error("Invalid GameState provided to GM.");
    }

    // 1. System Prompt bauen
    const systemInstruction = buildSystemPrompt(gameState) + "\n\n" + RESPONSE_FORMAT;

    // 2. Modell wählen (gemini-3-flash-preview ist extrem schnell und stabil)
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        systemInstruction: systemInstruction,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
        }
    });

    // 3. GM Antwort generieren
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    // 4. Antwort zurückgeben
    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error('GM Error:', error);
    return NextResponse.json(
      { 
        error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
