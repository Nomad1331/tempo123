import { useState, useEffect, useCallback } from "react";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";
import { useCloudHabits } from "@/hooks/useCloudHabits";
import { useCloudGates } from "@/hooks/useCloudGates";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import {
  Achievement,
  ACHIEVEMENTS,
  getAchievementProgress,
  setAchievementProgress,
  AchievementProgress,
} from "@/lib/achievements";

interface AchievementCheckData {
  streak: number;
  longestStreak: number;
  powerLevel: number;
  level: number;
  totalXP: number;
  questsCompleted: number;
  gatesCleared: number;
  clearedGateRanks: string[];
  habitsCount: number;
  habitsWon: number;
  hasNecromancer: boolean;
}

export const useAchievements = () => {
  const [progress, setProgress] = useState<AchievementProgress>(getAchievementProgress());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  
  // Get data from cloud hooks
  const { streak } = useCloudStreaks();
  const { habits } = useCloudHabits();
  const { gates } = useCloudGates();
  const { xpHistory } = useCloudChallenges();
  const { stats } = usePlayerStats();

  // Gather all data needed to check achievements
  const gatherCheckData = useCallback((): AchievementCheckData => {
    // Calculate quests completed from XP history
    const questsCompleted = xpHistory.filter(e => e.source === "quest").length;

    // Calculate gates cleared
    const clearedGates = gates.filter(g => g.status === "completed");
    const gatesCleared = clearedGates.length;
    const clearedGateRanks = clearedGates.map(g => g.rank);

    // Count habits
    const habitsCount = habits.filter(h => h.status === "active").length;
    const habitsWon = habits.filter(h => h.status === "won").length;

    // Check if necromancer is unlocked
    const hasNecromancer = stats.unlockedClasses?.includes("necromancer") || false;

    return {
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      powerLevel: stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense,
      level: stats.level,
      totalXP: stats.totalXP,
      questsCompleted,
      gatesCleared,
      clearedGateRanks,
      habitsCount,
      habitsWon,
      hasNecromancer,
    };
  }, [streak, habits, gates, xpHistory, stats]);

  // Check if a specific achievement should be unlocked
  const checkAchievement = useCallback((achievement: Achievement, data: AchievementCheckData): boolean => {
    const { requirement } = achievement;

    switch (requirement.type) {
      case "streak":
        return Math.max(data.streak, data.longestStreak) >= requirement.value;
      case "power_level":
        return data.powerLevel >= requirement.value;
      case "level":
        return data.level >= requirement.value;
      case "total_xp":
        return data.totalXP >= requirement.value;
      case "quest_count":
        return data.questsCompleted >= requirement.value;
      case "gate_clear":
        return data.gatesCleared >= requirement.value;
      case "gate_rank":
        return requirement.gateRank ? data.clearedGateRanks.includes(requirement.gateRank) : false;
      case "habit_count":
        return data.habitsCount >= requirement.value;
      case "habit_win":
        return data.habitsWon >= requirement.value;
      case "class_unlock":
        return data.hasNecromancer;
      default:
        return false;
    }
  }, []);

  // Check all achievements and unlock any new ones
  const checkAllAchievements = useCallback(() => {
    const currentProgress = getAchievementProgress();
    const data = gatherCheckData();
    const newUnlocks: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      // Skip if already unlocked
      if (currentProgress.unlockedAchievements.includes(achievement.id)) {
        return;
      }

      // Skip early_adopter - it's manually granted
      if (achievement.id === "early_adopter") {
        return;
      }

      // Check if achievement should be unlocked
      if (checkAchievement(achievement, data)) {
        currentProgress.unlockedAchievements.push(achievement.id);
        currentProgress.totalPoints += achievement.points;
        newUnlocks.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });

    if (newUnlocks.length > 0) {
      currentProgress.lastChecked = new Date().toISOString();
      setAchievementProgress(currentProgress);
      setProgress(currentProgress);
      setNewlyUnlocked(prev => [...prev, ...newUnlocks]);
    }

    return newUnlocks;
  }, [gatherCheckData, checkAchievement]);

  // Clear newly unlocked (after showing popups)
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Dismiss a single newly unlocked achievement
  const dismissUnlocked = useCallback((achievementId: string) => {
    setNewlyUnlocked(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  // Get unlocked achievements
  const getUnlocked = useCallback((): Achievement[] => {
    return ACHIEVEMENTS.filter(a => progress.unlockedAchievements.includes(a.id));
  }, [progress]);

  // Get locked achievements
  const getLocked = useCallback((): Achievement[] => {
    return ACHIEVEMENTS.filter(a => !progress.unlockedAchievements.includes(a.id));
  }, [progress]);

  // Get achievements by category
  const getByCategory = useCallback((category: string): Achievement[] => {
    return ACHIEVEMENTS.filter(a => a.category === category);
  }, []);

  // Check on mount and when data changes
  useEffect(() => {
    checkAllAchievements();
  }, [checkAllAchievements]);

  // Expose a manual trigger for checking (useful after actions)
  const triggerCheck = useCallback(() => {
    return checkAllAchievements();
  }, [checkAllAchievements]);

  return {
    progress,
    newlyUnlocked,
    allAchievements: ACHIEVEMENTS,
    unlockedAchievements: getUnlocked(),
    lockedAchievements: getLocked(),
    checkAllAchievements: triggerCheck,
    clearNewlyUnlocked,
    dismissUnlocked,
    getByCategory,
  };
};
