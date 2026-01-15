import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Users, Trophy, MessageCircle, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DISCORD_INVITE_URL = "https://discord.gg/8geBVTC4";
const DISCORD_SEEN_KEY = "solo-leveling-discord-invite-seen";

interface DiscordInviteModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const DiscordInviteModal = ({ forceShow, onClose }: DiscordInviteModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setOpen(true);
      return;
    }

    // Only show for authenticated users
    if (!user) return;

    // Check if already seen
    const seen = localStorage.getItem(DISCORD_SEEN_KEY);
    if (!seen) {
      // Delay slightly to not conflict with tutorial
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, forceShow]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(DISCORD_SEEN_KEY, "true");
    onClose?.();
  };

  const handleJoin = () => {
    window.open(DISCORD_INVITE_URL, "_blank");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-[#5865F2]/30 p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header with Discord branding */}
        <div className="relative pt-10 pb-6 px-6 bg-gradient-to-b from-[#5865F2]/20 to-transparent">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30">
              <svg className="w-12 h-12 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center font-cinzel bg-gradient-to-r from-[#5865F2] via-primary to-[#5865F2] bg-clip-text text-transparent">
            JOIN THE HUNTERS GUILD
          </h2>
          <p className="text-center text-muted-foreground text-sm mt-2">
            Connect with fellow hunters on Discord!
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <Users className="w-5 h-5 text-[#5865F2] mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Community & Support</p>
              <p className="text-sm text-muted-foreground">Get help, share progress, and connect with other hunters</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <Trophy className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Exclusive Events</p>
              <p className="text-sm text-muted-foreground">Participate in guild challenges and competitions</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Discord Bot Integration</p>
              <p className="text-sm text-muted-foreground">Check your stats, complete quests, and sync with the app</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
            <MessageCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Latest Updates</p>
              <p className="text-sm text-muted-foreground">Be the first to know about new features and announcements</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-border"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleJoin}
            className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            Join Discord
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
