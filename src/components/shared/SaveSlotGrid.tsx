'use client';

import React, { useState, useEffect } from 'react';
import {
  getSaves, setSaves, validateSaveData, formatDate,
  AUTOSAVE_KEY, MAX_SLOTS, SAVE_FORMAT_VERSION,
  type SaveSlot,
} from '@/lib/save-utils';

// ============================================================
// SaveSlotGrid — Shared save slot rendering for start screen & in-game
// ============================================================

interface AutosaveInfo {
  savedAt: string;
  characterName?: string;
  species?: string;
  career?: string;
  messageCount?: number;
}

export interface SaveSlotGridProps {
  /** Called when user selects a save to load. Receives parsed save data. */
  onLoad: (fullData: any) => void;
  /** Called after successful load (e.g. close panel, navigate) */
  onAfterLoad?: () => void;
  /** If provided, save functionality is available */
  buildSavePayload?: () => string;
  /** Current character info for save slot metadata */
  characterInfo?: {
    name: string;
    species: string;
    career: string;
    messageCount: number;
  };
  /** Whether to show save/load tabs (default: false — load only) */
  showSaveTab?: boolean;
  /** Called to import raw state (legacy format support) */
  importLegacyState?: (data: string) => void;
  /** Called to export current game as file */
  onExportFile?: () => void;
}

const SaveSlotGrid: React.FC<SaveSlotGridProps> = ({
  onLoad,
  onAfterLoad,
  buildSavePayload,
  characterInfo,
  showSaveTab = false,
  importLegacyState,
  onExportFile,
}) => {
  const [saves, setSavesState] = useState<SaveSlot[]>([]);
  const [tab, setTab] = useState<'save' | 'load'>(showSaveTab ? 'save' : 'load');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAutosave, setHasAutosave] = useState(false);
  const [autosaveInfo, setAutosaveInfo] = useState<AutosaveInfo | null>(null);

  useEffect(() => {
    setSavesState(getSaves());
    // Check for autosave
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const autoData = JSON.parse(raw);
        setHasAutosave(true);
        // Extract character info from autosave
        let charName = characterInfo?.name || 'Unbekannt';
        let species = '';
        let career = '';
        let messageCount = 0;
        try {
          const storeData = typeof autoData.storeState === 'string' ? JSON.parse(autoData.storeState) : autoData.storeState;
          const player = storeData?.players?.[0];
          if (player) {
            charName = player.name || charName;
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
  }, [characterInfo?.name]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSave = (slotIndex: number) => {
    if (!buildSavePayload || !characterInfo) return;
    setError(null);
    try {
      const fullData = buildSavePayload();
      const slot: SaveSlot = {
        id: `slot-${slotIndex}`,
        name: `Slot ${slotIndex + 1}`,
        characterName: characterInfo.name,
        species: characterInfo.species,
        career: characterInfo.career,
        timestamp: new Date().toISOString(),
        messageCount: characterInfo.messageCount,
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
    } catch {
      setError('Speichern fehlgeschlagen. Möglicherweise ist der Speicher voll.');
    }
  };

  const handleLoad = (slot: SaveSlot) => {
    try {
      setError(null);
      const fullData = JSON.parse(slot.data);
      const validation = validateSaveData(fullData);
      if (!validation.valid) {
        setError(validation.error || 'Ungültige Daten.');
        return;
      }
      onLoad(fullData);
      onAfterLoad?.();
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
      const validation = validateSaveData(fullData);
      if (!validation.valid) {
        setError(validation.error || 'Ungültige Daten.');
        return;
      }
      onLoad(fullData);
      onAfterLoad?.();
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
          const validation = validateSaveData(fullData);
          if (!validation.valid) {
            setError(validation.error || 'Ungültige Daten.');
            return;
          }
          onLoad(fullData);
          showSuccess('Spielstand importiert.');
          setTimeout(() => onAfterLoad?.(), 800);
        } else if (importLegacyState) {
          // Legacy: raw character store export
          importLegacyState(content);
          showSuccess('Charakter importiert (altes Format).');
          setTimeout(() => onAfterLoad?.(), 800);
        } else {
          setError('Unbekanntes Dateiformat.');
        }
      } catch (err) {
        console.error('Import failed:', err);
        setError('Die Datei enthält kein gültiges JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const showLoadTab = !showSaveTab || tab === 'load';
  const totalSaves = saves.length + (hasAutosave ? 1 : 0);

  return (
    <>
      {/* Tab Toggle (only when save tab is enabled) */}
      {showSaveTab && (
        <div className="flex border-b border-zinc-800">
          <button onClick={() => setTab('save')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${tab === 'save' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5' : 'text-zinc-600'}`}>
            Speichern
          </button>
          <button onClick={() => setTab('load')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${tab === 'load' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-zinc-600'}`}>
            Laden
          </button>
        </div>
      )}

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

      {/* Autosave (shown on load tab or load-only mode) */}
      {showLoadTab && hasAutosave && autosaveInfo && (
        <div className="mx-4 mt-3 border border-amber-500/30 bg-amber-500/5 rounded-xl p-3">
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
              {autosaveInfo.savedAt && (
                <div className="text-[7px] text-zinc-700 mt-1">{formatDate(autosaveInfo.savedAt)}</div>
              )}
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

      {/* Save Slots */}
      <div className="p-4 space-y-2 max-h-[55vh] overflow-y-auto">
        {!showSaveTab && totalSaves === 0 && (
          <div className="text-[9px] text-zinc-600 text-center py-4 italic uppercase">Keine Spielstände vorhanden</div>
        )}
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
                    {tab === 'save' && showSaveTab ? (
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
                      <button onClick={() => setConfirmDelete(slot.id)} className="text-zinc-700 hover:text-red-500 text-[10px] px-1">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-[9px] text-zinc-700 italic uppercase">Slot {i + 1} — Leer</div>
                  {tab === 'save' && showSaveTab && (
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

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <div className="flex gap-2">
          {onExportFile && (
            <button onClick={onExportFile} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest">
              Als Datei exportieren
            </button>
          )}
          <label className={`${onExportFile ? 'flex-1' : 'block w-full'} bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl text-[9px] uppercase tracking-widest cursor-pointer text-center flex items-center justify-center`}>
            Datei importieren
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>
    </>
  );
};

export default SaveSlotGrid;
