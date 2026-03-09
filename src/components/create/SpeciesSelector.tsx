'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import speciesData from '@/../data/json/species_raw.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

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
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SpeciesSelector: React.FC = () => {
  const router = useRouter();
  const setSpecies = useCharacterStore((state) => state.setSpecies);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = (s: Species) => {
    setSpecies(s);
    router.push('/create/career');
  };

  const filteredSpecies = (speciesData as Species[]).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">1</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">DATA_BASE: SPEZIES</h1>
            </div>
        </div>
        <div className="text-right pl-2">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Select_Origin</div>
        </div>
      </header>

      <ProgressTracker currentStep={1} />

      <div className="mb-6 sticky top-[65px] bg-black z-20 pb-4">
        <input 
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl"
          placeholder="FILTER_BY_NAME..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
        {filteredSpecies.map((s) => {
          const isSelected = selectedSpecies === s.name;
          return (
            <div 
              key={s.name}
              onClick={() => setSelectedSpecies(isSelected ? null : s.name)}
              className={`group border transition-all duration-300 rounded-xl overflow-hidden cursor-pointer h-fit ${
                isSelected 
                  ? 'border-white bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40'
              }`}
            >
              <div className="aspect-[4/3] bg-zinc-950 relative flex items-end border-b border-zinc-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/species/${slugify(s.name)}.jpg`}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <h2 className="relative z-10 px-4 pb-3 text-base font-black text-white italic tracking-tighter uppercase leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{s.name}</h2>
              </div>

              <div className="p-4 space-y-3">
                  {s.description && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans italic">{s.description}</p>
                  )}
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                      <span>Start XP</span>
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
                          <div className="space-y-3">
                              <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                  Traits_Analysis
                              </div>
                              <ul className="space-y-4">
                                  {s.abilities.map((a, i) => (
                                      <li key={i} className="text-xs text-zinc-400 leading-relaxed pl-4 border-l-2 border-amber-500/20 font-sans italic">{a}</li>
                                  ))}
                              </ul>
                          </div>
                          
                          <button 
                              onClick={(e) => { e.stopPropagation(); handleConfirm(s); }}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-5 rounded-2xl uppercase italic tracking-widest text-xs shadow-2xl active:scale-95 transition-all mt-4"
                          >
                              Authorize_Identity_→
                          </button>
                      </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <HolocronGuide 
        title="SPEZIES_WAHL" 
        description="Deine Spezies bestimmt deine biologischen Grundlagen. Brawn (BR) ist Stärke, Agility (AG) ist Geschick, Intellect (IN) ist Wissen, Cunning (CU) ist List, Willpower (WL) ist Wille und Presence (PR) ist Ausstrahlung."
        advice="Wähle eine Spezies, die zu deiner Spielidee passt. Ein Droide ist super für Technik, ein Wookiee fürs Grobe. Die Start-XP kannst du später nutzen, um deine Werte noch weiter zu steigern!"
      />
    </main>
  );
};

export default SpeciesSelector;
