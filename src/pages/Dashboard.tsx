import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { MissionCard } from '@/components/MissionCard';
import { Player, MissionTier } from '@/lib/types';
import { getPlayer } from '@/lib/game-store';
import { MISSIONS, ACHIEVEMENTS, MOCK_LEADERBOARD_PLAYERS } from '@/lib/game-data';
import { Badge } from '@/components/ui/badge';

const TIER_ORDER: MissionTier[] = ['recon', 'infiltration', 'exfiltration'];
const TIER_NAMES: Record<MissionTier, string> = {
  recon: '🔍 RECON',
  infiltration: '🥷 INFILTRATION',
  exfiltration: '📡 EXFILTRATION',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
  }, [navigate]);

  if (!player) return null;

  const missionsByTier = TIER_ORDER.map(tier => ({
    tier,
    missions: MISSIONS.filter(m => m.tier === tier),
  }));

  const unlockedAchievements = ACHIEVEMENTS.filter(a => player.achievements.includes(a.id));
  const topPlayers = MOCK_LEADERBOARD_PLAYERS.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <HUDBar player={player} />

      <div className="pt-16 pb-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="font-mono text-2xl font-bold text-primary text-glow">
            MISSION CONTROL
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {player.completedMissions.length}/{MISSIONS.length} MISSIONS COMPLETED •{' '}
            {ACHIEVEMENTS.length - unlockedAchievements.length} ACHIEVEMENTS REMAINING
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mission List - Left/Center */}
          <div className="lg:col-span-3 space-y-8">
            {missionsByTier.map(({ tier, missions }) => (
              <div key={tier}>
                <h2 className="font-mono text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  {TIER_NAMES[tier]}
                  <span className="h-px flex-1 bg-border" />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {missions.map(mission => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      isCompleted={player.completedMissions.includes(mission.id)}
                      onClick={() => navigate(`/mission/${mission.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Mini Leaderboard */}
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs font-bold text-foreground">THE GRID</h3>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="text-[10px] text-primary font-mono hover:underline"
                >
                  VIEW ALL →
                </button>
              </div>
              <div className="space-y-2">
                {topPlayers.map((p, i) => (
                  <div key={p.handle} className="flex items-center gap-2 text-xs">
                    <span className={`font-mono font-bold w-4 ${i === 0 ? 'text-warning' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-warning/60' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <span className="font-mono text-foreground truncate flex-1">{p.handle}</span>
                    <span className="font-mono text-primary text-[10px]">{p.totalScore.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-mono text-xs font-bold text-foreground mb-3">ACHIEVEMENTS</h3>
              {unlockedAchievements.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-mono">No achievements yet. Complete missions to unlock.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unlockedAchievements.map(a => (
                    <Badge key={a.id} variant="outline" className="font-mono text-[10px]">
                      {a.icon} {a.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Player Stats */}
            <div className="border border-border rounded-lg p-4 bg-card space-y-2">
              <h3 className="font-mono text-xs font-bold text-foreground mb-3">AGENT STATS</h3>
              {[
                ['Handle', player.handle],
                ['Rank', player.rank],
                ['Level', player.level.toString()],
                ['XP', player.xp.toLocaleString()],
                ['Missions', `${player.completedMissions.length}/${MISSIONS.length}`],
                ['Chaos Survived', player.chaosEventsSurvived.toString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-mono">{label}</span>
                  <span className="text-foreground font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
