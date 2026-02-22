// ============================================================
// QUANTUM RPG — Dice Engine (FFG Star Wars Mechanics)
// ============================================================
// Implements the full Fantasy Flight Games narrative dice system
// Based on: Regeln V1.pdf, SW_Referenzbogen.pdf
// ============================================================

// --- Symbol Types ---
export type DiceSymbol =
    | 'success'      // Erfolg (s)
  | 'failure'      // Fehlschlag (f)
  | 'advantage'    // Vorteil (a)
  | 'threat'       // Bedrohung (t)
  | 'triumph'      // Triumph (x) — counts as success + special
  | 'despair'      // Verzweiflung (y) — counts as failure + special
  | 'lightSide'    // Helle Seite
  | 'darkSide';    // Dunkle Seite

// --- Dice Types ---
export type DiceType =
    | 'boost'        // Verstärkungswürfel (blau, d6)
  | 'setback'      // Komplikationswürfel (schwarz, d6)
  | 'ability'      // Begabungswürfel (grün, d8)
  | 'difficulty'   // Schwierigkeitswürfel (lila, d8)
  | 'proficiency'  // Trainingswürfel (gelb, d12)
  | 'challenge'    // Herausforderungswürfel (rot, d12)
  | 'force';       // Machtwürfel (weiß, d12)

// --- Face Definitions ---
// Each face is an array of symbols rolled on that face

const BOOST_FACES: DiceSymbol[][] = [
    [],                              // blank
    [],                              // blank
    ['success'],                     // 1 success
    ['success', 'advantage'],        // 1 success + 1 advantage
    ['advantage', 'advantage'],      // 2 advantages
    ['advantage'],                   // 1 advantage
  ];

const SETBACK_FACES: DiceSymbol[][] = [
    [],                              // blank
    [],                              // blank
    ['failure'],                     // 1 failure
    ['failure'],                     // 1 failure
    ['threat'],                      // 1 threat
    ['threat'],                      // 1 threat
  ];

const ABILITY_FACES: DiceSymbol[][] = [
    [],                              // blank
    ['success'],                     // 1 success
    ['success'],                     // 1 success
    ['success', 'success'],          // 2 successes
    ['advantage'],                   // 1 advantage
    ['advantage'],                   // 1 advantage
    ['success', 'advantage'],        // 1 success + 1 advantage
    ['advantage', 'advantage'],      // 2 advantages
  ];

const DIFFICULTY_FACES: DiceSymbol[][] = [
    [],                              // blank
    ['failure'],                     // 1 failure
    ['failure', 'failure'],          // 2 failures
    ['threat'],                      // 1 threat
    ['threat'],                      // 1 threat
    ['threat'],                      // 1 threat
    ['threat', 'threat'],            // 2 threats
    ['failure', 'threat'],           // 1 failure + 1 threat
  ];

const PROFICIENCY_FACES: DiceSymbol[][] = [
    [],                              // blank
    ['success'],                     // 1 success
    ['success'],                     // 1 success
    ['success', 'success'],          // 2 successes
    ['success', 'success'],          // 2 successes
    ['advantage'],                   // 1 advantage
    ['success', 'advantage'],        // 1 success + 1 advantage
    ['success', 'advantage'],        // 1 success + 1 advantage
    ['success', 'advantage'],        // 1 success + 1 advantage
    ['advantage', 'advantage'],      // 2 advantages
    ['advantage', 'advantage'],      // 2 advantages
    ['triumph'],                     // 1 triumph (= 1 success + special)
  ];

const CHALLENGE_FACES: DiceSymbol[][] = [
    [],                              // blank
    ['failure'],                     // 1 failure
    ['failure'],                     // 1 failure
    ['failure', 'failure'],          // 2 failures
    ['failure', 'failure'],          // 2 failures
    ['threat'],                      // 1 threat
    ['threat'],                      // 1 threat
    ['failure', 'threat'],           // 1 failure + 1 threat
    ['failure', 'threat'],           // 1 failure + 1 threat
    ['threat', 'threat'],            // 2 threats
    ['threat', 'threat'],            // 2 threats
    ['despair'],                     // 1 despair (= 1 failure + special)
  ];

const FORCE_FACES: DiceSymbol[][] = [
    ['darkSide'],                    // 1 dark
    ['darkSide'],                    // 1 dark
    ['darkSide'],                    // 1 dark
    ['darkSide'],                    // 1 dark
    ['darkSide'],                    // 1 dark
    ['darkSide'],                    // 1 dark
    ['darkSide', 'darkSide'],        // 2 dark
    ['lightSide'],                   // 1 light
    ['lightSide'],                   // 1 light
    ['lightSide', 'lightSide'],      // 2 light
    ['lightSide', 'lightSide'],      // 2 light
    ['lightSide', 'lightSide'],      // 2 light
  ];

// --- Dice Face Map ---
const DICE_FACES: Record<DiceType, DiceSymbol[][]> = {
    boost: BOOST_FACES,
    setback: SETBACK_FACES,
    ability: ABILITY_FACES,
    difficulty: DIFFICULTY_FACES,
    proficiency: PROFICIENCY_FACES,
    challenge: CHALLENGE_FACES,
    force: FORCE_FACES,
};

