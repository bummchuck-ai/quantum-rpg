'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { PENDING_RESTORE_KEY } from '@/lib/save-utils';
import SaveSlotGrid from '@/components/shared/SaveSlotGrid';

interface ArchivePanelProps {
  onClose: () => void;
  onLoadSave: () => void;
}

const ArchivePanel: React.FC<ArchivePanelProps> = ({ onClose, onLoadSave }) => {
  const importState = useCharacterStore((state) => state.importState);

  const handleLoad = (fullData: any) => {
    // Import character store state
    importState(typeof fullData.storeState === 'string' ? fullData.storeState : JSON.stringify(fullData.storeState));
    // Store full data for deferred restore by ChatInterface
    localStorage.setItem(PENDING_RESTORE_KEY, JSON.stringify(fullData));
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 animate-in fade-in duration-300 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl slide-up-sheet">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 pt-2 border-b border-zinc-800">
          <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">System_Core</div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Archiv</h2>
        </div>

        <SaveSlotGrid
          onLoad={handleLoad}
          onAfterLoad={onLoadSave}
          importLegacyState={(content) => {
            importState(content);
          }}
        />

        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivePanel;
