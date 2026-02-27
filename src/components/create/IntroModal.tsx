'use client';

import React, { useState } from 'react';

const INTRO_SLIDES = [
  {
    id: 1,
    title: "INITIERE_PROTOKOLL: QUANTUM",
    text: "Willkommen in einer Galaxis, die von künstlicher Intelligenz geformt wird. Quantum RPG ist nicht nur ein Spiel – es ist ein lebendiges Universum, in dem jeder deiner Schritte Konsequenzen hat.",
    accent: "CORE_BOOT"
  },
  {
    id: 2,
    title: "DER_GAME_MASTER",
    text: "Hinter dem Schleier agiert ein hochentwickelter KI-Game-Master. Er reagiert auf deine Aktionen, führt Dialoge und leitet dich durch epische Kampagnen. Sei bereit, deine Rolle zu spielen.",
    accent: "AI_OVERRIDE"
  },
  {
    id: 3,
    title: "CHARAKTER_MANIFEST",
    text: "In den nächsten Schritten erschaffst du deine Identität. Wähle deine Spezies, deine Karriere und dein Schicksal. Deine Werte bestimmen dein Überleben in den gefährlichen Sektoren des Outer Rim.",
    accent: "IDENTITY_SCAN"
  },
  {
    id: 4,
    title: "BEREIT_ZUR_MISSION?",
    text: "Wenn du bereit bist, öffne das Holocron und starte die Erstellung. Möge die Macht mit dir sein – oder zumindest ein geladener Blaster.",
    accent: "DEPLOYMENT_READY"
  }
];

interface IntroModalProps {
  onClose: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < INTRO_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const slide = INTRO_SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-[0_0_100px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 border border-zinc-900 text-zinc-600 hover:text-amber-500 hover:border-amber-500 transition-all flex items-center justify-center z-10 rounded-lg"
        >
          ✕
        </button>

        {/* Slide Progress */}
        <div className="flex gap-1 p-1 bg-zinc-900/50">
          {INTRO_SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 transition-all duration-500 ${i <= currentSlide ? 'bg-amber-500' : 'bg-zinc-800'}`}
            ></div>
          ))}
        </div>

        <div className="p-8 flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-amber-500 font-black tracking-[0.3em] uppercase opacity-50">
              {slide.accent} // 0{slide.id}
            </span>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
              {slide.title}
            </h2>
          </div>

          <p className="text-sm text-zinc-400 font-sans italic leading-relaxed selection:bg-amber-500/20">
            {slide.text}
          </p>

          <div className="pt-4">
            <button 
              onClick={nextSlide}
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-2xl transition-all active:scale-95"
            >
              {currentSlide === INTRO_SLIDES.length - 1 ? 'SYSTEM_START_→' : 'NÄCHSTER_SCHRITT_→'}
            </button>
          </div>
        </div>

        {/* Tactical visual elements */}
        <div className="h-2 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="p-4 bg-black/40 border-t border-zinc-900 flex justify-between items-center text-[7px] text-zinc-700 font-black uppercase tracking-widest">
          <span>Buffer_Active</span>
          <span className="animate-pulse">Waiting_for_input...</span>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
