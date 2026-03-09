'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import careersData from '@/../data/json/careers.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

interface Specialization {
  name: string;
  description?: string;
  skills: string[];
}

interface Career {
  name: string;
  description?: string;
  careerSkills: string[];
  forceRating: number;
  specializations: Specialization[];
}

const CareerSelector: React.FC = () => {
  const router = useRouter();
  const { setCareer, setSpecialization } = useCharacterStore();
  
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = (c: Career, s: Specialization) => {
    setCareer(c);
    setSpecialization(s);
    router.push('/create/background');
  };

  const filteredCareers = (careersData as Career[]).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specializations.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/create')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">2</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">CAREER_MATRIX</h1>
            </div>
        </div>
        <div className="text-right pl-4">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Select_Path</div>
        </div>
      </header>

      <ProgressTracker currentStep={2} />

      <div className="mb-6 sticky top-[65px] bg-black z-20 pb-4">
        <input 
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl"
          placeholder="FILTER_MATRIX..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
        {filteredCareers.map((c) => {
          const isSelected = selectedCareer === c.name;
          return (
            <div 
              key={c.name}
              onClick={() => setSelectedCareer(isSelected ? null : c.name)}
              className={`border transition-all duration-300 rounded-xl overflow-hidden cursor-pointer h-fit ${
                isSelected 
                  ? 'border-white bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40'
              }`}
            >
              <div className="p-4 relative">
                  {c.forceRating > 0 && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[6px] font-black px-2 py-0.5 uppercase tracking-widest rounded-bl-lg">
                          FORCE
                      </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{c.name}</h2>
                  </div>

                  {c.description && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans italic mb-3">{c.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-1">
                      {c.careerSkills.filter(s => s).slice(0, 4).map(skill => (
                          <span key={skill} className="text-[9px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold">{skill}</span>
                      ))}
                      {c.careerSkills.length > 4 && <span className="text-[9px] text-zinc-600 font-bold italic">+{c.careerSkills.length - 4}</span>}
                  </div>
              </div>

              {isSelected && (
                  <div className="bg-black/40 p-6 pt-0 animate-in slide-in-from-top-4 duration-500 space-y-6">
                      <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-4 border-t border-zinc-900 pt-6 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                          Select_Specialization_Path
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                          {c.specializations.map((spec) => {
                            const isSpecSelected = selectedSpec === spec.name;
                            return (
                                <div 
                                    key={spec.name}
                                    onClick={(e) => { e.stopPropagation(); setSelectedSpec(isSpecSelected ? null : spec.name); }}
                                    className={`p-5 border rounded-2xl transition-all ${
                                        isSpecSelected 
                                        ? 'border-white bg-white/10 ring-1 ring-white shadow-inner' 
                                        : 'border-zinc-800 bg-zinc-950 active:border-zinc-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-md font-black text-white italic uppercase tracking-tight">{spec.name}</span>
                                        <div className="flex gap-1.5">
                                            {[1,2,3,4].map(i => <div key={i} className={`w-1 h-1 rounded-full ${isSpecSelected ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]' : 'bg-zinc-800'}`}></div>)}
                                        </div>
                                    </div>
                                    {spec.description && (
                                      <p className="text-[10px] text-zinc-500 font-sans italic mt-1.5 leading-relaxed">{spec.description}</p>
                                    )}
                                    
                                    {isSpecSelected && (
                                        <div className="animate-in fade-in duration-300 space-y-6 pt-5">
                                            <div className="grid grid-cols-2 gap-2">
                                                {spec.skills.map(s => (
                                                    <div key={s} className="text-[9px] text-zinc-400 bg-black/60 border border-zinc-800/40 p-2.5 rounded flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                                        {s.toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleConfirm(c, spec); }}
                                                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-xl uppercase italic tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
                                            >
                                                Authorize_Specialization_→
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                          })}
                      </div>
                  </div>
              )}
            </div>
          );
        })}
      </div>

      <HolocronGuide 
        title="KARRIERE_PFAD" 
        description="Deine Karriere und Spezialisierung definieren deine 'Career Skills'. Das sind Fähigkeiten, die du kostengünstiger steigern kannst. Jede Karriere bietet unterschiedliche Schwerpunkte – von Kampf über Technik bis hin zur Diplomatie."
        advice="Wähle eine Spezialisierung, die deine Spezies-Werte ergänzt. Ein 'Smuggler' braucht Agility und Cunning, während ein 'Guardian' eher auf Brawn und Willpower setzt. Keine Sorge, du bist nicht auf diese Skills festgelegt, sie sind nur dein Startpunkt!"
      />
    </main>
  );
};

export default CareerSelector;
