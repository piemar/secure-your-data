import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/lib/types';
import { RANK_THRESHOLDS } from '@/lib/game-data';
import { useNavigate, useLocation } from 'react-router-dom';
import { soundEngine } from '@/lib/sound-engine';
import { AvatarDisplay } from '@/components/AvatarPicker';
import { Volume2, VolumeX } from 'lucide-react';

interface HUDBarProps {
  player: Player;
  timeRemaining?: number;
  systemStability?: number;
  showTimer?: boolean;
  hintsUsed?: number;
  hintPenalty?: number;
}

export function HUDBar({ player, timeRemaining, systemStability = 100, showTimer = false, hintsUsed = 0, hintPenalty = 0 }: HUDBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scoreAnim, setScoreAnim] = useState(false);
  const [muted, setMuted] = useState(soundEngine.muted);

  const currentThreshold = RANK_THRESHOLDS.find(t => t.rank === player.rank);
  const nextThreshold = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(currentThreshold!) + 1];
  const xpProgress = nextThreshold
    ? ((player.xp - (currentThreshold?.minXP || 0)) / (nextThreshold.minXP - (currentThreshold?.minXP || 0))) * 100
    : 100;

  useEffect(() => {
    setScoreAnim(true);
    const t = setTimeout(() => setScoreAnim(false), 300);
    return () => clearTimeout(t);
  }, [player.totalScore]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = showTimer && timeRemaining !== undefined && timeRemaining < 60;

  const handleToggleMute = () => {
    const newMuted = soundEngine.toggleMute();
    setMuted(newMuted);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm px-4 py-2 ${isUrgent ? 'border-destructive animate-pulse' : 'border-border'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo / Home */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="font-mono text-primary font-bold text-sm">MDB</span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">HEIST</span>
        </button>

        {/* Timer */}
        {showTimer && timeRemaining !== undefined && (
          <div className={`font-mono text-lg font-bold ${isUrgent ? 'text-destructive' : 'text-primary'} text-glow`}>
            {formatTime(timeRemaining)}
          </div>
        )}

        {/* Score */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">LOOT</span>
          <span className={`font-mono font-bold text-primary ${scoreAnim ? 'animate-counter-tick' : ''}`}>
            {player.totalScore.toLocaleString()}
          </span>
        </div>

        {/* System Stability */}
        {showTimer && (
          <div className="hidden md:flex items-center gap-2 min-w-[120px]">
            <span className="text-xs text-muted-foreground font-mono">SYS</span>
            <Progress value={systemStability} className="h-2 flex-1" />
            <span className={`font-mono text-xs ${systemStability < 30 ? 'text-destructive' : 'text-primary'}`}>
              {systemStability}%
            </span>
          </div>
        )}

        {/* Hints Used */}
        {showTimer && hintsUsed > 0 && (
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-xs text-warning font-mono">💡{hintsUsed}</span>
            <span className="text-[10px] text-destructive font-mono">−{hintPenalty}</span>
          </div>
        )}

        {/* Player Info */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            {player.rank}
          </Badge>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-mono text-foreground">{player.handle}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">LVL {player.level}</span>
              <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          className="w-8 h-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Nav */}
        <div className="flex gap-1">
          {[
            { path: '/dashboard', label: '⌘' },
            { path: '/quests', label: '📜' },
            { path: '/leaderboard', label: '🏆' },
          ].map(nav => (
            <button
              key={nav.path}
              onClick={() => navigate(nav.path)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                location.pathname === nav.path ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
