// ============================================================
// QUANTUM RPG — Game Master System Prompt Builder
// ============================================================
// Builds the system prompt for Claude API based on current game state.
// This is THE HEART of the game — Claude as the AI Game Master.
// ============================================================

import type { Character, GameState, SessionEvent } from '@/types/character';
import { ALL_SKILLS, SKILL_NAMES_DE as SHARED_SKILL_NAMES } from '@/lib/skills';

// --- The Core GM Persona ---
const GM_PERSONA = `Du bist der Game Master eines immersiven Star Wars Pen & Paper Rollenspiels.

# DEINE ROLLE
Du bist ein erfahrener, cinematischer Game Master. Dein Erzählstil ist:
- Bildgewaltig und atmosphärisch — der Spieler soll die Galaxis SEHEN
- Reaktiv auf Würfelergebnisse — Triumph ist EPISCH, Verzweiflung ist KATASTROPHAL
- NPCs haben Persönlichkeit, Stimme, Motive — sie sind nicht flach
- Die Welt lebt weiter, auch wenn der Spieler nicht hinschaut
- Konsequenzen sind real — Entscheidungen haben Gewicht

# SPRACHE
- Du erzählst auf Deutsch
- Dialoge von NPCs in Anführungszeichen
- Innere Gedanken oder Beschreibungen kursiv
- Atmosphärische Geräusche und Umgebung in Klammern

# STRUKTUR DEINER ANTWORTEN
Jede Antwort folgt diesem Muster:

1. **Atmosphärische Beschreibung** (2-4 Sätze)
   Beschreibe die Szene, das Licht, die Geräusche, die Stimmung.

2. **Konsequenz der letzten Aktion** (wenn vorhanden)
   Was ist passiert? Wie hat die Welt reagiert?

3. **NPC-Interaktion** (wenn relevant)
   NPCs sprechen, reagieren, handeln — mit eigener Stimme.

4. **Situation & Optionen**
   Biete dem Spieler 3 konkrete Handlungsoptionen (A, B, C) an.
   Zusätzlich immer: "Oder beschreibe frei, was du tun möchtest."

# WÜRFELERGEBNIS-INTERPRETATION
Wenn ein Würfelergebnis mitgeliefert wird:
- **Erfolg + Vorteile**: Die Aktion gelingt elegant, mit positivem Nebeneffekt
- **Erfolg + Bedrohungen**: Die Aktion gelingt, aber etwas Unangenehmes passiert
- **Fehlschlag + Vorteile**: Die Aktion misslingt, aber ein Silberstreif am Horizont
- **Fehlschlag + Bedrohungen**: Die Aktion misslingt und verschlimmert die Lage
- **Triumph**: Etwas Spektakuläres, Unerwartetes, Positives geschieht
- **Verzweiflung**: Eine Katastrophe, die die Situation dramatisch verändert

# VERPFLICHTUNG / PFLICHT / MORAL
Der Charakter hat narrative Verpflichtungen. Webe diese ORGANISCH in die Geschichte ein:
- Sie tauchen nicht jede Runde auf, aber regelmäßig
- Sie schaffen Dilemmas und interessante Entscheidungen
- Sie verbinden sich mit der Hauptquest

# FAHRZEUGE & RAUMSCHIFFE
Wenn Fahrzeuge oder Raumschiffe im Spiel eingesetzt werden:
- **Pilot (Planetar)** wird für planetare Fahrzeuge genutzt (Landspeeder, Walker, Speederbikes)
- **Pilot (Weltraum)** wird für Raumschiffe genutzt (Sternenjäger, Frachter, Fähren)
- **Artillerie** wird für Fahrzeug- und Schiffswaffen genutzt
- **Mechanik** wird für Reparaturen an Fahrzeugen genutzt
- **Astronavigation** wird für Hyperraumsprünge genutzt
- Fahrzeugkampf nutzt die **Silhouette** zur Bestimmung der Schwierigkeit
- Verfolgungsjagden: Konkurrierendes Wurfsystem mit Pilot-Fertigkeit
- Hüllentrauma und Systembelastung tracken den Zustand des Fahrzeugs
- Kritische Treffer auf Fahrzeuge haben eigene Tabelle

# CHARAKTERWISSEN — SO NUTZT DU ES
- Sprich den Charakter IMMER mit seinem NAMEN an, nicht "du" oder "der Spieler"
- Reagiere auf Spezies-Eigenheiten in der Erzählung (z.B. Twi'lek-Lekku bewegen sich bei Emotionen, Wookiees knurren, Droiden surren)
- Webe den Hintergrund (Verpflichtung/Pflicht/Moral) ORGANISCH in die Geschichte — er schafft Dilemmas und treibt die Handlung
- Respektiere die Ausrüstung: Gib dem Charakter KEINE Waffen/Items, die er bereits besitzt. Beschreibe wie er seine eigenen Waffen einsetzt
- Kenne die Fertigkeiten: Wenn der Charakter bei etwas Rang 0 hat, betone die Schwierigkeit. Bei hohen Rängen, zeige Kompetenz in der Erzählung
- Talente sind aktive Fähigkeiten — nutze sie narrativ (z.B. "Dank deinem Talent 'Überlebensinstinkt' spürst du die Gefahr")

# REGELN
- Du bestimmst NICHT die Aktionen des Spielercharakters
- Du sagst dem Spieler, wann ein Wurf nötig ist und auf welche Fertigkeit
- Du beschreibst Ergebnisse, aber der Spieler entscheidet seine Reaktion
- Kampf folgt der Runden-Struktur: Initiative, Manöver, Aktion
`;

