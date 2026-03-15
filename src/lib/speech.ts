// ============================================================
// QUANTUM RPG — Speech Engine (Web Speech API)
// ============================================================
// TTS: SpeechSynthesis for GM narration
// STT: SpeechRecognition for player voice input
// ============================================================

const SETTINGS_KEY = 'quantum-rpg-settings';

// ============================================================
// BROWSER SUPPORT DETECTION
// ============================================================

export function checkTTSSupport(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function checkSTTSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// ============================================================
// SETTINGS PERSISTENCE
// ============================================================

interface SpeechSettings {
  ttsEnabled: boolean;
  sttEnabled: boolean;
  ttsRate: number;
  ttsPitch: number;
  ttsVoiceName: string | null;
}

function loadSpeechSettings(): SpeechSettings {
  if (typeof window === 'undefined') return { ttsEnabled: false, sttEnabled: false, ttsRate: 1.0, ttsPitch: 1.0, ttsVoiceName: null };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        ttsEnabled: s.ttsEnabled ?? false,
        sttEnabled: s.sttEnabled ?? false,
        ttsRate: s.ttsRate ?? 1.0,
        ttsPitch: s.ttsPitch ?? 1.0,
        ttsVoiceName: s.ttsVoiceName ?? null,
      };
    }
  } catch { /* use defaults */ }
  return { ttsEnabled: false, sttEnabled: false, ttsRate: 1.0, ttsPitch: 1.0, ttsVoiceName: null };
}

function saveSpeechSettings(settings: Partial<SpeechSettings>) {
  if (typeof window === 'undefined') return;
  try {
    // Merge with existing settings to not overwrite sound settings
    const raw = localStorage.getItem(SETTINGS_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...existing, ...settings }));
  } catch { /* storage full */ }
}

export function getSpeechSettings(): SpeechSettings {
  return loadSpeechSettings();
}

export function setTTSEnabled(enabled: boolean) {
  saveSpeechSettings({ ttsEnabled: enabled });
}

export function setSTTEnabled(enabled: boolean) {
  saveSpeechSettings({ sttEnabled: enabled });
}

export function setTTSVoiceName(name: string | null) {
  saveSpeechSettings({ ttsVoiceName: name });
}

// Google Cloud TTS voice options
const CLOUD_VOICES_DE = [
  { name: 'de-DE-Neural2-H', label: 'Neural2 Mann (empfohlen)' },
  { name: 'de-DE-Neural2-G', label: 'Neural2 Frau' },
  { name: 'de-DE-Wavenet-H', label: 'WaveNet Mann' },
  { name: 'de-DE-Wavenet-G', label: 'WaveNet Frau' },
  { name: 'de-DE-Studio-B', label: 'Studio Mann (Premium)' },
  { name: 'de-DE-Studio-C', label: 'Studio Frau (Premium)' },
  { name: 'de-DE-Chirp-HD-D', label: 'Chirp HD Mann' },
  { name: 'de-DE-Chirp-HD-F', label: 'Chirp HD Frau' },
];

const CLOUD_VOICES_EN = [
  { name: 'en-US-Neural2-D', label: 'Neural2 Male (recommended)' },
  { name: 'en-US-Neural2-C', label: 'Neural2 Female' },
  { name: 'en-US-Wavenet-D', label: 'WaveNet Male' },
  { name: 'en-US-Wavenet-C', label: 'WaveNet Female' },
  { name: 'en-US-Studio-M', label: 'Studio Male (Premium)' },
  { name: 'en-US-Studio-O', label: 'Studio Female (Premium)' },
];

/** Get all available voices for a language prefix (e.g., 'de' or 'en') */
export function getVoicesForLang(lang: string): { name: string; label: string }[] {
  // Cloud voices first (better quality)
  const cloudVoices = lang === 'en' ? CLOUD_VOICES_EN : CLOUD_VOICES_DE;

  // Browser voices as additional options
  const browserVoices: { name: string; label: string }[] = [];
  if (checkTTSSupport()) {
    ensureVoicesLoaded();
    const voices = speechSynthesis.getVoices();
    const prefix = lang.split('-')[0];
    voices
      .filter(v => v.lang.startsWith(prefix))
      .forEach(v => {
        browserVoices.push({
          name: `browser:${v.name}`,
          label: `${v.name} (Browser)`,
        });
      });
  }

  return [...cloudVoices, ...browserVoices];
}

// ============================================================
// TTS — Text-to-Speech
// ============================================================

let currentUtterance: SpeechSynthesisUtterance | null = null;
let voicesLoaded = false;

function ensureVoicesLoaded(): void {
  if (voicesLoaded || typeof window === 'undefined' || !checkTTSSupport()) return;
  // Trigger voice loading — some browsers need this
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
    return;
  }
  speechSynthesis.addEventListener('voiceschanged', () => {
    voicesLoaded = true;
  });
}

