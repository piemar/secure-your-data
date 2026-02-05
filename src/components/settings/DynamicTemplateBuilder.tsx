import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WorkshopMode, WorkshopTemplate, WorkshopGamificationConfig } from '@/types';
import { getContentService } from '@/services/contentService';
import { getTemplateGeneratorService } from '@/services/templateGeneratorService';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { TopicSelector } from './TopicSelector';
import { CapabilityCoverageView } from './CapabilityCoverageView';
import { TopicLabBundlePanel } from './TopicLabBundlePanel';
import { LabSuggestionPanel } from './LabSuggestionPanel';
import { LabPoolBrowser } from './LabPoolBrowser';
import { ModePreview } from './ModePreview';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DynamicTemplateBuilderProps {
  onComplete: (template: WorkshopTemplate) => void;
  onCancel?: () => void;
}

type BuilderStep = 'topics' | 'capabilities' | 'labs' | 'modes' | 'review';

export const DynamicTemplateBuilder: React.FC<DynamicTemplateBuilderProps> = ({
  onComplete,
  onCancel
}) => {
  const { setActiveTemplate } = useWorkshopSession();
  const [currentStep, setCurrentStep] = useState<BuilderStep>('topics');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);
  const [defaultMode, setDefaultMode] = useState<WorkshopMode>('lab');
  const [allowedModes, setAllowedModes] = useState<WorkshopMode[]>(['lab', 'demo']);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [industry, setIndustry] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');

  const steps: BuilderStep[] = ['topics', 'capabilities', 'labs', 'modes', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  // When selected topics change, remove labs that belong to deselected topics
  React.useEffect(() => {
    if (selectedTopicIds.length === 0) {
      setSelectedLabIds([]);
      return;
    }
    getContentService().getLabs().then(allLabs => {
      const validTopicIds = new Set(selectedTopicIds);
      const keep = selectedLabIds.filter(labId => {
        const lab = allLabs.find(l => l.id === labId);
        return lab && validTopicIds.has(lab.topicId);
      });
      if (keep.length !== selectedLabIds.length) {
        setSelectedLabIds(keep);
      }
    });
  }, [selectedTopicIds]);

  // When entering Labs step, default to full bundle (all labs from selected topics) if none selected yet
  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep === 'labs' && selectedLabIds.length === 0 && selectedTopicIds.length > 0) {
        const contentService = getContentService();
        const bundleLabIds: string[] = [];
        for (const topicId of selectedTopicIds) {
          const labs = await contentService.getLabsByTopic(topicId);
          labs.forEach(lab => {
            if (!bundleLabIds.includes(lab.id)) bundleLabIds.push(lab.id);
          });
        }
        setSelectedLabIds(bundleLabIds);
      }
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleGenerateTemplate = async () => {
    if (selectedTopicIds.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    if (selectedLabIds.length === 0) {
      toast.error('Please select at least one lab');
      return;
    }

    try {
      const generator = getTemplateGeneratorService();
      const template = await generator.generateTemplate({
        topicIds: selectedTopicIds,
        labIds: selectedLabIds,
        defaultMode,
        allowedModes,
        gamification: gamificationEnabled ? {
          enabled: true,
          basePointsPerStep: 10,
          bonusPointsPerFlag: 25,
          bonusPointsPerQuest: 50
        } : undefined,
        industry: industry || undefined,
        name: templateName || undefined,
        description: templateDescription || undefined
      });

      // Validate template
      const validation = await generator.validateTemplate(template);
      if (!validation.valid) {
        toast.error('Validation: ' + validation.errors.join(', '));
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Template warnings:', validation.warnings);
      }

      setActiveTemplate(template);
      onComplete(template);
      
      toast.success('Template generated successfully!');
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast.error('Failed to generate template. Please try again.');
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'topics':
        return selectedTopicIds.length > 0;
      case 'capabilities':
        return true; // Always can proceed
      case 'labs':
        return selectedLabIds.length > 0;
      case 'modes':
        return allowedModes.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      index < currentStepIndex && "bg-primary text-primary-foreground",
                      index === currentStepIndex && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                      index > currentStepIndex && "bg-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 capitalize hidden sm:block">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 flex-1 mx-2",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl capitalize">
            {currentStep === 'topics' && 'Step 1: Select Topics'}
            {currentStep === 'capabilities' && 'Step 2: Review Capabilities'}
            {currentStep === 'labs' && 'Step 3: Select Labs'}
            {currentStep === 'modes' && 'Step 4: Configure Modes'}
            {currentStep === 'review' && 'Step 5: Review & Generate'}
          </CardTitle>
          <CardDescription>
            {currentStep === 'topics' && 'Choose which MongoDB topics to cover in your workshop'}
            {currentStep === 'capabilities' && 'Review which PoV capabilities will be covered'}
            {currentStep === 'labs' && 'Select or customize the labs for your workshop'}
            {currentStep === 'modes' && 'Configure workshop modes and gamification'}
            {currentStep === 'review' && 'Review your configuration and generate the template'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topics Step */}
          {currentStep === 'topics' && (
            <TopicSelector
              selectedTopicIds={selectedTopicIds}
              onSelectionChange={setSelectedTopicIds}
            />
          )}

          {/* Capabilities Step */}
          {currentStep === 'capabilities' && (
            <CapabilityCoverageView selectedTopicIds={selectedTopicIds} />
          )}

          {/* Labs Step: topic-first bundles + smart suggestions + full library browser */}
          {currentStep === 'labs' && (
            <div className="space-y-6">
              <TopicLabBundlePanel
                selectedTopicIds={selectedTopicIds}
                selectedMode={defaultMode}
                selectedLabIds={selectedLabIds}
                onLabIdsChange={setSelectedLabIds}
              />
              <LabSuggestionPanel
                selectedTopicIds={selectedTopicIds}
                selectedMode={defaultMode}
                selectedLabIds={selectedLabIds}
                onLabIdsChange={setSelectedLabIds}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Browse Full Lab Library</CardTitle>
                  <CardDescription>
                    See all available labs across topics. Use this to add advanced labs beyond the recommended bundles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LabPoolBrowser
                    selectedTopicIds={selectedTopicIds}
                    selectedMode={defaultMode}
                    selectedLabIds={selectedLabIds}
                    onAddLab={(labId) => {
                      if (!selectedLabIds.includes(labId)) {
                        setSelectedLabIds([...selectedLabIds, labId]);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modes Step */}
          {currentStep === 'modes' && (
            <div className="space-y-6">
              {/* Mode Presets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Presets
                  </CardTitle>
                  <CardDescription>
                    Apply a preset configuration optimized for a specific mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4"
                      onClick={() => {
                        setDefaultMode('lab');
                        setAllowedModes(['lab', 'demo']);
                        setGamificationEnabled(false);
                        toast.success('Applied Lab-focused preset');
                      }}
                    >
                      <div className="font-semibold mb-1">Lab-Focused</div>
                      <div className="text-xs text-muted-foreground text-left">
                        Full hands-on experience with all steps
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4"
                      onClick={() => {
                        setDefaultMode('challenge');
                        setAllowedModes(['challenge', 'lab']);
                        setGamificationEnabled(true);
                        toast.success('Applied Challenge-focused preset');
                      }}
                    >
                      <div className="font-semibold mb-1">Challenge-Focused</div>
                      <div className="text-xs text-muted-foreground text-left">
                        Story-driven quests with flags and gamification
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start p-4"
                      onClick={() => {
                        setDefaultMode('demo');
                        setAllowedModes(['demo', 'lab']);
                        setGamificationEnabled(false);
                        toast.success('Applied Demo-focused preset');
                      }}
                    >
                      <div className="font-semibold mb-1">Demo-Focused</div>
                      <div className="text-xs text-muted-foreground text-left">
                        Presentation mode with simplified content
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Density Warnings */}
              {(() => {
                const labCount = selectedLabIds.length;
                const modeThresholds: Record<WorkshopMode, number> = {
                  lab: 10,
                  demo: 8,
                  challenge: 6
                };
                const warnings: Array<{ mode: WorkshopMode; count: number; threshold: number }> = [];
                
                allowedModes.forEach(mode => {
                  const threshold = modeThresholds[mode];
                  if (labCount > threshold) {
                    warnings.push({ mode, count: labCount, threshold });
                  }
                });

                return warnings.length > 0 ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>High Lab Density Warning</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="mb-2">
                        Your template has {labCount} labs, which exceeds recommended limits for:
                      </p>
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {warnings.map(({ mode, threshold }) => (
                          <li key={mode}>
                            <strong className="capitalize">{mode} Mode</strong>: Recommended max {threshold} labs
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm">
                        Consider splitting into multiple templates or removing some labs to improve user experience.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : null;
              })()}

              <div className="space-y-4">
                <div>
                  <Label>Default Mode</Label>
                  <Select value={defaultMode} onValueChange={(value) => setDefaultMode(value as WorkshopMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo Mode</SelectItem>
                      <SelectItem value="lab">Lab Mode</SelectItem>
                      <SelectItem value="challenge">Challenge Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Allowed Modes</Label>
                  <div className="space-y-2 mt-2">
                    {(['demo', 'lab', 'challenge'] as WorkshopMode[]).map(mode => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mode-${mode}`}
                          checked={allowedModes.includes(mode)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAllowedModes([...allowedModes, mode]);
                            } else {
                              setAllowedModes(allowedModes.filter(m => m !== mode));
                            }
                          }}
                        />
                        <Label htmlFor={`mode-${mode}`} className="capitalize cursor-pointer">
                          {mode} Mode
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gamification"
                    checked={gamificationEnabled}
                    onCheckedChange={setGamificationEnabled}
                  />
                  <Label htmlFor="gamification" className="flex items-center gap-2 cursor-pointer">
                    <Sparkles className="w-4 h-4" />
                    Enable Gamification
                  </Label>
                </div>

                <div>
                  <Label>Industry (Optional)</Label>
                  <Input
                    placeholder="e.g., retail, healthcare, financial-services"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              {/* Mode Preview */}
              {selectedLabIds.length > 0 && (
                <div className="mt-6">
                  <ModePreview
                    labIds={selectedLabIds}
                    defaultMode={defaultMode}
                    allowedModes={allowedModes}
                  />
                </div>
              )}
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div>
                <Label>Template Name (Optional)</Label>
                <Input
                  placeholder="My Custom Workshop"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div>
                <Label>Template Description (Optional)</Label>
                <Input
                  placeholder="Description of this workshop"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Topics:</span> {selectedTopicIds.length}
                  </div>
                  <div>
                    <span className="font-medium">Labs:</span> {selectedLabIds.length}
                  </div>
                  <div>
                    <span className="font-medium">Default Mode:</span> {defaultMode}
                  </div>
                  <div>
                    <span className="font-medium">Allowed Modes:</span> {allowedModes.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Gamification:</span> {gamificationEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  {industry && (
                    <div>
                      <span className="font-medium">Industry:</span> {industry}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={handlePrevious} className="ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          )}
        </div>
        <div>
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceedToNext()}>
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleGenerateTemplate} disabled={!canProceedToNext()}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Generate Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
