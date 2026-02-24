'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import careersData from '../../../data/json/careers.json';
import { useCharacterStore } from '../../store/characterStore';

interface Specialization {
  name: string;
  skills: string[];
}

interface Career {
  name: string;
  careerSkills: string[];
  forceRating: number;
  specializations: Specialization[];
}

const CareerSelector: React.FC = () => {
  const router = useRouter();
  const { setCareer, setSpecialization } = useCharacterStore();
  
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

  const handleConfirm = () => {
    if (selectedCareer && selectedSpec) {
      setCareer(selectedCareer);
      setSpecialization(selectedSpec);
      // Weiter zum Background
      router.push('/create/background');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Column 1: Careers List */}
      <div className="w-1/4 border-r border-slate-800 flex flex-col bg-slate-900">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-amber-400">KARRIERE</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {(careersData as Career[]).map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setSelectedCareer(c);
                setSelectedSpec(null); // Reset Spec on Career change
              }}
              className={`w-full text-left px-4 py-3 rounded transition-colors ${
                selectedCareer?.name === c.name 
                  ? 'bg-amber-900/30 text-amber-300 border border-amber-800/50' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">{c.name}</div>
              {c.forceRating > 0 && <span className="text-xs text-blue-400">Machtsensitiv</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Career Details & Specs */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-925">
        {selectedCareer ? (
          <>
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-3xl font-black text-white mb-2">{selectedCareer.name.toUpperCase()}</h1>
              <div className="text-sm text-slate-400 mb-4">
                Karriere-Fertigkeiten:
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCareer.careerSkills.filter(s => s).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-800 rounded text-xs text-amber-500/80 border border-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-900 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Spezialisierung wählen</h3>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {selectedCareer.specializations.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => setSelectedSpec(spec)}
                  className={`w-full text-left px-4 py-3 rounded transition-colors border ${
                    selectedSpec?.name === spec.name 
                      ? 'bg-amber-600 text-black border-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div>{spec.name}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 p-8 text-center">
            <p>Wähle links eine Karriere aus.</p>
          </div>
        )}
      </div>

      {/* Column 3: Summary & Confirm */}
      <div className="flex-1 p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col justify-between">
        {selectedSpec ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">
                {selectedSpec.name}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2">Bonus-Fertigkeiten</h4>
                  <ul className="space-y-2">
                    {selectedSpec.skills.map(skill => (
                      <li key={skill} className="flex items-center gap-2 text-emerald-400">
                        <span className="text-xs">Checking...</span> {skill}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 mt-4 italic">
                    Du erhältst je 1 kostenlosen Rang in diesen Fertigkeiten (oder in den Karriere-Fertigkeiten).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={handleConfirm}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 px-8 rounded uppercase tracking-wide transition-all hover:scale-[1.02] shadow-lg shadow-amber-900/20"
              >
                Karriere Bestätigen
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-700 opacity-50">
            <div className="text-9xl">⚖️</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSelector;
