import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SupporterBenefits, 
  getSupporterBenefits, 
  setSupporterBenefits,
  SupporterTier,
  getUnlockedFramesForTier,
  SUPPORTER_FRAME_TIERS
} from '@/lib/supporters';
import { toast } from '@/hooks/use-toast';
import { playSuccess, playError } from '@/lib/sounds';

export const useCodeRedemption = () => {
  const [loading, setLoading] = useState(false);
  const [benefits, setBenefits] = useState<SupporterBenefits>(() => getSupporterBenefits());
  const { user } = useAuth();

  const redeemCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a redemption code.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setLoading(true);

      // Fetch the redemption code from database
      const { data: codeData, error: codeError } = await supabase
        .from('redemption_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (codeError) {
        throw codeError;
      }

      if (!codeData) {
        playError();
        toast({
          title: 'Invalid Code',
          description: 'This code is invalid or has already been used.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if code has reached max uses
      if (codeData.current_uses >= codeData.max_uses) {
        playError();
        toast({
          title: 'Code Exhausted',
          description: 'This code has reached its maximum number of uses.',
          variant: 'destructive',
        });
        return false;
      }

      // Check expiration
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        playError();
        toast({
          title: 'Code Expired',
          description: 'This code has expired.',
          variant: 'destructive',
        });
        return false;
      }

      // Fetch supporter info if linked
      let hunterName: string | null = null;
      if (codeData.supporter_id) {
        const { data: supporterData } = await supabase
          .from('supporters')
          .select('hunter_name')
          .eq('id', codeData.supporter_id)
          .maybeSingle();
        
        hunterName = supporterData?.hunter_name || null;
      }

      // Increment usage count
      await supabase
        .from('redemption_codes')
        .update({ current_uses: codeData.current_uses + 1 })
        .eq('id', codeData.id);

      // Get all frames unlocked based on tier (tier-based cascading unlock)
      const tier = codeData.tier as SupporterTier;
      const unlockedFrames = getUnlockedFramesForTier(tier);
      
      // Store benefits locally
      const newBenefits: SupporterBenefits = {
        tier,
        badge: codeData.unlocks_badge,
        frame: codeData.unlocks_frame,
        unlockedFrames,
        title: codeData.unlocks_title,
        hunterName,
        redeemedAt: new Date().toISOString(),
      };

      setSupporterBenefits(newBenefits);
      setBenefits(newBenefits);

      // Sync to cloud player_stats so frames persist across devices
      if (user) {
        try {
          // Get current cloud frames
          const { data: statsData } = await supabase
            .from('player_stats')
            .select('unlocked_card_frames')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const currentCloudFrames = statsData?.unlocked_card_frames || ['default'];
          
          // Merge supporter frames with existing frames
          const mergedFrames = [...new Set([...currentCloudFrames, ...unlockedFrames])];
          
          // Update cloud
          await supabase
            .from('player_stats')
            .update({ unlocked_card_frames: mergedFrames })
            .eq('user_id', user.id);
        } catch (syncError) {
          console.error('Error syncing supporter frames to cloud:', syncError);
        }
      }

      playSuccess();
      toast({
        title: '🎉 Code Redeemed!',
        description: `Welcome, ${hunterName || 'Hunter'}! Your supporter benefits have been unlocked.`,
      });

      return true;
    } catch (err) {
      console.error('Error redeeming code:', err);
      playError();
      toast({
        title: 'Redemption Failed',
        description: 'An error occurred while redeeming your code. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshBenefits = () => {
    setBenefits(getSupporterBenefits());
  };

  return {
    benefits,
    loading,
    redeemCode,
    refreshBenefits,
    isSupporter: benefits.tier !== null,
  };
};
