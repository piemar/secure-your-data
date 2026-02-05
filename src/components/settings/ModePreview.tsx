import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkshopMode, WorkshopLabDefinition } from '@/types';
import { getContentService } from '@/services/contentService';
import { PlayCircle, Code, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModePreviewProps {
  labIds: string[];
  defaultMode: WorkshopMode;
  allowedModes: WorkshopMode[];
}

export const ModePreview: React.FC<ModePreviewProps> = ({
  labIds,
  defaultMode,
  allowedModes
}) => {
  const [labs, setLabs] = useState<WorkshopLabDefinition[]>([]);

  useEffect(() => {
    loadLabs();
  }, [labIds]);

  const loadLabs = async () => {
    if (labIds.length === 0) {
      setLabs([]);
      return;
    }
    try {
      const contentService = getContentService();
      const loadedLabs = await Promise.all(
        labIds.map(id => contentService.getLabById(id))
      );
      setLabs(loadedLabs.filter((lab): lab is WorkshopLabDefinition => lab !== undefined));
    } catch (error) {
      console.error('Failed to load labs:', error);
    }
  };
  const getModeIcon = (mode: WorkshopMode) => {
    switch (mode) {
      case 'demo': return <PlayCircle className="w-4 h-4" />;
      case 'lab': return <Code className="w-4 h-4" />;
      case 'challenge': return <Target className="w-4 h-4" />;
    }
  };

  const getModeDescription = (mode: WorkshopMode) => {
    switch (mode) {
      case 'demo':
        return 'Presentation-focused mode with simplified steps and overview content';
      case 'lab':
        return 'Full hands-on experience with all steps and verification';
      case 'challenge':
        return 'Story-driven quests with flags and gamification';
    }
  };

  const getLabsForMode = (mode: WorkshopMode): WorkshopLabDefinition[] => {
    return labs.filter(lab => !lab.modes || lab.modes.includes(mode));
  };

  const getStepsForMode = (lab: WorkshopLabDefinition, mode: WorkshopMode): number => {
    return lab.steps.filter(step => !step.modes || step.modes.includes(mode)).length;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Mode Preview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Preview how your workshop will work in each mode
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['demo', 'lab', 'challenge'] as WorkshopMode[]).map(mode => {
          const isAllowed = allowedModes.includes(mode);
          const isDefault = mode === defaultMode;
          const modeLabs = getLabsForMode(mode);
          const totalSteps = modeLabs.reduce((sum, lab) => sum + getStepsForMode(lab, mode), 0);

          return (
            <Card
              key={mode}
              className={cn(
                "transition-all",
                isDefault && "ring-2 ring-primary border-primary",
                !isAllowed && "opacity-50"
              )}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 capitalize">
                  {getModeIcon(mode)}
                  {mode} Mode
                  {isDefault && (
                    <Badge variant="default" className="ml-auto">Default</Badge>
                  )}
                  {!isAllowed && (
                    <Badge variant="outline" className="ml-auto">Disabled</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  {getModeDescription(mode)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAllowed ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">{modeLabs.length}</span> lab{modeLabs.length !== 1 ? 's' : ''} available
                    </div>
                    <div>
                      <span className="font-medium">{totalSteps}</span> step{totalSteps !== 1 ? 's' : ''} total
                    </div>
                    {modeLabs.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium mb-1">Labs:</p>
                        <div className="space-y-1">
                          {modeLabs.slice(0, 3).map(lab => (
                            <div key={lab.id} className="text-xs text-muted-foreground">
                              • {lab.title}
                            </div>
                          ))}
                          {modeLabs.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{modeLabs.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This mode is not enabled for this workshop
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
