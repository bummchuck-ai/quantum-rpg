'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import talentsData from '@/../data/json/talents_connected.json';
import { findTalentTree } from '@/lib/talent-aliases';
import TalentTreeGrid, { type TalentTreeData } from '@/components/shared/TalentTreeGrid';
import type { Talent } from '@/types/character';

const TalentShop = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const buyTalent = useCharacterStore((state) => state.buyTalent);

  const allTrees = talentsData as TalentTreeData[];
  const [currentTree, setCurrentTree] = useState<TalentTreeData | null>(null);

  useEffect(() => {
    if (!activePlayer?.specializations?.length) return;
    const specName = activePlayer.specializations[0].name;
    const tree = findTalentTree(allTrees, specName);
    if (tree) setCurrentTree(tree);
  }, [activePlayer?.specializations, allTrees]);

  if (!activePlayer) {
    return <div className="min-h-screen bg-black p-4 text-zinc-700 font-mono text-[10px] uppercase italic">Kein aktiver Spieler ausgewaehlt...</div>;
  }

  const { availableXP, ownedTalents } = activePlayer;

  const handlePurchase = (talentObj: Talent) => {
    if (availableXP < talentObj.xpCost) return;
    buyTalent(talentObj);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">TALENT_TREES</h2>
            {currentTree && (
              <div className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">{currentTree.career} → {currentTree.specialization}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-amber-500">{availableXP} XP</div>
            <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
          </div>
        </div>
        {/* Tree selector */}
        <select
          className="mt-3 w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
          value={currentTree?.specialization || ''}
          onChange={(e) => {
            const tree = allTrees.find(t => t.specialization === e.target.value);
            if (tree) setCurrentTree(tree);
          }}
        >
          <option value="" disabled>Talentbaum wählen...</option>
          {allTrees.map(t => (
            <option key={`${t.career}-${t.specialization}`} value={t.specialization}>
              {t.career} → {t.specialization}
            </option>
          ))}
        </select>
      </header>

      {currentTree ? (
        <div className="p-4 pb-24">
          <TalentTreeGrid
            tree={currentTree}
            ownedTalents={ownedTalents}
            availableXP={availableXP}
            onPurchase={handlePurchase}
            mode="shop"
            showTierLabels
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="text-zinc-600 text-xs uppercase tracking-widest">Wähle einen Talentbaum oben aus</div>
        </div>
      )}
    </div>
  );
};

export default TalentShop;
