'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import talentsData from '@/../data/json/talents_connected.json';

interface TalentNode {
  name: string;
  cost: number;
  description: string;
  isRanked: boolean;
  row: number;
  col: number;
  connections: string[];
}

interface TalentTree {
  career: string;
  specialization: string;
  talents: TalentNode[];
}

const TalentShop = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const buyTalent = useCharacterStore((state) => state.buyTalent);

  const allTrees = talentsData as TalentTree[];
  const [currentTree, setCurrentTree] = useState<TalentTree | null>(null);
  const [selectedTalentKey, setSelectedTalentKey] = useState<string | null>(null);

  useEffect(() => {
    if (!activePlayer?.specializations?.length) return;
    const specName = activePlayer.specializations[0].name.toLowerCase();
    const tree = allTrees.find(t => t.specialization.toLowerCase() === specName)
      || allTrees.find(t =>
        t.specialization.toLowerCase().includes(specName) ||
        specName.includes(t.specialization.toLowerCase())
      );
    if (tree) setCurrentTree(tree);
  }, [activePlayer?.specializations, allTrees]);

  if (!activePlayer) {
    return <div className="min-h-screen bg-black p-4 text-zinc-700 font-mono text-[10px] uppercase italic">Kein aktiver Spieler ausgewaehlt...</div>;
  }

  const { availableXP, ownedTalents } = activePlayer;

  const canPurchase = (t: TalentNode): boolean => {
    if (t.row === 1) return true;
    if (!currentTree) return false;
    if (t.connections?.includes('top')) {
      const directAbove = currentTree.talents.find(above => above.row === t.row - 1 && above.col === t.col);
      if (directAbove && ownedTalents.some(ot => ot.name === directAbove.name)) return true;
    }
    const aboveRow = currentTree.talents.filter(above =>
      above.row === t.row - 1 && above.col === t.col && above.connections?.includes('bottom')
    );
    return aboveRow.some(above => ownedTalents.some(ot => ot.name === above.name));
  };

  const handleBuy = (t: TalentNode) => {
    const talentObj = {
      id: `${currentTree?.specialization}-${t.row}-${t.col}`,
      name: t.name,
      tier: t.row,
      activation: 'passive' as const,
      ranked: t.isRanked,
      currentRank: 0,
      description: t.description || '',
      xpCost: t.cost,
    };
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
            <option key={t.specialization} value={t.specialization}>
              {t.career} → {t.specialization}
            </option>
          ))}
        </select>
      </header>

      {currentTree ? (
        <div className="p-4 space-y-4 pb-24 overflow-x-auto">
          {Array.from({ length: Math.max(...currentTree.talents.map(t => t.row)) }, (_, i) => i + 1).map(rowIndex => (
            <div key={rowIndex}>
              {/* Row cost label */}
              <div className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mb-2">Tier {rowIndex} — {rowIndex * 5} XP</div>
              <div className="grid grid-cols-4 gap-3 min-w-[700px] md:min-w-0">
                {[1, 2, 3, 4].map(colIndex => {
                  const talent = currentTree.talents.find(t => t.row === rowIndex && t.col === colIndex);
                  if (!talent) return <div key={colIndex} className="invisible" />;

                  const talentKey = `${rowIndex}-${colIndex}`;
                  const isOwned = ownedTalents.some(ot => ot.name === talent.name);
                  const isSelected = selectedTalentKey === talentKey;
                  const cost = talent.row * 5;
                  const hasTopConnection = talent.connections?.includes('top');
                  const isUnlocked = canPurchase(talent);

                  return (
                    <div key={colIndex} className="relative flex flex-col items-center">
                      {hasTopConnection && (
                        <div className="absolute -top-4 h-4 w-0.5 bg-zinc-700 z-0" />
                      )}
                      <div
                        onClick={() => setSelectedTalentKey(isSelected ? null : talentKey)}
                        className={`relative z-10 w-full h-full min-h-[110px] p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-white bg-zinc-800 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105'
                            : isOwned
                            ? 'border-emerald-500/50 bg-emerald-900/10'
                            : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-[10px] font-black uppercase leading-tight ${isOwned ? 'text-emerald-400' : 'text-zinc-200'}`}>
                            {talent.name}
                          </h3>
                          {isOwned && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" />}
                        </div>
                        <p className="text-[8px] text-zinc-500 leading-snug line-clamp-3">{talent.description || 'Passiv'}</p>
                        <div className="mt-1.5 pt-1.5 border-t border-zinc-800/50 flex justify-between items-center">
                          <span className="text-[8px] text-zinc-600 font-black uppercase">{cost} XP</span>
                          {talent.isRanked && <span className="text-[7px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded uppercase">Ranked</span>}
                        </div>

                        {/* Buy overlay */}
                        {isSelected && !isOwned && (
                          <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl animate-in fade-in duration-200">
                            {isUnlocked ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleBuy(talent); }}
                                disabled={availableXP < cost}
                                className={`px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest ${
                                  availableXP >= cost
                                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                }`}
                              >
                                Buy ({cost})
                              </button>
                            ) : (
                              <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">LOCKED</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
