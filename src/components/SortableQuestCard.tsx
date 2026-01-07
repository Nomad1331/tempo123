import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DailyQuest } from "@/lib/storage";
import { Pencil, Trash2, GripVertical } from "lucide-react";

interface SortableQuestCardProps {
  quest: DailyQuest;
  onComplete: (id: string) => void;
  onEdit: (quest: DailyQuest) => void;
  onDelete: (id: string) => void;
}

export const SortableQuestCard = ({ quest, onComplete, onEdit, onDelete }: SortableQuestCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-6 transition-all duration-300 ${
        quest.completed
          ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)] opacity-70"
          : "bg-card border-border hover:border-secondary/30"
      } ${isDragging ? "shadow-2xl scale-105" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <Checkbox
          checked={quest.completed}
          onCheckedChange={() => onComplete(quest.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <h3
            className={`text-lg font-bold mb-2 ${
              quest.completed ? "text-primary line-through" : "text-foreground"
            }`}
          >
            {quest.name}
          </h3>
          <div className="flex gap-4 text-sm">
            <span className="text-primary">+{quest.xpReward} XP</span>
            {quest.statBoost && (
              <span className="text-secondary">
                {quest.statBoost.stat} +{quest.statBoost.amount}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(quest)}
            className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(quest.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};