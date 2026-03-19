import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { ChaosEventOverlay } from '@/components/ChaosEventOverlay';
import { TypewriterText } from '@/components/TypewriterText';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Player, MissionObjective, ChaosEvent } from '@/lib/types';
import { getPlayer, completeMission, unlockAchievement, updatePlayer } from '@/lib/game-store';
import { MISSIONS } from '@/lib/game-data';

export default function MissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [phase, setPhase] = useState<'briefing' | 'active' | 'complete' | 'failed'>('briefing');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [objectives, setObjectives] = useState<MissionObjective[]>([]);
  const [systemStability, setSystemStability] = useState(100);
  const [activeChaos, setActiveChaos] = useState<ChaosEvent | null>(null);
  const [triggeredChaos, setTriggeredChaos] = useState<Set<string>>(new Set());
  const [briefingDone, setBriefingDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const mission = MISSIONS.find(m => m.id === missionId);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
    if (mission) {
      setTimeRemaining(mission.timeLimit);
      setObjectives(mission.objectives.map(o => ({ ...o, completed: false })));
    }
  }, [navigate, mission]);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Chaos event triggers
  useEffect(() => {
    if (phase !== 'active' || !mission) return;
    const elapsed = mission.timeLimit - timeRemaining;
    for (const event of mission.chaosEvents) {
      if (elapsed >= event.triggerAt && !triggeredChaos.has(event.id) && !activeChaos) {
        setActiveChaos(event);
        setTriggeredChaos(prev => new Set(prev).add(event.id));
        setSystemStability(prev => Math.max(10, prev - 15));
      }
    }
  }, [timeRemaining, phase, mission, triggeredChaos, activeChaos]);

  const handleDismissChaos = useCallback(() => {
    if (player) {
      const updated = updatePlayer({ chaosEventsSurvived: player.chaosEventsSurvived + 1 });
      setPlayer(updated);
    }
    setActiveChaos(null);
    setSystemStability(prev => Math.min(100, prev + 10));
  }, [player]);

  const toggleObjective = (objId: string) => {
    setObjectives(prev => prev.map(o => o.id === objId ? { ...o, completed: !o.completed } : o));
  };

  const handleComplete = () => {
    if (!mission || !player) return;
    const completedCount = objectives.filter(o => o.completed).length;
    const completionBonus = completedCount === objectives.length ? 1.5 : completedCount / objectives.length;
    const timeBonus = timeRemaining > mission.timeLimit * 0.5 ? 1.3 : 1;
    const earned = Math.round(mission.xpReward * completionBonus * timeBonus);
    setXpEarned(earned);

    let updated = completeMission(mission.id, earned);

    // Check achievements
    if (updated.completedMissions.length === 1) updated = unlockAchievement('first-blood');
    if (timeRemaining > mission.timeLimit - 120) updated = unlockAchievement('speed-demon');
    if (triggeredChaos.size > 0) updated = unlockAchievement('chaos-survivor');
    if (completedCount === objectives.length && triggeredChaos.size === 0) updated = unlockAchievement('perfect-run');
    if (updated.completedMissions.length === MISSIONS.length) updated = unlockAchievement('full-collection');
    if (updated.chaosEventsSurvived >= 5) updated = unlockAchievement('cluster-whisperer');

    setPlayer(updated);
    setPhase('complete');
  };

  if (!mission || !player) return null;

  const allComplete = objectives.every(o => o.completed);

  return (
    <div className="min-h-screen bg-background">
      <HUDBar player={player} timeRemaining={timeRemaining} systemStability={systemStability} showTimer={phase === 'active'} />

      {activeChaos && <ChaosEventOverlay event={activeChaos} onDismiss={handleDismissChaos} />}

      <div className="pt-16 pb-8 px-4 max-w-4xl mx-auto">
        {/* Briefing Phase */}
        {phase === 'briefing' && (
          <div className="mt-8 space-y-6">
            <div className="border border-primary/20 rounded-lg p-6 bg-card border-glow">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs text-primary animate-pulse">●</span>
                  <span className="font-mono text-xs text-primary">INCOMING TRANSMISSION</span>
                </div>
                <h2 className="font-mono text-xl font-bold text-foreground">{mission.title}</h2>
                <div className="font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  <TypewriterText
                    text={mission.briefing}
                    speed={15}
                    onComplete={() => setBriefingDone(true)}
                  />
                </div>
              </div>
            </div>

            {briefingDone && (
              <div className="space-y-4 animate-slide-up">
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-mono text-xs font-bold text-foreground mb-3">MISSION PARAMETERS</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-muted-foreground">Time Limit</div>
                    <div className="text-foreground">{Math.floor(mission.timeLimit / 60)} minutes</div>
                    <div className="text-muted-foreground">XP Reward</div>
                    <div className="text-primary">+{mission.xpReward} XP</div>
                    <div className="text-muted-foreground">Objectives</div>
                    <div className="text-foreground">{mission.objectives.length}</div>
                    <div className="text-muted-foreground">Chaos Events</div>
                    <div className="text-destructive">{mission.chaosEvents.length} threats</div>
                  </div>
                </div>

                <Button
                  onClick={() => setPhase('active')}
                  className="w-full font-mono font-bold tracking-wider animate-pulse-glow"
                >
                  [ BEGIN MISSION ]
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Phase */}
        {phase === 'active' && (
          <div className="mt-8 space-y-6">
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-mono text-xs font-bold text-foreground mb-4">OBJECTIVES</h3>
              <div className="space-y-3">
                {objectives.map((obj, i) => (
                  <div
                    key={obj.id}
                    className={`flex items-start gap-3 p-3 rounded border transition-all ${
                      obj.completed ? 'border-primary/30 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={obj.completed}
                      onCheckedChange={() => toggleObjective(obj.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className={`font-mono text-sm ${obj.completed ? 'text-primary line-through' : 'text-foreground'}`}>
                        <span className="text-muted-foreground mr-2">[{String(i + 1).padStart(2, '0')}]</span>
                        {obj.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Terminal */}
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-warning" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono text-[10px] text-muted-foreground ml-2">mongosh — {mission.codename}</span>
              </div>
              <div className="p-4 font-mono text-xs text-foreground min-h-[200px]">
                <p className="text-muted-foreground">{'>'} // Mission workspace</p>
                <p className="text-muted-foreground">{'>'} // Complete objectives to progress</p>
                <p className="text-primary mt-2">{'>'} db.mission.status()</p>
                <p className="text-foreground">
                  {`{ objectives: ${objectives.filter(o => o.completed).length}/${objectives.length}, status: "${allComplete ? 'READY' : 'IN_PROGRESS'}" }`}
                </p>
                {allComplete && (
                  <p className="text-primary mt-2 animate-pulse">{'>'} MISSION READY FOR EXTRACTION_</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleComplete}
              disabled={!allComplete}
              className="w-full font-mono font-bold tracking-wider"
              variant={allComplete ? 'default' : 'secondary'}
            >
              {allComplete ? '[ EXTRACT — COMPLETE MISSION ]' : `[ ${objectives.filter(o => o.completed).length}/${objectives.length} OBJECTIVES REMAINING ]`}
            </Button>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="mt-8 space-y-6 text-center">
            <div className="border border-primary/30 rounded-lg p-8 bg-card border-glow animate-slide-up">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="font-mono text-xl font-bold text-primary text-glow mb-2">MISSION COMPLETE</h2>
              <p className="font-mono text-sm text-muted-foreground">{mission.title}</p>

              <div className="mt-6 space-y-2 text-sm font-mono">
                <div className="flex justify-between max-w-xs mx-auto">
                  <span className="text-muted-foreground">XP Earned</span>
                  <span className="text-primary font-bold">+{xpEarned}</span>
                </div>
                <div className="flex justify-between max-w-xs mx-auto">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span className="text-foreground">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between max-w-xs mx-auto">
                  <span className="text-muted-foreground">Chaos Survived</span>
                  <span className="text-foreground">{triggeredChaos.size}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="font-mono">
                ← MISSION CONTROL
              </Button>
              <Button onClick={() => navigate('/leaderboard')} className="font-mono">
                VIEW LEADERBOARD →
              </Button>
            </div>
          </div>
        )}

        {/* Failed Phase */}
        {phase === 'failed' && (
          <div className="mt-8 space-y-6 text-center">
            <div className="border border-destructive/30 rounded-lg p-8 bg-card animate-slide-up">
              <div className="text-4xl mb-4">💀</div>
              <h2 className="font-mono text-xl font-bold text-destructive mb-2">MISSION FAILED</h2>
              <p className="font-mono text-sm text-muted-foreground">Time expired. The data was lost.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="font-mono">
                ← RETREAT
              </Button>
              <Button onClick={() => window.location.reload()} className="font-mono">
                RETRY MISSION
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
