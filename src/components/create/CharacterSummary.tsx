'use client';

import React, { useState } from 'react';
import { useCharacterStore } from '../../store/characterStore';

const CharacterSummary: React.FC = () => {
  const { 
    species, 
    career, 
    specialization, 
    characteristics,
    availableXP,
    name,
    setName
  } = useCharacterStore();

  const [isEditingName, setIsEditingName] = useState(false);

  // Berechne abgeleitete Werte (einfache Logik für den Anfang)
  const woundThreshold = species ? species.woundThresholdBase + characteristics.brawn : 0;
  const strainThreshold = species ? species.strainThresholdBase + characteristics.willpower : 0;
  const soak = characteristics.brawn; // Rüstung fehlt noch
  const defense = 0; // Rüstung fehlt noch

  // Sammle alle Skills (Karriere + Spezialisierung)
  // Achtung: Das ist nur eine Anzeige, noch keine echten Ränge
  const allSkills = new Set([
    ...(career?.careerSkills || []),
    ...(specialization?.skills || [])
  ]);

  if (!species || !career) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-500">
        <p>Daten fehlen. Bitte beginne von vorne.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto grid grid-cols-12 gap-8">
        
        {/* Header / Identity Card */}
        <div className="col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center shadow-2xl">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Identität</div>
            {isEditingName ? (
              <input 
                autoFocus
                className="bg-transparent text-4xl font-black text-white border-b border-amber-500 outline-none w-full"
                value={name}
                placeholder="NAMEN EINGEBEN..."
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
              />
            ) : (
              <h1 
                className="text-4xl font-black text-white cursor-pointer hover:text-amber-400 transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {name || "NAMENLOSER HELD"} <span className="text-xs align-top opacity-30">✎</span>
              </h1>
            )}
            <div className="flex gap-4 mt-2 text-amber-500 font-mono text-sm">
              <span className="uppercase">{species.name}</span>
              <span>/</span>
              <span className="uppercase">{career.name}</span>
              <span>/</span>
              <span className="uppercase text-white font-bold">{specialization?.name}</span>
            </div>
          </div>
          
          <div className="text-right">
             <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Verfügbare Erfahrung</div>
             <div className="text-4xl font-mono font-bold text-emerald-400">{availableXP} XP</div>
          </div>
        </div>

        {/* Left Column: Stats & Vitals */}
        <div className="col-span-4 space-y-6">
          
          {/* Characteristics Hexagon/Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-6 text-center">Attribute</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(characteristics).map(([key, val]) => (
                <div key={key} className="flex flex-col items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  <span className="text-3xl font-bold text-white">{val}</span>
                  <span className="text-[10px] uppercase text-slate-400 mt-1">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs uppercase mb-1">
                <span className="text-red-400">Wunden</span>
                <span className="text-slate-500">{woundThreshold} Max</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500/80 w-0" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs uppercase mb-1">
                <span className="text-blue-400">Erschöpfung</span>
                <span className="text-slate-500">{strainThreshold} Max</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/80 w-0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 mt-4">
               <div className="text-center">
                 <div className="text-2xl font-bold text-slate-300">{soak}</div>
                 <div className="text-[10px] uppercase text-slate-500">Absorbierung</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-slate-300">{defense}</div>
                 <div className="text-[10px] uppercase text-slate-500">Verteidigung</div>
               </div>
            </div>
          </div>

        </div>

        {/* Right Column: Skills & Talents */}
        <div className="col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex gap-8 border-b border-slate-800 pb-4 mb-6">
            <button className="text-amber-400 font-bold border-b-2 border-amber-400 pb-4 -mb-4.5">FERTIGKEITEN</button>
            <button className="text-slate-500 hover:text-slate-300 pb-4 -mb-4.5">TALENTE</button>
            <button className="text-slate-500 hover:text-slate-300 pb-4 -mb-4.5">AUSRÜSTUNG</button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {Array.from(allSkills).sort().map(skill => (
              <div key={skill} className="flex justify-between items-center py-2 border-b border-slate-800/50 group hover:bg-slate-800/30 px-2 rounded">
                <span className="text-slate-300 group-hover:text-white transition-colors">{skill}</span>
                <div className="flex gap-1">
                  {/* Dice Pool Preview (Dummy) */}
                  <div className="w-3 h-3 bg-green-500 rounded-sm transform rotate-45"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm transform rotate-45"></div>
                  <div className="w-3 h-3 bg-yellow-500 border border-yellow-300 rounded-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Action */}
        <div className="col-span-12 flex justify-end">
           <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-12 rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-900/20 transform transition-all hover:scale-105 active:scale-95">
             Spiel Starten
           </button>
        </div>

      </div>
    </div>
  );
};

export default CharacterSummary;
