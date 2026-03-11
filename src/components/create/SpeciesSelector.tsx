'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import speciesData from '@/../data/json/species_raw.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import IdentityModal from './IdentityModal';
import SwipeCards from '@/components/ui/SwipeCards';
import { playConfirm, playClick } from '@/lib/sounds';
import { t } from '@/lib/i18n';

interface Subspecies {
  name: string;
  description: string;
  freeSkillRanks: Record<string, number>;
  abilities: string[];
}

interface Species {
  name: string;
  description?: string;
  startingXP: number;
  characteristics: {
    brawn: number;
    agility: number;
    intellect: number;
    cunning: number;
    willpower: number;
    presence: number;
  };
  woundThresholdBase: number;
  strainThresholdBase: number;
  abilities: string[];
  subspecies?: Subspecies[];
  freeSkillRanks?: Record<string, number>;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type ViewMode = 'swipe' | 'grid';

const SpeciesSelector: React.FC = () => {
  const router = useRouter();
  const setSpecies = useCharacterStore((state) => state.setSpecies);
  const updateActivePlayer = useCharacterStore((state) => state.updateActivePlayer);

  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [selectedSubspecies, setSelectedSubspecies] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Identity Modal state
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [pendingSpecies, setPendingSpecies] = useState<Species | null>(null);

  // View mode tracking for auto-expand behavior
  const [viewMode, setViewMode] = useState<ViewMode>('swipe');

  const filteredSpecies = (speciesData as Species[]).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = useCallback((s: Species) => {
    playConfirm();

    // If species has subspecies, merge the selected subspecies data
    let speciesPayload: any = s;
    if (s.subspecies && s.subspecies.length > 0) {
      const sub = s.subspecies.find(ss => ss.name === selectedSubspecies);
      if (!sub) return;

      const mergedSkillRanks = { ...(s.freeSkillRanks || {}), ...sub.freeSkillRanks };
      const mergedAbilities = [...s.abilities, `[${sub.name}]`, ...sub.abilities];

      speciesPayload = {
        ...s,
        abilities: mergedAbilities,
        freeSkillRanks: mergedSkillRanks,
        selectedSubspecies: sub.name,
      };
    }

    // Save species to store, then show identity modal
    setSpecies(speciesPayload);
    setPendingSpecies(speciesPayload);
    setShowIdentityModal(true);
  }, [selectedSubspecies, setSpecies]);

  const handleIdentityConfirm = useCallback((name: string, age: number | null, backgroundStory: string) => {
    updateActivePlayer({ name, age, backgroundStory });
    setShowIdentityModal(false);
    router.push('/create/career');
  }, [updateActivePlayer, router]);

  const handleIdentityClose = useCallback(() => {
    setShowIdentityModal(false);
    setPendingSpecies(null);
  }, []);

  const hasSubspecies = (s: Species) => s.subspecies && s.subspecies.length > 0;

  const canConfirm = (s: Species) => {
    if (!hasSubspecies(s)) return true;
    return selectedSubspecies !== null;
  };

  // Auto-expand in swipe mode: set selected species to the active card
  const handleActiveIndexChange = useCallback((index: number) => {
    if (viewMode === 'swipe' && filteredSpecies[index]) {
      setSelectedSpecies(filteredSpecies[index].name);
      setSelectedSubspecies(null);
    }
  }, [viewMode, filteredSpecies]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    // When switching to grid, collapse all cards
    if (mode === 'grid') {
      setSelectedSpecies(null);
      setSelectedSubspecies(null);
    }
    // When switching to swipe, the onActiveIndexChange will auto-expand
  }, []);

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">

      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">1</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">{t('speciesHeader')}</h1>
            </div>
        </div>
        <div className="text-right pl-2">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">{t('selectOrigin')}</div>
        </div>
      </header>

      <ProgressTracker currentStep={1} />

