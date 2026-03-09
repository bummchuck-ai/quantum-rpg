'use client';

import ChatInterface from '@/components/play/ChatInterface';
import QuestLog from '@/components/play/QuestLog';
import MerchantInterface from '@/components/play/MerchantInterface';
import TalentShop from '@/components/play/TalentShop'; // Neuer Import
import { useCharacterStore } from '@/store/characterStore';
import { Quest } from '@/types/quest';
import { useEffect, useState } from 'react';

export default function PlayPage() {
  const addQuest = useCharacterStore((state) => state.addQuest);
  const questLog = useCharacterStore((state) => state.players[state.activePlayerIndex]?.questLog);

  const [activeTab, setActiveTab] = useState<'quests' | 'merchant' | 'talents'>('quests'); // State für den aktiven Tab erweitert

  useEffect(() => {
    if (questLog && !questLog.some(q => q.id === "first-steps")) {
      const exampleQuest: Quest = {
        id: "first-steps",
        title: "Erste Schritte",
        description: "Erkunde die Umgebung und sprich mit dem alten Einsiedler.",
        status: "active",
        objectives: [
          { description: "Finde den alten Einsiedler", isCompleted: false },
          { description: "Sprich mit dem alten Einsiedler", isCompleted: false },
        ],
        rewards: [
          { type: "exp", value: 50 },
          { type: "credits", value: 100 },
          { type: "item", value: "Antiker Datapad" },
        ],
      };
      addQuest(exampleQuest);
    }
  }, [addQuest, questLog]); // Abhängigkeiten für useEffect

  return (
    <main className="flex h-screen"> {/* Flex-Container für Layout */}
      <div className="w-1/3 p-4 border-r border-gray-700 overflow-y-auto"> {/* Linker Bereich für QuestLog / MerchantInterface / TalentShop */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-4 py-2 rounded-l-lg ${activeTab === 'quests' ? 'bg-blue-600' : 'bg-gray-700'} text-white font-bold`}
          >
            Quests
          </button>
          <button
            onClick={() => setActiveTab('merchant')}
            className={`px-4 py-2 ${activeTab === 'merchant' ? 'bg-blue-600' : 'bg-gray-700'} text-white font-bold ml-1`}
          >
            Händler
          </button>
          <button
            onClick={() => setActiveTab('talents')}
            className={`px-4 py-2 rounded-r-lg ${activeTab === 'talents' ? 'bg-blue-600' : 'bg-gray-700'} text-white font-bold ml-1`}
          >
            Talente
          </button>
        </div>
        {activeTab === 'quests' ? (
          <QuestLog quests={(questLog || []) as any} npcs={[]} onClose={() => setActiveTab('quests')} />
        ) : activeTab === 'merchant' ? (
          <MerchantInterface />
        ) : (
          <TalentShop />
        )}
      </div>
      <div className="w-2/3 p-4"> {/* ChatInterface Bereich */}
        <ChatInterface />
      </div>
    </main>
  );
}
