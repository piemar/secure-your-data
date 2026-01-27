import { Lightbulb, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface InlineHint {
  line: number;           // Line number in the skeleton (1-indexed)
  blankText: string;      // The blank pattern (e.g., "_________")
  hint: string;           // Conceptual explanation
  answer: string;         // Exact text to fill in
}

export type SkeletonTier = 'guided' | 'challenge' | 'expert';

interface InlineHintMarkerProps {
  hint: InlineHint;
  hintRevealed: boolean;
  answerRevealed: boolean;
  onRevealHint: () => void;
  onRevealAnswer: () => void;
  tier: SkeletonTier;
}

export function InlineHintMarker({ 
  hint, 
  hintRevealed, 
  answerRevealed,
  onRevealHint,
  onRevealAnswer,
  tier 
}: InlineHintMarkerProps) {
  const hintPenalty = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
  const answerPenalty = tier === 'expert' ? 5 : tier === 'challenge' ? 3 : 2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
            answerRevealed 
              ? "bg-green-500/20 text-green-500 border border-green-500/30" 
              : hintRevealed 
              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
              : "bg-muted hover:bg-primary/20 text-muted-foreground border border-border"
          )}
          aria-label={`Hint for line ${hint.line}`}
        >
          {answerRevealed ? <Check className="w-3 h-3" /> : hintRevealed ? '!' : '?'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="left" align="start">
        <div className="space-y-0">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Line {hint.line}</span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{hint.blankText}</code>
          </div>
          
          {/* Revealed content */}
          <div className="p-3 space-y-2">
            {hintRevealed && (
              <div className="p-2 bg-amber-500/10 rounded text-sm border border-amber-500/20">
                <span className="text-amber-600 dark:text-amber-400">💡 Hint:</span>{' '}
                <span className="text-foreground">{hint.hint}</span>
              </div>
            )}
            
            {answerRevealed && (
              <div className="p-2 bg-green-500/10 rounded text-sm font-mono border border-green-500/20">
                <span className="text-green-600 dark:text-green-400">✓ Answer:</span>{' '}
                <strong className="text-foreground">{hint.answer}</strong>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {!hintRevealed && !answerRevealed && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevealHint();
                  }}
                  className="flex-1 gap-1 h-8 text-xs"
                >
                  <Lightbulb className="w-3 h-3" />
                  Show Hint
                  <span className="text-muted-foreground">(-{hintPenalty}pt)</span>
                </Button>
              )}
              {!answerRevealed && (
                <Button 
                  size="sm" 
                  variant={hintRevealed ? "default" : "secondary"} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevealAnswer();
                  }}
                  className="flex-1 gap-1 h-8 text-xs"
                >
                  <Eye className="w-3 h-3" />
                  Show Answer
                  <span className={hintRevealed ? "text-primary-foreground/70" : "text-muted-foreground"}>(-{answerPenalty}pt)</span>
                </Button>
              )}
            </div>
            
            {answerRevealed && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                Type <code className="bg-muted px-1 rounded">{hint.answer}</code> in place of the blank
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
