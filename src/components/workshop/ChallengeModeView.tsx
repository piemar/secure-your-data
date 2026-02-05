import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Target, Flag, BookOpen, Trophy } from 'lucide-react';
import { WorkshopTemplate, WorkshopQuest } from '@/types';
import { getContentService } from '@/services/contentService';
import { QuestOverview } from './QuestOverview';
import { FlagCapture } from './FlagCapture';
import { QuestLabView } from './QuestLabView';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useLab } from '@/context/LabContext';
import { createGamificationService } from '@/services/gamificationService';
import { cn } from '@/lib/utils';
// Markdown rendering helper
const renderMarkdown = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-semibold mt-2 mb-1">{line.substring(4)}</h3>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
    }
    return <p key={i} className="mb-2">{line}</p>;
  });
};

interface ChallengeModeViewProps {
  templateId?: string;
}

export const ChallengeModeView: React.FC<ChallengeModeViewProps> = ({
  templateId
}) => {
  const { activeTemplate, currentMode } = useWorkshopSession();
  const { userEmail } = useLab();
  const [template, setTemplate] = useState<WorkshopTemplate | null>(null);
  const [quests, setQuests] = useState<WorkshopQuest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [capturedFlags, setCapturedFlags] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [allFlags, setAllFlags] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  const gamificationService = React.useMemo(() => {
    const config = template?.gamification || { enabled: true, basePointsPerStep: 10 };
    return createGamificationService(config);
  }, [template]);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const contentService = getContentService();
        let challengeTemplate: WorkshopTemplate | null = null;

        if (templateId) {
          const templates = await contentService.getTemplates();
          challengeTemplate = templates.find(t => t.id === templateId) || null;
        } else if (activeTemplate) {
          challengeTemplate = activeTemplate;
        }

        if (challengeTemplate && challengeTemplate.questIds) {
          setTemplate(challengeTemplate);
          
          const allQuests = await contentService.getQuests();
          const challengeQuests = allQuests.filter(q => 
            challengeTemplate!.questIds!.includes(q.id)
          );
          setQuests(challengeQuests);
          
          // Load all flags
          const flags = await contentService.getFlags();
          const flagMap = new Map(flags.map(f => [f.id, f]));
          setAllFlags(flagMap);
          
          // Check if a quest was selected from QuestMapView
          const savedQuestId = localStorage.getItem('selected_quest_id');
          if (savedQuestId && challengeQuests.some(q => q.id === savedQuestId)) {
            setSelectedQuestId(savedQuestId);
          } else if (challengeQuests.length > 0) {
            setSelectedQuestId(challengeQuests[0].id);
          }
        }

        // Load captured flags from localStorage
        const savedFlags = localStorage.getItem('captured_flags');
        if (savedFlags) {
          setCapturedFlags(JSON.parse(savedFlags));
        }

        const savedQuests = localStorage.getItem('completed_quests');
        if (savedQuests) {
          setCompletedQuests(JSON.parse(savedQuests));
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [templateId, activeTemplate]);

  const handleFlagCapture = (flagId: string) => {
    const newFlags = [...capturedFlags, flagId];
    setCapturedFlags(newFlags);
    localStorage.setItem('captured_flags', JSON.stringify(newFlags));

    // Check if quest is complete
    const currentQuest = quests.find(q => q.id === selectedQuestId);
    if (currentQuest) {
      const requiredFlags = currentQuest.requiredFlagIds.filter(id => 
        newFlags.includes(id)
      );
      if (requiredFlags.length === currentQuest.requiredFlagIds.length) {
        if (!completedQuests.includes(currentQuest.id)) {
          const newCompleted = [...completedQuests, currentQuest.id];
          setCompletedQuests(newCompleted);
          localStorage.setItem('completed_quests', JSON.stringify(newCompleted));
          
          // Record quest completion event
          if (userEmail && gamificationService.isEnabled()) {
            gamificationService.recordEvent({
              type: 'quest_completed',
              participantId: userEmail,
              questId: currentQuest.id,
              timestamp: new Date()
            });
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading challenge...</div>;
  }

  if (!template || !template.storyIntro) {
    return (
      <Card className="m-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <p>No challenge template selected. Please select a challenge template in Workshop Settings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedQuest = quests.find(q => q.id === selectedQuestId);
  const allFlagIds = template.questIds?.flatMap(questId => {
    const quest = quests.find(q => q.id === questId);
    return quest ? [...quest.requiredFlagIds, ...(quest.optionalFlagIds || [])] : [];
  }) || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Story Intro */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Challenge: {template.name}
          </CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            {renderMarkdown(template.storyIntro)}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Challenge Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Quests Completed</p>
              <p className="text-2xl font-bold">
                {completedQuests.length} / {quests.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flags Captured</p>
              <p className="text-2xl font-bold">
                {capturedFlags.length} / {allFlagIds.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quests and Flags */}
      <Tabs value={selectedQuestId || undefined} onValueChange={setSelectedQuestId}>
        <TabsList className="grid w-full grid-cols-2">
          {quests.map(quest => (
            <TabsTrigger
              key={quest.id}
              value={quest.id}
              className={cn(
                "flex items-center gap-2",
                completedQuests.includes(quest.id) && "text-green-600"
              )}
            >
              <Target className="w-4 h-4" />
              {quest.title}
              {completedQuests.includes(quest.id) && (
                <Badge variant="default" className="bg-green-500 ml-2">
                  Complete
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {quests.map(quest => (
          <TabsContent key={quest.id} value={quest.id} className="space-y-6 mt-6">
            <QuestOverview
              questId={quest.id}
              capturedFlags={capturedFlags}
            />

            {/* Labs for this quest (with quest-specific narrative) */}
            {quest.labIds.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quest Labs
                </h3>
                {quest.labIds.map((labId, index) => {
                  // Extract lab number from labId (e.g., "lab-csfle-fundamentals" -> 1)
                  const labNumber = index + 1;
                  return (
                    <QuestLabView
                      key={labId}
                      labId={labId}
                      labNumber={labNumber}
                      quest={quest}
                      template={template}
                    />
                  );
                })}
              </div>
            )}

            {/* Flags for this quest */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Capture Flags
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quest.requiredFlagIds.map(flagId => {
                  const flag = allFlags.get(flagId);
                  if (!flag) return null;
                  return (
                    <FlagCapture
                      key={flagId}
                      flag={flag}
                      onCapture={handleFlagCapture}
                      isCaptured={capturedFlags.includes(flagId)}
                    />
                  );
                })}
                {quest.optionalFlagIds?.map(flagId => {
                  const flag = allFlags.get(flagId);
                  if (!flag) return null;
                  return (
                    <FlagCapture
                      key={flagId}
                      flag={flag}
                      onCapture={handleFlagCapture}
                      isCaptured={capturedFlags.includes(flagId)}
                    />
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Story Outro (shown when all quests complete) */}
      {completedQuests.length === quests.length && template.storyOutro && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-500" />
              Challenge Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              {renderMarkdown(template.storyOutro)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
