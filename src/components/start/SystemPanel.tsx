'use client';

import React, { useState, useEffect } from 'react';
import { setMasterVolume, getSettings, playClick } from '@/lib/sounds';
import { checkTTSSupport, checkSTTSupport, getSpeechSettings, setTTSEnabled, setSTTEnabled, startSoundtrack, stopSoundtrack, setMusicVolume, setSpeakerVolume, getMusicPlaying } from '@/lib/speech';
import { ALL_SKILLS } from '@/lib/skills';
import { getLanguage, setLanguage, t, type Language } from '@/lib/i18n';

const AudioSlider: React.FC<{ label: string; icon: string; value: number; onChange: (v: number) => void }> = ({ label, icon, value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm w-5">{icon}</span>
    <span className="text-[9px] text-zinc-500 font-bold w-14">{label}</span>
    <input type="range" min="0" max="100" value={Math.round(value * 100)}
      onChange={(e) => onChange(parseInt(e.target.value) / 100)}
      className="flex-1 h-1 accent-amber-500 bg-zinc-800 rounded-full appearance-none cursor-pointer" />
    <span className="text-[9px] text-zinc-600 w-8 text-right">{Math.round(value * 100)}%</span>
  </div>
);

const AudioControls: React.FC = () => {
  const [musicOn, setMusicOnState] = useState(false);
  const [musicVol, setMusicVol] = useState(0.3);
  const [speakerVol, setSpeakerVol] = useState(0.8);
  const [sfxVol, setSfxVol] = useState(0.8);

  useEffect(() => {
    setMusicOnState(getMusicPlaying());
    const s = getSpeechSettings();
    setMusicVol(s.musicVolume);
    setSpeakerVol(s.speakerVolume);
    setSfxVol(getSettings().masterVolume);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">🎵 Soundtrack</div>
        <button onClick={() => {
          if (musicOn) { stopSoundtrack(); setMusicOnState(false); }
          else { startSoundtrack(); setMusicOnState(true); }
        }} className={`w-12 h-6 rounded-full transition-colors relative ${musicOn ? 'bg-amber-500' : 'bg-zinc-800'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${musicOn ? 'left-[1.625rem]' : 'left-0.5'}`} />
        </button>
      </div>
      {musicOn && (
        <AudioSlider label="Musik" icon="🎵" value={musicVol} onChange={(v) => { setMusicVol(v); setMusicVolume(v); }} />
      )}
      <AudioSlider label="Sprecher" icon="🗣" value={speakerVol} onChange={(v) => { setSpeakerVol(v); setSpeakerVolume(v); }} />
      <AudioSlider label="Effekte" icon="💥" value={sfxVol} onChange={(v) => { setSfxVol(v); setMasterVolume(v); }} />
    </div>
  );
};

interface SystemPanelProps {
  onClose: () => void;
}

type SystemTab = 'settings' | 'hilfe' | 'credits' | 'debug';

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
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ keys: [], totalSize: 0 });
  const [ttsOn, setTtsOn] = useState(false);
  const [sttOn, setSttOn] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [lang, setLang] = useState<Language>('de');
  const [confirmClearSaves, setConfirmClearSaves] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  useEffect(() => {
    setStorageInfo(getStorageInfo());
    setTtsSupported(checkTTSSupport());
    setSttSupported(checkSTTSupport());
    const speech = getSpeechSettings();
    setTtsOn(speech.ttsEnabled);
    setSttOn(speech.sttEnabled);
    setLang(getLanguage());
  }, []);

  const handleClearSaves = () => {
    localStorage.removeItem('quantum-rpg-saves');
    localStorage.removeItem('quantum-rpg-autosave');
    setConfirmClearSaves(false);
    setClearMsg(t('savesDeleted'));
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
    setClearMsg(`${keysToRemove.length} ${t('dataDeleted')}`);
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
          {(['settings', 'hilfe', 'credits', 'debug'] as SystemTab[]).map((tk) => (
            <button
              key={tk}
              onClick={() => { setTab(tk); setConfirmClearSaves(false); setConfirmClearAll(false); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                tab === tk
                  ? tk === 'settings' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5'
                    : tk === 'hilfe' ? 'text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5'
                    : tk === 'credits' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5'
                    : 'text-red-500 border-b-2 border-red-500 bg-red-500/5'
                  : 'text-zinc-600'
              }`}
            >
              {tk === 'settings' ? t('settings') : tk === 'hilfe' ? t('help') : tk === 'credits' ? t('credits') : t('debug')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">

          {/* === SETTINGS === */}
          {tab === 'settings' && (
            <div className="space-y-5">
              {/* Language Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{t('language')}</div>
                </div>
                <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => { setLang('de'); setLanguage('de'); }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                      lang === 'de' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >DE</button>
                  <button
                    onClick={() => { setLang('en'); setLanguage('en'); }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                      lang === 'en' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >EN</button>
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-zinc-800" />

              {/* Soundtrack */}
              <AudioControls />

              {/* Separator */}
              <div className="h-px bg-zinc-800" />

              {/* TTS Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{t('narratorVoice')}</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">
                    {ttsSupported ? t('narratorDesc') : t('notSupported')}
                  </div>
                </div>
                <button
                  onClick={() => { const v = !ttsOn; setTtsOn(v); setTTSEnabled(v); }}
                  disabled={!ttsSupported}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    !ttsSupported ? 'bg-zinc-900 opacity-30 cursor-not-allowed' :
                    ttsOn ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ttsOn ? 'left-[1.625rem]' : 'left-0.5'}`} />
                </button>
              </div>

              {/* STT Toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{t('speechInput')}</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">
                    {sttSupported ? t('speechInputDesc') : t('notSupported')}
                  </div>
                </div>
                <button
                  onClick={() => { const v = !sttOn; setSttOn(v); setSTTEnabled(v); }}
                  disabled={!sttSupported}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    !sttSupported ? 'bg-zinc-900 opacity-30 cursor-not-allowed' :
                    sttOn ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${sttOn ? 'left-[1.625rem]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* === HELP === */}
          {tab === 'hilfe' && (
            <div className="space-y-5">
              {/* Game Tips */}
              <div>
                <div className="text-[9px] font-black text-cyan-500 uppercase tracking-wider mb-2">{t('gameTips')}</div>
                <div className="space-y-2">
                  <HelpCard icon="💾" text={t('tipAutoSave')} />
                  <HelpCard icon="📋" text={t('tipMissions')} />
                  <HelpCard icon="◐" text={t('tipDestiny')} />
                  <HelpCard icon="🎲" text={t('tipDice')} />
                  <HelpCard icon="♪" text={t('tipAmbient')} />
                  <HelpCard icon="⚡" text={t('tipForce')} />
                </div>
              </div>

              {/* Species Quick Reference */}
              <div>
                <div className="text-[9px] font-black text-cyan-500 uppercase tracking-wider mb-2">{t('speciesGuide')}</div>
                <div className="space-y-1.5">
                  <SpeciesGuideEntry name="Mensch" desc={t('speciesHuman')} bonus={lang === 'en' ? '+1 Non-Career Skill' : '+1 Nicht-Karriere Skill'} />
                  <SpeciesGuideEntry name="Twi'lek" desc={t('speciesTwilek')} bonus={lang === 'en' ? 'Charm / Deception' : 'Charme / Täuschung'} />
                  <SpeciesGuideEntry name="Wookiee" desc={t('speciesWookiee')} bonus={lang === 'en' ? 'Brawn / Resilience' : 'Stärke / Zähigkeit'} />
                  <SpeciesGuideEntry name={lang === 'en' ? 'Rodian' : 'Rodianisch'} desc={t('speciesRodian')} bonus={lang === 'en' ? 'Perception / Survival' : 'Wahrnehmung / Überleben'} />
                  <SpeciesGuideEntry name="Togruta" desc={t('speciesTogruta')} bonus={lang === 'en' ? 'Perception / Pack Instinct' : 'Wahrnehmung / Gruppeninstinkt'} />
                  <SpeciesGuideEntry name={lang === 'en' ? 'Bothan' : 'Bothanisch'} desc={t('speciesBothan')} bonus={lang === 'en' ? 'Streetwise / Persuasion' : 'Streetwise / Überzeugung'} />
                  <SpeciesGuideEntry name={lang === 'en' ? 'Droid' : 'Droide'} desc={t('speciesDroid')} bonus={lang === 'en' ? 'No Food/Sleep' : 'Kein Essen/Schlafen'} />
                </div>
              </div>

              {/* Skills Reference */}
              <div>
                <div className="text-[9px] font-black text-cyan-500 uppercase tracking-wider mb-2">{t('skillsOverview')}</div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                  {(['general', 'combat', 'knowledge'] as const).map(cat => (
                    <div key={cat} className="mb-2 last:mb-0">
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-wider mb-1">
                        {cat === 'general' ? t('general') : cat === 'combat' ? t('combat') : t('knowledge')}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        {ALL_SKILLS.filter(s => s.category === cat).map(s => (
                          <div key={s.key} className="flex justify-between items-center">
                            <span className="text-[9px] text-zinc-400 truncate capitalize">{lang === 'en' ? s.key : s.nameDE}</span>
                            <span className="text-[8px] text-zinc-600 shrink-0 ml-1">{s.characteristic === 'brawn' ? 'ST' : s.characteristic === 'agility' ? 'GE' : s.characteristic === 'intellect' ? 'IN' : s.characteristic === 'cunning' ? 'LI' : s.characteristic === 'willpower' ? 'WI' : 'CH'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                <CreditLine label={t('conceptDev')} value="Felix Kolbow" />
                <CreditLine label={t('aiGM')} value="Claude AI (Anthropic)" />
                <CreditLine label={t('ruleSystem')} value="FFG Star Wars RPG / Genesys" />
                <CreditLine label="Framework" value="Next.js + React" />
                <CreditLine label="Styling" value="Tailwind CSS v4" />
                <CreditLine label="State Management" value="Zustand" />
                <CreditLine label="Sound Engine" value="Web Audio API" />
                <CreditLine label="Deployment" value="Vercel" />
              </div>

              <div className="h-px bg-zinc-800 my-4" />

              <div className="text-center text-[8px] text-zinc-700 space-y-1">
                <div>{t('copyrightSW')}</div>
                <div>{t('copyrightFFG')}</div>
                <div className="mt-2 text-zinc-600">{t('copyrightFan')}</div>
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
                    <div className="text-[9px] text-zinc-700 italic">{t('noEntries')}</div>
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
                  {t('totalSize')}: {formatBytes(storageInfo.totalSize)}
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
                      {t('confirmDeleteSaves')}
                    </button>
                    <button
                      onClick={() => setConfirmClearSaves(false)}
                      className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearSaves(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                  >
                    {t('deleteAllSaves')}
                  </button>
                )}

                {confirmClearAll ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      {t('confirmDeleteAll')}
                    </button>
                    <button
                      onClick={() => setConfirmClearAll(false)}
                      className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearAll(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-red-400/70 font-bold py-2.5 rounded-xl text-[9px] uppercase tracking-widest"
                  >
                    {t('deleteAllData')}
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
            {t('close')}
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

/** Help card for tips */
function HelpCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
      <span className="text-sm shrink-0">{icon}</span>
      <span className="text-[10px] text-zinc-400 leading-relaxed">{text}</span>
    </div>
  );
}

/** Species guide entry */
function SpeciesGuideEntry({ name, desc, bonus }: { name: string; desc: string; bonus: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 flex justify-between items-start gap-2">
      <div className="min-w-0">
        <div className="text-[10px] font-black text-white uppercase">{name}</div>
        <div className="text-[8px] text-zinc-500 leading-snug mt-0.5">{desc}</div>
      </div>
      <div className="text-[8px] text-cyan-500/70 font-bold shrink-0 text-right">{bonus}</div>
    </div>
  );
}

export default SystemPanel;
