import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sword, 
  Target, 
  CalendarCheck, 
  Shield, 
  Gift, 
  Zap, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface TutorialModalProps {
  open: boolean;
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "WELCOME, HUNTER",
    subtitle: "The System has awakened within you",
    icon: <Zap className="w-16 h-16" />,
    color: "text-primary",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          You have been chosen by <span className="text-primary font-bold">The System</span> to embark on a journey of self-improvement.
        </p>
        <p>
          Like the legendary hunters before you, you'll complete quests, build habits, and face challenges to grow stronger each day.
        </p>
        <p className="text-foreground font-semibold">
          Your journey to becoming the strongest begins now.
        </p>
      </div>
    ),
  },
  {
    title: "DAILY QUESTS",
    subtitle: "Complete tasks to earn XP and stats",
    icon: <Target className="w-16 h-16" />,
    color: "text-neon-cyan",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          Create <span className="text-neon-cyan font-bold">Daily Quests</span> by describing your tasks in natural language.
        </p>
        <div className="bg-background/50 p-3 rounded-lg border border-border">
          <p className="text-sm italic">"Study for 2 hours for my exam"</p>
          <p className="text-xs text-primary mt-1">→ +50 XP, +1 Intelligence</p>
        </div>
        <p>
          The AI analyzes your quest and assigns appropriate stats and XP rewards automatically.
        </p>
        <p className="text-foreground font-semibold">
          Complete ALL daily quests to maintain your streak!
        </p>
      </div>
    ),
  },
  {
    title: "HABITS",
    subtitle: "Build long-term consistency",
    icon: <CalendarCheck className="w-16 h-16" />,
    color: "text-green-400",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          <span className="text-green-400 font-bold">Habits</span> are recurring actions you commit to for a set period.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold text-sm">WIN (80%+)</p>
            <p className="text-xs">Complete 80% of days to earn bonus XP</p>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-bold text-sm">LOSE (&lt;80%)</p>
            <p className="text-xs">Miss too many days and lose XP</p>
          </div>
        </div>
        <p className="text-foreground font-semibold">
          Track your progress with the contribution grid!
        </p>
      </div>
    ),
  },
  {
    title: "GATES",
    subtitle: "Face your ultimate challenges",
    icon: <Shield className="w-16 h-16" />,
    color: "text-neon-purple",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          <span className="text-neon-purple font-bold">Gates</span> are multi-day commitment challenges that test your dedication.
        </p>
        <div className="flex gap-2 flex-wrap">
          {["E", "D", "C", "B", "A", "S"].map((rank, i) => (
            <span 
              key={rank}
              className="px-3 py-1 rounded-full text-sm font-bold border"
              style={{ 
                borderColor: `hsl(${280 - i * 30}, 70%, 50%)`,
                color: `hsl(${280 - i * 30}, 70%, 60%)`
              }}
            >
              {rank}-Rank
            </span>
          ))}
        </div>
        <p>
          Higher rank gates require more days and daily habits to complete, but reward more Gold and XP.
        </p>
        <p className="text-foreground font-semibold">
          Complete quests (and habits for higher ranks) every day to clear the gate!
        </p>
      </div>
    ),
  },
  {
    title: "LEVELING UP",
    subtitle: "Grow stronger with every achievement",
    icon: <TrendingUp className="w-16 h-16" />,
    color: "text-yellow-400",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          Earn <span className="text-primary font-bold">XP</span> from completing quests, habits, and gates to level up.
        </p>
        <div className="bg-background/50 p-3 rounded-lg border border-border space-y-2">
          <div className="flex justify-between">
            <span>100 XP</span>
            <span className="text-primary">= 1 Level</span>
          </div>
          <div className="flex justify-between">
            <span>1 Level</span>
            <span className="text-yellow-400">= 5 Ability Points</span>
          </div>
        </div>
        <p>
          Spend <span className="text-yellow-400 font-bold">Ability Points</span> on stats:
        </p>
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <span className="text-red-400">STR</span>
          <span className="text-green-400">AGI</span>
          <span className="text-blue-400">INT</span>
          <span className="text-yellow-400">VIT</span>
          <span className="text-purple-400">SEN</span>
        </div>
      </div>
    ),
  },
  {
    title: "REWARDS",
    subtitle: "Claim your hard-earned prizes",
    icon: <Gift className="w-16 h-16" />,
    color: "text-neon-orange",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          The <span className="text-neon-orange font-bold">Reward Centre</span> lets you spend your currencies:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
            <p className="text-yellow-400 font-bold">💰 Gold</p>
            <p className="text-xs">From Gates</p>
          </div>
          <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
            <p className="text-neon-purple font-bold">💎 Gems</p>
            <p className="text-xs">Weekly Challenges</p>
          </div>
          <div className="bg-background/50 p-2 rounded-lg border border-border text-center">
            <p className="text-neon-cyan font-bold">🎫 Credits</p>
            <p className="text-xs">Quest Completion</p>
          </div>
        </div>
        <p>
          Unlock <span className="text-secondary font-bold">Card Frames</span>, buy <span className="text-primary font-bold">XP Boosts</span> (Lv.10+), and create custom rewards!
        </p>
      </div>
    ),
  },
  {
    title: "BEGIN YOUR JOURNEY",
    subtitle: "The path to becoming the strongest awaits",
    icon: <Sword className="w-16 h-16" />,
    color: "text-primary",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p className="text-lg text-foreground font-semibold text-center">
          You are now ready to embark on your journey.
        </p>
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
          <p className="text-primary font-bold text-center mb-2">QUICK START TIPS</p>
          <ul className="space-y-2 text-sm">
            <li>✦ Start by creating your first daily quest</li>
            <li>✦ Complete all quests daily to build your streak</li>
            <li>✦ Create a habit for something you want to do consistently</li>
            <li>✦ Attempt an E-Rank gate when you feel ready</li>
            <li>✦ Customize your profile and card frames</li>
          </ul>
        </div>
        <p className="text-center text-foreground italic">
          "I alone level up."
        </p>
      </div>
    ),
  },
];

export const TutorialModal = ({ open, onComplete }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[550px] bg-card border-primary/30 p-0 overflow-hidden" hideCloseButton>
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header with Icon */}
        <div className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-primary/10 to-transparent">
          <div className={`flex justify-center mb-4 ${step.color}`}>
            {step.icon}
          </div>
          <h2 className="text-2xl font-bold text-center font-cinzel bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            {step.title}
          </h2>
          <p className="text-center text-muted-foreground text-sm mt-1">
            {step.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 min-h-[200px]">
          {step.content}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 py-4">
          {TUTORIAL_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-primary w-6"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1 border-border"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isLastStep ? "Start Hunting" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};