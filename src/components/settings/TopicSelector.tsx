import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkshopTopic } from '@/types';
import { PovCapability } from '@/types/pov-capabilities';
import { getContentService } from '@/services/contentService';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicSelectorProps {
  selectedTopicIds: string[];
  onSelectionChange: (topicIds: string[]) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  selectedTopicIds,
  onSelectionChange
}) => {
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);
  const [capabilities, setCapabilities] = useState<Map<string, PovCapability>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const contentService = getContentService();
      const [loadedTopics, loadedCapabilities] = await Promise.all([
        contentService.getTopics(),
        contentService.getPovCapabilities()
      ]);
      
      setTopics(loadedTopics);
      const capMap = new Map(loadedCapabilities.map(cap => [cap.id, cap]));
      setCapabilities(capMap);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicToggle = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      onSelectionChange(selectedTopicIds.filter(id => id !== topicId));
    } else {
      onSelectionChange([...selectedTopicIds, topicId]);
    }
  };

  const getTopicCapabilities = (topic: WorkshopTopic): PovCapability[] => {
    if (!topic.povCapabilities) return [];
    return topic.povCapabilities
      .map(id => capabilities.get(id))
      .filter((cap): cap is PovCapability => cap !== undefined);
  };

  const [estimatedTimes, setEstimatedTimes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadEstimatedTimes = async () => {
      const contentService = getContentService();
      const allLabs = await contentService.getLabs();
      const timesMap = new Map<string, number>();
      
      topics.forEach(topic => {
        const topicLabs = allLabs.filter(lab => lab.topicId === topic.id);
        const totalTime = topicLabs.reduce((total, lab) => total + (lab.estimatedTotalTimeMinutes || 0), 0);
        timesMap.set(topic.id, totalTime);
      });
      
      setEstimatedTimes(timesMap);
    };
    
    if (topics.length > 0) {
      loadEstimatedTimes();
    }
  }, [topics]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading topics...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Topics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the topics you want to cover in this workshop. Each topic shows the MongoDB capabilities it covers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const isSelected = selectedTopicIds.includes(topic.id);
          const topicCaps = getTopicCapabilities(topic);
          const estimatedTime = estimatedTimes.get(topic.id) || 0;

          return (
            <Card
              key={topic.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary"
              )}
              onClick={() => handleTopicToggle(topic.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {topic.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        {topic.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* POV Capabilities */}
                  {topicCaps.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Covers {topicCaps.length} capability{topicCaps.length !== 1 ? 'ies' : ''}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topicCaps.slice(0, 5).map(cap => (
                          <Badge key={cap.id} variant="secondary" className="text-xs">
                            {cap.label}
                          </Badge>
                        ))}
                        {topicCaps.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{topicCaps.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topic.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Estimated Time */}
                  {estimatedTime > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      ~{Math.round(estimatedTime / 60)}h {estimatedTime % 60}m total
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTopicIds.length > 0 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium">
            {selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};
