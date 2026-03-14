
export interface QuestObjective {
  id?: string;
  description: string;
  completed: boolean;
  currentProgress?: number;
  targetProgress?: number;
}

export interface QuestReward {
  type: 'exp' | 'credits' | 'item';
  value: number | string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  giver?: string;
  location?: string;
  xpReward?: number;
  creditsReward?: number;
}
