// Type definitions for data models (used by cloud hooks)
// NOTE: This file no longer contains any localStorage functions - all data is cloud-only

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalRewards: number;
}

export interface UserSettings {
  timezone: string; // IANA timezone string (e.g., "America/New_York")
}

export interface PlayerStats {
  name: string;
  level: number;
  xp: number; // For backwards compatibility - will be removed later
  totalXP: number; // Cumulative XP
  rank: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  availablePoints: number;
  gold: number;
  gems: number;
  credits: number; // Currency for Reward Centre
  avatar?: string; // Avatar image identifier
  title?: string; // Player title
  isFirstTime?: boolean; // Track if user has completed first-time setup
  selectedCardFrame?: string; // Selected card frame ID
  unlockedCardFrames?: string[]; // Array of unlocked card frame IDs
  unlockedClasses?: string[]; // Array of unlocked special class IDs (e.g., necromancer)
}

export interface XPHistoryEntry {
  id: string;
  timestamp: string;
  source: "quest" | "habit" | "gate" | "streak" | "other";
  amount: number;
  description: string;
  levelsGained: number;
  oldLevel: number;
  newLevel: number;
  oldTotalXP: number;
  newTotalXP: number;
}

export interface DailyQuest {
  id: string;
  name: string;
  xpReward: number;
  statBoost: { stat: string; amount: number };
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completionGrid: Record<string, boolean>; // date string -> completed
  goalDays: number;
  winXP: number;
  loseXP: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "won" | "lost";
}

export interface Gate {
  id: string;
  name: string;
  rank: "E-Rank" | "D-Rank" | "C-Rank" | "B-Rank" | "A-Rank" | "S-Rank";
  description: string;
  loreText: string;
  dailyChallenge: string;
  requiredDays: number;
  requiredHabits: number; // Minimum active habits required to complete daily challenge
  progress: Record<string, boolean>; // date string -> completed (days based on requiredDays)
  losses: number;
  startDate: string | null;
  endDate: string | null;
  status: "locked" | "active" | "completed" | "failed";
  rewards: {
    xp: number;
    gold: number;
    title?: string;
  };
  unlockRequirement: {
    level?: number;
    totalXP?: number;
  };
}

// Helper function to calculate total XP needed to reach a level
export const calculateTotalXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // XP needed = sum of (1 to level-1) * 100 = 100 * (level-1) * level / 2
  return 100 * (level - 1) * level / 2;
};

// Helper function to calculate XP needed for next level
export const calculateXPForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100;
};
