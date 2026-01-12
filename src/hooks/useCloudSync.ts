import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerStats, DailyQuest, Habit, Gate, StreakData, XPHistoryEntry, UserSettings } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface CloudProfile {
  id: string;
  user_id: string;
  hunter_name: string;
  avatar: string | null;
  title: string | null;
  discord_id: string | null;
  is_public: boolean;
}

interface CloudPlayerStats {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  weekly_xp: number;
  rank: string;
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  available_points: number;
  gold: number;
  gems: number;
  credits: number;
  selected_card_frame: string | null;
  unlocked_card_frames: string[] | null;
  unlocked_classes: string[] | null;
}

// Helper to safely cast JSONB to typed arrays/objects
const parseJsonb = <T>(data: Json | null, fallback: T): T => {
  if (data === null || data === undefined) return fallback;
  return data as unknown as T;
};

export const useCloudSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<CloudProfile | null>(null);
  const [cloudStats, setCloudStats] = useState<CloudPlayerStats | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncInProgressRef = useRef(false);

  // Fetch cloud data and sync when user logs in
  useEffect(() => {
    if (user) {
      fetchCloudData().then((cloudData) => {
        if (cloudData?.profile && cloudData?.stats) {
          syncCloudToLocal(cloudData.profile, cloudData.stats);
        } else {
          // No cloud data yet - migrate local to cloud if there's progress
          const localStats = storage.getStats();
          const hasLocalProgress = localStats.level > 1 || localStats.totalXP > 0;
          if (hasLocalProgress) {
            migrateLocalToCloud();
          }
        }
      });
    } else {
      setCloudProfile(null);
      setCloudStats(null);
    }
  }, [user]);

  const fetchCloudData = async () => {
    if (!user) return null;

    try {
      const [profileRes, statsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('player_stats').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      if (profileRes.data) setCloudProfile(profileRes.data);
      if (statsRes.data) setCloudStats(statsRes.data);
      
      return { profile: profileRes.data, stats: statsRes.data };
    } catch (error) {
      console.error('Error fetching cloud data:', error);
      return null;
    }
  };

  // Fetch all user data from cloud
  const fetchAllCloudData = async () => {
    if (!user) return null;

    try {
      const [questsRes, habitsRes, gatesRes, streaksRes, challengesRes] = await Promise.all([
        supabase.from('user_quests').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_habits').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_gates').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_challenges').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      return {
        quests: questsRes.data,
        habits: habitsRes.data,
        gates: gatesRes.data,
        streaks: streaksRes.data,
        challenges: challengesRes.data,
      };
    } catch (error) {
      console.error('Error fetching all cloud data:', error);
      return null;
    }
  };

  // Sync cloud data to local storage - merge cloud with local, preferring cloud for critical data
  const syncCloudToLocal = async (profile: CloudProfile, stats: CloudPlayerStats) => {
    const currentLocalStats = storage.getStats();
    
    // Calculate total power to determine which data is more progressed
    const cloudPower = stats.strength + stats.agility + stats.intelligence + stats.vitality + stats.sense;
    const localPower = currentLocalStats.strength + currentLocalStats.agility + currentLocalStats.intelligence + currentLocalStats.vitality + currentLocalStats.sense;
    
    // Use cloud data if it has more progress (higher level, XP, or power)
    const cloudHasMoreProgress = stats.level > currentLocalStats.level || 
                                  stats.total_xp > currentLocalStats.totalXP ||
                                  (stats.level === currentLocalStats.level && cloudPower > localPower);
    
    // For avatar: prefer cloud avatar UNLESS local has a custom base64 image that cloud doesn't have
    // Cloud should be the source of truth for avatar selection across devices
    const isLocalCustomImage = currentLocalStats.avatar?.startsWith('data:');
    const isCloudCustomImage = profile.avatar?.startsWith('data:');
    
    // Use cloud avatar if: cloud has custom image, OR local doesn't have custom image
    // Only use local if local has custom image AND cloud doesn't
    const resolvedAvatar = (isLocalCustomImage && !isCloudCustomImage)
      ? currentLocalStats.avatar 
      : (profile.avatar || currentLocalStats.avatar || 'default');
    
    // CRITICAL: For unlocked items (frames, classes), ALWAYS merge ALL sources to prevent loss
    // This ensures purchased frames AND supporter frames are never lost due to sync timing issues
    
    // Also check local supporter benefits for redeemed frames
    const supporterBenefitsRaw = localStorage.getItem('soloLevelingSupporterBenefits');
    let supporterFrames: string[] = [];
    if (supporterBenefitsRaw) {
      try {
        const supporterBenefits = JSON.parse(supporterBenefitsRaw);
        supporterFrames = supporterBenefits.unlockedFrames || [];
      } catch {}
    }
    
    const mergedUnlockedFrames = [...new Set([
      ...(stats.unlocked_card_frames || ['default']),
      ...(currentLocalStats.unlockedCardFrames || ['default']),
      ...supporterFrames,
    ])];
    
    const mergedUnlockedClasses = [...new Set([
      ...(stats.unlocked_classes || []),
      ...(currentLocalStats.unlockedClasses || []),
    ])];
    
    // ALWAYS sync profile data (name, avatar, title, frame selection) from cloud
    // Cloud is the source of truth for these settings to ensure consistency across devices
    // For stats, only sync if cloud has more progress
    const updatedStats = {
      ...currentLocalStats,
      name: profile.hunter_name || currentLocalStats.name,
      avatar: resolvedAvatar,
      title: profile.title || currentLocalStats.title || 'Awakened Hunter',
      level: cloudHasMoreProgress ? stats.level : currentLocalStats.level,
      totalXP: cloudHasMoreProgress ? stats.total_xp : currentLocalStats.totalXP,
      rank: cloudHasMoreProgress ? stats.rank : currentLocalStats.rank,
      strength: cloudHasMoreProgress ? stats.strength : currentLocalStats.strength,
      agility: cloudHasMoreProgress ? stats.agility : currentLocalStats.agility,
      intelligence: cloudHasMoreProgress ? stats.intelligence : currentLocalStats.intelligence,
      vitality: cloudHasMoreProgress ? stats.vitality : currentLocalStats.vitality,
      sense: cloudHasMoreProgress ? stats.sense : currentLocalStats.sense,
      availablePoints: cloudHasMoreProgress ? stats.available_points : currentLocalStats.availablePoints,
      gold: cloudHasMoreProgress ? stats.gold : currentLocalStats.gold,
      gems: cloudHasMoreProgress ? stats.gems : currentLocalStats.gems,
      credits: cloudHasMoreProgress ? stats.credits : currentLocalStats.credits,
      // ALWAYS use cloud frame selection for consistency across devices
      selectedCardFrame: stats.selected_card_frame || currentLocalStats.selectedCardFrame || 'default',
      // ALWAYS use merged unlocked frames to prevent loss
      unlockedCardFrames: mergedUnlockedFrames,
      unlockedClasses: mergedUnlockedClasses,
      isFirstTime: false,
    };
    
    storage.setStats(updatedStats);

    // Fetch and sync all other data from cloud
    const allCloudData = await fetchAllCloudData();
    if (allCloudData) {
      // Sync quests (cloud is source of truth, even for empty arrays)
      if (allCloudData.quests && 'quests' in allCloudData.quests) {
        const cloudQuests = parseJsonb<DailyQuest[]>(allCloudData.quests.quests, []);
        storage.setQuests(cloudQuests);

        // Keep last reset date in sync for any legacy code paths
        if ('last_reset_date' in allCloudData.quests && allCloudData.quests.last_reset_date) {
          storage.setLastReset(allCloudData.quests.last_reset_date as string);
        }
      }

      // Sync habits
      if (allCloudData.habits && 'habits' in allCloudData.habits) {
        const cloudHabits = parseJsonb<Habit[]>(allCloudData.habits.habits, []);
        storage.setHabits(cloudHabits);
      }

      // Sync gates
      if (allCloudData.gates && 'gates' in allCloudData.gates) {
        const cloudGates = parseJsonb<Gate[]>(allCloudData.gates.gates, []);
        storage.setGates(cloudGates);
      }

      // Sync streaks
      if (allCloudData.streaks) {
        const streakData: StreakData = {
          currentStreak: allCloudData.streaks.current_streak,
          longestStreak: allCloudData.streaks.longest_streak,
          lastCompletionDate: allCloudData.streaks.last_completion_date,
          totalRewards: allCloudData.streaks.total_rewards,
        };
        storage.setStreak(streakData);
      }

      // Sync challenges and other data (also sync empty values to prevent stale local fallbacks)
      if (allCloudData.challenges) {
        const challenges = parseJsonb(allCloudData.challenges.challenges, []);
        const necroChallenge = parseJsonb(allCloudData.challenges.necro_challenge, null);
        const claimedChallenges = parseJsonb(allCloudData.challenges.claimed_challenges, {});
        const xpHistory = parseJsonb<XPHistoryEntry[]>(allCloudData.challenges.xp_history, []);
        const userSettings = parseJsonb<UserSettings>(allCloudData.challenges.user_settings, {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        const activeBoost = parseJsonb(allCloudData.challenges.active_boost, null);

        localStorage.setItem("soloLevelingChallenges", JSON.stringify(challenges));
        localStorage.setItem("soloLevelingNecroChallenge", JSON.stringify(necroChallenge));
        localStorage.setItem("soloLevelingClaimedChallenges", JSON.stringify(claimedChallenges));
        storage.setXPHistory(xpHistory);
        storage.setSettings(userSettings);
        localStorage.setItem("soloLevelingActiveBoost", JSON.stringify(activeBoost));
      }
    }
    
    // Trigger a storage event so other components re-read the updated stats
    window.dispatchEvent(new Event('storage'));
    
    // If local had more progress, sync it to cloud
    if (!cloudHasMoreProgress && (currentLocalStats.level > 1 || currentLocalStats.totalXP > 0)) {
      setTimeout(() => syncToCloud(updatedStats), 500);
    }
    
    toast({
      title: "Welcome Back, Hunter!",
      description: cloudHasMoreProgress ? "Your progress has been restored from the cloud." : "Your local progress is intact.",
    });
  };

  // Migrate localStorage data to cloud on first login
  const migrateLocalToCloud = async () => {
    if (!user) return false;

    setSyncing(true);
    try {
      const localStats = storage.getStats();
      
      // Check if user has meaningful local progress
      const hasLocalProgress = localStats.level > 1 || localStats.totalXP > 0;
      
      if (!hasLocalProgress) {
        setSyncing(false);
        return true; // Nothing to migrate
      }

      // Update cloud profile with local data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          hunter_name: localStats.name,
          avatar: localStats.avatar || 'default',
          title: localStats.title || 'Awakened Hunter',
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update cloud stats with local data
      const { error: statsError } = await supabase
        .from('player_stats')
        .update({
          level: localStats.level,
          total_xp: localStats.totalXP,
          rank: localStats.rank,
          strength: localStats.strength,
          agility: localStats.agility,
          intelligence: localStats.intelligence,
          vitality: localStats.vitality,
          sense: localStats.sense,
          available_points: localStats.availablePoints,
          gold: localStats.gold,
          gems: localStats.gems,
          credits: localStats.credits,
          selected_card_frame: localStats.selectedCardFrame || 'default',
          unlocked_card_frames: localStats.unlockedCardFrames || ['default'],
          unlocked_classes: localStats.unlockedClasses || [],
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      // Migrate all other data
      await syncAllDataToCloud();

      await fetchCloudData();
      
      toast({
        title: "Progress Synced!",
        description: "Your local progress has been saved to the cloud.",
      });

      setSyncing(false);
      return true;
    } catch (error) {
      console.error('Error migrating local data:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync your progress. Please try again.",
        variant: "destructive",
      });
      setSyncing(false);
      return false;
    }
  };

  // Sync all data to cloud (ONLY migrate explicit localStorage data; never invent defaults)
  const syncAllDataToCloud = async () => {
    if (!user || syncInProgressRef.current) return false;

    syncInProgressRef.current = true;

    const readJson = <T,>(key: string): T | null => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    try {
      // Only sync keys that actually exist in localStorage.
      // This prevents overwriting cloud data with DEFAULT_* fallbacks.
      const quests = readJson<DailyQuest[]>("soloLevelingQuests");
      const habits = readJson<Habit[]>("soloLevelingHabits");
      const gates = readJson<Gate[]>("soloLevelingGates");
      const streak = readJson<StreakData>("soloLevelingStreak");
      const xpHistory = readJson<XPHistoryEntry[]>("soloLevelingXPHistory");
      const userSettings = readJson<UserSettings>("soloLevelingSettings");

      const challenges = readJson<unknown>("soloLevelingChallenges");
      const necroChallenge = readJson<unknown>("soloLevelingNecroChallenge");
      const claimedChallenges = readJson<Record<string, unknown>>("soloLevelingClaimedChallenges");
      const activeBoost = readJson<unknown>("soloLevelingActiveBoost");

      const lastReset = localStorage.getItem("soloLevelingLastReset");

      if (quests !== null) {
        await supabase.from('user_quests').upsert({
          user_id: user.id,
          quests: quests as unknown as Json,
          last_reset_date: lastReset || undefined,
        }, { onConflict: 'user_id' });
      }

      if (habits !== null) {
        await supabase.from('user_habits').upsert({
          user_id: user.id,
          habits: habits as unknown as Json,
        }, { onConflict: 'user_id' });
      }

      if (gates !== null) {
        await supabase.from('user_gates').upsert({
          user_id: user.id,
          gates: gates as unknown as Json,
        }, { onConflict: 'user_id' });
      }

      if (streak !== null) {
        await supabase.from('user_streaks').upsert({
          user_id: user.id,
          current_streak: streak.currentStreak,
          longest_streak: streak.longestStreak,
          last_completion_date: streak.lastCompletionDate,
          total_rewards: streak.totalRewards,
        }, { onConflict: 'user_id' });
      }

      // Challenges: update existing row only, and only for keys present.
      const challengesPayload: Record<string, unknown> = {};
      if (challenges !== null) challengesPayload.challenges = challenges as Json;
      if (necroChallenge !== null) challengesPayload.necro_challenge = necroChallenge as Json;
      if (claimedChallenges !== null) challengesPayload.claimed_challenges = claimedChallenges as unknown as Json;
      if (xpHistory !== null) challengesPayload.xp_history = xpHistory as unknown as Json;
      if (userSettings !== null) challengesPayload.user_settings = userSettings as unknown as Json;
      if (activeBoost !== null) challengesPayload.active_boost = activeBoost as Json;

      if (Object.keys(challengesPayload).length > 0) {
        const { data: existing, error: existingErr } = await supabase
          .from('user_challenges')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingErr && existing) {
          await supabase
            .from('user_challenges')
            .update(challengesPayload)
            .eq('user_id', user.id);
        }
      }

      setLastSyncTime(new Date());
      syncInProgressRef.current = false;
      return true;
    } catch (error) {
      console.error('Error syncing all data to cloud:', error);
      syncInProgressRef.current = false;
      return false;
    }
  };

  // Sync local stats to cloud
  const syncToCloud = useCallback(async (stats: PlayerStats) => {
    if (!user) return false;

    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          hunter_name: stats.name,
          avatar: stats.avatar || 'default',
          title: stats.title || 'Awakened Hunter',
        })
        .eq('user_id', user.id);

      // Update stats
      await supabase
        .from('player_stats')
        .update({
          level: stats.level,
          total_xp: stats.totalXP,
          rank: stats.rank,
          strength: stats.strength,
          agility: stats.agility,
          intelligence: stats.intelligence,
          vitality: stats.vitality,
          sense: stats.sense,
          available_points: stats.availablePoints,
          gold: stats.gold,
          gems: stats.gems,
          credits: stats.credits,
          selected_card_frame: stats.selectedCardFrame || 'default',
          unlocked_card_frames: stats.unlockedCardFrames || ['default'],
          unlocked_classes: stats.unlockedClasses || [],
        })
        .eq('user_id', user.id);

      // Also sync all other data
      await syncAllDataToCloud();

      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    }
  }, [user]);

  // Sync specific data types
  const syncQuests = useCallback(async (quests: DailyQuest[]) => {
    if (!user) return false;
    try {
      await supabase.from('user_quests').upsert({
        user_id: user.id,
        quests: quests as unknown as Json,
        last_reset_date: storage.getLastReset() || new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id' });
      return true;
    } catch (error) {
      console.error('Error syncing quests:', error);
      return false;
    }
  }, [user]);

  const syncHabits = useCallback(async (habits: Habit[]) => {
    if (!user) return false;
    try {
      await supabase.from('user_habits').upsert({
        user_id: user.id,
        habits: habits as unknown as Json,
      }, { onConflict: 'user_id' });
      return true;
    } catch (error) {
      console.error('Error syncing habits:', error);
      return false;
    }
  }, [user]);

  const syncGates = useCallback(async (gates: Gate[]) => {
    if (!user) return false;
    try {
      await supabase.from('user_gates').upsert({
        user_id: user.id,
        gates: gates as unknown as Json,
      }, { onConflict: 'user_id' });
      return true;
    } catch (error) {
      console.error('Error syncing gates:', error);
      return false;
    }
  }, [user]);

  const syncStreak = useCallback(async (streak: StreakData) => {
    if (!user) return false;
    try {
      await supabase.from('user_streaks').upsert({
        user_id: user.id,
        current_streak: streak.currentStreak,
        longest_streak: streak.longestStreak,
        last_completion_date: streak.lastCompletionDate,
        total_rewards: streak.totalRewards,
      }, { onConflict: 'user_id' });
      return true;
    } catch (error) {
      console.error('Error syncing streak:', error);
      return false;
    }
  }, [user]);

  // Update privacy setting
  const setProfilePublic = async (isPublic: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: isPublic })
        .eq('user_id', user.id);

      if (error) throw error;

      setCloudProfile(prev => prev ? { ...prev, is_public: isPublic } : null);
      
      toast({
        title: isPublic ? "Profile Public" : "Profile Private",
        description: isPublic 
          ? "Other hunters can now see your profile on leaderboards."
          : "Your profile is now hidden from leaderboards.",
      });

      return true;
    } catch (error) {
      console.error('Error updating privacy:', error);
      return false;
    }
  };

  return {
    syncing,
    cloudProfile,
    cloudStats,
    lastSyncTime,
    fetchCloudData,
    migrateLocalToCloud,
    syncToCloud,
    syncCloudToLocal,
    syncAllDataToCloud,
    syncQuests,
    syncHabits,
    syncGates,
    syncStreak,
    setProfilePublic,
  };
};
