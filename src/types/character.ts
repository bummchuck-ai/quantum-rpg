// ============================================================
// QUANTUM RPG — Character Type Definitions
// ============================================================
// Complete character data model based on Charaktererschaffung V14.pdf
// and The Complete Species Guide v6.pdf
// ============================================================

// --- Core Characteristics (Eigenschaften) ---
export interface Characteristics {
    brawn: number;        // Stärke
  agility: number;      // Gewandtheit
  intellect: number;    // Intelligenz
  cunning: number;      // List
  willpower: number;    // Willenskraft
  presence: number;     // Charisma
}

export type CharacteristicKey = keyof Characteristics;

// --- Skills (Fertigkeiten) ---
export interface SkillRanks {
    // General Skills (Allgemeine Fertigkeiten)
  astrogation: number;          // Astronavigation
  athletics: number;            // Athletik
  charm: number;                // Charme
  coercion: number;             // Einschüchterung
  computers: number;            // Computer
  cool: number;                 // Coolness
  coordination: number;         // Körperbeherrschung
  deception: number;            // Täuschung
  discipline: number;           // Disziplin
  leadership: number;           // Führungsqualität
  mechanics: number;            // Mechanik
  medicine: number;             // Medizin
  negotiation: number;          // Verhandlung
  perception: number;           // Wahrnehmung
  pilotingPlanetary: number;    // Planetares Steuern
  pilotingSpace: number;        // Steuern (Raum)
  resilience: number;           // Widerstandskraft
  skulduggery: number;          // Infiltration
  stealth: number;              // Heimlichkeit
  streetwise: number;           // Szenekenntnis
  survival: number;             // Überleben
  vigilance: number;            // Aufmerksamkeit
  // Combat Skills (Kampffertigkeiten)
  brawl: number;                // Nahkampf (unbewaffnet)
  gunnery: number;              // Artillerie
  melee: number;                // Nahkampf (bewaffnet)
  rangedLight: number;          // Leichte Fernkampfwaffen
  rangedHeavy: number;          // Schwere Fernkampfwaffen
  // Knowledge Skills (Wissensfertigkeiten)
  coreWorlds: number;           // Kernwelten
  education: number;            // Allgemeinbildung
  lore: number;                 // Altes Wissen
  outerRim: number;             // Äußerer Rand
  underworld: number;           // Unterwelt
  warfare: number;              // Kriegskunst
  xenology: number;             // Xenologie
  // Force Skills (Machtfertigkeiten) - optional
  lightsaber?: number;          // Lichtschwert
}

export type SkillKey = keyof SkillRanks;

// Mapping skills to their governing characteristic
export const SKILL_CHARACTERISTICS: Record<SkillKey, CharacteristicKey> = {
    astrogation: 'intellect',
    athletics: 'brawn',
    charm: 'presence',
    coercion: 'willpower',
    computers: 'intellect',
    cool: 'presence',
    coordination: 'agility',
    deception: 'cunning',
    discipline: 'willpower',
    leadership: 'presence',
    mechanics: 'intellect',
    medicine: 'intellect',
    negotiation: 'presence',
    perception: 'cunning',
    pilotingPlanetary: 'agility',
    pilotingSpace: 'agility',
    resilience: 'brawn',
    skulduggery: 'cunning',
    stealth: 'agility',
    streetwise: 'cunning',
    survival: 'cunning',
    vigilance: 'willpower',
    brawl: 'brawn',
    gunnery: 'agility',
    melee: 'brawn',
    rangedLight: 'agility',
    rangedHeavy: 'agility',
    coreWorlds: 'intellect',
    education: 'intellect',
    lore: 'intellect',
    outerRim: 'intellect',
    underworld: 'intellect',
    warfare: 'intellect',
    xenology: 'intellect',
    lightsaber: 'brawn',
};

