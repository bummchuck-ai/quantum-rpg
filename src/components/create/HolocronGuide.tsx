'use client';

import React, { useState, useEffect } from 'react';

interface HolocronGuideProps {
  title: string;
  description: string;
  advice: string;
}

const HolocronGuide: React.FC<HolocronGuideProps> = ({ title, description, advice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification pulse after a delay to grab attention
    const timer = setTimeout(() => setShowNotification(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-72 bg-zinc-900 border border-amber-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 bg-amber-500/20 animate-spin-slow rotate-45 border border-amber-500/40"></div>
              <div className="absolute inset-2 bg-amber-500 animate-pulse"></div>
            </div>
            <h3 className="text-amber-500 font-black italic tracking-tighter uppercase text-sm">{title}</h3>
          </div>
          
          <p className="text-[11px] text-zinc-400 font-sans italic leading-relaxed mb-4">
            {description}
          </p>
          
          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
            <div className="text-[8px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1">GM_ADVICE</div>
            <p className="text-[10px] text-white font-mono italic leading-snug">
              "{advice}"
            </p>
          </div>
        </div>
      )}

      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotification(false);
        }}
        className={`w-14 h-14 relative flex items-center justify-center transition-all duration-500 ${
          isOpen ? 'rotate-180 scale-90' : 'hover:scale-110 active:scale-95'
        }`}
      >
        {/* Holocron Shape */}
        <div className={`absolute inset-0 bg-zinc-950 border-2 ${isOpen ? 'border-zinc-800' : 'border-amber-500'} rotate-45 transition-colors`}></div>
        <div className={`absolute inset-2 bg-zinc-900 border ${isOpen ? 'border-zinc-800' : 'border-amber-500/40'} rotate-45 transition-colors`}></div>
        
        {/* Core */}
        <div className={`w-3 h-3 ${isOpen ? 'bg-zinc-800' : 'bg-amber-500'} rotate-45 animate-pulse transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)]`}></div>
        
        {/* Notification indicator */}
        {showNotification && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-black animate-bounce"></div>
        )}
      </button>
    </div>
  );
};

export default HolocronGuide;
