import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Characteristics {
  brawn: number;
  agility: number;
  intellect: number;
  cunning: number;
  willpower: number;
  presence: number;
}

interface Species {
  name: string;
  startingXP: number;
  characteristics: Characteristics;
  woundThresholdBase: number;
  strainThresholdBase: number;
  abilities: string[];
}

interface Career {
  name: string;
  careerSkills: string[];
  forceRating: number;
  specializations: Specialization[];
}

interface Specialization {
  name: string;
  skills: string[];
}

interface CharacterState {
  // Data
  name: string;
  species: Species | null;
  career: Career | null;
  specializations: Specialization[];
  
  // Background / Destiny
  backgroundType: 'Obligation' | 'Duty' | 'Morality' | null;
  backgroundOption: string;
  backgroundValue: number;
  backgroundBonus: 'none' | 'xp5' | 'xp10' | 'cr1000' | 'cr2500';

  // Stats
  characteristics: Characteristics;
  availableXP: number;
  spentXP: number;
  credits: number;
  ownedTalents: string[];
  ownedGear: any[];
  
  // Realtime Play Stats
  wounds: number;
  strain: number;

  // Actions
  setName: (name: string) => void;
  setSpecies: (species: Species) => void;
  setCareer: (career: Career) => void;
  setSpecialization: (spec: Specialization) => void;
  addSpecialization: (spec: Specialization) => void;
  setBackground: (type: 'Obligation' | 'Duty' | 'Morality', option: string, value: number) => void;
  applyBackgroundBonus: (bonus: 'none' | 'xp5' | 'xp10' | 'cr1000' | 'cr2500') => void;
  buyCharacteristic: (char: keyof Characteristics) => void;
  buyTalent: (talentName: string, cost: number) => void;
  buyGear: (item: any) => void;
  updateStatus: (wounds: number, strain: number, credits: number) => void;
  reset: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      name: '',
      species: null,
      career: null,
      specializations: [],
      
      backgroundType: null,
      backgroundOption: '',
      backgroundValue: 0,
      backgroundBonus: 'none',

      characteristics: {
        brawn: 1, agility: 1, intellect: 1, cunning: 1, willpower: 1, presence: 1
      },
      availableXP: 0,
      spentXP: 0,
      credits: 500,
      ownedTalents: [],
      ownedGear: [],
      
      wounds: 0,
      strain: 0,

      setName: (name) => set({ name }),
      
      setSpecies: (species) => set({ 
        species,
        characteristics: { ...species.characteristics },
        availableXP: species.startingXP,
        wounds: 0,
        strain: 0
      }),

      setCareer: (career) => set({ career }),
      setSpecialization: (specialization) => set({ specializations: [specialization] }),
      addSpecialization: (specialization) => set((state) => ({ specializations: [...state.specializations, specialization] })),

      setBackground: (type, option, value) => set({ 
        backgroundType: type, 
        backgroundOption: option, 
        backgroundValue: value 
      }),

      applyBackgroundBonus: (bonus) => set((state) => {
        let baseXP = state.species ? state.species.startingXP : 0;
        let newCredits = 500;
        let newBackgroundValue = state.backgroundValue;

        switch (bonus) {
            case 'xp5': baseXP += 5; newBackgroundValue += 5; break;
            case 'xp10': baseXP += 10; newBackgroundValue += 10; break;
            case 'cr1000': newCredits += 1000; newBackgroundValue += 5; break;
            case 'cr2500': newCredits += 2500; newBackgroundValue += 10; break;
        }

        return {
            backgroundBonus: bonus,
            availableXP: baseXP - state.spentXP,
            credits: newCredits,
            backgroundValue: newBackgroundValue
        };
      }),

      buyTalent: (talentName, cost) => set((state) => {
        if (state.availableXP < cost) return state;
        if (state.ownedTalents.includes(talentName)) return state;
        return {
          availableXP: state.availableXP - cost,
          spentXP: state.spentXP + cost,
          ownedTalents: [...state.ownedTalents, talentName]
        };
      }),

      buyGear: (item) => set((state) => {
        if (state.credits < item.price) return state;
        return {
          credits: state.credits - item.price,
          ownedGear: [...state.ownedGear, item]
        };
      }),

      buyCharacteristic: (char) => set((state) => {
        const currentValue = state.characteristics[char];
        if (currentValue >= 6) return state;
        const cost = (currentValue + 1) * 10;
        if (state.availableXP < cost) return state;
        return {
          characteristics: { ...state.characteristics, [char]: currentValue + 1 },
          availableXP: state.availableXP - cost,
          spentXP: state.spentXP + cost
        };
      }),

      updateStatus: (wounds, strain, credits) => set((state) => ({
        wounds: state.wounds + wounds,
        strain: state.strain + strain,
        credits: state.credits + credits
      })),
      reset: () => set({
        name: '',
        species: null,
        career: null,
        specializations: [],
        ownedTalents: [],
        ownedGear: [],
        characteristics: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
        availableXP: 0,
        spentXP: 0,
        credits: 500,
        backgroundType: null,
        backgroundOption: '',
        backgroundValue: 0,
        backgroundBonus: 'none',
        wounds: 0,
        strain: 0
      }),
    }),
    {
      name: 'quantum-rpg-storage',
    }
  )
);
