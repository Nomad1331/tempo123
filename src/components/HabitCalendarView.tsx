import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Habit } from "@/lib/storage";
import { getTodayString } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HabitCalendarViewProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
}

const HabitCalendarView = ({ habits, onToggle }: HabitCalendarViewProps) => {
  const today = getTodayString();
  
  // Generate last 14 days + today
  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 2);
    return { day, weekday };
  };

  const activeHabits = habits.filter((h) => h.status === "active");

  if (activeHabits.length === 0) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <p className="text-muted-foreground">No active habits. Create one to get started!</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[600px]">
          {/* Header row with dates */}
          <div className="flex border-b border-border">
            {/* Habit name column */}
            <div className="w-40 flex-shrink-0 p-3 font-semibold text-muted-foreground text-sm border-r border-border">
              Habit
            </div>
            
            {/* Date columns */}
            {dates.map((dateStr) => {
              const { day, weekday } = formatDate(dateStr);
              const isToday = dateStr === today;
              
              return (
                <div
                  key={dateStr}
                  className={cn(
                    "flex-1 min-w-[44px] p-2 text-center border-r border-border last:border-r-0",
                    isToday && "bg-neon-cyan/10"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium",
                    isToday ? "text-neon-cyan" : "text-muted-foreground"
                  )}>
                    {weekday}
                  </div>
                  <div className={cn(
                    "text-sm font-bold",
                    isToday ? "text-neon-cyan" : "text-foreground"
                  )}>
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Habit rows */}
          {activeHabits.map((habit) => (
            <div key={habit.id} className="flex border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
              {/* Habit name */}
              <div className="w-40 flex-shrink-0 p-3 flex items-center gap-2 border-r border-border">
                <span className="text-lg">{habit.icon}</span>
                <span className="font-medium text-sm truncate" title={habit.name}>
                  {habit.name}
                </span>
              </div>
              
              {/* Completion checkboxes */}
              {dates.map((dateStr) => {
                const isCompleted = habit.completionGrid?.[dateStr] === true;
                const isToday = dateStr === today;
                const isFuture = dateStr > today;
                const habitStart = new Date(habit.startDate);
                const dateObj = new Date(dateStr);
                const isBeforeStart = dateObj < habitStart;
                
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "flex-1 min-w-[44px] flex items-center justify-center border-r border-border last:border-r-0",
                      isToday && "bg-neon-cyan/10"
                    )}
                  >
                    {isBeforeStart ? (
                      <span className="text-muted-foreground/30">-</span>
                    ) : isFuture ? (
                      <span className="text-muted-foreground/30">-</span>
                    ) : (
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => onToggle(habit.id, dateStr)}
                        className={cn(
                          "h-5 w-5 border-2 transition-all",
                          isCompleted 
                            ? "bg-neon-cyan border-neon-cyan data-[state=checked]:bg-neon-cyan" 
                            : "border-muted-foreground/40",
                          isToday && !isCompleted && "border-neon-cyan/50"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Legend */}
      <div className="p-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neon-cyan" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-muted-foreground/40" />
          <span>Not done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neon-cyan/10 border border-neon-cyan" />
          <span>Today</span>
        </div>
      </div>
    </Card>
  );
};

export default HabitCalendarView;