const SKILL_NAMES_DE: Record<string, string> = {
  astrogation: 'Astronavigation', athletics: 'Athletik', charm: 'Charme',
  coercion: 'Einschüchterung', computers: 'Computer', cool: 'Coolness',
  coordination: 'Körperbeherrschung', deception: 'Täuschung', discipline: 'Disziplin',
  leadership: 'Führungsqualität', mechanics: 'Mechanik', medicine: 'Medizin',
  negotiation: 'Verhandlung', perception: 'Wahrnehmung', pilotingPlanetary: 'Pilot (Planetar)',
  pilotingSpace: 'Pilot (Weltraum)', resilience: 'Widerstandskraft', skulduggery: 'Fingerfertigkeit',
  stealth: 'Heimlichkeit', streetwise: 'Szenekenntnis', survival: 'Überleben',
  vigilance: 'Aufmerksamkeit', brawl: 'Nahkampf (Faust)', gunnery: 'Artillerie',
  melee: 'Nahkampf (Waffe)', rangedLight: 'Fernkampf (Leicht)', rangedHeavy: 'Fernkampf (Schwer)',
  coreWorlds: 'Kernwelten', education: 'Allgemeinbildung', lore: 'Altes Wissen',
  outerRim: 'Äußerer Rand', underworld: 'Unterwelt', warfare: 'Kriegskunst', xenology: 'Xenologie',
};

function buildSkillContext(character: any): string {
  const skillRanks = character.skillRanks || {};
  const careerSkills = new Set<string>([
    ...(character.career?.careerSkills || []),
    ...(character.specializations?.[0]?.careerSkills || []),
  ]);

  const categories: Record<string, typeof ALL_SKILLS> = {
    'Allgemeine Fertigkeiten': ALL_SKILLS.filter(s => s.category === 'general'),
    'Kampffertigkeiten': ALL_SKILLS.filter(s => s.category === 'combat'),
    'Wissensfertigkeiten': ALL_SKILLS.filter(s => s.category === 'knowledge'),
  };

  const sections: string[] = [];
  for (const [catName, skills] of Object.entries(categories)) {
    const trained = skills.filter(s => (skillRanks[s.key] || 0) > 0);
    const untrained = skills.filter(s => (skillRanks[s.key] || 0) === 0);

    const lines: string[] = [];
    // Show trained skills with full info
    for (const skill of trained) {
      const rank = skillRanks[skill.key];
      const career = careerSkills.has(skill.key) ? ' [Karriere]' : '';
      lines.push(`  - ${skill.nameDE}: Rang ${rank}${career}`);
    }
    // Summarize untrained skills compactly
    if (untrained.length > 0) {
      const untrainedNames = untrained.map(s => s.nameDE).join(', ');
      lines.push(`  - Untrainiert (Rang 0): ${untrainedNames}`);
    }
    sections.push(`### ${catName}\n${lines.join('\n')}`);
  }
  return sections.join('\n');
}

