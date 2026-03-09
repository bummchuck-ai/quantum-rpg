'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import { ALL_SKILLS } from '@/lib/skills';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';

const SKILL_DATA = ALL_SKILLS;

const CHAR_LABELS: Record<string, string> = {
  brawn: 'STR', agility: 'GEW', intellect: 'INT',
  cunning: 'LST', willpower: 'WIL', presence: 'CHA'
};

const SkillSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, buySkill, refundSkill } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { career, specializations, availableXP, skillRanks, characteristics } = activePlayer;

  const [filter, setFilter] = useState<'all' | 'career' | 'general' | 'combat' | 'knowledge'>('all');

  const mainSpec = specializations[0];

  // Combine career + specialization skills
  const careerSkillKeys = new Set([
    ...(career?.careerSkills || []),
    ...(mainSpec?.skills || [])
  ]);

  const isCareerSkill = (skill: string) => careerSkillKeys.has(skill);

  const filteredSkills = SKILL_DATA.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'career') return isCareerSkill(s.key);
    return s.category === filter;
  });

  const handleConfirm = () => {
    router.push('/create/talents');
  };

  const totalSkillXPSpent = Object.entries(skillRanks || {}).reduce((total, [skill, rank]) => {
    const rankNum = rank as number;
    const freeRanks = activePlayer.species?.freeSkillRanks?.[skill] || 0;
    const paidRanks = Math.max(0, rankNum - freeRanks);
    const costPerRank = isCareerSkill(skill) ? 5 : 10;
    return total + (paidRanks * costPerRank);
  }, 0);

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
          <button onClick={() => router.push('/create/attributes')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
          <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">5</div>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">SKILL_MATRIX</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-emerald-500 font-bold tracking-widest">{availableXP} XP</div>
          <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={5} />
      <CharacterPreview />

      <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl mb-4">
        <p className="text-[10px] leading-relaxed text-zinc-500 uppercase tracking-wider">
          Investiere XP in Fertigkeiten. Karriere-Skills (grün markiert) kosten 5 XP pro Rang. Andere Skills kosten 10 XP. Maximum bei Erschaffung: Rang 2.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border border-zinc-900 bg-zinc-950 p-1 rounded-xl">
        {(['all', 'career', 'general', 'combat', 'knowledge'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all rounded-lg ${
              filter === f ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-700'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'career' ? 'Karriere' : f === 'general' ? 'Allgem.' : f === 'combat' ? 'Kampf' : 'Wissen'}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 pb-32">
        {filteredSkills.map(skill => {
          const rank = (skillRanks || {})[skill.key] || 0;
          const freeRanks = activePlayer.species?.freeSkillRanks?.[skill.key] || 0;
          const isCareer = isCareerSkill(skill.key);
          const cost = isCareer ? 5 : 10;
          const canBuy = rank < 2 && availableXP >= cost;
          const canRefund = rank > 0 && rank > freeRanks;
          const charValue = (characteristics as any)[skill.characteristic] || 2;

          return (
            <div
              key={skill.key}
              className={`border rounded-xl p-3 transition-all ${
                isCareer
                  ? 'border-emerald-900/50 bg-emerald-500/[0.03]'
                  : 'border-zinc-800 bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                      {skill.nameDE}
                    </span>
                    {isCareer && (
                      <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest px-1.5 py-0.5 border border-emerald-900/50 rounded">
                        Karriere
                      </span>
                    )}
                  </div>
                  {skill.description && (
                    <p className="text-[10px] text-zinc-500 font-sans italic mt-1 leading-relaxed">{skill.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] text-zinc-600 uppercase tracking-widest">
                      {CHAR_LABELS[skill.characteristic]} {charValue}
                    </span>
                    <span className="text-[7px] text-zinc-800">|</span>
                    <span className="text-[7px] text-zinc-600 uppercase tracking-widest">
                      {cost} XP/Rang
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Rank pips */}
                  <div className="flex gap-1">
                    {[1, 2].map(pip => (
                      <div
                        key={pip}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[8px] font-black transition-all ${
                          pip <= rank
                            ? pip <= freeRanks
                              ? 'border-cyan-500 bg-cyan-500/30 text-cyan-400'
                              : 'border-amber-500 bg-amber-500/30 text-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.3)]'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-800'
                        }`}
                      >
                        {pip}
                      </div>
                    ))}
                  </div>

                  {/* Refund button */}
                  <button
                    onClick={() => refundSkill(skill.key, isCareer)}
                    disabled={!canRefund}
                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                      canRefund
                        ? 'bg-red-900/30 border border-red-900/50 text-red-400 hover:bg-red-900/50 active:scale-90'
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-800 cursor-not-allowed'
                    }`}
                  >
                    −
                  </button>

                  {/* Buy button */}
                  <button
                    onClick={() => buySkill(skill.key, isCareer)}
                    disabled={!canBuy}
                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                      canBuy
                        ? 'bg-amber-600 hover:bg-amber-500 text-black active:scale-90'
                        : rank >= 2
                          ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                          : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                    }`}
                  >
                    {rank >= 2 ? '✓' : '+'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <HolocronGuide
        title="FERTIGKEITEN"
        description="Fertigkeiten bestimmen, wie gut dein Charakter bestimmte Aufgaben bewältigt. Jede Fertigkeit nutzt ein Attribut — je höher beides, desto mehr Würfel im Pool."
        advice="Karriere-Skills sind günstiger (5 XP statt 10). Investiere zuerst in die Skills, die zu deinem Spielstil passen. Piloten brauchen Steuern, Kämpfer Fernkampf oder Nahkampf, Schmuggler Täuschung und Szenekenntnis."
      />

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
        <button
          onClick={handleConfirm}
          className="w-full bg-white text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all active:scale-95 border-b-4 border-zinc-400"
        >
          Confirm_Skills_→
        </button>
      </div>
    </main>
  );
};

export default SkillSelector;
