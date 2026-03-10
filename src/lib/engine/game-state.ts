// ============================================================
// QUANTUM RPG — Game State Manager
// ============================================================
// Manages the full game state: quests, NPCs, scene, destiny
// ============================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: { description: string; completed: boolean }[];
  xpReward?: number;
  creditsReward?: number;
}

export interface NPC {
  id: string;
  name: string;
  disposition: number; // -100 to 100
  description: string;
  location: string;
  faction?: string;
  isAlive: boolean;
}

export interface DestinyPool {
  lightSide: number;
  darkSide: number;
}

export interface SceneState {
  planet: string;
  location: string;
  description: string;
  mood: string;
  threats: string[];
}

export interface GameSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  scene: SceneState;
  destinyPool: DestinyPool;
  quests: Quest[];
  npcs: NPC[];
  sessionLog: string[];
  totalXPEarned: number;
  storySummary: string;
}

export interface SessionStartContext {
  characterName: string;
  speciesName?: string;
  careerName?: string;
  vehicle?: {
    name: string;
    category: string; // 'base' | 'freighter' | 'starfighter' | etc.
    specialFeatures?: string[];
  } | null;
}

/**
 * Creates a new game session with initial scene derived from the player's
 * character choices — especially their vehicle/base selection.
 *
 * NO MORE HARDCODED TATOOINE.
 */
export function createNewSession(context: SessionStartContext | string): GameSession {
  // Backwards compat: accept plain string (character name)
  const ctx: SessionStartContext = typeof context === 'string'
    ? { characterName: context }
    : context;

  const scene = deriveStartingScene(ctx);

  return {
    id: `session-${Date.now()}`,
    name: `${ctx.characterName}'s Abenteuer`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scene,
    destinyPool: { lightSide: 2, darkSide: 2 },
    quests: [],
    npcs: [],
    sessionLog: [],
    totalXPEarned: 0,
    storySummary: '',
  };
}

/**
 * Derives the starting scene from the player's vehicle/base choice.
 * If the player chose a base → start AT the base.
 * If the player chose a ship → start aboard the ship.
 * If no vehicle → start at a cantina/spaceport (generic safe start).
 */
function deriveStartingScene(ctx: SessionStartContext): SceneState {
  const vehicle = ctx.vehicle;

  if (vehicle && vehicle.category === 'base') {
    return {
      planet: 'Unbekannt',
      location: vehicle.name,
      description: `${ctx.characterName} befindet sich in der Basis: ${vehicle.name}.`,
      mood: 'calm',
      threats: [],
    };
  }

  if (vehicle && vehicle.category !== 'base') {
    return {
      planet: 'Weltraum',
      location: `An Bord der ${vehicle.name}`,
      description: `${ctx.characterName} ist an Bord der ${vehicle.name} — bereit für das nächste Abenteuer.`,
      mood: 'mysterious',
      threats: [],
    };
  }

  // No vehicle selected — generic start
  return {
    planet: 'Unbekannt',
    location: 'Raumhafen-Cantina',
    description: `${ctx.characterName} sitzt in einer belebten Cantina am Raumhafen und wartet auf eine Gelegenheit.`,
    mood: 'mysterious',
    threats: [],
  };
}

export function addQuest(session: GameSession, quest: Omit<Quest, 'id'>): GameSession {
  return {
    ...session,
    quests: [...session.quests, { ...quest, id: `quest-${Date.now()}` }],
    updatedAt: new Date().toISOString(),
  };
}

export function updateQuest(session: GameSession, questId: string, updates: Partial<Quest>): GameSession {
  return {
    ...session,
    quests: session.quests.map(q => q.id === questId ? { ...q, ...updates } : q),
    updatedAt: new Date().toISOString(),
  };
}

export function addNPC(session: GameSession, npc: Omit<NPC, 'id'>): GameSession {
  return {
    ...session,
    npcs: [...session.npcs, { ...npc, id: `npc-${Date.now()}` }],
    updatedAt: new Date().toISOString(),
  };
}

export function updateNPC(session: GameSession, npcId: string, updates: Partial<NPC>): GameSession {
  return {
    ...session,
    npcs: session.npcs.map(n => n.id === npcId ? { ...n, ...updates } : n),
    updatedAt: new Date().toISOString(),
  };
}

export function flipDestiny(pool: DestinyPool, side: 'light' | 'dark'): DestinyPool {
  if (side === 'light' && pool.lightSide > 0) {
    return { lightSide: pool.lightSide - 1, darkSide: pool.darkSide + 1 };
  }
  if (side === 'dark' && pool.darkSide > 0) {
    return { lightSide: pool.lightSide + 1, darkSide: pool.darkSide - 1 };
  }
  return pool;
}
