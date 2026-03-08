// ============================================================
// QUANTUM RPG — Combat Engine
// ============================================================
// Structured combat tracking for FFG Star Wars
// Initiative, rounds, wounds, strain, critical injuries
// ============================================================

export type CombatSlotType = 'pc' | 'npc';

export interface CombatSlot {
  type: CombatSlotType;
  initiativeValue: number; // successes
  advantageValue: number;  // advantages (tiebreaker)
}

export interface Combatant {
  id: string;
  name: string;
  type: CombatSlotType;
  wounds: number;
  woundThreshold: number;
  strain: number;
  strainThreshold: number;
  soak: number;
  defenseMelee: number;
  defenseRanged: number;
  criticalInjuries: CriticalInjury[];
  statusEffects: StatusEffect[];
  hasActed: boolean;
}

export interface CriticalInjury {
  id: string;
  name: string;
  severity: number; // d100 roll result
  effect: string;
  permanent: boolean;
}

export interface StatusEffect {
  name: string;
  duration: number; // rounds remaining, -1 = until end of encounter
  effect: string;
}

export interface CombatState {
  active: boolean;
  round: number;
  initiativeOrder: CombatSlot[];
  currentSlotIndex: number;
  combatants: Combatant[];
  log: CombatLogEntry[];
}

export interface CombatLogEntry {
  round: number;
  actor: string;
  action: string;
  result?: string;
  timestamp: number;
}

// Critical Injury Table (d100)
export const CRITICAL_INJURIES: { min: number; max: number; name: string; severity: number; effect: string; permanent: boolean }[] = [
  { min: 1, max: 5, name: 'Leichte Wunde', severity: 1, effect: 'Keine mechanische Auswirkung.', permanent: false },
  { min: 6, max: 10, name: 'Angeschlagen', severity: 1, effect: 'Der Charakter erleidet 1 Stress.', permanent: false },
  { min: 11, max: 15, name: 'Leicht abgelenkt', severity: 1, effect: 'Nächster Fertigkeitswurf: +1 Komplikation.', permanent: false },
  { min: 16, max: 20, name: 'Leichter Kopfstoß', severity: 1, effect: 'Orientierungslos — 1 Runde Nachteile.', permanent: false },
  { min: 21, max: 25, name: 'Benommen', severity: 1, effect: 'Kann in nächster Runde nur Manöver ausführen.', permanent: false },
  { min: 26, max: 30, name: 'Leichte Verbrennung', severity: 2, effect: '+1 Schwierigkeitswürfel auf Gewandtheitswürfe bis geheilt.', permanent: false },
  { min: 31, max: 35, name: 'Verstauchung', severity: 2, effect: '+1 Schwierigkeitswürfel auf Stärkewürfe bis geheilt.', permanent: false },
  { min: 36, max: 40, name: 'Erschüttert', severity: 2, effect: '+1 Schwierigkeitswürfel auf Intelligenzwürfe bis geheilt.', permanent: false },
  { min: 41, max: 45, name: 'Überwältigt', severity: 2, effect: '+1 Schwierigkeitswürfel auf Willenskraftwürfe bis geheilt.', permanent: false },
  { min: 46, max: 50, name: 'Stolpernd', severity: 2, effect: 'Charakter fällt zu Boden.', permanent: false },
  { min: 51, max: 55, name: 'Starke Quetschung', severity: 2, effect: 'Charakter erleidet zusätzlich 1 Wunde.', permanent: false },
  { min: 56, max: 60, name: 'Fraktur', severity: 3, effect: 'Kann nur noch humpeln. Geschwindigkeit halbiert.', permanent: false },
  { min: 61, max: 65, name: 'Aufgeschlitzt', severity: 3, effect: 'Erleidet am Ende jeder Runde 1 Wunde bis geheilt.', permanent: false },
  { min: 66, max: 70, name: 'Knochenbruch', severity: 3, effect: 'Gliedmaße unbrauchbar bis geheilt.', permanent: false },
  { min: 71, max: 75, name: 'Entstellende Wunde', severity: 3, effect: '+1 Schwierigkeitswürfel auf alle sozialen Würfe.', permanent: false },
  { min: 76, max: 80, name: 'Schwere Verbrennung', severity: 3, effect: '+1 Schwierigkeitswürfel auf alle Würfe bis geheilt.', permanent: false },
  { min: 81, max: 85, name: 'Verkrüppelt', severity: 4, effect: 'Ein Bein dauerhaft beschädigt. -1 Gewandtheit.', permanent: true },
  { min: 86, max: 90, name: 'Gebrochenes Rückgrat', severity: 4, effect: 'Kann sich nicht bewegen bis chirurgisch behandelt.', permanent: false },
  { min: 91, max: 95, name: 'Verstümmelt', severity: 4, effect: 'Gliedmaße abgetrennt. Permanente Behinderung.', permanent: true },
  { min: 96, max: 100, name: 'Tödliche Wunde', severity: 5, effect: 'Stirbt am Ende der 5. Runde wenn nicht geheilt.', permanent: false },
  { min: 101, max: 150, name: 'Sofortiger Tod', severity: 5, effect: 'Der Charakter stirbt sofort.', permanent: true },
];

