import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkshopLabDefinition, WorkshopMode } from '@/types';
import { getContentService } from '@/services/contentService';
import { X, Plus, Clock, CheckCircle2, AlertCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabSuggestionPanelProps {
  selectedTopicIds: string[];
  selectedMode?: WorkshopMode;
  selectedLabIds: string[];
  onLabIdsChange: (labIds: string[]) => void;
}

export const LabSuggestionPanel: React.FC<LabSuggestionPanelProps> = ({
  selectedTopicIds,
  selectedMode,
  selectedLabIds,
  onLabIdsChange
}) => {
  const [suggestedLabs, setSuggestedLabs] = useState<WorkshopLabDefinition[]>([]);
  const [allLabs, setAllLabs] = useState<WorkshopLabDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllLabs, setShowAllLabs] = useState(false);

  useEffect(() => {
    loadLabs();
  }, [selectedTopicIds, selectedMode]);

  const loadLabs = async () => {
    if (selectedTopicIds.length === 0) {
      setSuggestedLabs([]);
      setLoading(false);
      return;
    }

    try {
      const contentService = getContentService();
      const [suggestions, all] = await Promise.all([
        contentService.suggestLabsForTopics(selectedTopicIds, selectedMode),
        contentService.getLabs()
      ]);
      
      setSuggestedLabs(suggestions);
      setAllLabs(all);
    } catch (error) {
      console.error('Failed to load labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLab = (labId: string) => {
    if (!selectedLabIds.includes(labId)) {
      onLabIdsChange([...selectedLabIds, labId]);
    }
  };

  const handleRemoveLab = (labId: string) => {
    onLabIdsChange(selectedLabIds.filter(id => id !== labId));
  };

  const getLabById = (labId: string): WorkshopLabDefinition | undefined => {
    return allLabs.find(lab => lab.id === labId);
  };


  const selectedLabs = selectedLabIds
    .map(id => getLabById(id))
    .filter((lab): lab is WorkshopLabDefinition => lab !== undefined);

  const availableLabs = allLabs.filter(lab => 
    selectedTopicIds.includes(lab.topicId) &&
    !selectedLabIds.includes(lab.id) &&
    (!selectedMode || !lab.modes || lab.modes.includes(selectedMode))
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading lab suggestions...</div>;
  }

  if (selectedTopicIds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Select topics to see lab suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lab Suggestions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your topic selection, we suggest these labs. You can add or remove labs as needed.
        </p>
      </div>

      {/* Selected Labs */}
      {selectedLabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Labs ({selectedLabs.length})</CardTitle>
            <CardDescription>
              These labs will be included in your workshop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedLabs.map((lab, index) => (
              <Card key={lab.id} className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <CardTitle className="text-sm">{lab.title}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getDifficultyColor(lab.difficulty))}
                        >
                          {lab.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{lab.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {lab.modes && lab.modes.map(mode => (
                          <Badge key={mode} variant="outline" className="text-xs">
                            {mode}
                          </Badge>
                        ))}
                        {lab.estimatedTotalTimeMinutes && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lab.estimatedTotalTimeMinutes} min
                          </Badge>
                        )}
                        {lab.povCapabilities && lab.povCapabilities.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {lab.povCapabilities.length} capability{lab.povCapabilities.length !== 1 ? 'ies' : ''}
                          </Badge>
                        )}
                      </div>
                      {lab.prerequisites && lab.prerequisites.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Prerequisites:</span>{' '}
                          {lab.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLab(lab.id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggested Labs (not yet selected) */}
      {suggestedLabs.filter(lab => !selectedLabIds.includes(lab.id)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggested Labs</CardTitle>
            <CardDescription>
              Recommended labs for your selected topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedLabs
              .filter(lab => !selectedLabIds.includes(lab.id))
              .map(lab => (
                <Card key={lab.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm mb-1">{lab.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mb-2">{lab.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDifficultyColor(lab.difficulty))}
                          >
                            {lab.difficulty}
                          </Badge>
                          {lab.modes && lab.modes.map(mode => (
                            <Badge key={mode} variant="outline" className="text-xs">
                              {mode}
                            </Badge>
                          ))}
                          {lab.estimatedTotalTimeMinutes && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lab.estimatedTotalTimeMinutes} min
                            </Badge>
                          )}
                        </div>
                        {lab.prerequisites && lab.prerequisites.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Requires:</span>{' '}
                            {lab.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddLab(lab.id)}
                        className="ml-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Browse All Available Labs */}
      {availableLabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Browse All Labs</CardTitle>
            <CardDescription>
              {showAllLabs ? 'All available labs for selected topics' : `${availableLabs.length} more labs available`}
            </CardDescription>
          </CardHeader>
          {showAllLabs && (
            <CardContent className="space-y-3">
              {availableLabs.map(lab => (
                <Card key={lab.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm mb-1">{lab.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mb-2">{lab.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDifficultyColor(lab.difficulty))}
                          >
                            {lab.difficulty}
                          </Badge>
                          {lab.modes && lab.modes.map(mode => (
                            <Badge key={mode} variant="outline" className="text-xs">
                              {mode}
                            </Badge>
                          ))}
                          {lab.estimatedTotalTimeMinutes && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lab.estimatedTotalTimeMinutes} min
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddLab(lab.id)}
                        className="ml-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          )}
          {!showAllLabs && (
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setShowAllLabs(true)}
                className="w-full"
              >
                Show All Available Labs ({availableLabs.length})
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {selectedLabs.length === 0 && suggestedLabs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                No labs found for selected topics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