      <div className="mb-6 sticky top-[65px] bg-black z-20 pb-4">
        <input
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl"
          placeholder={t('filterSpecies')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <SwipeCards
        onActiveIndexChange={handleActiveIndexChange}
        onViewModeChange={handleViewModeChange}
      >
        {filteredSpecies.map((s) => {
          const isSelected = selectedSpecies === s.name;
          return (
            <div
              key={s.name}
              onClick={() => {
                if (viewMode === 'grid') {
                  playClick();
                  setSelectedSpecies(isSelected ? null : s.name);
                  setSelectedSubspecies(null);
                }
              }}
              className={`group border transition-all duration-300 rounded-xl overflow-hidden ${viewMode === 'grid' ? 'cursor-pointer' : ''} h-fit ${
                isSelected
                  ? 'border-white bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40'
              }`}
            >
              {/* Portrait with scan effect */}
              <div className="aspect-[4/3] bg-zinc-950 relative flex items-end border-b border-zinc-900 overflow-hidden card-scan">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/species/${slugify(s.name)}.jpg`}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="relative z-10 px-4 pb-3 flex items-end gap-2">
                    <h2 className="text-base font-black text-white italic tracking-tighter uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{s.name}</h2>
                    {hasSubspecies(s) && (
                      <span className="text-[7px] text-cyan-400 font-black uppercase tracking-widest px-1.5 py-0.5 border border-cyan-500/30 rounded bg-cyan-500/10 mb-0.5">
                        {s.subspecies!.length} {t('subspecies')}
                      </span>
                    )}
                  </div>
              </div>

              <div className="p-4 space-y-3">
                  {s.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{s.description}</p>
                  )}
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                      <span>{t('startXP')}</span>
                      <span className="text-amber-500 text-sm">{s.startingXP}</span>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                      {Object.entries(s.characteristics).map(([stat, val]) => (
                          <div key={stat} className="bg-black/40 border border-zinc-900 py-1 rounded flex flex-col items-center">
                              <span className="text-xs font-bold text-white">{val}</span>
                              <span className="text-[5px] text-zinc-600 uppercase font-black tracking-tighter">{stat.substring(0, 3)}</span>
                          </div>
                      ))}
                  </div>

                  {isSelected && (
                      <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 pt-6 border-t border-zinc-900 mt-2">
                          <div className="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 font-black uppercase tracking-widest text-center">
                              <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg">Wounds: {s.woundThresholdBase}+BR</div>
                              <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg">Strain: {s.strainThresholdBase}+WL</div>
                          </div>

                          {/* Base Abilities */}
                          {s.abilities.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                  {t('traitsAnalysis')}
                              </div>
                              <ul className="space-y-4">
                                  {s.abilities.map((a, i) => (
                                      <li key={i} className="text-xs text-zinc-400 leading-relaxed pl-4 border-l-2 border-amber-500/20 font-sans italic">{a}</li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {/* Subspecies Selection */}
                          {hasSubspecies(s) && (
                            <div className="space-y-3">
                              <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                {t('selectSubspecies')}
                              </div>
                              <div className="space-y-2">
                                {s.subspecies!.map((sub) => {
                                  const isSubSelected = selectedSubspecies === sub.name;
                                  return (
                                    <div
                                      key={sub.name}
                                      onClick={(e) => { e.stopPropagation(); playClick(); setSelectedSubspecies(isSubSelected ? null : sub.name); }}
                                      className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                                        isSubSelected
                                          ? 'border-cyan-500 bg-cyan-500/[0.08] shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                                          : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* Portrait */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-950">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={`/species/${slugify(s.name)}-${slugify(sub.name)}.jpg`}
                                            alt={sub.name}
                                            className="w-full h-full object-cover object-top"
                                            onError={(e) => {
                                              const img = e.target as HTMLImageElement;
                                              if (!img.dataset.fallback) {
                                                img.dataset.fallback = '1';
                                                img.src = `/species/${slugify(s.name)}.jpg`;
                                              } else {
                                                img.style.display = 'none';
                                              }
                                            }}
                                          />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[11px] font-black uppercase tracking-tight ${isSubSelected ? 'text-cyan-400' : 'text-white'}`}>
                                              {sub.name}
                                            </span>
                                            {isSubSelected && (
                                              <span className="text-[6px] bg-cyan-500 text-black px-1.5 py-0.5 rounded font-black uppercase">{t('chosen')}</span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-2">{sub.description}</p>

                                          {/* Subspecies abilities (shown when selected) */}
                                          {isSubSelected && (
                                            <div className="space-y-1.5 mt-2 pt-2 border-t border-zinc-800 animate-in fade-in duration-300">
                                              {sub.abilities.map((a, i) => (
                                                <div key={i} className="text-[10px] text-cyan-300/70 font-sans italic pl-3 border-l border-cyan-500/30">{a}</div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {!selectedSubspecies && (
                                <div className="text-[9px] text-red-400/60 font-black uppercase tracking-widest text-center py-2 animate-pulse">
                                  {t('mustSelectSubspecies')}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                              onClick={(e) => { e.stopPropagation(); if (canConfirm(s)) handleConfirm(s); }}
                              disabled={!canConfirm(s)}
                              className={`w-full font-black py-5 rounded-2xl uppercase italic tracking-widest text-xs shadow-2xl transition-all mt-4 ${
                                canConfirm(s)
                                  ? 'bg-amber-600 hover:bg-amber-500 text-black active:scale-95'
                                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                              }`}
                          >
                              {!canConfirm(s) ? t('selectSubspeciesBtn') : t('authorizeIdentity')}
                          </button>
                      </div>
                  )}
              </div>
            </div>
          );
        })}
      </SwipeCards>

      <HolocronGuide
        title={t('holocronSpecies')}
        description={t('holocronSpeciesDesc')}
        advice={t('holocronSpeciesAdvice')}
      />

      {/* Identity Modal — shown after species confirm */}
      {showIdentityModal && pendingSpecies && (
        <IdentityModal
          speciesName={pendingSpecies.name}
          onConfirm={handleIdentityConfirm}
          onClose={handleIdentityClose}
        />
      )}
    </main>
  );
};

export default SpeciesSelector;
