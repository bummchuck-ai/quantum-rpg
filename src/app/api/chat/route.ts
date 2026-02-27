import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, RESPONSE_FORMAT } from '../../../lib/gm/system-prompt';
import { NextResponse } from 'next/server';

// Initialisiere Gemini (API Key muss in .env.local stehen: GOOGLE_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { gameState, userMessage } = await req.json();

    // Validierung des gameState, um "Cannot read properties of undefined (reading 'name')" zu verhindern
    if (!gameState || !gameState.character) {
        throw new Error("Invalid GameState provided to GM.");
    }

    // 1. System Prompt bauen
    const systemInstruction = buildSystemPrompt(gameState) + "\n\n" + RESPONSE_FORMAT;

    // 2. Modell wählen (gemini-2.0-flash ist extrem schnell und stabil)
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
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
