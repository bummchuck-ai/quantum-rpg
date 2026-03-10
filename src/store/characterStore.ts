import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Characteristics,
  Species,
  Specialization,
  Career,
  Talent, // Import Talent
} from '../types/character';
import { Quest, Objective, Reward } from '../types/quest';
import { Gear } from '../types/gear';

const MAX_TALENT_RANK = 5; // Annahme für maximale Stufe eines Talents

export interface PlayerVehicle {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  silhouette: number;
  speed: number;
  handling: number;
  armor: number;
  hullTraumaThreshold: number;
  systemStrainThreshold: number;
  currentHullTrauma: number;
  currentSystemStrain: number;
  defenseForward?: number;
  defenseAft?: number;
  sensorRange?: string;
  crew: number;
  passengers: number;
  encumbrance?: number;
  consumables?: string;
  cost?: number;
  hardpoints?: number;
  weapons: any[];
  specialFeatures: string[];
  hyperdrive?: number;
  backupHyperdrive?: number;
  navsComputer?: boolean;
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
  availableXP: number;
  spentXP: number;
  credits: number;
  skillRanks: Record<string, number>;
  ownedTalents: Talent[]; // Typ angepasst
  ownedGear: Gear[];
  wounds: number;
  strain: number;
  selectedSubspecies: string | null;
  vehicles: PlayerVehicle[];
  questLog: Quest[];
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
  buySkill: (skillKey: string, isCareer: boolean) => void;
  refundSkill: (skillKey: string, isCareer: boolean) => void;
  buyTalent: (talentToBuy: Talent) => void; // Typ und Name angepasst
  buyGear: (item: Gear) => void;
  sellGear: (item: Gear) => void;
  updateStatus: (wounds: number, strain: number, credits: number) => void;
  spendXP: (amount: number) => void;
  grantXP: (amount: number) => void;

  // Vehicle Actions
  selectVehicle: (vehicle: PlayerVehicle) => void;
  removeVehicle: (vehicleId: string) => void;

  // Quest Actions
  addQuest: (quest: Quest) => void;
  completeObjective: (questId: string, objectiveDescription: string, progress?: number) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;

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
  availableXP: 0,
  spentXP: 0,
  credits: 500,
  skillRanks: {},
  ownedTalents: [], // Typ angepasst
  ownedGear: [],
  wounds: 0,
  strain: 0,
  selectedSubspecies: null,
  vehicles: [],
  questLog: [],
});

