import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { soundEngine } from '@/lib/sound-engine';

interface MissionCelebrationProps {
  missionTitle: string;
  xpEarned: number;
  timeRemaining: number;
  chaosSurvived: number;
  onDashboard: () => void;
  onLeaderboard: () => void;
}

function AnimatedCounter({ target, duration = 1500, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(eased * target);
      setCurrent(val);
      if (progress < 1) {
        requestAnimationFrame(tick);
        if (val % 50 === 0) soundEngine.play('tick');
      }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{prefix}{current.toLocaleString()}{suffix}</span>;
}

export function MissionCelebration({ missionTitle, xpEarned, timeRemaining, chaosSurvived, onDashboard, onLeaderboard }: MissionCelebrationProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    soundEngine.play('success');

    // Fire confetti bursts
    const fire = (opts: confetti.Options) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ED64', '#8B5CF6', '#F59E0B', '#FFFFFF'],
        ...opts,
      });
    };

    fire({ angle: 60, origin: { x: 0, y: 0.65 } });
    fire({ angle: 120, origin: { x: 1, y: 0.65 } });
    setTimeout(() => fire({ spread: 100, origin: { x: 0.5, y: 0.5 } }), 400);
    setTimeout(() => {
      fire({ angle: 60, origin: { x: 0.2, y: 0.7 } });
      fire({ angle: 120, origin: { x: 0.8, y: 0.7 } });
    }, 800);
  }, []);

  return (
    <div className="mt-8 space-y-6 text-center max-w-2xl mx-auto animate-slide-up">
      {/* Header glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative border border-primary/30 rounded-lg p-8 bg-card border-glow">
          <div className="text-6xl mb-4 animate-float">🏆</div>
          <h2 className="font-mono text-2xl font-bold text-primary text-glow mb-2 tracking-wider">
            MISSION COMPLETE
          </h2>
          <p className="font-mono text-sm text-muted-foreground">{missionTitle}</p>

          {/* Animated stats */}
          <div className="mt-8 space-y-4">
            {/* XP — big and prominent */}
            <div className="py-4 border-y border-border">
              <p className="text-xs font-mono text-muted-foreground mb-1">XP EARNED</p>
              <p className="font-mono text-4xl font-bold text-primary text-glow">
                <AnimatedCounter target={xpEarned} prefix="+" />
              </p>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p className="text-[10px] text-muted-foreground">TIME REMAINING</p>
                <p className="text-foreground text-lg font-bold">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">CHAOS SURVIVED</p>
                <p className="text-foreground text-lg font-bold">
                  <AnimatedCounter target={chaosSurvived} duration={800} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={onDashboard} variant="outline" className="font-mono">
          ← MISSION CONTROL
        </Button>
        <Button onClick={onLeaderboard} className="font-mono">
          VIEW LEADERBOARD →
        </Button>
      </div>
    </div>
  );
}
