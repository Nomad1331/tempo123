import { useState } from "react";
import { Swords, Target, Trophy, Zap, Crown, Palette, Gift, Sparkles, HelpCircle, Mail, BarChart3, Award, Medal, Castle, Users, MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/UserMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Awakening", icon: Zap },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/habits", label: "Habits", icon: Trophy },
  { to: "/gates", label: "Gates", icon: Swords },
  { to: "/leaderboard", label: "Leaderboard", icon: Medal },
  { to: "/guilds", label: "Guilds", icon: Castle, notifKey: "guilds" as const },
  { to: "/friends", label: "Friends", icon: Users, notifKey: "friends" as const },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/customize", label: "Customize", icon: Palette },
  { to: "/supporters", label: "Hall of Fame", icon: Crown },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/discord", label: "Discord", icon: MessageCircle, highlight: true },
  { to: "/contact", label: "Contact", icon: Mail, highlight: true },
];

interface AppSidebarProps {
  onOpenChangelog?: () => void;
}

export function AppSidebar({ onOpenChangelog }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { counts } = useNotifications();

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleChangelogClick = () => {
    setOpen(false);
    onOpenChangelog?.();
  };

  const getNotifCount = (notifKey?: "guilds" | "friends") => {
    if (!notifKey) return 0;
    return counts[notifKey] || 0;
  };

  const hasAnyNotifications = counts.total > 0;

  return (
    <>
      {/* Fixed header with sidebar trigger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative group hover:bg-primary/20 hover:text-primary border border-primary/30 hover:border-primary/60 transition-all duration-300"
                  >
                    {/* Solo Leveling styled menu icon */}
                    <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
                      <span className="block w-4 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300 group-hover:w-5" />
                      <span className="block w-5 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300" />
                      <span className="block w-3 h-0.5 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--neon-cyan))] group-hover:shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-all duration-300 group-hover:w-5" />
                    </div>
                    <span className="sr-only">Open menu</span>
                    
                    {/* Discord-style notification pill on menu button */}
                    <AnimatePresence>
                      {hasAnyNotifications && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                        >
                          {counts.total > 9 ? '9+' : counts.total}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-card/95 backdrop-blur-xl border-primary/20 p-0">
                  <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-primary/20">
                      <h2 className="text-2xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
                        SYSTEM
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">Solo Leveling Tracker</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      {navItems.map(({ to, label, icon: Icon, notifKey, highlight }) => {
                        const notifCount = getNotifCount(notifKey);
                        return (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative ${
                              highlight 
                                ? "bg-gradient-to-r from-[#5865F2]/20 to-primary/20 text-white font-semibold border border-[#5865F2]/50 hover:border-[#5865F2] hover:from-[#5865F2]/30 hover:to-primary/30 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)]" 
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            }`}
                            activeClassName={highlight ? "from-[#5865F2]/40 to-primary/40 border-[#5865F2] shadow-[0_0_30px_rgba(88,101,242,0.6)]" : "text-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]"}
                          >
                            <div className="relative">
                              <Icon className={`w-5 h-5 ${highlight ? "drop-shadow-[0_0_8px_rgba(88,101,242,0.8)]" : ""}`} />
                              {/* Discord-style notification dot on icon */}
                              <AnimatePresence>
                                {notifCount > 0 && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                  >
                                    {notifCount > 9 ? '9+' : notifCount}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <span className={highlight ? "bg-gradient-to-r from-[#5865F2] to-primary bg-clip-text text-transparent font-bold" : ""}>{label}</span>
                            
                            {/* Right-side notification badge for emphasis */}
                            <AnimatePresence>
                              {notifCount > 0 && (
                                <motion.div
                                  initial={{ scale: 0, x: -10 }}
                                  animate={{ scale: 1, x: 0 }}
                                  exit={{ scale: 0, x: -10 }}
                                  className="ml-auto"
                                >
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                                    {notifCount} new
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </NavLink>
                        );
                      })}
                    </nav>

                    {/* Footer with What's New */}
                    <div className="p-4 border-t border-primary/20">
                      <Button
                        variant="ghost"
                        onClick={handleChangelogClick}
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Sparkles className="w-5 h-5" />
                        What's New
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-2xl font-bold text-primary font-cinzel" style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.8)" }}>
                SYSTEM
              </h1>
            </div>
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
