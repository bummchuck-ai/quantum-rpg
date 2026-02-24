import { create } from 'zustand';

// Typen importieren (oder hier definieren, wenn noch nicht in types/character.ts)
// Wir nutzen vorerst einfache Interfaces, um flexibel zu bleiben

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
  forceRating: number; // Neu: Force Rating (0 oder 1)
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
  specializations: Specialization[]; // Liste statt Einzelwert
  
  // Background / Destiny
  backgroundType: 'Obligation' | 'Duty' | 'Morality' | null;
  backgroundOption: string; // z.B. "Schulden", "Verrat"
  backgroundValue: number; // Startwert (z.B. 10, 50)
  backgroundBonus: 'none' | 'xp5' | 'xp10' | 'cr1000' | 'cr2500';

  // Stats (derived or modified)
  characteristics: Characteristics;
  availableXP: number;
  spentXP: number;
  credits: number; // Neu: Credits

  // Actions
  setName: (name: string) => void;
  setSpecies: (species: Species) => void;
  setCareer: (career: Career) => void;
  setSpecialization: (spec: Specialization) => void;
  addSpecialization: (spec: Specialization) => void;
  setBackground: (type: 'Obligation' | 'Duty' | 'Morality', option: string, value: number) => void;
  applyBackgroundBonus: (bonus: 'none' | 'xp5' | 'xp10' | 'cr1000' | 'cr2500') => void;
  buyCharacteristic: (char: keyof Characteristics) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
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
  credits: 500, // Standard Startgeld

  setName: (name) => set({ name }),
  
  setSpecies: (species) => set({ 
    species,
    characteristics: { ...species.characteristics },
    availableXP: species.startingXP
  }),

  setCareer: (career) => set({ career }),
  setSpecialization: (specialization) => set({ specializations: [specialization] }), // Reset auf eine
  addSpecialization: (specialization) => set((state) => ({ specializations: [...state.specializations, specialization] })),

  setBackground: (type, option, value) => set({ 
    backgroundType: type, 
    backgroundOption: option, 
    backgroundValue: value 
  }),

  applyBackgroundBonus: (bonus) => set((state) => {
    // Reset Values first to avoid stacking errors
    let newXP = state.availableXP;
    let newCredits = 500;
    let newBackgroundValue = state.backgroundValue; // Basis-Wert

    // Remove old bonus effects if needed (vereinfacht: wir berechnen hier immer vom Basis-Status + Bonus)
    // Da wir availableXP aber schon durch Spezies gesetzt haben, ist das "Resetten" tricky.
    // Besser: Wir merken uns den Basis-XP Wert der Spezies.
    // Für diesen Prototyp addieren wir einfach Delta.
    
    // Einfache Logik: Reset auf Spezies-XP + Credits
    if (state.species) {
        newXP = state.species.startingXP - state.spentXP;
    }
    
    // Add Bonus
    switch (bonus) {
        case 'xp5':
            newXP += 5;
            newBackgroundValue += 5; // Mehr Verpflichtung
            break;
        case 'xp10':
            newXP += 10;
            newBackgroundValue += 10;
            break;
        case 'cr1000':
            newCredits += 1000;
            newBackgroundValue += 5;
            break;
        case 'cr2500':
            newCredits += 2500;
            newBackgroundValue += 10;
            break;
    }

    return {
        backgroundBonus: bonus,
        availableXP: newXP,
        credits: newCredits,
        backgroundValue: newBackgroundValue // Angepasster Wert
    };
  }),

  buyCharacteristic: (char) => set((state) => {
    const currentValue = state.characteristics[char];
    if (currentValue >= 6) return state; // Cap bei 6

    const cost = (currentValue + 1) * 10;
    if (state.availableXP < cost) return state; // Nicht genug XP

    return {
      characteristics: {
        ...state.characteristics,
        [char]: currentValue + 1
      },
      availableXP: state.availableXP - cost,
      spentXP: state.spentXP + cost
    };
  })
}));
