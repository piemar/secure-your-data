import { Clock, Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EncryptionFlowVisual } from '@/components/workshop/EncryptionFlowVisual';

interface LabIntroTabProps {
  labNumber: number;
  title: string;
  duration: string;
  description: string;
  whatYouWillBuild: string[];
  keyConcepts: Array<{ term: string; explanation: string }>;
  keyInsight: string;
  architectureDiagram?: React.ReactNode;
  showEncryptionFlow?: boolean;
  encryptionFlowType?: 'csfle' | 'qe';
  onStartLab: () => void;
}

export function LabIntroTab({
  labNumber,
  title,
  duration,
  description,
  whatYouWillBuild,
  keyConcepts,
  keyInsight,
  architectureDiagram,
  showEncryptionFlow = false,
  encryptionFlowType = 'csfle',
  onStartLab
}: LabIntroTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Compact Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">
            LAB {labNumber}
          </div>
          <h1 className="text-2xl font-bold text-gradient-green">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">{description}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Two Column Layout: What You'll Build + Key Concepts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* What You'll Build - Compact */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">🔧</span>
              What You'll Build
            </h2>
            <div className="space-y-2">
              {whatYouWillBuild.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts - Compact */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              Key Concepts
            </h2>
            <div className="space-y-2">
              {keyConcepts.map((concept, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-primary">{concept.term}:</span>{' '}
                  <span className="text-muted-foreground">{concept.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insight - Compact */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-primary">SA Insight: </span>
            <span className="text-muted-foreground italic">"{keyInsight}"</span>
          </div>
        </div>

        {/* Architecture/Flow Section */}
        {(showEncryptionFlow || architectureDiagram) && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">🔄</span>
              How It Works
            </h2>
            {showEncryptionFlow ? (
              <EncryptionFlowVisual type={encryptionFlowType} autoPlay={false} />
            ) : architectureDiagram ? (
              <div className="rounded-lg bg-card border border-border overflow-hidden">
                {architectureDiagram}
              </div>
            ) : null}
          </div>
        )}

        {/* Start Button */}
        <div className="flex justify-center pt-2">
          <Button onClick={onStartLab} className="gap-2">
            Start Lab
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
