import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSidebar } from "./components/AppSidebar";
import { NecromancerUnlockPopup } from "./components/NecromancerUnlockPopup";
import { WhatsNewModal } from "./components/WhatsNewModal";
import { RankUpAnimation } from "./components/RankUpAnimation";
import { useVersionCheck } from "./hooks/useVersionCheck";
import Awakening from "./pages/Awakening";
import Quests from "./pages/Quests";
import Habits from "./pages/Habits";
import Gates from "./pages/Gates";
import Rewards from "./pages/Rewards";
import Customize from "./pages/Customize";
import Supporters from "./pages/Supporters";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import Guilds from "./pages/Guilds";
import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import Discord from "./pages/Discord";
import NotFound from "./pages/NotFound";
import { useAchievements } from "./hooks/useAchievements";
import { AchievementUnlockQueue } from "./components/AchievementUnlockPopup";

const queryClient = new QueryClient();

const AppContent = () => {
  const { checkVersion, markVersionAsSeen, currentVersion } = useVersionCheck();
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const { newlyUnlocked, dismissUnlocked } = useAchievements();
  
  useEffect(() => {
    const result = checkVersion();
    if (result.showWhatsNew) {
      setShowWhatsNew(true);
    }
  }, []);

  const handleCloseWhatsNew = () => {
    setShowWhatsNew(false);
    markVersionAsSeen();
  };

  const handleOpenChangelog = () => {
    setShowWhatsNew(true);
  };
  
  return (
    <>
      <AppSidebar onOpenChangelog={handleOpenChangelog} />
      <WhatsNewModal 
        isOpen={showWhatsNew} 
        onClose={handleCloseWhatsNew} 
        currentVersion={currentVersion} 
      />
      <NecromancerUnlockPopup />
      <RankUpAnimation />
      <AchievementUnlockQueue achievements={newlyUnlocked} onDismiss={dismissUnlocked} />
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Awakening />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/gates" element={<Gates />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/guilds" element={<Guilds />} />
              <Route path="/friends" element={<Friends />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/supporters" element={<Supporters />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/discord" element={<Discord />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <AppContent />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
