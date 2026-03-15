'use client';

import React, { useState, useCallback, useMemo } from 'react';
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

  const filteredSpecies = useMemo(() =>
    (speciesData as Species[]).filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const handleConfirm = useCallback((s: Species) => {
    playConfirm();

    // If species has subspecies, merge the selected subspecies data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let speciesPayload: any = s; // Species + optional selectedSubspecies for store
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
    <main className="h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col safe-area-top safe-area-fixed">

      {/* FIXED HEADER — does not scroll */}
      <div className="shrink-0 px-5 pt-4 pb-3 bg-black z-30 border-b border-zinc-800/50">
        <header className="flex justify-between items-center mb-3">
          <div className="flex gap-3 items-center">
              <button onClick={() => router.push('/')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
              <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">1</div>
              <h1 className="text-lg font-black text-white italic tracking-tighter uppercase">{t('speciesHeader')}</h1>
          </div>
          <div className="text-[9px] text-amber-500 font-bold tracking-widest uppercase">{t('selectOrigin')}</div>
        </header>

        <ProgressTracker currentStep={1} />

        <input
          className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-lg mt-3"
          placeholder={t('filterSpecies')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CARDS AREA — grid scrolls, swipe doesn't (touch conflict) */}
      <div className={`flex-1 min-h-0 px-4 pt-3 ${viewMode === 'grid' ? 'overflow-y-auto' : 'overflow-visible'}`}>
      <SwipeCards
        onActiveIndexChange={handleActiveIndexChange}
        onViewModeChange={handleViewModeChange}
      >
        {filteredSpecies.map((s) => {
          // In swipe mode: active card is always expanded. In grid: expand on tap.
          const isExpanded = viewMode === 'swipe' || selectedSpecies === s.name;
          return (
            <div
              key={s.name}
              onClick={() => {
                if (viewMode === 'grid') {
                  playClick();
                  setSelectedSpecies(selectedSpecies === s.name ? null : s.name);
                  setSelectedSubspecies(null);
                }
              }}
              className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${viewMode === 'grid' ? 'cursor-pointer' : ''} h-fit ${
                isExpanded
                  ? 'border-amber-500/30 bg-zinc-950'
                  : 'border-zinc-700/40 bg-zinc-950 hover:border-zinc-600/50'
              }`}
            >
              {/* DOSSIER CARD — Square portrait with overlaid info */}
              <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                {/* Portrait */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/species/${slugify(s.name)}.jpg`}
                  alt={s.name}
                  loading="lazy"
                  width={600}
                  height={600}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />

                {/* Top: Name */}
                <div className="absolute top-0 left-0 right-0 p-2.5 bg-gradient-to-b from-black/80 to-transparent z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-black text-white italic tracking-tight uppercase leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{s.name}</h2>
                      {hasSubspecies(s) && (
                        <span className="text-[5px] text-cyan-400 font-black uppercase tracking-widest mt-0.5 inline-block">
                          {s.subspecies!.length} {t('subspecies')}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-500 text-xs font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{s.startingXP} XP</span>
                  </div>
                </div>

                {/* Bottom: Attributes */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2.5 pt-6 z-10">
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(s.characteristics).map(([stat, val]) => (
                      <div key={stat} className="bg-black/50 backdrop-blur-sm border border-zinc-700/30 py-1 rounded flex flex-col items-center">
                        <span className="text-lg font-black text-white leading-none">{val}</span>
                        <span className="text-[7px] text-zinc-400 uppercase font-bold tracking-wide">{stat.substring(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                  {isExpanded && (
                      <div className="animate-in fade-in duration-300 px-3 pb-3 space-y-2">
                          {/* Description */}
                          {s.description && (
                            <p className="text-[11px] text-zinc-400 leading-snug font-sans pt-2">{s.description}</p>
                          )}

                          {/* Abilities */}
                          {s.abilities.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[7px] text-amber-500/70 font-black uppercase tracking-[0.15em]">
                                {t('traitsAnalysis')}
                              </div>
                              {s.abilities.map((a, i) => (
                                <div key={i} className="bg-zinc-900/40 border border-zinc-800/20 rounded px-2.5 py-1.5">
                                  <p className="text-[10px] text-zinc-300 leading-snug font-sans">{a}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Subspecies Selection */}
                          {hasSubspecies(s) && (
                            <div className="space-y-2">
                              <div className="text-[9px] text-cyan-400/80 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                                {t('selectSubspecies')}
                              </div>
                              <div className="space-y-2">
                                {s.subspecies!.map((sub) => {
                                  const isSubSelected = selectedSubspecies === sub.name;
                                  return (
                                    <div
                                      key={sub.name}
                                      onClick={(e) => { e.stopPropagation(); playClick(); setSelectedSubspecies(isSubSelected ? null : sub.name); }}
                                      className={`border rounded-xl p-2.5 cursor-pointer transition-all duration-200 ${
                                        isSubSelected
                                          ? 'border-cyan-500/50 bg-cyan-500/[0.06] shadow-[0_0_12px_rgba(34,211,238,0.1)]'
                                          : 'border-zinc-800/60 bg-black/40 hover:border-zinc-700'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2.5">
                                        {/* Portrait */}
                                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-zinc-800/60 flex-shrink-0 bg-zinc-950">
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
                                          <p className="text-[10px] text-zinc-400 font-sans leading-snug">{sub.description}</p>

                                          {/* Subspecies abilities (shown when selected) */}
                                          {isSubSelected && (
                                            <div className="space-y-1 mt-1.5 pt-1.5 border-t border-zinc-800/50 animate-in fade-in duration-300">
                                              {sub.abilities.map((a, i) => (
                                                <div key={i} className="text-[10px] text-cyan-300/60 font-sans pl-2.5 border-l border-cyan-500/20">{a}</div>
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
                                <div className="text-[8px] text-red-400/50 font-black uppercase tracking-widest text-center py-1.5 animate-pulse">
                                  {t('mustSelectSubspecies')}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                              onClick={(e) => { e.stopPropagation(); if (canConfirm(s)) handleConfirm(s); }}
                              disabled={!canConfirm(s)}
                              className={`w-full font-black py-3.5 rounded-xl uppercase italic tracking-widest text-[11px] shadow-xl transition-all mt-2 ${
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
          );
        })}
      </SwipeCards>
      </div>

      <HolocronGuide
        sectionKey="species"
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
