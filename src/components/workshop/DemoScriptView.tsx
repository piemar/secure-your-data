import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkshopLabDefinition } from '@/types';
import { getContentService } from '@/services/contentService';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { Clock, Play, BookOpen, ExternalLink, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoBeat {
  id: string;
  title: string;
  narrative: string;
  labId: string;
  stepId?: string;
  durationMinutes: number;
  competitiveNotes?: string;
}

interface DemoScript {
  id: string;
  title: string;
  povCapabilities: string[];
  beats: DemoBeat[];
}

/**
 * DemoScriptView - Scripted demo beats for Demo Mode
 * 
 * Displays demo script beats with lab/step links.
 * Shows side-by-side script narrative and lab view.
 * Allows navigating directly to specific lab steps.
 */
export function DemoScriptView() {
  const { activeTemplate, currentMode, setCurrentLabId } = useWorkshopSession();
  const { setSection } = useNavigation();
  const [demoScripts, setDemoScripts] = useState<DemoScript[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<DemoBeat | null>(null);
  const [labDetails, setLabDetails] = useState<Map<string, WorkshopLabDefinition>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoScripts();
  }, [activeTemplate]);

  useEffect(() => {
    if (selectedBeat && selectedBeat.labId) {
      loadLabDetails(selectedBeat.labId);
    }
  }, [selectedBeat]);

  const loadDemoScripts = async () => {
    try {
      // Load demo scripts from active template labs
      // In production, this would load from src/content/demo-scripts/ JSON files
      const scripts: DemoScript[] = [];
      
      if (activeTemplate && activeTemplate.labIds && activeTemplate.labIds.length > 0) {
        const contentService = getContentService();
        const labs = await contentService.getLabs();
        const templateLabs = labs.filter((lab) => activeTemplate.labIds!.includes(lab.id));
        
        // Create a demo script from template labs
        const beats: DemoBeat[] = templateLabs.slice(0, 5).map((lab, index) => {
          // Find a demo-appropriate step (one that's in demo mode)
          const demoStep = lab.steps.find(
            (step) => step.modes && step.modes.includes('demo')
          );
          
          return {
            id: `beat-${index + 1}`,
            title: `Beat ${index + 1}: ${lab.title}`,
            narrative: `Demonstrate ${lab.title}. ${lab.description}`,
            labId: lab.id,
            stepId: demoStep?.id || '',
            durationMinutes: 5,
            competitiveNotes: `Key differentiator: ${lab.description}`
          };
        });
        
        if (beats.length > 0) {
          scripts.push({
            id: `demo-${activeTemplate.id}`,
            title: `${activeTemplate.name} Demo Script`,
            povCapabilities: activeTemplate.topicIds || [],
            beats
          });
        }
      }
      
      setDemoScripts(scripts);
      
      if (scripts.length > 0 && scripts[0].beats.length > 0) {
        setSelectedBeat(scripts[0].beats[0]);
      }
    } catch (error) {
      console.error('Failed to load demo scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLabDetails = async (labId: string) => {
    try {
      const contentService = getContentService();
      const lab = await contentService.getLabById(labId);
      if (lab) {
        setLabDetails((prev) => {
          const next = new Map(prev);
          next.set(labId, lab);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to load lab details:', error);
    }
  };

  const handleBeatClick = (beat: DemoBeat) => {
    setSelectedBeat(beat);
    
    // Navigate to lab with specific step if stepId is provided
    if (beat.labId) {
      setCurrentLabId(beat.labId);
      setSection('lab');
      
      // Store step ID for LabRunner to jump to
      if (beat.stepId) {
        localStorage.setItem('demo_step_id', beat.stepId);
      }
    }
  };

  const getTotalDuration = (beats: DemoBeat[]): number => {
    return beats.reduce((total, beat) => total + beat.durationMinutes, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading demo script...</div>
      </div>
    );
  }

  if (demoScripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Demo Script Available</CardTitle>
            <CardDescription>
              {activeTemplate
                ? 'No demo script is configured for this template. Create one in src/content/demo-scripts/'
                : 'No template selected. Please select a workshop template in Workshop Settings.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentScript = demoScripts[0]; // For now, use first script
  const totalDuration = getTotalDuration(currentScript.beats);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Presentation className="h-6 w-6" />
              {currentScript.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentScript.beats.length} beats • {totalDuration} minutes total
            </p>
          </div>
          {currentScript.povCapabilities.length > 0 && (
            <div className="flex gap-2">
              {currentScript.povCapabilities.slice(0, 3).map((pov) => (
                <Badge key={pov} variant="outline">
                  {pov}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Script Beats */}
        <div className="w-1/2 border-r border-border overflow-y-auto p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Demo Script Beats</h2>
            {currentScript.beats.map((beat, index) => {
              const isSelected = selectedBeat?.id === beat.id;
              const lab = labDetails.get(beat.labId);

              return (
                <Card
                  key={beat.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleBeatClick(beat)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Beat {index + 1}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{beat.durationMinutes} min</span>
                          </div>
                        </div>
                        <CardTitle className="text-base">{beat.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <CardDescription className="text-sm">
                      {beat.narrative}
                    </CardDescription>
                    
                    {lab && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{lab.title}</span>
                      </div>
                    )}

                    {beat.competitiveNotes && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Competitive Note:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {beat.competitiveNotes}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBeatClick(beat);
                      }}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      Go to Lab
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Beat Details / Lab Preview */}
        <div className="w-1/2 overflow-y-auto p-6">
          {selectedBeat ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">{selectedBeat.title}</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedBeat.narrative}
                  </p>
                </div>
              </div>

              {selectedBeat.competitiveNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Competitive Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedBeat.competitiveNotes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {labDetails.has(selectedBeat.labId) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Lab Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Lab:</span>{' '}
                        {labDetails.get(selectedBeat.labId)?.title}
                      </div>
                      {selectedBeat.stepId && (
                        <div>
                          <span className="font-semibold">Step:</span>{' '}
                          {labDetails
                            .get(selectedBeat.labId)
                            ?.steps.find((s) => s.id === selectedBeat.stepId)?.title || 'N/A'}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Duration:</span>{' '}
                        {selectedBeat.durationMinutes} minutes
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleBeatClick(selectedBeat)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Lab
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a beat to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
