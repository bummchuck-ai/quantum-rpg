// ============================================================
// QUANTUM RPG — Game Master System Prompt Builder
// ============================================================
// Builds the system prompt for Claude API based on current game state.
// This is THE HEART of the game — Claude as the AI Game Master.
// ============================================================

import type { Character, GameState, SessionEvent } from '@/types/character';
import { ALL_SKILLS, SKILL_NAMES_DE as SHARED_SKILL_NAMES } from '@/lib/skills';
import { FORCE_POWERS } from '@/lib/engine/force-powers';
import { buildLoreContext } from '@/lib/gm/galaxy-lore';

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

# NPC-LEBENSZYKLUS
NPCs sind das Herz der Geschichte. Befolge diesen Zyklus:
1. **Einführung**: Neuer Ort → neuer NPC. Neue Quest → Questgeber-NPC. Alle 3-5 Szenen mindestens 1 neuer NPC.
2. **Entwicklung**: Wiederkehrende NPCs verändern sich durch Spieleraktionen. Disposition steigt/sinkt.
3. **Enthüllung**: Versteckte Motive, Geheimnisse oder Verbindungen enthüllen sich über Zeit.
4. **Auflösung**: NPCs können sterben, verraten, gerettet werden oder als Verbündete bleiben.

NPC-Richtlinien:
- Jeder NPC hat eine EIGENE Stimme (Dialekt, Wortwahl, Tic)
- NPCs handeln AUCH wenn der Spieler nicht dabei ist — erwähne was sich verändert hat
- Verbündete NPCs können im Kampf helfen oder Informationen liefern
- Feindliche NPCs tauchen wieder auf und eskalieren

# EP-VERGABE (Erfahrungspunkte)
Vergib EP für bedeutsame Spieleraktionen über stateChanges.xpAward:
- **5 EP**: Kleine Erfolge — clevere Ideen, gutes Rollenspiel, einfache Rätsel
- **10 EP**: Mittlere Erfolge — schwierige Kämpfe bestanden, wichtige Entdeckungen, NPCs überzeugt
- **15 EP**: Große Erfolge — Questziele erreicht, Boss-Kämpfe gewonnen, kritische Entscheidungen
- **20 EP**: Epische Erfolge — Kampagne-Wendepunkte, heroische Opfer, Meisterleistungen
Vergib EP JEDES MAL wenn der Spieler etwas Bedeutsames tut — nicht nur bei Quest-Abschluss!

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
      const stats = [
        w.damage !== undefined ? `Schaden: ${w.damage}` : null,
        w.critical ? `Kritisch: ${w.critical}` : null,
        w.range ? `Reichweite: ${w.range}` : null,
        w.encumbrance ? `Belastung: ${w.encumbrance}` : null,
      ].filter(Boolean).join(' | ');
      const props = (w.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${w.name}** [${stats}]${props ? ` (${props})` : ''}${w.description ? ` — ${w.description}` : ''}`);
    }
  }

  if (armor.length > 0) {
    sections.push('### Rüstung');
    for (const a of armor) {
      const stats = [
        a.soak !== undefined ? `Soak: +${a.soak}` : null,
        a.defense !== undefined ? `Verteidigung: ${a.defense}` : null,
        a.encumbrance ? `Belastung: ${a.encumbrance}` : null,
      ].filter(Boolean).join(' | ');
      const props = (a.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${a.name}** [${stats}]${props ? ` (${props})` : ''}${a.description ? ` — ${a.description}` : ''}`);
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
Spezies: ${character.species?.name || 'Unbekannt'}${character.selectedSubspecies ? ` (${character.selectedSubspecies})` : ''}
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
Widerstandswert (Soak): ${soakValue} (Stärke) + ${(character.ownedGear || []).filter((g: any) => g.soak).reduce((sum: number, g: any) => sum + g.soak, 0)} (Rüstung) = ${soakValue + (character.ownedGear || []).filter((g: any) => g.soak).reduce((sum: number, g: any) => sum + g.soak, 0)} gesamt
Verteidigung: ${(character.ownedGear || []).filter((g: any) => g.defense).reduce((max: number, g: any) => Math.max(max, g.defense || 0), 0)}
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
  const ownedPowerIds = gameState.ownedPowers || [];
  const ownedUpgradeIds = gameState.ownedUpgrades || [];

  const powerDetails = ownedPowerIds.map((pid: string) => {
    const power = FORCE_POWERS.find(p => p.id === pid);
    if (!power) return `- ${pid}`;
    const boughtUpgrades = power.upgrades
      .filter(u => ownedUpgradeIds.includes(u.id))
      .map(u => `${u.name}: ${u.description}`)
      .join('; ');
    return `- **${power.nameDE}** (${power.name}): ${power.descriptionDE}\n  Basiseffekt: ${power.baseEffect}${boughtUpgrades ? `\n  Upgrades: ${boughtUpgrades}` : ''}`;
  }).join('\n');

  return `## Macht
Macht-Rang: ${forceRating}
${powerDetails || 'Keine Machtkräfte erlernt.'}

REGELN: Wenn der Charakter die Macht einsetzt, würfle Machtwürfel (${forceRating} Machtwürfel).
- Lichtseite-Punkte (◐) können frei genutzt werden
- Dunkle-Seite-Punkte (◑) erzeugen 1 Stress (Conflict) pro Nutzung
- Der Spieler entscheidet, ob er Dunkle-Seite-Punkte nutzen will
`;
}

