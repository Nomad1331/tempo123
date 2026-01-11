import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gate } from '@/lib/storage';
import { Json } from '@/integrations/supabase/types';

const DEFAULT_GATES: Gate[] = [
  {
    id: "1", name: "Goblin Cave", rank: "E-Rank",
    description: "A beginner's trial. Face the Goblin Chieftain.",
    loreText: "Even E-Rank gates can be deadly for the unprepared.",
    dailyChallenge: "Complete all daily quests",
    requiredDays: 7, requiredHabits: 0, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "active",
    rewards: { xp: 500, gold: 100, title: "Goblin Slayer" },
    unlockRequirement: { level: 1 },
  },
  {
    id: "2", name: "Shadow Dungeon", rank: "D-Rank",
    description: "Darkness awaits. Defeat the Shadow Beast.",
    loreText: "The System has detected a D-Rank gate.",
    dailyChallenge: "Complete all quests + 1 habit daily",
    requiredDays: 7, requiredHabits: 1, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "locked",
    rewards: { xp: 800, gold: 200, title: "Shadow Walker" },
    unlockRequirement: { level: 6 },
  },
  {
    id: "3", name: "Temple of Chaos", rank: "C-Rank",
    description: "Ancient evil stirs. Challenge the Chaos Knight.",
    loreText: "⚠️ WARNING: C-Rank threat detected.",
    dailyChallenge: "Complete all quests + 2 habits daily for 10 days",
    requiredDays: 10, requiredHabits: 2, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "locked",
    rewards: { xp: 1500, gold: 400, title: "Chaos Breaker" },
    unlockRequirement: { level: 10 },
  },
  {
    id: "4", name: "Frozen Citadel", rank: "B-Rank",
    description: "Eternal winter reigns. Face the Ice Monarch.",
    loreText: "⚠️⚠️ SYSTEM ALERT: B-Rank gate emergence.",
    dailyChallenge: "Complete all quests + 3 habits daily for 10 days",
    requiredDays: 10, requiredHabits: 3, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "locked",
    rewards: { xp: 3000, gold: 800, title: "Frostborn" },
    unlockRequirement: { level: 25 },
  },
  {
    id: "5", name: "Dragon's Lair", rank: "A-Rank",
    description: "The apex predator awakens. Challenge the Red Dragon.",
    loreText: "🔥 EMERGENCY ALERT: A-Rank Dragon Gate.",
    dailyChallenge: "Complete all quests + 4 habits daily for 12 days",
    requiredDays: 12, requiredHabits: 4, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "locked",
    rewards: { xp: 5000, gold: 1500, title: "Dragonslayer" },
    unlockRequirement: { level: 50 },
  },
  {
    id: "6", name: "Monarch's Domain", rank: "S-Rank",
    description: "The final trial. Confront the Shadow Monarch.",
    loreText: "⚫ NATIONAL EMERGENCY: S-Rank Gate.",
    dailyChallenge: "Complete all quests + 5 habits daily for 14 days",
    requiredDays: 14, requiredHabits: 5, progress: {}, losses: 0,
    startDate: null, endDate: null, status: "locked",
    rewards: { xp: 10000, gold: 5000, title: "Shadow Monarch" },
    unlockRequirement: { level: 100 },
  },
];

