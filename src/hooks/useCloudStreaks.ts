import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StreakData } from '@/lib/storage';

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  totalRewards: 0,
};

export const useCloudStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Refs to prevent race conditions
  const isInitializing = useRef(false);
  const localUpdatePending = useRef(false);

  // Save streak to cloud
  const saveStreak = useCallback(async (newStreak: StreakData) => {
    if (!user) return false;

    try {
      localUpdatePending.current = true;
      
      const { error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          current_streak: newStreak.currentStreak,
          longest_streak: newStreak.longestStreak,
          last_completion_date: newStreak.lastCompletionDate,
          total_rewards: newStreak.totalRewards,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setTimeout(() => {
        localUpdatePending.current = false;
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error saving streak:', error);
      localUpdatePending.current = false;
      return false;
    }
  }, [user]);

  // Fetch streak from cloud
  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(DEFAULT_STREAK);
      setLoading(false);
      return;
    }

    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          lastCompletionDate: data.last_completion_date,
          totalRewards: data.total_rewards,
        });
      } else {
        setStreak(DEFAULT_STREAK);
        await saveStreak(DEFAULT_STREAK);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setStreak(DEFAULT_STREAK);
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  }, [user, saveStreak]);

  // Update streak (local state + cloud)
  const updateStreak = useCallback(async (newStreak: StreakData) => {
    setStreak(newStreak);
    await saveStreak(newStreak);
  }, [saveStreak]);

  // Check and update streak when all quests complete
  const checkStreakUpdate = useCallback(async (allQuestsComplete: boolean) => {
    if (!allQuestsComplete) return null;

    const today = new Date().toISOString().split('T')[0];
    
    if (streak.lastCompletionDate === today) {
      return null; // Already updated today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreakCount = streak.lastCompletionDate === yesterdayStr 
      ? streak.currentStreak + 1 
      : 1;

    const streakReward = Math.floor(newStreakCount / 7) * 100;
    const isNewRecord = newStreakCount > streak.longestStreak;

    const newStreak: StreakData = {
      currentStreak: newStreakCount,
      longestStreak: Math.max(newStreakCount, streak.longestStreak),
      lastCompletionDate: today,
      totalRewards: streak.totalRewards + streakReward,
    };

    await updateStreak(newStreak);

    return { newStreakCount, streakReward, isNewRecord };
  }, [streak, updateStreak]);

  // Reset streak (when quests not completed)
  const resetStreak = useCallback(async () => {
    const newStreak: StreakData = {
      ...streak,
      currentStreak: 0,
    };
    await updateStreak(newStreak);
  }, [streak, updateStreak]);

  // Initial fetch
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Real-time subscription for instant sync across devices
  useEffect(() => {
    if (!user) return;

    const channelName = `user_streaks_${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (localUpdatePending.current) {
            console.log('Ignoring realtime update - local update pending');
            return;
          }
          
          console.log('Streak updated from another device:', payload);
          if (payload.new) {
            const p = payload.new as any;
            setStreak({
              currentStreak: p.current_streak,
              longestStreak: p.longest_streak,
              lastCompletionDate: p.last_completion_date,
              totalRewards: p.total_rewards,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    streak,
    loading,
    initialized,
    fetchStreak,
    updateStreak,
    checkStreakUpdate,
    resetStreak,
  };
};
