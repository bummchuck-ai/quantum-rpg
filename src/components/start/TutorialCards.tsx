'use client';

import React, { useState, useEffect, useRef } from 'react';
import { t } from '@/lib/i18n';
import { playNavigate, playConfirm } from '@/lib/sounds';

interface TutorialCardsProps {
  onComplete: () => void;
}

const CARDS = [
  { icon: '🌌', titleKey: 'tutorialSpeciesTitle', bodyKey: 'tutorialSpeciesBody' },
  { icon: '⚔️', titleKey: 'tutorialCareerTitle', bodyKey: 'tutorialCareerBody' },
  { icon: '🛡️', titleKey: 'tutorialGearTitle', bodyKey: 'tutorialGearBody' },
];

const TutorialCards: React.FC<TutorialCardsProps> = ({ onComplete }) => {
  const [activeCard, setActiveCard] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFinishing = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const resetAutoAdvance = () => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      if (activeCard < CARDS.length - 1) {
        setActiveCard(prev => prev + 1);
        playNavigate();
      }
    }, 5000);
  };

  useEffect(() => {
    resetAutoAdvance();
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
    };
  }, [activeCard]);

  const handleNext = () => {
    if (activeCard < CARDS.length - 1) {
      playNavigate();
      setActiveCard(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (isFinishing.current) return;
    isFinishing.current = true;
    playConfirm();
    setFadeOut(true);
    if (autoTimer.current) clearTimeout(autoTimer.current);
    finishTimer.current = setTimeout(() => onCompleteRef.current(), 500);
  };

  const isLast = activeCard === CARDS.length - 1;

  return (
    <div className={`fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center px-6 font-mono select-none transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-950/10" />

      {/* Progress dots */}
      <div className="absolute top-8 flex gap-2 z-10">
        {CARDS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === activeCard ? 'w-8 bg-amber-500' : i < activeCard ? 'w-4 bg-amber-500/40' : 'w-4 bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md z-10">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              i === activeCard
                ? 'opacity-100 translate-x-0 scale-100'
                : i < activeCard
                ? 'opacity-0 -translate-x-16 scale-95'
                : 'opacity-0 translate-x-16 scale-95'
            }`}
            style={{ position: i === activeCard ? 'relative' : 'absolute' }}
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="text-4xl mb-5 text-center">{card.icon}</div>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <h2 className="text-[11px] text-amber-500 font-black uppercase tracking-[0.3em]">
                  {t(card.titleKey)}
                </h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-sans text-center">
                {t(card.bodyKey)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-12 w-full max-w-md px-6 z-10 space-y-3">
        <button
          onClick={handleNext}
          className="w-full bg-amber-500 text-black font-black py-4 rounded-xl uppercase italic tracking-widest text-xs transition-all active:scale-95 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
        >
          {isLast ? t('tutorialStart') : `${t('introNext')}`}
        </button>
        <button
          onClick={handleFinish}
          className="w-full text-zinc-600 hover:text-amber-400 text-[10px] uppercase tracking-widest transition-colors py-2"
        >
          [ {t('tutorialSkip')} ]
        </button>
      </div>
    </div>
  );
};

export default TutorialCards;