function buildCombatContext(gameState: any): string {
  if (!gameState.combatActive) return '';
  const combatants = gameState.combatants || [];
  const enemyList = combatants
    .filter((c: any) => c.type === 'npc' || c.type === 'enemy')
    .map((c: any) => `- **${c.name}**: Wunden ${c.wounds || 0}/${c.woundThreshold || '?'}, Soak ${c.soak || 0}${c.isDefeated ? ' [BESIEGT]' : ''}`)
    .join('\n');

  return `## KAMPF AKTIV
Runde: ${gameState.combatRound || 1}
${enemyList ? `### Gegner im Kampf\n${enemyList}` : ''}
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
    const disp = n.disposition;
    const dispositionLabel = disp > 60 ? 'sehr freundlich' : disp > 30 ? 'freundlich' : disp < -60 ? 'sehr feindlich' : disp < -30 ? 'feindlich' : 'neutral';
    const alive = n.isAlive === false ? ' [TOT]' : '';
    const faction = n.faction ? ` | Fraktion: ${n.faction}` : '';
    const location = n.location ? ` | Ort: ${n.location}` : '';
    return `- **${n.npcName}** (${dispositionLabel}${alive}${faction}${location}): ${n.notes || 'Keine Details'}`;
  }).join('\n')}`;
}

function buildPartyContext(gameState: any): string {
  const party = gameState.party || [];
  if (party.length <= 1) return '';

  return `## Gruppe (${party.length} Mitglieder)
${party.map((p: any, i: number) => {
    const isActive = i === 0; // First is always active player
    return `- **${p.name}**${isActive ? ' (AKTIVER SPIELER)' : ''}: ${p.species || '?'} ${p.career || '?'} / ${p.specialization || '?'} — Wunden: ${p.wounds || 0}/${p.woundThreshold || '?'}, Stress: ${p.strain || 0}/${p.strainThreshold || '?'}`;
  }).join('\n')}
