import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabIntroTab } from './LabIntroTab';
import { StepView } from './StepView';
import { useLab } from '@/context/LabContext';
import { heartbeat } from '@/utils/leaderboardUtils';
import { DifficultyLevel } from './DifficultyBadge';
import { Lightbulb, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { LabStepPreviewConfig } from '@/types';

export interface Exercise {
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

export interface Step {
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
    challengeSkeleton?: string;
    expertSkeleton?: string;
    inlineHints?: Array<{ line: number; blankText: string; hint: string; answer: string }>;
    competitorEquivalents?: Record<string, { language: string; code: string; workaroundNote?: string }>;
  }>;
  expectedOutput?: string;
  troubleshooting?: string[];
  tips?: string[];
  documentationUrl?: string;
  onVerify?: () => Promise<{ success: boolean; message: string }>;
  /** Verification ID for content-driven labs (e.g. csfle.verifyMigration); triggers real validation on Check/Next */
  verificationId?: string;
  exercises?: Exercise[];
  /** Optional elevated experience: app-like preview (search, table, chart, etc.) driven by prompt-generated config */
  preview?: LabStepPreviewConfig;
}

export interface LabIntroContent {
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
  currentMode?: 'demo' | 'lab' | 'challenge';
  isModerator?: boolean;
  defaultCompetitorId?: string;
  competitorIds?: string[];
  labMongoUri?: string;
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
  currentMode,
  isModerator,
  defaultCompetitorId,
  competitorIds,
  labMongoUri,
}: LabViewWithTabsProps) {
  const { startLab, completeLab, completeStep, userEmail, resetProgressCount } = useLab();
  const storageKey = `lab${labNumber}-progress`;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepToolbarRef = useRef<{ reset: () => void; openHelp: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // When switching to a different lab, always show overview and step 0 (not the step index from the previous lab)
  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveTab('overview');
  }, [labNumber]);

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
    
    // Check if all steps are completed
    if (completedSteps.length === steps.length) {
      completeLab(labNumber);
    }
  }, [completedSteps, storageKey, steps.length, labNumber, completeLab]);

  const handleStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    setCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
    if (step?.id) {
      completeStep(step.id, false);
    }
  };

  const handleResetStep = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => prev.filter((i) => i !== stepIndex));
  }, []);

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
        <div className="sticky top-0 z-10 bg-background border-b border-border px-2 py-1">
          <div className="flex items-center gap-1.5 min-h-0 w-full">
            <TabsList className="bg-transparent h-5 p-0 flex-shrink-0">
              <TabsTrigger value="overview" className="gap-0.5 text-[9px] sm:text-[10px] h-4 px-1.5">
                Overview
              </TabsTrigger>
              <TabsTrigger value="steps" className="gap-0.5 text-[9px] sm:text-[10px] h-4 px-1.5">
                Steps
                {completedSteps.length > 0 && (
                  <span className="ml-0.5 px-1 py-0.5 rounded-full bg-primary/10 text-primary text-[8px]">
                    {completedSteps.length}/{steps.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            {activeTab === 'steps' && (
              <div className="flex items-center gap-1 min-w-0 flex-1 truncate text-[9px] sm:text-[10px] text-muted-foreground">
                <span className="flex-shrink-0 font-mono">Lab {String(labNumber).padStart(2, '0')}</span>
                <span className="flex-shrink-0">Step {currentStepIndex + 1}/{steps.length}:</span>
                <span className="truncate font-medium text-foreground">{steps[currentStepIndex]?.title}</span>
                {steps[currentStepIndex]?.estimatedTime && (
                  <span className="flex-shrink-0 hidden sm:inline">⏱️ {steps[currentStepIndex].estimatedTime}</span>
                )}
              </div>
            )}
            {/* Help right-adjusted on the same line; Atlas Capability moved to Preview panel header */}
            {activeTab === 'steps' && (
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => stepToolbarRef.current?.openHelp()} className="h-4 gap-0.5 px-1 text-[8px]" title="Step context & help">
                        <BookOpen className="w-2 h-2" />
                        Help
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Step context & help</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {businessValue && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] cursor-help max-w-[52px] sm:max-w-[72px] truncate">
                        <Lightbulb className="w-2 h-2 flex-shrink-0" />
                        <span className="truncate">Value</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm font-medium">💡 Business Value</p>
                      <p className="text-sm text-muted-foreground">{businessValue}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
            businessValue={businessValue}
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
            currentMode={currentMode}
            isModerator={isModerator}
            defaultCompetitorId={defaultCompetitorId}
            competitorIds={competitorIds}
            labMongoUri={labMongoUri}
            stepToolbarRef={stepToolbarRef}
            resetProgressCount={resetProgressCount}
            onResetStep={handleResetStep}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
