'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import talentsData from '@/../data/json/talents_connected.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

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
  
  const [currentTree, setCurrentTree] = useState<TalentTree | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);

  useEffect(() => {
    if (specializations.length > 0) {
      const specName = specializations[0].name;
      const tree = (talentsData as TalentTree[]).find(t => 
        t.specialization.toLowerCase().includes(specName.toLowerCase()) ||
        specName.toLowerCase().includes(t.specialization.toLowerCase())
      );
      if (tree) setCurrentTree(tree);
    }
  }, [specializations]);

  const handleConfirm = () => {
    router.push('/create/armory');
  };

  const handleBuy = (t: Talent) => {
    buyTalent(t.name, t.row * 5);
  };

  if (!currentTree) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center text-amber-500 font-mono p-12 text-center uppercase tracking-[0.5em] animate-pulse">
        Initializing_Tree_Database...
      </div>
    );
  }

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-4 items-center">
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">4</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">TRAINING_CENTER</h1>
            </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-emerald-500 font-bold tracking-widest">{availableXP} XP</div>
            <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={4} />

      <div className="mb-8 border-l-2 border-amber-500 pl-4 py-1">
          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Active_Tree</div>
          <div className="text-lg font-black text-white italic uppercase tracking-tight">{currentTree.specialization}</div>
      </div>

      <div className="space-y-6 pb-32">
        {currentTree.talents.map((t) => {
            const isOwned = ownedTalents.includes(t.name);
            const isSelected = selectedTalent === t.name;
            const cost = t.row * 5;

            return (
              <div 
                key={`${t.row}-${t.col}-${t.name}`}
                onClick={() => setSelectedTalent(isSelected ? null : t.name)}
                className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                  isSelected 
                    ? 'border-white bg-white/[0.05] shadow-[0_0_40px_rgba(255,255,255,0.1)] scale-[1.02]' 
                    : isOwned
                      ? 'border-emerald-500/50 bg-emerald-500/[0.02]'
                      : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
                }`}
              >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className={`text-xl font-black italic uppercase tracking-tighter ${isOwned ? 'text-emerald-400' : 'text-white'}`}>
                                    {t.name}
                                </h2>
                                {isOwned && <span className="text-[7px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-sm font-black">ACTIVE</span>}
                            </div>
                            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                                Tier_0{t.row} // Row_{t.row}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-amber-500 italic">{cost}XP</div>
                        </div>
                    </div>

                    {isSelected && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-black/40 p-4 rounded-xl space-y-4 shadow-inner">
                                <p className="text-xs leading-relaxed text-zinc-400 font-sans italic selection:bg-amber-500/30">
                                    {t.description || "Taktische Daten werden dekomprimiert... [Keine Beschreibung gefunden]"}
                                </p>

                                {!isOwned ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleBuy(t); }}
                                        disabled={availableXP < cost}
                                        className={`w-full py-4 rounded-xl uppercase font-black italic tracking-widest text-xs transition-all ${
                                            availableXP >= cost 
                                            ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/30 active:scale-95' 
                                            : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                                        }`}
                                    >
                                        {availableXP >= cost ? 'Authorize_Training_+' : 'XP_Insufficient_Units'}
                                    </button>
                                ) : (
                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center py-4 text-[10px] font-black uppercase tracking-widest italic rounded-xl">
                                        Skill_Fully_Integrated
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            );
        })}
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
