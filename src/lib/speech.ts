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
}

function loadSpeechSettings(): SpeechSettings {
  if (typeof window === 'undefined') return { ttsEnabled: false, sttEnabled: false, ttsRate: 1.0, ttsPitch: 1.0 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        ttsEnabled: s.ttsEnabled ?? false,
        sttEnabled: s.sttEnabled ?? false,
        ttsRate: s.ttsRate ?? 1.0,
        ttsPitch: s.ttsPitch ?? 1.0,
      };
    }
  } catch { /* use defaults */ }
  return { ttsEnabled: false, sttEnabled: false, ttsRate: 1.0, ttsPitch: 1.0 };
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

// ============================================================
// TTS — Text-to-Speech
// ============================================================

let currentUtterance: SpeechSynthesisUtterance | null = null;
let voicesLoaded = false;

function ensureVoicesLoaded(): void {
  if (voicesLoaded || typeof window === 'undefined' || !checkTTSSupport()) return;
  // Trigger voice loading — some browsers need this
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => {
    voicesLoaded = true;
  });
}

export function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  if (!checkTTSSupport()) return null;
  ensureVoicesLoaded();
  const voices = speechSynthesis.getVoices();
  // Exact match first (e.g., 'de-DE')
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // Prefix match (e.g., 'de')
  const prefix = lang.split('-')[0];
  const partial = voices.find(v => v.lang.startsWith(prefix));
  if (partial) return partial;
  // Any voice as last resort
  return voices[0] || null;
}

export function speakNarrative(
  text: string,
  lang: string = 'de-DE',
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (!checkTTSSupport()) return;

  // Cancel any ongoing speech
  stopSpeaking();

  const settings = loadSpeechSettings();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = settings.ttsRate;
  utterance.pitch = settings.ttsPitch;

  const voice = getVoiceForLang(lang);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!checkTTSSupport()) return;
  speechSynthesis.cancel();
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
