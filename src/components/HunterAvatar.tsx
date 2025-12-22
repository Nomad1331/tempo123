import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Class emoji mapping - same as PlayerProfileCard
const CLASS_EMOJIS: Record<string, string> = {
  fighter: "⚔️",
  warrior: "⚔️",
  tanker: "🛡️",
  mage: "🔮",
  assassin: "🗡️",
  ranger: "🏹",
  healer: "💚",
  hunter: "🏹",
  necromancer: "💀",
  default: "⚔️",
};

interface HunterAvatarProps {
  avatar?: string | null;
  hunterName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-20 w-20 text-3xl',
};

export const HunterAvatar = ({ 
  avatar, 
  hunterName, 
  size = 'md', 
  className,
  showBorder = true 
}: HunterAvatarProps) => {
  // Check if avatar is a custom uploaded image (base64 data URL or http URL)
  const isCustomImage = avatar?.startsWith('data:') || avatar?.startsWith('http');
  // Check if avatar is a class emoji identifier
  const isClassEmoji = avatar && CLASS_EMOJIS[avatar.toLowerCase()];
  
  return (
    <Avatar className={cn(
      sizeClasses[size],
      showBorder && 'border-2 border-primary/30',
      'flex-shrink-0',
      className
    )}>
      {isCustomImage ? (
        <AvatarImage src={avatar} alt={hunterName} className="object-cover w-full h-full" />
      ) : null}
      <AvatarFallback className="bg-primary/20 text-primary font-bold flex items-center justify-center w-full h-full">
        {isClassEmoji 
          ? CLASS_EMOJIS[avatar!.toLowerCase()]
          : avatar && CLASS_EMOJIS[avatar] 
            ? CLASS_EMOJIS[avatar]
            : hunterName.charAt(0).toUpperCase()
        }
      </AvatarFallback>
    </Avatar>
  );
};
