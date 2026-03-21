import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { MissionCard } from '@/components/MissionCard';
import { TiltCard } from '@/components/TiltCard';
import { ActivityTicker } from '@/components/ActivityTicker';
import { MissionNodeGraph } from '@/components/MissionNodeGraph';
import { MissionSearch } from '@/components/MissionSearch';
import { Player, MissionTier } from '@/lib/types';
import { getPlayer } from '@/lib/game-store';
import { MISSIONS, ACHIEVEMENTS, MOCK_LEADERBOARD_PLAYERS } from '@/content/missions/mission';
import { QUESTS } from '@/content/quests/quest';
import { isMissionUnlocked, POV_LABELS } from '@/lib/mission-prerequisites';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Lock, Map, LayoutGrid } from 'lucide-react';
import heistMascot from '@/assets/heist-mascot.png';
import { isMissionTierOnHold } from '@/lib/mission-tiers';

const TIER_ORDER: MissionTier[] = ['recon', 'infiltration', 'exfiltration'];
const TIER_NAMES: Record<MissionTier, string> = {
  recon: '🔍 RECON',
  infiltration: '🥷 INFILTRATION',
  exfiltration: '📡 EXFILTRATION',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');
  const [filteredMissionIds, setFilteredMissionIds] = useState<string[] | null>(null);
  const [highlightedMissionId, setHighlightedMissionId] = useState<string | null>(null);
  const [sessionMissionIds, setSessionMissionIds] = useState<string[] | null>(null);
  const [topPlayers, setTopPlayers] = useState<Array<{ handle: string; totalScore: number }>>(MOCK_LEADERBOARD_PLAYERS.slice(0, 5));
  const graphRef = useRef<{ scrollToNode: (id: string) => void }>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadSessionContext = async () => {
      try {
        const me = await api.players.me() as { workshopId?: string | null; sessionId?: string | null };
        const workshopId =
          (typeof me.workshopId === 'string' && me.workshopId) ||
          (typeof me.sessionId === 'string' && me.sessionId) ||
          null;
        if (workshopId) {
          const workshop = await api.workshops.getById(workshopId) as { missionIds?: string[] };
          if (mounted && Array.isArray(workshop.missionIds)) {
            setSessionMissionIds(workshop.missionIds);
          }
        }
        const leaders = await api.players.leaderboard(workshopId || undefined);
        if (mounted && Array.isArray(leaders) && leaders.length > 0) {
          const normalized = leaders
            .map((p) => ({
              handle: typeof p.handle === 'string' ? p.handle : 'unknown',
              totalScore: typeof p.totalScore === 'number' ? p.totalScore : 0,
            }))
            .slice(0, 5);
          setTopPlayers(normalized);
        }
      } catch {
        // Keep local fallback data for offline/dev resilience.
      }
    };
    void loadSessionContext();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = useCallback((ids: string[] | null) => {
    setFilteredMissionIds(ids);
  }, []);

  const handleSearchMissionClick = useCallback((missionId: string) => {
    if (viewMode === 'graph' && graphRef.current) {
      graphRef.current.scrollToNode(missionId);
      setHighlightedMissionId(missionId);
      setTimeout(() => setHighlightedMissionId(null), 2000);
    } else {
      navigate(`/mission/${missionId}`);
    }
  }, [viewMode, navigate]);

  if (!player) return null;

  const activeMissions = MISSIONS.filter(m => !isMissionTierOnHold(m.id));
  const baseMissionSet = sessionMissionIds
    ? activeMissions.filter(m => sessionMissionIds.includes(m.id))
    : activeMissions;

  const displayMissions = filteredMissionIds
    ? baseMissionSet.filter(m => filteredMissionIds.includes(m.id))
    : baseMissionSet;
  const completedInScope = player.completedMissions.filter(id => baseMissionSet.some(m => m.id === id));

  const missionsByTier = TIER_ORDER.map(tier => ({
    tier,
    missions: displayMissions.filter(m => m.tier === tier),
  })).filter(t => t.missions.length > 0);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => player.achievements.includes(a.id));
  const activeQuests = QUESTS.filter(q => {
    const done = q.missionIds.filter(id => player.completedMissions.includes(id)).length;
    return done > 0 && done < q.requiredMissions;
  });

  const getMascotMessage = () => {
    const completed = completedInScope.length;
    const total = Math.max(1, baseMissionSet.length);
    const pct = completed / total;
    if (pct === 0) return 'Ready for your first gameday mission, agent?';
    if (pct < 0.25) return "Nice start! Keep cracking those databases!";
    if (pct < 0.5) return "You're getting dangerous, agent...";
    if (pct < 0.75) return "Over halfway! The data fears you now.";
    if (pct < 1) return "Almost legend status. Finish strong!";
    return 'ALL MISSIONS COMPLETE. You own the gameday.';
  };

  const Sidebar = () => (
    <div className="space-y-6">
      {/* Mascot helper */}
      <div className="border border-primary/20 rounded-lg p-4 bg-card/80 backdrop-blur-sm flex items-center gap-3">
        <img
          src={heistMascot}
          alt="Gameday mascot"
          className="w-12 h-12 flex-shrink-0 drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
          style={{ animation: 'mascot-float 3s ease-in-out infinite' }}
        />
        <div>
          <p className="font-mono text-[10px] text-primary font-bold">AGENT RACCOON</p>
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{getMascotMessage()}</p>
        </div>
      </div>

      {activeQuests.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-xs font-bold text-foreground">ACTIVE QUESTS</h3>
            <button onClick={() => navigate('/quests')} className="text-[10px] text-primary font-mono hover:underline">VIEW ALL →</button>
          </div>
          <div className="space-y-3">
            {activeQuests.slice(0, 3).map(quest => {
              const done = quest.missionIds.filter(id => player.completedMissions.includes(id)).length;
              return (
                <button key={quest.id} onClick={() => navigate('/quests')} className="block w-full text-left">
                  <div className="flex items-center gap-2 text-xs">
                    <span>{quest.icon}</span>
                    <span className="font-mono text-foreground flex-1 truncate">{quest.title}</span>
                    <span className="font-mono text-primary text-[10px]">{done}/{quest.requiredMissions}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/quests')}
        className="w-full border border-border rounded-lg p-3 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors text-left"
      >
        <h3 className="font-mono text-xs font-bold text-foreground mb-1">📜 QUEST CHAINS</h3>
        <p className="font-mono text-[10px] text-muted-foreground">{QUESTS.length} story arcs with bonus XP rewards</p>
      </button>

      <div className="border border-border rounded-lg p-4 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-xs font-bold text-foreground">THE GRID</h3>
          <button onClick={() => navigate('/leaderboard')} className="text-[10px] text-primary font-mono hover:underline">VIEW ALL →</button>
        </div>
        <div className="space-y-2">
          {topPlayers.map((p, i) => (
            <div key={p.handle} className="flex items-center gap-2 text-xs">
              <span className={`font-mono font-bold w-4 ${i === 0 ? 'text-warning' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-warning/60' : 'text-muted-foreground'}`}>{i + 1}</span>
              <span className="font-mono text-foreground truncate flex-1">{p.handle}</span>
              <span className="font-mono text-primary text-[10px]">{p.totalScore.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 bg-card/80 backdrop-blur-sm">
        <h3 className="font-mono text-xs font-bold text-foreground mb-3">ACHIEVEMENTS</h3>
        {unlockedAchievements.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-mono">No achievements yet. Complete missions to unlock.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unlockedAchievements.map(a => (
              <Badge key={a.id} variant="outline" className="font-mono text-[10px]">{a.icon} {a.name}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg p-4 bg-card/80 backdrop-blur-sm space-y-2">
        <h3 className="font-mono text-xs font-bold text-foreground mb-3">AGENT STATS</h3>
        {[
          ['Handle', player.handle],
          ['Rank', player.rank],
          ['Level', player.level.toString()],
          ['XP', player.xp.toLocaleString()],
          ['Missions', `${completedInScope.length}/${baseMissionSet.length}`],
          ['Chaos Survived', player.chaosEventsSurvived.toString()],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-muted-foreground font-mono">{label}</span>
            <span className="text-foreground font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background/70 relative flex flex-col">
      <HUDBar player={player} />

      {/* Sticky header + search */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 pt-16 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 mt-4 flex items-center justify-between">
            <div>
              <h1 className="font-mono text-2xl font-bold text-primary text-glow">MISSION CONTROL</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {completedInScope.length}/{baseMissionSet.length} MISSIONS COMPLETED •{' '}
                {ACHIEVEMENTS.length - unlockedAchievements.length} ACHIEVEMENTS REMAINING
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/workshop-admin')}
                className="rounded border border-primary/40 px-2 py-1 font-mono text-[10px] text-primary hover:bg-primary/10"
              >
                WORKSHOP ADMIN
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`p-2 rounded transition-colors ${viewMode === 'graph' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Node graph"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
          <MissionSearch missions={activeMissions} onFilterChange={handleFilterChange} onMissionClick={viewMode === 'graph' ? handleSearchMissionClick : undefined} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 px-4 pt-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-8">
            {viewMode === 'graph' ? (
              <MissionNodeGraph
                ref={graphRef}
                missions={displayMissions}
                completedMissions={player.completedMissions}
                onMissionClick={(id) => navigate(`/mission/${id}`)}
                highlightedMissionId={highlightedMissionId}
              />
            ) : (
              missionsByTier.map(({ tier, missions }) => (
                <div key={tier}>
                  <h2 className="font-mono text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    {TIER_NAMES[tier]}
                    <span className="h-px flex-1 bg-border" />
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {missions.map(mission => {
                      const unlocked = isMissionUnlocked(mission.id, player.completedMissions);
                      const isCompleted = player.completedMissions.includes(mission.id);
                      return (
                        <TiltCard key={mission.id}>
                          <div className="relative">
                            {!unlocked && !isCompleted && (
                              <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                                  <span className="font-mono text-[10px] text-muted-foreground">LOCKED</span>
                                </div>
                              </div>
                            )}
                            <MissionCard
                              mission={mission}
                              isCompleted={isCompleted}
                              onClick={() => unlocked ? navigate(`/mission/${mission.id}`) : undefined}
                            />
                            {mission.povCapabilities && mission.povCapabilities.length > 0 && (
                              <div className="flex flex-wrap gap-1 px-3 pb-2">
                                {mission.povCapabilities.map(pov => (
                                  <span key={pov} className="text-[8px] font-mono text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded">
                                    {POV_LABELS[pov] || pov}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TiltCard>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[200px] space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <ActivityTicker />
      </div>
    </div>
  );
}
