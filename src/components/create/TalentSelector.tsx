'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import talentsData from '@/../data/json/talents_connected.json';
import { findTalentTree } from '@/lib/talent-aliases';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';
import { playXPSpend, playError, playNavigate } from '@/lib/sounds';
import { t } from '@/lib/i18n';

interface Talent {
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
  talents: Talent[];
}

const TalentSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, buyTalent } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { specializations, availableXP, ownedTalents } = activePlayer;

  const allTrees = talentsData as TalentTree[];
  const [currentTree, setCurrentTree] = useState<TalentTree | null>(null);
  const [selectedTalentKey, setSelectedTalentKey] = useState<string | null>(null);
  const [treeNotFound, setTreeNotFound] = useState(false);
  const [treeSearch, setTreeSearch] = useState('');

  useEffect(() => {
    if (specializations.length > 0) {
      const tree = findTalentTree(allTrees, specializations[0].name);
      if (tree) {
        setCurrentTree(tree);
      } else {
        setTreeNotFound(true);
      }
    } else {
      setTreeNotFound(true);
    }
  }, [specializations]);

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/armory');
  };

  // Back to tree browser from tree view
  const handleBackToTreeBrowser = () => {
    playNavigate();
    setCurrentTree(null);
    setTreeNotFound(true);
    setSelectedTalentKey(null);
  };

  const talentId = (tree: TalentTree | null, talent: Talent) =>
    `${tree?.specialization}-${talent.row}-${talent.col}`;

  const canPurchase = (tal: Talent): boolean => {
    if (tal.row === 1) return true;
    if (!currentTree) return false;
    // Check vertical connections: talent above in same col with 'bottom' or this talent with 'top'
    const checkAbove = (above: Talent) =>
      ownedTalents.some(ot => ot.id === talentId(currentTree, above));

    // Check if this talent has a 'top' connection and the talent directly above is owned
    if (tal.connections?.includes('top')) {
      const directAbove = currentTree.talents.find(a => a.row === tal.row - 1 && a.col === tal.col);
      if (directAbove && checkAbove(directAbove)) return true;
    }
    // Check if any talent in the row above with 'bottom' connection in same col is owned
    const aboveWithBottom = currentTree.talents.filter(a =>
      a.row === tal.row - 1 && a.col === tal.col && a.connections?.includes('bottom')
    );
    if (aboveWithBottom.some(checkAbove)) return true;
    // Check horizontal connections: left/right
    if (tal.connections?.includes('left')) {
      const leftNeighbor = currentTree.talents.find(a => a.row === tal.row && a.col === tal.col - 1);
      if (leftNeighbor && ownedTalents.some(ot => ot.id === talentId(currentTree, leftNeighbor))) return true;
    }
    if (tal.connections?.includes('right')) {
      const rightNeighbor = currentTree.talents.find(a => a.row === tal.row && a.col === tal.col + 1);
      if (rightNeighbor && ownedTalents.some(ot => ot.id === talentId(currentTree, rightNeighbor))) return true;
    }
    return false;
  };

  const handleBuy = (tal: Talent) => {
    const cost = tal.cost;
    if (availableXP < cost) {
      playError();
      return;
    }
    playXPSpend();
    const talentObj = {
      id: talentId(currentTree, tal),
      name: tal.name,
      tier: tal.row,
      activation: 'passive' as const,
      ranked: tal.isRanked,
      currentRank: 0,
      description: tal.description || '',
      xpCost: cost,
    };
    buyTalent(talentObj);
  };

  // Tree browser view (no tree selected)
  if (!currentTree) {
    const playerCareer = activePlayer.career?.name || '';
    const filtered = allTrees.filter(tr =>
      treeSearch === '' ||
      tr.specialization.toLowerCase().includes(treeSearch.toLowerCase()) ||
      tr.career.toLowerCase().includes(treeSearch.toLowerCase())
    );
    const grouped: Record<string, TalentTree[]> = {};
    filtered.forEach(tr => {
      if (!grouped[tr.career]) grouped[tr.career] = [];
      grouped[tr.career].push(tr);
    });
    const sortedCareers = Object.keys(grouped).sort((a, b) => {
      if (a === playerCareer) return -1;
      if (b === playerCareer) return 1;
      return a.localeCompare(b);
    });

    return (
      <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
          <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/create/skills')} className="w-11 h-11 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-11 h-11 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">6</div>
            <div>
              <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">TRAINING_CENTER</h1>
            </div>
          </div>
        </header>

        <ProgressTracker currentStep={6} />
        <CharacterPreview />

        {treeNotFound ? (
          <div className="flex-1 flex flex-col gap-4 pb-32">
            <div className="text-center mb-2">
              <div className="text-amber-500 text-sm font-black uppercase tracking-widest mb-2">{t('noTalentTree')}</div>
              <p className="text-zinc-500 text-xs max-w-md mx-auto">
                {t('noTalentTreeDesc')}
              </p>
            </div>

            <input
              type="text"
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              placeholder={t('searchTalentTree')}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-xl px-4 py-3 w-full focus:border-amber-500 outline-none transition-colors"
            />

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {sortedCareers.map(careerName => (
                <div key={careerName}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${careerName === playerCareer ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {careerName}
                      {careerName === playerCareer && (
                        <span className="ml-2 text-[8px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{t('recommendedForYou')}</span>
                      )}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {grouped[careerName].map(tr => (
                      <div
                        key={tr.specialization}
                        onClick={() => {
                          playNavigate();
                          setCurrentTree(tr);
                          setTreeNotFound(false);
                        }}
                        className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                          careerName === playerCareer
                            ? 'border-amber-500/30 bg-amber-500/[0.03] hover:border-amber-500 hover:bg-amber-500/[0.06]'
                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="text-[10px] font-black text-white uppercase tracking-tight leading-tight">{tr.specialization}</div>
                        <div className="text-[8px] text-zinc-600 mt-1">{tr.talents?.length || 0} Talents</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {sortedCareers.length === 0 && (
                <div className="text-center text-zinc-700 text-xs py-8 uppercase tracking-widest">No_Results_Found</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-amber-500 text-center uppercase tracking-[0.5em] animate-pulse">
            Initializing_Tree_Database...
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-40">
          <button
            onClick={() => router.push('/create/armory')}
            className="w-full bg-white text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all active:scale-95 border-b-4 border-zinc-400"
          >
            {treeNotFound ? t('skipStep') : t('confirmTraining')}
          </button>
        </div>
      </main>
    );
  }

  // Tree view (a tree is selected)
  const maxRow = currentTree.talents.length > 0 ? Math.max(...currentTree.talents.map(tal => tal.row)) : 0;

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">

      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={handleBackToTreeBrowser} className="w-11 h-11 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-11 h-11 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">6</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">TRAINING_CENTER</h1>
            </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-emerald-500 font-bold tracking-widest">{availableXP} XP</div>
            <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={6} />
      <CharacterPreview />

      <div className="mb-8 border-l-2 border-amber-500 pl-4 py-1">
          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Active_Tree</div>
          <div className="text-lg font-black text-white italic uppercase tracking-tight">{currentTree.specialization}</div>
      </div>

      <div className="space-y-4 pb-32 overflow-x-auto">
        {Array.from({ length: maxRow }, (_, i) => i + 1).map(rowIndex => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 min-w-[800px] md:min-w-0">
                {[1, 2, 3, 4].map(colIndex => {
                    const talent = currentTree.talents.find(tal => tal.row === rowIndex && tal.col === colIndex);
                    if (!talent) return <div key={colIndex} className="invisible"></div>;

                    const talentKey = `${rowIndex}-${colIndex}`;
                    const tid = talentId(currentTree, talent);
                    const isOwned = ownedTalents.some(ot => ot.id === tid);
                    const ownedEntry = ownedTalents.find(ot => ot.id === tid);
                    const isSelected = selectedTalentKey === talentKey;
                    const cost = talent.cost;
                    const hasTopConnection = talent.connections?.includes('top');
                    const isUnlocked = canPurchase(talent);
                    const canRebuy = talent.isRanked && isOwned;

                    return (
                        <div key={`${rowIndex}-${colIndex}`} className="relative flex flex-col items-center">
                            {hasTopConnection && (
                                <div className="absolute -top-4 h-4 w-0.5 bg-zinc-700 z-0"></div>
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
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                      </div>
                                    )}
                                </div>

                                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3">
                                    {talent.description || "Passiv"}
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
        ))}
      </div>

      <HolocronGuide
        title="TALENT_BAUM"
        description="Talente sind passive Boni oder aktive Fähigkeiten, die deinen Charakter einzigartig machen. Du kaufst sie mit XP von oben nach unten frei. 'Ranked' Talente können mehrfach gekauft werden."
        advice="Konzentriere dich am Anfang auf Talente, die deine Kernkompetenz stärken. Wenn du ein Kämpfer bist, such nach 'Toughened' oder 'Grit'. Die Kosten steigen pro Zeile um 5 XP. Wähle weise!"
      />

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-40">
          <button
            onClick={handleConfirm}
            className="w-full bg-white text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all active:scale-95 border-b-4 border-zinc-400"
          >
            {t('confirmTraining')}
          </button>
      </div>

    </main>
  );
};

export default TalentSelector;
