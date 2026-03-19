import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { Player } from '@/lib/types';
import { getPlayer } from '@/lib/game-store';
import { ACHIEVEMENTS, MISSIONS, RANK_THRESHOLDS } from '@/lib/game-data';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { clearPlayer } from '@/lib/game-store';

const rarityColors = {
  common: 'border-muted-foreground/30 text-muted-foreground',
  rare: 'border-primary/30 text-primary',
  epic: 'border-accent/30 text-accent',
  legendary: 'border-warning/30 text-warning',
};

export default function Profile() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
  }, [navigate]);

  if (!player) return null;

  const currentThreshold = RANK_THRESHOLDS.find(t => t.rank === player.rank);
  const nextThreshold = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(currentThreshold!) + 1];
  const xpProgress = nextThreshold
    ? ((player.xp - (currentThreshold?.minXP || 0)) / (nextThreshold.minXP - (currentThreshold?.minXP || 0))) * 100
    : 100;

  const handleLogout = () => {
    clearPlayer();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <HUDBar player={player} />

      <div className="pt-16 pb-8 px-4 max-w-3xl mx-auto">
        <div className="mt-8 space-y-6">
          {/* Agent Card */}
          <div className="border border-primary/20 rounded-lg p-6 bg-card border-glow text-center">
            <div className="w-20 h-20 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
              <span className="font-mono text-2xl text-primary">{player.handle[0]?.toUpperCase()}</span>
            </div>
            <h1 className="font-mono text-xl font-bold text-foreground">{player.handle}</h1>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary mt-2">
              {player.rank}
            </Badge>

            <div className="mt-4 max-w-xs mx-auto">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-muted-foreground">Level {player.level}</span>
                <span className="text-primary">{player.xp} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
              {nextThreshold && (
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  {nextThreshold.minXP - player.xp} XP to {nextThreshold.rank}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Score', value: player.totalScore.toLocaleString(), icon: '🎯' },
              { label: 'Missions', value: `${player.completedMissions.length}/${MISSIONS.length}`, icon: '📋' },
              { label: 'Achievements', value: `${player.achievements.length}/${ACHIEVEMENTS.length}`, icon: '🏅' },
              { label: 'Chaos Survived', value: player.chaosEventsSurvived.toString(), icon: '🌪️' },
            ].map(stat => (
              <div key={stat.label} className="border border-border rounded-lg p-4 bg-card text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-mono font-bold text-foreground">{stat.value}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="font-mono text-sm font-bold text-foreground mb-4">ACHIEVEMENTS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.map(achievement => {
                const unlocked = player.achievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      unlocked
                        ? `${rarityColors[achievement.rarity]} bg-card`
                        : 'border-border opacity-40'
                    }`}
                  >
                    <span className="text-2xl">{unlocked ? achievement.icon : '🔒'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-bold text-foreground truncate">{achievement.name}</p>
                      <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[8px] ${rarityColors[achievement.rarity]}`}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rank Progression */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="font-mono text-sm font-bold text-foreground mb-4">RANK PROGRESSION</h2>
            <div className="space-y-3">
              {RANK_THRESHOLDS.map((t, i) => {
                const isCurrentOrPast = player.xp >= t.minXP;
                return (
                  <div key={t.rank} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isCurrentOrPast ? 'bg-primary' : 'bg-secondary'}`} />
                    <span className={`font-mono text-xs flex-1 ${isCurrentOrPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t.rank}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{t.minXP} XP</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disconnect */}
          <Button onClick={handleLogout} variant="outline" className="w-full font-mono text-destructive border-destructive/30 hover:bg-destructive/10">
            [ DISCONNECT ]
          </Button>
        </div>
      </div>
    </div>
  );
}
