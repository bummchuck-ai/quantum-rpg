'use client';

import React from 'react';
import { SAVE_FORMAT_VERSION } from '@/lib/save-utils';
import SaveSlotGrid from '@/components/shared/SaveSlotGrid';

interface SessionStateData {
  session: any;
  combat: any;
  ownedPowers: string[];
  ownedUpgrades: string[];
  forceRating: number;
}

interface SaveLoadPanelProps {
  exportState: () => string;
  importState: (data: string) => void;
  characterName: string;
  speciesName: string;
  careerName: string;
  chatMessages: any[];
  sessionState: SessionStateData;
  onClose: () => void;
  onRestoreSession?: (data: { messages: any[]; session?: any; combat?: any; ownedPowers?: string[]; ownedUpgrades?: string[] }) => void;
}

const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  exportState, importState, characterName, speciesName, careerName, chatMessages, sessionState, onClose, onRestoreSession
}) => {
  const buildSavePayload = () => JSON.stringify({
    version: SAVE_FORMAT_VERSION,
    storeState: exportState(),
    chatMessages,
    session: sessionState.session,
    combat: sessionState.combat,
    ownedPowers: sessionState.ownedPowers,
    ownedUpgrades: sessionState.ownedUpgrades,
    forceRating: sessionState.forceRating,
    savedAt: new Date().toISOString(),
  });

  const handleLoad = (fullData: any) => {
    importState(fullData.storeState);
    if (onRestoreSession) {
      onRestoreSession({
        messages: fullData.chatMessages || [],
        session: fullData.session,
        combat: fullData.combat,
        ownedPowers: fullData.ownedPowers,
        ownedUpgrades: fullData.ownedUpgrades,
      });
    }
  };

  const handleExportFile = () => {
    try {
      const fullData = buildSavePayload();
      const blob = new Blob([fullData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum-${characterName || 'save'}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 animate-in fade-in duration-300 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">System_Core</div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Spielstand</h2>
        </div>

        <SaveSlotGrid
          onLoad={handleLoad}
          onAfterLoad={onClose}
          buildSavePayload={buildSavePayload}
          characterInfo={{
            name: characterName,
            species: speciesName,
            career: careerName,
            messageCount: chatMessages.length,
          }}
          showSaveTab
          importLegacyState={(content) => importState(content)}
          onExportFile={handleExportFile}
        />

        <div className="px-4 pb-4">
          <button onClick={onClose} className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveLoadPanel;
