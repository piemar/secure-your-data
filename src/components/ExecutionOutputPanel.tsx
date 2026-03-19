/**
 * Panel showing real MongoDB execution results, simulated output,
 * and per-objective verification status.
 */
import { memo } from 'react';
import { ValidationTier } from '@/lib/mission-tiers';
import type { ExecutionOutput } from '@/hooks/useSandboxExecution';
import type { ServerVerificationResult } from '@/lib/validation';
import { CheckCircle2, XCircle, Loader2, Terminal, Cpu, Cloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ExecutionOutputPanelProps {
  tier: ValidationTier;
  output: ExecutionOutput[];
  serverResults: ServerVerificationResult[];
  isExecuting: boolean;
  isVerifying: boolean;
  executionError: string | null;
  totalExecutionTimeMs: number | null;
  objectiveTexts: Record<string, string>;
}

const TierBadge = memo(({ tier }: { tier: ValidationTier }) => {
  const config = {
    pattern: { label: 'PATTERN', icon: Terminal, className: 'bg-muted text-muted-foreground' },
    execute: { label: 'SANDBOX', icon: Cpu, className: 'bg-primary/10 text-primary' },
    simulate: { label: 'SIMULATED', icon: Cloud, className: 'bg-accent/10 text-accent' },
  };
  const { label, icon: Icon, className } = config[tier];
  return (
    <Badge variant="outline" className={`font-mono text-[10px] gap-1 ${className}`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </Badge>
  );
});
TierBadge.displayName = 'TierBadge';

function formatResult(result: unknown): string {
  if (result === null || result === undefined) return 'null';
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

export function ExecutionOutputPanel({
  tier,
  output,
  serverResults,
  isExecuting,
  isVerifying,
  executionError,
  totalExecutionTimeMs,
  objectiveTexts,
}: ExecutionOutputPanelProps) {
  const hasContent = output.length > 0 || serverResults.length > 0 || executionError || isExecuting || isVerifying;

  if (!hasContent) return null;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border-b border-border">
        <Terminal className="w-3 h-3 text-primary" />
        <span className="font-mono text-[10px] font-bold text-foreground">EXECUTION OUTPUT</span>
        <TierBadge tier={tier} />
        {totalExecutionTimeMs != null && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {totalExecutionTimeMs}ms
          </span>
        )}
      </div>

      <ScrollArea className="max-h-64">
        <div className="p-3 space-y-3">
          {/* Loading states */}
          {isExecuting && (
            <div className="flex items-center gap-2 text-xs font-mono text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              {tier === 'simulate' ? 'Simulating infrastructure commands...' : 'Executing against sandbox database...'}
            </div>
          )}

          {isVerifying && (
            <div className="flex items-center gap-2 text-xs font-mono text-accent animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Running verification checks...
            </div>
          )}

          {/* Error */}
          {executionError && (
            <div className="flex items-start gap-2 p-2 rounded border border-destructive/30 bg-destructive/5">
              <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
              <pre className="font-mono text-[11px] text-destructive whitespace-pre-wrap break-all">
                {executionError}
              </pre>
            </div>
          )}

          {/* Command outputs */}
          {output.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.simulated ? '⚡' : '▶'} {item.command}
                </span>
                {item.simulated && (
                  <span className="font-mono text-[9px] text-accent/60">[simulated]</span>
                )}
                {item.timeMs != null && (
                  <span className="font-mono text-[9px] text-muted-foreground ml-auto">
                    {item.timeMs}ms
                  </span>
                )}
              </div>
              {item.error ? (
                <pre className="font-mono text-[11px] text-destructive bg-destructive/5 p-2 rounded overflow-x-auto">
                  {item.error}
                </pre>
              ) : (
                <pre className="font-mono text-[11px] text-foreground/80 bg-secondary/30 p-2 rounded overflow-x-auto max-h-32">
                  {formatResult(item.result)}
                </pre>
              )}
              {item.message && (
                <p className="font-mono text-[10px] text-muted-foreground italic">{item.message}</p>
              )}
            </div>
          ))}

          {/* Server verification results */}
          {serverResults.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <span className="font-mono text-[10px] font-bold text-foreground">VERIFICATION CHECKS</span>
              {serverResults.map((result) => (
                <div
                  key={result.objectiveId}
                  className={`flex items-start gap-2 p-2 rounded border text-xs ${
                    result.passed
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-destructive/30 bg-destructive/5'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-mono text-foreground">
                      {objectiveTexts[result.objectiveId] || result.objectiveId}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
