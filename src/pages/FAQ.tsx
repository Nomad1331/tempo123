import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Zap, Target, Trophy, Swords, Gift, Palette, Crown, RefreshCw, Flame, BookOpen } from "lucide-react";
import { TutorialModal } from "@/components/TutorialModal";

const faqData = [
  {
    category: "Getting Started",
    icon: Zap,
    questions: [
      {
        q: "What is the Solo Leveling System?",
        a: "This is a gamified self-improvement app inspired by the Solo Leveling manhwa. You complete daily quests, build habits, face boss challenges (Gates), earn XP, level up, and track your personal growth through an RPG-style system."
      },
      {
        q: "How do I level up?",
        a: "You gain XP by completing daily quests, maintaining habits, and clearing Gates. Every 100 XP earned advances you to the next level. Each level up grants you 5 Ability Points to allocate to your stats (Strength, Agility, Intelligence, Vitality, Sense)."
      },
      {
        q: "What do the different ranks mean?",
        a: "Your rank reflects your overall progress:\n• E-Rank: Level 1-9 (Beginner Hunter)\n• D-Rank: Level 10-24\n• C-Rank: Level 25-49\n• B-Rank: Level 50-74\n• A-Rank: Level 75-99\n• S-Rank: Level 100+ (Elite Hunter)"
      },
    ]
  },
  {
    category: "Daily Quests",
    icon: Target,
    questions: [
      {
        q: "How do I create quests?",
        a: "Click the '+' button on the Quests page and describe your task in natural language. The AI will automatically analyze it and suggest appropriate XP rewards and stat boosts based on the type of activity (study → Intelligence, workout → Strength, etc.)."
      },
      {
        q: "What happens if I complete all daily quests?",
        a: "Completing all quests in a day maintains your streak. Every 7-day streak milestone grants you 100 bonus XP! The longer your streak, the more rewards you earn."
      },
      {
        q: "Can I reorder my quests?",
        a: "Yes! Simply drag and drop quests using the grip handle on each quest card to prioritize them. Completed quests automatically move to the bottom of the list."
      },
    ]
  },
  {
    category: "Habits",
    icon: Trophy,
    questions: [
      {
        q: "How does the habit system work?",
        a: "Create habits with a goal duration (e.g., 30 days). Mark them complete each day. If you achieve 80% or higher completion rate when the period ends, you WIN and receive the Win XP. Below 80% is a LOSS, and you lose the Lose XP."
      },
      {
        q: "What's the contribution grid?",
        a: "It's a GitHub-style visualization showing your daily habit completions. Darker colors indicate more consistent completion. It helps you see patterns in your behavior over time."
      },
      {
        q: "Can I end a habit early?",
        a: "Yes! Each habit card has 'Declare Win' and 'Declare Loss' buttons for manual override. Use this if you want to finish a habit before its goal period ends."
      },
    ]
  },
  {
    category: "Gates (Boss Challenges)",
    icon: Swords,
    questions: [
      {
        q: "What are Gates?",
        a: "Gates are multi-day commitment challenges inspired by Solo Leveling dungeons. Each gate requires you to complete daily objectives for a set number of consecutive days. Failing a day counts as a 'loss'."
      },
      {
        q: "How do Gate ranks work?",
        a: "Higher rank gates have stricter requirements:\n• E-Rank: 7 days, quests only\n• D-Rank: 7 days, quests + 1 habit\n• C-Rank: 10 days, quests + 2 habits\n• B-Rank: 10 days, quests + 3 habits\n• A-Rank: 12 days, quests + 4 habits\n• S-Rank: 14 days, quests + 5 habits"
      },
      {
        q: "What happens if I fail a Gate?",
        a: "Each failed day adds to your 'losses' counter. Accumulating too many losses will result in Gate failure and you'll need to restart. Rewards include XP, Gold, and unique titles upon completion."
      },
    ]
  },
  {
    category: "Rewards & Currency",
    icon: Gift,
    questions: [
      {
        q: "What currencies are there and how do I earn them?",
        a: "currencies"
      },
      {
        q: "What is the Reward Centre?",
        a: "The Reward Centre lets you define custom rewards (like '1 Hour Free Time' or 'Buy a Snack') and claim them by spending Gold. It's a way to reward yourself for your hard work!"
      },
      {
        q: "What are XP Boosts and how do they work?",
        a: "XP Boosts multiply your XP gains for a limited time. Purchase them in the XP Boost Shop (Rewards page) using Gold and/or Gems. When active:\n• All positive XP gains are multiplied (quests, habits, gates, streaks)\n• The boost timer counts down in real-time\n• You'll get a notification when the boost expires\n• Multipliers range from 1.5x to 3x depending on the boost"
      },
    ]
  },
  {
    category: "Customization",
    icon: Palette,
    questions: [
      {
        q: "How do I change my profile?",
        a: "Go to the Customize page to change your hunter name, avatar, title, and equip card frames. You can also access the tutorial, import/export data, and enable Necromancer Class from there."
      },
      {
        q: "What are card frames?",
        a: "Card frames are decorative borders for your stats card. You can purchase them with Credits in the Card Frame Shop. Rarer frames have more elaborate designs and animations."
      },
      {
        q: "What is Necromancer Class?",
        a: "The Necromancer Class is unlocked by completing the legendary 90-day streak challenge. Once unlocked, it enables Necromancer Mode which adds penalties for failing to complete your daily quests. When enabled, missing quests will cost you XP or stats. Only for serious hunters who want extra challenge!"
      },
    ]
  },
  {
    category: "Challenges",
    icon: Flame,
    questions: [
      {
        q: "What are Challenges and how do they work?",
        a: "Challenges are special objectives that reward you for playing consistently. There are three types: Daily Challenges (reset every 24 hours), Weekly Challenges (reset every 7 days), and a special Legendary Necromancer Mode challenge."
      },
      {
        q: "What rewards do Challenges give?",
        a: "challengeRewards"
      },
      {
        q: "What is the Path of the Necromancer challenge?",
        a: "The Path of the Necromancer is a legendary 90-day streak challenge that UNLOCKS the Necromancer Class. You must maintain a 90-day consecutive streak without breaking it. Choose Normal Mode (5% stat penalty on failure) or Hard Mode (total reset on failure, but grants +10 levels, +20 all stats, +100 credits, +5 gold, +5 gems on completion). This is the ultimate test of dedication!"
      },
      {
        q: "How do I unlock new Challenges?",
        a: "Daily and Weekly Challenges are available from Level 1. The legendary Path of the Necromancer challenge is always available on the Quests page - no level requirement! Complete it to unlock the Necromancer Class."
      },
    ]
  },
  {
    category: "Supporters & Hall of Fame",
    icon: Crown,
    questions: [
      {
        q: "How do I become a supporter?",
        a: "Visit the Ko-Fi page (linked in the app) to donate. After donating, you'll receive a redemption code via DM that unlocks supporter benefits based on your tier (E through S-Rank)."
      },
      {
        q: "What benefits do supporters get?",
        a: "Benefits vary by tier:\n• C-Rank+: Listed in Hall of Hunters\n• B-Rank+: Exclusive card frames (Guild Master, National Hunter)\n• A-Rank+: Custom title + Sovereign frame\n• S-Rank: Custom commissioned frame designed for you"
      },
      {
        q: "How do I redeem a supporter code?",
        a: "Go to the Hall of Fame page and click 'Redeem Code'. Enter your unique code to unlock your benefits. They'll be saved locally and applied to your profile."
      },
    ]
  },
  {
    category: "Data & Updates",
    icon: RefreshCw,
    questions: [
      {
        q: "Is my data saved in the cloud?",
        a: "Currently, all your data (stats, quests, habits, etc.) is saved locally in your browser's localStorage. This means it's tied to your device and browser. Use the Export feature to back up your progress!"
      },
      {
        q: "How do I backup my progress?",
        a: "Go to Customize → Data Management → Export Data. This downloads a JSON file with all your progress. To restore, use 'Import Data' and select your backup file."
      },
      {
        q: "Do I need to clear data when the app updates?",
        a: "No! Updates happen automatically. When a new version is deployed, the app clears its cache and reloads while preserving your localStorage data. You'll see a 'What's New' popup after each update."
      },
      {
        q: "What if my data gets corrupted?",
        a: "If something goes wrong, you can import a previous backup. If you don't have one, you may need to clear site data in your browser settings and start fresh. Regular backups are recommended!"
      },
    ]
  },
];

