import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DailyQuest } from '@/lib/storage';
import { Json } from '@/integrations/supabase/types';

const DEFAULT_QUESTS: DailyQuest[] = [
  { id: "1", name: "Study Programming", xpReward: 50, statBoost: { stat: "intelligence", amount: 1 }, completed: false },
  { id: "2", name: "Workout", xpReward: 50, statBoost: { stat: "strength", amount: 1 }, completed: false },
  { id: "3", name: "Read 1 Page", xpReward: 30, statBoost: { stat: "intelligence", amount: 1 }, completed: false },
  { id: "4", name: "Meditation", xpReward: 40, statBoost: { stat: "sense", amount: 1 }, completed: false },
  { id: "5", name: "Learn JavaScript", xpReward: 60, statBoost: { stat: "intelligence", amount: 2 }, completed: false },
];

export const useCloudQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch quests from cloud
  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const cloudQuests = (data.quests as unknown as DailyQuest[]) || [];
        setQuests(cloudQuests.length > 0 ? cloudQuests : DEFAULT_QUESTS);
        setLastResetDate(data.last_reset_date);
      } else {
        // No data yet - initialize with defaults
        setQuests(DEFAULT_QUESTS);
        await saveQuests(DEFAULT_QUESTS);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching quests:', error);
      setQuests(DEFAULT_QUESTS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save quests to cloud
  const saveQuests = useCallback(async (newQuests: DailyQuest[], resetDate?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_quests')
        .upsert({
          user_id: user.id,
          quests: newQuests as unknown as Json,
          last_reset_date: resetDate || lastResetDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving quests:', error);
      return false;
    }
  }, [user, lastResetDate]);

  // Update quests (local state + cloud)
  const updateQuests = useCallback(async (newQuests: DailyQuest[]) => {
    setQuests(newQuests);
    await saveQuests(newQuests);
  }, [saveQuests]);

  // Complete a quest
  const completeQuest = useCallback(async (questId: string) => {
    const newQuests = quests.map(q => 
      q.id === questId ? { ...q, completed: true } : q
    );
    await updateQuests(newQuests);
  }, [quests, updateQuests]);

  // Add a new quest
  const addQuest = useCallback(async (quest: DailyQuest) => {
    const newQuests = [...quests, quest];
    await updateQuests(newQuests);
  }, [quests, updateQuests]);

  // Update an existing quest
  const editQuest = useCallback(async (questId: string, updates: Partial<DailyQuest>) => {
    const newQuests = quests.map(q => 
      q.id === questId ? { ...q, ...updates } : q
    );
    await updateQuests(newQuests);
  }, [quests, updateQuests]);

  // Delete a quest
  const deleteQuest = useCallback(async (questId: string) => {
    const newQuests = quests.filter(q => q.id !== questId);
    await updateQuests(newQuests);
  }, [quests, updateQuests]);

  // Reorder quests
  const reorderQuests = useCallback(async (newOrder: DailyQuest[]) => {
    await updateQuests(newOrder);
  }, [updateQuests]);

  // Reset all quests for new day
  const resetQuests = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const resetQuests = quests.map(q => ({ ...q, completed: false }));
    setQuests(resetQuests);
    setLastResetDate(today);
    await saveQuests(resetQuests, today);
  }, [quests, saveQuests]);

  // Check and auto-reset at midnight
  const checkAutoReset = useCallback(async (timezone: string) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: timezone, 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const todayInTimezone = formatter.format(now);
    
    if (lastResetDate !== todayInTimezone) {
      await resetQuests();
      return true;
    }
    return false;
  }, [lastResetDate, resetQuests]);

  // Initial fetch
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // Real-time subscription for instant sync across devices
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_quests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Quests updated from another device:', payload);
          if (payload.new && 'quests' in payload.new) {
            const cloudQuests = (payload.new.quests as unknown as DailyQuest[]) || [];
            setQuests(cloudQuests);
            if ('last_reset_date' in payload.new) {
              setLastResetDate(payload.new.last_reset_date as string);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    quests,
    loading,
    initialized,
    lastResetDate,
    fetchQuests,
    updateQuests,
    completeQuest,
    addQuest,
    editQuest,
    deleteQuest,
    reorderQuests,
    resetQuests,
    checkAutoReset,
  };
};
