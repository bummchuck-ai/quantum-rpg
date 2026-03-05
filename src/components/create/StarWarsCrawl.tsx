'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StarWarsCrawlProps {
  onComplete: () => void;
}

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onComplete }) => {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(60000);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(onComplete, remainingRef.current);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onComplete]);

  const togglePause = () => {
    if (paused) {
      // Resume
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(onComplete, remainingRef.current);
    } else {
      // Pause
      if (timerRef.current) clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    setPaused(!paused);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] overflow-hidden flex items-center justify-center font-sans">
      {/* Stars Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-50"></div>

      <div className="relative w-full h-full perspective-3d">
        <div className={`crawl-container ${paused ? 'paused' : ''}`}>
          <div className="crawl-content text-amber-400 font-bold text-justify tracking-widest leading-loose">
            <h1 className="text-center text-5xl mb-12 uppercase">Quantum Chronicles</h1>
            <p className="mb-8">
              181 Jahre nach der Schlacht von Yavin. Der Krieg tobt seit vier Jahren. DARTH PLAGUEIS II. und seine LETZTE ORDNUNG haben die Thronwelt Bastion erobert und Kaiserin MARASIAH FEL ermordet. CADE SKYWALKER — der letzte seines Namens — ist gefallen.
            </p>
            <p className="mb-8">
              Doch die Galaxis wehrt sich. DJANGO FETT, einst ein Niemand auf der Flucht vor einem Hutten, hat sich zum MANDALORE erhoben. Auf dem Thron seiner Vorfahren vereint er sein Volk. Seine SONS OF CORRUPTION — vom Verbrecherkonsortium zu Helden des Lichts gewandelt — kämpfen an der Seite des Triumvirats.
            </p>
            <p className="mb-8">
              Auf TATOOINE widersteht die Bevölkerung. CAP HORN führt eine Bürgermiliz zur Befreiung ganzer Städte. ROISTO VIIS rettet den Planeten vor einer Zombie-Plage. Im JOKER SQUAD kämpfen Jedi-Meister KAAN TUUR und HOCI gegen die Übermacht.
            </p>
            <p className="mb-8">
              Auf DATHOMIR jagt ein uralter Kult den Dämonen BEELZEBUB. Auf dem mittelalterlichen Planeten WEIK suchen Mandalorianer nach dem legendären BESKAR-HORT. Auf DORUMAA birgt ein verschollenes Forschungsschiff dunkle Geheimnisse.
            </p>
            <p className="mb-8">
              Die Galaxis braucht neue Helden. Wirst du für das Licht kämpfen — oder der Dunkelheit verfallen? Dein Schicksal beginnt jetzt...
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-between items-center px-10 z-10">
        <button
          onClick={togglePause}
          className="text-zinc-500 hover:text-amber-500 text-[10px] uppercase tracking-widest transition-colors border border-zinc-800 hover:border-amber-500/50 px-4 py-2 rounded-lg"
        >
          {paused ? '[ Fortsetzen ]' : '[ Pause ]'}
        </button>
        <button
          onClick={handleSkip}
          className="text-zinc-600 hover:text-amber-500 text-[10px] uppercase tracking-widest transition-colors animate-pulse hover:animate-none"
        >
          [ Überspringen ]
        </button>
      </div>

      <style jsx>{`
        .perspective-3d {
          perspective: 300px;
        }
        .crawl-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          transform-origin: 50% 100%;
          animation: crawl 60s linear forwards;
        }
        .crawl-container.paused {
          animation-play-state: paused;
        }
        .crawl-content {
          width: 80%;
          max-width: 600px;
          transform: rotateX(25deg);
        }
        @keyframes crawl {
          0% {
            top: 100%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: -150%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default StarWarsCrawl;
