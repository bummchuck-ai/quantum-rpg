
export interface Objective {
  description: string;
  isCompleted: boolean;
  currentProgress?: number; // Optional: Aktueller Fortschritt für Ziele mit Fortschrittsanzeige
  targetProgress?: number; // Optional: Benötigter Fortschritt für Ziele mit Fortschrittsanzeige
}

export interface Reward {
  type: 'exp' | 'credits' | 'item';
  value: number | string; // item ID for 'item'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: Objective[];
  rewards: Reward[];
}
