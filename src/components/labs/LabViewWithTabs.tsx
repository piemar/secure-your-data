import { useState, useEffect } from 'react';
import { ChevronRight, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabIntroTab } from './LabIntroTab';
import { StepView } from './StepView';
import { ExercisePanel, ExerciseType } from '@/components/workshop/ExercisePanel';
import { useLab } from '@/context/LabContext';
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
  exercises?: Exercise[];
  businessValue?: string;
  atlasCapability?: string;
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
  businessValue,
  atlasCapability,
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
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent">
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
          />
        </TabsContent>

        {/* Exercises Tab */}
        {exercises.length > 0 && (
          <TabsContent value="exercises" className="mt-0 flex-1 overflow-auto">
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
