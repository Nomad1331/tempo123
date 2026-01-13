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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { HunterAvatar } from '@/components/HunterAvatar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { User, LogOut, Globe, Lock, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordModal } from './ChangePasswordModal';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cloudProfile, setProfilePublic } = useCloudSync();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out of the system.",
    });
    navigate('/');
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

          {/* Change Password */}
          <DropdownMenuItem onClick={() => { setPasswordModalOpen(true); setIsOpen(false); }}>
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password
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
    </>
  );
};
