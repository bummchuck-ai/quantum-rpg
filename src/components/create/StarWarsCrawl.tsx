'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StarWarsCrawlProps {
  onComplete: () => void;
}

// Subtle starfield — 30 small, quiet stars
const STARS = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 7919) % 100),
  y: ((i * 6271) % 100),
  size: (i % 2) + 1,
  opacity: 0.15 + (i % 5) * 0.08,
}));

const CARDS = [
  {
    type: 'title' as const,
    heading: 'QUANTUM CHRONICLES',
    subtext: 'Ein Star Wars Rollenspiel',
  },
  {
    type: 'lore' as const,
    heading: 'DIE GALAXIS BRENNT',
    body: '181 ABY. Darth Plagueis II. und seine Letzte Ordnung haben die Thronwelt erobert. Cade Skywalker ist gefallen. Doch auf hundert Welten formiert sich der Widerstand — von Mandalore bis Tatooine.',
  },
  {
    type: 'lore' as const,
    heading: 'HELDEN ERHEBEN SICH',
    body: 'Django Fett hat sich zum Mandalore erhoben. Auf Tatooine kämpfen Bürgermilizen gegen die Besatzung. In den Schatten der Galaxis suchen Jedi, Schmuggler und Kopfgeldjäger ihren Weg.',
  },
  {
    type: 'call' as const,
    heading: 'DEINE GESCHICHTE',
    body: 'Die Galaxis braucht neue Helden. Wirst du für das Licht kämpfen — oder der Dunkelheit verfallen?',
    cta: 'Dein Schicksal beginnt jetzt.',
  },
];

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onComplete }) => {
  const [visibleCards, setVisibleCards] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Card 1 appears immediately (with fade-in)
    // Each subsequent card appears after a delay
    const delays = [0, 4000, 8000, 12000];
    const autoCompleteDelay = 20000; // Total: ~20 seconds before auto-complete

    delays.forEach((delay, i) => {
      const timer = setTimeout(() => {
        setVisibleCards(i + 1);
      }, delay);
      timerRef.current.push(timer);
    });

    // Auto-complete after last card has been visible for a while
    const completeTimer = setTimeout(() => {
      setFadeOut(true);
      const fadeTimer = setTimeout(onComplete, 1500);
      timerRef.current.push(fadeTimer);
    }, autoCompleteDelay);
    timerRef.current.push(completeTimer);

    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  const handleSkip = () => {
    timerRef.current.forEach(t => clearTimeout(t));
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 bg-black z-[200] overflow-hidden font-mono select-none transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle Starfield */}
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
            }}
          />
        ))}
      </div>

      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-950/10" />

      {/* Card Stack */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-5 overflow-y-auto py-16">
        {CARDS.map((card, i) => {
          const isVisible = i < visibleCards;
          return (
            <div
              key={i}
              className={`w-full max-w-lg transition-all duration-1000 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
              style={{ transitionDelay: isVisible ? '0ms' : '0ms' }}
            >
              {card.type === 'title' ? (
                /* Title Card */
                <div className="text-center py-8">
                  <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">
                    {card.heading}
                  </h1>
                  <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-3" />
                  <p className="text-[11px] text-amber-500/70 uppercase tracking-[0.4em] font-bold">
                    {card.subtext}
                  </p>
                </div>
              ) : (
                /* Content Card */
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <h2 className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">
                      {card.heading}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    {card.body}
                  </p>
                  {card.type === 'call' && card.cta && (
                    <p className="text-white font-black text-base mt-4 italic tracking-tight">
                      {card.cta}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Skip Button */}
      <div className="absolute bottom-8 right-8 z-30">
        <button
          onClick={handleSkip}
          className="text-zinc-600 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors"
        >
          [ Überspringen ]
        </button>
      </div>
    </div>
  );
};

export default StarWarsCrawl;
