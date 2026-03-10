// ============================================================
// QUANTUM RPG — Galaxy Lore (from LORE.md)
// ============================================================
// Selective lore injection based on current game context.
// Source of truth: src/lib/gm/LORE.md
// ============================================================

export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: 'light' | 'dark' | 'neutral';
  keyFigures: string[];
}

export interface PlanetLore {
  name: string;
  description: string;
  notableLocations: string[];
  threats: string[];
  factions: string[];
}

export interface LegendaryCharacter {
  name: string;
  title: string;
  status: 'alive' | 'dead';
  faction: string;
}

// --- Factions ---
export const FACTIONS: Faction[] = [
  {
    id: 'triumvirat',
    name: 'Galaktisches Triumvirat',
    description: 'Regierung der Galaxie: Imperium + Galaktische Allianz + Jedi-Orden. Kaiserin Marasiah Fel ist tot, Bastion gefallen — das Triumvirat kaempft ums Ueberleben.',
    alignment: 'light',
    keyFigures: ['Kaan Tuur (Jedi-Meister)', 'Hoci (Jedi-General)', 'Phond (Shard-Jedi-Ritter)'],
  },
  {
    id: 'letzte-ordnung',
    name: 'Letzte Ordnung',
    description: 'Von Darth Plagueis II. gegruendete Sith-Fraktion. Kontrolliert weite Teile der Galaxie im vierten Kriegsjahr.',
    alignment: 'dark',
    keyFigures: ['Darth Plagueis II. (Imperator)', 'Darth Exactor (Sith-Lord)'],
  },
  {
    id: 'sons-of-corruption',
    name: 'Sons of Corruption',
    description: 'Ehemaliges Verbrechersyndikat, nun Verbuendete des Triumvirats unter Django Fett. Legendaere Kampfgruppe mit 100 Sitzungen Geschichte.',
    alignment: 'light',
    keyFigures: ['Django Fett (Mandalore)', 'THX 11-38 (Droide/Held)', 'Ossas'],
  },
  {
    id: 'ritter-von-vader',
    name: 'Ritter von Vader',
    description: 'Sith-Sekte unter Auron Thul. Betrieb die Cantina "Continental" in Mos Shuuta. Dient der Dunklen Seite.',
    alignment: 'dark',
    keyFigures: ['Auron Thul (Anfuehrer, auf der Flucht)'],
  },
  {
    id: 'mandalorianer',
    name: 'Mandalorianer',
    description: 'Unter Mandalore Django Fett vereint. Kontrollieren Mandalor. Starke Kriegerkultur, Beskar-Ruestungen.',
    alignment: 'light',
    keyFigures: ['Django Fett (Mandalore)', 'John Flint', 'MRX-0800'],
  },
  {
    id: 'kanjiklub',
    name: 'Kanjiklub',
    description: 'Piraten und Schmuggler, als "Robin Hoods der Galaxie" bekannt. Unter Akana Sa-Vin.',
    alignment: 'neutral',
    keyFigures: ['Akana Sa-Vin'],
  },
  {
    id: 'huttenclans',
    name: 'Huttenclans',
    description: 'Wechselnde Allianzen krimineller Hutten-Lords. Kontrollieren Schmuggel, Sklaverei und illegalen Handel.',
    alignment: 'neutral',
    keyFigures: ['Mallolo The Hutt', 'Teemo der Hutt'],
  },
  {
    id: 'kult-der-besudelten',
    name: 'Kult der Besudelten',
    description: 'Dathomiri-Kult der den Daemonen Beelzebub beschworen will. Verfluchte Fliegenamulette verbreiten ihren Einfluss.',
    alignment: 'dark',
    keyFigures: ['Imago (Kultistin)'],
  },
];

