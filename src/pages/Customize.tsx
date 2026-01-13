import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { toast } from "@/hooks/use-toast";
import { Lock, Upload, X, BookOpen } from "lucide-react";

import { CARD_FRAMES, SUPPORTER_EXCLUSIVE_FRAMES, getRarityColor } from "@/lib/cardFrames";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StatsCardFrame } from "@/components/StatsCardFrame";
import { TutorialModal } from "@/components/TutorialModal";
import { getSupporterBenefits } from "@/lib/supporters";

const AVATAR_OPTIONS = [
  { id: "fighter", emoji: "⚔️", name: "Fighter", description: "Master of combat" },
  { id: "tanker", emoji: "🛡️", name: "Tanker", description: "Unbreakable defender" },
  { id: "mage", emoji: "🔮", name: "Mage", description: "Wielder of magic" },
  { id: "assassin", emoji: "🗡️", name: "Assassin", description: "Silent hunter" },
  { id: "ranger", emoji: "🏹", name: "Ranger", description: "Precise marksman" },
  { id: "healer", emoji: "💚", name: "Healer", description: "Guardian of life" },
  { id: "necromancer", emoji: "💀", name: "Necromancer", description: "Commander of death", locked: true },
];

const TITLE_OPTIONS = [
  "Awakened Hunter",
  "Novice Warrior",
  "The Weakest Hunter",
  "System User",
  "Rising Hunter",
];

