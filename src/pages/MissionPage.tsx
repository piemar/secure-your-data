import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { ChaosEventOverlay } from '@/components/ChaosEventOverlay';
import { TypewriterText } from '@/components/TypewriterText';
import { CodeEditor } from '@/components/CodeEditor';
import { ComboStreak } from '@/components/ComboStreak';
import { ValidationFeedback } from '@/components/ValidationFeedback';
import { MissionCelebration } from '@/components/MissionCelebration';
import { DifficultySelector } from '@/components/DifficultySelector';
import { Button } from '@/components/ui/button';
import { Player, MissionObjective, ChaosEvent, MissionDifficulty, InlineHint } from '@/lib/types';

type HintState = 'unrevealed' | 'hint-shown' | 'answer-shown';
import { getPlayer, completeMission, unlockAchievement, updatePlayer } from '@/lib/game-store';
import { MISSIONS } from '@/lib/game-data';
import { getSkeletonForDifficulty, getHintsForDifficulty } from '@/lib/mission-skeletons';
import { MISSION_VALIDATIONS } from '@/lib/mission-validations';
import { validateAllObjectives, ValidationResult } from '@/lib/validation';
import { soundEngine } from '@/lib/sound-engine';
import { CheckCircle2, AlertTriangle, Play, RotateCcw } from 'lucide-react';

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
  const [code, setCode] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('guided');
  const [hints, setHints] = useState<InlineHint[]>([]);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintXpPenalty, setHintXpPenalty] = useState(0);

  const mission = MISSIONS.find(m => m.id === missionId);

  useEffect(() => {
    const p = getPlayer();
    if (!p) { navigate('/'); return; }
    setPlayer(p);
    if (p.preferredDifficulty) setDifficulty(p.preferredDifficulty);
    if (mission) {
      setTimeRemaining(mission.timeLimit);
      setObjectives(mission.objectives.map(o => ({ ...o, completed: false })));
    }
  }, [navigate, mission]);

  // Load skeleton when difficulty changes (before mission starts)
  useEffect(() => {
    if (mission && phase === 'briefing') {
      setCode(getSkeletonForDifficulty(mission.id, difficulty));
      setHints(getHintsForDifficulty(mission.id, difficulty));
    }
  }, [mission, difficulty, phase]);

  // Timer with heartbeat
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          soundEngine.play('error');
          setPhase('failed');
          return 0;
        }
        if (prev <= 60 && prev % 2 === 0) soundEngine.play('tick');
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
        soundEngine.play('chaos');
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

  const handleRevealHint = useCallback((hintIndex: number) => {
    if (revealedHints.has(hintIndex)) return;
    const hint = hints[hintIndex];
    if (!hint) return;
    soundEngine.play('click');
    setRevealedHints(prev => new Set(prev).add(hintIndex));
    setHintsUsedCount(prev => prev + 1);
    const penalty = hint.xpPenalty || 25;
    setHintXpPenalty(prev => prev + penalty);
  }, [hints, revealedHints]);

  const handleBeginMission = () => {
    // Save preferred difficulty
    if (player) {
      updatePlayer({ preferredDifficulty: difficulty });
    }
    setCode(getSkeletonForDifficulty(mission!.id, difficulty));
    setHints(getHintsForDifficulty(mission!.id, difficulty));
    setRevealedHints(new Set());
    setHintsUsedCount(0);
    setHintXpPenalty(0);
    setPhase('active');
  };

  const handleValidate = useCallback(() => {
    if (!mission) return;
    soundEngine.play('validate');
    const validations = MISSION_VALIDATIONS[mission.id] || [];
    const results = validateAllObjectives(code, validations);
    setValidationResults(results);
    setHasValidated(true);

    const newObjectives = objectives.map(obj => {
      const result = results.find(r => r.objectiveId === obj.id);
      return result?.passed ? { ...obj, completed: true } : obj;
    });
    setObjectives(newObjectives);

    const allPassed = newObjectives.every(o => o.completed);
    if (allPassed) soundEngine.play('success');
  }, [code, mission, objectives]);

  const handleResetCode = useCallback(() => {
    if (mission) {
      setCode(getSkeletonForDifficulty(mission.id, difficulty));
      setValidationResults([]);
      setHasValidated(false);
      setObjectives(prev => prev.map(o => ({ ...o, completed: false })));
    }
  }, [mission, difficulty]);

  const handleComplete = () => {
    if (!mission || !player) return;
    const completedCount = objectives.filter(o => o.completed).length;
    const completionBonus = completedCount === objectives.length ? 1.5 : completedCount / objectives.length;
    const timeBonus = timeRemaining > mission.timeLimit * 0.5 ? 1.3 : 1;
    const difficultyMultiplier = difficulty === 'expert' ? 1.5 : difficulty === 'challenge' ? 1.2 : 1;
    const baseXp = Math.round(mission.xpReward * completionBonus * timeBonus * difficultyMultiplier);
    const earned = Math.max(0, baseXp - hintXpPenalty);
    setXpEarned(earned);

    let updated = completeMission(mission.id, earned);
    updated = updatePlayer({ hintsUsed: updated.hintsUsed + hintsUsedCount, hintXpPenalty: updated.hintXpPenalty + hintXpPenalty });

    if (updated.completedMissions.length === 1) updated = unlockAchievement('first-blood');
    if (timeRemaining > mission.timeLimit - 120) updated = unlockAchievement('speed-demon');
    if (triggeredChaos.size > 0) updated = unlockAchievement('chaos-survivor');
    if (completedCount === objectives.length && triggeredChaos.size === 0) updated = unlockAchievement('perfect-run');
    if (updated.completedMissions.length === MISSIONS.length) updated = unlockAchievement('full-collection');
    if (updated.chaosEventsSurvived >= 5) updated = unlockAchievement('cluster-whisperer');
    if (difficulty === 'expert' && hintsUsedCount === 0) {
      // Track expert completions for 'no-hints' achievement
    }

    setPlayer(updated);
    setPhase('complete');
  };

  if (!mission || !player) return null;

  const allComplete = objectives.every(o => o.completed);
  const objectiveTexts = Object.fromEntries(objectives.map(o => [o.id, o.text]));

  const hintCounts = {
    guided: getHintsForDifficulty(mission.id, 'guided').length,
    challenge: getHintsForDifficulty(mission.id, 'challenge').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <HUDBar
        player={player}
        timeRemaining={timeRemaining}
        systemStability={systemStability}
        showTimer={phase === 'active'}
        hintsUsed={hintsUsedCount}
        hintPenalty={hintXpPenalty}
      />

      {activeChaos && <ChaosEventOverlay event={activeChaos} onDismiss={handleDismissChaos} />}

      <div className="pt-16 pb-8 px-4 max-w-7xl mx-auto">
        {/* Briefing Phase */}
        {phase === 'briefing' && (
          <div className="mt-8 space-y-6 max-w-4xl mx-auto">
            <div className="border border-primary/20 rounded-lg p-6 bg-card border-glow">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs text-primary animate-pulse">●</span>
                  <span className="font-mono text-xs text-primary">INCOMING TRANSMISSION</span>
                </div>
                <h2 className="font-mono text-xl font-bold text-foreground">{mission.title}</h2>
                <div className="font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  <TypewriterText text={mission.briefing} speed={15} onComplete={() => setBriefingDone(true)} />
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

                {/* Difficulty Selector */}
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-mono text-xs font-bold text-foreground mb-3">SELECT DIFFICULTY</h3>
                  <DifficultySelector
                    selected={difficulty}
                    onChange={setDifficulty}
                    hintCounts={hintCounts}
                  />
                </div>

                <Button onClick={handleBeginMission} className="w-full font-mono font-bold tracking-wider animate-pulse-glow">
                  [ BEGIN MISSION — {difficulty.toUpperCase()} ]
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Phase — Split Layout */}
        {phase === 'active' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left Panel: Objectives + Hints */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-xs font-bold text-foreground">OBJECTIVES</h3>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">{difficulty}</span>
                </div>
                <div className="space-y-2">
                  {objectives.map((obj, i) => (
                    <div
                      key={obj.id}
                      className={`flex items-start gap-2 p-2 rounded border transition-all text-xs ${
                        obj.completed ? 'border-primary/30 bg-primary/5' : 'border-border'
                      }`}
                    >
                      {obj.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <p className={`font-mono ${obj.completed ? 'text-primary line-through' : 'text-foreground'}`}>
                        <span className="text-muted-foreground mr-1">[{String(i + 1).padStart(2, '0')}]</span>
                        {obj.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Hints Panel */}
              {hints.length > 0 && (
                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-warning" />
                    HINTS ({hintsUsedCount}/{hints.length} revealed)
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {hints.map((hint, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {revealedHints.has(i) ? (
                          <div className="text-xs font-mono p-2 rounded bg-warning/10 border border-warning/20 w-full">
                            <span className="text-warning text-[10px]">HINT (−{hint.xpPenalty || 25} XP):</span>
                            <p className="text-foreground mt-0.5">{hint.hint}</p>
                            {hint.answer && (
                              <p className="text-primary mt-1 font-bold">→ {hint.answer}</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRevealHint(i)}
                            className="text-xs font-mono p-2 rounded border border-dashed border-muted-foreground/30 w-full text-left hover:border-warning/50 hover:bg-warning/5 transition-colors"
                          >
                            <span className="text-muted-foreground">💡 Hint #{i + 1}</span>
                            <span className="text-destructive/60 ml-2">(−{hint.xpPenalty || 25} XP)</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Actions */}
              <div className="flex gap-2">
                <Button onClick={handleValidate} className="flex-1 font-mono text-xs gap-1.5" size="sm">
                  <Play className="w-3 h-3" /> VALIDATE CODE
                </Button>
                <Button onClick={handleResetCode} variant="outline" className="font-mono text-xs gap-1.5" size="sm">
                  <RotateCcw className="w-3 h-3" /> RESET
                </Button>
              </div>

              {hasValidated && (
                <ValidationFeedback results={validationResults} objectiveTexts={objectiveTexts} />
              )}

              <Button
                onClick={handleComplete}
                disabled={!allComplete}
                className="w-full font-mono font-bold tracking-wider text-xs"
                variant={allComplete ? 'default' : 'secondary'}
              >
                {allComplete ? '[ EXTRACT — COMPLETE MISSION ]' : `[ ${objectives.filter(o => o.completed).length}/${objectives.length} OBJECTIVES REMAINING ]`}
              </Button>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="lg:col-span-3 border border-border rounded-lg bg-card overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border shrink-0">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-warning" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono text-[10px] text-muted-foreground ml-2">mongosh — {mission.codename}</span>
                <span className="ml-auto font-mono text-[10px] text-primary/50">
                  {objectives.filter(o => o.completed).length}/{objectives.length} objectives
                </span>
                {hintXpPenalty > 0 && (
                  <span className="font-mono text-[10px] text-destructive/70">−{hintXpPenalty} XP</span>
                )}
              </div>
              <div className="flex-1 relative">
                <ComboStreak code={code} isActive={phase === 'active'} />
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="javascript"
                  hints={hints}
                  revealedHints={revealedHints}
                  onRevealHint={handleRevealHint}
                />
              </div>
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <MissionCelebration
            missionTitle={mission.title}
            xpEarned={xpEarned}
            timeRemaining={timeRemaining}
            chaosSurvived={triggeredChaos.size}
            onDashboard={() => navigate('/dashboard')}
            onLeaderboard={() => navigate('/leaderboard')}
          />
        )}

        {/* Failed Phase */}
        {phase === 'failed' && (
          <div className="mt-8 space-y-6 text-center max-w-2xl mx-auto">
            <div className="border border-destructive/30 rounded-lg p-8 bg-card animate-slide-up">
              <div className="text-4xl mb-4">💀</div>
              <h2 className="font-mono text-xl font-bold text-destructive mb-2">MISSION FAILED</h2>
              <p className="font-mono text-sm text-muted-foreground">Time expired. The data was lost.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="font-mono">← RETREAT</Button>
              <Button onClick={() => window.location.reload()} className="font-mono">RETRY MISSION</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
