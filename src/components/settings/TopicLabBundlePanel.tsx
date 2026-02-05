import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { WorkshopTopic, WorkshopLabDefinition, WorkshopMode } from '@/types';
import { getContentService } from '@/services/contentService';
import { Package, Clock, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicLabBundlePanelProps {
  selectedTopicIds: string[];
  selectedMode?: WorkshopMode;
  selectedLabIds: string[];
  onLabIdsChange: (labIds: string[]) => void;
}

/**
 * Shows labs grouped by topic (bundle). Top level = topic; under each topic,
 * the bundle of labs with checkboxes to include/exclude from the workshop.
 * Default: all labs in each selected topic's bundle are included; moderator
 * can uncheck to exclude specific labs from the bundle.
 */
export const TopicLabBundlePanel: React.FC<TopicLabBundlePanelProps> = ({
  selectedTopicIds,
  selectedMode,
  selectedLabIds,
  onLabIdsChange
}) => {
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);
  const [bundles, setBundles] = useState<Record<string, WorkshopLabDefinition[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopicsAndBundles();
  }, [selectedTopicIds, selectedMode]);

  const loadTopicsAndBundles = async () => {
    if (selectedTopicIds.length === 0) {
      setTopics([]);
      setBundles({});
      setLoading(false);
      return;
    }
    try {
      const contentService = getContentService();
      const allTopics = await contentService.getTopics();
      const selectedTopics = allTopics.filter(t => selectedTopicIds.includes(t.id));
      setTopics(selectedTopics);

      const labsByTopic: Record<string, WorkshopLabDefinition[]> = {};
      for (const topicId of selectedTopicIds) {
        let labs = await contentService.getLabsByTopic(topicId);
        if (selectedMode) {
          labs = labs.filter(lab => !lab.modes || lab.modes.includes(selectedMode));
        }
        labsByTopic[topicId] = labs;
      }
      setBundles(labsByTopic);
    } catch (error) {
      console.error('Failed to load topic bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBundleLabToggle = (labId: string, checked: boolean) => {
    if (checked) {
      if (!selectedLabIds.includes(labId)) {
        onLabIdsChange([...selectedLabIds, labId]);
      }
    } else {
      onLabIdsChange(selectedLabIds.filter(id => id !== labId));
    }
  };

  const handleSelectAllForTopic = (topicId: string, select: boolean) => {
    const labs = bundles[topicId] || [];
    const labIds = labs.map(l => l.id);
    if (select) {
      const added = new Set([...selectedLabIds, ...labIds]);
      onLabIdsChange(Array.from(added));
    } else {
      onLabIdsChange(selectedLabIds.filter(id => !labIds.includes(id)));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/20';
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-4">Loading topic bundles...</div>;
  }

  if (selectedTopicIds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Select topics in Step 1 to see their lab bundles here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Labs by topic (bundle)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Each topic has a bundle of labs. By default all labs in the bundle are included.
          Uncheck labs you do not want in this workshop. Order is preserved by topic and prerequisites.
        </p>
      </div>

      {topics.map(topic => {
        const topicLabs = bundles[topic.id] || [];
        const selectedCount = topicLabs.filter(lab => selectedLabIds.includes(lab.id)).length;
        const allSelected = topicLabs.length > 0 && selectedCount === topicLabs.length;
        const noneSelected = selectedCount === 0;

        return (
          <Card key={topic.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {topic.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleSelectAllForTopic(topic.id, true)}
                  >
                    <CheckSquare className="w-3 h-3 mr-1" />
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleSelectAllForTopic(topic.id, false)}
                  >
                    <Square className="w-3 h-3 mr-1" />
                    None
                  </Button>
                  <Badge variant="secondary">
                    {selectedCount}/{topicLabs.length} labs
                  </Badge>
                </div>
              </div>
              {topic.description && (
                <CardDescription className="mt-1">{topic.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {topicLabs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labs in this topic yet.</p>
              ) : (
                <div className="space-y-2">
                  {topicLabs.map(lab => {
                    const isIncluded = selectedLabIds.includes(lab.id);
                    return (
                      <div
                        key={lab.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                          isIncluded && "bg-primary/5 border-primary/20"
                        )}
                      >
                        <Checkbox
                          id={lab.id}
                          checked={isIncluded}
                          onCheckedChange={(checked) =>
                            handleBundleLabToggle(lab.id, checked === true)
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={lab.id}
                          className="flex-1 cursor-pointer text-sm font-normal space-y-1"
                        >
                          <div className="font-medium">{lab.title}</div>
                          {lab.description && (
                            <p className="text-xs text-muted-foreground">{lab.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", getDifficultyColor(lab.difficulty))}
                            >
                              {lab.difficulty}
                            </Badge>
                            {lab.estimatedTotalTimeMinutes && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lab.estimatedTotalTimeMinutes} min
                              </Badge>
                            )}
                            {lab.povCapabilities && lab.povCapabilities.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {lab.povCapabilities.length} POV
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
