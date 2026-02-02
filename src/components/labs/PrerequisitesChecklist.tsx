import React from 'react';
import { Package, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Prerequisite {
  id: string;
  label: string;
  description: string;
  required: boolean;
  downloadUrl?: string;
}

interface PrerequisitesChecklistProps {
  prerequisites: Prerequisite[];
  verifiedTools: Record<string, { verified: boolean; path: string }>;
}

export const PrerequisitesChecklist: React.FC<PrerequisitesChecklistProps> = ({
  prerequisites,
  verifiedTools
}) => {
  const requiredPrereqs = prerequisites.filter(p => p.required);
  const optionalPrereqs = prerequisites.filter(p => !p.required);

  const renderPrereq = (prereq: Prerequisite) => {
    const isVerified = verifiedTools[prereq.id]?.verified;
    
    return (
      <div key={prereq.id} className="flex items-start gap-3 py-2">
        <div className={cn(
          "mt-0.5 flex-shrink-0",
          isVerified ? "text-green-500" : "text-muted-foreground"
        )}>
          {isVerified ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm",
              isVerified && "text-green-600"
            )}>
              {prereq.label}
            </span>
            {prereq.downloadUrl && (
              <a
                href={prereq.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{prereq.description}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          What You'll Need
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          Before starting the labs, ensure you have the following tools installed:
        </p>
        
        {/* Required */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Required
          </h4>
          <div className="divide-y divide-border/50">
            {requiredPrereqs.map(renderPrereq)}
          </div>
        </div>

        {/* Optional */}
        {optionalPrereqs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Optional (for Lab 2)
            </h4>
            <div className="divide-y divide-border/50">
              {optionalPrereqs.map(renderPrereq)}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 p-2 bg-muted/30 rounded">
          Click "Check Prerequisites" below to verify your installation status.
        </p>
      </CardContent>
    </Card>
  );
};