function buildTalentContext(character: any): string {
  const talents = character.ownedTalents || [];
  if (talents.length === 0) return '';

  return `## Talente
${talents.map((t: any) => {
    const rankInfo = t.ranked ? ` (Rang ${t.currentRank})` : '';
    return `- **${t.name}**${rankInfo}: ${t.description}`;
  }).join('\n')}`;
}

function buildGearContext(character: any): string {
  const gear = character.ownedGear || [];
  if (gear.length === 0) return '## Ausrüstung\nKeine Ausrüstung.';

  const weapons = gear.filter((g: any) => g.type === 'weapon');
  const armor = gear.filter((g: any) => g.type === 'armor');
  const other = gear.filter((g: any) => g.type !== 'weapon' && g.type !== 'armor');

  const sections: string[] = ['## Ausrüstung'];

  if (weapons.length > 0) {
    sections.push('### Waffen');
    for (const w of weapons) {
      const props = (w.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${w.name}**${props ? ` (${props})` : ''}${w.description ? ` — ${w.description}` : ''}`);
    }
  }

  if (armor.length > 0) {
    sections.push('### Rüstung');
    for (const a of armor) {
      const props = (a.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${a.name}**${props ? ` (${props})` : ''}${a.description ? ` — ${a.description}` : ''}`);
    }
  }

  if (other.length > 0) {
    sections.push('### Sonstige Ausrüstung');
    for (const item of other) {
      sections.push(`- **${item.name}**${item.description ? ` — ${item.description}` : ''}`);
    }
  }

  return sections.join('\n');
}

function buildBackgroundContext(character: any): string {
  if (!character.backgroundType) return '';

  const typeLabels: Record<string, string> = {
    Obligation: 'Verpflichtung',
    Duty: 'Pflicht',
    Morality: 'Moral',
  };
  const label = typeLabels[character.backgroundType] || character.backgroundType;

  return `## Hintergrund: ${label}
Typ: ${character.backgroundOption || 'Unbekannt'}
Wert: ${character.backgroundValue || 0}
WICHTIG: Webe diese ${label} regelmäßig in die Erzählung ein! Sie schafft Dilemmas, treibt Nebenhandlungen und verbindet sich mit der Hauptquest.`;
}

// --- Build context from game state ---
function buildCharacterContext(character: any): string {
  const mainSpec = character.specializations?.[0];
  const woundThreshold = (character.species?.woundThresholdBase || 10) + (character.characteristics?.brawn || 0);
  const strainThreshold = (character.species?.strainThresholdBase || 10) + (character.characteristics?.willpower || 0);
  const soakValue = (character.characteristics?.brawn || 0);

  return `# SPIELERCHARAKTER: ${character.name}

## Identität
Name: ${character.name}
Spezies: ${character.species?.name || 'Unbekannt'}
${character.species?.description ? `Spezies-Beschreibung: ${character.species.description}` : ''}
${character.species?.abilities?.length > 0 ? `Spezies-Fähigkeiten: ${character.species.abilities.join('; ')}` : ''}
Karriere: ${character.career?.name || 'Unbekannt'}
${character.career?.description ? `Karriere-Beschreibung: ${character.career.description}` : ''}
Spezialisierung: ${mainSpec?.name || 'Keine'}
${mainSpec?.description ? `Spezialisierungs-Beschreibung: ${mainSpec.description}` : ''}

## Eigenschaften (aktuelle Werte)
Stärke: ${character.characteristics?.brawn} | Gewandtheit: ${character.characteristics?.agility} | Intelligenz: ${character.characteristics?.intellect}
List: ${character.characteristics?.cunning} | Willenskraft: ${character.characteristics?.willpower} | Charisma: ${character.characteristics?.presence}

## Fertigkeiten
${buildSkillContext(character)}

${buildTalentContext(character)}

${buildBackgroundContext(character)}

${buildGearContext(character)}

## Zustand
Credits: ${character.credits}
Wunden: ${character.wounds}/${woundThreshold}
Stress: ${character.strain}/${strainThreshold}
Widerstandswert (Soak): ${soakValue}
Verfügbare EP: ${character.availableXP || 0} | Ausgegebene EP: ${character.spentXP || 0}
`;
}

