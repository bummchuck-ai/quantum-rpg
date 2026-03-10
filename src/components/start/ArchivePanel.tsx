'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import {
  getSaves, setSaves, formatDate, validateSaveData, slugify,
  AUTOSAVE_KEY, PENDING_RESTORE_KEY, MAX_SLOTS,
  type SaveSlot,
} from '@/lib/save-utils';

interface ArchivePanelProps {
  onClose: () => void;
  onLoadSave: () => void;
}

const ArchivePanel: React.FC<ArchivePanelProps> = ({ onClose, onLoadSave }) => {
  const [saves, setSavesState] = useState<SaveSlot[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAutosave, setHasAutosave] = useState(false);
  const [autosaveInfo, setAutosaveInfo] = useState<{ savedAt: string; characterName?: string; species?: string; career?: string; messageCount?: number } | null>(null);
  const importState = useCharacterStore((state) => state.importState);

  useEffect(() => {
    setSavesState(getSaves());
    // Check for autosave
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const autoData = JSON.parse(raw);
        setHasAutosave(true);
        // Try to extract character info from autosave
        let charName = 'Unbekannt';
        let species = '';
        let career = '';
        let messageCount = 0;
        try {
          const storeData = typeof autoData.storeState === 'string' ? JSON.parse(autoData.storeState) : autoData.storeState;
          const player = storeData?.players?.[0];
          if (player) {
            charName = player.name || 'Unbekannt';
            species = player.species?.name || '';
            career = player.career?.name || '';
          }
        } catch { /* use defaults */ }
        messageCount = autoData.chatMessages?.length || 0;
        setAutosaveInfo({
          savedAt: autoData.savedAt,
          characterName: charName,
          species,
          career,
          messageCount,
        });
      }
    } catch { /* no autosave */ }
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const loadFromData = (fullData: any) => {
    const validation = validateSaveData(fullData);
    if (!validation.valid) {
      setError(validation.error || 'Ungültige Daten.');
      return false;
    }
    // Import character store state
    importState(typeof fullData.storeState === 'string' ? fullData.storeState : JSON.stringify(fullData.storeState));
    // Store full data for deferred restore by ChatInterface
    localStorage.setItem(PENDING_RESTORE_KEY, JSON.stringify(fullData));
    return true;
  };

  const handleLoad = (slot: SaveSlot) => {
    try {
      setError(null);
      const fullData = JSON.parse(slot.data);
      if (loadFromData(fullData)) {
        onLoadSave();
      }
    } catch (e) {
      console.error('Failed to load save:', e);
      setError('Spielstand konnte nicht geladen werden.');
    }
  };

  const handleLoadAutosave = () => {
    try {
      setError(null);
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) { setError('Kein Autosave gefunden.'); return; }
      const fullData = JSON.parse(raw);
      if (loadFromData(fullData)) {
        onLoadSave();
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
    showSuccess('Spielstand gelöscht.');
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
        if (fullData.storeState) {
          if (loadFromData(fullData)) {
            showSuccess('Spielstand importiert.');
            setTimeout(onLoadSave, 800);
          }
        } else {
          // Legacy: raw character store export
          importState(content);
          showSuccess('Charakter importiert (altes Format).');
          setTimeout(() => onLoadSave(), 800);
        }
      } catch (err) {
        console.error('Import failed:', err);
        setError('Die Datei enthält kein gültiges JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalSaves = saves.length + (hasAutosave ? 1 : 0);

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
          <div className="text-[9px] text-zinc-600 mt-1">
            {totalSaves > 0 ? `${totalSaves} Spielstand${totalSaves > 1 ? 'e' : ''} gefunden` : 'Keine Spielstände vorhanden'}
          </div>
        </div>

        {/* Status Messages */}
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

        {/* Save Slots */}
        <div className="p-4 space-y-2 max-h-[55vh] overflow-y-auto">
          {/* Autosave */}
          {hasAutosave && autosaveInfo && (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Autosave</div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  </div>
                  <div className="text-[10px] font-black text-white uppercase italic mt-1 truncate">
                    {autosaveInfo.characterName}
                  </div>
                  <div className="text-[8px] text-zinc-500 mt-0.5">
                    {[autosaveInfo.species, autosaveInfo.career].filter(Boolean).join(' • ')}
                    {autosaveInfo.messageCount ? ` • ${autosaveInfo.messageCount} Nachr.` : ''}
                  </div>
                  <div className="text-[7px] text-zinc-700 mt-1">{formatDate(autosaveInfo.savedAt)}</div>
                </div>
                <button
                  onClick={handleLoadAutosave}
                  className="bg-amber-600/80 text-black text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-amber-500 shrink-0 ml-2"
                >
                  Laden
                </button>
              </div>
            </div>
          )}

          {/* Manual Slots */}
          {Array.from({ length: MAX_SLOTS }).map((_, i) => {
            const slot = saves.find(s => s.id === `slot-${i}`);
            return (
              <div key={i} className={`border rounded-xl p-3 ${slot ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-800/50 bg-zinc-950'}`}>
                {slot ? (
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-white uppercase italic truncate">{slot.characterName}</div>
                      <div className="text-[8px] text-zinc-500">
                        {slot.species} • {slot.career}
                        {slot.messageCount ? ` • ${slot.messageCount} Nachr.` : ''}
                      </div>
                      <div className="text-[7px] text-zinc-700 mt-1">{formatDate(slot.timestamp)}</div>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-2">
                      <button
                        onClick={() => handleLoad(slot)}
                        className="bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-500"
                      >
                        Laden
                      </button>
                      {confirmDelete === slot.id ? (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg"
                        >
                          Sicher?
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(slot.id)}
                          className="text-zinc-700 hover:text-red-500 text-[10px] px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] text-zinc-700 italic uppercase">Slot {i + 1} — Leer</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <label className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest cursor-pointer text-center">
            Datei importieren
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
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
