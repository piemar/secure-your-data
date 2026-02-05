import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { WorkshopLabDefinition, WorkshopTopic, WorkshopMode } from '@/types';
import { PovCapability } from '@/types/pov-capabilities';
import { getContentService } from '@/services/contentService';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ChevronDown, ChevronRight, Clock, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LabHubView - Topic-based lab navigation hub for Lab Mode
 * 
 * Displays labs grouped by topic with collapsible sections.
 * Shows PoV badges, difficulty, duration, and completion status.
 * Integrates with WorkshopSessionContext for template filtering.
 */
export function LabHubView() {
  const { activeTemplate, currentLabId, setCurrentLabId, currentMode } = useWorkshopSession();
  const { setSection } = useNavigation();
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);
  const [labs, setLabs] = useState<WorkshopLabDefinition[]>([]);
  const [capabilities, setCapabilities] = useState<PovCapability[]>([]);
  const [labsByTopic, setLabsByTopic] = useState<Map<string, WorkshopLabDefinition[]>>(new Map());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (labs.length > 0 && topics.length > 0) {
      groupLabsByTopic();
    }
  }, [labs, topics, activeTemplate]);

  const loadData = async () => {
    try {
      const contentService = getContentService();
      const [allLabs, allTopics, allCapabilities] = await Promise.all([
        contentService.getLabs(),
        contentService.getTopics(),
        contentService.getPovCapabilities(),
      ]);

      // Filter labs by active template if present
      let filteredLabs = allLabs;
      if (activeTemplate && activeTemplate.labIds && activeTemplate.labIds.length > 0) {
        filteredLabs = allLabs.filter((lab) => activeTemplate.labIds.includes(lab.id));
      }

      // Filter labs by current mode
      filteredLabs = filteredLabs.filter(
        (lab) => !lab.modes || lab.modes.includes(currentMode)
      );

      setLabs(filteredLabs);
      setTopics(allTopics);
      setCapabilities(allCapabilities);

      // Expand topics that have labs
      const topicsWithLabs = new Set(
        filteredLabs.map((lab) => lab.topicId).filter(Boolean)
      );
      setExpandedTopics(topicsWithLabs);
    } catch (error) {
      console.error('Failed to load lab hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupLabsByTopic = () => {
    const grouped = new Map<string, WorkshopLabDefinition[]>();

    topics.forEach((topic) => {
      const topicLabs = labs.filter((lab) => lab.topicId === topic.id);
      if (topicLabs.length > 0) {
        grouped.set(topic.id, topicLabs);
      }
    });

    setLabsByTopic(grouped);
  };

  const getPovCapabilityLabel = (capabilityId: string): string => {
    const capability = capabilities.find((cap) => cap.id === capabilityId);
    return capability?.label || capabilityId;
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleLabClick = (labId: string) => {
    setCurrentLabId(labId);
    setSection('lab');
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading labs...</div>
      </div>
    );
  }

  if (labs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Labs Available</CardTitle>
            <CardDescription>
              {activeTemplate
                ? 'No labs match the current template and mode.'
                : 'No labs are available for the current mode.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Lab Hub</h1>
          <p className="text-muted-foreground">
            Browse labs organized by topic. Click on any lab to start.
            {activeTemplate && (
              <span className="ml-2 text-sm">
                Filtered by template: <strong>{activeTemplate.name}</strong>
              </span>
            )}
          </p>
        </div>

        {/* Topics with Labs */}
        {topics
          .filter((topic) => labsByTopic.has(topic.id))
          .map((topic) => {
            const topicLabs = labsByTopic.get(topic.id) || [];
            const isExpanded = expandedTopics.has(topic.id);

            return (
              <Collapsible
                key={topic.id}
                open={isExpanded}
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="text-xl">{topic.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {topic.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {topicLabs.length} lab{topicLabs.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topicLabs.map((lab) => {
                          const isActive = lab.id === currentLabId;
                          return (
                            <Card
                              key={lab.id}
                              className={cn(
                                'cursor-pointer transition-all hover:shadow-md',
                                isActive && 'ring-2 ring-primary'
                              )}
                              onClick={() => handleLabClick(lab.id)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-base leading-tight">
                                    {lab.title}
                                  </CardTitle>
                                  {isActive && (
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                  )}
                                </div>
                                <CardDescription className="text-xs mt-1 line-clamp-2">
                                  {lab.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                {/* PoV Badges */}
                                {lab.povCapabilities && lab.povCapabilities.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {lab.povCapabilities.slice(0, 3).map((capId) => (
                                      <Badge
                                        key={capId}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {getPovCapabilityLabel(capId)}
                                      </Badge>
                                    ))}
                                    {lab.povCapabilities.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{lab.povCapabilities.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {lab.difficulty && (
                                    <Badge
                                      variant="secondary"
                                      className={cn('text-xs', getDifficultyColor(lab.difficulty))}
                                    >
                                      {lab.difficulty}
                                    </Badge>
                                  )}
                                  {lab.estimatedTotalTimeMinutes && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{lab.estimatedTotalTimeMinutes} min</span>
                                    </div>
                                  )}
                                  {lab.steps && (
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      <span>{lab.steps.length} steps</span>
                                    </div>
                                  )}
                                </div>

                                {/* Modes */}
                                {lab.modes && lab.modes.length > 0 && (
                                  <div className="flex gap-1">
                                    {lab.modes.map((mode) => (
                                      <Badge
                                        key={mode}
                                        variant="outline"
                                        className={cn(
                                          'text-xs',
                                          mode === currentMode && 'bg-primary/10 border-primary'
                                        )}
                                      >
                                        {mode}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
      </div>
    </div>
  );
}
