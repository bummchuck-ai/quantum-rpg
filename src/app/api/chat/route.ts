import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, RESPONSE_FORMAT } from '@/lib/gm/system-prompt';
import { NextResponse } from 'next/server';

// Initialisiere Gemini (API Key muss in .env.local stehen: GOOGLE_API_KEY)
// Für den Anfang nutzen wir den Key aus der Umgebung oder Hardcoded (nur lokal!)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { gameState, userMessage } = await req.json();

    // 1. System Prompt bauen (Der "Geist" des GMs)
    const systemInstruction = buildSystemPrompt(gameState) + "\n\n" + RESPONSE_FORMAT;

    // 2. Modell wählen (Gemini 1.5 Pro ist ideal für RPGs)
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro-latest',
        systemInstruction: systemInstruction,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    // 3. Chat starten (mit Historie, falls vorhanden)
    // Wir senden hier vereinfacht immer den aktuellen State als Context
    // und die letzte User-Nachricht als Prompt.
    
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    // 4. Antwort zurückgeben
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error('GM Error:', error);
    return NextResponse.json(
      { error: 'Der Game Master ist kurz eingenickt. (API Error)' },
      { status: 500 }
    );
  }
}
