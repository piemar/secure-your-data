import { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CodePlayground } from '@/components/workshop/CodePlayground';
import { DifficultyBadge, DifficultyLevel } from './DifficultyBadge';

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  skeleton?: string;
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

  const currentStep = steps[currentStepIndex];
  const isCompleted = completedSteps.includes(currentStepIndex);

  const handleRunCode = (code: string) => {
    // Simulate output
    const mockOutput = JSON.stringify(
      { acknowledged: true, insertedId: "ObjectId('...')" },
      null,
      2
    );
    setLastOutput(mockOutput);
    setOutputOpen(true);
  };

  const handleNextStep = () => {
    if (!isCompleted) {
      onComplete(currentStepIndex);
    }
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
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
          <div className="mt-3 flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-md">
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Business Value:</strong> {businessValue}
            </span>
          </div>
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
                <span className="font-mono text-xs">&lt;/&gt;</span> Code
              </TabsTrigger>
              <TabsTrigger
                value="explanation"
                className="data-[state=active]:bg-card data-[state=active]:border-border border border-transparent px-4 py-2 rounded-md text-sm gap-2"
              >
                <Lightbulb className="w-4 h-4" /> Explanation
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  const code = currentStep.codeBlocks?.[0]?.code || '';
                  handleRunCode(code);
                }}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Step Title */}
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="code" className="h-full m-0 data-[state=inactive]:hidden">
              <div className="h-full flex flex-col">
                {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
                  <div className="flex-1 overflow-hidden">
                    <CodePlayground
                      initialCode={currentStep.codeBlocks[0].code}
                      language={currentStep.codeBlocks[0].language || 'javascript'}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>No code for this step</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="explanation" className="h-full m-0 p-6 overflow-auto data-[state=inactive]:hidden">
              <div className="max-w-2xl space-y-6">
                {/* Understanding */}
                {currentStep.understandSection && (
                  <div className="p-4 rounded-lg bg-accent/50 border border-accent">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      📖 Understanding
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
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Output Panel */}
        <Collapsible open={outputOpen} onOpenChange={setOutputOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-2 px-6 py-2 border-t border-border bg-muted/50 hover:bg-muted transition-colors text-sm">
              {outputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              <span className="font-mono text-primary">&gt;_</span>
              <span>Output</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 py-4 bg-[hsl(var(--code-bg))] border-t border-border max-h-48 overflow-auto">
              <pre className="font-mono text-sm text-primary">
                {lastOutput || '// Run code to see output'}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => onStepChange(index)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                index === currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.includes(index)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {index + 1}
            </button>
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
            {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next Step'}
            {currentStepIndex < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
