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
  }, [specializations, allTrees]);

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/armory');
  };

  const canPurchase = (t: Talent): boolean => {
    if (t.row === 1) return true;
    if (!currentTree) return false;
    // Check if any talent in the row above that connects down to this talent is owned
    const aboveRow = currentTree.talents.filter(above =>
      above.row === t.row - 1 && above.col === t.col && above.connections?.includes('bottom')
    );
    // Also check if this talent has a 'top' connection and the talent above is owned
    if (t.connections?.includes('top')) {
      const directAbove = currentTree.talents.find(above => above.row === t.row - 1 && above.col === t.col);
      if (directAbove && ownedTalents.some(ot => ot.name === directAbove.name)) return true;
    }
    return aboveRow.some(above => ownedTalents.some(ot => ot.name === above.name));
  };

  const handleBuy = (t: Talent) => {
    playXPSpend();
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

  if (!currentTree) {
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
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4">
            <div className="text-amber-500 text-sm font-black uppercase tracking-widest">Kein Talentbaum gefunden</div>
            <p className="text-zinc-500 text-xs max-w-md">
              Für die gewählte Spezialisierung{specializations.length > 0 ? ` "${specializations[0].name}"` : ''} wurde kein passender Talentbaum gefunden. Du kannst diesen Schritt überspringen und später Talente wählen.
            </p>
            <select
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-4 py-3 w-full max-w-sm focus:border-amber-500 outline-none"
              onChange={(e) => {
                const tree = allTrees.find(t => t.specialization === e.target.value);
                if (tree) { setCurrentTree(tree); setTreeNotFound(false); }
              }}
              defaultValue=""
            >
              <option value="" disabled>Talentbaum manuell wählen...</option>
              {allTrees.map(t => (
                <option key={t.specialization} value={t.specialization}>
                  {t.career} → {t.specialization}
                </option>
              ))}
            </select>
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
            {treeNotFound ? 'Überspringen_→' : 'Confirm_Training_Data_→'}
          </button>
        </div>
      </main>
    );
  }

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
        {/* Render as a Grid based on Rows */}
        {Array.from({ length: Math.max(...currentTree.talents.map(t => t.row)) }, (_, i) => i + 1).map(rowIndex => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 min-w-[800px] md:min-w-0">
                {[1, 2, 3, 4].map(colIndex => {
                    const talent = currentTree.talents.find(t => t.row === rowIndex && t.col === colIndex);
                    if (!talent) return <div key={colIndex} className="invisible"></div>;

                    const talentKey = `${rowIndex}-${colIndex}`;
                    const isOwned = ownedTalents.some(ot => ot.name === talent.name);
                    const isSelected = selectedTalentKey === talentKey;
                    const cost = talent.row * 5;
                    const hasTopConnection = talent.connections?.includes('top');
                    const isUnlocked = canPurchase(talent);

                    return (
                        <div key={`${rowIndex}-${colIndex}`} className="relative flex flex-col items-center">
                            {/* Connection Line */}
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
                                    {isOwned && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
                                </div>

                                <p className="text-[9px] text-zinc-500 leading-snug line-clamp-3">
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

                                {/* Buy Button Overlay */}
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
            Confirm_Training_Data_→
          </button>
      </div>

    </main>
  );
};

export default TalentSelector;
