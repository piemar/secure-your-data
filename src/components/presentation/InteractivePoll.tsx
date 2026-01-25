import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { PollOption } from '@/types';

interface InteractivePollProps {
  question: string;
  options: PollOption[];
  onVote: (optionId: string) => void;
  className?: string;
}

export function InteractivePoll({ question, options, onVote, className }: InteractivePollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    setSelectedOption(optionId);
    setHasVoted(true);
    onVote(optionId);
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <h3 className="text-xl font-semibold text-center mb-6">{question}</h3>
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = hasVoted && totalVotes > 0 
            ? Math.round((option.votes / totalVotes) * 100) 
            : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={cn(
                'relative w-full p-4 rounded-lg border text-left transition-all duration-200 overflow-hidden',
                hasVoted
                  ? isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
              )}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="poll-bar absolute left-0 top-0 bottom-0 opacity-20"
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className={cn(
                  'font-medium',
                  isSelected && 'text-primary'
                )}>
                  {option.label}
                </span>
                {hasVoted && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={cn(
                      'text-sm font-mono',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {percentage}%
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          {totalVotes} total responses
        </motion.p>
      )}
    </div>
  );
}
