import React from 'react';
import { LabRunner } from '@/labs/LabRunner';
import { WorkshopQuest, WorkshopTemplate } from '@/types';
import { getEffectiveLabOverlay } from '@/utils/labContextOverlayUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface QuestLabViewProps {
  labId: string;
  labNumber: number;
  quest: WorkshopQuest;
  template?: WorkshopTemplate;
  stepEnhancements?: Map<string, any>;
}

/**
 * QuestLabView renders a lab within a quest context, applying quest-specific
 * narrative overlays so the same lab can be reused across different quests
 * with different story contexts.
 */
export const QuestLabView: React.FC<QuestLabViewProps> = ({
  labId,
  labNumber,
  quest,
  template,
  stepEnhancements
}) => {
  const overlay = getEffectiveLabOverlay(labId, quest, template);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {overlay?.titleOverride || `Lab ${labNumber}`}
        </CardTitle>
        {overlay?.introNarrative && (
          <CardDescription className="mt-2 whitespace-pre-line">
            {overlay.introNarrative}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <LabRunner
          labNumber={labNumber}
          labId={labId}
          stepEnhancements={stepEnhancements}
          labContextOverlay={overlay}
        />
        {overlay?.outroNarrative && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm whitespace-pre-line">{overlay.outroNarrative}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
