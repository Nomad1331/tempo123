import { useState, useEffect } from "react";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { StatsRadar } from "@/components/StatsRadar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import XPHistoryPanel from "@/components/XPHistoryPanel";
import { FirstTimeSetup } from "@/components/FirstTimeSetup";
import { TutorialModal } from "@/components/TutorialModal";
import { DiscordInviteModal } from "@/components/DiscordInviteModal";
import { ShareableStatsCard } from "@/components/ShareableStatsCard";
import { AchievementsShowcaseCard } from "@/components/AchievementsShowcaseCard";
import { Plus, Heart, Crown, Loader2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LevelUpAnimation } from "@/components/LevelUpAnimation";
import { onLevelUp } from "@/hooks/usePlayerStats";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";

const TUTORIAL_SEEN_KEY = "solo-leveling-tutorial-seen";
const DISCORD_SEEN_KEY = "solo-leveling-discord-invite-seen";

const Awakening = () => {
  const { stats, allocateStat, getTotalPower, getXPForNextLevel, getCurrentLevelXP } = usePlayerStats();
  const { unlockedAchievements } = useAchievements();
  const { user, loading: authLoading } = useAuth();
  const { streak } = useCloudStreaks();
  const navigate = useNavigate();
  const [levelUpData, setLevelUpData] = useState<{ level: number; points: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onLevelUp((level, points) => {
      setLevelUpData({ level, points });
    });
    return unsubscribe;
  }, []);
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDiscordInvite, setShowDiscordInvite] = useState(false);
  
  const xpForNextLevel = getXPForNextLevel();
  const currentLevelXP = getCurrentLevelXP();

  useEffect(() => {
    // First-time setup only needed if not logged in (legacy non-cloud users)
    if (!authLoading && !user && stats.isFirstTime) {
      setShowFirstTimeSetup(true);
      return;
    }
    
    // For logged in users, check if tutorial has been seen
    if (!authLoading && user) {
      const tutorialSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);
      const discordSeen = localStorage.getItem(DISCORD_SEEN_KEY);
      
      if (!tutorialSeen) {
        // Show tutorial for new users (or users who haven't seen it)
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (!discordSeen) {
        // Tutorial seen but not discord invite - show discord invite once
        const timer = setTimeout(() => {
          setShowDiscordInvite(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [stats.isFirstTime, user, authLoading]);

  const handleFirstTimeComplete = (name: string, avatar: string, title: string) => {
    setShowFirstTimeSetup(false);
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    // Check if Discord invite has been seen
    const discordSeen = localStorage.getItem(DISCORD_SEEN_KEY);
    if (!discordSeen) {
      // Show Discord invite after tutorial completes
      setTimeout(() => setShowDiscordInvite(true), 500);
    }
  };

  const statsList = [
    { name: "Strength", key: "strength" as const, value: stats.strength, color: "text-red-400" },
    { name: "Agility", key: "agility" as const, value: stats.agility, color: "text-green-400" },
    { name: "Intelligence", key: "intelligence" as const, value: stats.intelligence, color: "text-blue-400" },
    { name: "Vitality", key: "vitality" as const, value: stats.vitality, color: "text-yellow-400" },
    { name: "Sense", key: "sense" as const, value: stats.sense, color: "text-purple-400" },
  ];

  // Show loading spinner only while checking auth - NOT while waiting for user
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show welcome/landing page instead of infinite loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Background effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-cinzel bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SOLO LEVELING SYSTEM
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Track your real-life quests, build habits, and level up as a Hunter
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-6">
              <div className="p-4 bg-card border border-primary/20 rounded-lg">
                <p className="text-3xl font-bold text-primary">⚔️</p>
                <p className="text-sm text-muted-foreground mt-2">Quests</p>
              </div>
              <div className="p-4 bg-card border border-secondary/20 rounded-lg">
                <p className="text-3xl font-bold text-secondary">🔥</p>
                <p className="text-sm text-muted-foreground mt-2">Habits</p>
              </div>
              <div className="p-4 bg-card border border-neon-orange/20 rounded-lg">
                <p className="text-3xl font-bold text-neon-orange">🚪</p>
                <p className="text-sm text-muted-foreground mt-2">Gates</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2"
              >
                Begin Your Awakening
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/faq')}
                className="border-primary/50 hover:bg-primary/10"
              >
                Learn More
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
              The System awaits your awakening, Hunter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Level Up Animation */}
      {levelUpData && (
        <LevelUpAnimation
          newLevel={levelUpData.level}
          pointsEarned={levelUpData.points}
          onComplete={() => setLevelUpData(null)}
        />
      )}

      {/* Show first-time setup if needed */}
      <FirstTimeSetup open={showFirstTimeSetup} onComplete={handleFirstTimeComplete} />
      
      {/* Show tutorial after first-time setup or for new users */}
      <TutorialModal open={showTutorial} onComplete={handleTutorialComplete} />
      
      {/* Show Discord invite after tutorial or for returning users who haven't seen it */}
      <DiscordInviteModal 
        open={showDiscordInvite} 
        onClose={() => setShowDiscordInvite(false)} 
      />

      <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="status">Awakening</TabsTrigger>
            <TabsTrigger value="history">XP History</TabsTrigger>
            <TabsTrigger value="card">Stats Card</TabsTrigger>
          </TabsList>

        <TabsContent value="status">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Flippable Profile/Achievements Card + Customize Button */}
            <div className="lg:col-span-2 space-y-4">
              <AchievementsShowcaseCard stats={stats} unlockedAchievements={unlockedAchievements} />
              
              {/* Streak Counter */}
              <Card className="p-4 bg-card border-orange-500/20 hover:border-orange-500/40 transition-all relative overflow-hidden">
                {streak.currentStreak >= 7 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-pulse" />
                )}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <Flame className={`w-8 h-8 ${streak.currentStreak >= 3 ? 'text-orange-400 animate-pulse' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-400">{streak.currentStreak} Days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Best</p>
                    <p className="text-lg font-bold text-secondary">{streak.longestStreak}</p>
                  </div>
                </div>
              </Card>
              
              {/* Customize Button */}
              <Button
                onClick={() => navigate("/customize")}
                variant="outline"
                className="w-full border-secondary/50 hover:bg-secondary/10"
              >
                Customize Profile
              </Button>
            </div>

            {/* Status Window */}
            <Card className="p-6 bg-card border-primary/20 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.2)]">
          <h2 className="text-3xl font-bold mb-6 text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
            STATUS WINDOW
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-2xl font-bold text-foreground">{stats.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-3xl font-bold text-primary">{stats.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-xl font-bold text-secondary">{stats.rank}</p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-muted-foreground">Power Level</p>
                <p className="text-2xl font-bold text-neon-orange">{getTotalPower()}</p>
              </div>
            </div>

            {/* XP Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm text-muted-foreground">Progress to Next Level</p>
                <p className="text-sm text-primary">
                  {currentLevelXP} / {xpForNextLevel} XP
                </p>
              </div>
              <Progress
                value={(currentLevelXP / xpForNextLevel) * 100}
                className="h-3 bg-muted"
                style={{
                  boxShadow: "0 0 10px hsl(var(--neon-cyan) / 0.3)",
                }}
              />
            </div>

            {/* Available Points */}
            {stats.availablePoints > 0 && (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-primary font-bold">
                  💎 {stats.availablePoints} Ability Points Available
                </p>
              </div>
            )}

            {/* Stats List */}
            <div className="space-y-3 mt-6">
              {statsList.map(({ name, key, value, color }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{name}</p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                  <Progress value={(value / 100) * 100} className="w-32 h-2 mx-4" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => allocateStat(key)}
                    disabled={stats.availablePoints === 0}
                    className="border-primary/50 hover:bg-primary/20 hover:border-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats Visualization */}
        <Card className="p-6 bg-card border-secondary/20 shadow-[0_0_30px_hsl(var(--neon-purple)/0.2)]">
          <h2 className="text-2xl font-bold mb-6 text-secondary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-purple) / 0.8)" }}>
            STATISTICS
          </h2>
          <StatsRadar
            strength={stats.strength}
            agility={stats.agility}
            intelligence={stats.intelligence}
            vitality={stats.vitality}
            sense={stats.sense}
          />
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-background/50 border border-border rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalXP.toLocaleString()} XP
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-background/50 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Gold</p>
                <p className="text-lg font-bold text-yellow-400">💰 {stats.gold}</p>
              </div>
              <div className="p-3 bg-background/50 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Gems</p>
                <p className="text-lg font-bold text-neon-purple">💎 {stats.gems}</p>
              </div>
              <div className="p-3 bg-background/50 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Credits</p>
                <p className="text-lg font-bold text-neon-cyan">🎫 {stats.credits}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-primary/50 hover:bg-primary/10"
              onClick={() => navigate("/rewards")}
            >
              🎁 Open Reward Centre
            </Button>

            <a
              href="https://ko-fi.com/nomad1331"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className="w-full gap-2 border-secondary/50 hover:bg-secondary/10 text-secondary hover:text-secondary"
              >
                <Heart className="w-4 h-4" />
                Support the Hunter
              </Button>
            </a>

            <Button 
              variant="outline" 
              className="w-full gap-2 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-400"
              onClick={() => navigate("/supporters")}
            >
              <Crown className="w-4 h-4" />
              Hall of Hunters
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            The System uses me, and I use The System
          </p>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <XPHistoryPanel />
        </TabsContent>

        <TabsContent value="card">
          <ShareableStatsCard stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Awakening;
