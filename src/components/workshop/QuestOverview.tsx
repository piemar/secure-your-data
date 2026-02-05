import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Flag, Target, BookOpen } from 'lucide-react';
import { WorkshopQuest, WorkshopFlag } from '@/types';
import { getContentService } from '@/services/contentService';
import { cn } from '@/lib/utils';

interface QuestOverviewProps {
  questId: string;
  capturedFlags?: string[];
  completedLabs?: string[];
}

export const QuestOverview: React.FC<QuestOverviewProps> = ({
  questId,
  capturedFlags = [],
  completedLabs = []
}) => {
  const [quest, setQuest] = useState<WorkshopQuest | null>(null);
  const [flags, setFlags] = useState<WorkshopFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuest = async () => {
      try {
        const contentService = getContentService();
        const allQuests = await contentService.getQuests();
        const foundQuest = allQuests.find(q => q.id === questId);
        
        if (foundQuest) {
          setQuest(foundQuest);
          
          // Load flags for this quest
          const allFlags = await contentService.getFlags();
          const questFlags = allFlags.filter(f => 
            foundQuest.requiredFlagIds.includes(f.id) ||
            foundQuest.optionalFlagIds?.includes(f.id)
          );
          setFlags(questFlags);
        }
      } catch (error) {
        console.error('Failed to load quest:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [questId]);

  if (loading) {
    return <div className="p-4">Loading quest...</div>;
  }

  if (!quest) {
    return <div className="p-4 text-muted-foreground">Quest not found</div>;
  }

  const requiredFlags = flags.filter(f => quest.requiredFlagIds.includes(f.id));
  const optionalFlags = flags.filter(f => quest.optionalFlagIds?.includes(f.id));
  
  const capturedRequiredFlags = requiredFlags.filter(f => capturedFlags.includes(f.id));
  const capturedOptionalFlags = optionalFlags.filter(f => capturedFlags.includes(f.id));
  
  const requiredProgress = requiredFlags.length > 0 
    ? (capturedRequiredFlags.length / requiredFlags.length) * 100 
    : 0;
  
  const totalProgress = (capturedRequiredFlags.length + capturedOptionalFlags.length) / (requiredFlags.length + optionalFlags.length) * 100;

  const isQuestComplete = requiredFlags.length > 0 && capturedRequiredFlags.length === requiredFlags.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {quest.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {quest.objectiveSummary}
            </CardDescription>
          </div>
          {isQuestComplete && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Story Context */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-start gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <h3 className="font-semibold">Mission Brief</h3>
          </div>
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {quest.storyContext}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Quest Progress</span>
            <span className="text-muted-foreground">
              {capturedRequiredFlags.length} / {requiredFlags.length} required flags
            </span>
          </div>
          <Progress value={requiredProgress} className="h-2" />
          {optionalFlags.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Optional flags: {capturedOptionalFlags.length} / {optionalFlags.length}</span>
              <span>Total: {Math.round(totalProgress)}%</span>
            </div>
          )}
        </div>

        {/* Required Flags */}
        {requiredFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Required Objectives
            </h4>
            <div className="space-y-2">
              {requiredFlags.map(flag => {
                const isCaptured = capturedFlags.includes(flag.id);
                return (
                  <div
                    key={flag.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      isCaptured 
                        ? "bg-green-500/10 border-green-500/50" 
                        : "bg-muted/30 border-border"
                    )}
                  >
                    {isCaptured ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium text-sm",
                          isCaptured && "text-green-600"
                        )}>
                          {flag.name}
                        </p>
                        {flag.points && (
                          <Badge variant="outline" className="text-xs">
                            +{flag.points} pts
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {flag.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Flags */}
        {optionalFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Optional Objectives
            </h4>
            <div className="space-y-2">
              {optionalFlags.map(flag => {
                const isCaptured = capturedFlags.includes(flag.id);
                return (
                  <div
                    key={flag.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      isCaptured 
                        ? "bg-blue-500/10 border-blue-500/50" 
                        : "bg-muted/20 border-border"
                    )}
                  >
                    {isCaptured ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium text-sm",
                          isCaptured && "text-blue-600"
                        )}>
                          {flag.name}
                        </p>
                        {flag.points && (
                          <Badge variant="outline" className="text-xs">
                            +{flag.points} pts
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {flag.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Labs */}
        {quest.labIds.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Related Labs</h4>
            <div className="flex flex-wrap gap-2">
              {quest.labIds.map(labId => {
                const isCompleted = completedLabs.includes(labId);
                return (
                  <Badge
                    key={labId}
                    variant={isCompleted ? "default" : "outline"}
                    className={cn(
                      isCompleted && "bg-green-500"
                    )}
                  >
                    {labId.replace('lab-', 'Lab ').replace(/-/g, ' ')}
                    {isCompleted && <CheckCircle2 className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
