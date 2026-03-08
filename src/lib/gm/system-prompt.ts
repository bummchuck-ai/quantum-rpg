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
  return ALL_SKILLS
    .map(skill => {
      const rank = skillRanks[skill.key] || 0;
      return `- ${skill.nameDE}: Rang ${rank}`;
    })
    .join('\n');
}

// --- Build context from game state ---
function buildCharacterContext(character: any): string {
  const mainSpec = character.specializations?.[0]?.name || 'Unknown';
  
  return `# SPIELERCHARAKTER
Name: ${character.name}
Spezies: ${character.species?.name}
Karriere: ${character.career?.name} / ${mainSpec}
Hintergrund: ${character.backgroundOption}

## Eigenschaften
Stärke: ${character.characteristics?.brawn} | Gewandtheit: ${character.characteristics?.agility}
Intelligenz: ${character.characteristics?.intellect} | List: ${character.characteristics?.cunning}
Willenskraft: ${character.characteristics?.willpower} | Charisma: ${character.characteristics?.presence}

## Fertigkeiten
${buildSkillContext(character)}

## Zustand
Credits: ${character.credits}
Wunden: ${character.wounds} (Schwelle: ${character.species?.woundThresholdBase + character.characteristics?.brawn})
Stress: ${character.strain} (Schwelle: ${character.species?.strainThresholdBase + character.characteristics?.willpower})
`;
}

function buildVehicleContext(gameState: any): string {
  const vehicles = gameState.vehicles || gameState.character?.vehicles;
  if (!vehicles || vehicles.length === 0) return '';

  const vehicleList = vehicles.map((v: any) =>
    `- ${v.name} (Silhouette: ${v.silhouette}, Geschwindigkeit: ${v.speed}, Panzerung: ${v.armor}, Hülle: ${v.currentHullTrauma || 0}/${v.hullTraumaThreshold}, Belastung: ${v.currentSystemStrain || 0}/${v.systemStrainThreshold})`
  ).join('\n');

  return `## Fahrzeuge
${vehicleList}
`;
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

// --- Main function: Build the complete system prompt ---
export function buildSystemPrompt(gameState: any): string {
  const sections = [
    GM_PERSONA,
    buildCharacterContext(gameState.character),
    buildVehicleContext(gameState),
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
    "sceneChange": null
  },
  "mood": "tense|calm|dangerous|mysterious|exciting|sad|triumphant"
}
`;
