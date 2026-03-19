import { AVATARS, Avatar, isAvatarUnlocked, getAvatar } from '@/lib/avatars';
import { soundEngine } from '@/lib/sound-engine';

interface AvatarPickerProps {
  selectedId: string;
  achievements: string[];
  onChange: (avatarId: string) => void;
}

export function AvatarPicker({ selectedId, achievements, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {AVATARS.map(avatar => {
        const unlocked = isAvatarUnlocked(avatar, achievements);
        const isSelected = selectedId === avatar.id;
        
        return (
          <button
            key={avatar.id}
            onClick={() => {
              if (unlocked) {
                soundEngine.play('click');
                onChange(avatar.id);
              }
            }}
            disabled={!unlocked}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : unlocked
                ? 'border-border hover:border-primary/40 bg-card'
                : 'border-border/50 bg-card/50 opacity-40 cursor-not-allowed'
            }`}
            title={unlocked ? avatar.name : `Unlock: ${avatar.requiresAchievement}`}
          >
            <span className="text-2xl">{unlocked ? avatar.emoji : '🔒'}</span>
            <span className="font-mono text-[8px] text-muted-foreground truncate w-full text-center">
              {avatar.name}
            </span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Compact avatar display for HUD/leaderboard
interface AvatarDisplayProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarDisplay({ avatarId, size = 'md', className = '' }: AvatarDisplayProps) {
  const avatar = getAvatar(avatarId);
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center border-2 ${sizeClasses[size]} ${className}`}
      style={{ borderColor: avatar.color, background: `${avatar.color}15` }}
    >
      {avatar.emoji}
    </div>
  );
}
