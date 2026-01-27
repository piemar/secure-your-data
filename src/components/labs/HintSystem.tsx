import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HintSystemProps {
  hints: string[];
  onRevealSolution: () => void;
  solutionRevealed: boolean;
}

export function HintSystem({ hints, onRevealSolution, solutionRevealed }: HintSystemProps) {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [expandedHint, setExpandedHint] = useState<number | null>(null);

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints(prev => [...prev, index]);
    }
    setExpandedHint(expandedHint === index ? null : index);
  };

  const getHintPenalty = (index: number): number => {
    // Hint 1: -1 pt, Hint 2: -2 pts, Hint 3: -2 pts
    return index === 0 ? 1 : 2;
  };

  const getTotalPenalty = (): number => {
    return revealedHints.reduce((sum, index) => sum + getHintPenalty(index), 0);
  };

  if (!hints || hints.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Lightbulb className="w-4 h-4" />
          <span>💡 Progressive Hints</span>
        {revealedHints.length > 0 && (
            <span className="text-xs text-warning">
              (-{getTotalPenalty()} pts)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {hints.map((hint, index) => {
          const isRevealed = revealedHints.includes(index);
          const isExpanded = expandedHint === index;
          const isLocked = index > 0 && !revealedHints.includes(index - 1);
          const penalty = getHintPenalty(index);

          return (
            <div key={index} className="flex-1 min-w-[150px]">
              <Button
                variant={isRevealed ? "secondary" : "outline"}
                size="sm"
                onClick={() => !isLocked && revealHint(index)}
                disabled={isLocked}
                className={cn(
                  "w-full justify-between gap-2 h-auto py-2",
                  isLocked && "opacity-50 cursor-not-allowed",
                  isRevealed && "border-primary/30 bg-primary/5"
                )}
              >
                <span className="flex items-center gap-1">
                  <span className={cn(
                    "w-5 h-5 rounded-full text-xs flex items-center justify-center",
                    isRevealed ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-xs">
                    Hint {index + 1}
                    <span className="text-muted-foreground ml-1">(-{penalty}pt)</span>
                  </span>
                </span>
                {isRevealed && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
              </Button>

              {isRevealed && isExpanded && (
                <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  {hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Solution Button */}
      {!solutionRevealed && (
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevealSolution}
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <Eye className="w-4 h-4" />
            Reveal Full Solution (-5 pts)
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Try the hints first! Each hint costs fewer points than the full solution.
          </p>
        </div>
      )}
    </div>
  );
}