// --- Obligation / Duty / Morality ---
export type ObligationType =
    | 'addiction' | 'adrenalineJunkie' | 'casanova' | 'infamous'
  | 'obsession' | 'betrayal' | 'priceOfName' | 'dishonor'
  | 'oath' | 'zeal' | 'openScore' | 'disgraced'
  | 'family' | 'favor' | 'frontierJustice' | 'exile'
  | 'servitude' | 'contract' | 'bounty' | 'criminalPast'
  | 'crew' | 'openBusiness' | 'pacifist' | 'duty'
  | 'dutyBound' | 'collateralDamage' | 'riskTaker'
  | 'badReputation' | 'debts' | 'sponsor';

export interface Obligation {
    type: ObligationType;
    name: string;
    value: number;
    description: string;
}

export interface Duty {
    type: string;
    name: string;
    value: number;
    description: string;
}

export interface Morality {
    value: number;          // 0-100, starts at 50
  emotional_strengths: string[];
    emotional_weaknesses: string[];
}

// --- Motivation ---
export interface Motivation {
    desire: string;
    fear: string;
    strength: string;
    flaw: string;
}

// --- Talent ---
export interface Talent {
    id: string;
    name: string;
    tier: number;           // 1-5
  activation: 'passive' | 'active_action' | 'active_maneuver' | 'active_incidental';
    ranked: boolean;        // Can be purchased multiple times?
  currentRank: number;
    description: string;
    xpCost: number;
}

// --- Weapon ---
export interface Weapon {
    id: string;
    name: string;
    skill: SkillKey;
    damage: number;
    critical: number;
    range: 'engaged' | 'short' | 'medium' | 'long' | 'extreme';
    encumbrance: number;
    hardpoints: number;
    cost: number;
    rarity: number;
    special: string[];
    addsBrawn?: boolean;    // For melee weapons: damage = Brawn + damage
    image_url?: string; // NEU: Optionaler URL zum Waffenbild
}

// --- Armor ---
export interface Armor {
    id: string;
    name: string;
    defense: number;
    soak: number;
    encumbrance: number;
    hardpoints: number;
    cost: number;
    rarity: number;
    special: string[];
}

// --- Equipment Item ---
export interface EquipmentItem {
    id: string;
    name: string;
    encumbrance: number;
    cost: number;
    rarity: number;
    description: string;
}

// --- Vehicle / Starship ---
export type VehicleCategory =
    | 'landspeeder' | 'speederBike' | 'walker' | 'wheeled'
    | 'starfighter' | 'shuttle' | 'freighter' | 'capitalShip'
    | 'skiff' | 'ridingBeast';

export interface VehicleWeapon {
    name: string;
    firingArc: 'forward' | 'aft' | 'port' | 'starboard' | 'turret' | 'all';
    damage: number;
    critical: number;
    range: 'close' | 'short' | 'medium' | 'long' | 'extreme';
    special: string[];
}

export interface Vehicle {
    id: string;
    name: string;
    category: VehicleCategory;
    manufacturer: string;
    model: string;
    silhouette: number;         // 0-10, Größe des Fahrzeugs
    speed: number;              // 1-6, Maximalgeschwindigkeit
    handling: number;           // Manövrierfähigkeit (kann negativ sein)
    armor: number;              // Panzerung
    hullTraumaThreshold: number;  // Hüllentrauma-Schwelle
    systemStrainThreshold: number; // Systembelastung-Schwelle
    currentHullTrauma: number;
    currentSystemStrain: number;
    defenseForward: number;
    defenseAft: number;
    defensePort: number;
    defenseStarboard: number;
    sensorRange: 'close' | 'short' | 'medium' | 'long' | 'extreme';
    crew: number;               // Mindestbesatzung
    passengers: number;         // Passagierkapazität
    encumbrance: number;        // Ladekapazität
    consumables: string;        // z.B. "2 Wochen"
    cost: number;
    rarity: number;
    hardpoints: number;         // Für Modifikationen
    weapons: VehicleWeapon[];
    specialFeatures: string[];
    hyperdrive?: number;        // Primärer Hyperantrieb-Klasse (niedriger = schneller)
    backupHyperdrive?: number;  // Backup Hyperantrieb-Klasse
    navsComputer: boolean;      // Hat Navigationscomputer?
}

