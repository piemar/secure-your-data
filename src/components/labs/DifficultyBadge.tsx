import { cn } from '@/lib/utils';

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

const difficultyConfig: Record<DifficultyLevel, { label: string; emoji: string; colors: string }> = {
  basic: {
    label: 'Basic',
    emoji: '🟢',
    colors: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  },
  intermediate: {
    label: 'Intermediate',
    emoji: '🟡',
    colors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
  },
  advanced: {
    label: 'Advanced',
    emoji: '🔴',
    colors: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
  }
};

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[level];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      config.colors,
      className
    )}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
