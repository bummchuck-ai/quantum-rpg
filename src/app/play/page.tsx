'use client';

import ChatInterface from '@/components/play/ChatInterface';
import QuestLog from '@/components/play/QuestLog';
import MerchantInterface from '@/components/play/MerchantInterface';
import TalentShop from '@/components/play/TalentShop';
import { useCharacterStore } from '@/store/characterStore';
import { useState } from 'react';

type Tab = 'chat' | 'quests' | 'shop' | 'talents';

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat', label: 'CHAT', icon: '💬' },
  { id: 'quests', label: 'QUESTS', icon: '📋' },
  { id: 'shop', label: 'SHOP', icon: '🏪' },
  { id: 'talents', label: 'TALENTS', icon: '⚡' },
];

export default function PlayPage() {
  const questLog = useCharacterStore((state) => state.players[state.activePlayerIndex]?.questLog);
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <main className="relative h-screen w-screen bg-black font-mono overflow-hidden">
      {/* Tab Content Area — full screen, stacked */}
      <div className="h-full w-full">
        {/* Chat — default view */}
        <div className={activeTab === 'chat' ? 'h-full w-full' : 'hidden'}>
          <ChatInterface />
        </div>

        {/* Quests */}
        <div className={activeTab === 'quests' ? 'h-full w-full' : 'hidden'}>
          <QuestLog
            quests={(questLog || []) as any}
            npcs={[]}
            onClose={() => setActiveTab('chat')}
          />
        </div>

        {/* Merchant Shop */}
        <div className={activeTab === 'shop' ? 'h-full w-full overflow-y-auto pb-20' : 'hidden'}>
          <MerchantInterface />
        </div>

        {/* Talent Shop */}
        <div className={activeTab === 'talents' ? 'h-full w-full overflow-y-auto pb-20' : 'hidden'}>
          <TalentShop />
        </div>
      </div>

      {/* Bottom Tab Bar — fixed, glass-morphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-zinc-800/60">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all active:scale-90 ${
                  isActive ? 'text-amber-500' : 'text-zinc-600'
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span className={`text-[7px] font-black uppercase tracking-[0.15em] ${
                  isActive ? 'text-amber-500' : 'text-zinc-600'
                }`}>
                  {tab.label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
        {/* Safe area padding for iPhones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </main>
  );
}
