import { ValidationResult } from '@/lib/validation';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ValidationFeedbackProps {
  results: ValidationResult[];
  objectiveTexts: Record<string, string>;
}

export function ValidationFeedback({ results, objectiveTexts }: ValidationFeedbackProps) {
  if (results.length === 0) return null;

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold text-foreground">VALIDATION RESULTS</h3>
        <span className={`font-mono text-xs font-bold ${passedCount === totalCount ? 'text-primary' : 'text-warning'}`}>
          {passedCount}/{totalCount} PASSED
        </span>
      </div>

      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.objectiveId}
            className={`flex items-start gap-2 p-2 rounded border text-xs font-mono transition-all ${
              result.passed
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-destructive/30 bg-destructive/5 text-destructive'
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate">{objectiveTexts[result.objectiveId] || result.objectiveId}</p>
              {result.matchedRules.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {result.matchedRules.map((rule, i) => (
                    <p key={i} className="text-[10px] text-primary/70 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {rule}
                    </p>
                  ))}
                </div>
              )}
              {result.failedRules.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {result.failedRules.map((rule, i) => (
                    <p key={i} className="text-[10px] text-destructive/70 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" /> Missing: {rule}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
