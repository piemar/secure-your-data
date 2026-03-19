/**
 * Player avatar system — pixel-art hacker avatars.
 * Some are unlocked by default, others require achievements.
 */

export interface Avatar {
  id: string;
  name: string;
  emoji: string;       // Fallback display character
  color: string;       // HSL accent color for avatar ring
  requiresAchievement?: string;  // Achievement ID needed to unlock
}

export const AVATARS: Avatar[] = [
  // Default avatars (always available)
  { id: 'ghost', name: 'Ghost', emoji: '👻', color: 'hsl(var(--primary))' },
  { id: 'skull', name: 'Skull', emoji: '💀', color: 'hsl(var(--muted-foreground))' },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: 'hsl(210, 60%, 50%)' },
  { id: 'alien', name: 'Alien', emoji: '👾', color: 'hsl(280, 60%, 50%)' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'hsl(0, 0%, 40%)' },
  { id: 'detective', name: 'Detective', emoji: '🕵️', color: 'hsl(30, 50%, 40%)' },
  { id: 'hacker', name: 'Hacker', emoji: '🧑‍💻', color: 'hsl(var(--primary))' },
  { id: 'astronaut', name: 'Astronaut', emoji: '🧑‍🚀', color: 'hsl(200, 70%, 50%)' },

  // Achievement-locked avatars
  { id: 'crown', name: 'Overlord', emoji: '👑', color: 'hsl(45, 90%, 50%)', requiresAchievement: 'atlas-overlord' },
  { id: 'diamond', name: 'Perfectionist', emoji: '💎', color: 'hsl(195, 80%, 60%)', requiresAchievement: 'perfect-run' },
  { id: 'lightning', name: 'Speed Demon', emoji: '⚡', color: 'hsl(50, 90%, 55%)', requiresAchievement: 'speed-demon' },
  { id: 'tornado', name: 'Chaos Master', emoji: '🌀', color: 'hsl(200, 70%, 50%)', requiresAchievement: 'cluster-whisperer' },
  { id: 'trophy', name: 'Completionist', emoji: '🏆', color: 'hsl(45, 80%, 45%)', requiresAchievement: 'full-collection' },
  { id: 'fire', name: 'No Hints', emoji: '🔥', color: 'hsl(15, 90%, 55%)', requiresAchievement: 'no-hints' },
];

export function getAvatar(avatarId?: string): Avatar {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
}

export function isAvatarUnlocked(avatar: Avatar, achievements: string[]): boolean {
  if (!avatar.requiresAchievement) return true;
  return achievements.includes(avatar.requiresAchievement);
}

export function getDefaultAvatarId(): string {
  return 'ghost';
}