// Custom content renderer for special FAQ answers
const renderAnswer = (answer: string) => {
  if (answer === "currencies") {
    return (
      <div className="space-y-4">
        <p>There are three currencies:</p>
        <div className="space-y-3">
          <div>
            <span className="text-lg">💰 </span>
            <span className="font-bold text-foreground">Gold</span>
            <ul className="ml-6 mt-1 list-disc">
              <li>Earned from completing quests (based on XP reward)</li>
              <li>Earned from clearing Gates</li>
              <li>Earned from some Challenges</li>
              <li>Used in the Reward Centre and XP Boost Shop</li>
            </ul>
          </div>
          <div>
            <span className="text-lg">💎 </span>
            <span className="font-bold text-foreground">Gems</span>
            <ul className="ml-6 mt-1 list-disc">
              <li>Earned from completing Weekly Challenges</li>
              <li>Earned from Necromancer Hard Mode rewards</li>
              <li>Premium currency for special XP boosts</li>
            </ul>
          </div>
          <div>
            <span className="text-lg">🎫 </span>
            <span className="font-bold text-foreground">Credits</span>
            <ul className="ml-6 mt-1 list-disc">
              <li>Earned from completing quests (XP ÷ 10)</li>
              <li>Earned from completing Challenges</li>
              <li>Earned from Necromancer Hard Mode rewards</li>
              <li>Used to buy card frames in the Card Frame Shop</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  if (answer === "challengeRewards") {
    return (
      <div className="space-y-3">
        <div>
          <span className="font-bold text-foreground">Daily Challenges</span>
          <ul className="ml-6 mt-1 list-disc">
            <li>XP (25-75 based on difficulty)</li>
            <li>Gold (10-30 based on difficulty)</li>
          </ul>
        </div>
        <div>
          <span className="font-bold text-foreground">Weekly Challenges</span>
          <ul className="ml-6 mt-1 list-disc">
            <li>XP (100-200 based on difficulty)</li>
            <li>Gems (5-15 based on difficulty)</li>
            <li>Credits (10-30 based on difficulty)</li>
          </ul>
        </div>
        <div>
          <span className="font-bold text-foreground">Path of the Necromancer (Legendary 90-Day)</span>
          <ul className="ml-6 mt-1 list-disc">
            <li>Normal Mode: Unlocks Necromancer Class</li>
            <li>Hard Mode: Unlocks Necromancer Class + 10 Levels + 20 All Stats + 100 Credits + 5 Gold + 5 Gems</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return answer;
};

const FAQ = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Tutorial Modal */}
      <TutorialModal 
        open={showTutorial} 
        onComplete={() => setShowTutorial(false)} 
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
            FAQ
          </h1>
        </div>
        <p className="text-muted-foreground mb-4">Everything you need to know about the System</p>
        
        {/* Tutorial Button */}
        <Button
          onClick={() => setShowTutorial(true)}
          variant="outline"
          className="gap-2 border-primary/50 hover:bg-primary/10 hover:border-primary"
        >
          <BookOpen className="w-4 h-4" />
          View Tutorial Again
        </Button>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {faqData.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="p-6 bg-card border-primary/20 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <category.icon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-primary font-cinzel">
                {category.category}
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`} className="border-border/50">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {renderAnswer(item.a)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        Still have questions? The System is always watching... and learning.
      </p>
    </div>
  );
};

export default FAQ;
