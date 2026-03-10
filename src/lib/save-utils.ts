// ============================================================
// QUANTUM RPG — Shared Save/Load Utilities
// ============================================================
// Extracted from SaveLoadPanel to share between in-game and start screen

export const STORAGE_KEY = 'quantum-rpg-saves';
export const AUTOSAVE_KEY = 'quantum-rpg-autosave';
export const PENDING_RESTORE_KEY = 'quantum-rpg-pending-restore';
export const MAX_SLOTS = 6;
export const SAVE_FORMAT_VERSION = 2;

export interface SaveSlot {
  id: string;
  name: string;
  characterName: string;
  species: string;
  career: string;
  timestamp: string;
  level?: number;
  messageCount?: number;
  data: string;
}

/** Read all save slots from localStorage */
export function getSaves(): SaveSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

/** Write save slots to localStorage */
export function setSaves(saves: SaveSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

/** Validate that save data has the expected structure */
export function validateSaveData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Keine gültigen Daten.' };
  if (!data.storeState) return { valid: false, error: 'Charakter-Daten fehlen.' };
  if (!data.chatMessages && !data.savedAt) return { valid: false, error: 'Keine Spielstand-Struktur erkannt.' };
  return { valid: true };
}

/** Format ISO date string to German locale */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('de-DE')} ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Slugify a name for file paths (handles German umlauts) */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
