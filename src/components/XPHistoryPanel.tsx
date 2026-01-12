import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCloudChallenges } from "@/hooks/useCloudChallenges";
import { XPHistoryEntry } from "@/lib/storage";
import { Trophy, Flame, Skull, Zap, Target, Shield, Loader2 } from "lucide-react";

const XPHistoryPanel = () => {
  const { xpHistory, loading } = useCloudChallenges();

  const getSourceIcon = (source: XPHistoryEntry["source"]) => {
    switch (source) {
      case "quest":
        return <Target className="w-4 h-4 text-primary" />;
      case "habit":
        return <Flame className="w-4 h-4 text-neon-orange" />;
      case "gate":
        return <Shield className="w-4 h-4 text-neon-purple" />;
      case "streak":
        return <Zap className="w-4 h-4 text-neon-cyan" />;
      default:
        return <Trophy className="w-4 h-4 text-secondary" />;
    }
  };

  const getSourceColor = (source: XPHistoryEntry["source"]) => {
    switch (source) {
      case "quest":
        return "border-primary/30";
      case "habit":
        return "border-neon-orange/30";
      case "gate":
        return "border-neon-purple/30";
      case "streak":
        return "border-neon-cyan/30";
      default:
        return "border-secondary/30";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Loading XP history...</p>
      </Card>
    );
  }

  if (!xpHistory || xpHistory.length === 0) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <p className="text-muted-foreground">No XP history yet. Complete quests and habits to start tracking!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-cinzel font-bold mb-4 text-foreground">XP History</h3>
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {xpHistory.map((entry) => (
            <Card
              key={entry.id}
              className={`p-4 bg-card/50 border ${getSourceColor(entry.source)} hover:border-primary/50 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getSourceIcon(entry.source)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {entry.description}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`font-bold ${
                        entry.amount >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {entry.amount >= 0 ? "+" : ""}{entry.amount} XP
                    </span>
                    
                    <span className="text-muted-foreground capitalize">
                      {entry.source}
                    </span>
                    
                    {entry.levelsGained > 0 && (
                      <span className="text-neon-cyan font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        +{entry.levelsGained} Level{entry.levelsGained > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Lv.{entry.oldLevel} → Lv.{entry.newLevel}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{entry.oldTotalXP.toLocaleString()} → {entry.newTotalXP.toLocaleString()} Total XP</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default XPHistoryPanel;
