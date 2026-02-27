'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import IntroModal from '@/components/create/IntroModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showIntro, setShowIntro] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setShowIntro(true);
  };

  return (
    <main className="h-screen w-screen flex flex-col justify-between p-8 font-mono overflow-hidden select-none bg-black">
      
      {showIntro && (
        <IntroModal onClose={() => router.push('/create')} />
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
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">NEUES ABENTEUER</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/10 p-5 opacity-40 cursor-not-allowed rounded-xl text-center">
          <h2 className="text-xl font-black text-zinc-600 uppercase italic tracking-tighter">FORTSETZEN</h2>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer group rounded-xl text-center">
            <div className="text-[8px] text-zinc-600 group-hover:text-zinc-400">DATABASE</div>
            <div className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">Archiv</div>
          </div>
          <div className="flex-1 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer group rounded-xl text-center">
            <div className="text-[8px] text-zinc-600 group-hover:text-zinc-400">SETTINGS</div>
            <div className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">System</div>
          </div>
        </div>
      </div>

      {/* Footer Readout */}
      <div className="text-[8px] text-zinc-700 text-center tracking-[0.2em] pt-8">
        © 2026 // IEE_MARKETING_LABS // DEPLOYED_REGION: OUTER_RIM_BBS
      </div>

    </main>
  );
}