// iOS Safari requires a user gesture to unlock speechSynthesis.
// This speaks an actual word (silently) to fully unlock the audio session.
let ttsUnlocked = false;
export function warmUpTTS(): void {
  if (!checkTTSSupport() || ttsUnlocked) return;
  const utterance = new SpeechSynthesisUtterance('.');
  utterance.volume = 0.01; // near-silent but not zero (iOS ignores volume=0)
  utterance.rate = 10; // fastest possible
  utterance.onend = () => { ttsUnlocked = true; };
  utterance.onerror = () => { ttsUnlocked = true; }; // still mark as unlocked
  speechSynthesis.speak(utterance);
  ensureVoicesLoaded();
}

// Test TTS: speak a short phrase audibly
export function testSpeak(lang: string = 'de-DE'): void {
  const text = lang.startsWith('de') ? 'Game Master aktiv.' : 'Game Master active.';
  speakNarrative(text, lang);
}

export function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  if (!checkTTSSupport()) return null;
  ensureVoicesLoaded();
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. User-selected voice (saved in settings)
  const settings = loadSpeechSettings();
  if (settings.ttsVoiceName) {
    const saved = voices.find(v => v.name === settings.ttsVoiceName);
    if (saved) return saved;
  }

  const prefix = lang.split('-')[0];
  // 2. Premium/enhanced voices
  const premium = voices.find(v => v.lang.startsWith(prefix) && (v.name.includes('enhanced') || v.name.includes('Premium') || v.localService === false));
  if (premium) return premium;
  // 3. Exact match
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // 4. Prefix match
  const partial = voices.find(v => v.lang.startsWith(prefix));
  if (partial) return partial;
  return voices[0] || null;
}

// iOS Safari workaround: speechSynthesis stops after ~15s.
// Split long text into chunks and speak sequentially.
function splitIntoChunks(text: string, maxLen: number = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Google Cloud TTS — server-side, high quality
let cloudTTSAvailable = true; // assume available, disable on first failure

async function speakWithCloudTTS(
  text: string,
  lang: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  try {
    const settings = loadSpeechSettings();
    // If user selected a browser voice, skip cloud TTS
    if (settings.ttsVoiceName?.startsWith('browser:')) return false;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        voice: settings.ttsVoiceName || undefined,
        lang: lang.startsWith('en') ? 'en' : 'de',
      }),
    });

    if (!response.ok) {
      cloudTTSAvailable = false;
      return false;
    }

    const data = await response.json();
    if (!data.audioContent) return false;

    // Play base64 audio
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.onplay = () => onStart?.();
    audio.onended = () => { currentAudio = null; onEnd?.(); };
    audio.onerror = () => { currentAudio = null; onEnd?.(); };
    currentAudio = audio;
    await audio.play();
    return true;
  } catch {
    cloudTTSAvailable = false;
    return false;
  }
}

let currentAudio: HTMLAudioElement | null = null;

export function speakNarrative(
  text: string,
  lang: string = 'de-DE',
  onStart?: () => void,
  onEnd?: () => void
): void {

  // Cancel any ongoing speech
  stopSpeaking();

  // Try Google Cloud TTS first (better quality, works on iOS)
  if (cloudTTSAvailable) {
    speakWithCloudTTS(text, lang, onStart, onEnd).then(ok => {
      if (!ok) {
        // Fallback to Web Speech API
        speakWithWebSpeech(text, lang, onStart, onEnd);
      }
    });
    return;
  }

  // Fallback: Web Speech API
  speakWithWebSpeech(text, lang, onStart, onEnd);
}

function speakWithWebSpeech(
  text: string,
  lang: string,
  onStart?: () => void,
  onEnd?: () => void
): void {

  const settings = loadSpeechSettings();
  const voice = getVoiceForLang(lang);

  // Split into chunks for iOS compatibility (prevents 15s cutoff)
  const chunks = splitIntoChunks(text);
  let chunkIndex = 0;
  let started = false;

  const speakNext = () => {
    if (chunkIndex >= chunks.length) {
      currentUtterance = null;
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
    utterance.lang = lang;
    utterance.rate = settings.ttsRate;
    utterance.pitch = settings.ttsPitch;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (!started) { started = true; onStart?.(); }
    };
    utterance.onend = () => {
      chunkIndex++;
      speakNext();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      onEnd?.();
    };

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  };

  speakNext();
}

export function stopSpeaking(): void {
  // Stop Cloud TTS audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  // Stop Web Speech API
  if (checkTTSSupport()) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (!checkTTSSupport()) return false;
  return speechSynthesis.speaking;
}

// ============================================================
// STT — Speech-to-Text
// ============================================================

interface RecognitionCallbacks {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

export function createRecognition(
  lang: string = 'de-DE',
  callbacks: RecognitionCallbacks
): SpeechRecognitionInstance | null {
  if (!checkSTTSupport()) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: { results: { transcript: string; isFinal: boolean }[][] }) => {
    let transcript = '';
    let isFinal = false;
    for (let i = 0; i < event.results.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (event.results as any)[i];
      transcript += result[0].transcript;
      if (result.isFinal) isFinal = true;
    }
    callbacks.onResult(transcript, isFinal);
  };

  recognition.onerror = (event: { error: string }) => {
    callbacks.onError(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return recognition;
}
