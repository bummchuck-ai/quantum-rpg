import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createFullSkillRanks } from '@/lib/skills';

export interface Characteristics {
  brawn: number;
  agility: number;
  intellect: number;
  cunning: number;
  willpower: number;
  presence: number;
}

export interface Species {
  name: string;
  startingXP: number;
  characteristics: Characteristics;
  woundThresholdBase: number;
  strainThresholdBase: number;
  abilities: string[];
  freeSkillRanks?: Record<string, number>;
}

export interface Specialization {
  name: string;
  skills: string[];
}

export interface Career {
  name: string;
  careerSkills: string[];
  forceRating: number;
  specializations: Specialization[];
}

export interface SkillRanks {
  [skill: string]: number;
}

export interface PlayerVehicle {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  silhouette: number;
  speed: number;
  handling: number;
  armor: number;
  hullTraumaThreshold: number;
  systemStrainThreshold: number;
  currentHullTrauma: number;
  currentSystemStrain: number;
  defenseForward: number;
  defenseAft: number;
  sensorRange: string;
  crew: number;
  passengers: number;
  encumbrance: number;
  consumables: string;
  cost: number;
  hardpoints: number;
  weapons: { name: string; firingArc: string; damage: number; critical: number; range: string; special: string[] }[];
  specialFeatures: string[];
  hyperdrive?: number;
  backupHyperdrive?: number;
  navsComputer: boolean;
}

export interface Player {
  id: string;
  name: string;
  species: Species | null;
  career: Career | null;
  specializations: Specialization[];
  backgroundType: 'Obligation' | 'Duty' | 'Morality' | null;
  backgroundOption: string;
  backgroundValue: number;
  backgroundBonus: 'none' | 'xp5' | 'xp10' | 'cr1000' | 'cr2500';
  characteristics: Characteristics;
  skillRanks: SkillRanks;
  availableXP: number;
  spentXP: number;
  credits: number;
  ownedTalents: string[];
  ownedGear: any[];
  vehicles: PlayerVehicle[];
  wounds: number;
  strain: number;
}

interface GameState {
  players: Player[];
  activePlayerIndex: number;

  // Actions
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  setActivePlayer: (index: number) => void;
  updateActivePlayer: (updates: Partial<Player>) => void;

  // Scoped Actions (Proxy to active player)
  setName: (name: string) => void;
  setSpecies: (species: Species) => void;
  setCareer: (career: Career) => void;
  setSpecialization: (spec: Specialization) => void;
  addSpecialization: (spec: Specialization) => void;
  setBackground: (type: 'Obligation' | 'Duty' | 'Morality', option: string, value: number) => void;
  applyBackgroundBonus: (bonus: string) => void;
  buyCharacteristic: (char: keyof Characteristics) => void;
  buySkill: (skill: string, isCareerSkill: boolean) => void;
  refundSkill: (skill: string, isCareerSkill: boolean) => void;
  buyTalent: (talentName: string, cost: number, isRanked?: boolean) => void;
  buyGear: (item: any) => void;
  sellGear: (item: any) => void;
  selectVehicle: (vehicle: PlayerVehicle) => void;
  removeVehicle: (vehicleId: string) => void;
  updateStatus: (wounds: number, strain: number, credits: number) => void;

  // Global Actions
  reset: () => void;
  importState: (data: string) => void;
  exportState: () => string;
}

const createNewPlayer = (id: string): Player => ({
  id,
  name: '',
  species: null,
  career: null,
  specializations: [],
  backgroundType: null,
  backgroundOption: '',
  backgroundValue: 0,
  backgroundBonus: 'none',
  characteristics: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
  skillRanks: createFullSkillRanks(),
  availableXP: 0,
  spentXP: 0,
  credits: 500,
  ownedTalents: [],
  ownedGear: [],
  vehicles: [],
  wounds: 0,
  strain: 0
});