// --- Species ---
export interface Species {
    id: string;
    name: string;
    description: string;
    characteristics: Characteristics;
    woundThresholdBase: number;     // Added to Brawn for wound threshold
  strainThresholdBase: number;    // Added to Willpower for strain threshold
  startingXP: number;
    specialAbilities: string[];
    freeSkillRanks: Record<string, number>;  // skill: ranks
  imageUrl?: string;
}

// --- Career & Specialization ---
export interface Career {
    id: string;
    name: string;
    description: string;
    careerSkills: SkillKey[];       // 8 career skills
  specializations: Specialization[];
}

export interface Specialization {
    id: string;
    name: string;
    description: string;
    careerSkills: SkillKey[];       // 4 additional career skills
  talentTree: TalentTreeNode[][];  // 5 rows x 4 columns
}

export interface TalentTreeNode {
    talentId: string;
    xpCost: number;
    purchased: boolean;
    connections: {
      up?: boolean;
      down?: boolean;
      left?: boolean;
      right?: boolean;
    };
}

// --- Derived Stats ---
export interface DerivedStats {
    woundThreshold: number;     // Stärke + Spezies-Bonus
  strainThreshold: number;    // Willenskraft + Spezies-Bonus
  soakValue: number;          // Stärke + Rüstung
  defenseRanged: number;      // Fernkampfverteidigung
  defenseMelee: number;       // Nahkampfverteidigung
  encumbranceThreshold: number; // 5 + Stärke
  currentWounds: number;
    currentStrain: number;
}

// --- Quest System ---
export interface QuestReward {
    type: 'xp' | 'credits' | 'item';
    value: number; // For xp/credits
    itemId?: string; // For item
    itemQuantity?: number; // For item
}

export interface QuestObjective {
    id: string;
    description: string;
    completed: boolean;
    currentProgress?: number; // E.g., for "Defeat X enemies"
    targetProgress?: number;  // E.g., for "Defeat X enemies"
}

export interface QuestEntry {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed';
    objectives: QuestObjective[];
    rewards: QuestReward[];
    giver?: string; // Optional: NPC name who gave the quest
    location?: string; // Optional: Where the quest was given or needs to be completed
}


// --- The Complete Character ---
export interface Character {
    id: string;
    name: string;
    playerName: string;
    concept: string;            // Charakterkonzept
  background: string;         // Hintergrundgeschichte

  // Core
  species: Species;
    career: Career;
    specialization: Specialization;
    characteristics: Characteristics;
    skills: SkillRanks;
    talents: Talent[];

  // Narrative
  obligation?: Obligation;
    duty?: Duty;
    morality?: Morality;
    motivation: Motivation;

  // Equipment
  weapons: Weapon[];
    armor?: Armor;
    equipment: EquipmentItem[];
    credits: number;

  // Vehicles
  vehicles: Vehicle[];

  // Derived
  derivedStats: DerivedStats;

  // Experience
  totalXP: number;
    availableXP: number;

  // Force (optional)
  forceRating?: number;
    forcePowers?: string[];

  // Meta
  createdAt: string;
    updatedAt: string;
}

// --- Game State ---
export interface GameState {
    character: Character;
    currentScene: string;
    currentPlanet: string;
    questLog: QuestEntry[];
    npcRelationships: NPCRelationship[];
    inventory: EquipmentItem[];
    vehicles: Vehicle[];
    sessionHistory: SessionEvent[];
    destinyPool: {
      lightSide: number;
      darkSide: number;
    };
}

export interface NPCRelationship {
    npcName: string;
    disposition: number;        // -100 to 100
  notes: string;
}

export interface SessionEvent {
    timestamp: string;
    type: 'narrative' | 'combat' | 'roll' | 'dialogue' | 'levelup';
    summary: string;
    details?: string;
}
