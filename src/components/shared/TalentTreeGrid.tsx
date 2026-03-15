'use client';

import React, { useState } from 'react';

// Talent node from talents_connected.json
interface TalentNode {
  name: string;
  cost: number;
  description: string;
  isRanked: boolean;
  row: number;
  col: number;
  connections: string[];
}

export interface TalentTreeData {
  career: string;
  specialization: string;
  talents: TalentNode[];
}

// Owned talent from character store
interface OwnedTalent {
  id: string;
  name: string;
  currentRank: number;
}

export interface TalentTreeGridProps {
  tree: TalentTreeData;
  ownedTalents: OwnedTalent[];
  availableXP: number;
  onPurchase: (talent: {
    id: string;
    name: string;
    tier: number;
    activation: 'passive';
    ranked: boolean;
    currentRank: number;
    description: string;
    xpCost: number;
  }) => void;
  mode: 'creation' | 'shop';
  /** Optional: show tier labels (used in shop mode) */
  showTierLabels?: boolean;
}

/** Consistent talent ID format across the entire app */
export const makeTalentId = (specName: string, row: number, col: number) =>
  `${specName}-R${row}-C${col}`;

const TalentTreeGrid: React.FC<TalentTreeGridProps> = ({
  tree,
  ownedTalents,
  availableXP,
  onPurchase,
  mode,
  showTierLabels = false,
}) => {
  const [selectedTalentKey, setSelectedTalentKey] = useState<string | null>(null);

  const maxRow = tree.talents.length > 0
    ? Math.max(...tree.talents.map(t => t.row))
    : 0;

  const isOwnedById = (id: string) => ownedTalents.some(ot => ot.id === id);

  const canPurchase = (tal: TalentNode): boolean => {
    if (tal.row === 1) return true;

    const checkOwned = (above: TalentNode) =>
      isOwnedById(makeTalentId(tree.specialization, above.row, above.col));

    // Check vertical: 'top' connection → talent directly above must be owned
    if (tal.connections?.includes('top')) {
      const directAbove = tree.talents.find(a => a.row === tal.row - 1 && a.col === tal.col);
      if (directAbove && checkOwned(directAbove)) return true;
    }

    // Check vertical: talent above with 'bottom' connection in same col
    const aboveWithBottom = tree.talents.filter(a =>
      a.row === tal.row - 1 && a.col === tal.col && a.connections?.includes('bottom')
    );
    if (aboveWithBottom.some(checkOwned)) return true;

    // Check horizontal: left
    if (tal.connections?.includes('left')) {
      const leftNeighbor = tree.talents.find(a => a.row === tal.row && a.col === tal.col - 1);
      if (leftNeighbor && checkOwned(leftNeighbor)) return true;
    }

    // Check horizontal: right
    if (tal.connections?.includes('right')) {
      const rightNeighbor = tree.talents.find(a => a.row === tal.row && a.col === tal.col + 1);
      if (rightNeighbor && checkOwned(rightNeighbor)) return true;
    }

    return false;
  };

  const handleBuy = (tal: TalentNode) => {
    const tid = makeTalentId(tree.specialization, tal.row, tal.col);
    onPurchase({
      id: tid,
      name: tal.name,
      tier: tal.row,
      activation: 'passive' as const,
      ranked: tal.isRanked,
      currentRank: 0,
      description: tal.description || '',
      xpCost: tal.cost,
    });
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      {Array.from({ length: maxRow }, (_, i) => i + 1).map(rowIndex => (
        <div key={rowIndex}>
          {showTierLabels && (
            <div className="text-[7px] text-zinc-700 font-black uppercase tracking-widest mb-2">
              Tier {rowIndex} — {rowIndex * 5} XP
            </div>
          )}
          <div className="grid grid-cols-4 gap-3 min-w-[700px] md:min-w-0">
            {[1, 2, 3, 4].map(colIndex => {
              const talent = tree.talents.find(t => t.row === rowIndex && t.col === colIndex);
              if (!talent) return <div key={colIndex} className="invisible" />;

              const talentKey = `${rowIndex}-${colIndex}`;
              const tid = makeTalentId(tree.specialization, talent.row, talent.col);
              const isOwned = isOwnedById(tid);
              const ownedEntry = ownedTalents.find(ot => ot.id === tid);
              const isSelected = selectedTalentKey === talentKey;
              const cost = talent.cost;
              const hasTopConnection = talent.connections?.includes('top');
              const isUnlocked = canPurchase(talent);
              const canRebuy = talent.isRanked && isOwned && (!ownedEntry || ownedEntry.currentRank < 5);

              return (
                <div key={colIndex} className="relative flex flex-col items-center">
                  {hasTopConnection && (
                    <div className="absolute -top-4 h-4 w-0.5 bg-zinc-700 z-0" />
                  )}

                  <div
                    onClick={() => setSelectedTalentKey(isSelected ? null : talentKey)}
                    className={`relative z-10 w-full h-full min-h-[120px] p-3 border rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-white bg-zinc-800 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105'
                        : isOwned
                        ? 'border-emerald-500/50 bg-emerald-900/10'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-[10px] font-black uppercase leading-tight ${isOwned ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {talent.name}
                      </h3>
                      {isOwned && (
                        <div className="flex items-center gap-1">
                          {talent.isRanked && ownedEntry && (
                            <span className="text-[7px] text-emerald-400 font-black">R{ownedEntry.currentRank}</span>
                          )}
                          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3">
                      {talent.description || 'Passiv'}
                    </p>

                    <div className="mt-2 pt-2 border-t border-zinc-800/50 flex justify-between items-center">
                      <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider">{cost} XP</span>
                      {talent.isRanked ? (
                        <span className="text-[7px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded uppercase">Ranked</span>
                      ) : (
                        <span className="text-[7px] text-zinc-700 uppercase">Passive</span>
                      )}
                    </div>

                    {/* Buy / Rank-up Overlay */}
                    {isSelected && (!isOwned || canRebuy) && (
                      <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl animate-in fade-in duration-200">
                        {isUnlocked || canRebuy ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBuy(talent); }}
                            disabled={availableXP < cost}
                            className={`px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest ${
                              availableXP >= cost
                                ? 'bg-amber-500 text-black hover:bg-amber-400'
                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                          >
                            {canRebuy ? `Rank Up (${cost})` : `Buy (${cost})`}
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
  );
};

export default TalentTreeGrid;
