import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkshopTopic } from '@/types';
import { PovCapability } from '@/types/pov-capabilities';
import { getContentService } from '@/services/contentService';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapabilityCoverageViewProps {
  selectedTopicIds: string[];
}

export const CapabilityCoverageView: React.FC<CapabilityCoverageViewProps> = ({
  selectedTopicIds
}) => {
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);
  const [allCapabilities, setAllCapabilities] = useState<PovCapability[]>([]);
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
      setAllCapabilities(loadedCapabilities);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get selected topics
  const selectedTopics = topics.filter(t => selectedTopicIds.includes(t.id));

  // Get all capabilities covered by selected topics
  const coveredCapabilityIds = new Set<string>();
  selectedTopics.forEach(topic => {
    if (topic.povCapabilities) {
      topic.povCapabilities.forEach(capId => coveredCapabilityIds.add(capId));
    }
  });

  const coveredCapabilities = allCapabilities.filter(cap => coveredCapabilityIds.has(cap.id));
  const uncoveredCapabilities = allCapabilities.filter(cap => !coveredCapabilityIds.has(cap.id));

  // Group capabilities by category
  const capabilitiesByCategory = new Map<string, PovCapability[]>();
  coveredCapabilities.forEach(cap => {
    if (!capabilitiesByCategory.has(cap.category)) {
      capabilitiesByCategory.set(cap.category, []);
    }
    capabilitiesByCategory.get(cap.category)!.push(cap);
  });

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading capabilities...</div>;
  }

  if (selectedTopicIds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Select topics to see capability coverage
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Capability Coverage
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your selected topics cover {coveredCapabilities.length} of {allCapabilities.length} MongoDB PoV capabilities
        </p>
      </div>

      {/* Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coverage Summary</CardTitle>
          <CardDescription>
            {coveredCapabilities.length} / {allCapabilities.length} capabilities covered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(coveredCapabilities.length / allCapabilities.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-green-700 dark:text-green-400">
              {coveredCapabilities.length} covered
            </span>
            {uncoveredCapabilities.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {uncoveredCapabilities.length} not covered
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Covered Capabilities by Category */}
      {Array.from(capabilitiesByCategory.entries()).map(([category, caps]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{category.replace('-', ' ')}</CardTitle>
            <CardDescription>
              {caps.length} capability{caps.length !== 1 ? 'ies' : ''} covered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {caps.map(cap => (
                <Badge key={cap.id} variant="default" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {cap.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Uncovered Capabilities (if any) */}
      {uncoveredCapabilities.length > 0 && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              Not Covered
            </CardTitle>
            <CardDescription>
              These capabilities are not covered by your selected topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uncoveredCapabilities.slice(0, 10).map(cap => (
                <Badge key={cap.id} variant="outline" className="text-muted-foreground">
                  {cap.label}
                </Badge>
              ))}
              {uncoveredCapabilities.length > 10 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{uncoveredCapabilities.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
