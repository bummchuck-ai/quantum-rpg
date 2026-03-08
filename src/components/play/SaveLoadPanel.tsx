'use client';

import React, { useState, useEffect } from 'react';

interface SaveSlot {
  id: string;
  name: string;
  characterName: string;
  species: string;
  career: string;
  timestamp: string;
  data: string;
}

interface SaveLoadPanelProps {
  exportState: () => string;
  importState: (data: string) => void;
  characterName: string;
  speciesName: string;
  careerName: string;
  chatMessages: any[];
  onClose: () => void;
}

const STORAGE_KEY = 'quantum-rpg-saves';
const MAX_SLOTS = 6;

function getSaves(): SaveSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function setSaves(saves: SaveSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  exportState, importState, characterName, speciesName, careerName, chatMessages, onClose
}) => {
  const [saves, setSavesState] = useState<SaveSlot[]>([]);
  const [tab, setTab] = useState<'save' | 'load'>('save');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setSavesState(getSaves());
  }, []);

  const handleSave = (slotIndex: number) => {
    const fullData = JSON.stringify({
      storeState: exportState(),
      chatMessages,
      savedAt: new Date().toISOString(),
    });
    const slot: SaveSlot = {
      id: `slot-${slotIndex}`,
      name: `Slot ${slotIndex + 1}`,
      characterName,
      species: speciesName,
      career: careerName,
      timestamp: new Date().toISOString(),
      data: fullData,
    };
    const newSaves = [...saves];
    const existingIdx = newSaves.findIndex(s => s.id === slot.id);
    if (existingIdx >= 0) {
      newSaves[existingIdx] = slot;
    } else {
      newSaves.push(slot);
    }
    setSaves(newSaves);
    setSavesState(newSaves);
  };

  const handleLoad = (slot: SaveSlot) => {
    try {
      const fullData = JSON.parse(slot.data);
      importState(fullData.storeState);
      window.location.reload();
    } catch (e) {
      console.error('Failed to load save:', e);
    }
  };

  const handleDelete = (slotId: string) => {
    const newSaves = saves.filter(s => s.id !== slotId);
    setSaves(newSaves);
    setSavesState(newSaves);
    setConfirmDelete(null);
  };

  const handleExportFile = () => {
    const fullData = JSON.stringify({
      storeState: exportState(),
      chatMessages,
      savedAt: new Date().toISOString(),
    });
    const blob = new Blob([fullData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-${characterName || 'save'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const fullData = JSON.parse(content);
        importState(fullData.storeState || content);
        window.location.reload();
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('de-DE')} ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 animate-in fade-in duration-300 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800">
          <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">System_Core</div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Spielstand</h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-800">
          <button onClick={() => setTab('save')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${tab === 'save' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5' : 'text-zinc-600'}`}>
            Speichern
          </button>
          <button onClick={() => setTab('load')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${tab === 'load' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-zinc-600'}`}>
            Laden
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const slot = saves.find(s => s.id === `slot-${i}`);
            return (
              <div key={i} className={`border rounded-xl p-3 ${slot ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-800/50 bg-zinc-950'}`}>
                {slot ? (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black text-white uppercase italic">{slot.characterName}</div>
                      <div className="text-[8px] text-zinc-500">{slot.species} • {slot.career}</div>
                      <div className="text-[7px] text-zinc-700 mt-1">{formatDate(slot.timestamp)}</div>
                    </div>
                    <div className="flex gap-2">
                      {tab === 'save' ? (
                        <button onClick={() => handleSave(i)} className="bg-amber-600 text-black text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-amber-500">
                          Überschreiben
                        </button>
                      ) : (
                        <button onClick={() => handleLoad(slot)} className="bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-500">
                          Laden
                        </button>
                      )}
                      {confirmDelete === slot.id ? (
                        <button onClick={() => handleDelete(slot.id)} className="bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg">
                          Sicher?
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDelete(slot.id)} className="text-zinc-700 hover:text-red-500 text-[10px]">✕</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] text-zinc-700 italic uppercase">Slot {i + 1} — Leer</div>
                    {tab === 'save' && (
                      <button onClick={() => handleSave(i)} className="bg-zinc-800 text-amber-500 text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                        Speichern
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <div className="flex gap-2">
            <button onClick={handleExportFile} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest">
              Als Datei exportieren
            </button>
            <label className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest cursor-pointer text-center flex items-center justify-center">
              Datei importieren
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
          <button onClick={onClose} className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveLoadPanel;
