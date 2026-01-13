import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerStats } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

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

export const useCloudSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<CloudProfile | null>(null);
  const [cloudStats, setCloudStats] = useState<CloudPlayerStats | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Fetch cloud data when user logs in
  useEffect(() => {
    if (user) {
      fetchCloudData();
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

  // Set profile public/private
  const setProfilePublic = useCallback(async (isPublic: boolean) => {
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
          ? "Other hunters can now see your profile on the leaderboard"
          : "Your profile is now hidden from the leaderboard",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update profile visibility",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Sync stats to cloud (used by other hooks)
  const syncToCloud = useCallback(async (stats: PlayerStats) => {
    if (!user) return false;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          hunter_name: stats.name,
          avatar: stats.avatar || 'default',
          title: stats.title || 'Awakened Hunter',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update player_stats
      const { error: statsError } = await supabase
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
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      setLastSyncTime(new Date());
      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    }
  }, [user]);

  return {
    syncing,
    cloudProfile,
    cloudStats,
    lastSyncTime,
    fetchCloudData,
    setProfilePublic,
    syncToCloud,
  };
};
