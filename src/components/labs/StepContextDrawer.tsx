import { useState } from 'react';
import { BookOpen, CheckSquare, Lightbulb, AlertTriangle, Sparkles, Database, Target } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface StepContextDrawerProps {
  understandSection?: string;
  doThisSection?: string[];
  hints?: string[];
  tips?: string[];
  troubleshooting?: string[];
  businessValue?: string;
  atlasCapability?: string;
  trigger?: React.ReactNode;
  /** When provided with onOpenChange, drawer is controlled (no trigger rendered) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StepContextDrawer({
  understandSection,
  doThisSection,
  hints,
  tips,
  troubleshooting,
  businessValue,
  atlasCapability,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: StepContextDrawerProps) {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const hasContent = understandSection || doThisSection?.length || hints?.length || tips?.length || troubleshooting?.length || businessValue || atlasCapability;

  if (!hasContent) return null;

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const isControlled = controlledOpen !== undefined && onOpenChange != null;

  return (
    <Sheet open={isControlled ? controlledOpen : undefined} onOpenChange={isControlled ? onOpenChange : undefined}>
      {!isControlled && (
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Help & Tips</span>
              <span className="xs:hidden">Help</span>
            </Button>
          )}
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Step Context & Help
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Context Section - Business Value & Atlas Capability */}
          {(businessValue || atlasCapability) && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="w-4 h-4 text-primary" />
                Lab Context
              </h3>
              {atlasCapability && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Database className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground">Atlas Capability</span>
                    <p className="text-sm font-mono text-primary">{atlasCapability}</p>
                  </div>
                </div>
              )}
              {businessValue && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground">Business Value</span>
                    <p className="text-sm text-foreground">{businessValue}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Understand Section */}
          {understandSection && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                What This Step Does
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                {understandSection}
              </p>
            </section>
          )}

          {/* Do This Section */}
          {doThisSection && doThisSection.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <CheckSquare className="w-4 h-4 text-green-500" />
                Action Checklist
              </h3>
              <ul className="space-y-2">
                {doThisSection.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">{action}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Progressive Hints */}
          {hints && hints.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Hints
                <span className="text-xs text-muted-foreground font-normal">
                  (click to reveal progressively)
                </span>
              </h3>
              <div className="space-y-2">
                {hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      revealedHints.includes(idx)
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-muted/50 border-border cursor-pointer hover:border-yellow-500/50'
                    )}
                    onClick={() => revealHint(idx)}
                  >
                    {revealedHints.includes(idx) ? (
                      <p className="text-sm text-foreground">{hint}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Hint {idx + 1} - Click to reveal
                        {idx > 0 && !revealedHints.includes(idx - 1) && (
                          <span className="text-xs opacity-60">(reveal previous first)</span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pro Tips */}
          {tips && tips.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Pro Tips for SAs
              </h3>
              <div className="space-y-2">
                {tips.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Troubleshooting */}
          {troubleshooting && troubleshooting.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Troubleshooting
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {troubleshooting.map((issue, idx) => (
                  <AccordionItem key={idx} value={`trouble-${idx}`} className="border-border">
                    <AccordionTrigger className="text-sm text-left hover:no-underline py-2">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        Common Issue {idx + 1}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {issue}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
