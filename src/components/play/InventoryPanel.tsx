'use client';

import React from 'react';

interface InventoryPanelProps {
  ownedGear: any[];
  credits: number;
  encumbranceMax: number;
  onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ ownedGear, credits, encumbranceMax, onClose }) => {
  const weapons = ownedGear.filter(g => g.damage !== undefined);
  const armor = ownedGear.filter(g => g.soak !== undefined && g.damage === undefined);
  const items = ownedGear.filter(g => g.damage === undefined && g.soak === undefined);
  const totalEncumbrance = ownedGear.reduce((acc, g) => acc + (g.encumbrance ?? 1), 0);
  const overEncumbered = totalEncumbrance > encumbranceMax;

  return (
    <div className="absolute inset-0 z-[100] bg-black animate-in fade-in duration-300 flex flex-col">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <div>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Inventar</h2>
          <div className="flex gap-4 mt-1">
            <span className="text-[8px] text-amber-500 font-black">{credits} Credits</span>
            <span className={`text-[8px] font-black ${overEncumbered ? 'text-red-500' : 'text-zinc-500'}`}>
              Belastung: {totalEncumbrance}/{encumbranceMax}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xl">✕</button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Weapons */}
        <section>
          <div className="text-[8px] text-red-400 font-black uppercase tracking-[0.2em] mb-3">Waffen ({weapons.length})</div>
          {weapons.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic">Unbewaffnet...</div>
          ) : (
            <div className="space-y-2">
              {weapons.map((w, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[11px] font-black text-white uppercase italic tracking-tight">{w.name}</h3>
                    <span className="text-[8px] text-red-400 font-black">DMG {w.damage}{w.addsBrawn ? '+STR' : ''}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[7px] text-zinc-500 font-black uppercase">
                    <div>KRIT {w.critical || '-'}</div>
                    <div>RANGE {w.range || 'kurz'}</div>
                    <div>ENC {w.encumbrance || 1}</div>
                    <div>HP {w.hardpoints || 0}</div>
                  </div>
                  {w.special && w.special.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {w.special.map((s: string, j: number) => (
                        <span key={j} className="text-[7px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Armor */}
        <section>
          <div className="text-[8px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Rüstung ({armor.length})</div>
          {armor.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic">Keine Rüstung...</div>
          ) : (
            <div className="space-y-2">
              {armor.map((a, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[11px] font-black text-white uppercase italic">{a.name}</h3>
                    <div className="flex gap-3">
                      <span className="text-[8px] text-blue-400 font-black">SOAK +{a.soak}</span>
                      {a.defense > 0 && <span className="text-[8px] text-cyan-400 font-black">DEF +{a.defense}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Items */}
        <section>
          <div className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-3">Gegenstände ({items.length})</div>
          {items.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic">Kein Zubehör...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {items.map((item, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[10px] font-black text-white uppercase italic">{item.name}</div>
                  <div className="text-[7px] text-zinc-600 mt-1">{item.description || `ENC ${item.encumbrance || 1}`}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default React.memo(InventoryPanel);
