'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { DicePool, formatRollResult, RollResult, buildSkillPool } from '@/lib/engine/dice';
import { isForceCareer, calculateForceRating } from '@/lib/engine/force-powers';
import { createInitialCombatState, createPCCombatant, createNPCCombatant, nextRound, type CombatState } from '@/lib/engine/combat';
import { createNewSession, addQuest, updateQuest, addNPC, updateNPC, flipDestiny, type GameSession, type SessionStartContext } from '@/lib/engine/game-state';
import { calculateDerivedStats } from '@/lib/engine/derived-stats';
import {
  playDiceRoll, playQuestReceived,
  playCombatStart, playCombatVictory, playCombatDefeat,
  playCriticalHit, playDestinyFlip, playNPCMeet,
  playForceUse, playSceneChange,
} from '@/lib/sounds';
import { PENDING_RESTORE_KEY } from '@/lib/save-utils';
import { useSpeech } from '@/hooks/useSpeech';
import { getLanguage, t } from '@/lib/i18n';
import { resolveSkill } from '@/lib/skills';
import type { Message, RollRequest, Toast, GMResponse } from './types';
import { DIFFICULTY_MAP, AUTOSAVE_INTERVAL } from './types';

export function useGameSession() {
  const {
    players, activePlayerIndex, updateStatus, exportState, importState, setActivePlayer, spendXP, buyGear, grantXP
  } = useCharacterStore();

  const activePlayer = players[activePlayerIndex];

  // Core chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Panel toggles
  const [showCharSheet, setShowCharSheet] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showForcePowers, setShowForcePowers] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [activeRollRequest, setActiveRollRequest] = useState<RollRequest | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // TTS / STT
  const {
    ttsEnabled, isSpeaking, speakText, stopSpeaking, setTTSEnabled, testTTS,
    sttEnabled, sttSupported, isListening, transcript,
    startListening, stopListening, clearTranscript, setSTTEnabled,
  } = useSpeech();

  // Toast auto-dismiss (single timer, prevents queue explosion)
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts.length]);

  // STT: Sync final transcript to input
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
      clearTranscript();
    }
  }, [transcript, isListening, clearTranscript]);

  // Game state — derive initial scene from character choices (vehicle/base)
  const [session, setSession] = useState<GameSession>(() => {
    const vehicle = activePlayer?.vehicles?.[0];
    const ctx: SessionStartContext = {
      characterName: activePlayer?.name || 'Pilot',
      speciesName: activePlayer?.species?.name,
      careerName: activePlayer?.career?.name,
      vehicle: vehicle ? {
        name: vehicle.name,
        category: vehicle.category,
        specialFeatures: vehicle.specialFeatures,
      } : null,
    };
    return createNewSession(ctx);
  });
  const [combat, setCombat] = useState<CombatState>(() => createInitialCombatState());
  const [ownedPowers, setOwnedPowers] = useState<string[]>([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState<string[]>([]);

  const gmMessageCount = useRef(0);

  // Derived values (need activePlayer to be valid)
  const characteristics = activePlayer?.characteristics;
  const species = activePlayer?.species;
  const career = activePlayer?.career;
  const name = activePlayer?.name;
  const ownedGear = activePlayer?.ownedGear;
  const ownedTalents = activePlayer?.ownedTalents;
  const availableXP = activePlayer?.availableXP;
  const specializations = activePlayer?.specializations;

  const derived = species && characteristics
    ? calculateDerivedStats(species, characteristics, ownedGear || [])
    : { woundThreshold: 0, strainThreshold: 0, soak: 0, defense: 0 };

  const talentNames = (ownedTalents || []).map((t: any) => typeof t === 'string' ? t : t.name);
  const forceRating = career ? calculateForceRating(career, talentNames) : 0;
  const isForceSensitive = career ? isForceCareer(career) : false;

  // Pending restore from start screen Archive
  useEffect(() => {
    const pendingRaw = localStorage.getItem(PENDING_RESTORE_KEY);
    if (pendingRaw) {
      try {
        const pendingData = JSON.parse(pendingRaw);
        localStorage.removeItem(PENDING_RESTORE_KEY);
        if (pendingData.chatMessages?.length > 0) {
          setMessages(pendingData.chatMessages);
        }
        if (pendingData.session) setSession(pendingData.session);
        if (pendingData.combat) setCombat(pendingData.combat);
        if (pendingData.ownedPowers) setOwnedPowers(pendingData.ownedPowers);
        if (pendingData.ownedUpgrades) setOwnedUpgrades(pendingData.ownedUpgrades);
        return; // Skip startGame() — we restored from save
      } catch (e) {
        console.error('Pending restore failed, starting fresh:', e);
        localStorage.removeItem(PENDING_RESTORE_KEY);
      }
    }
    // Normal flow: start new game via GM API
    startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save (last 50 messages only to reduce localStorage writes)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const autoSaveData = JSON.stringify({
          version: 2,
          storeState: exportState(),
          chatMessages: messages.slice(-50),
          session,
          combat,
          ownedPowers,
          ownedUpgrades,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('quantum-rpg-autosave', autoSaveData);
      } catch (e) { /* silent */ }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [messages, session, combat, ownedPowers, ownedUpgrades, exportState]);

  const buildGameState = useCallback(() => ({
    character: { ...activePlayer, vehicles: activePlayer?.vehicles || [] },
    party: players.map(p => {
      const stats = calculateDerivedStats(p.species, p.characteristics ?? { brawn: 0, willpower: 0 }, []);
      return {
        name: p.name,
        species: p.species?.name,
        career: p.career?.name,
        specialization: p.specializations?.[0]?.name,
        wounds: p.wounds,
        strain: p.strain,
        woundThreshold: stats.woundThreshold,
        strainThreshold: stats.strainThreshold,
      };
    }),
    currentPlanet: session.scene.planet,
    currentScene: session.scene.location,
    sessionHistory: messages.slice(-10).map(m => typeof m.content === 'string' ? m.content : m.content.narrative || ''),
    destinyPool: session.destinyPool,
    questLog: session.quests,
    npcRelationships: session.npcs.map(n => ({
      npcName: n.name,
      disposition: n.disposition,
      notes: n.description,
      faction: n.faction || null,
      isAlive: n.isAlive,
      location: n.location || null,
    })),
    combatActive: combat.active,
    combatRound: combat.round,
    combatants: combat.active ? combat.combatants : [],
    forceRating,
    ownedPowers,
    ownedUpgrades,
    storySummary: session.storySummary || '',
    criticalInjuries: session.criticalInjuries || [],
    currentMood: session.scene.mood || 'neutral',
    timeOfDay: session.scene.timeOfDay || '',
    soak: derived.soak,
    defense: derived.defense,
  }), [activePlayer, players, session, messages, combat, forceRating, ownedPowers, ownedUpgrades, derived.soak, derived.defense]);

  const buildStartMessage = (): string => {
    const vehicle = activePlayer?.vehicles?.[0];
    const parts: string[] = [];

    parts.push(`[SPIELSTART] Beginne das Abenteuer für ${name}.`);
    parts.push(`Spezies: ${species?.name || 'Unbekannt'}. Karriere: ${career?.name || 'Unbekannt'} / ${specializations?.[0]?.name || 'Keine Spezialisierung'}.`);

    const backgroundType = activePlayer?.backgroundType;
    const backgroundOption = activePlayer?.backgroundOption;
    const backgroundValue = activePlayer?.backgroundValue;

    if (backgroundType && backgroundOption) {
      const bgLabel = backgroundType === 'Obligation' ? 'Verpflichtung' : backgroundType === 'Duty' ? 'Pflicht' : 'Moral';
      parts.push(`${bgLabel}: ${backgroundOption} (Wert: ${backgroundValue}).`);
    }

    if (vehicle) {
      if (vehicle.category === 'base') {
        parts.push(`WICHTIG: Der Spieler hat eine STATIONÄRE BASIS gewählt: "${vehicle.name}". Starte die Geschichte IN dieser Basis. Der Charakter hat KEIN eigenes Raumschiff!`);
      } else {
        parts.push(`Der Spieler hat ein Schiff gewählt: "${vehicle.name}" (${vehicle.category}). Starte die Geschichte an Bord dieses Schiffes.`);
      }
    } else {
      parts.push('Der Spieler hat kein eigenes Schiff oder Basis. Starte in einer Cantina oder einem Raumhafen.');
    }

    parts.push('Beschreibe die Eröffnungsszene atmosphärisch und stelle die Situation vor. Biete 3 Optionen an.');
    return parts.join(' ');
  };

  const generateStorySummary = useCallback(async (currentMessages: Message[]) => {
    const narratives = currentMessages
      .filter(m => m.role === 'gm' && typeof m.content !== 'string' && m.content.narrative)
      .map(m => typeof m.content === 'string' ? m.content : m.content.narrative)
      .slice(-20);
    if (narratives.length < 5) return;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: buildGameState(),
          userMessage: `[SYSTEM] Erstelle eine kompakte Zusammenfassung der bisherigen Geschichte (max 500 Wörter). Fokus auf: Schlüsselereignisse, NPC-Beziehungen, besuchte Orte, aktive Bedrohungen, Errungenschaften des Spielers. Bisherige Erzählungen:\n\n${narratives.join('\n\n')}`,
        }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.narrative) {
        setSession(prev => ({ ...prev, storySummary: data.narrative }));
      }
    } catch { /* silent — summary is non-critical */ }
  }, [buildGameState]);

  const handleGMResponse = (data: any) => {
    // Apply state changes from GM
    if (data.stateChanges) {
      const sc = data.stateChanges;
      updateStatus(sc.wounds || 0, sc.strain || 0, sc.credits || 0);

      // Sync wounds/strain to combat combatant (if in combat)
      if (combat?.active && (sc.wounds || sc.strain)) {
        setCombat(prev => {
          if (!prev?.active) return prev;
          const updated = { ...prev, combatants: [...prev.combatants] };
          const pcIdx = updated.combatants.findIndex(c => c.type === 'pc');
          if (pcIdx !== -1) {
            const pc = { ...updated.combatants[pcIdx] };
            pc.wounds = Math.max(0, pc.wounds + (sc.wounds || 0));
            pc.strain = Math.max(0, (pc.strain || 0) + (sc.strain || 0));
            updated.combatants[pcIdx] = pc;
          }
          return updated;
        });
      }

      // Handle quest updates from GM
      if (sc.newQuest) {
        playQuestReceived();
        setSession(prev => addQuest(prev, {
          title: sc.newQuest.title || 'Neue Mission',
          description: sc.newQuest.description || '',
          status: 'active',
          objectives: (sc.newQuest.objectives || []).map((o: string) => ({ description: o, completed: false })),
          rewards: [],
          xpReward: sc.newQuest.xpReward,
          creditsReward: sc.newQuest.creditsReward,
        }));
      }
      if (sc.questUpdate) {
        const questTitle = sc.questUpdate.title?.toLowerCase() || '';
        const quest = questTitle
          ? session.quests.find(q => q.title.toLowerCase() === questTitle)
            || session.quests.find(q => q.title.toLowerCase().includes(questTitle))
          : null;
        if (quest) {
          setSession(prev => updateQuest(prev, quest.id, { status: sc.questUpdate.status || quest.status }));
        }
      }

      // Handle NPC updates from GM
      if (sc.npcUpdate) {
        const existing = session.npcs.find(n => n.name.toLowerCase() === sc.npcUpdate.name?.toLowerCase());
        if (existing) {
          setSession(prev => updateNPC(prev, existing.id, {
            disposition: sc.npcUpdate.disposition ?? existing.disposition,
            isAlive: sc.npcUpdate.isAlive ?? existing.isAlive,
          }));
        } else if (sc.npcUpdate.name) {
          playNPCMeet();
          setSession(prev => addNPC(prev, {
            name: sc.npcUpdate.name,
            disposition: sc.npcUpdate.disposition || 0,
            description: sc.npcUpdate.description || '',
            location: session.scene.location,
            faction: sc.npcUpdate.faction,
            isAlive: true,
          }));
        }
      }

      // Handle scene changes
      if (sc.sceneChange) {
        playSceneChange();
        setSession(prev => ({
          ...prev,
          scene: {
            ...prev.scene,
            planet: sc.sceneChange.planet || prev.scene.planet,
            location: sc.sceneChange.location || prev.scene.location,
            description: sc.sceneChange.description || prev.scene.description,
            ...(sc.sceneChange.timeOfDay ? { timeOfDay: sc.sceneChange.timeOfDay } : {}),
          },
          updatedAt: new Date().toISOString(),
        }));
      }

      // Handle new items from GM
      if (sc.newItem) {
        const item = sc.newItem;
        buyGear({ ...item, price: 0, id: `gm-${item.name}-${Date.now()}` });
      }

      // Handle XP awards from GM
      if (sc.xpAward?.amount > 0) {
        grantXP(sc.xpAward.amount);
        setSession(prev => ({
          ...prev,
          totalXPEarned: prev.totalXPEarned + sc.xpAward.amount,
        }));
      }

      // Handle combat end from GM
      if (sc.combatEnd) {
        const outcome = sc.combatEnd.outcome?.toLowerCase() || '';
        if (outcome.includes('sieg') || outcome.includes('victory') || outcome.includes('gewon')) {
          playCombatVictory();
        } else {
          playCombatDefeat();
        }
        setCombat(prev => ({ ...prev, active: false }));
        setSession(prev => ({ ...prev, combatActive: false, updatedAt: new Date().toISOString() }));
      }

      // Handle critical injury from GM
      if (sc.criticalInjury?.name) {
        playCriticalHit();
        const newInjury = {
          id: `crit-${Date.now()}`,
          name: sc.criticalInjury.name,
          severity: sc.criticalInjury.severity || 50,
          effect: sc.criticalInjury.effect || '',
          permanent: sc.criticalInjury.permanent ?? false,
        };
        setSession(prev => ({
          ...prev,
          criticalInjuries: [...(prev.criticalInjuries || []), newInjury],
          updatedAt: new Date().toISOString(),
        }));
        // Also sync to combat combatant
        if (combat?.active) {
          setCombat(prev => {
            if (!prev?.active) return prev;
            const updated = { ...prev, combatants: [...prev.combatants] };
            const pcIdx = updated.combatants.findIndex(c => c.type === 'pc');
            if (pcIdx !== -1) {
              const pc = { ...updated.combatants[pcIdx] };
              pc.criticalInjuries = [...(pc.criticalInjuries || []), newInjury];
              updated.combatants[pcIdx] = pc;
            }
            return updated;
          });
        }
      }

      // Handle injury healing from GM
      if (sc.healInjury?.name) {
        setSession(prev => ({
          ...prev,
          criticalInjuries: (prev.criticalInjuries || []).map(ci =>
            ci.name.toLowerCase() === sc.healInjury.name.toLowerCase()
              ? { ...ci, healedAt: new Date().toISOString() }
              : ci
          ),
          updatedAt: new Date().toISOString(),
        }));
      }

      // Handle destiny flip from GM
      if (sc.destinyFlip?.side) {
        playDestinyFlip();
        setSession(prev => ({
          ...prev,
          destinyPool: flipDestiny(prev.destinyPool, sc.destinyFlip.side),
          updatedAt: new Date().toISOString(),
        }));
      }

      // Handle combat start from GM
      if (sc.combatStart) {
        playCombatStart();
        const newCombat = createInitialCombatState();
        newCombat.active = true;
        newCombat.round = 1;
        newCombat.combatants = [createPCCombatant(activePlayer)];
        if (sc.combatStart.enemies) {
          for (const enemy of sc.combatStart.enemies) {
            newCombat.combatants.push(createNPCCombatant(enemy.name, {
              woundThreshold: enemy.woundThreshold || 5,
              soak: enemy.soak || 2,
            }));
          }
        }
        setCombat(newCombat);
        setSession(prev => ({ ...prev, combatActive: true, updatedAt: new Date().toISOString() }));
      }
    }

    // Update mood
    if (data.mood) {
      setSession(prev => ({ ...prev, scene: { ...prev.scene, mood: data.mood } }));
    }

    // Track GM messages and trigger summary generation every 10 messages
    gmMessageCount.current += 1;
    if (gmMessageCount.current % 10 === 0) {
      generateStorySummary([...messages, { role: 'gm', content: data }]);
    }

    // Fire toast overlays for state change events
    if (data.stateChanges?.xpAward?.amount > 0) {
      const xp = data.stateChanges.xpAward;
      setToasts(prev => [...prev, { id: `xp-${Date.now()}`, text: `+${xp.amount} EP${xp.reason ? `: ${xp.reason}` : ''}`, type: 'xp', ts: Date.now() }]);
    }
    if (data.stateChanges?.criticalInjury?.name) {
      const ci = data.stateChanges.criticalInjury;
      setToasts(prev => [...prev, { id: `crit-${Date.now()}`, text: `${getLanguage() === 'en' ? 'Critical Injury' : 'Kritische Verletzung'}: ${ci.name}`, type: 'combat', ts: Date.now() }]);
    }
    if (data.stateChanges?.destinyFlip?.side) {
      const df = data.stateChanges.destinyFlip;
      const label = df.side === 'dark' ? t('darkSide') : t('lightSide');
      setToasts(prev => [...prev, { id: `df-${Date.now()}`, text: `${t('destinyPoint')} (${label})${df.reason ? `: ${df.reason}` : ''}`, type: 'system', ts: Date.now() }]);
    }
    if (data.stateChanges?.healInjury?.name) {
      setToasts(prev => [...prev, { id: `heal-${Date.now()}`, text: `${t('healed')}: ${data.stateChanges.healInjury.name}`, type: 'heal', ts: Date.now() }]);
    }
    if (data.stateChanges?.combatEnd) {
      const outcome = data.stateChanges.combatEnd.outcome || '';
      setToasts(prev => [...prev, { id: `cend-${Date.now()}`, text: `${t('combatWord')} ${outcome}`, type: 'combat', ts: Date.now() }]);
    }

    setMessages(prev => [...prev, { role: 'gm', content: data }]);

    // TTS: Read narrative aloud if enabled
    if (ttsEnabled && data.narrative && !data.error) {
      let textToRead = data.narrative;
      const lang = getLanguage();
      if (Array.isArray(data.npcDialogue)) {
        data.npcDialogue.forEach((d: { name: string; text: string }) => {
          textToRead += ` ${d.name} ${lang === 'en' ? 'says' : 'sagt'}: ${d.text}`;
        });
      }
      speakText(textToRead, lang === 'en' ? 'en-US' : 'de-DE');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = { role: 'player', content: { narrative: text } };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const history = updatedMessages.map(m => ({
        role: m.role === 'gm' ? 'assistant' as const : 'user' as const,
        content: m.role === 'gm' ? JSON.stringify(m.content) : (typeof m.content === 'string' ? m.content : m.content.narrative || '')
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: buildGameState(),
          userMessage: text,
          history: history.slice(-20),
          language: getLanguage(),
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GM request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      handleGMResponse(data);
    } catch (error) {
      console.error('Chat failed:', error);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const narrative = isTimeout
        ? t('gmTimeout')
        : t('gmUnavailable');
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 60s' : (error instanceof Error ? error.message : String(error)), options: [{ id: 'A', text: t('retryOption') }] } }]);
    } finally {
      clearTimeout(timeout);
      setIsTyping(false);
    }
  };

  const startGame = async () => {
    setIsTyping(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: buildGameState(),
          userMessage: buildStartMessage(),
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GM request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      handleGMResponse(data);
    } catch (error) {
      console.error('Intro failed:', error);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const narrative = isTimeout
        ? t('gmTimeout')
        : t('gmUnavailable');
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 60s' : (error instanceof Error ? error.message : String(error)), options: [{ id: 'A', text: t('retryOption') }] } }]);
    } finally {
      clearTimeout(timeout);
      setIsTyping(false);
    }
  };

  const initiateRoll = (skill: string, difficulty: string, reason: string, boost?: number, setback?: number) => {
    playDiceRoll();
    setActiveRollRequest({ skill, difficulty, reason, boost, setback });
    setShowDiceRoller(true);
  };

  const handleRollComplete = (result: RollResult) => {
    setShowDiceRoller(false);
    const resultText = formatRollResult(result);
    const rollMessage = `[SYSTEM] Würfelwurf für ${activePlayer?.name} (${activeRollRequest?.skill}): ${resultText}. (Erfolge: ${result.netSuccess}, Vorteile: ${result.netAdvantage}, Triumph: ${result.triumph}, Despair: ${result.despair})`;
    handleSendMessage(rollMessage);
    setActiveRollRequest(null);
  };

  const getInitialPool = (): DicePool => {
    const difficultyLevel = DIFFICULTY_MAP[activeRollRequest?.difficulty.toLowerCase() || 'average'] || 2;
    const boost = activeRollRequest?.boost || 0;
    const setback = activeRollRequest?.setback || 0;
    const { key: skillKey, char: charKey } = resolveSkill(activeRollRequest?.skill || '');
    const skillRank = (activePlayer?.skillRanks || {})[skillKey] || 0;
    const charValue = (characteristics as any)?.[charKey] || 2;
    return buildSkillPool(charValue, skillRank, difficultyLevel, 0, boost, setback);
  };

  // Force power handlers
  const handleBuyPower = (powerId: string) => {
    const cost = 5;
    if ((availableXP || 0) >= cost) {
      setOwnedPowers(prev => [...prev, powerId]);
      spendXP(cost);
    }
  };
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if ((availableXP || 0) >= cost) {
      setOwnedUpgrades(prev => [...prev, upgradeId]);
      spendXP(cost);
    }
  };
  const handleUsePower = (power: any) => {
    playForceUse();
    handleSendMessage(`[MACHT] Ich setze die Machtkraft "${power.nameDE}" ein.`);
    setShowForcePowers(false);
  };

  // Combat handlers
  const handleEndCombat = () => {
    setCombat(prev => ({ ...prev, active: false }));
    handleSendMessage('[SYSTEM] Combat has ended.');
  };
  const handleNextRound = () => {
    setCombat(prev => nextRound(prev));
  };

  // Destiny pool handler
  const handleFlipDestiny = (side: 'light' | 'dark') => {
    playDestinyFlip();
    setSession(prev => ({ ...prev, destinyPool: flipDestiny(prev.destinyPool, side) }));
    const action = side === 'light' ? 'einen Lichtseiten-Punkt' : 'einen Dunkelseiten-Punkt';
    handleSendMessage(`[SYSTEM] ${name} nutzt ${action}.`);
  };

  return {
    // State
    messages,
    setMessages,
    isTyping,
    inputValue,
    setInputValue,
    session,
    setSession,
    combat,
    setCombat,
    ownedPowers,
    setOwnedPowers,
    ownedUpgrades,
    setOwnedUpgrades,
    toasts,

    // Panel toggles
    showCharSheet,
    setShowCharSheet,
    showSaveLoad,
    setShowSaveLoad,
    showForcePowers,
    setShowForcePowers,
    showQuestLog,
    setShowQuestLog,
    showDiceRoller,
    setShowDiceRoller,
    activeRollRequest,

    // Derived
    activePlayer,
    players,
    activePlayerIndex,
    setActivePlayer,
    derived,
    forceRating,
    isForceSensitive,
    talentNames,
    exportState,
    importState,

    // TTS / STT
    ttsEnabled,
    setTTSEnabled,
    testTTS,
    isSpeaking,
    stopSpeaking,
    sttEnabled,
    setSTTEnabled,
    sttSupported,
    isListening,
    transcript,
    startListening,
    stopListening,

    // Handlers
    handleSendMessage,
    initiateRoll,
    handleRollComplete,
    getInitialPool,
    handleBuyPower,
    handleBuyUpgrade,
    handleUsePower,
    handleEndCombat,
    handleNextRound,
    handleFlipDestiny,
  };
}
