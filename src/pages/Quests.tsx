import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DailyQuest } from "@/lib/storage";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useCloudQuests } from "@/hooks/useCloudQuests";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Trophy, Target, Flame, Plus, Zap, Loader2 } from "lucide-react";
import { playSuccess } from "@/lib/sounds";
import { ChallengesPanel } from "@/components/ChallengesPanel";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableQuestCard } from "@/components/SortableQuestCard";

const Quests = () => {
  const { user } = useAuth();
  const { quests, loading, updateQuests, completeQuest: cloudCompleteQuest, addQuest, editQuest, deleteQuest: cloudDeleteQuest, reorderQuests, checkAutoReset } = useCloudQuests();
  const { streak, checkStreakUpdate } = useCloudStreaks();
  const { userSettings } = useCloudChallenges();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<DailyQuest | null>(null);
  const [questForm, setQuestForm] = useState({
    description: "",
    name: "",
    xpReward: 50,
    statBoost: { stat: "intelligence", amount: 1 }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = quests.findIndex((item) => item.id === active.id);
      const newIndex = quests.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(quests, oldIndex, newIndex);
      await reorderQuests(newOrder);
    }
  };

  // Auto-reset quests at midnight
  useEffect(() => {
    if (!user || loading) return;
    
    const timezone = userSettings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const checkReset = async () => {
      const wasReset = await checkAutoReset(timezone);
      if (wasReset) {
        toast({
          title: "🌅 New Day, New Quests!",
          description: "Daily quests have been reset automatically",
        });
      }
    };
    
    checkReset();
    
    // Check every minute
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [user, loading, checkAutoReset, userSettings]);

  // Check streak when all quests complete
  useEffect(() => {
    if (!user || loading || quests.length === 0) return;
    
    const allComplete = quests.every(q => q.completed);
    if (allComplete) {
      checkStreakUpdate(true).then((result) => {
        if (result) {
          const { newStreakCount, streakReward, isNewRecord } = result;
          if (streakReward > 0) {
            addXP(streakReward, { type: "streak", description: `${newStreakCount} day streak bonus` });
            toast({
              title: "🔥 STREAK BONUS!",
              description: `${newStreakCount} day streak! Earned ${streakReward} bonus XP!`,
              duration: 4000,
            });
          }
          if (isNewRecord && newStreakCount > 1) {
            toast({
              title: "🏆 NEW RECORD!",
              description: `New longest streak: ${newStreakCount} days!`,
              duration: 3000,
            });
          }
        }
      });
    }
  }, [quests, user, loading]);

  const analyzeQuestDescription = async (description: string) => {
    setIsAnalyzing(true);
    try {
      const { analyzeQuestWithAI } = await import('@/lib/questAI');
      const result = await analyzeQuestWithAI(description);
      setQuestForm(prev => ({
        ...prev,
        name: result.name,
        xpReward: result.xpReward,
        statBoost: { stat: result.stat, amount: result.amount }
      }));
    } catch (error) {
      console.error('Quest analysis error:', error);
      toast({ title: "⚠️ Analysis Error", description: "Using basic analysis mode", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { addXP, addCredits } = usePlayerStats();

  const completeQuest = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return;

    await cloudCompleteQuest(questId);

    addXP(quest.xpReward, { type: "quest", description: quest.name });
    const creditsEarned = Math.floor(quest.xpReward / 10);
    addCredits(creditsEarned);

    playSuccess();
    toast({
      title: "✅ Quest Completed!",
      description: `+${quest.xpReward} XP, +${creditsEarned} Credits! ${quest.statBoost.stat} +${quest.statBoost.amount}`,
      duration: 3000,
    });
  };

  const getNextResetTime = () => {
    const timezone = userSettings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const hoursLeft = 23 - hour;
    const minutesLeft = 59 - minute;
    return hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`;
  };

  const openAddDialog = () => {
    setEditingQuest(null);
    setQuestForm({ description: "", name: "", xpReward: 50, statBoost: { stat: "intelligence", amount: 1 } });
    setIsDialogOpen(true);
  };

  const openEditDialog = (quest: DailyQuest) => {
    setEditingQuest(quest);
    setQuestForm({ description: quest.name, name: quest.name, xpReward: quest.xpReward, statBoost: quest.statBoost });
    setIsDialogOpen(true);
  };

  const saveQuest = async () => {
    if (!questForm.name.trim()) {
      toast({ title: "⚠️ Error", description: "Quest name cannot be empty", variant: "destructive" });
      return;
    }

    if (editingQuest) {
      await editQuest(editingQuest.id, { name: questForm.name, xpReward: questForm.xpReward, statBoost: questForm.statBoost });
      toast({ title: "✏️ Quest Updated", description: "Your quest has been modified" });
    } else {
      const newQuest: DailyQuest = {
        id: Date.now().toString(),
        name: questForm.name,
        xpReward: questForm.xpReward,
        statBoost: questForm.statBoost,
        completed: false,
      };
      await addQuest(newQuest);
      toast({ title: "✨ Quest Created", description: "New challenge added to your list!" });
    }

    setIsDialogOpen(false);
  };

  const deleteQuest = async (questId: string) => {
    await cloudDeleteQuest(questId);
    toast({ title: "🗑️ Quest Removed", description: "Quest deleted from your list" });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Please Sign In</h1>
        <p className="text-muted-foreground">You need to be signed in to view your quests.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading quests...</span>
      </div>
    );
  }

  const completedCount = quests.filter((q) => q.completed).length;
  const totalQuests = quests.length;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="quests">Daily Quests</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="quests">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2 font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
              DAILY QUESTS
            </h1>
            <p className="text-muted-foreground">Complete all quests to maximize your growth</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-foreground">{completedCount}/{totalQuests}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-secondary/20 hover:border-secondary/40 transition-all relative overflow-hidden">
              {streak.currentStreak >= 7 && (
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-neon-purple/10 animate-glow-pulse"></div>
              )}
              <div className="flex items-center gap-3 relative z-10">
                <Flame className={`w-8 h-8 ${streak.currentStreak >= 3 ? 'text-neon-orange animate-pulse' : 'text-secondary'}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-secondary">{streak.currentStreak} Days</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-neon-purple/20 hover:border-neon-purple/40 transition-all">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-neon-purple" />
                <div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                  <p className="text-2xl font-bold text-neon-purple">{streak.longestStreak} Days</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total XP Today</p>
                  <p className="text-2xl font-bold text-primary">
                    {quests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-primary-foreground shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Quest
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-primary text-xl font-cinzel">
                    {editingQuest ? "Edit Quest" : "What Quest Do You Accept?"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {editingQuest ? "Update your quest details" : "Describe your quest and the system will automatically determine rewards and stat boosts"}
                  </p>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="questDescription" className="text-muted-foreground mb-2 block">Quest Description</Label>
                    <Textarea
                      id="questDescription"
                      value={questForm.description}
                      onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                      placeholder="e.g., Study programming for 1 hour, Watch 6 lectures, Do an intense workout..."
                      className="bg-background border-primary/20 min-h-[120px] resize-none"
                      disabled={isAnalyzing}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {isAnalyzing ? "🤖 AI is analyzing your quest..." : "💡 Tip: Describe your quest naturally - AI will determine the best stat and rewards"}
                    </p>
                  </div>
                  
                  {!editingQuest && !questForm.name && (
                    <Button 
                      onClick={() => questForm.description.length > 3 && analyzeQuestDescription(questForm.description)}
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 font-cinzel"
                      disabled={questForm.description.length <= 3 || isAnalyzing}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {isAnalyzing ? "Analyzing..." : "Analyze Quest"}
                    </Button>
                  )}
                  
                  {questForm.name && (
                    <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/30 rounded-md">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neon-cyan" />
                        <p className="text-sm font-semibold text-primary">System Analysis Complete</p>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Quest Name:</span>
                          <span className="font-semibold text-foreground">{questForm.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">XP Reward:</span>
                          <span className="font-semibold text-primary">+{questForm.xpReward} XP</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Stat Boost:</span>
                          <span className="font-semibold text-secondary capitalize">{questForm.statBoost.stat} +{questForm.statBoost.amount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(questForm.name || editingQuest) && (
                    <Button onClick={saveQuest} className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 font-cinzel" disabled={!questForm.name}>
                      {editingQuest ? "Update Quest" : "Accept Quest"}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={[...quests].sort((a, b) => Number(a.completed) - Number(b.completed)).map(q => q.id)} strategy={rectSortingStrategy}>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[...quests].sort((a, b) => Number(a.completed) - Number(b.completed)).map((quest) => (
                  <SortableQuestCard key={quest.id} quest={quest} onComplete={completeQuest} onEdit={openEditDialog} onDelete={deleteQuest} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-center">
            <div className="text-center text-sm text-muted-foreground">
              <span>Quests reset automatically at midnight</span>
              <span className="mx-2">•</span>
              <span className="text-primary font-medium">Next reset in: {getNextResetTime()}</span>
            </div>
          </div>

          {completedCount < totalQuests && (
            <Card className="mt-8 p-4 bg-destructive/10 border-destructive/30">
              <p className="text-destructive font-bold text-center">⚠️ SYSTEM WARNING: Your Quest is Not Yet Complete!</p>
              <p className="text-center text-sm text-muted-foreground mt-1">The System urges you to continue...</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Quests;
