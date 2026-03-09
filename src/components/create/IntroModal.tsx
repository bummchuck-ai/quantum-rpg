'use client';

import React, { useState } from 'react';
import { playClick, playDeploy } from '@/lib/sounds';

const INTRO_SLIDES = [
  {
    id: 1,
    title: "DAS_QUANTUM_UNIVERSUM",
    text: "181 ABY. Django Fett regiert als Mandalore. Darth Plagueis II. erobert Sektor um Sektor. Die Kaiserin ist tot, Bastion gefallen. Auf Tatooine, Dathomir und Dutzenden anderen Welten schreiben Renegaten, Jedi und Kopfgeldjäger Geschichte. Jetzt schreibst du deine.",
    accent: "TIMELINE_SYNC"
  },
  {
    id: 2,
    title: "DEIN_GAME_MASTER",
    text: "Eine KI lenkt das Schicksal. Sie kennt die Lore von 8 Jahren Kampagnen, hunderten Schlachten und legendären Helden. Sie reagiert auf jede deiner Entscheidungen. Kein Durchgang ist wie der andere.",
    accent: "AI_CORTEX"
  },
  {
    id: 3,
    title: "ERSCHAFFE_DICH",
    text: "92 Spezies. 20 Karrieren. Hunderte Talente. Wähle, wer du sein willst — vom Wookiee-Marodeur bis zum Twi'lek-Diplomaten. Deine Werte entscheiden über Leben und Tod im Outer Rim.",
    accent: "IDENTITY_FORGE"
  },
  {
    id: 4,
    title: "BEREIT?",
    text: "Die Crew wartet. Bis zu 4 Spieler erstellen ihre Charaktere und starten ins Abenteuer. Kämpfe für das Triumvirat, schließ dich den Sons of Corruption an — oder finde deinen eigenen Weg. Vode An.",
    accent: "LAUNCH_SEQUENCE"
  }
];

interface IntroModalProps {
  onClose: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < INTRO_SLIDES.length - 1) {
      playClick();
      setCurrentSlide(currentSlide + 1);
    } else {
      playDeploy();
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
