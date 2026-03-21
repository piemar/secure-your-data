import { useState, useEffect, useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { ChaosEventOverlay } from '@/components/ChaosEventOverlay';
import { TypewriterText } from '@/components/TypewriterText';
import { CodeEditor } from '@/components/CodeEditor';
import { MissionCelebration } from '@/components/MissionCelebration';
import { DifficultySelector } from '@/components/DifficultySelector';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player, MissionObjective, ChaosEvent, MissionDifficulty, InlineHint } from '@/lib/types';

type HintState = 'unrevealed' | 'hint-shown' | 'answer-shown';
import { getPlayer, completeMission, unlockAchievement, updatePlayer } from '@/lib/game-store';
import { MISSIONS } from '@/content/missions/mission';
import { getSkeletonForDifficulty, getHintsForDifficulty } from '@/content/missions/skeletons';
import { MISSION_VALIDATIONS } from '@/content/missions/validation';
import { validateAllObjectives, ValidationResult } from '@/lib/validation';
import { useSandboxExecution } from '@/hooks/useSandboxExecution';
import { useTerminalShell } from '@/hooks/useTerminalShell';
import { TerminalPanel } from '@/components/TerminalPanel';
import { IDELauncher } from '@/components/IDELauncher';
import { soundEngine } from '@/lib/sound-engine';
import { CheckCircle2, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { api, getAuthToken } from '@/services/api';
import { pullPlayerFromServer } from '@/lib/player-sync';
import {
  buildGeneratedLanguageCode,
  buildGeneratedLanguageRunCommand,
  buildMongoshRunCommandExecMode,
  EDITOR_LANGUAGE_IDS,
  LANGUAGE_LABELS,
  type MissionCodeLanguage,
} from '@/lib/mission-language-runtime';

function tokenizeSkeletonBlanks(skeleton: string): string {
  let idx = 0;
  return skeleton.replace(/___BLANK___/g, () => `___BLANK_${idx++}___`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeMongoshPrompt(text: string): boolean {
  if (!text) return false;
  const tail = text.trimEnd();
  return (
    /\[[^\]]+\]\s+\S+>\s*$/.test(tail) ||
    /\b\w+>\s*$/.test(tail)
  );
}

function splitMongoshStatements(code: string): string[] {
  const source = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!source) return [];
  const parts: string[] = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escape = false;
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;

  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    const n = i + 1 < source.length ? source[i + 1] : '';

    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && n === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inSingle || inDouble || inTemplate) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && c === "'") inSingle = false;
      else if (inDouble && c === '"') inDouble = false;
      else if (inTemplate && c === '`') inTemplate = false;
      continue;
    }

    if (c === '/' && n === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      continue;
    }
    if (c === '`') {
      inTemplate = true;
      continue;
    }
    if (c === '(') depthParen += 1;
    else if (c === ')') depthParen = Math.max(0, depthParen - 1);
    else if (c === '{') depthBrace += 1;
    else if (c === '}') depthBrace = Math.max(0, depthBrace - 1);
    else if (c === '[') depthBracket += 1;
    else if (c === ']') depthBracket = Math.max(0, depthBracket - 1);

    if (c === ';' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      const statement = source.slice(start, i + 1).trim();
      if (statement) parts.push(statement);
      start = i + 1;
    }
  }

  const rest = source.slice(start).trim();
  if (rest) parts.push(rest);
  return parts;
}

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
  const [answeredBlanks, setAnsweredBlanks] = useState<Map<number, string>>(new Map());
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('guided');
  const [hints, setHints] = useState<InlineHint[]>([]);
  const [hintStates, setHintStates] = useState<Map<number, HintState>>(new Map());
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintXpPenalty, setHintXpPenalty] = useState(0);
  const [isTerminalPlaybackRunning, setIsTerminalPlaybackRunning] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [isResizingBottomPanel, setIsResizingBottomPanel] = useState(false);
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState<MissionCodeLanguage>('mongosh');
  const resizeStartRef = useRef<{ y: number; height: number } | null>(null);

  const mission = MISSIONS.find(m => m.id === missionId);

  // Sandbox execution hook
  const sandbox = useSandboxExecution(missionId);
  const shellTerminal = useTerminalShell(phase === 'active');

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
      const skeleton = tokenizeSkeletonBlanks(getSkeletonForDifficulty(mission.id, difficulty));
      setCode(skeleton);
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
    const current = hintStates.get(hintIndex);
    if (current && current !== 'unrevealed') return;
    const hint = hints[hintIndex];
    if (!hint) return;
    soundEngine.play('click');
    setHintStates(prev => new Map(prev).set(hintIndex, 'hint-shown'));
    setHintsUsedCount(prev => prev + 1);
    const penalty = Math.round((hint.xpPenalty || 25) * 0.6);
    setHintXpPenalty(prev => prev + penalty);
  }, [hints, hintStates]);

  const handleRevealAnswer = useCallback((hintIndex: number) => {
    const hint = hints[hintIndex];
    if (!hint) return;
    const current = hintStates.get(hintIndex);
    soundEngine.play('click');
    setHintStates(prev => new Map(prev).set(hintIndex, 'answer-shown'));
    if (current !== 'hint-shown') {
      setHintsUsedCount(prev => prev + 1);
    }
    const answerPenalty = Math.round((hint.xpPenalty || 25) * 0.4);
    setHintXpPenalty(prev => prev + answerPenalty);

    const token = `___BLANK_${hintIndex}___`;
    const newAnswered = new Map(answeredBlanks).set(hintIndex, hint.answer);
    setAnsweredBlanks(newAnswered);
    setCode(prev => prev.replace(token, hint.answer));
  }, [hints, hintStates, answeredBlanks]);

  const handleBeginMission = useCallback(async () => {
    if (sandbox.tier === 'hold') {
      shellTerminal.appendTranscriptMessage(
        'This mission is currently on hold while Tier 3 cloud validation is being rebuilt.'
      );
      return;
    }
    if (player) {
      updatePlayer({ preferredDifficulty: difficulty });
    }
    const skeleton = tokenizeSkeletonBlanks(getSkeletonForDifficulty(mission!.id, difficulty));
    setCode(skeleton);
    setAnsweredBlanks(new Map());
    setHints(getHintsForDifficulty(mission!.id, difficulty));
    setHintStates(new Map());
    setHintsUsedCount(0);
    setHintXpPenalty(0);
    shellTerminal.clear();

    // Create sandbox for Tier 2 missions
    await sandbox.createSandbox();

    setPhase('active');
  }, [player, difficulty, mission, sandbox, shellTerminal]);

  const handleValidate = useCallback(async () => {
    if (!mission) return;
    if (sandbox.tier === 'hold') {
      shellTerminal.appendTranscriptMessage(
        'Run + Validate is disabled: this mission is on hold.'
      );
      return;
    }
    soundEngine.play('validate');
    if (shellTerminal.mode !== 'pty') {
      shellTerminal.appendTranscriptInput(code);
    }
    if (shellTerminal.mode !== 'pty') {
      shellTerminal.appendTranscriptMessage('Run + Validate invoked.');
    }

    // Step 1: Client-side pattern validation (instant)
    const validations = MISSION_VALIDATIONS[mission.id] || [];
    const patternResults = validateAllObjectives(code, validations);

    if (sandbox.tier === 'execute') {
      try {
        const status = await api.execute.status();
        const dbName =
          (typeof sandbox.sandboxDbName === 'string' && sandbox.sandboxDbName.trim())
            ? sandbox.sandboxDbName
            : (typeof status.dbName === 'string' ? status.dbName : undefined);
        if (selectedCodeLanguage === 'mongosh') {
          if (shellTerminal.mode === 'pty') {
            setIsTerminalPlaybackRunning(true);
            try {
            const uriExpr =
              '${MONGOSH_CONNECTION_STRING:-${MDB_CONNECTION_STRING:-${MONGODB_CONNECTION_STRING:-${MONGODB_URI:-mongodb://127.0.0.1:27017}}}}';
            const statements = splitMongoshStatements(code);
            const waitForPrompt = async (maxMs = 1200): Promise<boolean> => {
              const started = Date.now();
              let delayMs = 12;
              while (Date.now() - started < maxMs) {
                if (looksLikeMongoshPrompt(shellTerminal.getStreamTail(5000))) {
                  return true;
                }
                await sleep(delayMs);
                if (delayMs < 55) delayMs += 6;
              }
              return false;
            };

            // Reset any stuck state before opening a fresh mongosh prompt.
            shellTerminal.sendInputData('\u0003');
            await sleep(40);
            shellTerminal.sendInputData('\u0003');
            await sleep(70);
            shellTerminal.sendInputData('\n');
            await sleep(60);
            shellTerminal.sendInputData(`MONGOSH_URI="${uriExpr}"\n`);
            await sleep(30);
            shellTerminal.sendInputData('mongosh "$MONGOSH_URI"\n');
            await waitForPrompt(3200);
            if (dbName) {
              shellTerminal.sendInputData(`use ${dbName}\n`);
              await waitForPrompt(900);
            }
            for (let idx = 0; idx < statements.length; idx += 1) {
              const statement = statements[idx];
              shellTerminal.sendInputData('.editor\n');
              await sleep(35);
              shellTerminal.sendInputData(`// Statement ${idx + 1}\n`);
              shellTerminal.sendInputData(`${statement}\n`);
              shellTerminal.sendInputData('\u0004');
              await waitForPrompt(900);
            }
            // Refresh shell prompt/cursor position after automated editor playback.
            shellTerminal.sendInputData('\n');
            } finally {
              setIsTerminalPlaybackRunning(false);
            }
          } else {
            shellTerminal.appendTranscriptMessage(
              `Executing code via mongosh${dbName ? ` (db: ${dbName})` : ''}...`
            );
            const shellResult = await shellTerminal.submit(buildMongoshRunCommandExecMode(code, dbName, false));
            if (!shellResult) {
              shellTerminal.appendTranscriptMessage(
                'Shell session not ready; continuing with backend validation runner.'
              );
            }
          }
        } else {
          shellTerminal.appendTranscriptMessage(
            `Executing mission baseline via ${LANGUAGE_LABELS[selectedCodeLanguage]} runtime...`
          );
          const runtimeCmd = buildGeneratedLanguageRunCommand(selectedCodeLanguage, code, dbName);
          const runtimeResult = await shellTerminal.submit(runtimeCmd);
          if (!runtimeResult && shellTerminal.mode !== 'pty') {
            shellTerminal.appendTranscriptMessage(
              'Runtime session not ready; continuing with backend validation runner.'
            );
          }
        }
        if (selectedCodeLanguage !== 'mongosh' && shellTerminal.mode === 'pty') {
          shellTerminal.appendTranscriptMessage(
            `${LANGUAGE_LABELS[selectedCodeLanguage]} execution finished. Shell remains active for manual commands.`
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'language runtime execution failed';
        shellTerminal.appendTranscriptMessage(`Runtime execution error: ${message}`);
      }
    }

    // Step 2: Server-side execution + verification (async for Tier 2/3)
    const mergedResults = await sandbox.runFullValidation(code, patternResults, {
      skipExecute: shellTerminal.mode === 'pty' && selectedCodeLanguage === 'mongosh',
    });

    setValidationResults(mergedResults);
    setHasValidated(true);

    const newObjectives = objectives.map(obj => {
      const result = mergedResults.find(r => r.objectiveId === obj.id);
      return result?.passed ? { ...obj, completed: true } : obj;
    });
    setObjectives(newObjectives);

    const allPassed = newObjectives.every(o => o.completed);
    if (shellTerminal.mode !== 'pty') {
      shellTerminal.appendTranscriptMessage(
        `Validation completed: ${newObjectives.filter(o => o.completed).length}/${newObjectives.length} objectives passed.`
      );
    }
    if (allPassed) soundEngine.play('success');
  }, [code, mission, objectives, sandbox, shellTerminal, selectedCodeLanguage]);

  const handleResetCode = useCallback(() => {
    if (mission) {
      const skeleton = tokenizeSkeletonBlanks(getSkeletonForDifficulty(mission.id, difficulty));
      setCode(skeleton);
      setAnsweredBlanks(new Map());
      setHintStates(new Map());
      setHintsUsedCount(0);
      setHintXpPenalty(0);
      setIsTerminalPlaybackRunning(false);
      setValidationResults([]);
      setHasValidated(false);
      setSelectedCodeLanguage('mongosh');
      setObjectives(prev => prev.map(o => ({ ...o, completed: false })));
      sandbox.clearOutput();
      shellTerminal.clear();
    }
  }, [mission, difficulty, sandbox, shellTerminal]);

  const handleComplete = useCallback(async () => {
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

    // If authenticated, persist mission completion server-side and hydrate local cache from server.
    if (getAuthToken()) {
      try {
        await api.missions.complete(mission.id, earned);
        const synced = await pullPlayerFromServer(updated.handle);
        if (synced) updated = synced;
      } catch {
        // Local progress still advances to keep solo/offline mode resilient.
      }
    }

    setPlayer(updated);

    // Destroy sandbox on completion
    await sandbox.destroySandbox();

    setPhase('complete');
  }, [mission, player, objectives, timeRemaining, difficulty, hintXpPenalty, hintsUsedCount, triggeredChaos, sandbox]);

  const handleStartBottomResize = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
    }
    resizeStartRef.current = { y: e.clientY, height: bottomPanelHeight };
    setIsResizingBottomPanel(true);
  }, [bottomPanelHeight]);

  useEffect(() => {
    if (!isResizingBottomPanel) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const delta = e.clientY - resizeStartRef.current.y;
      const next = Math.max(150, Math.min(520, resizeStartRef.current.height - delta));
      setBottomPanelHeight(next);
    };
    const onMouseUp = () => {
      setIsResizingBottomPanel(false);
      resizeStartRef.current = null;
      if (typeof document !== 'undefined') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizingBottomPanel]);

  if (!mission || !player) return null;

  const allComplete = objectives.every(o => o.completed);
  const isValidating = sandbox.isExecuting || sandbox.isVerifying;
  const validationByObjective = new Map(validationResults.map((result) => [result.objectiveId, result]));
  const completedCount = objectives.filter((o) => o.completed).length;
  const generatedLanguageCode =
    selectedCodeLanguage === 'mongosh'
      ? code
      : buildGeneratedLanguageCode(selectedCodeLanguage, code);
  const editorLanguageId = EDITOR_LANGUAGE_IDS[selectedCodeLanguage];
  const editorReadOnly = selectedCodeLanguage !== 'mongosh';

  const hintCounts = {
    guided: getHintsForDifficulty(mission.id, 'guided').length,
    challenge: getHintsForDifficulty(mission.id, 'challenge').length,
  };

  const ideLauncherEnabled = import.meta.env.VITE_ENABLE_IDE_LAUNCHER === 'true';

  return (
    <div className="min-h-screen bg-background/70">
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
                    <div className="text-muted-foreground">Validation</div>
                    <div className="text-accent font-bold">{sandbox.tier.toUpperCase()}</div>
                  </div>
                  {sandbox.tier === 'hold' && (
                    <div className="mt-3 rounded border border-warning/30 bg-warning/10 px-3 py-2 font-mono text-[11px] text-warning">
                      Tier 3 mission is temporarily on hold. Please use Tier 1 or Tier 2 missions for active run + validate.
                    </div>
                  )}
                </div>

                <div className="border border-border rounded-lg p-4 bg-card">
                  <h3 className="font-mono text-xs font-bold text-foreground mb-3">SELECT DIFFICULTY</h3>
                  <DifficultySelector
                    selected={difficulty}
                    onChange={setDifficulty}
                    hintCounts={hintCounts}
                  />
                </div>

                <Button
                  onClick={handleBeginMission}
                  disabled={sandbox.isCreating || sandbox.tier === 'hold'}
                  className="w-full font-mono font-bold tracking-wider animate-pulse-glow"
                >
                  {sandbox.isCreating
                    ? '[ INITIALIZING SANDBOX... ]'
                    : `[ BEGIN MISSION — ${difficulty.toUpperCase()} ]`
                  }
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Phase — VSCode-style workspace */}
        {phase === 'active' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Workspace */}
            <div
              className="lg:col-span-9 border border-border/50 rounded-md bg-[#0f1217] overflow-hidden flex flex-col"
              style={{ minHeight: '70vh', maxHeight: 'calc(100vh - 7.5rem)' }}
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-[#151a21] border-b border-border/40 shrink-0 flex-wrap">
                <span className="font-mono text-sm text-foreground">{mission.title}</span>
                <Select
                  value={selectedCodeLanguage}
                  onValueChange={(value) => setSelectedCodeLanguage(value as MissionCodeLanguage)}
                >
                  <SelectTrigger className="h-7 w-40 font-mono text-[11px] bg-[#0f1318] border-border/60 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mongosh">Mongosh</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleValidate}
                  disabled={isValidating || sandbox.tier === 'hold'}
                  className="ml-auto font-mono text-[11px] h-7 px-3 gap-1.5"
                  size="sm"
                >
                  <Play className="w-3 h-3" />
                  {isValidating ? 'VALIDATING...' : 'RUN'}
                </Button>
                <Button
                  onClick={handleResetCode}
                  variant="outline"
                  className="font-mono text-[11px] h-7 px-3 gap-1.5"
                  size="sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  RESET
                </Button>
              </div>

              <div className="grid min-h-[52vh] border-b border-border/40 bg-[#0f1318] grid-cols-1">
                <div className="relative min-h-[52vh]">
                  <CodeEditor
                    value={generatedLanguageCode}
                    onChange={setCode}
                    language={editorLanguageId}
                    readOnly={editorReadOnly}
                    hints={editorReadOnly ? [] : hints}
                    hintStates={editorReadOnly ? new Map() : hintStates}
                    onRevealHint={handleRevealHint}
                    onRevealAnswer={handleRevealAnswer}
                  />
                </div>
              </div>

              <div
                className={`h-4 shrink-0 cursor-row-resize relative ${
                  isResizingBottomPanel ? 'bg-primary/10' : 'bg-transparent'
                }`}
                onMouseDown={handleStartBottomResize}
                title="Drag to resize terminal panel"
              >
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border/40" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto h-1 w-14 rounded-full bg-border/50" />
              </div>

              <div className="flex flex-col min-h-0 border-t border-border/40 bg-[#0f1318]" style={{ height: `${bottomPanelHeight}px` }}>
                <div className="w-full border-b border-border/40 p-0 h-8 shrink-0 flex items-center px-4 bg-[#151a21]">
                  <span className="font-mono text-[10px] text-foreground">TERMINAL</span>
                </div>
                <div className="flex-1 min-h-0 p-3 flex flex-col">
                  <TerminalPanel
                    lines={shellTerminal.lines}
                    rawChunks={shellTerminal.streamChunks}
                    rawMode={shellTerminal.mode === 'pty'}
                    inputValue={shellTerminal.input}
                    onInputChange={shellTerminal.setInput}
                    onSubmit={() => void shellTerminal.submit()}
                    onSubmitCommand={(cmd) => void shellTerminal.submit(cmd)}
                    onInputData={shellTerminal.sendInputData}
                    onResizeTerminal={shellTerminal.resizeTerminal}
                    isRunning={shellTerminal.isRunning}
                    disabled={!shellTerminal.isReady || isTerminalPlaybackRunning}
                    disabledHint={shellTerminal.disabledReason}
                    onNavigateHistory={shellTerminal.navigateHistory}
                    onClear={shellTerminal.clear}
                    minHeight="min-h-0 flex-1"
                    title="TERMINAL"
                    showHeader={false}
                    interactiveInput
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar: Objectives + controls */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="border border-primary/25 rounded-lg p-4 bg-card/85 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-sm font-bold text-foreground tracking-wide">OBJECTIVES</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-primary font-semibold">
                      {completedCount}/{objectives.length} objectives
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground uppercase">{difficulty}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {objectives.map((obj, i) => (
                    <div
                      key={obj.id}
                      className={`p-3 rounded-md border transition-all text-xs shadow-[inset_0_0_0_1px_rgba(0,255,133,0.05)] ${
                        obj.completed
                          ? 'border-primary/40 bg-primary/10'
                          : (hasValidated && validationByObjective.get(obj.id)?.passed === false)
                            ? 'border-destructive/50 bg-destructive/10'
                            : 'border-primary/25 bg-[#101a17]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {obj.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        ) : (hasValidated && validationByObjective.get(obj.id)?.passed === false) ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <p
                          className={`font-mono ${
                            obj.completed
                              ? 'text-primary font-semibold'
                              : (hasValidated && validationByObjective.get(obj.id)?.passed === false)
                                ? 'text-destructive font-semibold'
                                : 'text-foreground/95'
                          }`}
                        >
                          <span className="text-primary/90 mr-1 font-semibold">[{String(i + 1).padStart(2, '0')}]</span>
                          {obj.text}
                        </p>
                      </div>
                      {hasValidated && validationByObjective.get(obj.id)?.message && (
                        <p className="pl-6 pt-1 font-mono text-[11px] text-muted-foreground">
                          {validationByObjective.get(obj.id)?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {ideLauncherEnabled && (
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="font-mono text-[10px] text-muted-foreground mb-2">EXTERNAL IDE</div>
                  <IDELauncher compact />
                </div>
              )}

              <Button
                onClick={handleComplete}
                disabled={!allComplete}
                className="w-full font-mono font-bold tracking-wider text-xs"
                variant={allComplete ? 'default' : 'secondary'}
              >
                {allComplete
                  ? '[ EXTRACT — COMPLETE MISSION ]'
                  : `[ ${objectives.filter(o => o.completed).length}/${objectives.length} OBJECTIVES REMAINING ]`}
              </Button>
            </aside>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <MissionCelebration
            missionTitle={mission.title}
            xpEarned={xpEarned}
            timeRemaining={timeRemaining}
            chaosSurvived={triggeredChaos.size}
            hintsUsed={Array.from(hintStates.values()).filter(s => s === 'hint-shown').length}
            answersRevealed={Array.from(hintStates.values()).filter(s => s === 'answer-shown').length}
            hintXpPenalty={hintXpPenalty}
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
