import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Users, Power, AlertTriangle, Trash2, Archive, Sparkles, Database, Target, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getWorkshopSession,
  areLabsEnabled,
  setLabsEnabled,
  startNewWorkshop,
  resetLeaderboard,
  getParticipantCount,
  updateWorkshopSession,
  type WorkshopSession
} from '@/utils/workshopUtils';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import type { WorkshopTemplate } from '@/types';
import { TemplateSelectionWizard } from './TemplateSelectionWizard';
import { DynamicTemplateBuilder } from './DynamicTemplateBuilder';
import { ContentBrowser } from './ContentBrowser';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WorkshopSettings: React.FC = () => {
  const { currentMode, setMode, activeTemplate, setActiveTemplate, setWorkshopInstance, setCurrentLabId, isDemoMode, isLabMode, isChallengeMode } = useWorkshopSession();
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [labsEnabled, setLabsEnabledState] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showTemplateWizard, setShowTemplateWizard] = useState(false);
  const [showDynamicBuilder, setShowDynamicBuilder] = useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportTemplate = () => {
    if (!activeTemplate) {
      toast.error('No template to export');
      return;
    }
    const json = JSON.stringify(activeTemplate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-template-${activeTemplate.id || 'custom'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template exported');
  };

  const handleImportTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as WorkshopTemplate;
      if (!data.id || !data.name || !data.labIds || !Array.isArray(data.labIds) || !data.defaultMode) {
        toast.error('Invalid template: missing id, name, labIds, or defaultMode');
        return;
      }
      setActiveTemplate(data);
      toast.success('Template imported');
    } catch (err) {
      toast.error('Failed to import template: invalid JSON or format');
    }
    e.target.value = '';
  };

  // New workshop form state
  const [customerName, setCustomerName] = useState('');
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [mongodbSource, setMongodbSource] = useState<'local' | 'atlas'>('local');
  const [atlasConnectionString, setAtlasConnectionString] = useState('');

  // Load session data
  useEffect(() => {
    const loadSession = () => {
      setSession(getWorkshopSession());
      setLabsEnabledState(areLabsEnabled());
      setParticipantCount(getParticipantCount());
    };
    
    loadSession();
    // Refresh every 5 seconds for participant count
    const interval = setInterval(loadSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLabs = async (enabled: boolean) => {
    await setLabsEnabled(enabled);
    setLabsEnabledState(enabled);
    toast.success(enabled ? 'Labs enabled for all participants' : 'Labs disabled');
  };

  const handleStartNewWorkshop = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter a customer name');
      return;
    }
    if (!workshopDate) {
      toast.error('Please select a workshop date');
      return;
    }
    if (mongodbSource === 'atlas' && !atlasConnectionString.trim()) {
      toast.error('Please enter an Atlas connection string');
      return;
    }

    const confirmMessage = session 
      ? 'Starting a new workshop will archive the current leaderboard and reset all scores. Continue?'
      : 'Start a new workshop session?';
    
    if (!window.confirm(confirmMessage)) return;

    const dateStr = format(workshopDate, 'yyyy-MM-dd');
    const newSession = await startNewWorkshop(
      customerName.trim(), 
      dateStr,
      mongodbSource,
      mongodbSource === 'atlas' ? atlasConnectionString.trim() : undefined
    );
    setSession(newSession);
    setLabsEnabledState(true);
    setCustomerName('');
    setMongodbSource('local');
    setAtlasConnectionString('');
    setParticipantCount(0);
    
    toast.success(`Workshop "${customerName}" started! Labs are now enabled.`);
  };

  const handleResetLeaderboard = () => {
    if (!window.confirm('Are you sure you want to reset the leaderboard? This will clear all participant scores but keep the workshop session active.')) {
      return;
    }
    
    resetLeaderboard();
    setParticipantCount(0);
    toast.success('Leaderboard has been reset');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workshop Settings</h1>
          <p className="text-muted-foreground">Manage workshop sessions, templates, modes, and lab access</p>
        </div>
      </div>

      <Tabs defaultValue="session" className="space-y-6">
        <TabsList>
          <TabsTrigger value="session">Session</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="mode">Mode</TabsTrigger>
        </TabsList>

        {/* Session Tab */}
        <TabsContent value="session" className="space-y-6">

      {/* Current Workshop Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Current Workshop Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="font-medium">{session.customerName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {format(new Date(session.workshopDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className={cn(
                    "font-medium flex items-center gap-1",
                    labsEnabled ? "text-green-600" : "text-amber-600"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      labsEnabled ? "bg-green-500" : "bg-amber-500"
                    )} />
                    {labsEnabled ? 'Labs Enabled' : 'Labs Disabled'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Participants</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {participantCount}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">MongoDB Source</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    {session.mongodbSource === 'local' ? 'Local Docker' : 'Atlas'}
                  </p>
                </div>
              </div>
              {session.archivedLeaderboards.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {session.archivedLeaderboards.length} archived session(s) from previous workshops
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No active workshop session. Start a new workshop below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lab Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Power className="w-5 h-5" />
            Lab Access Control
          </CardTitle>
          <CardDescription>
            Control whether participants can access the labs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div>
              <p className="font-medium">Labs Enabled</p>
              <p className="text-sm text-muted-foreground">
                {labsEnabled 
                  ? 'Participants can access all unlocked labs'
                  : 'Participants will see "Workshop not started" message'}
              </p>
            </div>
            <Switch
              checked={labsEnabled}
              onCheckedChange={handleToggleLabs}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Moderators always have access to labs regardless of this setting.
          </p>
        </CardContent>
      </Card>

      {/* MongoDB Configuration (for existing sessions) */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              MongoDB Configuration
            </CardTitle>
            <CardDescription>
              Configure which MongoDB instance participants will use for lab exercises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>MongoDB Source</Label>
              <Select 
                value={session.mongodbSource} 
                onValueChange={async (value) => {
                  const newSource = value as 'local' | 'atlas';
                  const updates: any = { mongodbSource: newSource };
                  if (newSource === 'atlas' && session.atlasConnectionString) {
                    updates.atlasConnectionString = session.atlasConnectionString;
                  }
                  await updateWorkshopSession(updates);
                  setSession(getWorkshopSession());
                  toast.success('MongoDB source updated');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Docker (mongodb://mongo:27017)</SelectItem>
                  <SelectItem value="atlas">Atlas (Connection String Required)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {session.mongodbSource === 'local' 
                  ? 'Uses MongoDB running in Docker Compose. All participants will use the same local database.'
                  : 'Uses MongoDB Atlas. Participants will use the provided connection string.'}
              </p>
            </div>

            {session.mongodbSource === 'atlas' && (
              <div className="space-y-2">
                <Label htmlFor="existingAtlasConnectionString">Atlas Connection String</Label>
                <div className="flex gap-2">
                  <Input
                    id="existingAtlasConnectionString"
                    type="password"
                    placeholder="mongodb+srv://user:password@cluster.mongodb.net/"
                    value={session.atlasConnectionString || ''}
                    onChange={async (e) => {
                      await updateWorkshopSession({ atlasConnectionString: e.target.value });
                      setSession(getWorkshopSession());
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This connection string will be used by all participants for lab exercises.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Start New Workshop */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Start New Workshop
          </CardTitle>
          <CardDescription>
            Create a new workshop session for a customer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="e.g., Acme Corp"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Workshop Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !workshopDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {workshopDate ? format(workshopDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={workshopDate}
                  onSelect={(date) => {
                    setWorkshopDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>MongoDB Source</Label>
            <Select value={mongodbSource} onValueChange={(value) => setMongodbSource(value as 'local' | 'atlas')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Docker (mongodb://mongo:27017)</SelectItem>
                <SelectItem value="atlas">Atlas (Connection String Required)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mongodbSource === 'local' 
                ? 'Uses MongoDB running in Docker Compose. All participants will use the same local database.'
                : 'Uses MongoDB Atlas. Participants will use the provided connection string.'}
            </p>
          </div>

          {mongodbSource === 'atlas' && (
            <div className="space-y-2">
              <Label htmlFor="atlasConnectionString">Atlas Connection String</Label>
              <Input
                id="atlasConnectionString"
                type="password"
                placeholder="mongodb+srv://user:password@cluster.mongodb.net/"
                value={atlasConnectionString}
                onChange={(e) => setAtlasConnectionString(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This connection string will be used by all participants for lab exercises.
              </p>
            </div>
          )}

          {session && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Starting a new workshop will:
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>Archive the current leaderboard</li>
                  <li>Reset all participant scores</li>
                  <li>Enable labs for all participants</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleStartNewWorkshop} className="w-full">
            Start New Workshop
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="font-medium text-sm mb-2">Reset Leaderboard Only</p>
            <p className="text-sm text-muted-foreground mb-4">
              Clear all participant scores without starting a new workshop session.
              This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleResetLeaderboard}
            >
              Reset Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Workshop Template
              </CardTitle>
              <CardDescription>
                Select a template to configure labs, gamification, and workshop structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTemplate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{activeTemplate.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{activeTemplate.description}</p>
                      </div>
                      <Badge variant="secondary">{activeTemplate.labIds.length} Labs</Badge>
                    </div>
                    {activeTemplate.industry && (
                      <Badge variant="outline" className="mt-2">
                        {activeTemplate.industry}
                      </Badge>
                    )}
                    {activeTemplate.gamification?.enabled && (
                      <Badge variant="outline" className="mt-2 ml-2">
                        Gamification Enabled
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setShowTemplateWizard(true)}>
                      Change Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowDynamicBuilder(true)}>
                      Build Custom Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setActiveTemplate(null);
                        setWorkshopInstance(null);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear Template
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                    </Button>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleImportTemplate}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    No template selected. Select a template or build a custom one.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowTemplateWizard(true)}>
                      Select Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowDynamicBuilder(true)}>
                      Build Custom Template
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browse Labs & Workshops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                Browse Labs & Workshops
              </CardTitle>
              <CardDescription>
                Search labs or workshop templates. Select multiple labs to test (use Select All for filtered results), or switch to Workshops to select a template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentBrowser
                onAddLab={(labId) => {
                  setCurrentLabId(labId);
                  toast.success(`Opening lab: ${labId}`);
                  setTimeout(() => {
                    window.location.hash = '#/labs';
                  }, 100);
                }}
                onTestLabs={(labIds) => {
                  if (labIds.length === 0) return;
                  const testTemplate: WorkshopTemplate = {
                    id: 'test-labs',
                    name: `Test Labs (${labIds.length} selected)`,
                    labIds,
                    defaultMode: currentMode,
                  };
                  setActiveTemplate(testTemplate);
                  setWorkshopInstance({
                    id: `workshop-test-${Date.now()}`,
                    templateId: testTemplate.id,
                    createdAt: new Date(),
                    mode: currentMode,
                  });
                  setCurrentLabId(labIds[0]);
                  toast.success(`Testing ${labIds.length} lab${labIds.length !== 1 ? 's' : ''}`);
                  setTimeout(() => {
                    window.location.hash = '#/labs';
                  }, 100);
                }}
                onSelectTemplate={(template) => {
                  setActiveTemplate(template);
                  setWorkshopInstance({
                    id: `workshop-${Date.now()}`,
                    templateId: template.id,
                    createdAt: new Date(),
                    mode: template.defaultMode,
                  });
                  toast.success(`Template "${template.name}" selected`);
                }}
              />
            </CardContent>
          </Card>

          {showTemplateWizard && (
            <TemplateSelectionWizard
              onComplete={() => {
                setShowTemplateWizard(false);
                toast.success('Template selected successfully');
              }}
              onCancel={() => setShowTemplateWizard(false)}
            />
          )}

          {showDynamicBuilder && (
            <Dialog open={showDynamicBuilder} onOpenChange={setShowDynamicBuilder}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Build Custom Workshop Template</DialogTitle>
                  <DialogDescription>
                    Select topics, review capabilities, choose labs, and configure modes to create a custom workshop template
                  </DialogDescription>
                </DialogHeader>
                <DynamicTemplateBuilder
                  onComplete={(template) => {
                    setShowDynamicBuilder(false);
                    toast.success('Custom template created successfully!');
                  }}
                  onCancel={() => setShowDynamicBuilder(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Mode Tab */}
        <TabsContent value="mode" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workshop Mode</CardTitle>
              <CardDescription>
                Choose how this workshop runs: lab (hands-on), challenge (story-driven quests), or demo (presentation).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Mode</Label>
                <Select value={currentMode} onValueChange={(value) => setMode(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Lab (Hands-On Mode)</SelectItem>
                    <SelectItem value="challenge">Challenge (Story/Game Mode)</SelectItem>
                    <SelectItem value="demo">Demo (Presentation Mode)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm font-medium">Mode Description:</p>
                {isDemoMode && (
                  <p className="text-sm text-muted-foreground">
                    Demo mode is for presentations. The moderator controls pacing, focuses on key steps, and can compare MongoDB with competitors side by side.
                  </p>
                )}
                {isLabMode && (
                  <p className="text-sm text-muted-foreground">
                    Lab mode is for hands-on workshops. Participants follow full guided steps, use hints, and earn points.
                  </p>
                )}
                {isChallengeMode && (
                  <p className="text-sm text-muted-foreground">
                    Challenge mode is story-driven with quests and flags, built from the same labs. Participants solve customer problems in a gamified format.
                  </p>
                )}
              </div>

              {activeTemplate && activeTemplate.allowedModes && (
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Template Restriction:</strong> This template allows modes:{' '}
                    {activeTemplate.allowedModes.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Challenge Mode Info */}
              {isChallengeMode && activeTemplate?.questIds && activeTemplate.questIds.length > 0 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Challenge Quests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      This template includes {activeTemplate.questIds.length} quest(s) with flags and objectives.
                    </p>
                    <div className="space-y-2">
                      {activeTemplate.questIds.map(questId => (
                        <Badge key={questId} variant="outline" className="mr-2">
                          {questId.replace('quest-', '').replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Participants can access Challenge Mode from the sidebar to view quests and capture flags.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
