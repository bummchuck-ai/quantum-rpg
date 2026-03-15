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

  const MAX_RANK = 5;

  const handleBuy = (tal: TalentNode) => {
    const tid = makeTalentId(tree.specialization, tal.row, tal.col);
    onPurchase({
      id: tid,
      name: tal.name,
      tier: tal.row,
      activation: 'passive' as const,
      ranked: tal.isRanked,
      currentRank: tal.isRanked ? 1 : 0, // ranked starts at 1, non-ranked at 0
      description: tal.description || '',
      xpCost: tal.cost,
    });
  };

  return (
    <div className="space-y-3 overflow-x-auto pb-2">
      {Array.from({ length: maxRow }, (_, i) => i + 1).map(rowIndex => (
        <div key={rowIndex}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-[7px] text-zinc-700 font-black uppercase tracking-widest">
              Tier {rowIndex}
            </div>
            <div className="flex-1 h-px bg-zinc-800/50" />
            <div className="text-[7px] text-zinc-700 font-black">{rowIndex * 5} XP</div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 min-w-[560px] md:min-w-0">
            {[1, 2, 3, 4].map(colIndex => {
              const talent = tree.talents.find(t => t.row === rowIndex && t.col === colIndex);
              if (!talent) return <div key={colIndex} />;

              const talentKey = `${rowIndex}-${colIndex}`;
              const tid = makeTalentId(tree.specialization, talent.row, talent.col);
              const isOwned = isOwnedById(tid);
              const ownedEntry = ownedTalents.find(ot => ot.id === tid);
              const isSelected = selectedTalentKey === talentKey;
              const cost = talent.cost;
              const hasTopConnection = talent.connections?.includes('top');
              const hasBottomConnection = talent.connections?.includes('bottom');
              const isUnlocked = canPurchase(talent);
              // Rank-up only if: ranked + owned + under max rank + prerequisites still valid
              const canRebuy = talent.isRanked && isOwned && isUnlocked
                && (!ownedEntry || ownedEntry.currentRank < MAX_RANK);
              const isLocked = !isOwned && !isUnlocked;
              const canAfford = availableXP >= cost;

              return (
                <div key={colIndex} className="relative flex flex-col items-center">
                  {/* Connection line above */}
                  {hasTopConnection && (
                    <div className="w-px h-3 bg-zinc-700/60 -mb-px" />
                  )}

                  <div
                    onClick={() => setSelectedTalentKey(isSelected ? null : talentKey)}
                    className={`relative w-full p-1.5 border rounded-lg cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-amber-500 bg-zinc-800 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : isOwned
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : isLocked
                        ? 'border-zinc-800/50 bg-zinc-950/60 opacity-50'
                        : 'border-zinc-700/50 bg-zinc-900/30 hover:border-zinc-600'
                    }`}
                  >
                    {/* Header: Name + Status */}
                    <div className="flex justify-between items-start gap-1">
                      <h3 className={`text-[8px] font-black uppercase leading-none ${
                        isOwned ? 'text-emerald-400' : isLocked ? 'text-zinc-600' : 'text-zinc-300'
                      }`}>
                        {talent.name}
                      </h3>
                      {isOwned && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {talent.isRanked && ownedEntry && ownedEntry.currentRank > 0 && (
                            <span className="text-[6px] text-emerald-400 font-black bg-emerald-500/10 px-1 rounded">R{ownedEntry.currentRank}</span>
                          )}
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Description (only when selected) */}
                    {isSelected && (
                      <p className="text-[8px] text-zinc-500 leading-tight mt-1 line-clamp-3">
                        {talent.description || 'Passiv'}
                      </p>
                    )}

                    {/* Footer: Cost + Type */}
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[7px] font-black ${isLocked ? 'text-zinc-700' : 'text-zinc-500'}`}>{cost}</span>
                      {talent.isRanked && (
                        <span className="text-[5px] bg-zinc-800 text-zinc-600 px-1 py-px rounded uppercase leading-none">R</span>
                      )}
                    </div>

                    {/* Buy / Rank-up Overlay */}
                    {isSelected && (!isOwned || canRebuy) && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center rounded-lg animate-in fade-in duration-150 gap-1 p-1">
                        {(isUnlocked || canRebuy) ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBuy(talent); }}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-md font-black uppercase text-[8px] tracking-wider ${
                              canAfford
                                ? 'bg-amber-500 text-black active:scale-95'
                                : 'bg-zinc-800 text-zinc-600'
                            }`}
                          >
                            {canRebuy ? `Rank Up` : `Kaufen`}
                          </button>
                        ) : (
                          <span className="text-[7px] text-red-400/70 font-black uppercase">Gesperrt</span>
                        )}
                        <span className="text-[6px] text-zinc-600">{cost} XP</span>
                      </div>
                    )}
                  </div>

                  {/* Connection line below */}
                  {hasBottomConnection && (
                    <div className="w-px h-3 bg-zinc-700/60 -mt-px" />
                  )}
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
