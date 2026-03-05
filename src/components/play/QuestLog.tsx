'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { Quest, Objective, Reward } from '@/types/quest'; // Korrigierter Import

const QuestLog = () => {
  const activePlayer = useCharacterStore((state) => state.players[state.activePlayerIndex]);

  if (!activePlayer) {
    return <div className="p-4 text-gray-400">Kein aktiver Spieler ausgewählt.</div>;
  }

  const activeQuests = activePlayer.questLog.filter(quest => quest.status === 'active');
  const completedQuests = activePlayer.questLog.filter(quest => quest.status === 'completed');
  const failedQuests = activePlayer.questLog.filter(quest => quest.status === 'failed');

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Quest-Log</h2>

      {activeQuests.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-300">Aktive Quests ({activeQuests.length})</h3>
          {activeQuests.map((quest: Quest) => (
            <div key={quest.id} className="bg-gray-700 p-3 rounded-md mb-3 border border-blue-500">
              <h4 className="font-bold text-lg text-blue-200">{quest.title}</h4>
              <p className="text-sm text-gray-300 mb-2">{quest.description}</p>
              {quest.objectives.length > 0 && (
                <ul className="list-disc list-inside ml-4 text-gray-200">
                  {quest.objectives.map((objective: Objective, index: number) => (
                    <li key={objective.description + index} className={`text-sm ${objective.isCompleted ? 'line-through text-gray-400' : ''}`}>
                      {objective.description}
                      {objective.targetProgress !== undefined && objective.currentProgress !== undefined && (
                        <span className="ml-2">({objective.currentProgress}/{objective.targetProgress})</span>
                      )}
                      {objective.isCompleted && <span className="ml-2 text-green-400">✅</span>}
                    </li>
                  ))}
                </ul>
              )}
              {quest.rewards.length > 0 && (
                <div className="mt-2 text-sm text-green-300">
                  Belohnungen: {quest.rewards.map((r: Reward) => {
                    if (r.type === 'exp') return `${r.value} EP`;
                    if (r.type === 'credits') return `${r.value} Credits`;
                    if (r.type === 'item') return `${r.value}`;
                    return '';
                  }).join(', ')}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {completedQuests.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-green-300">Abgeschlossene Quests ({completedQuests.length})</h3>
          {completedQuests.map((quest: Quest) => (
            <div key={quest.id} className="bg-gray-700 p-3 rounded-md mb-3 border border-green-500">
              <h4 className="font-bold text-lg text-green-200">{quest.title} <span className="text-green-400 text-sm ml-2">✅</span></h4>
              <p className="text-sm text-gray-400">{quest.description}</p>
            </div>
          ))}
        </section>
      )}

      {failedQuests.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-red-300">Fehlgeschlagene Quests ({failedQuests.length})</h3>
          {failedQuests.map((quest: Quest) => (
            <div key={quest.id} className="bg-gray-700 p-3 rounded-md mb-3 border border-red-500">
              <h4 className="font-bold text-lg text-red-200">{quest.title} <span className="text-red-400 text-sm ml-2">❌</span></h4>
              <p className="text-sm text-gray-400">{quest.description}</p>
            </div>
          ))}
        </section>
      )}

      {activeQuests.length === 0 && completedQuests.length === 0 && failedQuests.length === 0 && (
        <p className="text-gray-400">Keine Quests vorhanden.</p>
      )}
    </div>
  );
};

export default QuestLog;