// --- Single Die Result ---
export interface DieResult {
    type: DiceType;
    faceIndex: number;
    symbols: DiceSymbol[];
}

// --- Aggregated Roll Result ---
export interface RollResult {
    dice: DieResult[];
    // Raw symbol counts
  totalSuccess: number;
    totalFailure: number;
    totalAdvantage: number;
    totalThreat: number;
    totalTriumph: number;
    totalDespair: number;
    totalLightSide: number;
    totalDarkSide: number;
    // Net results after cancellation
  netSuccess: number;      // positive = success, negative = failure
  netAdvantage: number;     // positive = advantage, negative = threat
  isSuccess: boolean;       // netSuccess > 0
  triumph: number;          // triumphs are NOT cancelled by despair
  despair: number;          // despairs are NOT cancelled by triumph
}

// --- Dice Pool (what the player rolls) ---
export interface DicePool {
    boost?: number;
    setback?: number;
    ability?: number;
    difficulty?: number;
    proficiency?: number;
    challenge?: number;
    force?: number;
}

// --- Roll a single die ---
function rollDie(type: DiceType): DieResult {
    const faces = DICE_FACES[type];
    const faceIndex = Math.floor(Math.random() * faces.length);
    return {
          type,
          faceIndex,
          symbols: [...faces[faceIndex]],
    };
}

// --- Roll a full dice pool ---
export function rollDicePool(pool: DicePool): RollResult {
    const dice: DieResult[] = [];

  // Roll each die type
  for (const [type, count] of Object.entries(pool) as [DiceType, number][]) {
        for (let i = 0; i < (count || 0); i++) {
                dice.push(rollDie(type));
        }
  }

  // Count raw symbols
  let totalSuccess = 0;
    let totalFailure = 0;
    let totalAdvantage = 0;
    let totalThreat = 0;
    let totalTriumph = 0;
    let totalDespair = 0;
    let totalLightSide = 0;
    let totalDarkSide = 0;

  for (const die of dice) {
        for (const symbol of die.symbols) {
                switch (symbol) {
                  case 'success': totalSuccess++; break;
                  case 'failure': totalFailure++; break;
                  case 'advantage': totalAdvantage++; break;
                  case 'threat': totalThreat++; break;
                  case 'triumph':
                              totalTriumph++;
                              totalSuccess++; // Triumph counts as 1 success
                    break;
                  case 'despair':
                              totalDespair++;
                              totalFailure++; // Despair counts as 1 failure
                    break;
                  case 'lightSide': totalLightSide++; break;
                  case 'darkSide': totalDarkSide++; break;
                }
        }
  }

  // Cancel success/failure
  const netSuccess = totalSuccess - totalFailure;
    // Cancel advantage/threat
  const netAdvantage = totalAdvantage - totalThreat;

  return {
        dice,
        totalSuccess,
        totalFailure,
        totalAdvantage,
        totalThreat,
        totalTriumph,
        totalDespair,
        totalLightSide,
        totalDarkSide,
        netSuccess,
        netAdvantage,
        isSuccess: netSuccess > 0,
        triumph: totalTriumph,
        despair: totalDespair,
  };
}

// --- Build a dice pool from characteristic + skill ---
// Per FFG rules: The HIGHER value determines number of Ability dice.
// The LOWER value upgrades that many Ability dice to Proficiency dice.
export function buildSkillPool(
    characteristicValue: number,
    skillRank: number,
    difficulty: number = 2,
    challengeUpgrades: number = 0,
    boostDice: number = 0,
    setbackDice: number = 0,
  ): DicePool {
    const higher = Math.max(characteristicValue, skillRank);
    const lower = Math.min(characteristicValue, skillRank);

  const pool: DicePool = {
        ability: higher - lower,
        proficiency: lower,
        difficulty: Math.max(0, difficulty - challengeUpgrades),
        challenge: challengeUpgrades,
        boost: boostDice,
        setback: setbackDice,
  };

  return pool;
}

// --- Difficulty Levels ---
export const DIFFICULTY_LEVELS = {
    simple: 0,       // Einfach — kein Wurf nötig
    easy: 1,         // Leicht — 1 Schwierigkeitswürfel
    average: 2,      // Durchschnittlich — 2 Schwierigkeitswürfel
    hard: 3,         // Schwer — 3 Schwierigkeitswürfel
    daunting: 4,     // Beeindruckend — 4 Schwierigkeitswürfel
    formidable: 5,   // Herausragend — 5 Schwierigkeitswürfel
} as const;

// --- Format roll result for display ---
export function formatRollResult(result: RollResult): string {
    const parts: string[] = [];

  if (result.isSuccess) {
        parts.push(`Erfolg! (${result.netSuccess} Netto-Erfolge)`);
  } else {
        parts.push(`Fehlschlag! (${Math.abs(result.netSuccess)} Netto-Fehlschläge)`);
  }

  if (result.netAdvantage > 0) {
        parts.push(`${result.netAdvantage} Vorteile`);
  } else if (result.netAdvantage < 0) {
        parts.push(`${Math.abs(result.netAdvantage)} Bedrohungen`);
  }

  if (result.triumph > 0) {
        parts.push(`${result.triumph} Triumph(e)!`);
  }

  if (result.despair > 0) {
        parts.push(`${result.despair} Verzweiflung(en)!`);
  }

  return parts.join(' | ');
}
