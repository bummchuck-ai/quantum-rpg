'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import gearData from '@/../data/json/gear.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

const ArmorySelector: React.FC = () => {
  const router = useRouter();
  const { credits, buyGear, ownedGear } = useCharacterStore();
  
  const [category, setCategory] = useState<'weapons' | 'armor'>('weapons');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleConfirm = () => {
    router.push('/create/summary');
  };

  const isPurchased = (name: string) => ownedGear.some(g => g.name === name);

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-4 items-center">
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">5</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">ARMORY_GRID</h1>
            </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">{credits} C</div>
            <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={5} />

      {/* CATEGORY TABS */}
      <div className="grid grid-cols-2 gap-2 mb-8 sticky top-[65px] bg-black z-20 pb-4">
          <button 
            onClick={() => { setCategory('weapons'); setSelectedItem(null); }}
            className={`py-4 text-[10px] border-2 font-black uppercase tracking-widest transition-all rounded-xl ${category === 'weapons' ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-900 bg-zinc-950 text-zinc-600'}`}
          >
            Weapons
          </button>
          <button 
            onClick={() => { setCategory('armor'); setSelectedItem(null); }}
            className={`py-4 text-[10px] border-2 font-black uppercase tracking-widest transition-all rounded-xl ${category === 'armor' ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-900 bg-zinc-950 text-zinc-600'}`}
          >
            Armor
          </button>
      </div>

      {/* GEAR TILES GRID */}
      <div className="space-y-6 pb-32">
        {gearData[category].map((item: any) => {
          const isSelected = selectedItem === item.name;
          const purchased = isPurchased(item.name);

          return (
            <div 
                key={`${category}-${item.name}`} // FORCE REMOUNT ON CATEGORY CHANGE
                onClick={() => setSelectedItem(isSelected ? null : item.name)}
                className={`border-2 transition-all duration-300 rounded-2xl overflow-hidden ${
                isSelected 
                    ? 'border-white bg-white/[0.08] shadow-[0_0_50px_rgba(255,255,255,0.15)] scale-[1.02]' 
                    : purchased
                    ? 'border-emerald-500/50 bg-emerald-500/[0.05]'
                    : 'border-zinc-800 bg-zinc-900/40 active:border-zinc-600'
                }`}
            >
                {/* Visual Header */}
                <div className="h-20 bg-zinc-950 relative flex items-center justify-center border-b border-zinc-900 overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 to-transparent"></div>
                    <div className="text-4xl opacity-5 grayscale font-black italic">{category === 'weapons' ? 'WPN' : 'ARM'}</div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className={`text-2xl font-black italic uppercase tracking-tighter leading-none ${purchased ? 'text-emerald-400' : 'text-white'}`}>{item.name}</h2>
                                {purchased && <span className="text-[8px] bg-emerald-500 text-black px-2 py-1 rounded-md font-black uppercase">IN_STOCK</span>}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                                {category === 'weapons' ? `Damage: ${item.damage} / Crit: ${item.critical}` : `Def: ${item.defense} / Soak: ${item.soak}`}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-500 italic leading-none">{item.price}C</div>
                    </div>

                    {/* EXPANDED PANEL */}
                    {isSelected && (
                        <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 border border-zinc-800 rounded-xl bg-black/60 text-center">
                                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Encumb</div>
                                    <div className="text-sm font-black text-white">{item.encumbrance}</div>
                                </div>
                                <div className="p-4 border border-zinc-800 rounded-xl bg-black/60 text-center">
                                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">HardPts</div>
                                    <div className="text-sm font-black text-white">{item.hardPoints}</div>
                                </div>
                                <div className="p-4 border border-zinc-800 rounded-xl bg-black/60 text-center">
                                    <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Rarity</div>
                                    <div className="text-sm font-black text-white">{item.rarity}</div>
                                </div>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl shadow-inner">
                                <div className="text-[8px] text-amber-500/50 font-black uppercase mb-2 tracking-widest">Tactical_Specs</div>
                                <p className="text-[13px] text-zinc-300 leading-relaxed italic font-sans selection:bg-amber-500/30">
                                    {category === 'weapons' ? item.special : item.note || 'No further data found in manifest.'}
                                </p>
                            </div>

                            {!purchased ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); buyGear(item); }}
                                    disabled={credits < item.price}
                                    className={`w-full py-5 rounded-2xl uppercase font-black italic tracking-widest text-xs transition-all shadow-2xl ${
                                        credits >= item.price 
                                        ? 'bg-amber-500 text-black shadow-amber-900/40 active:scale-95 hover:bg-amber-400' 
                                        : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                                    }`}
                                >
                                    {credits >= item.price ? 'Authorize_Procurement_+' : 'Funds_Insufficient'}
                                </button>
                            ) : (
                                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center py-5 text-[10px] font-black uppercase tracking-widest italic rounded-2xl animate-pulse">
                                    System_Fully_Equipped
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      <HolocronGuide 
        title="AUSRÜSTUNG" 
        description="Hier kaufst du Waffen und Rüstungen. 'Encumbrance' ist das Gewicht – trage nicht zu viel! 'Hard Points' sind Plätze für Upgrades. 'Rarity' sagt dir, wie schwer das Item später im Spiel zu finden ist."
        advice="Spare nicht an der Rüstung! Ein guter Soak-Wert (Schadensabsorption) rettet dir in der ersten Runde den Hintern. Waffen mit hohem Crit-Wert sind gut, um Gegner schnell auszuschalten."
      />

      {/* FOOTER ACTION */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
          <button 
            onClick={handleConfirm}
            className="w-full bg-white text-black font-black py-6 rounded-2xl uppercase italic tracking-widest text-sm shadow-[0_20px_60px_rgba(0,0,0,1)] transition-all active:scale-95 border-b-4 border-zinc-400"
          >
            Confirm_Tactical_Loadout_→
          </button>
      </div>

    </main>
  );
};

export default ArmorySelector;