export const useCharacterStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [createNewPlayer('player-1')],
      activePlayerIndex: 0,

      addPlayer: () => set((state) => ({
        players: [...state.players, createNewPlayer(`player-${state.players.length + 1}`)]
      })),

      removePlayer: (index) => set((state) => {
        const newPlayers = state.players.filter((_, i) => i !== index);
        if (newPlayers.length === 0) return state; // Prevent removing last player
        return {
          players: newPlayers,
          activePlayerIndex: Math.min(Math.max(0, state.activePlayerIndex - (index <= state.activePlayerIndex ? 1 : 0)), newPlayers.length - 1)
        };
      }),

      setActivePlayer: (index) => set((state) => ({
        activePlayerIndex: Math.min(Math.max(0, index), state.players.length - 1),
      })),

      updateActivePlayer: (updates) => set((state) => {
        if (state.activePlayerIndex >= state.players.length) return state;
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = { ...newPlayers[state.activePlayerIndex], ...updates };
        return { players: newPlayers };
      }),

      // Proxy Actions
      setName: (name) => get().updateActivePlayer({ name }),

      setSpecies: (species) => get().updateActivePlayer({
        species,
        selectedSubspecies: (species as any).selectedSubspecies || null,
        characteristics: { ...species.characteristics },
        availableXP: species.startingXP,
        spentXP: 0,
        skillRanks: { ...(species.freeSkillRanks || {}) },
        ownedTalents: [],
        ownedGear: [],
        backgroundBonus: 'none',
        credits: 500,
        wounds: 0,
        strain: 0,
        questLog: [],
        vehicles: [],
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
        // Background value is the base obligation/duty value, reset to initial before applying
        const baseValue = player.backgroundType === 'Morality' ? 50 : 10;

        switch (bonus) {
          case 'xp5': baseXP += 5; break;
          case 'xp10': baseXP += 10; break;
          case 'cr1000': newCredits += 1000; break;
          case 'cr2500': newCredits += 2500; break;
        }

        // Determine value increase based on bonus
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

      buySkill: (skillKey, isCareer) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentRank = player.skillRanks[skillKey] || 0;
        if (currentRank >= 2) return state; // Max rank 2 during creation
        const cost = isCareer ? 5 : 10;
        if (player.availableXP < cost) return state;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          skillRanks: { ...player.skillRanks, [skillKey]: currentRank + 1 },
          availableXP: player.availableXP - cost,
          spentXP: player.spentXP + cost,
        };
        return { players: newPlayers };
      }),

      refundSkill: (skillKey, isCareer) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentRank = player.skillRanks[skillKey] || 0;
        const freeRanks = player.species?.freeSkillRanks?.[skillKey] || 0;
        if (currentRank <= 0 || currentRank <= freeRanks) return state;
        const cost = isCareer ? 5 : 10;

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          skillRanks: { ...player.skillRanks, [skillKey]: currentRank - 1 },
          availableXP: player.availableXP + cost,
          spentXP: player.spentXP - cost,
        };
        return { players: newPlayers };
      }),

      buyTalent: (talentToBuy: Talent) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const { availableXP, ownedTalents } = player;

        if (availableXP < talentToBuy.xpCost) return state; // Nicht genug XP

        const newOwnedTalents = [...ownedTalents];
        const existingTalentIndex = newOwnedTalents.findIndex(t => t.id === talentToBuy.id);

        if (talentToBuy.ranked || (talentToBuy as any).isRanked) {
          if (existingTalentIndex !== -1) {
            // Talent existiert, Rang erhöhen
            const existingTalent = newOwnedTalents[existingTalentIndex];
            if (existingTalent.currentRank < MAX_TALENT_RANK) {
              newOwnedTalents[existingTalentIndex] = { ...existingTalent, currentRank: existingTalent.currentRank + 1 };
            } else {
              return state; // Maximaler Rang erreicht
            }
          } else {
            // Neues Ranked Talent kaufen
            newOwnedTalents.push({ ...talentToBuy, currentRank: 1 });
          }
        } else {
          // Nicht-ranked Talent kaufen
          if (existingTalentIndex !== -1) {
            return state; // Talent bereits im Besitz und nicht ranked
          }
          newOwnedTalents.push({ ...talentToBuy, currentRank: 1 }); // currentRank für non-ranked Talente auf 1 setzen
        }

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          availableXP: availableXP - talentToBuy.xpCost,
          spentXP: player.spentXP + talentToBuy.xpCost,
          ownedTalents: newOwnedTalents,
        };
        return { players: newPlayers };
      }),

      buyGear: (item: Gear) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        if (player.credits < item.price) return state;

        // Ensure item has an id for sell matching
        const gearWithId = item.id ? item : { ...item, id: `gear-${item.name}-${Date.now()}` };
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          credits: player.credits - item.price,
          ownedGear: [...player.ownedGear, gearWithId]
        };
        return { players: newPlayers };
      }),

      sellGear: (item: Gear) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        // Match by id first, fall back to name match for items without ids
        const gearIndex = player.ownedGear.findIndex(g => (g.id && item.id) ? g.id === item.id : g.name === item.name);
        if (gearIndex === -1) return state;

        const newGear = [...player.ownedGear];
        newGear.splice(gearIndex, 1);

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          credits: player.credits + (item.sellPrice || Math.floor(item.price * 0.5)),
          ownedGear: newGear
        };
        return { players: newPlayers };
      }),

      updateStatus: (wounds, strain, credits) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const woundThreshold = (player.species?.woundThresholdBase || 10) + (player.characteristics?.brawn || 0);
        const strainThreshold = (player.species?.strainThresholdBase || 10) + (player.characteristics?.willpower || 0);
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          wounds: Math.max(0, Math.min(woundThreshold, player.wounds + wounds)),
          strain: Math.max(0, Math.min(strainThreshold, player.strain + strain)),
          credits: Math.max(0, player.credits + credits)
        };
        return { players: newPlayers };
      }),

      spendXP: (amount) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        if (player.availableXP < amount) return state;
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          availableXP: player.availableXP - amount,
          spentXP: player.spentXP + amount,
        };
        return { players: newPlayers };
      }),

      grantXP: (amount) => set((state) => {
        if (amount <= 0) return state;
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          availableXP: player.availableXP + amount,
        };
        return { players: newPlayers };
      }),

      // Vehicle Actions
      selectVehicle: (vehicle) => set((state) => {
        const newPlayers = [...state.players];
        const player = newPlayers[state.activePlayerIndex];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          vehicles: [vehicle], // Only one vehicle at a time
        };
        return { players: newPlayers };
      }),

      removeVehicle: (vehicleId) => set((state) => {
        const newPlayers = [...state.players];
        const player = newPlayers[state.activePlayerIndex];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          vehicles: player.vehicles.filter(v => v.id !== vehicleId),
        };
        return { players: newPlayers };
      }),

      // Quest Actions Implementation
      addQuest: (quest) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          questLog: [...player.questLog, quest]
        };
        return { players: newPlayers };
      }),

      completeObjective: (questId, objectiveDescription, progress) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newQuestLog = player.questLog.map(quest => {
          if (quest.id === questId) {
            const newObjectives = quest.objectives.map(obj => {
              if (obj.description === objectiveDescription) {
                if (progress !== undefined && obj.targetProgress !== undefined) {
                  const newProgress = Math.min(obj.targetProgress, (obj.currentProgress || 0) + progress);
                  return { ...obj, currentProgress: newProgress, isCompleted: newProgress >= obj.targetProgress };
                }
                return { ...obj, isCompleted: true };
              }
              return obj;
            });
            const allObjectivesCompleted = newObjectives.every(obj => obj.isCompleted);
            return { ...quest, objectives: newObjectives, status: allObjectivesCompleted ? 'completed' : quest.status };
          }
          return quest;
        });

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = { ...player, questLog: newQuestLog };
        return { players: newPlayers };
      }),

      completeQuest: (questId) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        let newCredits = player.credits;
        let newAvailableXP = player.availableXP;
        const newQuestLog = player.questLog.map(quest => {
          if (quest.id === questId && quest.status === 'active') {
            quest.rewards.forEach(reward => {
              if (reward.type === 'exp') {
                newAvailableXP += (reward.value as number);
              } else if (reward.type === 'credits') {
                newCredits += (reward.value as number);
              }
            });
            return { ...quest, status: 'completed' };
          }
          return quest;
        });

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          questLog: newQuestLog,
          credits: newCredits,
          availableXP: newAvailableXP,
        };
        return { players: newPlayers };
      }),

      failQuest: (questId) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const newQuestLog = player.questLog.map(quest => {
          if (quest.id === questId) {
            return { ...quest, status: 'failed' };
          }
          return quest;
        });
        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = { ...player, questLog: newQuestLog };
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
          // Basic validation
          if (!state.players || !Array.isArray(state.players) || state.players.length === 0) {
            console.error("Invalid save: missing players array");
            return;
          }
          if (state.activePlayerIndex >= state.players.length) {
            state.activePlayerIndex = 0;
          }
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
