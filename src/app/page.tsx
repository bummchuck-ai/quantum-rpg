'use client';

import React, { useState, useCallback } from 'react';
import SplashScreen from '@/components/start/SplashScreen';
import TutorialCards from '@/components/start/TutorialCards';
import ArchivePanel from '@/components/start/ArchivePanel';
import SystemPanel from '@/components/start/SystemPanel';
import HolocronOrb from '@/components/ui/HolocronOrb';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import { playConfirm, playNavigate } from '@/lib/sounds';
import { t } from '@/lib/i18n';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSystem, setShowSystem] = useState(false);
  const router = useRouter();
  const resetStore = useCharacterStore((state) => state.reset);
  const players = useCharacterStore((state) => state.players);

  const firstPlayer = players[0];
  const hasSave = !!(firstPlayer?.species && firstPlayer?.career);

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  const handleStart = () => {
    playConfirm();
    resetStore(); // CLEAN SLATE
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    router.push('/create');
  };

  const handleContinue = () => {
    playNavigate();
    const firstPlayer = players[0];
    if (firstPlayer?.name && firstPlayer?.species && firstPlayer?.career) {
      router.push('/play');
    } else {
      router.push('/create');
    }
  };

  return (
    <main className="h-dvh w-screen flex flex-col justify-between p-8 font-mono overflow-hidden select-none bg-black" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top, 2rem))' }}>

      {/* Background Holocron Orb — ambient decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <HolocronOrb size={350} opacity={0.15} />
      </div>

      {/* Splash Screen — shows once on app load */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Tutorial Cards — shows after "Neues Abenteuer" */}
      {showTutorial && (
        <TutorialCards onComplete={handleTutorialComplete} />
      )}

      {/* Header Status Bar */}
      <div className="flex justify-between items-start text-[9px] text-zinc-600 tracking-widest">
        <div className="space-y-1">
          <div>NODE_STATUS: ONLINE</div>
          <div>CORE_PROTOCOL: V4.0_OBSIDIAN</div>
        </div>
        <div className="text-right space-y-1">
          <div>ENCRYPTION: ACTIVE</div>
          <div className="text-emerald-500/50 flex items-center gap-1 justify-end">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
            SYNC_READY
          </div>
        </div>
      </div>

      {/* Hero Branding */}
      <div className="flex flex-col items-center">
        <div className="text-amber-500 text-[10px] tracking-[0.6em] mb-4 font-black">GALACTIC INTERFACE</div>
        <h1 className="text-7xl font-black italic tracking-tighter text-white">QUANTUM</h1>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-[1px] w-12 bg-zinc-800"></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Chronicles</span>
          <div className="h-[1px] w-12 bg-zinc-800"></div>
        </div>
      </div>

      {/* Tactical Menu */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <div onClick={handleStart} className="w-full">
          <div className="group relative border border-amber-500/30 bg-amber-500/[0.02] p-6 cursor-pointer transition-all duration-300 hover:bg-amber-500/[0.05] hover:border-amber-500 rounded-xl shadow-2xl">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-500"></div>

            <div className="flex justify-between items-center text-center w-full">
              <div className="w-full">
                <div className="text-[10px] text-amber-500 font-black mb-1 opacity-50 uppercase tracking-widest">[ INITIALIZE_LINK ]</div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{t('newAdventure')}</h2>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={hasSave ? handleContinue : undefined}
          className={`border p-5 rounded-xl text-center transition-all duration-300 ${
            hasSave
              ? 'border-zinc-700 bg-zinc-900/30 cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/50'
              : 'border-zinc-900 bg-zinc-900/10 opacity-40 cursor-not-allowed'
          }`}
        >
          {hasSave && <div className="text-[8px] text-emerald-500 font-black uppercase tracking-widest mb-1">{players[0]?.name || t('defaultPlayerName')} — {players[0]?.species?.name}</div>}
          <h2 className={`text-xl font-black uppercase italic tracking-tighter ${hasSave ? 'text-white' : 'text-zinc-600'}`}>{t('continueGame')}</h2>
        </div>

        <div className="flex gap-3">
          <div
            onClick={() => { playNavigate(); setShowArchive(true); }}
            className="flex-1 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer group rounded-xl text-center"
          >
            <div className="text-[8px] text-zinc-600 group-hover:text-zinc-400">DATABASE</div>
            <div className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">{t('archive')}</div>
          </div>
          <div
            onClick={() => { playNavigate(); setShowSystem(true); }}
            className="flex-1 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer group rounded-xl text-center"
          >
            <div className="text-[8px] text-zinc-600 group-hover:text-zinc-400">SETTINGS</div>
            <div className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">{t('system')}</div>
          </div>
        </div>
      </div>

      {/* Footer Readout */}
      <div className="text-[8px] text-zinc-700 text-center tracking-[0.2em] pt-8">
        © 2026 // FELIX_BUMMCHUCK-AI // DEPLOYED_REGION: OUTER_RIM_BBS
      </div>

      {/* Archive Panel */}
      {showArchive && (
        <ArchivePanel
          onClose={() => setShowArchive(false)}
          onLoadSave={() => router.push('/play')}
        />
      )}

      {/* System Panel */}
      {showSystem && (
        <SystemPanel onClose={() => setShowSystem(false)} />
      )}

    </main>
  );
}
