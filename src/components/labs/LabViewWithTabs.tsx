import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabIntroTab } from './LabIntroTab';
import { StepView } from './StepView';
import { useLab } from '@/context/LabContext';
import { heartbeat } from '@/utils/leaderboardUtils';
import { validatorUtils } from '@/utils/validatorUtils';
import { DifficultyLevel } from './DifficultyBadge';
import { Database, Info, BookOpen, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  type: 'quiz' | 'fill_blank' | 'challenge';
  title: string;
  description?: string;
  points?: number;
  question?: string;
  options?: Array<{ id: string; label: string; isCorrect: boolean }>;
  codeTemplate?: string;
  blanks?: Array<{ id: string; placeholder: string; correctAnswer: string; hint?: string }>;
  challengeSteps?: Array<{ instruction: string; hint?: string }>;
}

interface Step {
  id: string;
  title: string;
  estimatedTime: string;
  description: string;
  difficulty?: DifficultyLevel;
  understandSection?: string;
  doThisSection?: string[];
  hints?: string[];
  codeBlocks?: Array<{
    filename: string;
    language: string;
    code: string;
    skeleton?: string;
  }>;
  expectedOutput?: string;
  troubleshooting?: string[];
  tips?: string[];
  documentationUrl?: string;
  onVerify?: () => Promise<{ success: boolean; message: string }>;
  exercises?: Exercise[];
}

interface LabIntroContent {
  whatYouWillBuild: string[];
  keyConcepts: Array<{ term: string; explanation: string }>;
  keyInsight: string;
  architectureDiagram?: React.ReactNode;
  showEncryptionFlow?: boolean;
  encryptionFlowType?: 'csfle' | 'qe';
}

interface LabViewWithTabsProps {
  labNumber: number;
  title: string;
  description: string;
  duration: string;
  prerequisites: string[];
  objectives: string[];
  steps: Step[];
  introContent: LabIntroContent;
  businessValue?: string;
  atlasCapability?: string;
}

