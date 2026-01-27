import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Trophy, Terminal, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DifficultyBadge, DifficultyLevel } from './DifficultyBadge';
import { ExercisePanel, ExerciseType } from '@/components/workshop/ExercisePanel';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  skeleton?: string;
}

interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  description?: string;
  points?: number;
  question?: string;
  options?: Array<{ id: string; label: string; isCorrect: boolean }>;
  codeTemplate?: string;
  blanks?: Array<{ id: string; placeholder: string; correctAnswer: string; hint?: string }>;
  challengeSteps?: Array<{ instruction: string; hint?: string }>;
}

interface StepData {
  id: string;
  title: string;
  estimatedTime: string;
  description: string;
  difficulty?: DifficultyLevel;
  understandSection?: string;
  doThisSection?: string[];
  hints?: string[];
  codeBlocks?: CodeBlock[];
  expectedOutput?: string;
  troubleshooting?: string[];
  tips?: string[];
  documentationUrl?: string;
  exercises?: Exercise[];
}

interface StepViewProps {
  steps: StepData[];
  currentStepIndex: number;
  completedSteps: number[];
  onStepChange: (index: number) => void;
  onComplete: (index: number) => void;
  labNumber: number;
  labTitle: string;
  labDescription: string;
  businessValue?: string;
  atlasCapability?: string;
}

// Generate realistic MongoDB output based on code content
function generateSimulatedOutput(code: string, stepTitle: string): string {
  const lowerCode = code.toLowerCase();
  const lowerTitle = stepTitle.toLowerCase();
  
  if (lowerCode.includes('create-key') || lowerTitle.includes('cmk') || lowerTitle.includes('master key')) {
    return `{
    "KeyMetadata": {
        "KeyId": "mrk-1234567890abcdef0",
        "Arn": "arn:aws:kms:eu-central-1:123456789012:key/mrk-1234567890abcdef0",
        "CreationDate": "${new Date().toISOString()}",
        "Enabled": true,
        "Description": "Lab 1 MongoDB Encryption Key",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "KeyState": "Enabled",
        "Origin": "AWS_KMS",
        "KeyManager": "CUSTOMER",
        "MultiRegion": false
    }
}

✓ CMK created successfully
✓ Alias linked: alias/mongodb-lab-key-*`;
  }
  
  if (lowerCode.includes('createdatakey') || lowerTitle.includes('dek') || lowerTitle.includes('data encryption')) {
    return `Connecting to MongoDB Atlas...
✓ Connected to cluster

Creating Data Encryption Key...
{
    "acknowledged": true,
    "_id": UUID("4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a")
}

✓ DEK created and stored in encryption.__keyVault
✓ Key wrapped with AWS KMS CMK`;
  }
  
  if (lowerCode.includes('createindex') || lowerTitle.includes('index') || lowerTitle.includes('key vault')) {
    return `Switched to db encryption
{
    "numIndexesBefore": 1,
    "numIndexesAfter": 2,
    "createdCollectionAutomatically": true,
    "ok": 1
}

✓ Unique partial index created on keyAltNames
✓ Key vault collection initialized`;
  }
  
  if (lowerCode.includes('insertone') || lowerCode.includes('insert')) {
    return `{
    "acknowledged": true,
    "insertedId": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1")
}

✓ Document inserted with client-side encryption
✓ Sensitive fields encrypted before transmission`;
  }
  
  if (lowerCode.includes('findone') || lowerCode.includes('find')) {
    return `{
    "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    "name": "Alice Johnson",
    "ssn": "123-45-6789",  // Auto-decrypted
    "dob": "1990-01-15"
}

✓ Document retrieved
✓ Encrypted fields auto-decrypted by driver`;
  }
  
  if (lowerCode.includes('createencryptedcollection') || lowerTitle.includes('queryable')) {
    return `{
    "ok": 1,
    "encryptedFieldsMap": {
        "medicalRecords.patients": {
            "fields": [
                { "path": "ssn", "queryType": "equality" },
                { "path": "medicalRecordNumber", "queryType": "equality" }
            ]
        }
    }
}

✓ Encrypted collection created
✓ Metadata collections initialized (.esc, .ecoc, .ecc)`;
  }
  
  if (lowerCode.includes('policy') || lowerTitle.includes('policy')) {
    return `{
    "ResponseMetadata": {
        "RequestId": "12345678-1234-1234-1234-123456789012"
    }
}

✓ Key policy attached successfully
✓ IAM principal authorized for kms:* operations`;
  }

  if (lowerCode.includes('countdocuments') || lowerCode.includes('count')) {
    return `1

✓ Key vault contains 1 DEK`;
  }

  if (lowerCode.includes('deleteone') || lowerCode.includes('delete')) {
    return `{
    "acknowledged": true,
    "deletedCount": 1
}

✓ Document/key deleted successfully`;
  }
  
  return `> Command executed successfully
{
    "ok": 1
}`;
}

