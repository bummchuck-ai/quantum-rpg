'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { Talent } from '@/types/character';
import allTalents from '@/../data/allTalents.json';

const MAX_TALENT_RANK = 5; // Muss mit dem Wert im characterStore.ts übereinstimmen

const TalentShop = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const buyTalent = useCharacterStore((state) => state.buyTalent);

  if (!activePlayer) {
    return <div className="min-h-screen bg-black p-4 text-zinc-700 font-mono text-[10px] uppercase italic">Kein aktiver Spieler ausgewaehlt...</div>;
  }

  const { availableXP, ownedTalents } = activePlayer;

  const handleBuyTalent = (talentToBuy: Talent) => {
    buyTalent(talentToBuy);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 bg-zinc-950">
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Talent_Shop</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Verfuegbar</span>
          <span className="text-sm font-black text-amber-500">{availableXP} XP</span>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {allTalents.map((talent: Talent) => {
          const ownedTalent = ownedTalents.find(ot => ot.id === talent.id);
          const currentRank = ownedTalent ? ownedTalent.currentRank : 0;
          const canAfford = availableXP >= talent.xpCost;
          const isMaxRank = talent.ranked && currentRank >= MAX_TALENT_RANK;
          const alreadyOwnedNonRanked = !talent.ranked && ownedTalent !== undefined;
          const isDisabled = !canAfford || isMaxRank || alreadyOwnedNonRanked;

          return (
            <div key={talent.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{talent.name}</h3>
                  {isMaxRank && <span className="text-[7px] text-emerald-500 font-black uppercase">MAX</span>}
                  {alreadyOwnedNonRanked && <span className="text-[7px] text-emerald-500 font-black uppercase">Owned</span>}
                </div>
                <p className="text-[9px] text-zinc-500 mt-0.5 line-clamp-2">{talent.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-amber-500 font-black">{talent.xpCost} XP</span>
                  {talent.ranked && (
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-zinc-600 font-black uppercase">Rang</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(r => (
                          <div key={r} className={`w-2 h-2 rounded-full ${r <= currentRank ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.4)]' : 'bg-zinc-800'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleBuyTalent(talent)}
                disabled={isDisabled}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black py-2 px-4 rounded-lg text-[9px] uppercase tracking-widest whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                {talent.ranked && currentRank > 0 ? 'Upgrade' : 'Kaufen'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentShop;