export function LabViewWithTabs({
  labNumber,
  title,
  description,
  duration,
  steps,
  introContent,
  businessValue,
  atlasCapability,
}: LabViewWithTabsProps) {
  const { startLab, completeLab, userEmail, mongoUri: labMongoUri } = useLab();
  const storageKey = `lab${labNumber}-progress`;
  const stepIndexKey = `lab${labNumber}-currentStep`;
  const outputByStepKey = `lab${labNumber}-output-by-step`;

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const saved = localStorage.getItem(stepIndexKey);
    const n = saved ? parseInt(saved, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Output per step: console (run log) + verify result (persists on refresh)
  const [outputByStep, setOutputByStep] = useState<Record<number, {
    output?: string;
    verifyOutput?: string;
    summary?: string;
    success?: boolean;
  }>>(() => {
    try {
      const raw = localStorage.getItem(outputByStepKey);
      if (raw) {
        const o = JSON.parse(raw);
        return o && typeof o === 'object' ? o : {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [outputOpen, setOutputOpen] = useState<boolean>(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState<boolean>(false);
  const [resetStepTrigger, setResetStepTrigger] = useState<number>(0);
  const resetStepClearerRef = useRef<((stepIndex: number) => void) | null>(null);

  const prevCompletedCountRef = useRef<number | undefined>(undefined);

  // Start lab tracking on mount and send heartbeat
  useEffect(() => {
    startLab(labNumber);
    
    // Send heartbeat every 30 seconds to update time tracking
    const heartbeatInterval = setInterval(() => {
      if (userEmail) {
        heartbeat(userEmail, labNumber);
      }
    }, 30000);
    
    return () => clearInterval(heartbeatInterval);
  }, [labNumber, startLab, userEmail]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    
    if (completedSteps.length === steps.length) {
      completeLab(labNumber);
      if (prevCompletedCountRef.current !== undefined && prevCompletedCountRef.current < steps.length) {
        toast.success(`Lab ${labNumber} completed! You can move on to the next lab.`);
      }
      prevCompletedCountRef.current = completedSteps.length;
    } else {
      prevCompletedCountRef.current = completedSteps.length;
    }
  }, [completedSteps, storageKey, steps.length, labNumber, completeLab]);

  useEffect(() => {
    localStorage.setItem(stepIndexKey, String(currentStepIndex));
  }, [currentStepIndex, stepIndexKey]);

  // Clamp currentStepIndex when steps array shrinks (e.g. after a step was removed from the lab)
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex >= steps.length) {
      setCurrentStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, currentStepIndex]);

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
  };

  const handleOutputChange = useCallback((
    result: { output: string; summary?: string; success?: boolean; source?: 'console' | 'verify' },
    stepIndex: number
  ) => {
    setOutputByStep(prev => {
      const cur = prev[stepIndex] || {};
      const next = { ...prev, [stepIndex]: result.source === 'console'
        ? { ...cur, output: result.output }
        : { ...cur, verifyOutput: result.output, summary: result.summary ?? cur.summary, success: result.success ?? cur.success }
      };
      try {
        localStorage.setItem(outputByStepKey, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
    setOutputOpen(true);
  }, [outputByStepKey]);

  const handleOutputOpenChange = useCallback((open: boolean) => {
    setOutputOpen(open);
  }, []);

  const handleResetStep = useCallback(async (stepIndex: number) => {
    if (labMongoUri?.trim()) {
      try {
        const result = await validatorUtils.cleanupLabResources(labNumber, labMongoUri);
        if (result.success && result.message && !result.message.includes('nothing to clean')) {
          toast.success(result.message);
        } else if (!result.success) {
          toast.error(result.message || 'Cleanup failed');
        }
      } catch (e) {
        toast.error('Failed to clean lab resources');
      }
    }
    resetStepClearerRef.current?.(stepIndex);
    setOutputByStep(prev => {
      const next = { ...prev, [stepIndex]: {} };
      try {
        localStorage.setItem(outputByStepKey, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
    setCompletedSteps(prev => prev.filter(i => i !== stepIndex));
    setResetStepTrigger(t => t + 1);
  }, [outputByStepKey, labNumber, labMongoUri]);

  const handleStartLab = () => {
    setActiveTab('steps');
  };

  // Merge step-level exercises with lab-level exercises for the steps
  const stepsWithExercises = steps.map((step, index) => {
    // Assign exercises to specific steps based on index or include from step definition
    const stepExercises = step.exercises || [];
    return { ...step, exercises: stepExercises };
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Left: Tabs */}
            <TabsList className="bg-transparent">
              <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
                📖 Overview
              </TabsTrigger>
              <TabsTrigger value="steps" className="gap-2 text-xs sm:text-sm">
                🔧 Steps
                {completedSteps.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {completedSteps.length}/{steps.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Right: Atlas, Info, Help - aligned right */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-auto">
              {atlasCapability && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs cursor-help text-left min-w-0 max-w-[280px] sm:max-w-[360px]">
                        <Database className="w-3 h-3 shrink-0" />
                        <span className="hidden sm:inline shrink-0">Atlas:</span>
                        <span className="font-medium truncate">{atlasCapability}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm font-medium">Atlas Capability</p>
                      <p className="text-sm text-muted-foreground">{atlasCapability}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Info">
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm p-3 space-y-2">
                    <p className="text-sm font-medium">How to use this lab</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li><strong>File pane:</strong> Edit code or script. No run buttons here.</li>
                      <li><strong>Terminal pane:</strong> Run selection / Run all or type a command and press Enter.</li>
                      <li><strong>Output tab:</strong> Result of Verify. <strong>Terminal tab:</strong> Command log.</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {activeTab === 'steps' && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => {
                            if (window.confirm('Reset this step? Output, verification, and any revealed hints/solutions for this step will be cleared. You can start the step from scratch. (Cloud/MongoDB resources are not deleted.)')) {
                              handleResetStep(currentStepIndex);
                            }
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reset step</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Clear this step&apos;s output and verification.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => setHelpDrawerOpen(true)}
                          aria-label="Help"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Help</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Step context, Understand, Do this, Hints.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 flex-1 overflow-auto">
          <LabIntroTab
            labNumber={labNumber}
            title={title}
            duration={duration}
            description={description}
            whatYouWillBuild={introContent.whatYouWillBuild}
            keyConcepts={introContent.keyConcepts}
            keyInsight={introContent.keyInsight}
            architectureDiagram={introContent.architectureDiagram}
            showEncryptionFlow={introContent.showEncryptionFlow}
            encryptionFlowType={introContent.encryptionFlowType}
            onStartLab={handleStartLab}
          />
        </TabsContent>

        {/* Steps Tab - New Clean Layout */}
        <TabsContent value="steps" className="mt-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <StepView
            steps={stepsWithExercises}
            currentStepIndex={currentStepIndex}
            completedSteps={completedSteps}
            onStepChange={setCurrentStepIndex}
            onComplete={handleStepComplete}
            labNumber={labNumber}
            labTitle={title}
            labDescription={description}
            businessValue={businessValue}
            atlasCapability={atlasCapability}
            lastOutput={outputByStep[currentStepIndex]?.output ?? ''}
            lastVerifyOutput={outputByStep[currentStepIndex]?.verifyOutput ?? ''}
            outputSummary={outputByStep[currentStepIndex]?.summary ?? ''}
            outputSuccess={outputByStep[currentStepIndex]?.success !== false}
            outputOpen={outputOpen}
            outputStepIndex={currentStepIndex}
            stepsCount={steps.length}
            onOutputChange={handleOutputChange}
            onOutputOpenChange={handleOutputOpenChange}
            onResetStep={handleResetStep}
            helpDrawerOpen={helpDrawerOpen}
            onHelpDrawerOpenChange={setHelpDrawerOpen}
            resetStepTrigger={resetStepTrigger}
            registerResetStepClearer={(clear) => { resetStepClearerRef.current = clear; }}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
