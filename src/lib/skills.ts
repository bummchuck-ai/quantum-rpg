// ============================================================
// QUANTUM RPG — Canonical Skill Definitions
// ============================================================
// All 34 FFG Star Wars RPG skills. These are THE permanent skills
// of every character — always present, always part of the character.
// ============================================================

export interface SkillDefinition {
  key: string;
  nameDE: string;
  description: string;
  characteristic: string;
  category: 'general' | 'combat' | 'knowledge';
}

export const ALL_SKILLS: SkillDefinition[] = [
  // General Skills
  { key: 'astrogation', nameDE: 'Astronavigation', description: 'Hyperraumrouten berechnen und Sternennavigation. Ohne diesen Skill fliegst du in einen Stern.', characteristic: 'intellect', category: 'general' },
  { key: 'athletics', nameDE: 'Athletik', description: 'Klettern, Springen, Schwimmen, Laufen. Alles was deinen Körper an seine Grenzen bringt.', characteristic: 'brawn', category: 'general' },
  { key: 'charm', nameDE: 'Charme', description: 'Andere durch Freundlichkeit und Ausstrahlung überzeugen. Funktioniert besser als Blaster — manchmal.', characteristic: 'presence', category: 'general' },
  { key: 'coercion', nameDE: 'Einschüchterung', description: 'Andere durch Drohungen und Furcht gefügig machen. Die dunkle Seite der Überzeugung.', characteristic: 'willpower', category: 'general' },
  { key: 'computers', nameDE: 'Computer', description: 'Systeme hacken, Daten entschlüsseln, Sicherheitssysteme knacken. Jede Tür hat ein Terminal.', characteristic: 'intellect', category: 'general' },
  { key: 'cool', nameDE: 'Coolness', description: 'Unter Druck ruhig bleiben. Bestimmt deine Initiative, wenn du den Kampf kommen siehst.', characteristic: 'presence', category: 'general' },
  { key: 'coordination', nameDE: 'Körperbeherrschung', description: 'Balance, Akrobatik und Geschicklichkeit. Für Sprünge, enge Passagen und Ausweichmanöver.', characteristic: 'agility', category: 'general' },
  { key: 'deception', nameDE: 'Täuschung', description: 'Lügen, falsche Identitäten und Ablenkungsmanöver. "Das sind nicht die Droiden, die ihr sucht."', characteristic: 'cunning', category: 'general' },
  { key: 'discipline', nameDE: 'Disziplin', description: 'Mentale Stärke gegen Angst, Verführung und Machteinflüsse. Dein innerer Schild.', characteristic: 'willpower', category: 'general' },
  { key: 'leadership', nameDE: 'Führungsqualität', description: 'Andere motivieren und koordinieren. Ein guter Anführer macht aus Rekruten Helden.', characteristic: 'presence', category: 'general' },
  { key: 'mechanics', nameDE: 'Mechanik', description: 'Reparieren, modifizieren und zusammenbauen. Vom Blaster bis zum Hyperantrieb.', characteristic: 'intellect', category: 'general' },
  { key: 'medicine', nameDE: 'Medizin', description: 'Wunden behandeln, Gifte heilen, Stimpacks anwenden. Rettet Leben auf dem Schlachtfeld.', characteristic: 'intellect', category: 'general' },
  { key: 'negotiation', nameDE: 'Verhandlung', description: 'Faire Deals aushandeln, Preise drücken und Verträge schließen. Credits regieren die Galaxis.', characteristic: 'presence', category: 'general' },
  { key: 'perception', nameDE: 'Wahrnehmung', description: 'Details bemerken, Hinterhalte erkennen, Hinweise finden. Deine Augen und Ohren sind dein Radar.', characteristic: 'cunning', category: 'general' },
  { key: 'pilotingPlanetary', nameDE: 'Pilot (Planetar)', description: 'Speeder, Walkers und atmosphärische Fahrzeuge steuern. Für Verfolgungsjagden auf dem Boden.', characteristic: 'agility', category: 'general' },
  { key: 'pilotingSpace', nameDE: 'Pilot (Weltraum)', description: 'Raumschiffe und Sternjäger fliegen. Hypersprünge, Dogfights und Asteroidenfelder.', characteristic: 'agility', category: 'general' },
  { key: 'resilience', nameDE: 'Widerstandskraft', description: 'Physische Ausdauer gegen Gift, Krankheit, extreme Hitze und Kälte. Dein Körper hält durch.', characteristic: 'brawn', category: 'general' },
  { key: 'skulduggery', nameDE: 'Fingerfertigkeit', description: 'Schlösser knacken, Taschen leeren, Fesseln lösen. Die Kunst der geschickten Finger.', characteristic: 'cunning', category: 'general' },
  { key: 'stealth', nameDE: 'Heimlichkeit', description: 'Ungesehen und ungehört bleiben. Schleichen, verstecken und Schatten nutzen.', characteristic: 'agility', category: 'general' },
  { key: 'streetwise', nameDE: 'Szenekenntnis', description: 'Schwarzmarkt-Kontakte, Gerüchte, Informanten. Du weißt, wen man in welcher Cantina fragt.', characteristic: 'cunning', category: 'general' },
  { key: 'survival', nameDE: 'Überleben', description: 'In der Wildnis zurechtkommen. Nahrung finden, Spuren lesen, Unterschlupf bauen.', characteristic: 'cunning', category: 'general' },
  { key: 'vigilance', nameDE: 'Aufmerksamkeit', description: 'Instinktive Wachsamkeit. Bestimmt deine Initiative, wenn der Kampf dich überrascht.', characteristic: 'willpower', category: 'general' },
  // Combat Skills
  { key: 'brawl', nameDE: 'Nahkampf (Faust)', description: 'Faustkämpfe, Tritte und Ringen. Wenn der Blaster leer ist, zählen nur noch deine Fäuste.', characteristic: 'brawn', category: 'combat' },
  { key: 'gunnery', nameDE: 'Artillerie', description: 'Bordkanonen, Geschütztürme und Fahrzeugwaffen bedienen. Für den großen Knall.', characteristic: 'agility', category: 'combat' },
  { key: 'melee', nameDE: 'Nahkampf (Waffe)', description: 'Vibroklingen, Äxte, Stäbe und andere Nahkampfwaffen. Eleganter als ein Blaster.', characteristic: 'brawn', category: 'combat' },
  { key: 'rangedLight', nameDE: 'Fernkampf (Leicht)', description: 'Blasterpistolen und leichte Einhand-Fernkampfwaffen. Die Standard-Bewaffnung der Galaxis.', characteristic: 'agility', category: 'combat' },
  { key: 'rangedHeavy', nameDE: 'Fernkampf (Schwer)', description: 'Blastergewehre und schwere Zweihand-Waffen. Mehr Feuerkraft, weniger Mobilität.', characteristic: 'agility', category: 'combat' },
  { key: 'lightsaber', nameDE: 'Lichtschwert', description: 'Die Waffe eines Jedi. Eleganter als ein Blaster — für eine zivilisiertere Ära.', characteristic: 'brawn', category: 'combat' },
  // Knowledge Skills
  { key: 'coreWorlds', nameDE: 'Kernwelten', description: 'Wissen über Coruscant, Alderaan, Corellia und die zivilisierten Kernwelten. Politik, Kultur, Geografie.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'education', nameDE: 'Allgemeinbildung', description: 'Grundwissen über Wissenschaft, Geschichte und Technologie. Die galaktische Schulbildung.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'lore', nameDE: 'Altes Wissen', description: 'Legenden, Jedi-Geschichte, Sith-Überlieferungen und vergessene Zivilisationen. Mystisches Wissen.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'outerRim', nameDE: 'Äußerer Rand', description: 'Wissen über Tatooine, Hoth, Dagobah und die gesetzlosen Outer-Rim-Welten. Wer hier überlebt, kennt sich aus.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'underworld', nameDE: 'Unterwelt', description: 'Kenntnis über Syndikate, Hutten-Kartelle, Schwarzmärkte und kriminelle Netzwerke.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'warfare', nameDE: 'Kriegskunst', description: 'Militärtaktik, Schlachtfeldanalyse und Truppenführung. Für den nächsten großen Krieg.', characteristic: 'intellect', category: 'knowledge' },
  { key: 'xenology', nameDE: 'Xenologie', description: 'Wissen über die Spezies der Galaxis — Biologie, Kultur, Schwächen. Kenne deinen Feind.', characteristic: 'intellect', category: 'knowledge' },
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

// ============================================================
// Skill name lookup map (DE/EN aliases → canonical store key + characteristic)
// Used by the game session hook to resolve GM-provided skill names
// ============================================================

export const SKILL_MAP: Record<string, { key: string; char: string }> = {
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

/** Resolve a skill name (DE or EN, any case) to its canonical store key and characteristic */
export function resolveSkill(skillName: string): { key: string; char: string } {
  const normalized = skillName.toLowerCase().trim();
  return SKILL_MAP[normalized] || { key: normalized, char: 'intellect' };
}