WICHTIG: Beziehe ALLE Gruppenmitglieder in die Erzählung ein, nicht nur den aktiven Spieler.`;
}

function buildMandatoryRules(gameState: any): string {
  const character = gameState.character || {};
  const vehicle = (character.vehicles || [])[0];
  const hasBase = vehicle?.category === 'base';
  const hasShip = vehicle && vehicle.category !== 'base';

  const rules: string[] = [
    '# UNVERLETZLICHE REGELN — DIESE HABEN HÖCHSTE PRIORITÄT',
    '',
    '## Charakter-Treue',
    `- Der Spielercharakter heißt "${character.name || 'Unbekannt'}". Nutze IMMER diesen Namen.`,
    `- Spezies: ${character.species?.name || 'Unbekannt'}. Beschreibe spezies-typische Merkmale in der Erzählung.`,
    `- Karriere: ${character.career?.name || 'Unbekannt'} / ${character.specializations?.[0]?.name || 'Keine'}. Der Charakter HANDELT wie jemand mit dieser Karriere.`,
  ];

  if (hasBase) {
    rules.push('');
    rules.push('## STARTPUNKT: STATIONÄRE BASIS');
    rules.push(`- Der Spieler hat "${vehicle.name}" als Basis gewählt. Dies ist KEIN Raumschiff!`);
    rules.push('- Die Gruppe startet AN DIESER BASIS. Sie sind NICHT im Orbit. Sie sind NICHT auf einem Schiff.');
    rules.push('- Für Reisen muss die Gruppe Passage buchen, ein Schiff mieten, oder eines stehlen.');
    rules.push('- Ignoriere JEDEN vorherigen Szenenkontext der "Orbit" oder "Raumschiff" erwähnt, es sei denn die Gruppe hat im Spielverlauf tatsächlich ein Schiff erworben.');
  } else if (hasShip) {
    rules.push('');
    rules.push('## STARTPUNKT: SCHIFF');
    rules.push(`- Der Spieler hat "${vehicle.name}" als Schiff gewählt.`);
    rules.push('- Beschreibe das Schiff als ihr Zuhause und Transportmittel.');
  } else {
    rules.push('');
    rules.push('## STARTPUNKT: KEIN EIGENES SCHIFF');
    rules.push('- Der Spieler hat KEIN eigenes Schiff oder Basis.');
    rules.push('- Starte in einer belebten Umgebung: Cantina, Raumhafen, Markt.');
  }

  rules.push('');
  rules.push('## Konsistenz');
  rules.push('- Widerspreche NIEMALS den oben genannten Fakten.');
  rules.push('- Wenn die aktuelle Szene dem Charakter-Setup widerspricht, KORRIGIERE die Szene still.');
  rules.push('- Erfinde KEINE Ausrüstung, Talente oder Fähigkeiten die der Charakter nicht hat.');
  rules.push('- Die Charakter-Daten in diesem Prompt sind die EINZIGE Wahrheit. Chat-Verlauf kann veraltet sein.');

  return rules.join('\n');
}

// --- Long-term memory context ---
function buildMemoryContext(gameState: any): string {
  const summary = gameState.storySummary;
  if (!summary) return '';
  return `# LANGZEIT-GEDÄCHTNIS
Die folgende Zusammenfassung enthält die bisherige Geschichte dieser Kampagne.
Nutze diese Informationen um Konsistenz zu wahren und auf frühere Ereignisse Bezug zu nehmen.

${summary}`;
}

// --- Encounter design guidelines ---
function buildEncounterGuidelines(gameState: any): string {
  const character = gameState.character || {};
  const chars = character.characteristics || {};
  const skillRanks = character.skillRanks || {};
  const talents = character.ownedTalents || [];
  const forceRating = gameState.forceRating || 0;

  // Calculate power score
  const charTotal = Object.values(chars).reduce((sum: number, v: any) => sum + (v || 0), 0) as number;
  const skillTotal = Object.values(skillRanks).reduce((sum: number, v: any) => sum + (v || 0), 0) as number;
  const talentCount = talents.length;
  const powerScore = charTotal + skillTotal + talentCount * 2 + forceRating * 5;

  let tier: string;
  let enemyGuide: string;
  if (powerScore < 20) {
    tier = 'ANFÄNGER';
    enemyGuide = 'Schergen (Gruppen von 2-3, WT 3-5, Soak 2-3, Fertigkeiten 1) oder einzelne Rivalen (WT 8-10, Soak 3, Fertigkeiten 1-2)';
  } else if (powerScore < 35) {
    tier = 'ERFAHREN';
    enemyGuide = 'Schergen (Gruppen von 3-4, WT 5-7, Soak 3-4, Fertigkeiten 1-2) oder Rivalen (WT 10-14, Soak 4, Fertigkeiten 2-3). Gelegentlich ein Nemesis (WT 15, Soak 4-5, Fertigkeiten 3)';
  } else if (powerScore < 50) {
    tier = 'VETERAN';
    enemyGuide = 'Schergen (Gruppen von 4-5, WT 6-8, Soak 4-5, Fertigkeiten 2) oder starke Rivalen (WT 14-18, Soak 5, Fertigkeiten 3). Nemesis-Gegner (WT 18-22, Soak 5-6, Fertigkeiten 3-4)';
  } else {
    tier = 'ELITE';
    enemyGuide = 'Eliteschergen (Gruppen von 5+, WT 8-10, Soak 5-6, Fertigkeiten 2-3), mächtige Rivalen (WT 18-22, Soak 6, Fertigkeiten 4) oder Nemesis (WT 22-30, Soak 6-8, Fertigkeiten 4-5, eigene Talente/Macht)';
  }

  return `## Encounter-Design (Stufe: ${tier})
