import { useEffect, useState } from 'react';
import { ChaosEvent as ChaosEventType } from '@/lib/types';

interface ChaosEventProps {
  event: ChaosEventType;
  onDismiss: () => void;
}

export function ChaosEventOverlay({ event, onDismiss }: ChaosEventProps) {
  const [timeLeft, setTimeLeft] = useState(event.duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Red border pulse */}
      <div className="absolute inset-0 border-4 border-destructive/50 animate-pulse rounded-none" />

      {/* Alert banner */}
      <div className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-lg">
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 backdrop-blur-md animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-mono font-bold text-destructive text-sm animate-glitch">
                {event.title}
              </h4>
              <p className="text-xs text-foreground">{event.description}</p>
            </div>
            <button
              onClick={onDismiss}
              className="text-xs font-mono bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded transition-colors"
            >
              ACK ({timeLeft}s)
            </button>
          </div>
          <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive transition-all duration-1000"
              style={{ width: `${(timeLeft / event.duration) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
