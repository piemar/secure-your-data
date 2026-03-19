import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { Player } from '@/lib/types';
import { getPlayer } from '@/lib/game-store';
import { MOCK_LEADERBOARD_PLAYERS, RANK_THRESHOLDS } from '@/lib/game-data';

function getRankForXP(xp: number): string {
  let rank = 'Script Kiddie';
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXP) rank = t.rank;
  }
  return rank;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
  }, [navigate]);

  if (!player) return null;

  // Merge player into leaderboard
  const allPlayers = [
    ...MOCK_LEADERBOARD_PLAYERS.map(p => ({ ...p, isPlayer: false })),
    {
      handle: player.handle,
      xp: player.xp,
      totalScore: player.totalScore,
      completedMissions: player.completedMissions.length,
      chaosEventsSurvived: player.chaosEventsSurvived,
      isPlayer: true,
    },
  ].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-background">
      <HUDBar player={player} />

      <div className="pt-16 pb-8 px-4 max-w-3xl mx-auto">
        <div className="mt-8 space-y-6">
          <div>
            <h1 className="font-mono text-2xl font-bold text-primary text-glow">THE GRID</h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">GLOBAL LEADERBOARD • LIVE RANKINGS</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 0, 2].map((rank) => {
              const p = allPlayers[rank];
              if (!p) return null;
              const isFirst = rank === 0;
              return (
                <div
                  key={p.handle}
                  className={`border rounded-lg p-4 text-center transition-all ${
                    isFirst
                      ? 'border-warning/50 bg-warning/5 border-glow-accent row-span-1 order-2 col-start-2'
                      : rank === 1
                      ? 'border-muted-foreground/30 bg-card order-1'
                      : 'border-warning/20 bg-card order-3'
                  } ${p.isPlayer ? 'ring-1 ring-primary/50' : ''}`}
                >
                  <div className={`text-2xl mb-2 ${isFirst ? 'text-3xl' : ''}`}>
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}
                  </div>
                  <p className={`font-mono text-xs font-bold truncate ${p.isPlayer ? 'text-primary' : 'text-foreground'}`}>
                    {p.handle}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{getRankForXP(p.xp)}</p>
                  <p className="font-mono text-sm font-bold text-primary mt-2">{p.totalScore.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Full List */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="grid grid-cols-[40px_1fr_80px_60px_60px] gap-2 px-4 py-2 bg-secondary/30 border-b border-border text-[10px] font-mono text-muted-foreground">
              <span>#</span>
              <span>AGENT</span>
              <span className="text-right">SCORE</span>
              <span className="text-right">MISSIONS</span>
              <span className="text-right">CHAOS</span>
            </div>
            {allPlayers.map((p, i) => (
              <div
                key={p.handle}
                className={`grid grid-cols-[40px_1fr_80px_60px_60px] gap-2 px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
                  p.isPlayer ? 'bg-primary/5' : 'hover:bg-secondary/30'
                }`}
              >
                <span className={`font-mono text-xs font-bold ${i < 3 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-xs truncate ${p.isPlayer ? 'text-primary font-bold' : 'text-foreground'}`}>
                    {p.handle}
                  </span>
                  {p.isPlayer && (
                    <span className="text-[8px] font-mono text-primary bg-primary/10 px-1 rounded">YOU</span>
                  )}
                </div>
                <span className="font-mono text-xs text-primary text-right">{p.totalScore.toLocaleString()}</span>
                <span className="font-mono text-xs text-foreground text-right">{typeof p.completedMissions === 'number' ? p.completedMissions : p.completedMissions}</span>
                <span className="font-mono text-xs text-foreground text-right">{p.chaosEventsSurvived}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
