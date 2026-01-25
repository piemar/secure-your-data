import { useState } from 'react';
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';

interface LabStepProps {
  stepNumber: number;
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
  isCompleted: boolean;
  onComplete: () => void;
}

export function LabStep({
  stepNumber,
  title,
  estimatedTime,
  description,
  codeBlocks,
  expectedOutput,
  troubleshooting,
  tips,
  isCompleted,
  onComplete,
}: LabStepProps) {
  const [isExpanded, setIsExpanded] = useState(!isCompleted);
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);

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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
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
        </button>

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

          {/* Code Blocks */}
          {codeBlocks && codeBlocks.length > 0 && (
            <div className="ml-12 space-y-4">
              {codeBlocks.map((block, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{block.filename}</span>
                  </div>
                  <CodeBlock code={block.code} language={block.language} />
                </div>
              ))}
            </div>
          )}

          {/* Expected Output */}
          {expectedOutput && (
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

          {/* Mark Complete Button */}
          <div className="ml-12">
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
          </div>
        </div>
      )}
    </div>
  );
}
