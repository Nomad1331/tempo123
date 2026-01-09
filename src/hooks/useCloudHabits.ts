import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Habit } from '@/lib/storage';
import { Json } from '@/integrations/supabase/types';

export const useCloudHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch habits from cloud
  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const cloudHabits = (data.habits as unknown as Habit[]) || [];
        setHabits(cloudHabits);
      } else {
        // No data yet - initialize empty
        setHabits([]);
        await saveHabits([]);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save habits to cloud
  const saveHabits = useCallback(async (newHabits: Habit[]) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_habits')
        .upsert({
          user_id: user.id,
          habits: newHabits as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving habits:', error);
      return false;
    }
  }, [user]);

  // Update habits (local state + cloud)
  const updateHabits = useCallback(async (newHabits: Habit[]) => {
    setHabits(newHabits);
    await saveHabits(newHabits);
  }, [saveHabits]);

  // Create a new habit
  const createHabit = useCallback(async (habit: Habit) => {
    const newHabits = [...habits, habit];
    await updateHabits(newHabits);
  }, [habits, updateHabits]);

  // Toggle day completion
  const toggleDayCompletion = useCallback(async (habitId: string, date: string) => {
    const newHabits = habits.map(h => {
      if (h.id === habitId) {
        const newGrid = { ...h.completionGrid };
        newGrid[date] = !newGrid[date];
        return { ...h, completionGrid: newGrid };
      }
      return h;
    });
    await updateHabits(newHabits);
    return newHabits.find(h => h.id === habitId);
  }, [habits, updateHabits]);

  // Complete a habit (mark as won/lost)
  const completeHabit = useCallback(async (habitId: string, won: boolean) => {
    const newHabits = habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          status: won ? "won" : "lost",
          endDate: new Date().toISOString().split("T")[0],
        } as Habit;
      }
      return h;
    });
    await updateHabits(newHabits);
  }, [habits, updateHabits]);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId: string) => {
    const newHabits = habits.filter(h => h.id !== habitId);
    await updateHabits(newHabits);
  }, [habits, updateHabits]);

  // Finalize habits that have ended
  const finalizeHabits = useCallback(async () => {
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    let updated = false;
    const finalized: { habit: Habit; won: boolean }[] = [];

    const newHabits = habits.map(habit => {
      if (habit.status !== "active") return habit;

      const start = new Date(habit.startDate);
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + habit.goalDays - 1);
      endDate.setHours(23, 59, 59, 999);

      const completedDays = Object.values(habit.completionGrid).filter(Boolean).length;
      const hasCompletedAllDays = completedDays >= habit.goalDays;
      const hasPeriodFullyElapsed = now > endDate;

      if (hasCompletedAllDays) {
        updated = true;
        finalized.push({ habit, won: true });
        return { ...habit, status: "won" as const, endDate: nowStr };
      } else if (hasPeriodFullyElapsed) {
        const completionRate = completedDays / habit.goalDays;
        const won = completionRate >= 0.95;
        updated = true;
        finalized.push({ habit, won });
        return { ...habit, status: won ? "won" : "lost", endDate: nowStr } as Habit;
      }
      return habit;
    });

    if (updated) {
      await updateHabits(newHabits);
    }

    return finalized;
  }, [habits, updateHabits]);

  // Initial fetch
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    initialized,
    fetchHabits,
    updateHabits,
    createHabit,
    toggleDayCompletion,
    completeHabit,
    deleteHabit,
    finalizeHabits,
  };
};
