'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';
import { playNavigate, playDiceRoll } from '@/lib/sounds';

const OBLIGATION_LIST = [
  { name: "Schulden (Debt)", desc: "Du schuldest jemandem Mächtigem viel Geld oder einen Gefallen. Gläubiger schicken regelmäßig Eintreiber — und sie werden ungeduldig." },
  { name: "Kopfgeld (Bounty)", desc: "Jemand hat ein Kopfgeld auf dich ausgesetzt. Kopfgeldjäger durchkämmen die Galaxis nach dir. Jeder Cantina-Besuch könnte dein letzter sein." },
  { name: "Erpressung (Blackmail)", desc: "Jemand kennt dein dunkstes Geheimnis und nutzt es gegen dich. Solange du nicht zahlst oder gehorchst, hängt die Enthüllung über dir." },
  { name: "Familie", desc: "Deine Familie braucht dich — finanziell, emotional oder weil sie in Gefahr ist. Ihre Probleme werden unweigerlich zu deinen." },
  { name: "Sucht (Addiction)", desc: "Du bist abhängig von einer Substanz, einem Spiel oder einer Aktivität. Ohne deine Dosis wirst du unruhig, unkonzentriert — und verzweifelt." },
  { name: "Verrat (Betrayal)", desc: "Du hast jemanden verraten — oder wurdest verraten. Diese offene Wunde zieht Konflikte an und vergiftet Vertrauen." },
  { name: "Verbrechen (Criminal)", desc: "Du hast eine kriminelle Vergangenheit. Das Imperium, lokale Behörden oder Syndikate suchen nach dir. Ein falscher Schritt und du landest im Gefängnis." },
  { name: "Favor", desc: "Du schuldest jemandem einen großen Gefallen — und diese Person wird ihn einfordern. Zum ungünstigsten Zeitpunkt." },
];
const DUTY_LIST = [
  { name: "Kampfsiege", desc: "Deine Pflicht ist es, auf dem Schlachtfeld zu siegen. Jeder gewonnene Kampf stärkt die Sache deiner Fraktion." },
  { name: "Spionage", desc: "Du sammelst Informationen hinter feindlichen Linien. Dein Wissen kann Schlachten entscheiden — oder dich das Leben kosten." },
  { name: "Sabotage", desc: "Du zerstörst feindliche Einrichtungen, Versorgungslinien und Ausrüstung. Stille Operationen mit großer Wirkung." },
  { name: "Rekrutierung", desc: "Du gewinnst neue Verbündete für die Sache. Jeder neue Rekrut stärkt die Bewegung." },
  { name: "Politische Unterstützung", desc: "Du schmiedest Allianzen und gewinnst politische Unterstützer. Diplomatie ist deine stärkste Waffe." },
  { name: "Innere Sicherheit", desc: "Du schützt deine Fraktion vor Spionen, Verrätern und internen Bedrohungen. Vertrauen ist ein Luxus." },
  { name: "Ressourcenbeschaffung", desc: "Du besorgst Waffen, Schiffe, Treibstoff und Vorräte. Ohne Nachschub stirbt jede Rebellion." },
];
const MORALITY_LIST = [
  { name: "Tapferkeit / Zorn", desc: "Du stellst dich mutig jeder Gefahr — aber dein Mut kann in blinden Zorn umschlagen. Die Dunkle Seite nährt sich von deiner Wut." },
  { name: "Liebe / Eifersucht", desc: "Deine tiefe Bindung zu anderen gibt dir Stärke — aber Angst vor Verlust kann zu Eifersucht und Besitzdenken werden." },
  { name: "Vorsicht / Furcht", desc: "Deine Vorsicht hält dich am Leben — aber sie kann in lähmende Furcht umschlagen, die dich handlungsunfähig macht." },
  { name: "Gnade / Schwäche", desc: "Du schonst deine Feinde und gibst jedem eine zweite Chance — aber deine Gnade kann als Schwäche ausgenutzt werden." },
  { name: "Stolz / Arroganz", desc: "Dein Selbstvertrauen inspiriert andere — aber es kann in Arroganz kippen, die dich blind für eigene Fehler macht." },
  { name: "Neugier / Besessenheit", desc: "Dein Wissensdurst treibt dich an — aber er kann zur Besessenheit werden, die dich in verbotenes Wissen lockt." },
];

const BackgroundSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, setBackground, applyBackgroundBonus } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { career, backgroundBonus, backgroundType, backgroundOption } = activePlayer;
  
  const [suggestedType, setSuggestedType] = useState<'Obligation' | 'Duty' | 'Morality'>('Obligation');
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<string | null>(null);

  useEffect(() => {
    if (career) {
      if ((career as any).forceRating > 0) setSuggestedType('Morality');
      else if (['Soldat', 'Kommandant', 'Klonkrieger', 'Ace'].includes(career.name)) setSuggestedType('Duty');
      else setSuggestedType('Obligation');
    }
  }, [career]);

  const [rollDesc, setRollDesc] = useState<string | null>(null);

  const handleRoll = () => {
    playDiceRoll();
    setRolling(true);
    setTimeout(() => {
      let list = suggestedType === 'Duty' ? DUTY_LIST : suggestedType === 'Morality' ? MORALITY_LIST : OBLIGATION_LIST;
      const pick = list[Math.floor(Math.random() * list.length)];
      setRollResult(pick.name);
      setRollDesc(pick.desc);
      setBackground(suggestedType, pick.name, suggestedType === 'Morality' ? 50 : 10);
      setRolling(false);
    }, 1200);
  };

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/attributes');
  };

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6 safe-area-top">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/create/career')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
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
      <CharacterPreview />

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
               <div className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">{rollResult}</div>
               {rollDesc && (
                 <div className="text-xs text-zinc-400 leading-relaxed font-sans italic border-t border-zinc-800 pt-4 mb-4 text-left">{rollDesc}</div>
               )}
               <div className="text-[10px] text-zinc-500 font-bold border-t border-zinc-900 pt-4">INITIAL_MAGNITUDE: {suggestedType === 'Morality' ? '50' : '10'}</div>
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
        sectionKey="background"
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
