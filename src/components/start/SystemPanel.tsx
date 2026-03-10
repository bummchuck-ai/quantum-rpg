'use client';

import React, { useState, useEffect } from 'react';
import { setMasterVolume, setSFXMuted, setAmbientMuted, getSettings, playClick } from '@/lib/sounds';

interface SystemPanelProps {
  onClose: () => void;
}

type SystemTab = 'settings' | 'credits' | 'debug';

interface StorageInfo {
  keys: { key: string; size: number }[];
  totalSize: number;
}

function getStorageInfo(): StorageInfo {
  if (typeof window === 'undefined') return { keys: [], totalSize: 0 };
  const keys: { key: string; size: number }[] = [];
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      const size = new Blob([value]).size;
      keys.push({ key, size });
      totalSize += size;
    }
  }
  keys.sort((a, b) => b.size - a.size);
  return { keys, totalSize };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const SystemPanel: React.FC<SystemPanelProps> = ({ onClose }) => {
  const [tab, setTab] = useState<SystemTab>('settings');
  const [volume, setVolume] = useState(80);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [ambMuted, setAmbMuted] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ keys: [], totalSize: 0 });
  const [confirmClearSaves, setConfirmClearSaves] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  // Load initial settings
  useEffect(() => {
    const s = getSettings();
    setVolume(Math.round(s.masterVolume * 100));
    setSfxMuted(s.sfxMuted);
    setAmbMuted(s.ambientMuted);
    setStorageInfo(getStorageInfo());
  }, []);

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    setMasterVolume(val / 100);
  };

  const handleSFXToggle = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    setSFXMuted(next);
    if (!next) playClick(); // Play a sound when unmuting
  };

  const handleAmbientToggle = () => {
    const next = !ambMuted;
    setAmbMuted(next);
    setAmbientMuted(next);
  };

  const handleClearSaves = () => {
    localStorage.removeItem('quantum-rpg-saves');
    localStorage.removeItem('quantum-rpg-autosave');
    setConfirmClearSaves(false);
    setClearMsg('Alle Spielstände gelöscht.');
    setStorageInfo(getStorageInfo());
    setTimeout(() => setClearMsg(null), 3000);
  };

  const handleClearAll = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('quantum-rpg')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setConfirmClearAll(false);
    setClearMsg(`${keysToRemove.length} Einträge gelöscht. Seite wird neu geladen...`);
    setStorageInfo(getStorageInfo());
    setTimeout(() => window.location.reload(), 2000);
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
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">System</h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-800">
          {(['settings', 'credits', 'debug'] as SystemTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setConfirmClearSaves(false); setConfirmClearAll(false); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                tab === t
                  ? t === 'settings' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5'
                    : t === 'credits' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5'
                    : 'text-red-500 border-b-2 border-red-500 bg-red-500/5'
                  : 'text-zinc-600'
              }`}
            >
              {t === 'settings' ? 'Einstellungen' : t === 'credits' ? 'Credits' : 'Debug'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">

          {/* === EINSTELLUNGEN === */}
          {tab === 'settings' && (
            <div className="space-y-5">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Master-Lautstärke</label>
                  <span className="text-[10px] font-black text-amber-500">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                />
              </div>

              {/* SFX Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Sound-Effekte</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">UI-Klicks, Würfel, Kampf</div>
                </div>
                <button
                  onClick={handleSFXToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative ${sfxMuted ? 'bg-zinc-800' : 'bg-amber-500'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${sfxMuted ? 'left-0.5' : 'left-[1.625rem]'}`} />
                </button>
              </div>

              {/* Ambient Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Ambient-Musik</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">Hintergrund-Atmosphäre</div>
                </div>
                <button
                  onClick={handleAmbientToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative ${ambMuted ? 'bg-zinc-800' : 'bg-amber-500'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ambMuted ? 'left-0.5' : 'left-[1.625rem]'}`} />
                </button>
              </div>
            </div>
          )}

          {/* === CREDITS === */}
          {tab === 'credits' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-black text-white italic tracking-tighter mb-1">QUANTUM</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Chronicles</div>
                <div className="text-[8px] text-zinc-700 mt-2">Version 1.0</div>
              </div>

              <div className="h-px bg-zinc-800 my-4" />

              <div className="space-y-3">
                <CreditLine label="Konzept & Entwicklung" value="Felix Bummchuck" />
                <CreditLine label="KI Game Master" value="Claude AI (Anthropic)" />
                <CreditLine label="Regelwerk" value="FFG Star Wars RPG / Genesys" />
                <CreditLine label="Framework" value="Next.js + React" />
                <CreditLine label="Styling" value="Tailwind CSS v4" />
                <CreditLine label="State Management" value="Zustand" />
                <CreditLine label="Sound Engine" value="Web Audio API (Synthese)" />
                <CreditLine label="Deployment" value="Vercel" />
              </div>

              <div className="h-px bg-zinc-800 my-4" />

              <div className="text-center text-[8px] text-zinc-700 space-y-1">
                <div>Star Wars ist ein Warenzeichen von Lucasfilm Ltd.</div>
                <div>Genesys/FFG ist ein Warenzeichen von Fantasy Flight Games.</div>
                <div className="mt-2 text-zinc-600">Dieses Projekt ist ein Fan-Werk und steht in keiner</div>
                <div className="text-zinc-600">Verbindung zu den Rechteinhabern.</div>
              </div>
            </div>
          )}

          {/* === DEBUG === */}
          {tab === 'debug' && (
            <div className="space-y-4">
              {/* Status */}
              {clearMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  {clearMsg}
                </div>
              )}

              {/* Storage Overview */}
              <div>
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-2">LocalStorage</div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {storageInfo.keys.length === 0 ? (
                    <div className="text-[9px] text-zinc-700 italic">Keine Einträge</div>
                  ) : (
                    storageInfo.keys.map(({ key, size }) => (
                      <div key={key} className="flex justify-between text-[9px]">
                        <span className={`truncate mr-2 ${key.startsWith('quantum-rpg') ? 'text-amber-500/70' : 'text-zinc-600'}`}>
                          {key}
                        </span>
                        <span className="text-zinc-700 shrink-0">{formatBytes(size)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-[8px] text-zinc-700 mt-1.5 text-right">
                  Gesamt: {formatBytes(storageInfo.totalSize)}
                </div>
              </div>

              {/* Clear Saves */}
              <div className="space-y-2">
                {confirmClearSaves ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearSaves}
                      className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      Ja, Spielstände löschen
                    </button>
                    <button
                      onClick={() => setConfirmClearSaves(false)}
                      className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearSaves(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                  >
                    Alle Spielstände löschen
                  </button>
                )}

                {confirmClearAll ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      Ja, ALLES löschen
                    </button>
                    <button
                      onClick={() => setConfirmClearAll(false)}
                      className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearAll(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-red-400/70 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                  >
                    Alle App-Daten löschen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-zinc-800">
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

/** Simple credit line component */
function CreditLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{label}</span>
      <span className="text-[10px] text-white font-bold">{value}</span>
    </div>
  );
}

export default SystemPanel;