export function rollCriticalInjury(bonusSeverity: number = 0): CriticalInjury {
  const roll = Math.floor(Math.random() * 100) + 1 + (bonusSeverity * 10);
  const entry = CRITICAL_INJURIES.find(c => roll >= c.min && roll <= c.max)
    || CRITICAL_INJURIES[CRITICAL_INJURIES.length - 1];
  return {
    id: `crit-${Date.now()}`,
    name: entry.name,
    severity: entry.severity,
    effect: entry.effect,
    permanent: entry.permanent,
  };
}

export function createInitialCombatState(): CombatState {
  return {
    active: false,
    round: 0,
    initiativeOrder: [],
    currentSlotIndex: 0,
    combatants: [],
    log: [],
  };
}

export function createPCCombatant(player: any): Combatant {
  const brawn = player.characteristics?.brawn || 2;
  const willpower = player.characteristics?.willpower || 2;
  const woundBase = player.species?.woundThresholdBase || 10;
  const strainBase = player.species?.strainThresholdBase || 10;
  const armor = (player.ownedGear || []).filter((g: any) => g.soak !== undefined);
  const soakVal = brawn + armor.reduce((acc: number, curr: any) => acc + (curr.soak || 0), 0);
  const defVal = armor.reduce((acc: number, curr: any) => Math.max(acc, curr.defense || 0), 0);

  return {
    id: player.id,
    name: player.name || 'Unbekannt',
    type: 'pc',
    wounds: player.wounds || 0,
    woundThreshold: woundBase + brawn,
    strain: player.strain || 0,
    strainThreshold: strainBase + willpower,
    soak: soakVal,
    defenseMelee: defVal,
    defenseRanged: defVal,
    criticalInjuries: [],
    statusEffects: [],
    hasActed: false,
  };
}

export function createNPCCombatant(name: string, stats: Partial<Combatant>): Combatant {
  return {
    id: `npc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: 'npc',
    wounds: 0,
    woundThreshold: stats.woundThreshold || 5,
    strain: 0,
    strainThreshold: stats.strainThreshold || 5,
    soak: stats.soak || 2,
    defenseMelee: stats.defenseMelee || 0,
    defenseRanged: stats.defenseRanged || 0,
    criticalInjuries: [],
    statusEffects: [],
    hasActed: false,
    ...stats,
  };
}

// Apply damage after soak
export function applyDamage(combatant: Combatant, rawDamage: number): { newWounds: number; exceededThreshold: boolean } {
  const effectiveDamage = Math.max(0, rawDamage - combatant.soak);
  combatant.wounds += effectiveDamage;
  return {
    newWounds: effectiveDamage,
    exceededThreshold: combatant.wounds >= combatant.woundThreshold,
  };
}

// Advance to next round
export function nextRound(state: CombatState): CombatState {
  // Tick down status effects
  for (const c of state.combatants) {
    c.statusEffects = c.statusEffects
      .map(e => ({ ...e, duration: e.duration === -1 ? -1 : e.duration - 1 }))
      .filter(e => e.duration !== 0);
    c.hasActed = false;
  }
  return {
    ...state,
    round: state.round + 1,
    currentSlotIndex: 0,
  };
}