export const useCharacterStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [createNewPlayer('player-1')],
      activePlayerIndex: 0,

      addPlayer: () => set((state) => ({
        players: [...state.players, createNewPlayer(`player-${state.players.length + 1}`)]
      })),

      removePlayer: (index) => set((state) => ({
        players: state.players.filter((_, i) => i !== index),
        activePlayerIndex: Math.max(0, state.activePlayerIndex - 1)
      })),

      setActivePlayer: (index) => set({ activePlayerIndex: index }),

      updateActivePlayer: (updates) => set((state) => {
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = { ...newPlayers[state.activePlayerIndex], ...updates };
        return { players: newPlayers };
      }),

      // Proxy Actions
      setName: (name) => get().updateActivePlayer({ name }),

      setSpecies: (species) => get().updateActivePlayer({
        species,
        characteristics: { ...species.characteristics },
        availableXP: species.startingXP,
        skillRanks: createFullSkillRanks(species.freeSkillRanks),
        wounds: 0,
        strain: 0
      }),

      setCareer: (career) => get().updateActivePlayer({ career }),

      setSpecialization: (spec) => get().updateActivePlayer({ specializations: [spec] }),

      addSpecialization: (spec) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = { ...player, specializations: [...player.specializations, spec] };
        return { players: newPlayers };
      }),

      setBackground: (type, option, value) => get().updateActivePlayer({
        backgroundType: type,
        backgroundOption: option,
        backgroundValue: value
      }),

      applyBackgroundBonus: (bonus) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        let baseXP = player.species ? player.species.startingXP : 0;
        let newCredits = 500;
        const baseValue = player.backgroundType === 'Morality' ? 50 : 10;

        switch (bonus) {
            case 'xp5': baseXP += 5; break;
            case 'xp10': baseXP += 10; break;
            case 'cr1000': newCredits += 1000; break;
            case 'cr2500': newCredits += 2500; break;
        }

        let valueIncrease = 0;
        if (bonus === 'xp5' || bonus === 'cr1000') valueIncrease = 5;
        if (bonus === 'xp10' || bonus === 'cr2500') valueIncrease = 10;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            backgroundBonus: bonus as any,
            availableXP: baseXP - player.spentXP,
            credits: newCredits,
            backgroundValue: baseValue + valueIncrease
        };
        return { players: newPlayers };
      }),

      buyCharacteristic: (char) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentValue = player.characteristics[char];
        if (currentValue >= 5) return state;
        const cost = (currentValue + 1) * 10;
        if (player.availableXP < cost) return state;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            characteristics: { ...player.characteristics, [char]: currentValue + 1 },
            availableXP: player.availableXP - cost,
            spentXP: player.spentXP + cost
        };
        return { players: newPlayers };
      }),

      buySkill: (skill, isCareerSkill) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentRank = player.skillRanks[skill] || 0;
        if (currentRank >= 2) return state; // Max 2 ranks at creation
        const cost = isCareerSkill ? 5 : 10; // Career: 5 XP, Non-career: 10 XP per rank
        if (player.availableXP < cost) return state;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            skillRanks: { ...player.skillRanks, [skill]: currentRank + 1 },
            availableXP: player.availableXP - cost,
            spentXP: player.spentXP + cost
        };
        return { players: newPlayers };
      }),

      refundSkill: (skill, isCareerSkill) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentRank = player.skillRanks[skill] || 0;
        const freeRanks = player.species?.freeSkillRanks?.[skill] || 0;
        if (currentRank <= 0 || currentRank <= freeRanks) return state; // Can't refund species free ranks
        const refund = isCareerSkill ? 5 : 10;

        const newSkillRanks = { ...player.skillRanks, [skill]: currentRank - 1 };

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            skillRanks: newSkillRanks,
            availableXP: player.availableXP + refund,
            spentXP: player.spentXP - refund
        };
        return { players: newPlayers };
      }),

      buyTalent: (talentName, cost, isRanked = false) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        if (player.availableXP < cost) return state;
        if (!isRanked && player.ownedTalents.includes(talentName)) return state;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            availableXP: player.availableXP - cost,
            spentXP: player.spentXP + cost,
            ownedTalents: [...player.ownedTalents, talentName]
        };
        return { players: newPlayers };
      }),

      buyGear: (item) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        if (player.credits < item.price) return state;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            credits: player.credits - item.price,
            ownedGear: [...player.ownedGear, item]
        };
        return { players: newPlayers };
      }),

      sellGear: (item) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const gearIndex = player.ownedGear.findIndex(g => g.name === item.name);
        if (gearIndex === -1) return state;

        const newGear = [...player.ownedGear];
        newGear.splice(gearIndex, 1);

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            credits: player.credits + item.price,
            ownedGear: newGear
        };
        return { players: newPlayers };
      }),

      selectVehicle: (vehicle) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            vehicles: [...player.vehicles, vehicle]
        };
        return { players: newPlayers };
      }),

      removeVehicle: (vehicleId) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            vehicles: player.vehicles.filter(v => v.id !== vehicleId)
        };
        return { players: newPlayers };
      }),

      updateStatus: (wounds, strain, credits) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            wounds: player.wounds + wounds,
            strain: player.strain + strain,
            credits: player.credits + credits
        };
        return { players: newPlayers };
      }),

      reset: () => set({
        players: [createNewPlayer('player-1')],
        activePlayerIndex: 0
      }),

      exportState: () => JSON.stringify(get()),

      importState: (json) => {
        try {
          const state = JSON.parse(json);
          set({ ...state });
        } catch (e) {
          console.error("Savegame corrupted", e);
        }
      }
    }),
    {
      name: 'quantum-rpg-storage',
    }
  )
);
