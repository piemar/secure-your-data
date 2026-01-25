import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorageChallengeProps {
  className?: string;
}

export function StorageChallenge({ className }: StorageChallengeProps) {
  const [revealed, setRevealed] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);

  const options = [
    { id: '1x', label: '1x (Same size)', correct: false },
    { id: '1.5x', label: '1.5x', correct: false },
    { id: '2-3x', label: '2-3x', correct: true },
    { id: '5x', label: '5x+', correct: false },
  ];

  const handleGuess = (id: string) => {
    setSelectedGuess(id);
    setTimeout(() => setRevealed(true), 500);
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Storage Factor Challenge</h3>
          <p className="text-muted-foreground">
            What's the storage overhead for QE Range-indexed fields?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((option) => {
          const isSelected = selectedGuess === option.id;
          const showResult = revealed;

          return (
            <button
              key={option.id}
              onClick={() => !revealed && handleGuess(option.id)}
              disabled={revealed}
              className={cn(
                'p-4 rounded-lg border text-center font-medium transition-all duration-300',
                showResult
                  ? option.correct
                    ? 'border-primary bg-primary/20 text-primary'
                    : isSelected
                      ? 'border-destructive bg-destructive/20 text-destructive'
                      : 'border-border bg-card/50 text-muted-foreground'
                  : isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/50 cursor-pointer'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-card border border-primary/30"
          >
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-primary mb-2">Answer: 2-3x storage overhead</p>
                <p className="text-sm text-muted-foreground">
                  QE Range indexes require additional metadata for each value, including tokens 
                  stored in the <code className="text-primary">.esc</code> and <code className="text-primary">.ecoc</code> collections. 
                  This enables range queries on encrypted data but comes with storage costs.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && !selectedGuess && (
        <Button
          variant="outline"
          onClick={() => setRevealed(true)}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          Reveal Answer
        </Button>
      )}
    </div>
  );
}