const Customize = () => {
  const { stats, updateProfile } = usePlayerStats();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar || "default");
  const [selectedTitle, setSelectedTitle] = useState(stats.title || "Awakened Hunter");
  const [customName, setCustomName] = useState(stats.name);
  const [selectedCardFrame, setSelectedCardFrame] = useState(stats.selectedCardFrame || "default");
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(
    stats.avatar && !AVATAR_OPTIONS.find(a => a.id === stats.avatar) ? stats.avatar : null
  );
  // Merge credit-purchased frames with supporter tier-unlocked frames
  const supporterBenefits = getSupporterBenefits();
  const creditUnlockedFrames = stats.unlockedCardFrames || ["default"];
  const supporterUnlockedFrames = supporterBenefits.unlockedFrames || [];
  const unlockedFrames = [...new Set([...creditUnlockedFrames, ...supporterUnlockedFrames])];

  // Mark as mounted after first render to prevent overwriting imported data
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Sync state when stats change from cloud
  useEffect(() => {
    if (stats) {
      setSelectedAvatar(stats.avatar || "default");
      setSelectedTitle(stats.title || "Awakened Hunter");
      setCustomName(stats.name);
      setSelectedCardFrame(stats.selectedCardFrame || "default");
      if (stats.avatar && !AVATAR_OPTIONS.find(a => a.id === stats.avatar)) {
        setCustomImagePreview(stats.avatar);
      }
    }
  }, [stats.avatar, stats.title, stats.name, stats.selectedCardFrame]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "❌ File Too Large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Invalid File Type",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImagePreview(dataUrl);
      setSelectedAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeCustomImage = () => {
    setCustomImagePreview(null);
    setSelectedAvatar("warrior");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-save with debounce - save to cloud
  const saveCustomization = useCallback(() => {
    updateProfile({
      name: customName,
      avatar: selectedAvatar,
      title: selectedTitle,
      selectedCardFrame: selectedCardFrame,
    });
  }, [customName, selectedAvatar, selectedTitle, selectedCardFrame, updateProfile]);

  // Auto-save whenever any customization changes - only after mount
  useEffect(() => {
    if (!hasMounted) return;
    
    const timeoutId = setTimeout(() => {
      saveCustomization();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [saveCustomization, hasMounted]);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
          CUSTOMIZE PROFILE
        </h1>
        <p className="text-muted-foreground">Personalize your hunter identity</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Name Section */}
        <Card className="p-6 bg-card border-primary/30">
          <h2 className="text-2xl font-bold text-primary mb-4 font-cinzel">Hunter Name</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Your Name</Label>
              <Input
                id="name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-2 bg-background border-primary/20"
                placeholder="Enter your hunter name"
              />
            </div>
          </div>
        </Card>

        {/* Avatar Selection */}
        <Card className="p-6 bg-card border-primary/30 lg:col-span-2">
          <h2 className="text-2xl font-bold text-primary mb-4 font-cinzel">Avatar</h2>
          
          {/* Custom Image Upload */}
          <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-background/50">
            <Label className="text-sm font-semibold text-foreground mb-2 block">Custom Profile Picture</Label>
            {customImagePreview ? (
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary">
                  <img src={customImagePreview} alt="Custom avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Custom image uploaded</p>
                  <Button
                    onClick={removeCustomImage}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                    Remove Image
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Upload your own character image (max 2MB)</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="gap-2 border-primary/50 hover:bg-primary/10"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Emoji Avatars */}
          <Label className="text-sm font-semibold text-foreground mb-3 block">Or Choose a Class</Label>
          <div className="grid grid-cols-3 gap-3">
            {AVATAR_OPTIONS.map((avatar) => {
              const isLocked = avatar.locked && !stats.unlockedClasses?.includes(avatar.id);
              return (
                <button
                  key={avatar.id}
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedAvatar(avatar.id);
                      setCustomImagePreview(null);
                    }
                  }}
                  disabled={isLocked}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isLocked 
                      ? "border-border/30 bg-background/30 cursor-not-allowed opacity-60"
                      : selectedAvatar === avatar.id && !customImagePreview
                        ? "border-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                        : "border-border bg-background hover:border-primary/50 hover:scale-105"
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className={isLocked ? "blur-sm" : ""}>
                    <div className="text-4xl mb-2">{avatar.emoji}</div>
                    <p className="text-xs font-semibold text-foreground">{avatar.name}</p>
                    <p className="text-xs text-muted-foreground">{avatar.description}</p>
                  </div>
                  {isLocked && (
                    <p className="absolute bottom-1 left-0 right-0 text-[10px] text-muted-foreground text-center">
                      90-day streak
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Title Selection */}
        <Card className="p-6 bg-card border-primary/30">
          <h2 className="text-2xl font-bold text-primary mb-4 font-cinzel">Title</h2>
          <div className="grid grid-cols-2 gap-3">
            {TITLE_OPTIONS.map((title) => (
              <button
                key={title}
                onClick={() => setSelectedTitle(title)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedTitle === title
                    ? "border-secondary bg-secondary/20 shadow-[0_0_15px_hsl(var(--secondary)/0.4)]"
                    : "border-border bg-background hover:border-secondary/50"
                }`}
              >
                <p className="text-sm font-semibold text-foreground text-center">「 {title} 」</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Card Frame Selection */}
        <Card className="p-6 bg-card border-primary/30 lg:col-span-2">
          <h2 className="text-2xl font-bold text-primary mb-4 font-cinzel">Card Frame</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[...CARD_FRAMES, ...SUPPORTER_EXCLUSIVE_FRAMES].map((frame) => {
              const isUnlocked = unlockedFrames.includes(frame.id);
              const isSelected = selectedCardFrame === frame.id;

              return (
                <div key={frame.id} className="relative">
                  <button
                    onClick={() => isUnlocked && setSelectedCardFrame(frame.id)}
                    disabled={!isUnlocked}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                        : isUnlocked
                        ? "border-border bg-background hover:border-primary/50 hover:scale-105"
                        : "border-border/30 bg-background/30 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className={isUnlocked ? "" : "blur-sm"}>
                      <p className="text-sm font-semibold text-foreground mb-1">{frame.name}</p>
                      <Badge className={`${getRarityColor(frame.rarity)} text-xs`} variant="outline">
                        {frame.rarity}
                      </Badge>
                    </div>
                  </button>
                  {isUnlocked && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 w-full text-xs hover:bg-primary/10 text-muted-foreground hover:text-primary"
                        >
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-black/95 border-primary/30">
                        <div className="flex justify-center py-4">
                          <StatsCardFrame 
                            stats={{
                              ...stats,
                              name: customName,
                              avatar: selectedAvatar,
                              title: selectedTitle,
                            }} 
                            frameId={frame.id} 
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Unlock more frames in the Reward Centre
          </p>
        </Card>

        {/* Preview */}
        <Card className="p-6 bg-gradient-to-br from-background via-background to-primary/5 border-primary/30 lg:col-span-2">
          <h2 className="text-2xl font-bold text-primary mb-4 font-cinzel">Preview</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full border-4 border-primary/50 flex items-center justify-center bg-gradient-to-br from-background to-primary/20 overflow-hidden">
                {customImagePreview ? (
                  <img src={customImagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.emoji || "👤"}</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground font-cinzel">{customName}</h3>
              <p className="text-sm text-secondary italic mt-1">「 {selectedTitle} 」</p>
              <p className="text-sm text-muted-foreground mt-2">Level {stats.level} • {stats.rank}</p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-card border-primary/30 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Cloud Sync</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is automatically saved to the cloud. Sign in on any device to access your progress.
              </p>
              <Button
                onClick={() => setShowTutorial(true)}
                variant="link"
                className="px-0 text-primary"
              >
                View Tutorial
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <TutorialModal open={showTutorial} onComplete={() => setShowTutorial(false)} />
    </div>
  );
};

export default Customize;
