'use client';

import React, { useState, useEffect } from 'react';

interface HolocronGuideProps {
  title: string;
  description: string;
  advice: string;
  sectionKey: string;
}

const STORAGE_KEY = 'quantum-rpg-holocron-seen';

function getSeenSections(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function markSeen(sectionKey: string) {
  const seen = getSeenSections();
  seen[sectionKey] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
}

const HolocronGuide: React.FC<HolocronGuideProps> = ({ title, description, advice, sectionKey }) => {
  const [dismissed, setDismissed] = useState(true); // hidden by default until we check
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if this section was already seen
    const seen = getSeenSections();
    if (seen[sectionKey]) {
      setDismissed(true);
      return;
    }
    setDismissed(false);
    // Show notification pulse after a delay to grab attention
    const timer = setTimeout(() => setShowNotification(true), 1500);
    return () => clearTimeout(timer);
  }, [sectionKey]);

  // Already read → render nothing
  if (dismissed) return null;

  const handleClick = () => {
    if (isOpen) {
      // Closing after reading → dismiss permanently
      markSeen(sectionKey);
      setDismissed(true);
    } else {
      setIsOpen(true);
      setShowNotification(false);
    }
  };

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
              &quot;{advice}&quot;
            </p>
          </div>

          <button
            onClick={handleClick}
            className="mt-4 w-full text-[10px] text-zinc-500 hover:text-amber-500 uppercase tracking-widest transition-colors"
          >
            Verstanden — ausblenden
          </button>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={handleClick}
          className="w-14 h-14 relative flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95"
        >
          {/* Holocron Shape */}
          <div className="absolute inset-0 bg-zinc-950 border-2 border-amber-500 rotate-45 transition-colors"></div>
          <div className="absolute inset-2 bg-zinc-900 border border-amber-500/40 rotate-45 transition-colors"></div>

          {/* Core */}
          <div className="w-3 h-3 bg-amber-500 rotate-45 animate-pulse transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>

          {/* Notification indicator */}
          {showNotification && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-black animate-bounce"></div>
          )}
        </button>
      )}
    </div>
  );
};

export default HolocronGuide;