function buildVehicleContext(gameState: any): string {
  // Check multiple possible locations for vehicle data
  const character = gameState.character || gameState;
  const vehicles = character?.vehicles || gameState.vehicles || [];
  if (!vehicles || vehicles.length === 0) return '';

  const v = vehicles[0]; // Primary vehicle
  const isBase = v.category === 'base';

  let context = `## Gruppen-Fahrzeug / Basis
Name: ${v.name}
Typ: ${v.category}`;

  if (isBase) {
    context += `\nDies ist eine stationäre Basis — KEIN Raumschiff!
Die Gruppe startet an diesem Ort. Sie haben KEIN eigenes Raumschiff.
Für Reisen müssen sie Passage buchen, ein Schiff mieten oder stehlen.
Besonderheiten: ${v.specialFeatures?.join(', ') || 'Keine'}`;
  } else {
    context += `
Silhouette: ${v.silhouette} | Geschwindigkeit: ${v.speed} | Handling: ${v.handling}
Panzerung: ${v.armor} | Hülle: ${v.currentHullTrauma || 0}/${v.hullTraumaThreshold} | System: ${v.currentSystemStrain || 0}/${v.systemStrainThreshold}
Crew: ${v.crew} | Passagiere: ${v.passengers}`;
    if (v.hyperdrive) context += `\nHyperantrieb: Klasse ${v.hyperdrive}`;
    if (v.weapons?.length > 0) context += `\nBewaffnung: ${v.weapons.map((w: any) => w.name).join(', ')}`;
    if (v.specialFeatures?.length > 0) context += `\nBesonderheiten: ${v.specialFeatures.join(', ')}`;
  }

  context += `\n\nWICHTIG: Der Spieler hat dieses Fahrzeug/diese Basis gewählt. Respektiere diese Wahl!
Wenn es eine Basis ist, starte die Geschichte DORT — nicht in einem Raumschiff.
Wenn es ein Frachter ist, beschreibe ihn als das Schiff der Gruppe.`;

  return context;
}

function buildSceneContext(gameState: any): string {
  const recentHistory = gameState.sessionHistory
    ?.slice(-10)
    .join('\n') || 'Spielbeginn — keine bisherigen Ereignisse.';

  return `# AKTUELLE SZENE
Planet: ${gameState.currentPlanet}
Szene: ${gameState.currentScene}

## Schicksalspunkte
Helle Seite: ${gameState.destinyPool?.lightSide}
Dunkle Seite: ${gameState.destinyPool?.darkSide}

## Letzte Ereignisse
${recentHistory}
`;
}

function buildForceContext(gameState: any): string {
  const forceRating = gameState.forceRating || 0;
  if (forceRating === 0) return '';
  const powers = gameState.ownedPowers || [];
  return `## Macht
Macht-Rang: ${forceRating}
Erlernte Machtkräfte: ${powers.length > 0 ? powers.join(', ') : 'Keine'}
Der Charakter ist machtsensitiv. Wenn er die Macht einsetzt, würfle Machtwürfel.
Dunkle-Seite-Punkte erzeugen Belastung (Conflict), Lichtseite-Punkte sind "frei".
`;
}

function buildCombatContext(gameState: any): string {
  if (!gameState.combatActive) return '';
  return `## KAMPF AKTIV
Runde: ${gameState.combatRound || 1}
Der Kampf läuft! Beschreibe Kampfaktionen im Runden-System:
- Jeder Charakter hat 1 Aktion + 1 Manöver pro Runde
- Aktionen: Angriff, Fertigkeit einsetzen, Macht einsetzen
- Manöver: Bewegen, Deckung suchen, Waffe ziehen, Zielen
- Initiative bestimmt die Reihenfolge
`;
}

function buildQuestContext(gameState: any): string {
  const quests = gameState.questLog || [];
  if (quests.length === 0) return '';

  const active = quests.filter((q: any) => q.status === 'active');
  const completed = quests.filter((q: any) => q.status === 'completed');
  if (active.length === 0 && completed.length === 0) return '';

  const sections: string[] = ['## Missionslog'];

  if (active.length > 0) {
    sections.push('### Aktive Missionen');
    for (const q of active) {
      sections.push(`- **${q.title}**: ${q.description}`);
      if (q.objectives?.length > 0) {
        for (const obj of q.objectives) {
          const status = obj.completed || obj.isCompleted ? '[X]' : '[ ]';
          const progress = obj.targetProgress ? ` (${obj.currentProgress || 0}/${obj.targetProgress})` : '';
          sections.push(`  ${status} ${obj.description}${progress}`);
        }
      }
    }
  }

  if (completed.length > 0) {
    sections.push(`### Abgeschlossene Missionen: ${completed.map((q: any) => q.title).join(', ')}`);
  }

  return sections.join('\n');
}

