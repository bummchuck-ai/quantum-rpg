'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  checkTTSSupport,
  checkSTTSupport,
  getSpeechSettings,
  setTTSEnabled as persistTTSEnabled,
  setSTTEnabled as persistSTTEnabled,
  speakNarrative,
  stopSpeaking as stopTTS,
  createRecognition,
  warmUpTTS,
  testSpeak,
} from '@/lib/speech';

export interface UseSpeechReturn {
  // TTS
  ttsSupported: boolean;
  ttsEnabled: boolean;
  isSpeaking: boolean;
  speakText: (text: string, lang?: string) => void;
  stopSpeaking: () => void;
  setTTSEnabled: (v: boolean) => void;
  testTTS: (lang?: string) => void;

  // STT
  sttSupported: boolean;
  sttEnabled: boolean;
  isListening: boolean;
  transcript: string;
  startListening: (lang?: string) => void;
  stopListening: () => void;
  clearTranscript: () => void;
  setSTTEnabled: (v: boolean) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [ttsSupported, setTTSSupported] = useState(false);
  const [sttSupported, setSTTSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [sttEnabled, setSttEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Initialize on mount
  useEffect(() => {
    setTTSSupported(checkTTSSupport());
    setSTTSupported(checkSTTSupport());
    const settings = getSpeechSettings();
    setTtsEnabled(settings.ttsEnabled);
    setSttEnabled(settings.sttEnabled);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTTS();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  const speakText = useCallback((text: string, lang: string = 'de-DE') => {
    if (!ttsEnabled || !ttsSupported) return;
    speakNarrative(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [ttsEnabled, ttsSupported]);

  const stopSpeaking = useCallback(() => {
    stopTTS();
    setIsSpeaking(false);
  }, []);

  const setTTSEnabled = useCallback((v: boolean) => {
    setTtsEnabled(v);
    persistTTSEnabled(v);
    if (v) {
      warmUpTTS(); // iOS: unlock speechSynthesis on user gesture
    } else {
      stopTTS();
    }
  }, []);

  const startListening = useCallback((lang: string = 'de-DE') => {
    if (!sttEnabled || !sttSupported) return;

    // Stop any TTS first
    stopTTS();
    setIsSpeaking(false);
    setTranscript('');

    // Abort any existing recognition before creating new one
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const recognition = createRecognition(lang, {
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
        }
      },
      onError: (error) => {
        // 'no-speech' and 'aborted' are normal on iOS — don't warn
        if (error !== 'no-speech' && error !== 'aborted') {
          console.warn('STT error:', error);
        }
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.warn('STT start failed:', e);
        setIsListening(false);
      }
    }
  }, [sttEnabled, sttSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const setSTTEnabled = useCallback((v: boolean) => {
    setSttEnabled(v);
    persistSTTEnabled(v);
    if (!v && recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      setIsListening(false);
    }
  }, []);

  const testTTS = useCallback((lang: string = 'de-DE') => {
    warmUpTTS();
    // Small delay to let warmup complete
    setTimeout(() => testSpeak(lang), 300);
  }, []);

  return {
    ttsSupported,
    ttsEnabled,
    isSpeaking,
    speakText,
    testTTS,
    stopSpeaking,
    setTTSEnabled,
    sttSupported,
    sttEnabled,
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    setSTTEnabled,
  };
}
