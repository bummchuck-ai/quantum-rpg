'use client';

import React, { useState, useEffect } from 'react';

const SAVE_FORMAT_VERSION = 2;

interface SaveSlot {
  id: string;
  name: string;
  characterName: string;
  species: string;
  career: string;
  timestamp: string;
  level?: number;
  messageCount?: number;
  data: string;
}

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

const STORAGE_KEY = 'quantum-rpg-saves';
const AUTOSAVE_KEY = 'quantum-rpg-autosave';
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

/** Validate that save data has the expected structure */
function validateSaveData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Keine gültigen Daten.' };
  if (!data.storeState) return { valid: false, error: 'Charakter-Daten fehlen.' };
  if (!data.chatMessages && !data.savedAt) return { valid: false, error: 'Keine Spielstand-Struktur erkannt.' };
  return { valid: true };
}

const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  exportState, importState, characterName, speciesName, careerName, chatMessages, sessionState, onClose, onRestoreSession
}) => {
  const [saves, setSavesState] = useState<SaveSlot[]>([]);
  const [tab, setTab] = useState<'save' | 'load'>('save');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAutosave, setHasAutosave] = useState(false);
  const [autosaveInfo, setAutosaveInfo] = useState<{ savedAt: string; characterName?: string } | null>(null);

  useEffect(() => {
    setSavesState(getSaves());
    // Check for autosave
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const autoData = JSON.parse(raw);
        setHasAutosave(true);
        setAutosaveInfo({ savedAt: autoData.savedAt, characterName: characterName });
      }
    } catch { /* no autosave */ }
  }, [characterName]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

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

  const handleSave = (slotIndex: number) => {
    setError(null);
    try {
      const fullData = buildSavePayload();
      const slot: SaveSlot = {
        id: `slot-${slotIndex}`,
        name: `Slot ${slotIndex + 1}`,
        characterName,
        species: speciesName,
        career: careerName,
        timestamp: new Date().toISOString(),
        messageCount: chatMessages.length,
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
      showSuccess(`Slot ${slotIndex + 1} gespeichert.`);
    } catch (e) {
      setError('Speichern fehlgeschlagen. Möglicherweise ist der Speicher voll.');
    }
  };

  const restoreFromData = (fullData: any) => {
    const validation = validateSaveData(fullData);
    if (!validation.valid) {
      setError(validation.error || 'Ungültige Daten.');
      return false;
    }
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
    return true;
  };

  const handleLoad = (slot: SaveSlot) => {
    try {
      setError(null);
      const fullData = JSON.parse(slot.data);
      if (restoreFromData(fullData)) {
        onClose();
      }
    } catch (e) {
      console.error('Failed to load save:', e);
      setError('Spielstand konnte nicht geladen werden. Die Datei ist beschädigt.');
    }
  };

  const handleLoadAutosave = () => {
    try {
      setError(null);
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) { setError('Kein Autosave gefunden.'); return; }
      const fullData = JSON.parse(raw);
      if (restoreFromData(fullData)) {
        onClose();
      }
    } catch (e) {
      console.error('Failed to load autosave:', e);
      setError('Autosave konnte nicht geladen werden.');
    }
  };

  const handleDelete = (slotId: string) => {
    const newSaves = saves.filter(s => s.id !== slotId);
    setSaves(newSaves);
    setSavesState(newSaves);
    setConfirmDelete(null);
  };

  const handleExportFile = () => {
    setError(null);
    try {
      const fullData = buildSavePayload();
      const blob = new Blob([fullData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum-${characterName || 'save'}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Datei exportiert.');
    } catch (e) {
      setError('Export fehlgeschlagen.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setError(null);
        const content = event.target?.result as string;
        const fullData = JSON.parse(content);
        // Support legacy format (storeState only) and new format
        if (fullData.storeState) {
          if (restoreFromData(fullData)) {
            showSuccess('Spielstand importiert.');
            setTimeout(onClose, 1000);
          }
        } else {
          // Legacy: raw character store export
          importState(content);
          showSuccess('Charakter importiert (altes Format).');
          setTimeout(onClose, 1000);
        }
      } catch (err) {
        console.error('Import failed:', err);
        setError('Import fehlgeschlagen. Die Datei enthält kein gültiges JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-imported
    e.target.value = '';
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

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-[10px] font-bold text-red-400 uppercase tracking-wide">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
            {success}
          </div>
        )}

        {/* Autosave Recovery */}
        {tab === 'load' && hasAutosave && (
          <div className="mx-4 mt-3 p-3 bg-amber-500/5 border border-amber-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[9px] font-black text-amber-500 uppercase">Autosave vorhanden</div>
                {autosaveInfo?.savedAt && (
                  <div className="text-[7px] text-zinc-600 mt-0.5">{formatDate(autosaveInfo.savedAt)}</div>
                )}
              </div>
              <button onClick={handleLoadAutosave} className="bg-amber-600/80 text-black text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-amber-500">
                Wiederherstellen
              </button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const slot = saves.find(s => s.id === `slot-${i}`);
            return (
              <div key={i} className={`border rounded-xl p-3 ${slot ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-800/50 bg-zinc-950'}`}>
                {slot ? (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black text-white uppercase italic">{slot.characterName}</div>
                      <div className="text-[8px] text-zinc-500">{slot.species} • {slot.career}{slot.messageCount ? ` • ${slot.messageCount} Nachrichten` : ''}</div>
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
