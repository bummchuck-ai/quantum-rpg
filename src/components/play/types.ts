// ============================================================
// QUANTUM RPG — Play Module Shared Types
// ============================================================

export interface GMResponse {
  narrative: string;
  options?: { id: string; text: string }[];
  stateChanges?: Record<string, unknown>;
  mood?: string;
  combatAction?: unknown;
  error?: string;
  npcDialogue?: { speaker: string; text: string }[];
  requiresRoll?: boolean;
  rollInfo?: {
    skill: string;
    difficulty: string;
    reason?: string;
    boost?: number;
    setback?: number;
  };
}

export interface Message {
  role: 'gm' | 'player';
  content: string | GMResponse;
}

export interface RollRequest {
  skill: string;
  difficulty: string;
  reason: string;
  boost?: number;
  setback?: number;
}

export interface Toast {
  id: string;
  text: string;
  type: 'xp' | 'system' | 'combat' | 'heal';
  ts: number;
}

export const DIFFICULTY_MAP: Record<string, number> = {
  simple: 0, easy: 1, average: 2, hard: 3, daunting: 4, formidable: 5
};

// Auto-save interval in ms
export const AUTOSAVE_INTERVAL = 60000;
