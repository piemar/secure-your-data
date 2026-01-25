import { useState } from 'react';
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Lightbulb, ShieldCheck, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { useLab } from '@/context/LabContext';
import { toast } from 'sonner';
import { ValidationResult } from '@/utils/validatorUtils';

interface LabStepProps {
  stepId: string;
  stepNumber: number;
  title: string;
  estimatedTime: string;
  description: string;
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
  isCompleted: boolean;
  onComplete: () => void;
  onVerify?: () => Promise<ValidationResult>;
  onSuccess?: () => void;
}

export function LabStep({
  stepId,
  stepNumber,
  title,
  estimatedTime,
  description,
  codeBlocks,
  expectedOutput,
  troubleshooting,
  tips,
  documentationUrl,
  isCompleted,
  onComplete,
  onVerify,
  onSuccess,
}: LabStepProps) {
  const [isExpanded, setIsExpanded] = useState(!isCompleted);
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { completeStep, assistedSteps } = useLab();

  const handleVerify = async () => {
    if (!onVerify) return;

    setIsValidating(true);
    try {
      const result = await onVerify();
      if (result.success) {
        toast.success(result.message);
        completeStep(stepId, showSolutions);
        onComplete();
        setIsExpanded(false); // Collapse the step
        if (onSuccess) {
          onSuccess(); // Scroll to next step
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Validation failed. Check your connection.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleShowSolution = () => {
    setShowSolutions(true);
    toast.info("Solution revealed. Potential score for this step reduced by 50%.");
  };

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      isCompleted ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
    )}>
      {/* Step Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            isCompleted
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Step {stepNumber}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {estimatedTime}
            </span>
          </div>
          <h3 className={cn(
            'font-semibold',
            isCompleted && 'line-through text-muted-foreground'
          )}>
            {title}
          </h3>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Step Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-4">
          <p className="text-muted-foreground pl-12">{description}</p>

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="ml-12 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Tips</span>
              </div>
              <ul className="text-sm space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {codeBlocks && codeBlocks.length > 0 && (
            <div className="ml-12 space-y-4">
              {codeBlocks.map((block, i) => {
                const shouldShowFull = showSolutions || isCompleted;
                const hasSkeleton = !!block.skeleton;

                // Always show skeleton first if available, even if solution is hidden
                if (!shouldShowFull && hasSkeleton) {
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">
                          {block.filename} <span className="text-primary-500 font-bold ml-2">(Template - Fill in the blanks)</span>
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleShowSolution} className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary">
                          <Eye className="w-3 h-3" /> Reveal Full Solution (-5 pts)
                        </Button>
                      </div>
                      <CodeBlock
                        code={block.skeleton}
                        language={block.language}
                      />
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <strong>💡 Hint:</strong> Use the description above and tips to fill in the missing parts. Try implementing it yourself before revealing the solution!
                        </p>
                      </div>
                    </div>
                  );
                }

                // If no skeleton and solution is hidden, show placeholder with more guidance
                if (!shouldShowFull && !hasSkeleton) {
                  return (
                    <div key={i} className="p-8 border-2 border-dashed border-border rounded-lg text-center bg-muted/30 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Code solution for <strong>{block.filename}</strong> is hidden.</p>
                        <p className="text-xs text-muted-foreground mb-2">Use the description, tips, and your knowledge to implement it. Check the documentation links if needed.</p>
                        <div className="mt-3 p-2 bg-primary/10 rounded text-xs text-left text-muted-foreground">
                          <p className="font-semibold mb-1">💡 What to do:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Read the step description carefully</li>
                            <li>Review the tips section above</li>
                            <li>Check documentation links if provided</li>
                            <li>Try implementing based on patterns from previous steps</li>
                            <li>Use "Check My Progress" to validate your solution</li>
                          </ul>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleShowSolution} className="gap-2">
                        <Eye className="w-4 h-4" /> Reveal Solution (-5 pts)
                      </Button>
                    </div>
                  );
                }

                // Show full solution
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {block.filename}
                      </span>
                      {showSolutions && !isCompleted && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                          ⚠️ Solution Revealed (-5 pts)
                        </span>
                      )}
                    </div>
                    <CodeBlock
                      code={block.code}
                      language={block.language}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Expected Output */}
          {expectedOutput && showSolutions && (
            <div className="ml-12">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExpectedOutput(!showExpectedOutput)}
                className="gap-2 text-muted-foreground"
              >
                {showExpectedOutput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Expected Output
              </Button>
              {showExpectedOutput && (
                <pre className="mt-2 p-3 rounded-lg bg-muted/50 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                  {expectedOutput}
                </pre>
              )}
            </div>
          )}

          {/* Troubleshooting */}
          {troubleshooting && troubleshooting.length > 0 && (
            <div className="ml-12 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-warning">Troubleshooting</span>
              </div>
              <ul className="text-sm space-y-1">
                {troubleshooting.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Button */}
          <div className="ml-12 flex gap-3">
            {onVerify && !isCompleted && (
              <Button
                onClick={handleVerify}
                disabled={isValidating}
                className="gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isValidating ? 'Checking Database...' : 'Check My Progress'}
              </Button>
            )}

            {(!onVerify || isCompleted) && (
              <Button
                onClick={onComplete}
                variant={isCompleted ? 'outline' : 'default'}
                size="sm"
                className="gap-2"
              >
                {isCompleted ? (
                  <>
                    <Circle className="w-4 h-4" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            )}

            {documentationUrl && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground gap-2">
                <a href={documentationUrl} target="_blank" rel="noopener noreferrer">
                  <Copy className="w-4 h-4" /> Docs
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
