'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore, Characteristics } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';
import { playXPSpend, playNavigate } from '@/lib/sounds';

const CHAR_META: { key: keyof Characteristics; label: string; labelDe: string; icon: string }[] = [
  { key: 'brawn', label: 'STR', labelDe: 'Starke', icon: '' },
  { key: 'agility', label: 'GEW', labelDe: 'Gewandtheit', icon: '' },
  { key: 'intellect', label: 'INT', labelDe: 'Intelligenz', icon: '' },
  { key: 'cunning', label: 'LST', labelDe: 'List', icon: '' },
  { key: 'willpower', label: 'WIL', labelDe: 'Willenskraft', icon: '' },
  { key: 'presence', label: 'CHA', labelDe: 'Charisma', icon: '' },
];

const CharacteristicSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, buyCharacteristic } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { species, characteristics, availableXP } = activePlayer;

  const baseChars = species?.characteristics || { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 };

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/skills');
  };

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">

      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
          <button onClick={() => router.push('/create/background')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
          <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">4</div>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">ATTRIBUTE_FORGE</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-emerald-500 font-bold tracking-widest">{availableXP} XP</div>
          <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={4} />
      <CharacterPreview />

      <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl mb-6">
        <p className="text-[10px] leading-relaxed text-zinc-500 uppercase tracking-wider">
          Investiere XP um deine Attribute zu steigern. Kosten: Neuer Rang x 10. Maximum: 5. Nach der Charaktererschaffung sind Attribute nur noch durch seltene Talente steigerbar!
        </p>
      </div>

      <div className="flex-1 space-y-4 pb-32">
        {CHAR_META.map(({ key, label, labelDe }) => {
          const current = characteristics[key];
          const base = baseChars[key];
          const upgraded = current > base;
          const cost = (current + 1) * 10;
          const canBuy = current < 5 && availableXP >= cost;

          return (
            <div key={key} className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">{label}</div>
                  <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{labelDe}</div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Value Pips */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(pip => (
                      <div
                        key={pip}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-[9px] font-black transition-all ${
                          pip <= current
                            ? pip <= base
                              ? 'border-zinc-500 bg-zinc-700 text-white'
                              : 'border-amber-500 bg-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-800'
                        }`}
                      >
                        {pip}
                      </div>
                    ))}
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => { buyCharacteristic(key); playXPSpend(); }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      canBuy
                        ? 'bg-amber-600 hover:bg-amber-500 text-black active:scale-95'
                        : current >= 5
                          ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                          : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                    }`}
                  >
                    {current >= 5 ? 'MAX' : `+1 (${cost})`}
                  </button>
                </div>
              </div>

              {upgraded && (
                <div className="text-[8px] text-amber-500/60 uppercase tracking-widest">
                  Basis: {base} → Aktuell: {current}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <HolocronGuide
        title="ATTRIBUTE"
        description="Attribute sind das Fundament deines Charakters. Starke bestimmt Nahkampf und Widerstand, Gewandtheit deine Fernkampf-Fahigkeit, Intelligenz dein Wissen. Jedes Attribut beeinflusst mehrere Fahigkeiten."
        advice="ACHTUNG: Nach der Erschaffung konnen Attribute NUR noch durch das seltene Talent 'Widmung' (Reihe 5) gesteigert werden! Investiere jetzt oder bereue es spater. Die meisten Spieler steigern 1-2 Kernattribute auf 3-4."
      />

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
        <button
          onClick={handleConfirm}
          className="w-full bg-white text-black font-black py-5 rounded-xl uppercase italic tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all active:scale-95 border-b-4 border-zinc-400"
        >
          Confirm_Attributes_→
        </button>
      </div>
    </main>
  );
};

export default CharacteristicSelector;
