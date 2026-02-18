import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LabStep } from './LabStep';
import { useLab } from '@/context/LabContext';
import { heartbeat } from '@/utils/leaderboardUtils';

interface Step {
  id: string;
  title: string;
  estimatedTime: string;
  description: string;
  codeBlocks?: Array<{
    filename: string;
    language: string;
    code: string;
  }>;
  expectedOutput?: string;
  troubleshooting?: string[];
  tips?: string[];
  documentationUrl?: string;
  onVerify?: () => Promise<{ success: boolean; message: string }>;
}

interface LabViewProps {
  labNumber: number;
  title: string;
  description: string;
  duration: string;
  prerequisites: string[];
  objectives: string[];
  steps: Step[];
}

export function LabView({
  labNumber,
  title,
  description,
  duration,
  prerequisites,
  objectives,
  steps,
}: LabViewProps) {
  const { startLab, completeLab, completeStep, userEmail } = useLab();
  const storageKey = `lab${labNumber}-progress`;
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    const isNowCompleted = !completedSteps.includes(stepIndex);
    setCompletedSteps((prev) =>
      isNowCompleted
        ? [...prev, stepIndex]
        : prev.filter((s) => s !== stepIndex)
    );

    if (isNowCompleted) {
      const step = steps[stepIndex];
      completeStep(step.id, false); // Manual completion in this view is always unassisted
    }
  };

  const scrollToNextStep = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length && stepRefs.current[nextIndex]) {
      setTimeout(() => {
        stepRefs.current[nextIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300); // Wait for collapse animation
    }
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem(storageKey);
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="h-full overflow-y-auto">
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
                codeBlocks={step.codeBlocks}
                expectedOutput={step.expectedOutput}
                troubleshooting={step.troubleshooting}
                tips={step.tips}
                documentationUrl={step.documentationUrl}
                isCompleted={completedSteps.includes(index)}
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
    </div>
  );
}
