'use client';

import ChatInterface from '@/components/play/ChatInterface';
import MerchantInterface from '@/components/play/MerchantInterface';
import TalentShop from '@/components/play/TalentShop';
import ErrorBoundary from '@/components/play/ErrorBoundary';
import { useCharacterStore } from '@/store/characterStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UsageBadge from '@/components/ui/UsageBadge';

type Tab = 'chat' | 'quests' | 'shop' | 'talents';

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat', label: 'CHAT', icon: '💬' },
  { id: 'quests', label: 'QUESTS', icon: '📋' },
  { id: 'shop', label: 'SHOP', icon: '🏪' },
  { id: 'talents', label: 'TALENTS', icon: '⚡' },
];

// QuestLog is now rendered INSIDE ChatInterface (has access to session.quests)
// When quests tab is active, ChatInterface shows QuestLog overlay

export default function PlayPage() {
  const router = useRouter();
  const player = useCharacterStore((state) => state.players[state.activePlayerIndex]);
  const questLog = player?.questLog;
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  // Guard: redirect if no character data
  if (!player?.species || !player?.career) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <ErrorBoundary>
    <main className="relative h-screen w-screen bg-black font-mono overflow-hidden">
      {/* Usage Badge — top right */}
      <div className="fixed top-2 right-2 z-40">
        <UsageBadge />
      </div>
      {/* Tab Content Area — full screen, stacked */}
      <div className="h-full w-full">
        {/* Chat + Quests (both rendered inside ChatInterface for session access) */}
        <div className={(activeTab === 'chat' || activeTab === 'quests') ? 'h-full w-full' : 'hidden'}>
          <ChatInterface showQuestsTab={activeTab === 'quests'} onCloseQuests={() => setActiveTab('chat')} />
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

      {/* Bottom Tab Bar — fixed, glass-morphism, larger touch targets */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-xl border-t border-zinc-800/50">
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
                <span className="text-xl leading-none">{tab.icon}</span>
                <span className={`text-[8px] font-black uppercase tracking-[0.12em] ${
                  isActive ? 'text-amber-500' : 'text-zinc-600'
                }`}>
                  {tab.label}
                </span>
                {/* Active indicator dot with glow */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5 glow-pulse" />
                )}
              </button>
            );
          })}
        </div>
        {/* Safe area padding for iPhones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </main>
    </ErrorBoundary>
  );
}
