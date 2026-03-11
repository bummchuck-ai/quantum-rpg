'use client';

import React, { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

interface SplashScreenProps {
  onComplete: () => void;
}

// Deterministic starfield
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 7919) % 100),
  y: ((i * 6271) % 100),
  size: (i % 3) + 1,
  opacity: 0.1 + (i % 6) * 0.06,
  twinkleDelay: (i * 0.3) % 3,
}));

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=title, 2=subtitle, 3=ship, 4=fadeout

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),        // Title fades in
      setTimeout(() => setPhase(2), 1500),        // Subtitle appears
      setTimeout(() => setPhase(3), 2500),        // Ship flies across
      setTimeout(() => setPhase(4), 3500),        // Everything fades out
      setTimeout(() => onComplete(), 4200),       // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-700 ${
        phase >= 4 ? 'opacity-0' : 'opacity-100'
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

      {/* Title: QUANTUM */}
      <h1
        className={`text-7xl sm:text-8xl font-black italic tracking-tighter text-white transition-all duration-1000 ease-out ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {t('splashTitle')}
      </h1>

      {/* Subtitle: CHRONICLES */}
      <div
        className={`mt-4 flex items-center gap-3 transition-all duration-800 ease-out ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="h-[1px] w-10 bg-amber-500/50" />
        <span className="text-amber-500 text-[11px] tracking-[0.5em] font-black uppercase">
          {t('splashSubtitle')}
        </span>
        <div className="h-[1px] w-10 bg-amber-500/50" />
      </div>

      {/* Spaceship flyby */}
      <div
        className={`absolute top-[40%] transition-none ${
          phase >= 3 ? 'animate-shipFly' : 'opacity-0'
        }`}
      >
        {/* Ship body */}
        <div className="relative">
          <div className="w-8 h-2 bg-zinc-400 rounded-r-full rounded-l-sm shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
          {/* Engine glow trail */}
          <div className="absolute top-0 right-full w-20 h-2 bg-gradient-to-l from-amber-500/80 via-amber-500/20 to-transparent rounded-l-full" />
          <div className="absolute -top-1 right-full w-32 h-4 bg-gradient-to-l from-amber-400/30 via-amber-400/5 to-transparent rounded-l-full blur-sm" />
        </div>
      </div>

      {/* Skip hint */}
      <div className={`absolute bottom-8 text-zinc-700 text-[9px] uppercase tracking-widest transition-opacity duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        [ Tap to skip ]
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: inherit; }
          50% { opacity: 0.02; }
        }
        @keyframes shipFly {
          0% { transform: translateX(-100vw); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        .animate-shipFly {
          animation: shipFly 1.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
