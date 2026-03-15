'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import gearData from '@/../data/json/gear.json';
import { useCharacterStore } from '@/store/characterStore';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';
import { playCredits, playRefund, playNavigate, playError } from '@/lib/sounds';

// Map subcategory to SVG icon path
const SUBCAT_ICONS: Record<string, string> = {
  'Pistolen': '/icons/gear/pistol.svg',
  'Gewehre': '/icons/gear/rifle.svg',
  'Schwere Waffen': '/icons/gear/heavy.svg',
  'Nahkampf': '/icons/gear/melee.svg',
  'Granaten': '/icons/gear/grenade.svg',
  'Kleidung': '/icons/gear/clothing.svg',
  'Westen': '/icons/gear/vest.svg',
  'Rüstung': '/icons/gear/armor.svg',
  'Spezial': '/icons/gear/special-armor.svg',
  'Kommunikation': '/icons/gear/comms.svg',
  'Medizin': '/icons/gear/medical.svg',
  'Werkzeug': '/icons/gear/tools.svg',
  'Scanner & Optik': '/icons/gear/scanner.svg',
  'Überleben': '/icons/gear/survival.svg',
  'Sicherheit': '/icons/gear/security.svg',
  'Droiden-Zubehör': '/icons/gear/droid.svg',
};

const ArmorySelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, buyGear, sellGear } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];
  const { credits, ownedGear } = activePlayer;
  
  const [category, setCategory] = useState<'weapons' | 'armor' | 'equipment'>('weapons');
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/ship');
  };

  const isPurchased = (name: string) => ownedGear.some(g => g.name === name);

  const subCategories = Object.keys(gearData[category]);
  const currentSubCategory = subCategory || subCategories[0];

  const items = (gearData[category] as any)[currentSubCategory] || [];
  const filteredItems = items.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6 safe-area-top">
      
      {/* HUD Header */}
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
            <button onClick={() => router.push('/create/talents')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">7</div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">ARMORY_GRID</h1>
            </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">{credits} C</div>
            <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Available</div>
        </div>
      </header>

      <ProgressTracker currentStep={7} />
      <CharacterPreview />

      {/* CATEGORY TABS */}
      <div className="grid grid-cols-3 gap-2 mb-4 sticky top-[65px] bg-black z-20 pb-2">
          <button
            onClick={() => { setCategory('weapons'); setSubCategory(null); setSelectedItem(null); }}
            className={`py-3 text-[9px] border-2 font-black uppercase tracking-widest transition-all rounded-xl ${category === 'weapons' ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-900 bg-zinc-950 text-zinc-600'}`}
          >
            Weapons
          </button>
          <button
            onClick={() => { setCategory('armor'); setSubCategory(null); setSelectedItem(null); }}
            className={`py-3 text-[9px] border-2 font-black uppercase tracking-widest transition-all rounded-xl ${category === 'armor' ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-900 bg-zinc-950 text-zinc-600'}`}
          >
            Armor
          </button>
          <button
            onClick={() => { setCategory('equipment'); setSubCategory(null); setSelectedItem(null); }}
            className={`py-3 text-[9px] border-2 font-black uppercase tracking-widest transition-all rounded-xl ${category === 'equipment' ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-zinc-900 bg-zinc-950 text-zinc-600'}`}
          >
            Gear
          </button>
      </div>

      {/* SUB-CATEGORY TABS */}
      <div className="flex gap-2 mb-6 sticky top-[125px] bg-black z-20 pb-4 overflow-x-auto no-scrollbar">
          {subCategories.map(sub => (
              <button 
                key={sub}
                onClick={() => { setSubCategory(sub); setSelectedItem(null); }}
                className={`px-4 py-2 text-[8px] border font-black uppercase whitespace-nowrap transition-all rounded-lg ${currentSubCategory === sub ? 'border-white bg-white/10 text-white' : 'border-zinc-900 bg-zinc-950 text-zinc-700'}`}
              >
                {sub}
              </button>
          ))}
      </div>

      <div className="mb-6 sticky top-[175px] bg-black z-20 pb-4">
        <input 
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl"
          placeholder="SEARCH_MANIFEST..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GEAR TILES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
        {filteredItems.map((item: any) => {
          const isSelected = selectedItem === item.name;
          const purchased = isPurchased(item.name);

          return (
            <div 
                key={`${category}-${item.name}`} // FORCE REMOUNT ON CATEGORY CHANGE
                onClick={() => setSelectedItem(isSelected ? null : item.name)}
                className={`border transition-all duration-300 rounded-xl overflow-hidden cursor-pointer h-fit ${
                isSelected 
                    ? 'border-white bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                    : purchased
                    ? 'border-emerald-500/50 bg-emerald-500/[0.05]'
                    : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60'
                }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3 flex-1 pr-2">
                            {/* Category Icon */}
                            {SUBCAT_ICONS[currentSubCategory] && (
                              <div className="w-8 h-8 flex-shrink-0 text-zinc-600 mt-0.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={SUBCAT_ICONS[currentSubCategory]} alt="" className="w-8 h-8 opacity-40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className={`text-base font-black italic uppercase tracking-tighter leading-none ${purchased ? 'text-emerald-400' : 'text-white'}`}>{item.name}</h2>
                                    {purchased && <span className="text-[7px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black uppercase">OWNED</span>}
                                </div>
                                <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                    {category === 'weapons' ? `DMG: ${item.damage} / CRIT: ${item.critical}` : category === 'armor' ? `DEF: ${item.defense} / SOAK: ${item.soak}` : `ENC: ${item.encumbrance}`}
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-snug line-clamp-1">{item.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-sm font-black text-amber-500 italic leading-none whitespace-nowrap">{item.price}</div>
                    </div>

                    {/* EXPANDED PANEL */}
                    {isSelected && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                            {category !== 'equipment' && (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 border border-zinc-800 rounded-lg bg-black/60 text-center">
                                    <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Enc</div>
                                    <div className="text-xs font-black text-white">{item.encumbrance}</div>
                                </div>
                                <div className="p-2 border border-zinc-800 rounded-lg bg-black/60 text-center">
                                    <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">HP</div>
                                    <div className="text-xs font-black text-white">{item.hardPoints}</div>
                                </div>
                                <div className="p-2 border border-zinc-800 rounded-lg bg-black/60 text-center">
                                    <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Rty</div>
                                    <div className="text-xs font-black text-white">{item.rarity}</div>
                                </div>
                            </div>
                            )}

                            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-inner">
                                <p className="text-sm text-zinc-300 leading-snug font-sans">
                                    {item.description || (category === 'weapons' ? item.special : item.note) || 'Keine Beschreibung verfügbar.'}
                                </p>
                            </div>

                            {!purchased ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if (credits >= item.price) { buyGear(item); playCredits(); } else { playError(); } }}
                                    disabled={credits < item.price}
                                    className={`w-full py-3 rounded-xl uppercase font-black italic tracking-widest text-[10px] transition-all shadow-lg ${
                                        credits >= item.price 
                                        ? 'bg-amber-500 text-black active:scale-95 hover:bg-amber-400' 
                                        : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                                    }`}
                                >
                                    {credits >= item.price ? 'BUY ITEM' : 'INSUFFICIENT FUNDS'}
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); sellGear(item); playRefund(); }}
                                    className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 text-center py-3 text-[10px] font-black uppercase tracking-widest italic rounded-xl active:scale-95 transition-all"
                                >
                                    SELL / UNDO (+{item.sellPrice || Math.floor(item.price * 0.5)})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      <HolocronGuide
        sectionKey="armory"
        title="AUSRÜSTUNG" 
        description="Hier kaufst du Waffen, Rüstungen und Ausrüstung. 'Encumbrance' ist das Gewicht – trage nicht zu viel! 'Hard Points' sind Plätze für Upgrades. Vergiss nicht die Basics unter 'Gear': Stimpacks, Comlink, Werkzeug."
        advice="Spare nicht an der Rüstung! Ein guter Soak-Wert rettet dir den Hintern. Kaufe mindestens 2-3 Stimpacks und einen Comlink – ohne stirbst du schnell. Der Rest ist Geschmackssache."
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
