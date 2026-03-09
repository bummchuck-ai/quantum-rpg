'use client';

import React, { useEffect, useState, useRef } from 'react';
import { playCrawlDrone } from '@/lib/sounds';

interface StarWarsCrawlProps {
  onComplete: () => void;
}

// Generate fixed star positions (deterministic, no random flicker on re-render)
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: ((i * 7919) % 100),        // pseudo-random x
  y: ((i * 6271) % 100),        // pseudo-random y
  size: (i % 3) + 1,            // 1-3px
  opacity: 0.3 + (i % 7) * 0.1, // 0.3-0.9
  delay: (i % 5) * 0.8,         // twinkle delay
}));

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onComplete }) => {
  const [paused, setPaused] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(55000);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    playCrawlDrone();

    // Show "A long time ago..." then fade to crawl
    titleTimerRef.current = setTimeout(() => {
      setShowTitle(false);
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(onComplete, remainingRef.current);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, [onComplete]);

  const togglePause = () => {
    if (showTitle) return;
    if (paused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(onComplete, remainingRef.current);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    setPaused(!paused);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] overflow-hidden font-sans select-none">

      {/* CSS Starfield */}
      <div className="absolute inset-0">
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
              animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* "A long time ago..." title card */}
      {showTitle && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-in fade-in duration-1000">
          <div className="text-center space-y-2">
            <p className="text-[#4BD5EE] text-lg font-sans italic tracking-wide">
              Vor langer Zeit, in einer weit, weit
            </p>
            <p className="text-[#4BD5EE] text-lg font-sans italic tracking-wide">
              entfernten Galaxis...
            </p>
          </div>
        </div>
      )}

      {/* Crawl */}
      {!showTitle && (
        <div className="absolute inset-0 flex items-end justify-center perspective-3d">
          <div className={`crawl-container ${paused ? 'paused' : ''}`}>
            <div className="crawl-content text-[#FFE81F] font-bold text-justify leading-[1.8] tracking-wide">

              <h1 className="text-center text-[clamp(2rem,8vw,4rem)] mb-8 font-black tracking-tight leading-none">
                QUANTUM<br />CHRONICLES
              </h1>

              <p className="mb-6 text-[clamp(0.85rem,2.5vw,1.1rem)]">
                181 Jahre nach der Schlacht von Yavin. Der Krieg tobt seit vier Jahren. DARTH PLAGUEIS II. und seine LETZTE ORDNUNG haben die Thronwelt Bastion erobert und Kaiserin MARASIAH FEL ermordet. CADE SKYWALKER — der letzte seines Namens — ist gefallen.
              </p>

              <p className="mb-6 text-[clamp(0.85rem,2.5vw,1.1rem)]">
                Doch die Galaxis wehrt sich. DJANGO FETT, einst ein Niemand auf der Flucht vor einem Hutten, hat sich zum MANDALORE erhoben. Seine SONS OF CORRUPTION — vom Verbrecherkonsortium zu Helden des Lichts gewandelt — kämpfen an der Seite des Triumvirats.
              </p>

              <p className="mb-6 text-[clamp(0.85rem,2.5vw,1.1rem)]">
                Auf TATOOINE widersteht die Bevölkerung. CAP HORN führt eine Bürgermiliz zur Befreiung ganzer Städte. ROISTO VIIS rettet den Planeten vor einer Zombie-Plage. Im JOKER SQUAD kämpfen Jedi-Meister KAAN TUUR und HOCI gegen die Übermacht.
              </p>

              <p className="mb-6 text-[clamp(0.85rem,2.5vw,1.1rem)]">
                Auf DATHOMIR jagt ein uralter Kult den Dämonen BEELZEBUB. Auf WEIK suchen Mandalorianer nach dem legendären BESKAR-HORT. Auf DORUMAA birgt ein verschollenes Forschungsschiff dunkle Geheimnisse.
              </p>

              <p className="mb-6 text-[clamp(0.85rem,2.5vw,1.1rem)]">
                Die Galaxis braucht neue Helden. Wirst du für das Licht kämpfen — oder der Dunkelheit verfallen? Dein Schicksal beginnt jetzt...
              </p>

            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-8 z-30">
        <button
          onClick={togglePause}
          className="text-zinc-500 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors border border-zinc-800 hover:border-amber-500/50 px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          {paused ? '[ Fortsetzen ]' : '[ Pause ]'}
        </button>
        <button
          onClick={handleSkip}
          className="text-zinc-600 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors"
        >
          [ Überspringen ]
        </button>
      </div>

      <style jsx>{`
        .perspective-3d {
          perspective: 400px;
          overflow: hidden;
        }
        .crawl-container {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 700px;
          transform-origin: 50% 100%;
          animation: crawl 55s linear forwards;
        }
        .crawl-container.paused {
          animation-play-state: paused;
        }
        .crawl-content {
          transform: rotateX(20deg);
          transform-origin: 50% 100%;
        }
        @keyframes crawl {
          0% {
            bottom: -10%;
          }
          100% {
            bottom: 250%;
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StarWarsCrawl;
