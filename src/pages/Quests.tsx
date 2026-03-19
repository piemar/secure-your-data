import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { MatrixRain } from '@/components/MatrixRain';
import { Player, Quest } from '@/lib/types';
import { getPlayer } from '@/lib/game-store';
import { QUESTS, MISSIONS } from '@/lib/game-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Play, Trophy } from 'lucide-react';

export default function Quests() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
  }, [navigate]);

  if (!player) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <MatrixRain />
      <HUDBar player={player} />

      <div className="relative z-10 pt-16 pb-20 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-4">
          <h1 className="font-mono text-2xl font-bold text-primary text-glow">
            QUEST CHAINS
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Complete story arcs to earn bonus XP and special achievements
          </p>
        </div>

        <div className="space-y-6">
          {QUESTS.map(quest => {
            const completedInQuest = quest.missionIds.filter(id => player.completedMissions.includes(id));
            const progress = (completedInQuest.length / quest.requiredMissions) * 100;
            const isComplete = completedInQuest.length >= quest.requiredMissions;
            const nextMission = quest.missionIds.find(id => !player.completedMissions.includes(id));
            const nextMissionData = nextMission ? MISSIONS.find(m => m.id === nextMission) : null;

            return (
              <div
                key={quest.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isComplete
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card/80 hover:border-primary/20'
                }`}
              >
                {/* Quest Header */}
                <div className="p-5 flex items-start gap-4">
                  <div className={`text-3xl ${isComplete ? '' : 'grayscale opacity-70'}`}>
                    {quest.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-mono text-sm font-bold text-foreground">{quest.title}</h2>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {quest.codename}
                      </Badge>
                      {isComplete && (
                        <Badge className="font-mono text-[10px] bg-primary text-primary-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETE
                        </Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{quest.description}</p>

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {completedInQuest.length}/{quest.requiredMissions}
                      </span>
                    </div>

                    {/* Mission chain visualization */}
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      {quest.missionIds.map((mId, i) => {
                        const m = MISSIONS.find(mi => mi.id === mId);
                        const done = player.completedMissions.includes(mId);
                        const isCurrent = mId === nextMission;
                        return (
                          <div key={mId} className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/mission/${mId}`)}
                              className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                                done
                                  ? 'border-primary/30 bg-primary/10 text-primary'
                                  : isCurrent
                                  ? 'border-primary/50 bg-primary/5 text-foreground animate-pulse'
                                  : 'border-border text-muted-foreground'
                              }`}
                              title={m?.title}
                            >
                              {done ? '✓' : isCurrent ? '▶' : <Lock className="w-2.5 h-2.5 inline" />}
                              {' '}{m?.codename || mId}
                            </button>
                            {i < quest.missionIds.length - 1 && (
                              <span className={`text-[10px] ${done ? 'text-primary' : 'text-muted-foreground/30'}`}>→</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Rewards */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3 h-3 text-warning" />
                        <span className="font-mono text-[10px] text-warning">+{quest.bonusXp} BONUS XP</span>
                      </div>
                      {!isComplete && nextMissionData && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-mono text-[10px] h-6 px-2 gap-1"
                          onClick={() => navigate(`/mission/${nextMission}`)}
                        >
                          <Play className="w-3 h-3" /> NEXT: {nextMissionData.codename}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story text (expandable) */}
                {isComplete && (
                  <div className="px-5 pb-4 border-t border-primary/10 pt-3">
                    <p className="font-mono text-[10px] text-primary/80 whitespace-pre-line leading-relaxed">
                      {quest.storyOutro}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
