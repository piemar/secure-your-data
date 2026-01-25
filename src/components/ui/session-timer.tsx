import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';

interface SessionTimerProps {
  targetMinutes?: number;
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

export function SessionTimer({
  targetMinutes = 45,
  onComplete,
  className,
  compact = false,
}: SessionTimerProps) {
  const {
    remaining,
    isRunning,
    toggle,
    reset,
    formattedRemaining,
  } = useTimer({
    targetTime: targetMinutes * 60,
    onComplete,
    warningThresholds: [15 * 60, 10 * 60, 5 * 60, 60],
  });

  const isWarning = remaining <= 10 * 60 && remaining > 5 * 60;
  const isDanger = remaining <= 5 * 60;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={toggle}
          className="p-1.5 rounded hover:bg-muted transition-colors"
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <span
          className={cn(
            'timer-display text-sm',
            isWarning && 'warning',
            isDanger && 'danger'
          )}
        >
          {formattedRemaining}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-card border border-border', className)}>
      <Clock className="w-5 h-5 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Time Remaining</span>
        <span
          className={cn(
            'timer-display',
            isWarning && 'warning',
            isDanger && 'danger'
          )}
        >
          {formattedRemaining}
        </span>
      </div>
      <div className="flex gap-1 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-8 w-8"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
