import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Terminal, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DifficultyBadge, DifficultyLevel } from './DifficultyBadge';
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
  type: 'quiz' | 'fill_blank' | 'challenge';
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Sticky */}
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
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Step Header with Actions */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStepIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <h2 className="font-semibold truncate">{currentStep.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{currentStep.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
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

        {/* Code Editor - Full Height */}
        <div className="flex-1 overflow-hidden min-h-0">
          {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
            <div className="h-full flex flex-col">
              {currentStep.codeBlocks.map((block, idx) => (
                <div key={idx} className="h-full flex flex-col">
                  <div className="flex-shrink-0 px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{block.filename}</span>
                    {currentStep.estimatedTime && (
                      <span className="text-xs text-muted-foreground">
                        ⏱️ {currentStep.estimatedTime}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0">
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
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No code for this step</p>
                {currentStep.understandSection && (
                  <p className="text-sm mt-2 max-w-md px-4">{currentStep.understandSection}</p>
                )}
              </div>
            </div>
          )}
        </div>

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

      {/* Footer Navigation - Always Visible */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-1.5">
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
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
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
