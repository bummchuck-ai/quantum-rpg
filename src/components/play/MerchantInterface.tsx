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

  const merchant: Merchant | undefined = merchantsData[0]; // Fürs Erste den ersten Händler laden

  if (!activePlayer || !merchant) {
    return <div className="p-4 text-gray-400">Kein aktiver Spieler oder Händler verfügbar.</div>;
  }

  const handleBuy = (item: Gear) => {
    buyGear(item);
  };

  const handleSell = (item: Gear) => {
    sellGear(item);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">{merchant.name}</h2>
      <p className="text-lg text-gray-300 mb-4">Dein Guthaben: <span className="font-bold text-green-400">{activePlayer.credits} Credits</span></p>

      <div className="grid grid-cols-2 gap-4">
        {/* Händlerinventar */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-blue-300">Angebot von {merchant.name}</h3>
          {merchant.inventory.length === 0 ? (
            <p className="text-gray-400">Keine Gegenstände im Angebot.</p>
          ) : (
            <div className="space-y-3">
              {merchant.inventory.map((item: Gear) => (
                <div key={item.id} className="bg-gray-700 p-3 rounded-md border border-blue-500 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg text-blue-200">{item.name}</h4>
                    <p className="text-sm text-gray-300">{item.description}</p>
                    <p className="text-sm text-yellow-300">Preis: {item.price} Credits</p>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={activePlayer.credits < item.price}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kaufen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spielerinventar */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-purple-300">Dein Inventar</h3>
          {activePlayer.ownedGear.length === 0 ? (
            <p className="text-gray-400">Dein Inventar ist leer.</p>
          ) : (
            <div className="space-y-3">
              {activePlayer.ownedGear.map((item: Gear) => (
                <div key={item.id} className="bg-gray-700 p-3 rounded-md border border-purple-500 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg text-purple-200">{item.name}</h4>
                    <p className="text-sm text-gray-300">{item.description}</p>
                    <p className="text-sm text-yellow-300">Verkaufspreis: {item.sellPrice} Credits</p>
                  </div>
                  <button
                    onClick={() => handleSell(item)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Verkaufen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantInterface;
