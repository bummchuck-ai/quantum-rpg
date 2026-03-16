'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DiceRollerModal from './DiceRollerModal';
import CombatTracker from './CombatTracker';
import ForcePowerPanel from './ForcePowerPanel';
import QuestLog from './QuestLog';
import SaveLoadPanel from './SaveLoadPanel';
import GameOverScreen from './GameOverScreen';
import HolocronOrb from '@/components/ui/HolocronOrb';
import { ALL_SKILLS } from '@/lib/skills';
import { calculateDerivedStats } from '@/lib/engine/derived-stats';
import { slugify } from '@/lib/save-utils';
import { getLanguage, t } from '@/lib/i18n';
import { getVoicesForLang, setTTSVoiceName, getSpeechSettings, startSoundtrack, stopSoundtrack, setMusicVolume, setSpeakerVolume, getMusicPlaying } from '@/lib/speech';
import { setMasterVolume, getSettings as getSfxSettings } from '@/lib/sounds';
import { useGameSession } from './useGameSession';
import type { GMResponse } from './types';

const VolumeSlider: React.FC<{ label: string; icon: string; value: number; onChange: (v: number) => void }> = ({ label, icon, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) / 100);
  return (
  <div className="flex items-center gap-2 px-4 py-2">
    <span className="text-base w-6">{icon}</span>
    <span className="text-[10px] text-zinc-500 font-bold w-16">{label}</span>
    <input
      type="range" min="0" max="100" value={Math.round(value * 100)}
      onChange={handleChange}
      onInput={handleChange as any}
      className="flex-1 h-1 accent-amber-500 bg-zinc-800 rounded-full appearance-none cursor-pointer"
    />
    <span className="text-[9px] text-zinc-600 w-8 text-right">{Math.round(value * 100)}%</span>
  </div>
  );
};

