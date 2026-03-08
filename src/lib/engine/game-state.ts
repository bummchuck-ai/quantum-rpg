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
  objectives: { text: string; completed: boolean }[];
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
}

export function createNewSession(characterName: string): GameSession {
  return {
    id: `session-${Date.now()}`,
    name: `${characterName}'s Abenteuer`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scene: {
      planet: 'Tatooine',
      location: 'Orbit — Annäherung',
      description: 'Das Schiff gleitet durch den leeren Raum...',
      mood: 'mysterious',
      threats: [],
    },
    destinyPool: { lightSide: 2, darkSide: 2 },
    quests: [],
    npcs: [],
    sessionLog: [],
    totalXPEarned: 0,
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
