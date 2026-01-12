import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Achievement, RARITY_CONFIG, CATEGORY_CONFIG, isAchievementUnlocked } from "@/lib/achievements";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";
import { useCloudHabits } from "@/hooks/useCloudHabits";
import { useCloudGates } from "@/hooks/useCloudGates";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { cn } from "@/lib/utils";

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  open: boolean;
  onClose: () => void;
}

export const AchievementDetailModal = ({ achievement, open, onClose }: AchievementDetailModalProps) => {
  const { stats } = usePlayerStats();
  const { streak } = useCloudStreaks();
  const { habits } = useCloudHabits();
  const { gates } = useCloudGates();
  const { xpHistory } = useCloudChallenges();

  if (!achievement) return null;

  const isUnlocked = isAchievementUnlocked(achievement.id);
  const rarity = RARITY_CONFIG[achievement.rarity];
  const category = CATEGORY_CONFIG[achievement.category];

  // Achievements that are manually granted (no progress tracking)
  const MANUALLY_GRANTED_ACHIEVEMENTS = ["early_adopter"];
  const isManuallyGranted = MANUALLY_GRANTED_ACHIEVEMENTS.includes(achievement.id);

  // Calculate progress for locked achievements
  const getProgress = (): { current: number; target: number; percentage: number } | null => {
    // Don't show progress for manually granted achievements
    if (isManuallyGranted) return null;
    
    if (isUnlocked) return { current: achievement.requirement.value, target: achievement.requirement.value, percentage: 100 };

    let current = 0;
    const target = achievement.requirement.value;

    switch (achievement.requirement.type) {
      case "streak":
        current = Math.max(streak.currentStreak, streak.longestStreak);
        break;
      case "power_level":
        current = stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense;
        break;
      case "level":
        current = stats.level;
        break;
      case "total_xp":
        current = stats.totalXP;
        break;
      case "quest_count":
        current = xpHistory.filter(e => e.source === "quest").length;
        break;
      case "gate_clear":
        current = gates.filter(g => g.status === "completed").length;
        break;
      case "gate_rank":
        const clearedRanks = gates.filter(g => g.status === "completed").map(g => g.rank);
        current = achievement.requirement.gateRank && clearedRanks.includes(achievement.requirement.gateRank as any) ? 1 : 0;
        break;
      case "habit_count":
        current = habits.filter(h => h.status === "active").length;
        break;
      case "habit_win":
        current = habits.filter(h => h.status === "won").length;
        break;
      case "class_unlock":
        current = stats.unlockedClasses?.includes("necromancer") ? 1 : 0;
        break;
    }

    const percentage = Math.min((current / target) * 100, 100);
    return { current, target, percentage };
  };

  const progress = getProgress();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-sm border-2 p-0 overflow-hidden",
          rarity.borderColor,
          isUnlocked ? rarity.glow : ""
        )}
      >
        {/* Header with icon */}
        <div className={cn(
          "p-6 text-center relative",
          rarity.bgColor
        )}>
          {/* Background glow */}
          {isUnlocked && (
            <div className="absolute inset-0 opacity-30">
              {achievement.rarity === "mythic" && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-rose-500/40 to-purple-500/40" />
              )}
              {achievement.rarity === "legendary" && (
                <div className="absolute inset-0 animate-pulse bg-amber-500/20" />
              )}
            </div>
          )}

          {/* Icon */}
          <div className={cn(
            "w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl border-2 relative",
            isUnlocked ? `${rarity.borderColor} ${rarity.bgColor}` : "border-muted-foreground/30 bg-muted/50"
          )}>
            <span className={cn(isUnlocked ? "" : "opacity-30 grayscale")}>{achievement.icon}</span>
          </div>

          {/* Name */}
          <h2 className={cn(
            "text-xl font-bold mt-4 font-cinzel",
            isUnlocked ? rarity.color : "text-muted-foreground"
          )}>
            {achievement.name}
          </h2>

          {/* Rarity badge */}
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 border",
            rarity.bgColor,
            rarity.borderColor,
            rarity.color
          )}>
            {achievement.rarity}
          </span>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4 bg-background">
          {/* Description */}
          <p className="text-center text-muted-foreground">
            {achievement.description}
          </p>

          {/* Category */}
          <div className="flex items-center justify-center gap-2">
            <span className={category.color}>{category.icon}</span>
            <span className="text-sm text-muted-foreground">{category.name}</span>
          </div>

          {/* Points */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span className="text-sm font-bold text-amber-400">+{achievement.points} Achievement Points</span>
          </div>

          {/* Progress bar for locked achievements (skip for manually granted) */}
          {!isUnlocked && progress && (
            <div className="space-y-2 pt-4 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn("font-bold", progress.percentage >= 100 ? "text-green-400" : "text-primary")}>
                  {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={progress.percentage} 
                className="h-3"
              />
              <p className="text-xs text-center text-muted-foreground">
                {progress.percentage >= 100 
                  ? "✨ Ready to unlock!" 
                  : `${(100 - progress.percentage).toFixed(1)}% remaining`}
              </p>
            </div>
          )}

          {/* Special message for manually granted locked achievements */}
          {!isUnlocked && isManuallyGranted && (
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground italic">
                This achievement is granted to special hunters
              </p>
            </div>
          )}

          {/* Unlocked status */}
          {isUnlocked && (
            <div className="text-center pt-4 border-t border-border/50">
              <span className="text-green-400 font-bold">✓ Unlocked</span>
              {achievement.unlockedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
