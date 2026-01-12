import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { LegendaryChallenge } from "@/lib/challenges";
import { Skull, Crown } from "lucide-react";

export const NecromancerUnlockPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = usePlayerStats();
  const { necroChallenge } = useCloudChallenges();

  useEffect(() => {
    // Don't show on challenges page (quests page with challenges tab)
    if (location.pathname === "/quests") return;

    // Check if necromancer is already unlocked
    const isUnlocked = stats.unlockedClasses?.includes("necromancer") || false;
    if (isUnlocked) return;

    // Check if challenge is active and completed (90-day streak reached)
    if (!necroChallenge) return;
    
    // Only show if challenge was accepted (status is active or completed, not pending)
    if (necroChallenge.status === "pending") return;
    
    // Check if completed
    const isCompleted = necroChallenge.status === "completed" || 
      necroChallenge.requirement.current >= necroChallenge.requirement.target;

    if (isCompleted && !isUnlocked) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setShowPopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, stats.unlockedClasses, necroChallenge]);

  const handleGoToClaim = () => {
    setShowPopup(false);
    navigate("/quests");
  };

  const handleLater = () => {
    setShowPopup(false);
  };

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-950 via-background to-background border-2 border-purple-500/50 shadow-[0_0_50px_hsl(280_80%_40%/0.3)]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-purple-500/20 border-2 border-purple-500/50">
                <Skull className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-cinzel text-purple-400 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />
            LEGENDARY ACHIEVEMENT
            <Crown className="w-5 h-5" />
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p className="text-lg text-foreground font-semibold">
              You have completed a 90-day streak!
            </p>
            <p className="text-muted-foreground">
              The forbidden <span className="text-purple-400 font-bold">Necromancer</span> class awaits you. 
              Claim your reward in the Challenges section.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleGoToClaim}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white font-bold"
          >
            <Skull className="w-4 h-4 mr-2" />
            Claim Now
          </Button>
          <Button
            onClick={handleLater}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Remind Me Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
