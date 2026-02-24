'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import speciesData from '../../../data/json/species_raw.json';
import { useCharacterStore } from '../../store/characterStore';

interface Species {
  name: string;
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

const SpeciesSelector: React.FC = () => {
  const router = useRouter();
  const setSpecies = useCharacterStore((state) => state.setSpecies);
  
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = () => {
    if (selectedSpecies) {
      setSpecies(selectedSpecies);
      // Weiter zur nächsten Seite (Karriere)
      router.push('/create/career');
    }
  };

  const filteredSpecies = (speciesData as Species[]).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar: List */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900">
          <h2 className="text-xl font-bold text-amber-400 mb-2">SPEZIES WÄHLEN</h2>
          <input 
            type="text" 
            placeholder="Suchen..." 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-amber-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredSpecies.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedSpecies(s)}
              className={`w-full text-left px-4 py-3 rounded transition-colors ${
                selectedSpecies?.name === s.name 
                  ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">{s.name}</div>
              <div className="text-xs opacity-60">{s.startingXP} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Details */}
      <div className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {selectedSpecies ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            <header className="border-b border-slate-800 pb-6">
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">{selectedSpecies.name.toUpperCase()}</h1>
              <div className="flex gap-4 text-sm font-mono text-amber-500/80">
                <span>START-XP: {selectedSpecies.startingXP}</span>
                <span>•</span>
                <span>WUNDEN: {selectedSpecies.woundThresholdBase} + BRAWN</span>
                <span>•</span>
                <span>ERSCHÖPFUNG: {selectedSpecies.strainThresholdBase} + WILL</span>
              </div>
            </header>

            {/* Characteristics Grid */}
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(selectedSpecies.characteristics).map(([stat, value]) => (
                <div key={stat} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">{stat}</div>
                </div>
              ))}
            </div>

            {/* Abilities */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-4 uppercase tracking-widest text-xs">Spezies-Fähigkeiten</h3>
              <ul className="space-y-3">
                {selectedSpecies.abilities.map((ability, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-300 leading-relaxed">
                    <span className="text-amber-500 mt-1">›</span>
                    {ability}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-8">
              <button 
                onClick={handleConfirm}
                className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded uppercase tracking-wide transition-transform active:scale-95"
              >
                {selectedSpecies.name} Bestätigen
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">🧬</div>
              <p>Wähle eine Spezies aus der Datenbank</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeciesSelector;
