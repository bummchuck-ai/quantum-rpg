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