export const useCloudGates = () => {
  const { user } = useAuth();
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Refs to prevent race conditions
  const isInitializing = useRef(false);
  const localUpdatePending = useRef(false);

  // Save gates to cloud
  const saveGates = useCallback(async (newGates: Gate[]) => {
    if (!user) return false;

    try {
      localUpdatePending.current = true;
      
      const { error } = await supabase
        .from('user_gates')
        .upsert({
          user_id: user.id,
          gates: newGates as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setTimeout(() => {
        localUpdatePending.current = false;
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error saving gates:', error);
      localUpdatePending.current = false;
      return false;
    }
  }, [user]);

  // Fetch gates from cloud
  const fetchGates = useCallback(async () => {
    if (!user) {
      setGates([]);
      setLoading(false);
      return;
    }

    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const { data, error } = await supabase
        .from('user_gates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Data exists - use it directly (don't check length, trust the data)
        const cloudGates = (data.gates as unknown as Gate[]) || [];
        setGates(cloudGates);
      } else {
        // New user - initialize with defaults
        console.log('New user detected, initializing with default gates');
        setGates(DEFAULT_GATES);
        await saveGates(DEFAULT_GATES);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching gates:', error);
      setGates([]);
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  }, [user, saveGates]);

  // Update gates (local state + cloud)
  const updateGates = useCallback(async (newGates: Gate[]) => {
    setGates(newGates);
    await saveGates(newGates);
  }, [saveGates]);

  // Unlock gates based on level
  const checkUnlocks = useCallback(async (level: number) => {
    const newGates = gates.map(gate => {
      if (gate.status === "locked" && gate.unlockRequirement.level) {
        if (level >= gate.unlockRequirement.level) {
          return { ...gate, status: "active" as const };
        }
      }
      return gate;
    });
    
    const changed = newGates.some((g, i) => g.status !== gates[i].status);
    if (changed) {
      await updateGates(newGates);
    }
  }, [gates, updateGates]);

  // Enter a gate
  const enterGate = useCallback(async (gateId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const newGates = gates.map(g =>
      g.id === gateId ? { ...g, startDate: today, endDate: null, progress: { [today]: false } } : g
    );
    await updateGates(newGates);
  }, [gates, updateGates]);

  // Mark day complete
  const markDayComplete = useCallback(async (gateId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const gate = gates.find(g => g.id === gateId);
    if (!gate || gate.progress[today] === true) return null;

    const newProgress = { ...gate.progress, [today]: true };
    const completedDays = Object.values(newProgress).filter(Boolean).length;
    
    const newGates = gates.map(g =>
      g.id === gateId ? { ...g, progress: newProgress } : g
    );
    await updateGates(newGates);

    return { completedDays, requiredDays: gate.requiredDays };
  }, [gates, updateGates]);

  // Complete a gate
  const completeGate = useCallback(async (gateId: string) => {
    const newGates = gates.map(g =>
      g.id === gateId ? { ...g, status: "completed" as const, endDate: new Date().toISOString().split("T")[0] } : g
    );
    await updateGates(newGates);
    return gates.find(g => g.id === gateId);
  }, [gates, updateGates]);

  // Fail a gate
  const failGate = useCallback(async (gateId: string) => {
    const newGates = gates.map(g =>
      g.id === gateId ? { 
        ...g, 
        status: "failed" as const, 
        losses: g.losses + 1, 
        endDate: new Date().toISOString().split("T")[0],
        progress: {} 
      } : g
    );
    await updateGates(newGates);
    return gates.find(g => g.id === gateId);
  }, [gates, updateGates]);

  // Rechallenge a gate
  const rechallengeGate = useCallback(async (gateId: string) => {
    const newGates = gates.map(g =>
      g.id === gateId ? { ...g, status: "active" as const, startDate: null, endDate: null, progress: {} } : g
    );
    await updateGates(newGates);
  }, [gates, updateGates]);

  // Initial fetch
  useEffect(() => {
    fetchGates();
  }, [fetchGates]);

  // Real-time subscription for instant sync across devices
  useEffect(() => {
    if (!user) return;

    const channelName = `user_gates_${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gates',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (localUpdatePending.current) {
            console.log('Ignoring realtime update - local update pending');
            return;
          }
          
          console.log('Gates updated from another device:', payload);
          if (payload.new && 'gates' in payload.new) {
            const cloudGates = (payload.new.gates as unknown as Gate[]) || [];
            setGates(cloudGates);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    gates,
    loading,
    initialized,
    fetchGates,
    updateGates,
    checkUnlocks,
    enterGate,
    markDayComplete,
    completeGate,
    failGate,
    rechallengeGate,
  };
};
