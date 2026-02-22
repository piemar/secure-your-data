import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabIntroTab } from './LabIntroTab';
import { StepView } from './StepView';
import { useLab } from '@/context/LabContext';
import { heartbeat } from '@/utils/leaderboardUtils';
import { DifficultyLevel } from './DifficultyBadge';
import { Database, Lightbulb } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  exercises?: Exercise[];
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
}: LabViewWithTabsProps) {
  const { startLab, completeLab, userEmail } = useLab();
  const storageKey = `lab${labNumber}-progress`;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

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
    setCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
  };

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
            
            {/* Right: Atlas Capability & Business Value - Compact Inline */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {atlasCapability && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs cursor-help">
                        <Database className="w-3 h-3" />
                        <span className="hidden sm:inline">Atlas:</span>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{atlasCapability}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm font-medium">Atlas Capability</p>
                      <p className="text-sm text-muted-foreground">{atlasCapability}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {businessValue && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs cursor-help">
                        <Lightbulb className="w-3 h-3" />
                        <span className="hidden sm:inline truncate max-w-[150px]">Business Value</span>
                        <span className="sm:hidden">Value</span>
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
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
