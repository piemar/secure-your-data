import { Clock, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LabIntroTabProps {
  labNumber: number;
  title: string;
  duration: string;
  description: string;
  whatYouWillBuild: string[];
  keyConcepts: Array<{ term: string; explanation: string }>;
  keyInsight: string;
  architectureDiagram?: React.ReactNode;
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
  onStartLab
}: LabIntroTabProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono">
          <Target className="w-4 h-4" />
          LAB {labNumber}
        </div>
        <h1 className="text-3xl font-bold text-gradient-green">{title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* What You'll Build */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">🔧</span>
          What You'll Build
        </h2>
        <ul className="grid gap-3">
          {whatYouWillBuild.map((item, i) => (
            <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Architecture Diagram */}
      {architectureDiagram && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">🏗️</span>
            Architecture
          </h2>
          <div className="p-6 rounded-lg bg-card border border-border overflow-x-auto">
            {architectureDiagram}
          </div>
        </div>
      )}

      {/* Key Concepts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">📚</span>
          Key Concepts
        </h2>
        <div className="grid gap-3">
          {keyConcepts.map((concept, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <div className="font-semibold text-primary mb-1">{concept.term}</div>
              <p className="text-sm text-muted-foreground">{concept.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-primary mb-2">Key Insight for SAs</div>
            <blockquote className="text-muted-foreground italic border-l-2 border-primary/30 pl-4">
              "{keyInsight}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onStartLab} className="gap-2">
          Start Lab
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
