import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, MessageCircle, Zap, Bot, Bell, Shield, ExternalLink } from "lucide-react";

const DISCORD_INVITE_URL = "https://discord.gg/8geBVTC4";

const Discord = () => {
  const handleJoin = () => {
    window.open(DISCORD_INVITE_URL, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/30 shadow-[0_0_30px_rgba(88,101,242,0.3)]">
            <svg className="w-16 h-16 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold font-cinzel bg-gradient-to-r from-[#5865F2] via-primary to-[#5865F2] bg-clip-text text-transparent mb-3">
          HUNTERS GUILD
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join our official Discord server to connect with fellow hunters, get support, and participate in exclusive events!
        </p>
      </div>

      {/* Join Button */}
      <div className="flex justify-center mb-10">
        <Button 
          size="lg" 
          onClick={handleJoin}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2 px-8 py-6 text-lg shadow-[0_0_20px_rgba(88,101,242,0.4)]"
        >
          <ExternalLink className="w-5 h-5" />
          Join Discord Server
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="p-6 bg-card border-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#5865F2]/10">
              <Users className="w-6 h-6 text-[#5865F2]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Community & Support</h3>
              <p className="text-muted-foreground">
                Get help from fellow hunters, share your progress, ask questions, and connect with the community.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-yellow-500/20 hover:border-yellow-500/40 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Exclusive Events</h3>
              <p className="text-muted-foreground">
                Participate in guild challenges, competitions, and special events with unique rewards.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-primary/20 hover:border-primary/40 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Discord Bot Integration</h3>
              <p className="text-muted-foreground">
                Check your stats, complete quests, and sync with the app using our powerful Discord bot.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Bell className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Latest Updates</h3>
              <p className="text-muted-foreground">
                Be the first to know about new features, announcements, and changelogs.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bot Commands Preview */}
      <Card className="p-6 bg-card border-primary/20 mb-10">
        <h2 className="text-xl font-bold text-primary mb-4 font-cinzel">Bot Commands</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-background/50 p-3 rounded-lg border border-border">
            <code className="text-primary">!xp</code>
            <p className="text-sm text-muted-foreground mt-1">View your rank card with level and XP progress</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-border">
            <code className="text-primary">!stats</code>
            <p className="text-sm text-muted-foreground mt-1">Check your detailed stats (STR, AGI, INT, etc.)</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-border">
            <code className="text-primary">!leaderboard</code>
            <p className="text-sm text-muted-foreground mt-1">View the weekly XP leaderboard</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-border">
            <code className="text-primary">!link</code>
            <p className="text-sm text-muted-foreground mt-1">Link your Discord account to the web app</p>
          </div>
        </div>
      </Card>

      {/* Link Account Section */}
      <Card className="p-6 bg-gradient-to-r from-[#5865F2]/10 to-primary/10 border-[#5865F2]/30">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">Link Your Account</h2>
            <p className="text-muted-foreground">
              To use the Discord bot with your web app data, make sure to link your Discord account. 
              You can do this from the user menu (click your avatar in the top right) or by using the <code className="text-primary">!link</code> command in Discord.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleJoin}
            className="border-[#5865F2]/50 hover:bg-[#5865F2]/10 whitespace-nowrap"
          >
            Join & Link
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Discord;
