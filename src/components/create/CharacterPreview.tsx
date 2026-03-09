'use client';

import React, { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';

const CharacterPreview: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { players, activePlayerIndex } = useCharacterStore();
  const p = players[activePlayerIndex];

  const name = p.name || 'UNNAMED';
  const speciesName = p.species?.name;
  const careerName = p.career?.name;
  const specName = p.specializations[0]?.name;
  const bgType = p.backgroundType;
  const bgOption = p.backgroundOption;

  return (
    <div
      className="mb-6 border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden cursor-pointer select-none"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Collapsed: single line summary */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest truncate">
            {name}
          </span>
          {speciesName && (
            <>
              <span className="text-[9px] text-zinc-700">|</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest truncate">{speciesName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 pl-2">
          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{p.availableXP} XP</span>
          <span className="text-[9px] text-zinc-600">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded: full mini-sheet */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50 animate-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {speciesName && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Species</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{speciesName}</span>
              </div>
            )}
            {careerName && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Career</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{careerName}</span>
              </div>
            )}
            {specName && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Spec</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{specName}</span>
              </div>
            )}
            {bgType && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{bgType}</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{bgOption || '—'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">XP</span>
              <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">{p.availableXP}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Credits</span>
              <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">{p.credits}</span>
            </div>
            {p.ownedTalents.length > 0 && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Talents</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{p.ownedTalents.length}</span>
              </div>
            )}
            {p.ownedGear.length > 0 && (
              <div className="flex justify-between">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Gear</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{p.ownedGear.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterPreview;