export function StepView({
  steps,
  currentStepIndex,
  completedSteps,
  onStepChange,
  onComplete,
  labNumber,
  labTitle,
  labDescription,
  businessValue,
  atlasCapability,
}: StepViewProps) {
  const [activeTab, setActiveTab] = useState<string>('code');
  const [outputOpen, setOutputOpen] = useState(false);
  const [lastOutput, setLastOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isCompleted = completedSteps.includes(currentStepIndex);

  const handleCopyCode = useCallback(async () => {
    const code = currentStep.codeBlocks?.[0]?.code || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentStep.codeBlocks]);

  const handleCheckProgress = async () => {
    setIsRunning(true);
    const code = currentStep.codeBlocks?.[0]?.code || '';
    
    // Simulate execution delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    
    const output = generateSimulatedOutput(code, currentStep.title);
    setLastOutput(output);
    setOutputOpen(true);
    setIsRunning(false);
  };

  const handleNextStep = () => {
    if (!isCompleted) {
      onComplete(currentStepIndex);
    }
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      onStepChange(currentStepIndex - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">
                Lab {String(labNumber).padStart(2, '0')}
              </span>
              {currentStep.difficulty && (
                <DifficultyBadge level={currentStep.difficulty} />
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold">{labTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{labDescription}</p>
          </div>
          {atlasCapability && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Atlas Capability</span>
              <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded mt-0.5">
                {atlasCapability}
              </div>
            </div>
          )}
        </div>

        {/* Business Value Banner */}
        {businessValue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-md"
          >
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Business Value:</strong> {businessValue}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/30">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger
                value="code"
                className="data-[state=active]:bg-card data-[state=active]:border-border border border-transparent px-4 py-2 rounded-md text-sm gap-2"
              >
                <Terminal className="w-4 h-4" /> Code
              </TabsTrigger>
              <TabsTrigger
                value="explanation"
                className="data-[state=active]:bg-card data-[state=active]:border-border border border-transparent px-4 py-2 rounded-md text-sm gap-2"
              >
                <Lightbulb className="w-4 h-4" /> Explanation
              </TabsTrigger>
              {currentStep.exercises && currentStep.exercises.length > 0 && (
                <TabsTrigger
                  value="exercises"
                  className="data-[state=active]:bg-card data-[state=active]:border-border border border-transparent px-4 py-2 rounded-md text-sm gap-2"
                >
                  <Trophy className="w-4 h-4" /> Exercises
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="gap-1.5 h-8"
                disabled={!currentStep.codeBlocks?.length}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="sm"
                onClick={handleCheckProgress}
                disabled={isRunning || !currentStep.codeBlocks?.length}
                className="gap-2 h-8"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isRunning ? 'Checking...' : 'Check My Progress'}
              </Button>
            </div>
          </div>

          {/* Step Title with Animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="px-6 py-4 border-b border-border"
            >
              <h2 className="font-semibold">{currentStep.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
              {currentStep.estimatedTime && (
                <span className="text-xs text-muted-foreground mt-2 inline-block">
                  ⏱️ Estimated: {currentStep.estimatedTime}
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="code" className="h-full m-0 data-[state=inactive]:hidden">
              <div className="h-full flex flex-col">
                {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
                  <div className="flex-1 overflow-hidden">
                    {currentStep.codeBlocks.map((block, idx) => (
                      <div key={idx} className="h-full flex flex-col">
                        <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                          <span className="text-xs font-mono text-muted-foreground">{block.filename}</span>
                        </div>
                        <div className="flex-1">
                          <Editor
                            height="100%"
                            language={block.language === 'bash' ? 'shell' : block.language}
                            value={block.code}
                            theme="vs-dark"
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 13,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              automaticLayout: true,
                              tabSize: 2,
                              padding: { top: 12, bottom: 12 },
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>No code for this step</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="explanation" className="h-full m-0 p-6 overflow-auto data-[state=inactive]:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl space-y-6"
              >
                {/* Understanding */}
                {currentStep.understandSection && (
                  <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      📖 Understand
                    </h3>
                    <p className="text-sm text-muted-foreground">{currentStep.understandSection}</p>
                  </div>
                )}

                {/* Do This */}
                {currentStep.doThisSection && currentStep.doThisSection.length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      ✅ Do This
                    </h3>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      {currentStep.doThisSection.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {currentStep.tips && currentStep.tips.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      💡 Tips
                    </h3>
                    <ul className="text-sm space-y-1">
                      {currentStep.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hints */}
                {currentStep.hints && currentStep.hints.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <ChevronRight className="w-4 h-4" />
                      Need a hint?
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <ul className="text-sm space-y-1">
                          {currentStep.hints.map((hint, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-warning">💡</span>
                              {hint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Troubleshooting */}
                {currentStep.troubleshooting && currentStep.troubleshooting.length > 0 && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-warning">
                      ⚠️ Troubleshooting
                    </h3>
                    <ul className="text-sm space-y-1">
                      {currentStep.troubleshooting.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Exercises Tab */}
            {currentStep.exercises && currentStep.exercises.length > 0 && (
              <TabsContent value="exercises" className="h-full m-0 p-6 overflow-auto data-[state=inactive]:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Knowledge Check
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test your understanding and earn points
                    </p>
                  </div>
                  {currentStep.exercises.map((exercise) => (
                    <ExercisePanel
                      key={exercise.id}
                      id={exercise.id}
                      type={exercise.type}
                      title={exercise.title}
                      description={exercise.description}
                      points={exercise.points}
                      question={exercise.question}
                      options={exercise.options}
                      codeTemplate={exercise.codeTemplate}
                      blanks={exercise.blanks}
                      challengeSteps={exercise.challengeSteps}
                    />
                  ))}
                </motion.div>
              </TabsContent>
            )}
          </div>
        </Tabs>

        {/* Output Panel */}
        <Collapsible open={outputOpen} onOpenChange={setOutputOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-2 px-6 py-2 border-t border-border bg-muted/50 hover:bg-muted transition-colors text-sm">
              {outputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              <Terminal className="w-4 h-4 text-primary" />
              <span>Output</span>
              {lastOutput && !outputOpen && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Click to expand)
                </span>
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="px-6 py-4 bg-[hsl(220,20%,6%)] border-t border-border max-h-64 overflow-auto"
            >
              <pre className="font-mono text-sm text-primary whitespace-pre-wrap">
                {lastOutput || '// Run "Check My Progress" to see output'}
              </pre>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentStepIndex ? 1 : -1);
                onStepChange(index);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                index === currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.includes(index)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            size="sm"
            onClick={handleNextStep}
            className="gap-1"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Lab
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
