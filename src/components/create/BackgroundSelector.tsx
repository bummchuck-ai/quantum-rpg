'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

const OBLIGATION_LIST = [
  "Schulden (Debt)", "Kopfgeld (Bounty)", "Erpressung (Blackmail)", "Familie", 
  "Sucht (Addiction)", "Verrat (Betrayal)", "Verbrechen (Criminal)", "Favor"
];
const DUTY_LIST = [
  "Kampfsiege", "Spionage", "Sabotage", "Rekrutierung", "Politische Unterstützung", 
  "Innere Sicherheit", "Ressourcenbeschaffung"
];
const MORALITY_LIST = [
  "Tapferkeit / Zorn", "Liebe / Eifersucht", "Vorsicht / Furcht", "Gnade / Schwäche", 
  "Stolz / Arroganz", "Neugier / Besessenheit"
];

const BackgroundSelector: React.FC = () => {
  const router = useRouter();
  const { career, setBackground, applyBackgroundBonus, backgroundBonus, backgroundType, backgroundOption } = useCharacterStore();
  
  const [suggestedType, setSuggestedType] = useState<'Obligation' | 'Duty' | 'Morality'>('Obligation');
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<string | null>(null);

  useEffect(() => {
    if (career) {
      if (career.forceRating > 0) setSuggestedType('Morality');
      else if (['Soldat', 'Kommandant', 'Klonkrieger', 'Ass'].includes(career.name)) setSuggestedType('Duty');
      else setSuggestedType('Obligation');
    }
  }, [career]);

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      let list = suggestedType === 'Duty' ? DUTY_LIST : suggestedType === 'Morality' ? MORALITY_LIST : OBLIGATION_LIST;
      const result = list[Math.floor(Math.random() * list.length)];
      setRollResult(result);
      setBackground(suggestedType, result, suggestedType === 'Morality' ? 50 : 10);
      setRolling(false);
    }, 1200);
  };

  const handleConfirm = () => {
    router.push('/create/talents');
  };

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-4 items-center">
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">3</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter">DESTINY_SCAN</h1>
            </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest">STEP 03/04</div>
        </div>
      </header>

      <ProgressTracker currentStep={3} />

      <div className="flex-1 flex flex-col gap-6">
        
        <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl">
           <p className="text-[10px] leading-relaxed text-zinc-500 uppercase tracking-wider">
             Jeder Held trägt eine Last. Ein Soldat hat seine Pflicht, ein Jedi die Moral, und ein Schmuggler... Schulden.
           </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['Obligation', 'Duty', 'Morality'].map((type) => (
            <button 
              key={type} 
              onClick={() => { setSuggestedType(type as any); setRollResult(null); }}
              className={`py-3 text-[9px] border transition-all font-black uppercase tracking-widest ${
                suggestedType === type ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-zinc-800 text-zinc-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {!rollResult ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 border border-zinc-900 border-dashed rounded-2xl p-8">
            <div className={`text-7xl transition-all duration-1000 ${rolling ? 'animate-spin scale-110 opacity-100' : 'opacity-10'}`}>🎲</div>
            <div className="text-center">
              <button 
                onClick={handleRoll}
                disabled={rolling}
                className="bg-amber-600 hover:bg-amber-500 text-black font-black py-5 px-12 rounded-xl uppercase tracking-[0.2em] italic text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-95"
              >
                {rolling ? 'SCANNING...' : 'INITIALIZE_ROLL'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="border border-amber-500/40 bg-amber-500/[0.03] p-8 text-center relative rounded-xl overflow-hidden shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
               <div className="text-[10px] text-amber-500 uppercase font-black mb-3 opacity-60 tracking-widest">[ DECREE_RESULT ]</div>
               <div className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">{rollResult}</div>
               <div className="text-[10px] text-zinc-500 font-bold border-t border-zinc-900 mt-4 pt-4">INITIAL_MAGNITUDE: {suggestedType === 'Morality' ? '50' : '10'}</div>
            </div>

            {suggestedType !== 'Morality' && (
              <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-xl relative">
                <div className="absolute -top-2 left-4 bg-black px-2 text-[8px] text-zinc-500 font-black uppercase tracking-widest">Optional_Pact</div>
                <div className="grid grid-cols-1 gap-3">
                  {[ 
                    { id: 'none', label: 'STANDARD_LOAD', sub: 'No bonus assigned', color: 'zinc' },
                    { id: 'xp10', label: 'UPGRADE: +10 XP', sub: 'Increase Load (+10)', color: 'amber' },
                    { id: 'cr2500', label: 'CREDIT_BOOST: +2.5k', sub: 'Increase Load (+10)', color: 'emerald' }
                  ].map(opt => (
                    <button 
                      key={opt.id} 
                      onClick={() => applyBackgroundBonus(opt.id as any)}
                      className={`p-4 border text-left transition-all rounded-lg ${
                        backgroundBonus === opt.id 
                          ? 'border-white bg-white/10 ring-1 ring-white' 
                          : 'border-zinc-800 bg-zinc-900/40 active:border-zinc-600'
                      }`}
                    >
                      <div className="text-xs font-black text-white italic tracking-tight">{opt.label}</div>
                      <div className="text-[8px] text-zinc-500 mt-1 uppercase">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <HolocronGuide 
        title="SCHICKSAL_SCAN" 
        description="Dein Hintergrund bestimmt, was dich antreibt. 'Obligation' sind Schulden oder Verpflichtungen, 'Duty' ist dein Dienst an einer Sache (z.B. Rebellion) und 'Morality' ist dein innerer Kompass als Machtnutzer."
        advice="Du kannst dein Schicksal erhöhen (Load), um dafür zusätzliche Start-XP (+10) oder Credits (+2.500) zu erhalten. Das ist ein super Boost für den Anfang, macht dein Leben aber später gefährlicher, wenn die Würfel gegen dich fallen!"
      />

      {rollResult && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
            <button 
              onClick={handleConfirm}
              className="w-full bg-white text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all active:scale-95"
            >
              Confirm_Destiny_→
            </button>
        </div>
      )}
    </main>
  );
};

export default BackgroundSelector;
