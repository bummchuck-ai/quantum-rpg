'use client';

import React, { useState } from 'react';
import { FORCE_POWERS, type ForcePower, type ForcePowerUpgrade, isForceCareer, calculateForceRating } from '@/lib/engine/force-powers';

interface ForcePowerPanelProps {
  career: any;
  ownedTalents: string[];
  ownedPowers: string[]; // IDs of purchased powers
  ownedUpgrades: string[]; // IDs of purchased upgrades
  availableXP: number;
  onBuyPower: (powerId: string) => void;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
  onUsePower: (power: ForcePower) => void;
  onClose: () => void;
}

const ForcePowerPanel: React.FC<ForcePowerPanelProps> = ({
  career, ownedTalents, ownedPowers, ownedUpgrades,
  availableXP, onBuyPower, onBuyUpgrade, onUsePower, onClose
}) => {
  const [selectedPower, setSelectedPower] = useState<ForcePower | null>(null);
  const forceRating = calculateForceRating(career, ownedTalents);
  const isForceSensitive = isForceCareer(career);

  if (!isForceSensitive) {
    return (
      <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Nicht machtsensitiv</h2>
          <p className="text-xs text-zinc-500">Dein Charakter hat keinen Zugang zur Macht. Wähle eine machtsensitive Karriere oder erhalte das Talent "Machtbewusst".</p>
          <button onClick={onClose} className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs">Schließen</button>
        </div>
      </div>
    );
  }

  const availablePowers = FORCE_POWERS.filter(p => p.forceRating <= forceRating);

  return (
    <div className="absolute inset-0 z-[100] bg-black animate-in fade-in duration-300 flex flex-col">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <div>
          <div className="text-[8px] text-purple-400 font-black uppercase tracking-widest">Force_Rating: {forceRating}</div>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Machtkräfte</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[9px] text-amber-500 font-black">XP: {availableXP}</div>
          <button onClick={onClose} className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xl">✕</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {selectedPower ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedPower(null)} className="text-[9px] text-zinc-500 hover:text-white uppercase tracking-widest">← Zurück</button>
            <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-black text-white italic uppercase">{selectedPower.nameDE}</h3>
                  <p className="text-[9px] text-zinc-500 mt-1">{selectedPower.descriptionDE}</p>
                </div>
                {ownedPowers.includes(selectedPower.id) && (
                  <button onClick={() => onUsePower(selectedPower)} className="bg-purple-600 text-white text-[9px] font-black px-4 py-2 rounded-lg uppercase hover:bg-purple-500">
                    Einsetzen
                  </button>
                )}
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                <div className="text-[7px] text-purple-400 font-black uppercase tracking-widest mb-1">Basis-Effekt</div>
                <p className="text-[10px] text-zinc-300">{selectedPower.baseEffect}</p>
              </div>
              {!ownedPowers.includes(selectedPower.id) && (
                <button onClick={() => onBuyPower(selectedPower.id)} className="w-full bg-purple-600 text-white font-black py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-purple-500 mb-4">
                  Macht erlernen (5 XP)
                </button>
              )}
              <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-2">Upgrades</div>
              <div className="space-y-2">
                {selectedPower.upgrades.map(u => {
                  const owned = ownedUpgrades.includes(u.id);
                  const canBuy = !owned && availableXP >= u.cost && ownedPowers.includes(selectedPower.id);
                  const prereqMet = !u.requires || u.requires.every(r => ownedUpgrades.includes(r));
                  return (
                    <div key={u.id} className={`flex justify-between items-center p-3 border rounded-lg ${owned ? 'border-purple-500/50 bg-purple-500/10' : 'border-zinc-800 bg-zinc-950'} ${!prereqMet ? 'opacity-30' : ''}`}>
                      <div>
                        <span className="text-[9px] font-black text-white uppercase">{u.name}</span>
                        <span className="text-[8px] text-zinc-500 ml-2">{u.description}</span>
                      </div>
                      {owned ? (
                        <span className="text-[8px] text-purple-400 font-black">ERLERNT</span>
                      ) : canBuy && prereqMet ? (
                        <button onClick={() => onBuyUpgrade(u.id, u.cost)} className="bg-zinc-800 text-amber-500 text-[8px] font-black px-3 py-1.5 rounded hover:bg-zinc-700">
                          {u.cost} XP
                        </button>
                      ) : (
                        <span className="text-[8px] text-zinc-700 font-black">{u.cost} XP</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          availablePowers.map(power => {
            const owned = ownedPowers.includes(power.id);
            const purchasedUpgrades = power.upgrades.filter(u => ownedUpgrades.includes(u.id)).length;
            return (
              <div key={power.id} onClick={() => setSelectedPower(power)}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:border-purple-500/50 ${owned ? 'border-purple-500/30 bg-purple-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{power.nameDE}</h3>
                    <p className="text-[9px] text-zinc-500 mt-1">{power.descriptionDE}</p>
                  </div>
                  <div className="text-right">
                    {owned ? (
                      <div className="text-[8px] text-purple-400 font-black">
                        ERLERNT
                        {purchasedUpgrades > 0 && <span className="text-zinc-500 ml-1">+{purchasedUpgrades}</span>}
                      </div>
                    ) : (
                      <div className="text-[8px] text-zinc-600 font-black">FR {power.forceRating}+</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ForcePowerPanel;
