/**
 * Shows one or two suggested actions from the hint orchestrator (e.g. "Run current step").
 * Phase 5. Renders as a small strip of buttons; only when there are hints.
 */
import { useEffect, useState } from 'react';
import { useIdeContextOptional } from '@/context/IdeContext';
import { hintOrchestrator } from '@/services/hints';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SuggestNextStep({ className }: { className?: string }) {
  const ide = useIdeContextOptional();
  const [hints, setHints] = useState<Array<{ id: string; label: string; run?: () => void }>>([]);
  const context = ide?.hintContext ?? {};

  useEffect(() => {
    hintOrchestrator.getHints(context).then((actions) => {
      const top = actions.slice(0, 2).map((a) => ({
        id: a.id,
        label: a.label,
        run: a.kind === 'run' ? () => ide?.runAllRef.current?.() : undefined,
      }));
      setHints(top);
    });
  }, [context.labStepId, context.currentLanguage, ide?.runAllRef]);

  if (hints.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="text-[10px] text-muted-foreground mr-0.5">Suggest:</span>
      {hints.map((h) => (
        <Button
          key={h.id}
          variant="outline"
          size="sm"
          className="h-6 text-[10px] px-1.5 gap-0.5"
          onClick={() => {
            if (h.run) h.run();
          }}
        >
          <Play className="w-2.5 h-2.5" />
          {h.label}
        </Button>
      ))}
    </div>
  );
}
