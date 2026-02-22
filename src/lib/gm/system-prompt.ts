src/lib/gm/system-prompt.ts// ============================================================
// QUANTUM RPG — Game Master System Prompt Builder
// ============================================================
// Builds the system prompt for Claude API based on current game state.
// This is THE HEART of the game — Claude as the AI Game Master.
// ============================================================

import type { Character, GameState, SessionEvent } from '@/types/character';

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

# REGELN
- Du bestimmst NICHT die Aktionen des Spielercharakters
- Du sagst dem Spieler, wann ein Wurf nötig ist und auf welche Fertigkeit
- Du beschreibst Ergebnisse, aber der Spieler entscheidet seine Reaktion
- Kampf folgt der Runden-Struktur: Initiative, Manöver, Aktion
`;

// --- Build context from game state ---
function buildCharacterContext(character: Character): string {
  return \`# SPIELERCHARAKTER
Name: \${character.name}
Spezies: \${character.species.name}
Karriere: \${character.career.name} / \${character.specialization.name}
Konzept: \${character.concept}
Hintergrund: \${character.background}

## Eigenschaften
Stärke: \${character.characteristics.brawn} | Gewandtheit: \${character.characteristics.agility}
Intelligenz: \${character.characteristics.intellect} | List: \${character.characteristics.cunning}
Willenskraft: \${character.characteristics.willpower} | Ausstrahlung: \${character.characteristics.presence}

## Zustand
Wunden: \${character.derivedStats.currentWounds}/\${character.derivedStats.woundThreshold}
Erschöpfung: \${character.derivedStats.currentStrain}/\${character.derivedStats.strainThreshold}
Credits: \${character.credits}

## Motivation
Wunsch: \${character.motivation.desire}
Furcht: \${character.motivation.fear}
Stärke: \${character.motivation.strength}
Schwäche: \${character.motivation.flaw}
\${character.obligation ? \`
## Verpflichtung
\${character.obligation.name} (Wert: \${character.obligation.value})
\${character.obligation.description}\` : ''}
\${character.morality ? \`
## Moral
Wert: \${character.morality.value}/100
Emotionale Stärken: \${character.morality.emotional_strengths.join(', ')}
Emotionale Schwächen: \${character.morality.emotional_weaknesses.join(', ')}\` : ''}
\`;
}

function buildSceneContext(gameState: GameState): string {
  const recentHistory = gameState.sessionHistory
    .slice(-10)
    .map((e: SessionEvent) => \`[\${e.type}] \${e.summary}\`)
    .join('\\n');

  return \`# AKTUELLE SZENE
Planet: \${gameState.currentPlanet}
Szene: \${gameState.currentScene}

## Schicksalspunkte
Helle Seite: \${gameState.destinyPool.lightSide}
Dunkle Seite: \${gameState.destinyPool.darkSide}

## Letzte Ereignisse
\${recentHistory || 'Spielbeginn — keine bisherigen Ereignisse.'}

## Aktive Quests
\${gameState.questLog
  .filter(q => q.status === 'active')
  .map(q => \`- \${q.title}: \${q.description}\`)
  .join('\\n') || 'Keine aktiven Quests.'}

## NPC-Beziehungen
\${gameState.npcRelationships
  .map(n => \`- \${n.npcName}: Stimmung \${n.disposition > 0 ? 'positiv' : n.disposition < 0 ? 'negativ' : 'neutral'} (\${n.disposition})\`)
  .join('\\n') || 'Noch keine bekannten NPCs.'}
\`;
}

// --- Main function: Build the complete system prompt ---
export function buildSystemPrompt(gameState: GameState): string {
  return [
    GM_PERSONA,
    buildCharacterContext(gameState.character),
    buildSceneContext(gameState),
  ].join('\\n\\n---\\n\\n');
}

// --- Build a user message with optional dice result ---
export function buildUserMessage(
  playerAction: string,
  diceResult?: {
    isSuccess: boolean;
    netSuccess: number;
    netAdvantage: number;
    triumph: number;
    despair: number;
    skillUsed: string;
    difficulty: string;
  }
): string {
  let message = \`Der Spieler sagt/tut: "\${playerAction}"\`;

  if (diceResult) {
    message += \`\\n\\nWürfelergebnis für \${diceResult.skillUsed} (\${diceResult.difficulty}):\\n\`;
    message += diceResult.isSuccess
      ? \`ERFOLG mit \${diceResult.netSuccess} Netto-Erfolgen\`
      : \`FEHLSCHLAG mit \${Math.abs(diceResult.netSuccess)} Netto-Fehlschlägen\`;

    if (diceResult.netAdvantage > 0) {
      message += \` und \${diceResult.netAdvantage} Vorteilen\`;
    } else if (diceResult.netAdvantage < 0) {
      message += \` und \${Math.abs(diceResult.netAdvantage)} Bedrohungen\`;
    }

    if (diceResult.triumph > 0) {
      message += \` — TRIUMPH!\`;
    }
    if (diceResult.despair > 0) {
      message += \` — VERZWEIFLUNG!\`;
    }
  }

  return message;
}

// --- Response format instruction ---
export const RESPONSE_FORMAT = \`
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
    "reason": "Warum dieser Wurf nötig ist"
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
\`;
