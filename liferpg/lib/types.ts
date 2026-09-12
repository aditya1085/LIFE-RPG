export type Category = "INTELLECT" | "STRENGTH" | "DISCIPLINE" | "AGILITY" | "WISDOM";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "BOSS";

export interface QuestData {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  category: Category;
  difficulty: Difficulty;
  xpReward: number;
  goldReward: number;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  level: number;
  currentXp: number;
  gold: number;
  intellect: number;
  strength: number;
  discipline: number;
  agility: number;
  wisdom: number;
  streakCount: number;
  longestStreak: number;
  lastActiveOn: string | null;
  createdAt: string;
}

export interface ShopItemData {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  category: string;
  owned: boolean;
}