// --- Planets ---
export const PLANETS: PlanetLore[] = [
  {
    name: 'Tatooine',
    description: 'Wuestenplanet, Schauplatz gewaltiger Schlachten. Mos Eisley ist zerstoert, die Bevoelkerung widersteht.',
    notableLocations: ['Mos Shuuta (Continental Cantina)', 'Mos Eisley (zerstoert)', 'Lars Farm', 'Mos Pelgo', 'Spark of Hope', 'B\'omarr Tempel'],
    threats: ['Blutauge (Tusken-Guerillakrieg)', 'Omega-Red-Virus-Nachwirkungen'],
    factions: ['triumvirat', 'ritter-von-vader'],
  },
  {
    name: 'Mandalor',
    description: 'Heimatwelt der Mandalorianer. Django Fett regiert als Mandalore vom Thron seiner Vorfahren.',
    notableLocations: ['Thronsaal des Mandalore'],
    threats: [],
    factions: ['mandalorianer'],
  },
  {
    name: 'Dathomir',
    description: 'Mystischer Planet der Nachtschwestern. Setting der "Herr der Fliegen"-Kampagne mit verfluchten Amuletten.',
    notableLocations: ['Hoellenmark/Markovia', 'Hamburg', 'Magdeburg', 'Angerburg'],
    threats: ['Kult der Besudelten', 'Verfluchte Fliegenamulette'],
    factions: ['kult-der-besudelten'],
  },
  {
    name: 'Nar Shaddaa',
    description: 'Mond der Schmuggler. Riesige Stadtlandschaft, kontrolliert von Verbrechersyndikaten und Hutten.',
    notableLocations: ['Unterwelt-Maerkte', 'Hutten-Palaeste'],
    threats: ['Kopfgeldjaeger', 'Syndikate'],
    factions: ['huttenclans'],
  },
  {
    name: 'Coruscant',
    description: 'Ehemalige Hauptstadt der Galaxie. Stadtwelt, politisches Zentrum — Zustand im Krieg unsicher.',
    notableLocations: ['Senat', 'Jedi-Tempel-Ruinen'],
    threats: ['Letzte Ordnung-Agenten'],
    factions: ['triumvirat', 'letzte-ordnung'],
  },
  {
    name: 'Bastion',
    description: 'Ehemalige Thronwelt des Imperiums — GEFALLEN an die Letzte Ordnung. Cade Skywalker wurde hier hingerichtet.',
    notableLocations: ['Imperiale Zitadelle (gefallen)'],
    threats: ['Letzte Ordnung kontrolliert den Planeten'],
    factions: ['letzte-ordnung'],
  },
  {
    name: 'Dorumaa',
    description: 'Ozeanwelt. Forschungsschiff Cronus mit Genmanipulations-Experimenten entdeckt. Die Charon breiten sich aus.',
    notableLocations: ['Forschungsschiff Cronus'],
    threats: ['Charon-Invasion', 'Deformierte Wesen'],
    factions: ['triumvirat'],
  },
  {
    name: 'Weik',
    description: 'Mittelalterlicher Planet. Setting der "Beskar"-Kampagne. Haus Schmetterfels, Feste Sonnglas (zerstoert).',
    notableLocations: ['Haus Schmetterfels', 'Feste Sonnglas (zerstoert)'],
    threats: ['Aegon Gideon (Nachkomme von Moff Gideon)'],
    factions: ['mandalorianer'],
  },
  {
    name: 'Goroth',
    description: 'Vulkanplanet. Schloss von Kylo Ren mit Sith-Artefakten: Lichtschwerter von Sidious und Vader.',
    notableLocations: ['Schloss von Kylo Ren'],
    threats: ['Sith-Artefakte', 'Lava-Gefahren'],
    factions: ['letzte-ordnung'],
  },
];

// --- Legendary Characters ---
export const LEGENDARY_CHARACTERS: LegendaryCharacter[] = [
  { name: 'Django Fett', title: 'Mandalore, Piratenkonig, ehem. Son of Corruption', status: 'alive', faction: 'mandalorianer' },
  { name: 'Darth Plagueis II.', title: 'Imperator der Letzten Ordnung', status: 'alive', faction: 'letzte-ordnung' },
  { name: 'Darth Exactor', title: 'Sith-Lord, ehem. Galen Marek', status: 'alive', faction: 'letzte-ordnung' },
  { name: 'Auron Thul', title: 'Anfuehrer der Ritter von Vader', status: 'alive', faction: 'ritter-von-vader' },
  { name: 'Cap Horn', title: 'General der Buergermiliz auf Tatooine', status: 'alive', faction: 'triumvirat' },
  { name: 'Leonidas Keldau', title: 'Buergermeister der Spark of Hope', status: 'alive', faction: 'triumvirat' },
  { name: 'Roisto Viis', title: 'Retter Tatooines (Zombie-Gegenmittel)', status: 'alive', faction: 'triumvirat' },
  { name: 'THX 11-38', title: 'Droide, Hacker, Arzt, Held von Mandalor', status: 'alive', faction: 'sons-of-corruption' },
  { name: 'Blutauge', title: 'Tusken-Haeuptling, Sohn von Darth Krayt', status: 'alive', faction: 'neutral' },
  { name: 'Kaan Tuur', title: 'Jedi-Meister, Jedi-Rat', status: 'alive', faction: 'triumvirat' },
  { name: 'Hoci', title: 'Jedi-Meister, General', status: 'alive', faction: 'triumvirat' },
  { name: 'Phond', title: 'Shard-Jedi-Ritter, Jedi-Rat', status: 'alive', faction: 'triumvirat' },
  { name: 'Cade Skywalker', title: 'Letzter Skywalker', status: 'dead', faction: 'triumvirat' },
  { name: 'Kaiserin Marasiah Fel', title: 'Herrscherin des Triumvirats', status: 'dead', faction: 'triumvirat' },
  { name: 'Darth Vurik', title: 'Sith-Lord, Usurpator Mandalors', status: 'dead', faction: 'letzte-ordnung' },
];

