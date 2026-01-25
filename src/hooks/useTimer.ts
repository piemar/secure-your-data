import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime?: number;
  targetTime?: number; // countdown target in seconds
  onComplete?: () => void;
  onWarning?: (remaining: number) => void;
  warningThresholds?: number[]; // in seconds
}

export function useTimer(options: UseTimerOptions = {}) {
  const {
    initialTime = 0,
    targetTime = 45 * 60, // 45 minutes default
    onComplete,
    onWarning,
    warningThresholds = [15 * 60, 10 * 60, 5 * 60, 60], // 15, 10, 5, 1 min
  } = options;

  const [elapsed, setElapsed] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningsTriggered = useRef<Set<number>>(new Set());

  const remaining = Math.max(0, targetTime - elapsed);
  const progress = Math.min(100, (elapsed / targetTime) * 100);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          
          // Check warning thresholds
          const remainingTime = targetTime - next;
          warningThresholds.forEach(threshold => {
            if (remainingTime <= threshold && !warningsTriggered.current.has(threshold)) {
              warningsTriggered.current.add(threshold);
              onWarning?.(remainingTime);
            }
          });

          // Check completion
          if (next >= targetTime) {
            onComplete?.();
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, targetTime, onComplete, onWarning, warningThresholds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const toggle = useCallback(() => setIsRunning(prev => !prev), []);
  
  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
    warningsTriggered.current.clear();
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    elapsed,
    remaining,
    progress,
    isRunning,
    start,
    pause,
    toggle,
    reset,
    formattedElapsed: formatTime(elapsed),
    formattedRemaining: formatTime(remaining),
  };
}