const MusicControls: React.FC = () => {
  const [musicOn, setMusicOn] = useState(getMusicPlaying());
  const [musicVol, setMusicVol] = useState(() => getSpeechSettings().musicVolume);
  const [speakerVol, setSpeakerVol] = useState(() => getSpeechSettings().speakerVolume);
  const [sfxVol, setSfxVol] = useState(() => getSfxSettings().masterVolume);

  return (
    <div className="space-y-1">
      <button onClick={() => {
        if (musicOn) { stopSoundtrack(); setMusicOn(false); }
        else { startSoundtrack(); setMusicOn(true); }
      }} className="w-full flex items-center justify-between px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
        <span><span className="text-base mr-2">🎵</span> <span className="font-bold">Soundtrack</span></span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${musicOn ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 bg-zinc-800'}`}>{musicOn ? 'ON' : 'OFF'}</span>
      </button>
      {musicOn && (
        <VolumeSlider label="Musik" icon="🎵" value={musicVol} onChange={(v) => { setMusicVol(v); setMusicVolume(v); }} />
      )}
      <VolumeSlider label="Sprecher" icon="🗣" value={speakerVol} onChange={(v) => { setSpeakerVol(v); setSpeakerVolume(v); }} />
      <VolumeSlider label="Effekte" icon="💥" value={sfxVol} onChange={(v) => { setSfxVol(v); setMasterVolume(v); }} />
    </div>
  );
};

const QuickSettings: React.FC<{
  onSaveLoad: () => void;
  onGoHome: () => void;
  ttsEnabled: boolean;
  sttEnabled: boolean;
  onToggleTTS: () => void;
  onToggleSTT: () => void;
  onTestTTS: () => void;
}> = ({ onSaveLoad, onGoHome, ttsEnabled, sttEnabled, onToggleTTS, onToggleSTT, onTestTTS }) => {
  const [open, setOpen] = useState(false);
  const [showVoices, setShowVoices] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const lang = getLanguage();
  const voices = open && ttsEnabled ? getVoicesForLang(lang === 'en' ? 'en' : 'de') : [];

  React.useEffect(() => {
    if (open) {
      const s = getSpeechSettings();
      setSelectedVoice(s.ttsVoiceName);
    }
  }, [open]);

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); setShowVoices(false); }} className="w-9 h-9 border border-zinc-800 rounded-lg bg-zinc-900/80 flex items-center justify-center active:scale-90 text-sm transition-transform">
        ⚙
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-[15%] z-[100] max-w-sm mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-white uppercase italic tracking-wider">Settings</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-2">
              {/* Save / Load */}
              <button onClick={() => { onSaveLoad(); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
                <span className="text-base">💾</span> <span className="font-bold">Save / Load</span>
              </button>

              {/* TTS Toggle */}
              <div className="flex items-center gap-1">
                <button onClick={onToggleTTS} className="flex-1 flex items-center justify-between px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
                  <span><span className="text-base mr-2">🔊</span> <span className="font-bold">GM Stimme</span></span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${ttsEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 bg-zinc-800'}`}>{ttsEnabled ? 'ON' : 'OFF'}</span>
                </button>
                {ttsEnabled && (
                  <button onClick={onTestTTS} className="w-11 h-11 border border-zinc-800 rounded-xl flex items-center justify-center text-amber-500 hover:bg-zinc-800 transition-colors font-black text-sm">▶</button>
                )}
              </div>

              {/* Voice Selection */}
              {ttsEnabled && (
                <>
                  <button onClick={() => setShowVoices(!showVoices)} className="w-full flex items-center justify-between px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
                    <span><span className="text-base mr-2">🗣</span> <span className="font-bold">Stimme wählen</span></span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{selectedVoice?.split(' ')[0] || 'Auto'}</span>
                  </button>
                  {showVoices && voices.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-950">
                      <button onClick={() => { setTTSVoiceName(null); setSelectedVoice(null); onTestTTS(); }}
                        className={`w-full text-left px-4 py-2.5 text-[11px] hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 ${!selectedVoice ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                        Auto (Standard)
                      </button>
                      {voices.map(v => (
                        <button key={v.name} onClick={() => { setTTSVoiceName(v.name); setSelectedVoice(v.name); onTestTTS(); }}
                          className={`w-full text-left px-4 py-2.5 text-[11px] hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0 ${selectedVoice === v.name ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STT Toggle */}
              <button onClick={onToggleSTT} className="w-full flex items-center justify-between px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
                <span><span className="text-base mr-2">🎙</span> <span className="font-bold">Spracheingabe</span></span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${sttEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600 bg-zinc-800'}`}>{sttEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <div className="h-px bg-zinc-800 my-2" />

              {/* Music Toggle + Volume */}
              <MusicControls />

              <div className="h-px bg-zinc-800 my-2" />

              {/* Back to Home */}
              <button onClick={() => { setOpen(false); onGoHome(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20">
                <span className="text-base">🏠</span> <span className="font-bold">Zurück zum Startbildschirm</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ChatInterface: React.FC<{ showQuestsTab?: boolean; onCloseQuests?: () => void }> = ({ showQuestsTab, onCloseQuests }) => {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    // State
    messages, setMessages, isTyping, inputValue, setInputValue,
    session, setSession, combat, setCombat,
    ownedPowers, setOwnedPowers, ownedUpgrades, setOwnedUpgrades,
    toasts,

    // Panel toggles
    showCharSheet, setShowCharSheet,
    showSaveLoad, setShowSaveLoad,
    showForcePowers, setShowForcePowers,
    showQuestLog, setShowQuestLog,
    showDiceRoller, setShowDiceRoller, activeRollRequest,

    // Derived
    activePlayer, players, activePlayerIndex, setActivePlayer,
    derived, forceRating, isForceSensitive, talentNames,
    exportState, importState,

    // TTS / STT
    ttsEnabled, setTTSEnabled, testTTS,
    isSpeaking, stopSpeaking,
    sttEnabled, setSTTEnabled, sttSupported, isListening, transcript,
    startListening, stopListening,

    // Handlers
    handleSendMessage, initiateRoll, handleRollComplete, getInitialPool,
    handleBuyPower, handleBuyUpgrade, handleUsePower,
    handleEndCombat, handleNextRound, handleFlipDestiny,
  } = useGameSession();

  // Route guard: redirect if character is incomplete
  useEffect(() => {
    if (!activePlayer?.species || !activePlayer?.career) {
      router.push('/');
    }
  }, [activePlayer, router]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activePlayer?.species || !activePlayer?.career) {
    return <div className="min-h-screen bg-black" />;
  }

  const {
    name, species, career, characteristics, credits, ownedGear,
    specializations, selectedSubspecies, wounds, strain, availableXP,
  } = activePlayer;

  const { woundThreshold, strainThreshold, soak, defense } = derived;
  const encumbranceMax = 5 + characteristics.brawn;

  // Mood indicator colors
  const moodColors: Record<string, string> = {
    tense: 'text-orange-500', calm: 'text-cyan-500', dangerous: 'text-red-500',
    mysterious: 'text-purple-500', exciting: 'text-amber-500', sad: 'text-blue-400', triumphant: 'text-yellow-500',
  };

  return (
    <main className="h-screen w-screen bg-black text-zinc-300 font-mono flex flex-col overflow-hidden relative">
      {/* Background Holocron Orb */}
      <div className="absolute bottom-32 right-[-60px] pointer-events-none z-0">
        <HolocronOrb size={280} opacity={0.08} />
      </div>

      {/* Game Over Screen */}
      {activePlayer?.isDeceased && (
        <GameOverScreen
          playerName={name || 'Unbekannt'}
          speciesName={species?.name || 'Unbekannt'}
          careerName={career?.name || 'Unbekannt'}
          deathCause={activePlayer.deathCause || 'Unbekannte Ursache'}
          deathLocation={activePlayer.deathLocation || session.scene.location || 'Unbekannt'}
          totalXP={(activePlayer.availableXP || 0) + (activePlayer.spentXP || 0)}
          questsCompleted={session.quests.filter(q => q.status === 'completed').length}
          selectedSubspecies={selectedSubspecies}
          onNewGame={() => { router.push('/'); }}
          onLoadSave={() => setShowSaveLoad(true)}
        />
      )}

      {/* Overlays */}
      {showQuestsTab && (
        <div className="absolute inset-0 z-[90] bg-black">
          <QuestLog
            quests={session.quests}
            npcs={session.npcs}
            onClose={() => onCloseQuests?.()}
          />
        </div>
      )}
      {showSaveLoad && (
        <SaveLoadPanel
          exportState={exportState} importState={importState}
          characterName={name} speciesName={species?.name || ''} careerName={career?.name || ''}
          chatMessages={messages}
          sessionState={{ session, combat, ownedPowers, ownedUpgrades, forceRating }}
          onClose={() => setShowSaveLoad(false)}
          onRestoreSession={(data) => {
            setMessages(data.messages);
            if (data.session) setSession(data.session);
            if (data.combat) setCombat(data.combat);
            if (data.ownedPowers) setOwnedPowers(data.ownedPowers);
            if (data.ownedUpgrades) setOwnedUpgrades(data.ownedUpgrades);
          }}
        />
      )}
      {showDiceRoller && activeRollRequest && (
        <DiceRollerModal initialPool={getInitialPool()} skillName={activeRollRequest.skill} difficulty={activeRollRequest.difficulty} onRollComplete={handleRollComplete} onClose={() => setShowDiceRoller(false)} />
      )}
      {showForcePowers && (
        <ForcePowerPanel
          career={career} ownedTalents={talentNames} ownedPowers={ownedPowers}
          ownedUpgrades={ownedUpgrades} availableXP={availableXP}
          onBuyPower={handleBuyPower} onBuyUpgrade={handleBuyUpgrade}
          onUsePower={handleUsePower} onClose={() => setShowForcePowers(false)}
        />
      )}
      {showQuestLog && (
        <QuestLog quests={session.quests} npcs={session.npcs} onClose={() => setShowQuestLog(false)} />
      )}
      {/* Character Sheet — Slide-up panel */}
      {showCharSheet && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={() => setShowCharSheet(false)}>
          <div className="fixed inset-x-0 bottom-0 max-h-[92vh] bg-zinc-950 rounded-t-3xl slide-up-sheet flex flex-col border-t border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            </div>
            <header className="px-4 pb-3 flex justify-between items-center">
              <h2 className="text-lg font-black text-white italic tracking-tight uppercase">{name}</h2>
              <button onClick={() => setShowCharSheet(false)} className="w-9 h-9 border border-zinc-800 rounded-lg flex items-center justify-center text-lg text-zinc-500 active:scale-90">✕</button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
            {/* Identity */}
            <section className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl flex items-center gap-3.5">
              {species?.name && (
                <img
                  src={selectedSubspecies
                    ? `/species/${slugify(species.name)}-${slugify(selectedSubspecies)}.jpg`
                    : `/species/${slugify(species.name)}.jpg`
                  }
                  alt={selectedSubspecies || species.name}
                  className="w-20 h-20 object-cover object-top rounded-xl border border-zinc-700"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = `/species/${slugify(species.name)}.jpg`;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              )}
              <div className="min-w-0">
                <div className="text-sm font-black text-white italic truncate">{name}</div>
                <div className="text-[10px] text-zinc-500">{species?.name} • {career?.name} / {specializations?.[0]?.name || '—'}</div>
                {isForceSensitive && <div className="text-[9px] text-purple-400 font-black mt-1">MACHTSENSITIV • FR {forceRating}</div>}
              </div>
            </section>
            {/* Attributes — D6DB-inspired cards */}
            <section>
              <div className="text-[9px] text-zinc-600 font-black uppercase mb-2.5 tracking-[0.2em]">Attribute</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(characteristics).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                    <span className="text-2xl font-black text-white leading-none mb-1">{val}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wide">{
                      key === 'brawn' ? 'Stärke' : key === 'agility' ? 'Geschick' : key === 'intellect' ? 'Intellekt' :
                      key === 'cunning' ? 'List' : key === 'willpower' ? 'Willenskr.' : key === 'presence' ? 'Präsenz' : key.substring(0, 5)
                    }</span>
                  </div>
                ))}
              </div>
            </section>
            {/* Derived Stats */}
            <section className="grid grid-cols-4 gap-2">
              <div className="bg-zinc-900/50 border border-zinc-800 p-2.5 rounded-xl text-center">
                <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Soak</div>
                <div className="text-xl font-black text-white">{soak}</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-2.5 rounded-xl text-center">
                <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">DEF</div>
                <div className="text-xl font-black text-white">{defense}</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-2.5 rounded-xl text-center">
                <div className="text-[7px] text-red-500/60 font-black uppercase tracking-widest">Wunden</div>
                <div className="text-xl font-black text-red-500">{wounds}/{woundThreshold}</div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-xl text-center">
                <div className="text-[7px] text-blue-500/60 font-black uppercase tracking-widest">Stress</div>
                <div className="text-xl font-black text-blue-400">{strain}/{strainThreshold}</div>
              </div>
            </section>
            {/* Skills — show trained first */}
            <section>
              <div className="text-[9px] text-zinc-600 font-black uppercase mb-2.5 tracking-[0.2em]">Fertigkeiten</div>
              <div className="space-y-0.5">
                {[...ALL_SKILLS].sort((a, b) => ((activePlayer.skillRanks || {})[b.key] || 0) - ((activePlayer.skillRanks || {})[a.key] || 0)).map(skill => {
                  const skillRank = (activePlayer.skillRanks || {})[skill.key] || 0;
                  const charVal = (characteristics as any)[skill.characteristic] || 2;
                  if (skillRank === 0) return null;
                  return (
                    <div key={skill.key} className="flex justify-between items-center py-1.5 border-b border-zinc-900/50 last:border-0">
                      <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-300">{skill.nameDE}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(p => (
                            <div key={p} className={`w-2.5 h-2.5 rounded-full ${p <= skillRank ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'}`} />
                          ))}
                        </div>
                        <span className="text-[9px] text-zinc-600 font-black w-8 text-right tabular-nums">{charVal}+{skillRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Integrated Inventory */}
            <section>
              <div className="text-[9px] text-zinc-600 font-black uppercase mb-2.5 tracking-[0.2em]">Inventar ({ownedGear.length}/{encumbranceMax})</div>
              <div className="space-y-1.5">
                {ownedGear.length > 0 ? ownedGear.map((g: any, i: number) => (
                  <div key={i} className="p-2.5 border border-zinc-800 bg-zinc-900/40 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase italic">{g.name}</span>
                    <span className="text-[8px] text-amber-500 font-black">{g.damage ? `DMG ${g.damage}` : g.soak ? `SOAK ${g.soak}` : 'ITEM'}</span>
                  </div>
                )) : <div className="text-[10px] text-zinc-700 italic">{t('noGear')}</div>}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Credits</span>
                <span className="text-sm font-black text-amber-500">{credits} Cr</span>
              </div>
            </section>
            {/* Vehicles / Base */}
            {activePlayer.vehicles && activePlayer.vehicles.length > 0 && (
              <section>
                <div className="text-[8px] text-zinc-600 font-black uppercase mb-3 tracking-[0.2em]">Schiff / Basis</div>
                {activePlayer.vehicles.map((v) => (
                  <div key={v.id} className="border border-zinc-800 bg-zinc-950 rounded-xl p-3 space-y-2">
                    <div className="text-[10px] font-black text-white uppercase italic tracking-tighter">{v.name}</div>
                    <div className="text-[7px] text-zinc-600">{v.manufacturer}</div>
                    {v.category === 'base' ? (
                      <div className="text-[8px] text-zinc-500">Typ: Basis</div>
                    ) : (
                      v.silhouette > 0 && (
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[['SIL', v.silhouette], ['SPD', v.speed], ['ARM', v.armor], ['HULL', `${v.currentHullTrauma}/${v.hullTraumaThreshold}`]].map(([l, val]) => (
                            <div key={String(l)}><div className="text-[6px] text-zinc-700 font-black uppercase">{l}</div><div className="text-xs font-black text-zinc-400">{val}</div></div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </section>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Header HUD — Compact 3-row layout */}
      <header className="bg-zinc-950/90 border-b border-zinc-800/60 backdrop-blur-xl z-20 shadow-2xl" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Row 1: Avatar + Name + W/S bars + Settings */}
        <div className="px-3 pt-2 pb-1.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowCharSheet(true)} className="w-10 h-10 border border-amber-500/40 rounded-lg bg-amber-500/5 flex items-center justify-center active:scale-90 transition-transform overflow-hidden">
              {species?.name ? (
                <img
                  src={selectedSubspecies
                    ? `/species/${slugify(species.name)}-${slugify(selectedSubspecies)}.jpg`
                    : `/species/${slugify(species.name)}.jpg`
                  }
                  alt={species.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = `/species/${slugify(species.name)}.jpg`;
                    } else {
                      img.style.display = 'none';
                      const span = document.createElement('span');
                      span.className = 'text-amber-500 font-black italic text-base';
                      span.textContent = name?.charAt(0) || 'Q';
                      img.parentElement?.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span className="text-amber-500 font-black italic text-base">{name?.charAt(0) || 'Q'}</span>
              )}
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-white italic tracking-tight truncate max-w-[120px] leading-tight">{name || 'PILOT_UNKNOWN'}</h1>
              <div className="text-[8px] text-zinc-500 tracking-wide">{species?.name} • {career?.name}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            {/* Wound/Strain compact bars */}
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-red-500/60 font-black">W</span>
                <div className="w-14 h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all rounded-full" style={{ width: `${Math.max(0, Math.min(100, (wounds / Math.max(1, woundThreshold)) * 100))}%` }} />
                </div>
                <span className="text-[8px] text-red-500 font-black w-7 text-right tabular-nums">{wounds}/{woundThreshold}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] text-blue-500/60 font-black">S</span>
                <div className="w-14 h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all rounded-full" style={{ width: `${Math.max(0, Math.min(100, (strain / Math.max(1, strainThreshold)) * 100))}%` }} />
                </div>
                <span className="text-[8px] text-blue-400 font-black w-7 text-right tabular-nums">{strain}/{strainThreshold}</span>
              </div>
            </div>
            <QuickSettings
              onSaveLoad={() => setShowSaveLoad(true)}
              onGoHome={() => router.push('/')}
              ttsEnabled={ttsEnabled}
              sttEnabled={sttEnabled}
              onToggleTTS={() => setTTSEnabled(!ttsEnabled)}
              onToggleSTT={() => setSTTEnabled(!sttEnabled)}
              onTestTTS={() => testTTS(getLanguage() === 'en' ? 'en-US' : 'de-DE')}
            />
          </div>
        </div>

        {/* Row 2: Scene location with mood-colored left border */}
        <div className={`mx-3 mb-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/40 border-l-2 ${
          session.scene.mood === 'dangerous' || session.scene.mood === 'tense' ? 'border-red-500/60' :
          session.scene.mood === 'calm' ? 'border-cyan-500/60' :
          session.scene.mood === 'mysterious' ? 'border-purple-500/60' :
          session.scene.mood === 'exciting' || session.scene.mood === 'triumphant' ? 'border-amber-500/60' :
          'border-zinc-700/60'
        }`}>
          <div className="flex items-center gap-1.5 text-[9px]">
            <span className="text-zinc-600">🌍</span>
            <span className="text-zinc-400 font-bold">{session.scene.planet}</span>
            <span className="text-zinc-700">›</span>
            <span className={`font-bold ${moodColors[session.scene.mood] || 'text-zinc-400'}`}>{session.scene.location || '...'}</span>
            {session.scene.timeOfDay && (<>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-500">{session.scene.timeOfDay === 'morgen' || session.scene.timeOfDay === 'morning' ? '☀' : session.scene.timeOfDay === 'nacht' || session.scene.timeOfDay === 'night' ? '🌙' : '🌤'} {session.scene.timeOfDay}</span>
            </>)}
          </div>
        </div>

        {/* Row 3: Compact toolbar — Force powers + Destiny pool only */}
        <div className="px-3 pb-2 flex gap-1.5 items-center">
          {isForceSensitive && (
            <button onClick={() => setShowForcePowers(true)} className="text-[9px] font-black bg-purple-500/10 border border-purple-500/30 px-2.5 py-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:border-purple-500/50 active:scale-95 transition-all flex items-center gap-1" title="Machtkräfte">
              <span className="text-xs">⚡</span>FR{forceRating}
            </button>
          )}
          {/* Destiny Pool — merged into single display */}
          <div className="flex items-center gap-0.5 text-[9px] font-black bg-zinc-900/80 border border-zinc-800 px-2 py-1.5 rounded-lg">
            <button onClick={() => handleFlipDestiny('light')} className="text-cyan-400 hover:text-cyan-300 active:scale-90 transition-all flex items-center gap-0.5" title="Licht nutzen">
              ◐<span className="tabular-nums">{session.destinyPool.lightSide}</span>
            </button>
            <span className="text-zinc-700 mx-0.5">/</span>
            <button onClick={() => handleFlipDestiny('dark')} className="text-red-400 hover:text-red-300 active:scale-90 transition-all flex items-center gap-0.5" title="Dunkel nutzen">
              ◑<span className="tabular-nums">{session.destinyPool.darkSide}</span>
            </button>
          </div>
        </div>

        {/* Multi-player bar */}
        {players.length > 1 && (
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {players.map((p, idx) => (
              <div key={p.id} onClick={() => setActivePlayer(idx)} className={`min-w-[90px] p-1.5 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${activePlayerIndex === idx ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-black/40 opacity-40'}`}>
                <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[9px] font-black">{p.name?.charAt(0) || idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black uppercase truncate text-white">{p.name || 'PILOT'}</div>
                  <div className="h-0.5 w-full bg-zinc-800 mt-0.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${Math.max(0, 100 - (p.wounds / Math.max(1, calculateDerivedStats(p.species, p.characteristics, []).woundThreshold)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-44">
        {/* Combat tracker */}
        {combat.active && (
          <CombatTracker combat={combat} onEndCombat={handleEndCombat} onNextRound={handleNextRound} />
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[92%] ${msg.role === 'player' ? 'bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-xl' : 'space-y-3'}`}>
              {msg.role === 'gm' && typeof msg.content !== 'string' ? (
                <div className="space-y-4">
                  {msg.content.error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-sm font-mono text-red-200">{msg.content.error}</div>}
                  {msg.content.narrative && <p className="text-[15px] leading-snug text-zinc-300 font-sans">{msg.content.narrative}</p>}
                  {Array.isArray(msg.content.npcDialogue) && msg.content.npcDialogue.length > 0 && (
                    <div className="space-y-2.5 border-l-2 border-amber-500/30 pl-4 bg-amber-500/[0.02] py-2 rounded-r-lg">
                      {msg.content.npcDialogue.map((d: { name?: string; speaker?: string; text: string }, idx: number) => (
                        <div key={idx}>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.15em]">{d.name || d.speaker}</span>
                          <p className="text-[14px] text-zinc-400 mt-0.5 font-sans leading-snug">&ldquo;{d.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content.requiresRoll && msg.content.rollInfo && (
                    <div className="bg-amber-500/5 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-0.5">{getLanguage() === 'en' ? 'Check' : 'Probe'}</div>
                        <div className="text-sm font-black text-white uppercase italic truncate">{msg.content.rollInfo.skill} <span className="text-zinc-600">//</span> {msg.content.rollInfo.difficulty}</div>
                        {msg.content.rollInfo.reason && <div className="text-[9px] text-zinc-500 mt-0.5 truncate">{msg.content.rollInfo.reason}</div>}
                      </div>
                      <button onClick={() => { const ri = (msg.content as GMResponse).rollInfo!; initiateRoll(ri.skill, ri.difficulty, ri.reason || '', ri.boost, ri.setback); }} className="bg-amber-600 hover:bg-amber-500 text-black font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest animate-pulse shrink-0">
                        {t('rollDice')}
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {msg.content.options?.map((opt: { id: string; text: string }) => (
                      <button key={opt.id} onClick={() => handleSendMessage(opt.text)} className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-3.5 rounded-xl text-left transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] text-amber-500 font-black opacity-50 border border-amber-500/20 w-5 h-5 flex items-center justify-center rounded shrink-0">{opt.id}</span>
                          <span className="text-[13px] text-zinc-400 font-bold leading-snug">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-200">{typeof msg.content === 'string' ? msg.content : msg.content.narrative}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-900/30 text-[9px] text-amber-500 font-black uppercase tracking-[0.3em] px-3 py-2 border border-amber-500/10 rounded-lg">{t('gmThinking')}</div>
          </div>
        )}
        {isSpeaking && (
          <div className="flex justify-start">
            <button
              onClick={stopSpeaking}
              className="bg-amber-500/10 text-[9px] text-amber-400 font-black uppercase tracking-[0.3em] px-4 py-2 border border-amber-500/30 rounded-lg animate-pulse hover:bg-amber-500/20 transition-colors flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              {t('narratorActive')}
            </button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Toast overlay — fixed above input bar */}
      {toasts.length > 0 && (
        <div className="fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map((toast) => {
            const colors = {
              xp: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
              system: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
              combat: 'bg-red-500/15 border-red-500/40 text-red-400',
              heal: 'bg-green-500/15 border-green-500/40 text-green-400',
            };
            return (
              <div key={toast.id} className={`toast-up px-5 py-2 rounded-xl border backdrop-blur-md ${colors[toast.type]} shadow-lg`}>
                <span className="text-xs font-black uppercase tracking-wider">{toast.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Input bar — sits above the bottom tab nav (h-16 + safe-area) */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-3 bg-gradient-to-t from-black via-black/95 to-transparent z-30">
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input
              className={`w-full bg-zinc-950 border px-4 py-3.5 rounded-2xl text-sm outline-none text-white placeholder:text-zinc-700 shadow-2xl font-mono transition-colors ${
                isListening ? 'border-red-500/60' : 'border-zinc-800 focus:border-amber-500/60'
              }`}
              placeholder={isListening ? t('listening') : t('inputPlaceholder')}
              value={isListening ? transcript : inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
              onFocus={(e) => { setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}
              readOnly={isListening}
            />
          </div>
          {sttEnabled && sttSupported && (
            <button
              onPointerDown={() => { stopSpeaking(); startListening(); }}
              onPointerUp={() => stopListening()}
              onPointerLeave={() => { if (isListening) stopListening(); }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400'
              }`}
              title={t('holdToSpeak')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          )}
          <button onClick={() => handleSendMessage(inputValue)} className="bg-amber-600 hover:bg-amber-500 text-black px-7 rounded-2xl transition-all active:scale-90 font-black text-base">
            GO
          </button>
        </div>
      </div>
      {/* HolocronGuide removed — tips now in Settings > Hilfe */}
    </main>
  );
};
export default ChatInterface;
