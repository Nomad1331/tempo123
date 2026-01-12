import { useMemo, useState, useRef } from "react";
import { XPHistoryEntry, Habit } from "@/lib/storage";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { useCloudHabits } from "@/hooks/useCloudHabits";
import { useCloudStreaks } from "@/hooks/useCloudStreaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Target, 
  Calendar,
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Image
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subWeeks, 
  subMonths,
  isWithinInterval,
  format,
  eachDayOfInterval,
  parseISO,
  differenceInDays
} from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const Analytics = () => {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Get data from cloud hooks
  const { stats } = usePlayerStats();
  const { xpHistory } = useCloudChallenges();
  const { habits } = useCloudHabits();
  const { streak } = useCloudStreaks();

  const analytics = useMemo(() => {
    const now = new Date();
    
    // Current and previous periods
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    // Filter XP history by period
    const filterByPeriod = (entries: XPHistoryEntry[], start: Date, end: Date) => {
      return entries.filter(entry => {
        const date = parseISO(entry.timestamp);
        return isWithinInterval(date, { start, end });
      });
    };

    const currentWeekXP = filterByPeriod(xpHistory, currentWeekStart, currentWeekEnd);
    const prevWeekXP = filterByPeriod(xpHistory, prevWeekStart, prevWeekEnd);
    const currentMonthXP = filterByPeriod(xpHistory, currentMonthStart, currentMonthEnd);
    const prevMonthXP = filterByPeriod(xpHistory, prevMonthStart, prevMonthEnd);

    // Calculate totals
    const sumXP = (entries: XPHistoryEntry[]) => entries.reduce((sum, e) => sum + e.amount, 0);
    const countQuests = (entries: XPHistoryEntry[]) => entries.filter(e => e.source === "quest").length;
    const countHabits = (entries: XPHistoryEntry[]) => entries.filter(e => e.source === "habit").length;

    // Habit completion analytics
    const calculateHabitCompletions = (habits: Habit[], start: Date, end: Date) => {
      let completed = 0;
      let total = 0;
      const days = eachDayOfInterval({ start, end });
      
      habits.forEach(habit => {
        days.forEach(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const habitStart = parseISO(habit.startDate);
          if (day >= habitStart) {
            total++;
            if (habit.completionGrid[dateKey]) {
              completed++;
            }
          }
        });
      });
      
      return { completed, total, rate: total > 0 ? (completed / total) * 100 : 0 };
    };

    const currentWeekHabits = calculateHabitCompletions(habits, currentWeekStart, now);
    const prevWeekHabits = calculateHabitCompletions(habits, prevWeekStart, prevWeekEnd);
    const currentMonthHabits = calculateHabitCompletions(habits, currentMonthStart, now);
    const prevMonthHabits = calculateHabitCompletions(habits, prevMonthStart, prevMonthEnd);

    // Chart data - XP per day
    const generateChartData = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end: end > now ? now : end });
      return days.map(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const dayEntries = xpHistory.filter(entry => {
          const entryDate = format(parseISO(entry.timestamp), "yyyy-MM-dd");
          return entryDate === dateKey;
        });
        const habitCompletions = habits.reduce((count, habit) => {
          return count + (habit.completionGrid[dateKey] ? 1 : 0);
        }, 0);
        
        return {
          date: format(day, "EEE"),
          fullDate: format(day, "MMM d"),
          xp: sumXP(dayEntries),
          quests: countQuests(dayEntries),
          habits: habitCompletions
        };
      });
    };

    return {
      week: {
        current: {
          xp: sumXP(currentWeekXP),
          quests: countQuests(currentWeekXP),
          habitRate: currentWeekHabits.rate,
          habitCompleted: currentWeekHabits.completed,
          levelsGained: currentWeekXP.reduce((sum, e) => sum + e.levelsGained, 0)
        },
        previous: {
          xp: sumXP(prevWeekXP),
          quests: countQuests(prevWeekXP),
          habitRate: prevWeekHabits.rate
        },
        chartData: generateChartData(currentWeekStart, currentWeekEnd)
      },
      month: {
        current: {
          xp: sumXP(currentMonthXP),
          quests: countQuests(currentMonthXP),
          habitRate: currentMonthHabits.rate,
          habitCompleted: currentMonthHabits.completed,
          levelsGained: currentMonthXP.reduce((sum, e) => sum + e.levelsGained, 0)
        },
        previous: {
          xp: sumXP(prevMonthXP),
          quests: countQuests(prevMonthXP),
          habitRate: prevMonthHabits.rate
        },
        chartData: generateChartData(currentMonthStart, currentMonthEnd)
      }
    };
  }, [xpHistory, habits]);

  const currentData = period === "week" ? analytics.week : analytics.month;
  const periodLabel = period === "week" ? "This Week" : "This Month";
  const prevPeriodLabel = period === "week" ? "Last Week" : "Last Month";

  // Calculate percentage changes
  const xpChange = currentData.previous.xp > 0 
    ? ((currentData.current.xp - currentData.previous.xp) / currentData.previous.xp) * 100 
    : currentData.current.xp > 0 ? 100 : 0;
  const questChange = currentData.previous.quests > 0 
    ? ((currentData.current.quests - currentData.previous.quests) / currentData.previous.quests) * 100 
    : currentData.current.quests > 0 ? 100 : 0;
  const habitChange = currentData.previous.habitRate > 0 
    ? currentData.current.habitRate - currentData.previous.habitRate 
    : currentData.current.habitRate;

  const TrendIndicator = ({ value, suffix = "%" }: { value: number; suffix?: string }) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-400 text-sm">
          <ArrowUp className="w-3 h-3 mr-1" />
          +{value.toFixed(1)}{suffix}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-400 text-sm">
          <ArrowDown className="w-3 h-3 mr-1" />
          {value.toFixed(1)}{suffix}
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="w-3 h-3 mr-1" />
        0{suffix}
      </span>
  );
  };

  // Export as Image
  const exportAsImage = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `analytics-report-${period}-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "📸 Image Exported",
        description: "Your analytics report has been saved as an image.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export as Text Report
  const exportAsText = () => {
    const data = period === "week" ? analytics.week : analytics.month;
    const periodName = period === "week" ? "Weekly" : "Monthly";
    
    const report = `