function buildNPCContext(gameState: any): string {
  const npcs = gameState.npcRelationships || [];
  if (npcs.length === 0) return '';

  return `## Bekannte NPCs
${npcs.map((n: any) => {
    const disposition = n.disposition > 30 ? 'freundlich' : n.disposition < -30 ? 'feindlich' : 'neutral';
    return `- **${n.npcName}** (${disposition}): ${n.notes || 'Keine Details'}`;
  }).join('\n')}`;
}

// --- Main function: Build the complete system prompt ---
export function buildSystemPrompt(gameState: any): string {
  const sections = [
    GM_PERSONA,
    buildCharacterContext(gameState.character),
    buildVehicleContext(gameState),
    buildForceContext(gameState),
    buildCombatContext(gameState),
    buildQuestContext(gameState),
    buildNPCContext(gameState),
    buildSceneContext(gameState),
  ].filter(s => s.length > 0);
  return sections.join('\n\n---\n\n');
}

// --- Build a user message with optional dice result ---
export function buildUserMessage(
  playerAction: string,
  diceResult?: any
): string {
  let message = `Der Spieler sagt/tut: "${playerAction}"`;

  if (diceResult) {
    message += `\n\nWürfelergebnis für ${diceResult.skillUsed} (${diceResult.difficulty}):\n`;
    message += diceResult.isSuccess
      ? `ERFOLG mit ${diceResult.netSuccess} Netto-Erfolgen`
      : `FEHLSCHLAG mit ${Math.abs(diceResult.netSuccess)} Netto-Fehlschlägen`;

    if (diceResult.netAdvantage > 0) {
      message += ` und ${diceResult.netAdvantage} Vorteilen`;
    } else if (diceResult.netAdvantage < 0) {
      message += ` und ${Math.abs(diceResult.netAdvantage)} Bedrohungen`;
    }

    if (diceResult.triumph > 0) {
      message += ` — TRIUMPH!`;
    }
    if (diceResult.despair > 0) {
      message += ` — VERZWEIFLUNG!`;
    }
  }

  return message;
}

// --- Response format instruction ---
export const RESPONSE_FORMAT = `
Antworte IMMER im folgenden JSON-Format:
{
  "narrative": "Deine atmosphärische Erzählung hier...",
  "npcDialogue": [
    {"name": "NPC-Name", "text": "Was der NPC sagt"}
  ],
  "options": [
    {"id": "A", "text": "Beschreibung der Option A"},
    {"id": "B", "text": "Beschreibung der Option B"},
    {"id": "C", "text": "Beschreibung der Option C"}
  ],
  "requiresRoll": false,
  "rollInfo": {
    "skill": "Name der Fertigkeit falls Wurf nötig",
    "difficulty": "easy|average|hard|daunting|formidable",
    "reason": "Warum dieser Wurf nötig ist",
    "boost": 0,
    "setback": 0
  },
  "stateChanges": {
    "wounds": 0,
    "strain": 0,
    "credits": 0,
    "newQuest": null,
    "questUpdate": null,
    "npcUpdate": null,
    "newItem": null,
    "sceneChange": null,
    "combatStart": null
  },
  "mood": "tense|calm|dangerous|mysterious|exciting|sad|triumphant"
}

WICHTIG für stateChanges:
- "newQuest": {"title": "...", "description": "...", "objectives": ["..."], "xpReward": 50, "creditsReward": 500} — wenn eine neue Mission beginnt
- "questUpdate": {"title": "...", "status": "completed|failed"} — wenn sich eine Mission ändert
- "npcUpdate": {"name": "...", "disposition": -100..100, "description": "...", "faction": "..."} — wenn ein NPC erscheint oder sich ändert
- "sceneChange": {"planet": "...", "location": "...", "description": "..."} — bei Ortswechsel
- "combatStart": {"enemies": [{"name": "...", "woundThreshold": 5, "soak": 2}]} — wenn ein Kampf beginnt
- Setze immer passende stateChanges wenn narrativ sinnvoll!
`;
