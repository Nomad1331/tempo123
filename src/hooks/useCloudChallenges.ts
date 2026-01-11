import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { XPHistoryEntry, UserSettings } from '@/lib/storage';
import { Json } from '@/integrations/supabase/types';

interface ChallengeData {
  challenges: any[];
  necroChallenge: any | null;
  claimedChallenges: Record<string, boolean>;
  xpHistory: XPHistoryEntry[];
  userSettings: UserSettings;
  activeBoost: any | null;
}

const DEFAULT_DATA: ChallengeData = {
  challenges: [],
  necroChallenge: null,
  claimedChallenges: {},
  xpHistory: [],
  userSettings: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  activeBoost: null,
};

export const useCloudChallenges = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ChallengeData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Refs to prevent race conditions
  const isInitializing = useRef(false);
  const localUpdatePending = useRef(false);

  // Save challenges to cloud
  const saveChallenges = useCallback(async (newData: ChallengeData) => {
    if (!user) return false;

    try {
      localUpdatePending.current = true;
      
      const { error } = await supabase
        .from('user_challenges')
        .upsert({
          user_id: user.id,
          challenges: newData.challenges as unknown as Json,
          necro_challenge: newData.necroChallenge as unknown as Json,
          claimed_challenges: newData.claimedChallenges as unknown as Json,
          xp_history: newData.xpHistory as unknown as Json,
          user_settings: newData.userSettings as unknown as Json,
          active_boost: newData.activeBoost as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setTimeout(() => {
        localUpdatePending.current = false;
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error saving challenges:', error);
      localUpdatePending.current = false;
      return false;
    }
  }, [user]);

  // Fetch challenges from cloud
  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setData(DEFAULT_DATA);
      setLoading(false);
      return;
    }

    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const { data: cloudData, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (cloudData) {
        setData({
          challenges: (cloudData.challenges as unknown as any[]) || [],
          necroChallenge: cloudData.necro_challenge as unknown as any | null,
          claimedChallenges: (cloudData.claimed_challenges as unknown as Record<string, boolean>) || {},
          xpHistory: (cloudData.xp_history as unknown as XPHistoryEntry[]) || [],
          userSettings: (cloudData.user_settings as unknown as UserSettings) || DEFAULT_DATA.userSettings,
          activeBoost: cloudData.active_boost as unknown as any | null,
        });
      } else {
        setData(DEFAULT_DATA);
        await saveChallenges(DEFAULT_DATA);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  }, [user, saveChallenges]);

  // Update all data
  const updateData = useCallback(async (newData: Partial<ChallengeData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    await saveChallenges(updated);
  }, [data, saveChallenges]);

  // Update challenges
  const updateChallenges = useCallback(async (challenges: any[]) => {
    await updateData({ challenges });
  }, [updateData]);

  // Update necro challenge
  const updateNecroChallenge = useCallback(async (necroChallenge: any | null) => {
    await updateData({ necroChallenge });
  }, [updateData]);

  // Claim a challenge
  const claimChallenge = useCallback(async (challengeId: string) => {
    const newClaimed = { ...data.claimedChallenges, [challengeId]: true };
    await updateData({ claimedChallenges: newClaimed });
  }, [data.claimedChallenges, updateData]);

  // Add XP history entry
  const addXPHistoryEntry = useCallback(async (entry: Omit<XPHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: XPHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newEntry, ...data.xpHistory].slice(0, 100);
    await updateData({ xpHistory: updatedHistory });
    return newEntry;
  }, [data.xpHistory, updateData]);

  // Update user settings
  const updateSettings = useCallback(async (settings: UserSettings) => {
    await updateData({ userSettings: settings });
  }, [updateData]);

  // Update active boost
  const updateActiveBoost = useCallback(async (boost: any | null) => {
    await updateData({ activeBoost: boost });
  }, [updateData]);

  // Get settings (for timezone)
  const getSettings = useCallback(() => data.userSettings, [data.userSettings]);

  // Initial fetch
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Real-time subscription for instant sync across devices
  useEffect(() => {
    if (!user) return;

    const channelName = `user_challenges_${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenges',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (localUpdatePending.current) {
            console.log('Ignoring realtime update - local update pending');
            return;
          }
          
          console.log('Challenges updated from another device:', payload);
          if (payload.new) {
            const p = payload.new as any;
            setData({
              challenges: (p.challenges as unknown as any[]) || [],
              necroChallenge: p.necro_challenge as unknown as any | null,
              claimedChallenges: (p.claimed_challenges as unknown as Record<string, boolean>) || {},
              xpHistory: (p.xp_history as unknown as XPHistoryEntry[]) || [],
              userSettings: (p.user_settings as unknown as UserSettings) || DEFAULT_DATA.userSettings,
              activeBoost: p.active_boost as unknown as any | null,
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
    ...data,
    loading,
    initialized,
    fetchChallenges,
    updateChallenges,
    updateNecroChallenge,
    claimChallenge,
    addXPHistoryEntry,
    updateSettings,
    updateActiveBoost,
    getSettings,
  };
};