Gegner-Richtlinien: ${enemyGuide}
- **Schergen** agieren als Gruppe, teilen Wundenschwelle, einfache Fähigkeiten
- **Rivalen** sind Einzelkämpfer mit eigener Wundenschwelle, aber ohne Stress
- **Nemesis** sind Boss-Gegner mit Wunden UND Stress, eigenen Talenten und Motivation
- Mische Gegnertypen für interessante Kämpfe (z.B. 1 Rivale + Schergengruppe)
- Umgebungsgefahren (Fallen, instabiler Boden, Feuer) machen Kämpfe dynamischer`;
}

// --- NPC guidance based on current state ---
function buildNPCGuidance(gameState: any): string {
  const npcs = gameState.npcRelationships || [];
  const quests = gameState.questLog || [];
  const activeQuests = quests.filter((q: any) => q.status === 'active');
  const hints: string[] = [];

  if (npcs.length === 0) {
    hints.push('DRINGEND: Führe in der nächsten Szene mindestens einen NPC ein! Der Spieler braucht Ansprechpartner.');
  } else if (npcs.length < 3) {
    hints.push('Die Besetzung ist dünn. Führe bald neue NPCs ein — Verbündete, Informanten oder Rivalen.');
  }

  if (activeQuests.length === 0) {
    hints.push('Keine aktive Mission! Ein NPC sollte dem Spieler bald einen Auftrag oder Hinweis geben.');
  }

  const allies = npcs.filter((n: any) => n.disposition > 30 && n.isAlive !== false);
  if (allies.length > 0) {
    hints.push(`Verbündete NPCs die helfen könnten: ${allies.map((n: any) => n.npcName).join(', ')}`);
  }

  const enemies = npcs.filter((n: any) => n.disposition < -30 && n.isAlive !== false);
  if (enemies.length > 0) {
    hints.push(`Feindliche NPCs die auftauchen könnten: ${enemies.map((n: any) => n.npcName).join(', ')}`);
  }

  if (hints.length === 0) return '';
  return `## NPC-Hinweise\n${hints.map(h => `- ${h}`).join('\n')}`;
}

// --- Main function: Build the complete system prompt ---
export function buildSystemPrompt(gameState: any): string {
  const sections = [
    GM_PERSONA,
    buildMandatoryRules(gameState),
    buildMemoryContext(gameState),
    buildLoreContext(gameState),
    buildCharacterContext(gameState.character),
    buildPartyContext(gameState),
    buildVehicleContext(gameState),
    buildForceContext(gameState),
    buildCombatContext(gameState),
    buildEncounterGuidelines(gameState),
    buildQuestContext(gameState),
    buildNPCContext(gameState),
    buildNPCGuidance(gameState),
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
    "combatStart": null,
    "xpAward": null
  },
  "mood": "tense|calm|dangerous|mysterious|exciting|sad|triumphant"
}

WICHTIG für stateChanges:
- "newQuest": {"title": "...", "description": "...", "objectives": ["..."], "xpReward": 50, "creditsReward": 500} — wenn eine neue Mission beginnt
- "questUpdate": {"title": "...", "status": "completed|failed"} — wenn sich eine Mission ändert
- "npcUpdate": {"name": "...", "disposition": -100..100, "description": "...", "faction": "..."} — wenn ein NPC erscheint oder sich ändert
- "sceneChange": {"planet": "...", "location": "...", "description": "..."} — bei Ortswechsel
- "combatStart": {"enemies": [{"name": "...", "woundThreshold": 5, "soak": 2}]} — wenn ein Kampf beginnt
- "xpAward": {"amount": 10, "reason": "Erfolgreiche Verhandlung"} — EP für bedeutsame Aktionen (5/10/15/20 EP je nach Bedeutung)
- Setze immer passende stateChanges wenn narrativ sinnvoll!
`;
