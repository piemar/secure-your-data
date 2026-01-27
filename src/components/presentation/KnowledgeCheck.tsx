import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KnowledgeCheckOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface KnowledgeCheckProps {
  question: string;
  options: KnowledgeCheckOption[];
  explanation?: string;
  points?: number;
}

export function KnowledgeCheck({ question, options, explanation, points = 10 }: KnowledgeCheckProps) {
  const [revealed, setRevealed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const correctAnswer = options.find(o => o.isCorrect);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Knowledge Check</h3>
            <p className="text-xs text-muted-foreground">Ask the audience</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-mono">{points} pts</span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-lg font-medium">{question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-4 rounded-lg border transition-all',
                revealed && option.isCorrect 
                  ? 'border-green-500 bg-green-500/10' 
                  : revealed && !option.isCorrect
                  ? 'border-border opacity-50'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                revealed && option.isCorrect
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {revealed && option.isCorrect ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </div>
              <span className={cn(
                'flex-1',
                revealed && option.isCorrect && 'font-semibold text-green-600'
              )}>
                {option.label}
              </span>
              {revealed && !option.isCorrect && (
                <XCircle className="w-5 h-5 text-red-500/50" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setRevealed(!revealed)}
            variant={revealed ? 'outline' : 'default'}
            className="gap-2"
          >
            {revealed ? (
              <>Hide Answer</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Reveal Answer
              </>
            )}
          </Button>

          {revealed && explanation && (
            <Button
              variant="ghost"
              onClick={() => setShowExplanation(!showExplanation)}
              className="gap-2"
            >
              {showExplanation ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </Button>
          )}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {revealed && showExplanation && explanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">{explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