// --- Galactic Situation ---
export const GALACTIC_SITUATION = `Die Galaxie befindet sich im Jahr 181 ABY, im vierten Jahr eines verheerenden Krieges.
Darth Plagueis II. und seine Letzte Ordnung kontrollieren weite Teile des Raums.
Das Galaktische Triumvirat kaempft ums Ueberleben — die Kaiserin ist tot, Bastion gefallen, der Jedi-Rat dezimiert.
Aber es gibt Hoffnung: Django Fett hat Mandalor vereint. Die Sons of Corruption stehen auf der Seite des Lichts.
Auf Tatooine widersteht die Bevoelkerung. Neue Helden erheben sich.`;

// --- Build lore context for system prompt ---
export function buildLoreContext(gameState: any): string {
  const currentPlanet = (gameState.currentPlanet || '').toLowerCase();
  const npcFactions = new Set<string>();

  // Collect faction IDs from NPCs
  for (const npc of (gameState.npcRelationships || [])) {
    if (npc.faction) {
      const factionMatch = FACTIONS.find(f =>
        f.name.toLowerCase().includes(npc.faction.toLowerCase()) ||
        npc.faction.toLowerCase().includes(f.id)
      );
      if (factionMatch) npcFactions.add(factionMatch.id);
    }
  }

  // Always include the two main warring factions
  npcFactions.add('triumvirat');
  npcFactions.add('letzte-ordnung');

  // Select relevant factions (max 4)
  const relevantFactions = FACTIONS
    .filter(f => npcFactions.has(f.id))
    .slice(0, 4);

  // Find current planet lore
  const planetLore = PLANETS.find(p => p.name.toLowerCase() === currentPlanet);

  // Add planet's factions to relevant set
  if (planetLore) {
    for (const fId of planetLore.factions) {
      const f = FACTIONS.find(faction => faction.id === fId);
      if (f && !relevantFactions.find(rf => rf.id === f.id) && relevantFactions.length < 5) {
        relevantFactions.push(f);
      }
    }
  }

  const sections: string[] = ['# QUANTUM-UNIVERSUM (181 ABY)'];
  sections.push(GALACTIC_SITUATION);

  sections.push('\n## Relevante Fraktionen');
  for (const f of relevantFactions) {
    sections.push(`- **${f.name}**: ${f.description}`);
  }

  if (planetLore) {
    sections.push(`\n## Aktueller Planet: ${planetLore.name}`);
    sections.push(planetLore.description);
    if (planetLore.notableLocations.length > 0) {
      sections.push(`Wichtige Orte: ${planetLore.notableLocations.join(', ')}`);
    }
    if (planetLore.threats.length > 0) {
      sections.push(`Bekannte Gefahren: ${planetLore.threats.join(', ')}`);
    }
  }

  // Add a few relevant legendary characters
  const relevantCharacters = LEGENDARY_CHARACTERS.filter(c => {
    if (planetLore && planetLore.factions.includes(c.faction)) return true;
    return npcFactions.has(c.faction);
  }).slice(0, 5);

  if (relevantCharacters.length > 0) {
    sections.push('\n## Legendaere Persoenlichkeiten');
    for (const c of relevantCharacters) {
      sections.push(`- **${c.name}** — ${c.title} [${c.status === 'alive' ? 'lebt' : 'tot'}]`);
    }
  }

  return sections.join('\n');
}
