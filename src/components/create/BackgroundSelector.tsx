'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '../../store/characterStore';

// Einfache Listen für den Würfel-Simulator (später aus PDF/JSON)
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

  // Auto-Detect based on Career
  useEffect(() => {
    if (career) {
      if (career.forceRating > 0) {
        setSuggestedType('Morality');
      } else if (['Soldat', 'Kommandant', 'Klonkrieger', 'Ass'].includes(career.name)) {
        setSuggestedType('Duty');
      } else {
        setSuggestedType('Obligation'); // Default for Smugglers etc.
      }
    }
  }, [career]);

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      let list = OBLIGATION_LIST;
      if (suggestedType === 'Duty') list = DUTY_LIST;
      if (suggestedType === 'Morality') list = MORALITY_LIST;

      const result = list[Math.floor(Math.random() * list.length)];
      setRollResult(result);
      
      // Default Startwerte setzen
      let startValue = 10; // Obligation/Duty Standard
      if (suggestedType === 'Morality') startValue = 50;

      setBackground(suggestedType, result, startValue);
      setRolling(false);
    }, 1000); // Drama-Pause
  };

  const handleConfirm = () => {
    router.push('/create/summary');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* Left: Introduction */}
      <div className="w-1/3 bg-slate-900 border-r border-slate-800 p-8 flex flex-col justify-center">
        <h1 className="text-4xl font-black text-white mb-4">DEIN SCHICKSAL</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Jeder Held trägt eine Last. Ein Soldat hat seine Pflicht, ein Jedi ringt mit der Moral, und ein Schmuggler hat... nun ja, Schulden.
        </p>
        
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <div className="text-xs uppercase tracking-widest text-amber-500 mb-2">Vorgeschlagen für {career?.name}</div>
          <div className="text-3xl font-bold text-white mb-2">
            {suggestedType === 'Obligation' && 'VERPFLICHTUNG'}
            {suggestedType === 'Duty' && 'PFLICHT'}
            {suggestedType === 'Morality' && 'MORAL'}
          </div>
          <p className="text-sm text-slate-400">
            {suggestedType === 'Obligation' && 'Du schuldest jemandem etwas. Geld, einen Gefallen oder dein Leben.'}
            {suggestedType === 'Duty' && 'Du dienst einer höheren Sache. Dein Ansehen bestimmt deinen Rang.'}
            {suggestedType === 'Morality' && 'Der Konflikt zwischen Heller und Dunkler Seite tobt in dir.'}
          </p>
        </div>

        {/* Override Option */}
        <div className="mt-8 flex gap-2 justify-center text-xs text-slate-500">
          <button onClick={() => setSuggestedType('Obligation')} className={`px-3 py-1 rounded hover:text-white ${suggestedType === 'Obligation' ? 'text-amber-500 font-bold' : ''}`}>Verpflichtung</button>
          <button onClick={() => setSuggestedType('Duty')} className={`px-3 py-1 rounded hover:text-white ${suggestedType === 'Duty' ? 'text-amber-500 font-bold' : ''}`}>Pflicht</button>
          <button onClick={() => setSuggestedType('Morality')} className={`px-3 py-1 rounded hover:text-white ${suggestedType === 'Morality' ? 'text-amber-500 font-bold' : ''}`}>Moral</button>
        </div>
      </div>

      {/* Right: The Roll & The Deal */}
      <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 p-12 flex flex-col items-center justify-center">
        
        {!rollResult ? (
          <div className="text-center">
            <div className="text-9xl mb-8 animate-pulse grayscale opacity-20">🎲</div>
            <button 
              onClick={handleRoll}
              disabled={rolling}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xl py-6 px-12 rounded-full uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all transform hover:scale-105"
            >
              {rolling ? 'Würfelt...' : 'Schicksal bestimmen'}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
            {/* Result Card */}
            <div className="text-center mb-12">
              <div className="text-sm uppercase text-slate-500 mb-2 tracking-widest">Das Urteil</div>
              <div className="text-5xl font-black text-white border-b-2 border-amber-500 inline-block pb-2 mb-4">
                {rollResult}
              </div>
              <div className="text-amber-500 font-mono">Startwert: {suggestedType === 'Morality' ? '50' : '10'}</div>
            </div>

            {/* The Deal */}
            {suggestedType !== 'Morality' && (
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 backdrop-blur-sm">
                <h3 className="text-center text-xl font-bold text-white mb-6">DER DEAL MIT DEM TEUFEL</h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Option 1: Safe */}
                  <button 
                    onClick={() => applyBackgroundBonus('none')}
                    className={`p-4 rounded-lg border transition-all ${backgroundBonus === 'none' ? 'bg-slate-700 border-white ring-2 ring-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                  >
                    <div className="font-bold text-slate-300">Standard</div>
                    <div className="text-xs text-slate-500 mt-2">Kein Bonus</div>
                    <div className="text-xs text-emerald-400 mt-1">Sicher</div>
                  </button>

                  {/* Option 2: XP */}
                  <button 
                    onClick={() => applyBackgroundBonus('xp5')}
                    className={`p-4 rounded-lg border transition-all ${backgroundBonus === 'xp5' ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-400' : 'bg-slate-800 border-slate-700 hover:bg-indigo-900/30'}`}
                  >
                    <div className="font-bold text-indigo-300">+5 XP</div>
                    <div className="text-xs text-red-400 mt-2">+5 {suggestedType === 'Duty' ? 'Pflicht' : 'Verpflichtung'}</div>
                  </button>

                  <button 
                    onClick={() => applyBackgroundBonus('xp10')}
                    className={`p-4 rounded-lg border transition-all ${backgroundBonus === 'xp10' ? 'bg-purple-900/50 border-purple-400 ring-2 ring-purple-400' : 'bg-slate-800 border-slate-700 hover:bg-purple-900/30'}`}
                  >
                    <div className="font-bold text-purple-300">+10 XP</div>
                    <div className="text-xs text-red-400 mt-2">+10 {suggestedType === 'Duty' ? 'Pflicht' : 'Verpflichtung'}</div>
                  </button>

                  {/* Option 3: Money */}
                  <button 
                    onClick={() => applyBackgroundBonus('cr1000')}
                    className={`p-4 rounded-lg border transition-all ${backgroundBonus === 'cr1000' ? 'bg-emerald-900/50 border-emerald-400 ring-2 ring-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-emerald-900/30'}`}
                  >
                    <div className="font-bold text-emerald-300">+1.000 Credits</div>
                    <div className="text-xs text-red-400 mt-2">+5 {suggestedType === 'Duty' ? 'Pflicht' : 'Verpflichtung'}</div>
                  </button>

                  <button 
                    onClick={() => applyBackgroundBonus('cr2500')}
                    className={`p-4 rounded-lg border transition-all ${backgroundBonus === 'cr2500' ? 'bg-green-900/50 border-green-400 ring-2 ring-green-400' : 'bg-slate-800 border-slate-700 hover:bg-green-900/30'}`}
                  >
                    <div className="font-bold text-green-300">+2.500 Credits</div>
                    <div className="text-xs text-red-400 mt-2">+10 {suggestedType === 'Duty' ? 'Pflicht' : 'Verpflichtung'}</div>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleConfirm}
                className="bg-white text-black font-bold py-3 px-8 rounded hover:bg-slate-200 transition-colors"
              >
                Akzeptieren & Weiter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundSelector;
