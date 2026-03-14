'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { Gear } from '@/types/gear';
import merchantsData from '@/../data/merchants.json';

interface Merchant {
  id: string;
  name: string;
  inventory: Gear[];
}

const MerchantInterface = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const buyGear = useCharacterStore((state) => state.buyGear);
  const sellGear = useCharacterStore((state) => state.sellGear);

  const merchant: Merchant | undefined = (merchantsData as Merchant[])[0]; // Fürs Erste den ersten Händler laden

  if (!activePlayer || !merchant) {
    return <div className="min-h-screen bg-black p-4 text-zinc-700 font-mono text-[10px] uppercase italic">Kein aktiver Spieler oder Haendler verfuegbar...</div>;
  }

  const handleBuy = (item: Gear) => {
    buyGear(item);
  };

  const handleSell = (item: Gear) => {
    sellGear(item);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 bg-zinc-950">
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{merchant.name}_Shop</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Guthaben</span>
          <span className="text-sm font-black text-amber-500">{activePlayer.credits} CR</span>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Händlerinventar */}
        <section>
          <div className="text-[8px] text-amber-500 font-black uppercase tracking-[0.2em] mb-3">Angebot</div>
          {merchant.inventory.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic uppercase">Keine Gegenstände im Angebot...</div>
          ) : (
            <div className="space-y-2">
              {merchant.inventory.map((item: Gear) => (
                <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{item.name}</h4>
                    <p className="text-[9px] text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-[9px] text-amber-500 font-black mt-1">{item.price} CR</p>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={activePlayer.credits < item.price}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black py-2 px-4 rounded-lg text-[9px] uppercase tracking-widest whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                  >
                    Kaufen
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Spielerinventar */}
        <section>
          <div className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-3">Dein Inventar</div>
          {activePlayer.ownedGear.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic uppercase">Inventar leer...</div>
          ) : (
            <div className="space-y-2">
              {activePlayer.ownedGear.map((item: Gear) => (
                <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{item.name}</h4>
                    <p className="text-[9px] text-zinc-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-[9px] text-emerald-500 font-black mt-1">Verkauf: {item.sellPrice} CR</p>
                  </div>
                  <button
                    onClick={() => handleSell(item)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black py-2 px-4 rounded-lg text-[9px] uppercase tracking-widest whitespace-nowrap border border-red-500/30 transition-all active:scale-90"
                  >
                    Verkaufen
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MerchantInterface;