╔══════════════════════════════════════════════════════════════════╗
║              SOLO LEVELING HABIT TRACKER                         ║
║              ${periodName.toUpperCase()} PROGRESS REPORT                            ║
╠══════════════════════════════════════════════════════════════════╣
║  Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
║  Player: ${stats.name} | Level ${stats.level} | ${stats.rank}
╠══════════════════════════════════════════════════════════════════╣

📊 ${periodName.toUpperCase()} SUMMARY
────────────────────────────────────────
• XP Earned: ${data.current.xp.toLocaleString()} XP
• Quests Completed: ${data.current.quests}
• Habit Completion Rate: ${data.current.habitRate.toFixed(1)}%
• Levels Gained: ${data.current.levelsGained}

📈 COMPARED TO PREVIOUS ${period.toUpperCase()}
────────────────────────────────────────
• XP Change: ${xpChange >= 0 ? "+" : ""}${xpChange.toFixed(1)}%
• Quest Change: ${questChange >= 0 ? "+" : ""}${questChange.toFixed(1)}%
• Habit Rate Change: ${habitChange >= 0 ? "+" : ""}${habitChange.toFixed(1)} points

🔥 STREAK STATUS
────────────────────────────────────────
• Current Streak: ${streak.currentStreak} days
• Longest Streak: ${streak.longestStreak} days

🏆 ALL-TIME STATS
────────────────────────────────────────
• Total XP: ${stats.totalXP.toLocaleString()}
• Current Level: ${stats.level}
• Total Activities: ${xpHistory.length}

╚══════════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `analytics-report-${period}-${format(new Date(), "yyyy-MM-dd")}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "📄 Report Exported",
      description: "Your analytics report has been saved as a text file.",
    });
  };

  return (
    <main className="pt-20 pb-8 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6" ref={reportRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary font-cinzel flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Progress Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Track your growth and performance over time</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")} className="w-auto">
              <TabsList className="bg-card/50 border border-primary/20">
                <TabsTrigger value="week" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportAsImage}
                disabled={isExporting}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Image className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Image"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportAsText}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Text
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{periodLabel} Summary</h2>
                <p className="text-sm text-muted-foreground">Compared to {prevPeriodLabel.toLowerCase()}</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">
                <Flame className="w-3 h-3 mr-1" />
                {streak.currentStreak} day streak
              </Badge>
            </div>
            
            <div className="bg-card/50 rounded-lg p-4 border border-primary/20">
              <p className="text-lg text-foreground">
                You completed <span className="text-primary font-bold">{currentData.current.quests} quests</span>, 
                gained <span className="text-primary font-bold">{currentData.current.xp.toLocaleString()} XP</span>
                {currentData.current.levelsGained > 0 && (
                  <>, and leveled up <span className="text-primary font-bold">{currentData.current.levelsGained} time{currentData.current.levelsGained > 1 ? "s" : ""}</span></>
                )}!
              </p>
              {currentData.current.habitCompleted > 0 && (
                <p className="text-muted-foreground mt-2">
                  You also completed <span className="text-foreground font-semibold">{currentData.current.habitCompleted} habit check-ins</span> with a {currentData.current.habitRate.toFixed(1)}% completion rate.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <TrendIndicator value={xpChange} />
              </div>
              <p className="text-2xl font-bold text-foreground">{currentData.current.xp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">XP Earned</p>
              <p className="text-xs text-muted-foreground mt-1">vs {currentData.previous.xp.toLocaleString()} {prevPeriodLabel.toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-primary" />
                <TrendIndicator value={questChange} />
              </div>
              <p className="text-2xl font-bold text-foreground">{currentData.current.quests}</p>
              <p className="text-sm text-muted-foreground">Quests Completed</p>
              <p className="text-xs text-muted-foreground mt-1">vs {currentData.previous.quests} {prevPeriodLabel.toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <TrendIndicator value={habitChange} suffix=" pts" />
              </div>
              <p className="text-2xl font-bold text-foreground">{currentData.current.habitRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Habit Completion</p>
              <p className="text-xs text-muted-foreground mt-1">vs {currentData.previous.habitRate.toFixed(1)}% {prevPeriodLabel.toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{currentData.current.levelsGained}</p>
              <p className="text-sm text-muted-foreground">Levels Gained</p>
              <p className="text-xs text-muted-foreground mt-1">Current: Level {stats.level}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XP Trend Chart */}
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                XP Earned Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentData.chartData.some(d => d.xp > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={currentData.chartData}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        borderRadius: "8px"
                      }}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#xpGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>No XP data for this period yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Activity Chart */}
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentData.chartData.some(d => d.quests > 0 || d.habits > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={currentData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        borderRadius: "8px"
                      }}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                    />
                    <Bar dataKey="quests" fill="hsl(var(--primary))" name="Quests" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="habits" fill="hsl(142 76% 36%)" name="Habits" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>No activity data for this period yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All-Time Stats */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              All-Time Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-3xl font-bold text-primary">{stats.totalXP.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-3xl font-bold text-foreground">{stats.level}</p>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-3xl font-bold text-foreground">{streak.longestStreak}</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-3xl font-bold text-foreground">{xpHistory.length}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Analytics;
