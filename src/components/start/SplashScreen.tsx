'use client';

import React, { useEffect, useState, useRef } from 'react';
import HolocronOrb from '@/components/ui/HolocronOrb';
import { t } from '@/lib/i18n';
import { startSoundtrack, getSpeechSettings } from '@/lib/speech';

interface SplashScreenProps {
  onComplete: () => void;
}

const LOADING_TEXTS = [
  'Scanning galactic archives...',
  'Initializing holocron database...',
  'Calibrating force sensitivity...',
  'Decrypting Jedi records...',
  'Mapping hyperspace routes...',
  'Synchronizing with the Force...',
];

// Deterministic starfield
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 7919) % 100),
  y: ((i * 6271) % 100),
  size: (i % 3) + 1,
  opacity: 0.08 + (i % 6) * 0.04,
  twinkleDelay: (i * 0.3) % 3,
}));

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const skippedRef = useRef(false);

  // Phase progression
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => {
        if (!skippedRef.current) {
          setFadeOut(true);
          fadeTimer = setTimeout(() => onCompleteRef.current(), 800);
        }
      }, 6000),
    ];
    return () => { timers.forEach(clearTimeout); clearTimeout(fadeTimer); };
  }, []);

  // Cycle loading texts
  useEffect(() => {
    if (phase < 3) return;
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING_TEXTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  // Start soundtrack on first user interaction (iOS requires gesture)
  const musicStarted = useRef(false);
  const tryStartMusic = () => {
    if (!musicStarted.current) {
      musicStarted.current = true;
      startSoundtrack();
    }
  };

  // Also try on first phase change (auto-play on desktop)
  useEffect(() => {
    if (phase >= 1 && !musicStarted.current) {
      musicStarted.current = true;
      startSoundtrack();
    }
  }, [phase]);

  const handleSkip = () => {
    if (!skippedRef.current) {
      skippedRef.current = true;
      tryStartMusic(); // ensure music starts even on skip
      setFadeOut(true);
      setTimeout(() => onCompleteRef.current(), 400);
    }
  };

  return (
    <div
      onTouchStart={tryStartMusic}
      onMouseDown={tryStartMusic}
      onClick={handleSkip}
      className={`fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Starfield */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${2 + star.twinkleDelay}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}

      {/* Holocron Orb */}
      <div className={`transition-all duration-1000 ease-out ${
        phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}>
        <HolocronOrb size={220} />
      </div>

      {/* Title: QUANTUM */}
      <h1 className={`mt-8 text-6xl sm:text-7xl font-black italic tracking-tighter text-white transition-all duration-700 ease-out ${
        phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {t('splashTitle')}
      </h1>

      {/* Subtitle line */}
      <div className={`mt-3 flex items-center gap-3 transition-all duration-500 ease-out ${
        phase >= 2 ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="h-[1px] w-10 bg-amber-500/50" />
        <span className="text-amber-500 text-[10px] tracking-[0.5em] font-black uppercase">
          {t('splashSubtitle')}
        </span>
        <div className="h-[1px] w-10 bg-amber-500/50" />
      </div>

      {/* Cycling loading text */}
      <div className={`mt-10 h-6 transition-opacity duration-500 ${
        phase >= 3 ? 'opacity-100' : 'opacity-0'
      }`}>
        <p key={textIndex} className="text-[11px] text-zinc-500 tracking-widest uppercase font-mono animate-in fade-in duration-500">
          {LOADING_TEXTS[textIndex]}
        </p>
      </div>

      {/* Skip hint */}
      <div className={`absolute bottom-8 text-zinc-700 text-[9px] uppercase tracking-widest transition-opacity duration-500 ${
        phase >= 1 ? 'opacity-100' : 'opacity-0'
      }`}>
        [ {t('crawlSkip')} ]
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: inherit; }
          50% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
