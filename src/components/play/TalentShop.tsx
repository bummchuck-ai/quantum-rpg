'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { Talent } from '@/types/character';
import allTalents from '@/../data/allTalents.json';

const MAX_TALENT_RANK = 5; // Muss mit dem Wert im characterStore.ts übereinstimmen

const TalentShop = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const buyTalent = useCharacterStore((state) => state.buyTalent);

  if (!activePlayer) {
    return <div className="p-4 text-gray-400">Kein aktiver Spieler ausgewählt.</div>;
  }

  const { availableXP, ownedTalents } = activePlayer;

  const handleBuyTalent = (talentToBuy: Talent) => {
    buyTalent(talentToBuy);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Talent-Shop</h2>
      <p className="text-lg text-gray-300 mb-4">Verfügbare XP: <span className="font-bold text-green-400">{availableXP}</span></p>

      <div className="space-y-4">
        {allTalents.map((talent: Talent) => {
          const ownedTalent = ownedTalents.find(ot => ot.id === talent.id);
          const currentRank = ownedTalent ? ownedTalent.currentRank : 0;
          const canAfford = availableXP >= talent.xpCost;
          const isMaxRank = talent.ranked && currentRank >= MAX_TALENT_RANK;
          const alreadyOwnedNonRanked = !talent.ranked && ownedTalent !== undefined;
          const isDisabled = !canAfford || isMaxRank || alreadyOwnedNonRanked;

          return (
            <div key={talent.id} className="bg-gray-700 p-4 rounded-md border border-purple-500 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-purple-200">{talent.name}</h3>
                <p className="text-sm text-gray-300 mb-1">{talent.description}</p>
                <p className="text-sm text-yellow-300">Kosten: {talent.xpCost} XP</p>
                {talent.ranked && (
                  <p className="text-sm text-blue-300">Rang: {currentRank}/{MAX_TALENT_RANK}</p>
                )}
              </div>
              <button
                onClick={() => handleBuyTalent(talent)}
                disabled={isDisabled}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {talent.ranked && currentRank > 0 ? "Rang erhöhen" : "Kaufen"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentShop;
