'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useRouter } from 'next/navigation';
import HolocronGuide from '../create/HolocronGuide';
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
import { createNewSession, addQuest, updateQuest, addNPC, updateNPC, flipDestiny, type GameSession, type Quest, type NPC } from '@/lib/engine/game-state';
import { playDiceRoll, playQuestReceived } from '@/lib/sounds';

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
    players, activePlayerIndex, updateStatus, exportState, importState, setActivePlayer, spendXP, buyGear
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

  // Game state
  const [session, setSession] = useState<GameSession>(() => createNewSession(activePlayer?.name || 'Pilot'));
  const [combat, setCombat] = useState<CombatState>(() => createInitialCombatState());
  const [ownedPowers, setOwnedPowers] = useState<string[]>([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

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
    wounds, strain, ownedTalents, availableXP
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
    startGame();
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const autoSaveData = JSON.stringify({
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
    character: { ...activePlayer },
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
    soak,
    defense,
  }), [activePlayer, players, session, messages, combat, forceRating, ownedPowers, ownedUpgrades, soak, defense]);

  const startGame = async () => {
    setIsTyping(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: buildGameState(),
          userMessage: (() => {
            const v = activePlayer.vehicles?.[0];
            const vehicleHint = v
              ? v.category === 'base'
                ? ` Die Gruppe startet auf ihrer Basis "${v.name}" — KEIN Raumschiff. Beschreibe den Startort dort.`
                : ` Die Gruppe hat das Schiff "${v.name}". Starte die Szene an Bord oder in dessen Nähe.`
              : '';
            return `Beginne das Abenteuer! Beschreibe die erste Szene basierend auf unserem Team.${vehicleHint}`;
          })()
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
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 30s' : (error?.message || 'Unbekannter Fehler'), options: [{ id: 'A', text: 'Erneut versuchen' }] } }]);
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
        setSession(prev => ({
          ...prev,
          scene: {
            ...prev.scene,
            planet: sc.sceneChange.planet || prev.scene.planet,
            location: sc.sceneChange.location || prev.scene.location,
            description: sc.sceneChange.description || prev.scene.description,
          },
          updatedAt: new Date().toISOString(),
        }));
      }

      // Handle new items from GM
      if (sc.newItem) {
        const item = sc.newItem;
        buyGear({ ...item, price: 0, id: `gm-${item.name}-${Date.now()}` });
      }

      // Handle combat start from GM
      if (sc.combatStart) {
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

    // Update mood
    if (data.mood) {
      setSession(prev => ({ ...prev, scene: { ...prev.scene, mood: data.mood } }));
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
    const timeout = setTimeout(() => controller.abort(), 30000);
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
      setMessages(prev => [...prev, { role: 'gm', content: { narrative, error: isTimeout ? 'Timeout nach 30s' : (error?.message || 'Unbekannter Fehler'), options: [{ id: 'A', text: 'Erneut versuchen' }] } }]);
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
      {showInventory && (
        <InventoryPanel ownedGear={ownedGear} credits={credits} encumbranceMax={encumbranceMax} onClose={() => setShowInventory(false)} />
      )}

      {/* Character Sheet */}
      {showCharSheet && (
        <div className="absolute inset-0 z-[100] bg-black animate-in fade-in zoom-in duration-300 flex flex-col">
          <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{name}_Bogen</h2>
            <button onClick={() => setShowCharSheet(false)} className="w-11 h-11 border border-zinc-800 flex items-center justify-center text-xl">✕</button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Identity */}
            <section className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-2 tracking-[0.2em]">Identität</div>
              <div className="text-sm font-black text-white italic">{name}</div>
              <div className="text-[9px] text-zinc-500">{species?.name} • {career?.name} / {specializations?.[0]?.name || '—'}</div>
              {isForceSensitive && <div className="text-[8px] text-purple-400 font-black mt-1">MACHTSENSITIV • Force Rating: {forceRating}</div>}
            </section>
            {/* Attributes */}
            <section>
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-3 tracking-[0.2em]">Attribute</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(characteristics).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-xl">
                    <span className="text-xl font-black text-white leading-none mb-1">{val}</span>
                    <span className="text-[7px] text-zinc-600 uppercase font-black">{key.substring(0, 3)}</span>
                  </div>
                ))}
              </div>
            </section>
            {/* Derived Stats */}
            <section className="grid grid-cols-4 gap-2">
              <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl text-center">
                <div className="text-[6px] text-zinc-600 font-black uppercase tracking-widest">Soak</div>
                <div className="text-lg font-black text-white">{soak}</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl text-center">
                <div className="text-[6px] text-zinc-600 font-black uppercase tracking-widest">DEF</div>
                <div className="text-lg font-black text-white">{defense}</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl text-center">
                <div className="text-[6px] text-red-500/50 font-black uppercase tracking-widest">Wounds</div>
                <div className="text-lg font-black text-red-500">{wounds}/{woundThreshold}</div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl text-center">
                <div className="text-[6px] text-blue-500/50 font-black uppercase tracking-widest">Strain</div>
                <div className="text-lg font-black text-blue-400">{strain}/{strainThreshold}</div>
              </div>
            </section>
            {/* Skills */}
            <section>
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-3 tracking-[0.2em]">Fertigkeiten</div>
              <div className="space-y-1">
                {ALL_SKILLS.map(skill => {
                  const skillRank = (activePlayer.skillRanks || {})[skill.key] || 0;
                  const charVal = (characteristics as any)[skill.characteristic] || 2;
                  return (
                    <div key={skill.key} className={`flex justify-between items-center py-1 border-b border-zinc-900 last:border-0 ${skillRank === 0 ? 'opacity-30' : ''}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-tight ${skillRank > 0 ? 'text-zinc-300' : 'text-zinc-500'}`}>{skill.nameDE}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(p => (
                            <div key={p} className={`w-2 h-2 rounded-full ${p <= skillRank ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'}`} />
                          ))}
                        </div>
                        <span className="text-[7px] text-zinc-700 font-black w-8 text-right">{charVal}+{skillRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Equipment summary */}
            <section>
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-3 tracking-[0.2em]">Equipment</div>
              <div className="space-y-1.5">
                {ownedGear.length > 0 ? ownedGear.map((g: any, i: number) => (
                  <div key={i} className="p-2 border border-zinc-800 bg-zinc-950 rounded-lg flex justify-between items-center">
                    <span className="text-[9px] font-black text-white uppercase italic">{g.name}</span>
                    <span className="text-[7px] text-amber-500 font-black italic">{g.damage ? `DMG_${g.damage}` : g.soak ? `SOAK_${g.soak}` : 'ITEM'}</span>
                  </div>
                )) : <div className="text-[9px] text-zinc-800 italic uppercase">Keine Ausrüstung...</div>}
              </div>
            </section>
            {/* Vehicles */}
            {activePlayer.vehicles && activePlayer.vehicles.length > 0 && (
              <section>
                <div className="text-[8px] text-zinc-600 font-black uppercase mb-3 tracking-[0.2em]">Schiff / Fahrzeug</div>
                {activePlayer.vehicles.map((v) => (
                  <div key={v.id} className="border border-zinc-800 bg-zinc-950 rounded-xl p-3 space-y-2">
                    <div className="text-[10px] font-black text-white uppercase italic tracking-tighter">{v.name}</div>
                    <div className="text-[7px] text-zinc-600">{v.manufacturer}</div>
                    {v.silhouette > 0 && (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[['SIL', v.silhouette], ['SPD', v.speed], ['ARM', v.armor], ['HULL', `${v.currentHullTrauma}/${v.hullTraumaThreshold}`]].map(([l, v]) => (
                          <div key={String(l)}><div className="text-[6px] text-zinc-700 font-black uppercase">{l}</div><div className="text-xs font-black text-zinc-400">{v}</div></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      )}

      {/* Header HUD */}
      <header className="bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md z-20 shadow-2xl">
        <div className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCharSheet(true)} className="w-11 h-11 border border-amber-500/50 rounded bg-amber-500/5 flex items-center justify-center active:scale-90">
              <span className="text-amber-500 font-black italic text-lg">{name?.charAt(0) || 'Q'}</span>
            </button>
            <div>
              <h1 className="text-xs font-black text-white italic tracking-tighter truncate max-w-[100px]">{name || 'PILOT_UNKNOWN'}</h1>
              <div className="text-[7px] text-zinc-500 tracking-[0.15em] uppercase">{credits} Cr • {session.scene.planet}</div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {/* Wound/Strain mini bars */}
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] text-red-500/50 font-black">W</span>
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, (wounds / Math.max(1, woundThreshold)) * 100))}%` }} />
                </div>
                <span className="text-[7px] text-red-500 font-black w-8">{wounds}/{woundThreshold}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] text-blue-500/50 font-black">S</span>
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, (strain / Math.max(1, strainThreshold)) * 100))}%` }} />
                </div>
                <span className="text-[7px] text-blue-400 font-black w-8">{strain}/{strainThreshold}</span>
              </div>
            </div>
            <button onClick={() => setShowSaveLoad(true)} className="w-11 h-11 border border-zinc-800 rounded bg-zinc-900 flex items-center justify-center active:scale-90 text-sm">
              💾
            </button>
          </div>
        </div>

        {/* Quick-access toolbar */}
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button onClick={() => setShowInventory(true)} className="text-[8px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 whitespace-nowrap">
            Inventar
          </button>
          <button onClick={() => setShowQuestLog(true)} className="text-[8px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 whitespace-nowrap">
            Missionen{session.quests.filter(q => q.status === 'active').length > 0 ? ` (${session.quests.filter(q => q.status === 'active').length})` : ''}
          </button>
          {isForceSensitive && (
            <button onClick={() => setShowForcePowers(true)} className="text-[8px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:border-purple-500/50 whitespace-nowrap">
              Macht (FR{forceRating})
            </button>
          )}
          {/* Destiny Pool */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => handleFlipDestiny('light')} className="flex items-center gap-1 text-[8px] font-black bg-zinc-900 border border-zinc-800 px-2 py-1.5 rounded-lg text-cyan-400 hover:border-cyan-500/50" title="Lichtseiten-Punkt nutzen">
              <span className="text-xs">⚪</span>{session.destinyPool.lightSide}
            </button>
            <button onClick={() => handleFlipDestiny('dark')} className="flex items-center gap-1 text-[8px] font-black bg-zinc-900 border border-zinc-800 px-2 py-1.5 rounded-lg text-red-400 hover:border-red-500/50" title="Dunkelseiten-Punkt nutzen">
              <span className="text-xs">⚫</span>{session.destinyPool.darkSide}
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
                  <div className="text-[7px] font-black uppercase truncate text-white">{p.name || 'PILOT'}</div>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-44">
        {/* Combat tracker */}
        {combat.active && (
          <CombatTracker combat={combat} onEndCombat={handleEndCombat} onNextRound={handleNextRound} />
        )}

        {/* Scene indicator */}
        {session.scene.location && (
          <div className="text-center py-2">
            <div className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.3em]">{session.scene.planet}</div>
            <div className={`text-[9px] font-black uppercase tracking-wider ${moodColors[session.scene.mood] || 'text-zinc-500'}`}>{session.scene.location}</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[92%] ${msg.role === 'player' ? 'bg-zinc-900 border border-zinc-800 p-3 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-xl' : 'space-y-3'}`}>
              {msg.role === 'gm' ? (
                <div className="space-y-4">
                  {msg.content.error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-xs font-mono text-red-200">{msg.content.error}</div>}
                  {msg.content.narrative && <p className="text-base md:text-lg leading-relaxed text-zinc-300 font-sans italic">{msg.content.narrative}</p>}
                  {Array.isArray(msg.content.npcDialogue) && msg.content.npcDialogue.length > 0 && (
                    <div className="space-y-2 border-l-2 border-amber-500/30 pl-4 bg-amber-500/[0.02] py-2">
                      {msg.content.npcDialogue.map((d: any, idx: number) => (
                        <div key={idx}>
                          <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">{d.name}</span>
                          <p className="text-xs text-zinc-400 mt-0.5 italic font-sans leading-relaxed">&ldquo;{d.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content.requiresRoll && msg.content.rollInfo && (
                    <div className="bg-amber-500/5 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-[8px] text-amber-500 font-black uppercase tracking-widest mb-0.5">Incoming_Challenge</div>
                        <div className="text-xs font-black text-white uppercase italic">{msg.content.rollInfo.skill} <span className="text-zinc-500">//</span> {msg.content.rollInfo.difficulty}</div>
                        {msg.content.rollInfo.reason && <div className="text-[8px] text-zinc-600 mt-0.5">{msg.content.rollInfo.reason}</div>}
                      </div>
                      <button onClick={() => initiateRoll(msg.content.rollInfo.skill, msg.content.rollInfo.difficulty, msg.content.rollInfo.reason, msg.content.rollInfo.boost, msg.content.rollInfo.setback)} className="bg-amber-600 hover:bg-amber-500 text-black font-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest animate-pulse">
                        Würfeln
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {msg.content.options?.map((opt: any) => (
                      <button key={opt.id} onClick={() => handleSendMessage(opt.text)} className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-3 rounded-xl text-left transition-all active:scale-95">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-amber-500 font-black opacity-40 border border-amber-500/20 w-5 h-5 flex items-center justify-center rounded uppercase italic">{opt.id}</span>
                          <span className="text-[9px] text-zinc-400 font-black uppercase">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white font-black italic uppercase tracking-tight">{msg.content.narrative}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-900/20 text-[8px] text-amber-500 font-black uppercase tracking-[0.5em] p-2 border border-amber-500/10 rounded">GM_Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar — sits above the bottom tab nav (h-16 + safe-area) */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-30">
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl font-mono"
              placeholder="EINGABE_KOMMANDO..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            />
          </div>
          <button onClick={() => handleSendMessage(inputValue)} className="bg-amber-600 hover:bg-amber-500 text-black px-6 rounded-2xl transition-all active:scale-90 font-black text-sm">
            GO
          </button>
        </div>
      </div>
      <HolocronGuide title="QUANTUM_RPG" description="Nutze die Toolbar-Buttons für Inventar, Missionen und Machtkräfte. Schicksalspunkte können über die Punkte oben rechts gewendet werden." advice="Auto-Save alle 60 Sekunden aktiv. Manuell speichern über das Disketten-Symbol!" />
    </main>
  );
};

export default ChatInterface;
