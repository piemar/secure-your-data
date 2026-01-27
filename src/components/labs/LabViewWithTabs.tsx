import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, RotateCcw, ChevronRight, Eye, EyeOff, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabStep } from './LabStep';
import { LabIntroTab } from './LabIntroTab';
import { ExercisePanel, ExerciseType } from '@/components/workshop/ExercisePanel';
import { useLab } from '@/context/LabContext';
import { useRole } from '@/contexts/RoleContext';
import { heartbeat } from '@/utils/leaderboardUtils';
import { DifficultyLevel } from './DifficultyBadge';

interface Exercise {
  id: string;
  type: ExerciseType;
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
  exercises?: Exercise[];
}

export function LabViewWithTabs({
  labNumber,
  title,
  description,
  duration,
  prerequisites,
  objectives,
  steps,
  introContent,
  exercises = [],
}: LabViewWithTabsProps) {
  const { startLab, completeLab, userEmail } = useLab();
  const { isModerator } = useRole();
  const storageKey = `lab${labNumber}-progress`;
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAllSteps, setShowAllSteps] = useState(false);

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

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev.filter((s) => s !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const scrollToNextStep = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length && stepRefs.current[nextIndex]) {
      setTimeout(() => {
        stepRefs.current[nextIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem(storageKey);
  };

  const handleStartLab = () => {
    setActiveTab('steps');
  };

  // Progressive unlocking: step is locked if previous step isn't completed
  // Unless moderator has enabled "Show All Steps"
  const isStepLocked = (index: number): boolean => {
    if (showAllSteps || isModerator) return false;
    if (index === 0) return false;
    return !completedSteps.includes(index - 1);
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="h-full overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                📖 Overview
              </TabsTrigger>
              <TabsTrigger value="steps" className="gap-2">
                🔧 Steps
                {completedSteps.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {completedSteps.length}/{steps.length}
                  </span>
                )}
              </TabsTrigger>
              {exercises.length > 0 && (
                <TabsTrigger value="exercises" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Exercises
                </TabsTrigger>
              )}
            </TabsList>
            
            {activeTab === 'steps' && (
              <div className="flex items-center gap-2">
                {isModerator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="gap-2"
                  >
                    {showAllSteps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAllSteps ? 'Progressive Mode' : 'Show All Steps'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
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

        {/* Steps Tab */}
        <TabsContent value="steps" className="mt-0">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary text-sm font-mono mb-2">
                <span>LAB {labNumber}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{duration}</span>
              </div>
              <h1 className="text-3xl font-bold text-gradient-green mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-semibold">
                      {completedSteps.length} of {steps.length} steps completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>~{duration}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetProgress} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset Progress
                </Button>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Prerequisites & Objectives */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-3">Prerequisites</h3>
                <ul className="space-y-2">
                  {prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center">✓</span>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center">{i + 1}</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Lab Steps</h2>
              {steps.map((step, index) => (
                <div
                  key={index}
                  ref={(el) => (stepRefs.current[index] = el)}
                >
                  <LabStep
                    stepId={step.id}
                    stepNumber={index + 1}
                    title={step.title}
                    estimatedTime={step.estimatedTime}
                    description={step.description}
                    difficulty={step.difficulty}
                    understandSection={step.understandSection}
                    doThisSection={step.doThisSection}
                    hints={step.hints}
                    codeBlocks={step.codeBlocks}
                    expectedOutput={step.expectedOutput}
                    troubleshooting={step.troubleshooting}
                    tips={step.tips}
                    documentationUrl={step.documentationUrl}
                    isCompleted={completedSteps.includes(index)}
                    isLocked={isStepLocked(index)}
                    onComplete={() => toggleStep(index)}
                    onVerify={step.onVerify}
                    onSuccess={() => scrollToNextStep(index)}
                  />
                </div>
              ))}
            </div>

            {/* Completion Message */}
            {completedSteps.length === steps.length && (
              <div className="mt-8 p-6 rounded-lg bg-primary/10 border border-primary text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Lab Complete! 🎉</h3>
                <p className="text-muted-foreground">
                  Great work! You've completed all steps in this lab.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Exercises Tab */}
        {exercises.length > 0 && (
          <TabsContent value="exercises" className="mt-0">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary text-sm font-mono mb-2">
                  <span>LAB {labNumber}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span>Exercises</span>
                </div>
                <h1 className="text-3xl font-bold text-gradient-green mb-2">Knowledge Check</h1>
                <p className="text-muted-foreground">
                  Test your understanding and earn points for the leaderboard
                </p>
              </div>

              <div className="space-y-6">
                {exercises.map((exercise) => (
                  <ExercisePanel
                    key={exercise.id}
                    id={exercise.id}
                    type={exercise.type}
                    title={exercise.title}
                    description={exercise.description}
                    points={exercise.points}
                    question={exercise.question}
                    options={exercise.options}
                    codeTemplate={exercise.codeTemplate}
                    blanks={exercise.blanks}
                    challengeSteps={exercise.challengeSteps}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
