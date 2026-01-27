import { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLab } from '@/context/LabContext';

export type ExerciseType = 'quiz' | 'fill_blank' | 'challenge';

interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface ExerciseProps {
  id: string;
  type: ExerciseType;
  title: string;
  description?: string;
  points?: number;
  
  // Quiz specific
  question?: string;
  options?: QuizOption[];
  
  // Fill in the blank specific
  codeTemplate?: string;
  blanks?: Array<{
    id: string;
    placeholder: string;
    correctAnswer: string;
    hint?: string;
  }>;
  
  // Challenge specific
  challengeSteps?: Array<{
    instruction: string;
    hint?: string;
    completed?: boolean;
  }>;
  
  onComplete?: (success: boolean, pointsEarned: number) => void;
}

export function ExercisePanel({
  id,
  type,
  title,
  description,
  points = 10,
  question,
  options,
  codeTemplate,
  blanks,
  challengeSteps,
  onComplete,
}: ExerciseProps) {
  const { completeStep, userEmail } = useLab();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [completedChallengeSteps, setCompletedChallengeSteps] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const calculatePoints = (correct: boolean, attemptCount: number): number => {
    if (!correct) return 0;
    // Full points on first attempt, reduced by 2 for each subsequent attempt
    return Math.max(points - (attemptCount - 1) * 2, Math.floor(points / 2));
  };

  const handleQuizSubmit = () => {
    setAttempts(prev => prev + 1);
    const correct = options?.find(o => o.id === selectedAnswer)?.isCorrect ?? false;
    setIsCorrect(correct);
    setSubmitted(true);
    
    if (correct) {
      const pointsEarned = calculatePoints(true, attempts + 1);
      completeStep(`exercise-${id}`, attempts > 0);
      onComplete?.(true, pointsEarned);
    }
  };

  const handleFillBlankSubmit = () => {
    setAttempts(prev => prev + 1);
    const allCorrect = blanks?.every(
      blank => blankAnswers[blank.id]?.toLowerCase().trim() === blank.correctAnswer.toLowerCase().trim()
    ) ?? false;
    
    setIsCorrect(allCorrect);
    setSubmitted(true);
    
    if (allCorrect) {
      const pointsEarned = calculatePoints(true, attempts + 1);
      completeStep(`exercise-${id}`, attempts > 0);
      onComplete?.(true, pointsEarned);
    }
  };

  const handleChallengeStepComplete = (stepIndex: number) => {
    if (!completedChallengeSteps.includes(stepIndex)) {
      const newCompleted = [...completedChallengeSteps, stepIndex];
      setCompletedChallengeSteps(newCompleted);
      
      // Check if all steps completed
      if (newCompleted.length === challengeSteps?.length) {
        const pointsEarned = calculatePoints(true, 1);
        setIsCorrect(true);
        setSubmitted(true);
        completeStep(`exercise-${id}`, false);
        onComplete?.(true, pointsEarned);
      }
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelectedAnswer('');
    setBlankAnswers({});
  };

  const renderQuiz = () => (
    <div className="space-y-4">
      <p className="text-foreground font-medium">{question}</p>
      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        disabled={submitted && isCorrect}
      >
        {options?.map((option) => (
          <div
            key={option.id}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg border transition-colors',
              submitted && option.isCorrect && 'border-green-500 bg-green-500/10',
              submitted && !option.isCorrect && selectedAnswer === option.id && 'border-red-500 bg-red-500/10',
              !submitted && selectedAnswer === option.id && 'border-primary bg-primary/5',
              !submitted && selectedAnswer !== option.id && 'border-border hover:border-muted-foreground'
            )}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.label}
            </Label>
            {submitted && option.isCorrect && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {submitted && !option.isCorrect && selectedAnswer === option.id && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        ))}
      </RadioGroup>
      
      {!submitted || !isCorrect ? (
        <Button
          onClick={handleQuizSubmit}
          disabled={!selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>
      ) : null}
      
      {submitted && !isCorrect && (
        <Button
          onClick={handleRetry}
          variant="outline"
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );

  const renderFillBlank = () => (
    <div className="space-y-4">
      {codeTemplate && (
        <pre className="p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm overflow-x-auto">
          {codeTemplate}
        </pre>
      )}
      
      <div className="space-y-3">
        {blanks?.map((blank) => (
          <div key={blank.id} className="flex items-center gap-3">
            <Label htmlFor={blank.id} className="min-w-[120px] text-sm">
              {blank.placeholder}:
            </Label>
            <Input
              id={blank.id}
              value={blankAnswers[blank.id] || ''}
              onChange={(e) => setBlankAnswers(prev => ({
                ...prev,
                [blank.id]: e.target.value
              }))}
              disabled={submitted && isCorrect}
              className={cn(
                'font-mono',
                submitted && blankAnswers[blank.id]?.toLowerCase().trim() === blank.correctAnswer.toLowerCase().trim()
                  ? 'border-green-500'
                  : submitted ? 'border-red-500' : ''
              )}
              placeholder={blank.hint}
            />
            {submitted && (
              blankAnswers[blank.id]?.toLowerCase().trim() === blank.correctAnswer.toLowerCase().trim()
                ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
      
      {!submitted || !isCorrect ? (
        <Button
          onClick={handleFillBlankSubmit}
          disabled={blanks?.some(b => !blankAnswers[b.id])}
          className="w-full"
        >
          Check Answers
        </Button>
      ) : null}
      
      {submitted && !isCorrect && (
        <Button
          onClick={handleRetry}
          variant="outline"
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );

  const renderChallenge = () => (
    <div className="space-y-3">
      {challengeSteps?.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border',
            completedChallengeSteps.includes(index)
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-border'
          )}
        >
          <button
            onClick={() => handleChallengeStepComplete(index)}
            disabled={completedChallengeSteps.includes(index)}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
              completedChallengeSteps.includes(index)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-muted-foreground hover:border-primary'
            )}
          >
            {completedChallengeSteps.includes(index) && (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1">
            <p className={cn(
              'text-sm',
              completedChallengeSteps.includes(index) && 'line-through text-muted-foreground'
            )}>
              {step.instruction}
            </p>
            {step.hint && !completedChallengeSteps.includes(index) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                {step.hint}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={cn(
      'transition-all',
      submitted && isCorrect && 'border-green-500/50 bg-green-500/5'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {submitted && isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <HelpCircle className="w-5 h-5 text-primary" />
            )}
            {title}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-mono">{points} pts</span>
          </div>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {type === 'quiz' && renderQuiz()}
        {type === 'fill_blank' && renderFillBlank()}
        {type === 'challenge' && renderChallenge()}
        
        {submitted && isCorrect && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-600">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">
              +{calculatePoints(true, attempts)} points earned!
            </span>
            {attempts > 1 && (
              <span className="text-sm text-muted-foreground">
                ({attempts} attempts)
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
