import { Lightbulb, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  /** When true (run-in-browser), answer is inserted into the editor; button label reflects that. */
  insertIntoEditor?: boolean;
}

export function InlineHintMarker({ 
  hint, 
  hintRevealed, 
  answerRevealed,
  onRevealHint,
  onRevealAnswer,
  tier,
  insertIntoEditor = false,
}: InlineHintMarkerProps) {
  const hintPenalty = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
  const answerPenalty = tier === 'expert' ? 5 : tier === 'challenge' ? 3 : 2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background",
            answerRevealed 
              ? "bg-green-500/20 text-green-500 border border-green-500/40 shadow-green-500/20" 
              : hintRevealed 
              ? "bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-amber-500/20 animate-pulse"
              : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50"
          )}
          aria-label={`Hint for line ${hint.line}`}
        >
          {answerRevealed ? <Check className="w-3 h-3" /> : hintRevealed ? '!' : '?'}
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 p-0 shadow-lg border-border/50" side="left" align="start" sideOffset={8}>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-0"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50 rounded-t-md">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Line {hint.line}</span>
            <code className="text-[10px] bg-background px-1.5 py-0.5 rounded font-mono text-foreground truncate max-w-[120px] sm:max-w-[160px]">
              {hint.blankText}
            </code>
          </div>
          
          {/* Revealed content */}
          <div className="p-3 space-y-2">
            <AnimatePresence mode="wait">
              {hintRevealed && (
                <motion.div 
                  key="hint"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-2 bg-amber-500/10 rounded text-xs border border-amber-500/20"
                >
                  <span className="text-amber-600 dark:text-amber-400 font-medium">💡 Hint:</span>{' '}
                  <span className="text-foreground">{hint.hint}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {answerRevealed && (
                <motion.div 
                  key="answer"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-2 bg-green-500/10 rounded text-xs font-mono border border-green-500/20"
                >
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Answer:</span>{' '}
                  <strong className="text-foreground break-all">{hint.answer}</strong>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
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
                  {insertIntoEditor ? 'Insert into editor' : 'Show Answer'}
                  <span className={hintRevealed ? "text-primary-foreground/70" : "text-muted-foreground"}>(-{answerPenalty}pt)</span>
                </Button>
              )}
            </div>
            
            {answerRevealed && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                {insertIntoEditor
                  ? <>Inserted. Use <strong>Run line</strong> / <strong>Run all</strong> to execute.</>
                  : <>Type <code className="bg-muted px-1 rounded text-foreground">{hint.answer}</code> in place of the blank</>}
              </p>
            )}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
