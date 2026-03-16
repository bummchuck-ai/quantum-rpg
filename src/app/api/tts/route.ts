import { NextResponse } from 'next/server';

const TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export async function POST(req: Request) {
  if (!TTS_API_KEY) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 500 });
  }

  try {
    const { text, voice, lang } = await req.json();

    if (!text || text.length > 5000) {
      return NextResponse.json({ error: 'Text required (max 5000 chars)' }, { status: 400 });
    }

    const voiceName = voice || (lang === 'en' ? 'en-US-Neural2-D' : 'de-DE-Neural2-H');
    const languageCode = voiceName.substring(0, 5); // e.g., "de-DE" from "de-DE-Neural2-H"

    const response = await fetch(TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': TTS_API_KEY,
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('TTS API error:', err);
      return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
    }

    const data = await response.json();

    // Return base64 audio
    return NextResponse.json({
      audioContent: data.audioContent,
      format: 'mp3',
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'TTS error' }, { status: 500 });
  }
}
