import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/hooks/useCloudSync';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HunterAvatar } from '@/components/HunterAvatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { User, LogOut, Globe, Lock, KeyRound, Link2, Check, Loader2, Palette, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordModal } from './ChangePasswordModal';
import { supabase } from '@/integrations/supabase/client';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cloudProfile, setProfilePublic, fetchCloudData } = useCloudSync();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [discordLinkOpen, setDiscordLinkOpen] = useState(false);
  const [discordId, setDiscordId] = useState('');
  const [linkingDiscord, setLinkingDiscord] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out of the system.",
    });
    navigate('/');
  };

  const handleLinkDiscord = async () => {
    if (!user || !discordId.trim()) return;

    // Validate Discord ID format (17-19 digit number)
    const discordIdPattern = /^\d{17,19}$/;
    if (!discordIdPattern.test(discordId.trim())) {
      toast({
        title: "Invalid Discord ID",
        description: "Discord ID should be a 17-19 digit number. Right-click your profile in Discord and select 'Copy User ID'.",
        variant: "destructive",
      });
      return;
    }

    setLinkingDiscord(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          discord_id: discordId.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Discord Linked!",
        description: "Your Discord account has been linked successfully. You can now use the bot!",
      });
      setDiscordLinkOpen(false);
      setDiscordId('');
      fetchCloudData(); // Refresh profile data
    } catch (error) {
      console.error('Error linking Discord:', error);
      toast({
        title: "Link Failed",
        description: "Failed to link Discord account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLinkingDiscord(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-primary/30 hover:border-primary/50"
        onClick={() => navigate('/auth')}
      >
        <User className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-primary/30 p-0">
            <HunterAvatar 
              avatar={cloudProfile?.avatar} 
              hunterName={cloudProfile?.hunter_name || 'Hunter'} 
              size="sm"
              showBorder={false}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {cloudProfile?.hunter_name || 'Hunter'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Privacy Toggle */}
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              {cloudProfile?.is_public ? (
                <Globe className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Public Profile</span>
            </div>
            <Switch
              checked={cloudProfile?.is_public ?? true}
              onCheckedChange={(checked) => setProfilePublic(checked)}
            />
          </div>

          <DropdownMenuSeparator />

          {/* Customize Profile */}
          <DropdownMenuItem onClick={() => { navigate('/customize'); setIsOpen(false); }}>
            <Palette className="h-4 w-4 mr-2" />
            Customize Profile
          </DropdownMenuItem>

          {/* Discord Server */}
          <DropdownMenuItem onClick={() => { navigate('/discord'); setIsOpen(false); }}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Discord Server
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Change Password */}
          <DropdownMenuItem onClick={() => { setPasswordModalOpen(true); setIsOpen(false); }}>
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password
          </DropdownMenuItem>

          {/* Link Discord */}
          <DropdownMenuItem onClick={() => { setDiscordLinkOpen(true); setIsOpen(false); }}>
            <Link2 className="h-4 w-4 mr-2" />
            {cloudProfile?.discord_id ? 'Update Discord Link' : 'Link Discord'}
            {cloudProfile?.discord_id && <Check className="h-3 w-3 ml-auto text-green-500" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />

      {/* Discord Link Dialog */}
      <Dialog open={discordLinkOpen} onOpenChange={setDiscordLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Link Discord Account
            </DialogTitle>
            <DialogDescription>
              Link your Discord account to use the FlaviBot and sync your progress across platforms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {cloudProfile?.discord_id && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ Currently linked: <span className="font-mono">{cloudProfile.discord_id}</span>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="discord-id">Discord User ID</Label>
              <Input
                id="discord-id"
                placeholder="123456789012345678"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                To find your Discord ID: Enable Developer Mode in Discord settings, then right-click your profile and select "Copy User ID". Alternatively, you can also use the /link command in the 🔗ㆍlink-account channel and get your User ID at the bottom.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscordLinkOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleLinkDiscord} 
              disabled={!discordId.trim() || linkingDiscord}
              className="gap-2"
            >
              {linkingDiscord && <Loader2 className="h-4 w-4 animate-spin" />}
              {cloudProfile?.discord_id ? 'Update Link' : 'Link Discord'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
