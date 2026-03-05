// ============================================================
// QUANTUM RPG — Canonical Skill Definitions
// ============================================================
// All 34 FFG Star Wars RPG skills. These are THE permanent skills
// of every character — always present, always part of the character.
// ============================================================

export interface SkillDefinition {
  key: string;
  nameDE: string;
  characteristic: string;
  category: 'general' | 'combat' | 'knowledge';
}

export const ALL_SKILLS: SkillDefinition[] = [
  // General Skills
  { key: 'astrogation', nameDE: 'Astronavigation', characteristic: 'intellect', category: 'general' },
  { key: 'athletics', nameDE: 'Athletik', characteristic: 'brawn', category: 'general' },
  { key: 'charm', nameDE: 'Charme', characteristic: 'presence', category: 'general' },
  { key: 'coercion', nameDE: 'Einschüchterung', characteristic: 'willpower', category: 'general' },
  { key: 'computers', nameDE: 'Computer', characteristic: 'intellect', category: 'general' },
  { key: 'cool', nameDE: 'Coolness', characteristic: 'presence', category: 'general' },
  { key: 'coordination', nameDE: 'Körperbeherrschung', characteristic: 'agility', category: 'general' },
  { key: 'deception', nameDE: 'Täuschung', characteristic: 'cunning', category: 'general' },
  { key: 'discipline', nameDE: 'Disziplin', characteristic: 'willpower', category: 'general' },
  { key: 'leadership', nameDE: 'Führungsqualität', characteristic: 'presence', category: 'general' },
  { key: 'mechanics', nameDE: 'Mechanik', characteristic: 'intellect', category: 'general' },
  { key: 'medicine', nameDE: 'Medizin', characteristic: 'intellect', category: 'general' },
  { key: 'negotiation', nameDE: 'Verhandlung', characteristic: 'presence', category: 'general' },
  { key: 'perception', nameDE: 'Wahrnehmung', characteristic: 'cunning', category: 'general' },
  { key: 'pilotingPlanetary', nameDE: 'Pilot (Planetar)', characteristic: 'agility', category: 'general' },
  { key: 'pilotingSpace', nameDE: 'Pilot (Weltraum)', characteristic: 'agility', category: 'general' },
  { key: 'resilience', nameDE: 'Widerstandskraft', characteristic: 'brawn', category: 'general' },
  { key: 'skulduggery', nameDE: 'Fingerfertigkeit', characteristic: 'cunning', category: 'general' },
  { key: 'stealth', nameDE: 'Heimlichkeit', characteristic: 'agility', category: 'general' },
  { key: 'streetwise', nameDE: 'Szenekenntnis', characteristic: 'cunning', category: 'general' },
  { key: 'survival', nameDE: 'Überleben', characteristic: 'cunning', category: 'general' },
  { key: 'vigilance', nameDE: 'Aufmerksamkeit', characteristic: 'willpower', category: 'general' },
  // Combat Skills
  { key: 'brawl', nameDE: 'Nahkampf (Faust)', characteristic: 'brawn', category: 'combat' },
  { key: 'gunnery', nameDE: 'Artillerie', characteristic: 'agility', category: 'combat' },
  { key: 'melee', nameDE: 'Nahkampf (Waffe)', characteristic: 'brawn', category: 'combat' },
  { key: 'rangedLight', nameDE: 'Fernkampf (Leicht)', characteristic: 'agility', category: 'combat' },
  { key: 'rangedHeavy', nameDE: 'Fernkampf (Schwer)', characteristic: 'agility', category: 'combat' },
  // Knowledge Skills
  { key: 'coreWorlds', nameDE: 'Kernwelten', characteristic: 'intellect', category: 'knowledge' },
  { key: 'education', nameDE: 'Allgemeinbildung', characteristic: 'intellect', category: 'knowledge' },
  { key: 'lore', nameDE: 'Altes Wissen', characteristic: 'intellect', category: 'knowledge' },
  { key: 'outerRim', nameDE: 'Äußerer Rand', characteristic: 'intellect', category: 'knowledge' },
  { key: 'underworld', nameDE: 'Unterwelt', characteristic: 'intellect', category: 'knowledge' },
  { key: 'warfare', nameDE: 'Kriegskunst', characteristic: 'intellect', category: 'knowledge' },
  { key: 'xenology', nameDE: 'Xenologie', characteristic: 'intellect', category: 'knowledge' },
];

/** Map of skill key → German name */
export const SKILL_NAMES_DE: Record<string, string> = Object.fromEntries(
  ALL_SKILLS.map(s => [s.key, s.nameDE])
);

/** Map of skill key → governing characteristic */
export const SKILL_CHARACTERISTICS: Record<string, string> = Object.fromEntries(
  ALL_SKILLS.map(s => [s.key, s.characteristic])
);

/** Create a full skill ranks object with all 34 skills at rank 0, optionally merging in existing ranks */
export function createFullSkillRanks(existingRanks?: Record<string, number>): Record<string, number> {
  const ranks: Record<string, number> = {};
  for (const skill of ALL_SKILLS) {
    ranks[skill.key] = 0;
  }
  if (existingRanks) {
    for (const [key, rank] of Object.entries(existingRanks)) {
      if (key in ranks) {
        ranks[key] = rank;
      }
    }
  }
  return ranks;
}
