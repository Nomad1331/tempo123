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
import { ShareableStatsCard } from "@/components/ShareableStatsCard";
import { AchievementsShowcaseCard } from "@/components/AchievementsShowcaseCard";
import { Plus, Heart, Crown, Loader2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LevelUpAnimation } from "@/components/LevelUpAnimation";
import { onLevelUp } from "@/hooks/usePlayerStats";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";

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
  
  const xpForNextLevel = getXPForNextLevel();
  const currentLevelXP = getCurrentLevelXP();

  useEffect(() => {
    // First-time setup only needed if not logged in
    if (!authLoading && !user && stats.isFirstTime) {
      setShowFirstTimeSetup(true);
    }
  }, [stats.isFirstTime, user, authLoading]);

  const handleFirstTimeComplete = (name: string, avatar: string, title: string) => {
    setShowFirstTimeSetup(false);
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const statsList = [
    { name: "Strength", key: "strength" as const, value: stats.strength, color: "text-red-400" },
    { name: "Agility", key: "agility" as const, value: stats.agility, color: "text-green-400" },
    { name: "Intelligence", key: "intelligence" as const, value: stats.intelligence, color: "text-blue-400" },
    { name: "Vitality", key: "vitality" as const, value: stats.vitality, color: "text-yellow-400" },
    { name: "Sense", key: "sense" as const, value: stats.sense, color: "text-purple-400" },
  ];

  // Show loading spinner while auth state is being determined
  const [dataTimeout, setDataTimeout] = useState(false);

useEffect(() => {
  // Set a 10-second timeout
  const timer = setTimeout(() => {
    if (authLoading) {
      console.error('Data authLoading timeout - forcing render');
      setDataTimeout(true);
    }
  }, 10000);

  return () => clearTimeout(timer);
}, [authLoading]);

if ((authLoading || !user) && !dataTimeout) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-400">Loading your hunter data...</p>
        <p className="text-xs text-slate-500 mt-2">This is taking longer than usual...</p>
      </div>
    </div>
  );
}

// If timeout reached but still no data, show error
if (dataTimeout && !user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400">⚠️ Failed to load hunter data</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded"
        >
          Retry
        </button>
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
      
      {/* Show tutorial after first-time setup */}
      <TutorialModal open={showTutorial} onComplete={handleTutorialComplete} />

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
