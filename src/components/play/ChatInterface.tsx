'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useRouter } from 'next/navigation';
import DiceRollerModal from './DiceRollerModal';
import CombatTracker from './CombatTracker';
import ForcePowerPanel from './ForcePowerPanel';
import QuestLog from './QuestLog';
import InventoryPanel from './InventoryPanel';
import SaveLoadPanel from './SaveLoadPanel';
import { DicePool, formatRollResult, RollResult, buildSkillPool } from '@/lib/engine/dice';
import { ALL_SKILLS } from '@/lib/skills';
import { isForceCareer, calculateForceRating } from '@/lib/engine/force-powers';
import { createInitialCombatState, createPCCombatant, createNPCCombatant, nextRound, type CombatState } from '@/lib/engine/combat';
import { createNewSession, addQuest, updateQuest, addNPC, updateNPC, flipDestiny, type GameSession, type Quest, type NPC, type SessionStartContext } from '@/lib/engine/game-state';
import {
  playDiceRoll, playQuestReceived,
  playCombatStart, playCombatVictory, playCombatDefeat,
  playCriticalHit, playDestinyFlip, playNPCMeet,
  playForceUse, playSceneChange,
} from '@/lib/sounds';
import { PENDING_RESTORE_KEY, slugify } from '@/lib/save-utils';

// Skill name map (DE/EN → store key + characteristic)
const SKILL_MAP: Record<string, { key: string; char: string }> = {
  'astronavigation': { key: 'astrogation', char: 'intellect' },
  'astrogation': { key: 'astrogation', char: 'intellect' },
  'athletik': { key: 'athletics', char: 'brawn' },
  'athletics': { key: 'athletics', char: 'brawn' },
  'charme': { key: 'charm', char: 'presence' },
  'charm': { key: 'charm', char: 'presence' },
  'einschüchterung': { key: 'coercion', char: 'willpower' },
  'coercion': { key: 'coercion', char: 'willpower' },
  'computer': { key: 'computers', char: 'intellect' },
  'computers': { key: 'computers', char: 'intellect' },
  'coolness': { key: 'cool', char: 'presence' },
  'cool': { key: 'cool', char: 'presence' },
  'körperbeherrschung': { key: 'coordination', char: 'agility' },
  'coordination': { key: 'coordination', char: 'agility' },
  'täuschung': { key: 'deception', char: 'cunning' },
  'deception': { key: 'deception', char: 'cunning' },
  'disziplin': { key: 'discipline', char: 'willpower' },
  'discipline': { key: 'discipline', char: 'willpower' },
  'führungsqualität': { key: 'leadership', char: 'presence' },
  'leadership': { key: 'leadership', char: 'presence' },
  'mechanik': { key: 'mechanics', char: 'intellect' },
  'mechanics': { key: 'mechanics', char: 'intellect' },
  'medizin': { key: 'medicine', char: 'intellect' },
  'medicine': { key: 'medicine', char: 'intellect' },
  'verhandlung': { key: 'negotiation', char: 'presence' },
  'negotiation': { key: 'negotiation', char: 'presence' },
  'wahrnehmung': { key: 'perception', char: 'cunning' },
  'perception': { key: 'perception', char: 'cunning' },
  'pilot (planetar)': { key: 'pilotingPlanetary', char: 'agility' },
  'planetares steuern': { key: 'pilotingPlanetary', char: 'agility' },
  'pilotingplanetary': { key: 'pilotingPlanetary', char: 'agility' },
  'pilot (weltraum)': { key: 'pilotingSpace', char: 'agility' },
  'steuern (raum)': { key: 'pilotingSpace', char: 'agility' },
  'pilotingspace': { key: 'pilotingSpace', char: 'agility' },
  'widerstandskraft': { key: 'resilience', char: 'brawn' },
  'resilience': { key: 'resilience', char: 'brawn' },
  'fingerfertigkeit': { key: 'skulduggery', char: 'cunning' },
  'skulduggery': { key: 'skulduggery', char: 'cunning' },
  'heimlichkeit': { key: 'stealth', char: 'agility' },
  'stealth': { key: 'stealth', char: 'agility' },
  'szenekenntnis': { key: 'streetwise', char: 'cunning' },
  'streetwise': { key: 'streetwise', char: 'cunning' },
  'überleben': { key: 'survival', char: 'cunning' },
  'survival': { key: 'survival', char: 'cunning' },
  'aufmerksamkeit': { key: 'vigilance', char: 'willpower' },
  'vigilance': { key: 'vigilance', char: 'willpower' },
  'nahkampf (faust)': { key: 'brawl', char: 'brawn' },
  'nahkampf (unbewaffnet)': { key: 'brawl', char: 'brawn' },
  'brawl': { key: 'brawl', char: 'brawn' },
  'artillerie': { key: 'gunnery', char: 'agility' },
  'gunnery': { key: 'gunnery', char: 'agility' },
  'nahkampf (waffe)': { key: 'melee', char: 'brawn' },
  'nahkampf (bewaffnet)': { key: 'melee', char: 'brawn' },
  'melee': { key: 'melee', char: 'brawn' },
  'fernkampf (leicht)': { key: 'rangedLight', char: 'agility' },
  'leichte fernkampfwaffen': { key: 'rangedLight', char: 'agility' },
  'rangedlight': { key: 'rangedLight', char: 'agility' },
  'fernkampf (schwer)': { key: 'rangedHeavy', char: 'agility' },
  'schwere fernkampfwaffen': { key: 'rangedHeavy', char: 'agility' },
  'rangedheavy': { key: 'rangedHeavy', char: 'agility' },
  'kernwelten': { key: 'coreWorlds', char: 'intellect' },
  'coreworlds': { key: 'coreWorlds', char: 'intellect' },
  'allgemeinbildung': { key: 'education', char: 'intellect' },
  'bildung': { key: 'education', char: 'intellect' },
  'education': { key: 'education', char: 'intellect' },
  'altes wissen': { key: 'lore', char: 'intellect' },
  'sagenkunde': { key: 'lore', char: 'intellect' },
  'lore': { key: 'lore', char: 'intellect' },
  'äußerer rand': { key: 'outerRim', char: 'intellect' },
  'outerrim': { key: 'outerRim', char: 'intellect' },
  'unterwelt': { key: 'underworld', char: 'intellect' },
  'underworld': { key: 'underworld', char: 'intellect' },
  'kriegskunst': { key: 'warfare', char: 'intellect' },
  'warfare': { key: 'warfare', char: 'intellect' },
  'xenologie': { key: 'xenology', char: 'intellect' },
  'xenology': { key: 'xenology', char: 'intellect' },
  'lichtschwert': { key: 'lightsaber', char: 'brawn' },
  'lightsaber': { key: 'lightsaber', char: 'brawn' },
  // Aliases for alternative German skill names used in careers.json
  'infiltration': { key: 'skulduggery', char: 'cunning' },
  'verhandeln': { key: 'negotiation', char: 'presence' },
  'wachsamkeit': { key: 'vigilance', char: 'willpower' },
  'computertechnik': { key: 'computers', char: 'intellect' },
  'straßenwissen': { key: 'streetwise', char: 'cunning' },
  'lichtschwerter': { key: 'lightsaber', char: 'brawn' },
  'handgemenge': { key: 'brawl', char: 'brawn' },
  'nahkampfwaffen': { key: 'melee', char: 'brawn' },
};

