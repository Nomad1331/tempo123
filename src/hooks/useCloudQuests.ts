import { useState, useEffect, useCallback, useRef } from 'react';
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

type SaveOptions = {
  /** Allow saving an empty quest list (normally blocked as a safety guard against accidental wipes). */
  allowEmpty?: boolean;
  /** Allow saving before the hook has successfully initialized from cloud (used only for first-time user init). */
  allowBeforeInit?: boolean;
};

export const useCloudQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent race conditions
  const isInitializing = useRef(false);
  const localUpdatePending = useRef(false);

  // Safety ref: don't allow background effects to persist state until we've hydrated from cloud.
  const initializedRef = useRef(false);
  useEffect(() => {
    initializedRef.current = initialized;
  }, [initialized]);

  // IMPORTANT: keep reset dates timezone-consistent (avoid UTC date loops)
  const getTodayInTimezone = (timezone?: string) => {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  // Save quests to cloud
  const saveQuests = useCallback(
    async (
      newQuests: DailyQuest[],
      resetDate?: string,
      currentLastResetDate?: string | null,
      options: SaveOptions = {}
    ) => {
      if (!user) return false;

      // Prevent destructive overwrites:
      // - Don't persist anything until we've hydrated from cloud (except explicit first-time init)
      // - Don't write an empty list unless explicitly intended
      if (!options.allowBeforeInit && !initializedRef.current) {
        console.warn('Blocked quest save before initialization');
        return false;
      }
      if (!options.allowEmpty && newQuests.length === 0) {
        console.warn('Blocked saving empty quests array (safety guard)');
        return false;
      }

      try {
        localUpdatePending.current = true;

        const resolvedResetDate = resetDate || currentLastResetDate || getTodayInTimezone();

        const { error: upsertError } = await supabase.from('user_quests').upsert(
          {
            user_id: user.id,
            quests: newQuests as unknown as Json,
            last_reset_date: resolvedResetDate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (upsertError) throw upsertError;

        // Reset pending flag after a short delay to allow realtime to settle
        setTimeout(() => {
          localUpdatePending.current = false;
        }, 1000);

        return true;
      } catch (e) {
        console.error('Error saving quests:', e);
        localUpdatePending.current = false;
        return false;
      }
    },
    [user]
  );

  // Fetch quests from cloud
  const fetchQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      setLastResetDate(null);
      setError(null);
      setInitialized(false);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Data exists - use it directly, even if empty array
        const cloudQuests = (data.quests as unknown as DailyQuest[]) || [];
        setQuests(cloudQuests);
        setLastResetDate(data.last_reset_date);
      } else {
        // No data exists - this is a NEW user, initialize with defaults
        console.log('New user detected, initializing with default quests');
        const today = getTodayInTimezone();
        setQuests(DEFAULT_QUESTS);
        setLastResetDate(today);
        await saveQuests(DEFAULT_QUESTS, today, today, { allowBeforeInit: true });
      }

      setInitialized(true);
    } catch (e) {
      console.error('Error fetching quests:', e);
      setError('Failed to load quests from cloud');
      // IMPORTANT: do NOT clear quests here — clearing on transient failures can lead to accidental saves of empty arrays
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  }, [user, saveQuests]);

  // Update quests (local state + cloud)
  const updateQuests = useCallback(
    async (newQuests: DailyQuest[], options?: SaveOptions) => {
      setQuests(newQuests);
      await saveQuests(newQuests, undefined, lastResetDate, options);
    },
    [saveQuests, lastResetDate]
  );

  // Complete a quest
  const completeQuest = useCallback(
    async (questId: string) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest || quest.completed) return; // Prevent double completion

      const newQuests = quests.map((q) => (q.id === questId ? { ...q, completed: true } : q));
      await updateQuests(newQuests);
    },
    [quests, updateQuests]
  );

  // Add a new quest
  const addQuest = useCallback(
    async (quest: DailyQuest) => {
      const newQuests = [...quests, quest];
      await updateQuests(newQuests);
    },
    [quests, updateQuests]
  );

  // Update an existing quest
  const editQuest = useCallback(
    async (questId: string, updates: Partial<DailyQuest>) => {
      const newQuests = quests.map((q) => (q.id === questId ? { ...q, ...updates } : q));
      await updateQuests(newQuests);
    },
    [quests, updateQuests]
  );

  // Delete a quest
  const deleteQuest = useCallback(
    async (questId: string) => {
      const newQuests = quests.filter((q) => q.id !== questId);
      // If user deletes their last quest, that's an explicit empty-state; allow persisting [].
      await updateQuests(newQuests, { allowEmpty: true });
    },
    [quests, updateQuests]
  );

  // Reorder quests
  const reorderQuests = useCallback(async (newOrder: DailyQuest[]) => {
    await updateQuests(newOrder);
  }, [updateQuests]);

  // Reset all quests for new day
  const resetQuests = useCallback(
    async (timezone?: string) => {
      const today = getTodayInTimezone(timezone);
      const resetQuestsData = quests.map((q) => ({ ...q, completed: false }));

      setQuests(resetQuestsData);
      setLastResetDate(today);

      // If the user has 0 quests, we still want to advance last_reset_date so auto-reset doesn't loop forever.
      await saveQuests(resetQuestsData, today, today, { allowEmpty: true });
    },
    [quests, saveQuests]
  );

  // Check and auto-reset at midnight (in the user's timezone)
  const checkAutoReset = useCallback(
    async (timezone: string) => {
      // Never auto-reset until we have successfully hydrated from cloud.
      if (!initializedRef.current) return false;

      const todayInTimezone = getTodayInTimezone(timezone);

      if (!lastResetDate) return false;

      if (lastResetDate !== todayInTimezone) {
        await resetQuests(timezone);
        return true;
      }
      return false;
    },
    [lastResetDate, resetQuests]
  );

  // Initial fetch
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // Real-time subscription for instant sync across devices
  useEffect(() => {
    if (!user) return;

    // Use unique channel name per user to avoid conflicts
    const channelName = `user_quests_${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Ignore updates from our own recent saves to prevent loops
          if (localUpdatePending.current) {
            console.log('Ignoring realtime update - local update pending');
            return;
          }

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
    error,
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
