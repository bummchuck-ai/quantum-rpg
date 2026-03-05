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
  ownedTalents: Talent[]; // Typ angepasst
  ownedGear: Gear[];
  wounds: number;
  strain: number;
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
  buyTalent: (talentToBuy: Talent) => void; // Typ und Name angepasst
  buyGear: (item: Gear) => void;
  sellGear: (item: Gear) => void;
  updateStatus: (wounds: number, strain: number, credits: number) => void;

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
  ownedTalents: [], // Typ angepasst
  ownedGear: [],
  wounds: 0,
  strain: 0,
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

      buyTalent: (talentToBuy: Talent) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const { availableXP, ownedTalents } = player;

        if (availableXP < talentToBuy.xpCost) return state; // Nicht genug XP

        const newOwnedTalents = [...ownedTalents];
        const existingTalentIndex = newOwnedTalents.findIndex(t => t.id === talentToBuy.id);

        if (talentToBuy.ranked) {
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

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          credits: player.credits - item.price,
          ownedGear: [...player.ownedGear, item]
        };
        return { players: newPlayers };
      }),

      sellGear: (item: Gear) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const gearIndex = player.ownedGear.findIndex(g => g.id === item.id);
        if (gearIndex === -1) return state;

        const newGear = [...player.ownedGear];
        newGear.splice(gearIndex, 1);

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
          ...player,
          credits: player.credits + item.sellPrice,
          ownedGear: newGear
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
