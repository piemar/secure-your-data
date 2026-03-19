import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { InlineHint } from '@/lib/types';
import { Lightbulb, Eye, CheckCircle2 } from 'lucide-react';

type MarkerState = 'unrevealed' | 'hint-shown' | 'answer-shown';

interface InlineHintMarkerProps {
  hint: InlineHint;
  index: number;
  state: MarkerState;
  onRevealHint: (index: number) => void;
  onRevealAnswer: (index: number) => void;
  style: React.CSSProperties;
}

export function InlineHintMarker({ hint, index, state, onRevealHint, onRevealAnswer, style }: InlineHintMarkerProps) {
  const [open, setOpen] = useState(false);

  const hintPenalty = Math.round((hint.xpPenalty || 25) * 0.6);
  const answerPenalty = Math.round((hint.xpPenalty || 25) * 0.4);

  if (state === 'answer-shown') return null;

  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{
        ...style,
        transform: 'translate(-50%, -50%)',
        animation: 'hint-marker-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`
              w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
              border shadow-lg transition-all duration-200 hover:scale-125
              ${state === 'unrevealed'
                ? 'bg-blue-500/90 border-blue-400/50 text-white shadow-blue-500/30 animate-[hint-glow_3s_ease-in-out_infinite]'
                : 'bg-amber-500/90 border-amber-400/50 text-white shadow-amber-500/30'
              }
            `}
            title={`Hint #${index + 1}`}
          >
            {state === 'unrevealed' ? '?' : '!'}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="w-64 p-0 border-border bg-card"
        >
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              HINT #{index + 1}
            </div>

            {state === 'hint-shown' && (
              <div className="text-xs font-mono p-2 rounded bg-amber-500/10 border border-amber-500/20 text-foreground">
                {hint.hint}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {state === 'unrevealed' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-mono gap-1.5 h-7 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => {
                    onRevealHint(index);
                  }}
                >
                  <Lightbulb className="w-3 h-3" />
                  Show Hint
                  <span className="text-destructive/70 ml-auto">−{hintPenalty} XP</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-mono gap-1.5 h-7 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => {
                  onRevealAnswer(index);
                  setOpen(false);
                }}
              >
                <Eye className="w-3 h-3" />
                Show Answer
                <span className="text-destructive/70 ml-auto">−{answerPenalty} XP</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
