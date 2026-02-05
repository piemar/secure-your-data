import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkshopQuest, WorkshopTemplate } from '@/types';
import { getContentService } from '@/services/contentService';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { Lock, CheckCircle2, Target, Flag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestNode {
  quest: WorkshopQuest;
  isLocked: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
}

/**
 * QuestMapView - Visual quest map for Challenge Mode
 * 
 * Displays quests as nodes on a visual map with locked/unlocked states.
 * Shows progression path and allows clicking unlocked quests to start them.
 */
export function QuestMapView() {
  const { activeTemplate, currentMode, setCurrentLabId } = useWorkshopSession();
  const { setSection } = useNavigation();
  const [quests, setQuests] = useState<WorkshopQuest[]>([]);
  const [questNodes, setQuestNodes] = useState<QuestNode[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [capturedFlags, setCapturedFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
    loadProgress();
  }, [activeTemplate]);

  useEffect(() => {
    if (quests.length > 0) {
      calculateQuestNodes();
    }
  }, [quests, completedQuests, capturedFlags]);

  const loadQuests = async () => {
    try {
      if (!activeTemplate || !activeTemplate.questIds || activeTemplate.questIds.length === 0) {
        setQuests([]);
        setLoading(false);
        return;
      }

      const contentService = getContentService();
      const allQuests = await contentService.getQuests();
      const templateQuests = allQuests.filter((q) =>
        activeTemplate.questIds!.includes(q.id)
      );

      // Sort quests by order in template
      const sortedQuests = activeTemplate.questIds
        .map((id) => templateQuests.find((q) => q.id === id))
        .filter((q): q is WorkshopQuest => !!q);

      setQuests(sortedQuests);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = () => {
    // Load completed quests from localStorage
    const savedCompleted = localStorage.getItem('completed_quests');
    if (savedCompleted) {
      setCompletedQuests(JSON.parse(savedCompleted));
    }

    // Load captured flags from localStorage
    const savedFlags = localStorage.getItem('captured_flags');
    if (savedFlags) {
      setCapturedFlags(JSON.parse(savedFlags));
    }
  };

  const calculateQuestNodes = () => {
    const nodes: QuestNode[] = quests.map((quest, index) => {
      // Determine if quest is locked
      // First quest is always unlocked
      // Subsequent quests are unlocked if previous quest is completed
      const isLocked =
        index > 0 && !completedQuests.includes(quests[index - 1].id);

      const isCompleted = completedQuests.includes(quest.id);

      // Calculate position on map (grid layout)
      const cols = Math.ceil(Math.sqrt(quests.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * 280 + 40; // 280px spacing, 40px margin
      const y = row * 200 + 40; // 200px spacing, 40px margin

      return {
        quest,
        isLocked,
        isCompleted,
        position: { x, y }
      };
    });

    setQuestNodes(nodes);
  };

  const handleQuestClick = (quest: WorkshopQuest, isLocked: boolean) => {
    if (isLocked) return;

    // Navigate to challenge mode with this quest selected
    // The ChallengeModeView will handle displaying the quest
    setCurrentLabId(null);
    setSection('challenge');
    
    // Store selected quest in session
    localStorage.setItem('selected_quest_id', quest.id);
  };

  const getQuestCompletionStatus = (quest: WorkshopQuest) => {
    const requiredFlags = quest.requiredFlagIds || [];
    const capturedRequiredFlags = requiredFlags.filter((flagId) =>
      capturedFlags.includes(flagId)
    );
    const allRequiredCaptured = requiredFlags.length === 0 || capturedRequiredFlags.length === requiredFlags.length;
    
    return {
      allRequiredCaptured,
      capturedCount: capturedRequiredFlags.length,
      requiredCount: requiredFlags.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading quest map...</div>
      </div>
    );
  }

  if (!activeTemplate || quests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Quests Available</CardTitle>
            <CardDescription>
              {activeTemplate
                ? 'The selected template does not include quests.'
                : 'No template selected. Please select a challenge template in Workshop Settings.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate map dimensions
  const cols = Math.ceil(Math.sqrt(quests.length));
  const rows = Math.ceil(quests.length / cols);
  const mapWidth = cols * 280 + 80;
  const mapHeight = rows * 200 + 80;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Quest Map</h1>
          <p className="text-muted-foreground">
            Complete quests in order to unlock new challenges. Capture flags to progress.
            {activeTemplate && (
              <span className="ml-2 text-sm">
                Template: <strong>{activeTemplate.name}</strong>
              </span>
            )}
          </p>
        </div>

        {/* Quest Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Challenge Quests
            </CardTitle>
            <CardDescription>
              {completedQuests.length} of {quests.length} quests completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative border-2 border-dashed border-muted rounded-lg bg-muted/20"
              style={{
                width: `${mapWidth}px`,
                height: `${mapHeight}px`,
                minHeight: '400px'
              }}
            >
              {/* Quest Nodes */}
              {questNodes.map((node, index) => {
                const status = getQuestCompletionStatus(node.quest);
                const isClickable = !node.isLocked;

                return (
                  <div
                    key={node.quest.id}
                    className="absolute"
                    style={{
                      left: `${node.position.x}px`,
                      top: `${node.position.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Connection Line (if not first quest) */}
                    {index > 0 && (
                      <div
                        className="absolute"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: `${Math.abs(node.position.x - questNodes[index - 1].position.x)}px`,
                          height: '2px',
                          backgroundColor: node.isLocked ? '#e5e7eb' : '#3b82f6',
                          transform: `translate(${
                            node.position.x < questNodes[index - 1].position.x ? '-100%' : '0'
                          }, -50%) rotate(${
                            node.position.y !== questNodes[index - 1].position.y
                              ? Math.atan2(
                                  node.position.y - questNodes[index - 1].position.y,
                                  node.position.x - questNodes[index - 1].position.x
                                ) * (180 / Math.PI)
                              : 0
                          }deg)`,
                          transformOrigin: 'left center',
                          zIndex: 0
                        }}
                      />
                    )}

                    {/* Quest Node Card */}
                    <Card
                      className={cn(
                        'w-64 cursor-pointer transition-all relative z-10',
                        isClickable
                          ? 'hover:shadow-lg hover:scale-105'
                          : 'opacity-60 cursor-not-allowed',
                        node.isCompleted && 'ring-2 ring-green-500',
                        node.isLocked && 'ring-2 ring-gray-300'
                      )}
                      onClick={() => handleQuestClick(node.quest, node.isLocked)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Quest {index + 1}
                              </Badge>
                              {node.isCompleted && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                              {node.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <CardTitle className="text-base leading-tight">
                              {node.quest.title}
                            </CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {node.quest.objectiveSummary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        {/* Flags Status */}
                        {node.quest.requiredFlagIds && node.quest.requiredFlagIds.length > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <Flag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {status.capturedCount}/{status.requiredCount} flags
                            </span>
                            {status.allRequiredCaptured && (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                                Ready
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Labs Count */}
                        {node.quest.labIds && node.quest.labIds.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>{node.quest.labIds.length} lab{node.quest.labIds.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="pt-2">
                          {node.isLocked ? (
                            <Badge variant="secondary" className="w-full justify-center">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          ) : node.isCompleted ? (
                            <Badge variant="default" className="w-full justify-center bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="default" className="w-full justify-center">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Start Quest
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white" />
                <span>Locked Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-white" />
                <span>Available Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50" />
                <span>Completed Quest</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span>Flags Required</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
