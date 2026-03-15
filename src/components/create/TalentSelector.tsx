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
import TalentTreeGrid, { type TalentTreeData } from '@/components/shared/TalentTreeGrid';
import type { Talent } from '@/types/character';

const TalentSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, buyTalent } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { specializations, availableXP, ownedTalents } = activePlayer;

  const allTrees = talentsData as TalentTreeData[];
  const [currentTree, setCurrentTree] = useState<TalentTreeData | null>(null);
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

  const handleBackToTreeBrowser = () => {
    playNavigate();
    setCurrentTree(null);
    setTreeNotFound(true);
  };

  const handlePurchase = (talentObj: Talent) => {
    if (availableXP < talentObj.xpCost) {
      playError();
      return;
    }
    playXPSpend();
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
    const grouped: Record<string, TalentTreeData[]> = {};
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
                        key={`${tr.career}-${tr.specialization}`}
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

      <div className="pb-32">
        <TalentTreeGrid
          tree={currentTree}
          ownedTalents={ownedTalents}
          availableXP={availableXP}
          onPurchase={handlePurchase}
          mode="creation"
        />
      </div>

      <HolocronGuide
        sectionKey="talents"
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