function resolveSkill(skillName: string): { key: string; char: string } {
  const normalized = skillName.toLowerCase().trim();
  return SKILL_MAP[normalized] || { key: normalized, char: 'intellect' };
}

interface Message {
  role: 'gm' | 'player';
  content: any;
}

interface RollRequest {
  skill: string;
  difficulty: string;
  reason: string;
  boost?: number;
  setback?: number;
}

const DIFFICULTY_MAP: Record<string, number> = {
  simple: 0, easy: 1, average: 2, hard: 3, daunting: 4, formidable: 5
};

// Auto-save interval in ms
const AUTOSAVE_INTERVAL = 60000;

const ChatInterface: React.FC = () => {
  const router = useRouter();
  const {
    players, activePlayerIndex, updateStatus, exportState, importState, setActivePlayer, spendXP, buyGear, grantXP
  } = useCharacterStore();

  const activePlayer = players[activePlayerIndex];

  // Core chat state — ALL hooks must come before any conditional return
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Panel toggles
  const [showCharSheet, setShowCharSheet] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showForcePowers, setShowForcePowers] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [activeRollRequest, setActiveRollRequest] = useState<RollRequest | null>(null);
  // Skills ref removed from HUD — available in Settings > Help
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'xp' | 'system' | 'combat' | 'heal'; ts: number }[]>([]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const gmMessageCount = useRef(0);
  // Route guard: redirect if character is incomplete (AFTER all hooks)
  useEffect(() => {
    if (!activePlayer?.species || !activePlayer?.career) {
      router.push('/');
    }
  }, [activePlayer, router]);

  if (!activePlayer?.species || !activePlayer?.career) {
    return <div className="min-h-screen bg-black" />;
  }

  const {
    name, species, career, characteristics, credits, ownedGear,
    specializations, backgroundOption, backgroundType, backgroundValue,
    wounds, strain, ownedTalents, availableXP, selectedSubspecies
  } = activePlayer;

  // Derived values
  const woundThreshold = species.woundThresholdBase + characteristics.brawn;
  const strainThreshold = species.strainThresholdBase + characteristics.willpower;
  const armorItems = ownedGear.filter((g: any) => g.soak !== undefined);
  const soak = characteristics.brawn + armorItems.reduce((acc: number, curr: any) => acc + (curr.soak || 0), 0);
  const defense = armorItems.reduce((acc: number, curr: any) => Math.max(acc, curr.defense || 0), 0);
  const talentNames = ownedTalents.map((t: any) => typeof t === 'string' ? t : t.name);
  const forceRating = calculateForceRating(career, talentNames);
  const isForceSensitive = isForceCareer(career);
  const encumbranceMax = 5 + characteristics.brawn;
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check for pending restore from start screen Archive
    const pendingRaw = localStorage.getItem(PENDING_RESTORE_KEY);
    if (pendingRaw) {
      try {
        const pendingData = JSON.parse(pendingRaw);
        localStorage.removeItem(PENDING_RESTORE_KEY);
        // Restore chat messages
        if (pendingData.chatMessages?.length > 0) {
          setMessages(pendingData.chatMessages);
        }
        // Restore session state
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
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const autoSaveData = JSON.stringify({
          version: 2,
          storeState: exportState(),
          chatMessages: messages,
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
    character: { ...activePlayer, vehicles: activePlayer.vehicles || [] }, // Ensure vehicles array is always present
    party: players.map(p => ({
      name: p.name,
      species: p.species?.name,
      career: p.career?.name,
      specialization: p.specializations?.[0]?.name,
      wounds: p.wounds,
      strain: p.strain,
      woundThreshold: (p.species?.woundThresholdBase || 10) + (p.characteristics?.brawn || 0),
      strainThreshold: (p.species?.strainThresholdBase || 10) + (p.characteristics?.willpower || 0),
    })),
    currentPlanet: session.scene.planet,
    currentScene: session.scene.location,
    sessionHistory: messages.slice(-10).map(m => m.content.narrative || ''),
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
    soak,
    defense,
  }), [activePlayer, players, session, messages, combat, forceRating, ownedPowers, ownedUpgrades, soak, defense]);

  const buildStartMessage = (): string => {
    const vehicle = activePlayer?.vehicles?.[0];
    const parts: string[] = [];

    parts.push(`[SPIELSTART] Beginne das Abenteuer für ${name}.`);
    parts.push(`Spezies: ${species?.name || 'Unbekannt'}. Karriere: ${career?.name || 'Unbekannt'} / ${specializations?.[0]?.name || 'Keine Spezialisierung'}.`);

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
      .filter(m => m.role === 'gm' && m.content.narrative)
      .map(m => m.content.narrative)
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
    } catch (error: any) {
      console.error('Intro failed:', error);
      const isTimeout = error?.name === 'AbortError';
      const narrative = isTimeout
        ? 'GM antwortet nicht (Timeout). Bitte erneut versuchen.'
        : 'Der Game Master ist momentan nicht erreichbar. Bitte versuche es erneut.';
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 60s' : (error?.message || 'Unbekannter Fehler'), options: [{ id: 'A', text: 'Erneut versuchen' }] } }]);
    } finally {
      clearTimeout(timeout);
      setIsTyping(false);
    }
  };

  const handleGMResponse = (data: any) => {
    // Apply state changes from GM
    if (data.stateChanges) {
      const sc = data.stateChanges;
      updateStatus(sc.wounds || 0, sc.strain || 0, sc.credits || 0);

      // --- Sound triggers for state changes ---

      // Handle quest updates from GM
      if (sc.newQuest) {
        playQuestReceived();
        setSession(prev => addQuest(prev, {
          title: sc.newQuest.title || 'Neue Mission',
          description: sc.newQuest.description || '',
          status: 'active',
          objectives: (sc.newQuest.objectives || []).map((o: string) => ({ description: o, completed: false })),
          xpReward: sc.newQuest.xpReward,
          creditsReward: sc.newQuest.creditsReward,
        }));
      }
      if (sc.questUpdate) {
        const quest = session.quests.find(q => q.title.toLowerCase().includes(sc.questUpdate.title?.toLowerCase() || ''));
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
        setSession(prev => ({
          ...prev,
          criticalInjuries: [
            ...(prev.criticalInjuries || []),
            {
              id: `crit-${Date.now()}`,
              name: sc.criticalInjury.name,
              severity: sc.criticalInjury.severity || 50,
              effect: sc.criticalInjury.effect || '',
            },
          ],
          updatedAt: new Date().toISOString(),
        }));
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
      }
    }

    // Update mood (ambient music removed — preparing for real audio files)
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
      setToasts(prev => [...prev, { id: `crit-${Date.now()}`, text: `Kritische Verletzung: ${ci.name}`, type: 'combat', ts: Date.now() }]);
    }
    if (data.stateChanges?.destinyFlip?.side) {
      const df = data.stateChanges.destinyFlip;
      const label = df.side === 'dark' ? 'Dunkle Seite' : 'Helle Seite';
      setToasts(prev => [...prev, { id: `df-${Date.now()}`, text: `Schicksalspunkt (${label})${df.reason ? `: ${df.reason}` : ''}`, type: 'system', ts: Date.now() }]);
    }
    if (data.stateChanges?.healInjury?.name) {
      setToasts(prev => [...prev, { id: `heal-${Date.now()}`, text: `Geheilt: ${data.stateChanges.healInjury.name}`, type: 'heal', ts: Date.now() }]);
    }
    if (data.stateChanges?.combatEnd) {
      const outcome = data.stateChanges.combatEnd.outcome || 'beendet';
      setToasts(prev => [...prev, { id: `cend-${Date.now()}`, text: `Kampf ${outcome}`, type: 'combat', ts: Date.now() }]);
    }

    setMessages(prev => [...prev, { role: 'gm', content: data }]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = { role: 'player', content: { narrative: text } };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // Timeout auf 60 Sekunden erhöht
    try {
      const history = updatedMessages.map(m => ({
        role: m.role === 'gm' ? 'assistant' as const : 'user' as const,
        content: m.role === 'gm' ? JSON.stringify(m.content) : (m.content.narrative || '')
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: buildGameState(),
          userMessage: text,
          history: history.slice(-20)
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GM request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      handleGMResponse(data);
    } catch (error: any) {
      console.error('Chat failed:', error);
      const isTimeout = error?.name === 'AbortError';
      const narrative = isTimeout
        ? 'GM antwortet nicht (Timeout). Bitte erneut versuchen.'
        : 'Der Game Master ist momentan nicht erreichbar. Bitte versuche es erneut.';
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 60s' : (error?.message || 'Unbekannter Fehler'), options: [{ id: 'A', text: 'Erneut versuchen' }] } }]);
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
    const rollMessage = `[SYSTEM] Würfelwurf für ${activePlayer.name} (${activeRollRequest?.skill}): ${resultText}. (Erfolge: ${result.netSuccess}, Vorteile: ${result.netAdvantage}, Triumph: ${result.triumph}, Despair: ${result.despair})`;
    handleSendMessage(rollMessage);
    setActiveRollRequest(null);
  };

  const getInitialPool = (): DicePool => {
    const difficultyLevel = DIFFICULTY_MAP[activeRollRequest?.difficulty.toLowerCase() || 'average'] || 2;
    const boost = activeRollRequest?.boost || 0;
    const setback = activeRollRequest?.setback || 0;
    const { key: skillKey, char: charKey } = resolveSkill(activeRollRequest?.skill || '');
    const skillRank = (activePlayer.skillRanks || {})[skillKey] || 0;
    const charValue = (characteristics as any)[charKey] || 2;
    return buildSkillPool(charValue, skillRank, difficultyLevel, 0, boost, setback);
  };

  // Force power handlers
  const handleBuyPower = (powerId: string) => {
    const cost = 5;
    if (availableXP >= cost) {
      setOwnedPowers(prev => [...prev, powerId]);
      spendXP(cost);
    }
  };
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (availableXP >= cost) {
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
    handleSendMessage('[SYSTEM] Der Kampf ist beendet.');
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

  // Mood indicator colors
  const moodColors: Record<string, string> = {
    tense: 'text-orange-500', calm: 'text-cyan-500', dangerous: 'text-red-500',
    mysterious: 'text-purple-500', exciting: 'text-amber-500', sad: 'text-blue-400', triumphant: 'text-yellow-500',
  };

  return (
    <main className="h-screen w-screen bg-black text-zinc-300 font-mono flex flex-col overflow-hidden relative">
      {/* Overlays */}
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
      {/* Removed Inventory Panel overlay as it will be integrated into Character Sheet */}
      {/* {showInventory && (
        <InventoryPanel ownedGear={ownedGear} credits={credits} encumbranceMax={encumbranceMax} onClose={() => setShowInventory(false)} />
      )} */}
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
                  if (skillRank === 0) return null; // Hide untrained by default in sheet
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
                )) : <div className="text-[10px] text-zinc-700 italic">Keine Ausrüstung...</div>}
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
      <header className="bg-zinc-950/90 border-b border-zinc-800/60 backdrop-blur-xl z-20 shadow-2xl">
        {/* Row 1: Avatar + Name + W/S bars + Save */}
        <div className="px-3 pt-2.5 pb-1.5 flex justify-between items-center">
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
                      // Show fallback initial
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
            <button onClick={() => setShowSaveLoad(true)} className="w-9 h-9 border border-zinc-800 rounded-lg bg-zinc-900/80 flex items-center justify-center active:scale-90 text-sm transition-transform">
              💾
            </button>
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
                    <div className="h-full bg-red-500" style={{ width: `${Math.max(0, 100 - (p.wounds / ((p.species?.woundThresholdBase || 10) + p.characteristics.brawn)) * 100)}%` }} />
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
              {msg.role === 'gm' ? (
                <div className="space-y-4">
                  {msg.content.error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-sm font-mono text-red-200">{msg.content.error}</div>}
                  {msg.content.narrative && <p className="text-base leading-[1.75] text-zinc-300 font-sans">{msg.content.narrative}</p>}
                  {Array.isArray(msg.content.npcDialogue) && msg.content.npcDialogue.length > 0 && (
                    <div className="space-y-2.5 border-l-2 border-amber-500/30 pl-4 bg-amber-500/[0.02] py-2 rounded-r-lg">
                      {msg.content.npcDialogue.map((d: any, idx: number) => (
                        <div key={idx}>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.15em]">{d.name}</span>
                          <p className="text-[15px] text-zinc-400 mt-0.5 font-sans leading-relaxed">&ldquo;{d.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content.requiresRoll && msg.content.rollInfo && (
                    <div className="bg-amber-500/5 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-0.5">Probe</div>
                        <div className="text-sm font-black text-white uppercase italic truncate">{msg.content.rollInfo.skill} <span className="text-zinc-600">//</span> {msg.content.rollInfo.difficulty}</div>
                        {msg.content.rollInfo.reason && <div className="text-[9px] text-zinc-500 mt-0.5 truncate">{msg.content.rollInfo.reason}</div>}
                      </div>
                      <button onClick={() => initiateRoll(msg.content.rollInfo.skill, msg.content.rollInfo.difficulty, msg.content.rollInfo.reason, msg.content.rollInfo.boost, msg.content.rollInfo.setback)} className="bg-amber-600 hover:bg-amber-500 text-black font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest animate-pulse shrink-0">
                        Würfeln
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {msg.content.options?.map((opt: any) => (
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
                <p className="text-base text-white font-bold">{msg.content.narrative}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-900/30 text-[9px] text-amber-500 font-black uppercase tracking-[0.3em] px-3 py-2 border border-amber-500/10 rounded-lg">GM denkt...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Toast overlay — fixed above input bar */}
      {toasts.length > 0 && (
        <div className="fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map((t) => {
            const colors = {
              xp: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
              system: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
              combat: 'bg-red-500/15 border-red-500/40 text-red-400',
              heal: 'bg-green-500/15 border-green-500/40 text-green-400',
            };
            return (
              <div key={t.id} className={`toast-up px-5 py-2 rounded-xl border backdrop-blur-md ${colors[t.type]} shadow-lg`}>
                <span className="text-xs font-black uppercase tracking-wider">{t.text}</span>
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
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3.5 rounded-2xl text-sm outline-none focus:border-amber-500/60 text-white placeholder:text-zinc-700 shadow-2xl font-mono transition-colors"
              placeholder="Eingabe..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
            />
          </div>
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