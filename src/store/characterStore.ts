import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  ownedTalents: string[];
  ownedGear: any[];
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
  buyTalent: (talentName: string, cost: number) => void;
  buyGear: (item: any) => void;
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
  availableXP: 0,
  spentXP: 0,
  credits: 500,
  ownedTalents: [],
  ownedGear: [],
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
        let newBackgroundValue = player.backgroundValue;

        switch (bonus) {
            case 'xp5': baseXP += 5; newBackgroundValue += 5; break;
            case 'xp10': baseXP += 10; newBackgroundValue += 10; break;
            case 'cr1000': newCredits += 1000; newBackgroundValue += 5; break;
            case 'cr2500': newCredits += 2500; newBackgroundValue += 10; break;
        }

        const newPlayers = [...state.players];
        newPlayers[state.activePlayerIndex] = {
            ...player,
            backgroundBonus: bonus as any,
            availableXP: baseXP - player.spentXP,
            credits: newCredits,
            backgroundValue: newBackgroundValue
        };
        return { players: newPlayers };
      }),

      buyCharacteristic: (char) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        const currentValue = player.characteristics[char];
        if (currentValue >= 6) return state;
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

      buyTalent: (talentName, cost) => set((state) => {
        const player = state.players[state.activePlayerIndex];
        if (player.availableXP < cost) return state;
        if (player.ownedTalents.includes(talentName)) return state;
        
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
          console.error(\"Savegame corrupted\", e);
        }
      }
    }),
    {
      name: 'quantum-rpg-storage',
    }
  )
);
