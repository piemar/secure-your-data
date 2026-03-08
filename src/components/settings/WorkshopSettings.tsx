import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Users, Power, AlertTriangle, Trash2, Sparkles, Database, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getWorkshopSession,
  getAllWorkshopSessions,
  setCurrentWorkshopSession,
  deleteWorkshopSessionById,
  areLabsEnabled,
  setLabsEnabled,
  cloneWorkshopSession,
  deleteCurrentWorkshopSession,
  resetLeaderboard,
  getParticipantCount,
  updateWorkshopSession,
  type WorkshopSession
} from '@/utils/workshopUtils';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import type { WorkshopTemplate } from '@/types';
import { saveCustomTemplate, generateCustomTemplateId, deleteCustomTemplate } from '@/services/customTemplatesService';
import { DynamicTemplateBuilder } from './DynamicTemplateBuilder';
import { ContentBrowser } from './ContentBrowser';
import { WorkshopSessionWizard } from './WorkshopSessionWizard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WorkshopSettings: React.FC = () => {
  const { currentMode, setMode, activeTemplate, setActiveTemplate, setWorkshopInstance, setCurrentLabId, isDemoMode, isLabMode, isChallengeMode } = useWorkshopSession();
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [allSessions, setAllSessions] = useState<WorkshopSession[]>([]);
  const [labsEnabled, setLabsEnabledState] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showDynamicBuilder, setShowDynamicBuilder] = useState(false);
  const [showSessionWizard, setShowSessionWizard] = useState(false);
  /** When set, wizard opens in "clone" mode with this session as initial values */
  const [sessionWizardInitialSession, setSessionWizardInitialSession] = useState<WorkshopSession | null>(null);
  const [showCloneSessionDialog, setShowCloneSessionDialog] = useState(false);
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
      const imported: WorkshopTemplate = { ...data, id: generateCustomTemplateId(data.name), isCustom: true };
      saveCustomTemplate(imported);
      setActiveTemplate(imported);
      toast.success('Template imported as custom template');
    } catch (err) {
      toast.error('Failed to import template: invalid JSON or format');
    }
    e.target.value = '';
  };

  const handleClonePredefinedTemplate = () => {
    if (!activeTemplate || activeTemplate.isCustom) return;
    const clone: WorkshopTemplate = {
      ...activeTemplate,
      id: generateCustomTemplateId(`Copy of ${activeTemplate.name}`),
      name: `Copy of ${activeTemplate.name}`,
      description: activeTemplate.description ? `${activeTemplate.description} (clone)` : `Clone of ${activeTemplate.name}`,
      isCustom: true,
    };
    saveCustomTemplate(clone);
    setActiveTemplate(clone);
    toast.success('Predefined template cloned as custom template. You can edit or delete it.');
  };

  const handleDeleteCustomTemplate = () => {
    if (!activeTemplate || !activeTemplate.isCustom) return;
    if (!window.confirm(`Delete custom template "${activeTemplate.name}"? This cannot be undone.`)) return;
    deleteCustomTemplate(activeTemplate.id);
    setActiveTemplate(null);
    setWorkshopInstance(null);
    toast.success('Custom template deleted');
  };


  // Load session data and all sessions (multi-workshop)
  useEffect(() => {
    const loadSession = () => {
      setSession(getWorkshopSession());
      setAllSessions(getAllWorkshopSessions());
      setLabsEnabledState(areLabsEnabled());
      setParticipantCount(getParticipantCount());
    };

    loadSession();
    const interval = setInterval(loadSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLabs = async (enabled: boolean) => {
    await setLabsEnabled(enabled);
    setLabsEnabledState(enabled);
    toast.success(enabled ? 'Labs enabled for all participants' : 'Labs disabled');
  };

  const handleSessionWizardSuccess = (newSession: WorkshopSession) => {
    setSession(newSession);
    setLabsEnabledState(true);
    setParticipantCount(0);
    setSessionWizardInitialSession(null);
    toast.success(
      sessionWizardInitialSession
        ? 'Workshop cloned and started. Reconfigure as needed.'
        : `Workshop "${newSession.customerName}" started! Labs are now enabled.`
    );
  };

  const handleCloneSessionClick = () => {
    const current = getWorkshopSession();
    if (!current) return;
    setShowCloneSessionDialog(true);
  };

  const handleCloneSessionConfirm = async () => {
    setShowCloneSessionDialog(false);
    const cloned = await cloneWorkshopSession();
    if (cloned) {
      setSession(cloned);
      setSessionWizardInitialSession(cloned);
      setShowSessionWizard(true);
      toast.success('Session cloned. Reconfigure in the wizard if needed.');
    }
  };

  const handleResetLeaderboard = async () => {
    if (!window.confirm('Are you sure you want to reset the leaderboard? This will clear all participant scores but keep the workshop session active.')) {
      return;
    }
    try {
      const { postResetLeaderboardAll } = await import('@/services/leaderboardApi');
      await postResetLeaderboardAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reset leaderboard on server. Check that the server is running and MongoDB is configured.');
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

      <Tabs defaultValue="workshop" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workshop">Workshop Session Management</TabsTrigger>
          <TabsTrigger value="template">Workshop Management</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Workshop Session Management Tab */}
        <TabsContent value="workshop" className="space-y-6">

      {/* Start New Workshop / Clone Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Workshop sessions
          </CardTitle>
          <CardDescription>
            Start a new session with the step-by-step wizard, or clone the current session to change mode or template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setSessionWizardInitialSession(null); setShowSessionWizard(true); }}>
              Start new workshop session
            </Button>
            {session && (
              <Button variant="outline" onClick={handleCloneSessionClick}>
                Clone session (change mode or template)
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            The wizard collects customer name, Salesforce workload, technical champion, mode (Demo/Lab/Challenge), programming language, MongoDB source, and template. Sessions store all stats and metrics. Switch or delete sessions below.
          </p>
        </CardContent>
      </Card>

      {/* All workshop sessions — switch or delete sessions */}
      {allSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              All workshop sessions
            </CardTitle>
            <CardDescription>
              Switch to another session (e.g. by customer + date). The leaderboard shown is for the current session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allSessions
                .slice()
                .sort((a, b) => new Date(b.workshopDate).getTime() - new Date(a.workshopDate).getTime())
                .map((s) => (
                  <li
                    key={s.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3',
                      session?.id === s.id ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{s.customerName}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        {format(new Date(s.workshopDate), 'MMM d, yyyy')}
                      </span>
                      {s.emailDomain && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          @{s.emailDomain}
                        </Badge>
                      )}
                      {session?.id === s.id && (
                        <Badge className="ml-2 bg-primary">Current</Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {session?.id !== s.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentWorkshopSession(s.id);
                            setSession(getWorkshopSession());
                            setAllSessions(getAllWorkshopSessions());
                            setLabsEnabledState(areLabsEnabled());
                            setParticipantCount(getParticipantCount());
                            toast.success(`Switched to ${s.customerName} (${format(new Date(s.workshopDate), 'MMM d, yyyy')})`);
                          }}
                        >
                          Switch to
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (!window.confirm(`Delete session "${s.customerName}" (${format(new Date(s.workshopDate), 'MMM d, yyyy')})?`)) return;
                          deleteWorkshopSessionById(s.id);
                          setSession(getWorkshopSession());
                          setAllSessions(getAllWorkshopSessions());
                          setLabsEnabledState(areLabsEnabled());
                          toast.success('Session deleted');
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <WorkshopSessionWizard
        open={showSessionWizard}
        onOpenChange={setShowSessionWizard}
        initialSession={sessionWizardInitialSession ?? undefined}
        onSuccess={handleSessionWizardSuccess}
      />

      {/* Clone session confirmation — same style as reset progress dialog */}
      <Dialog open={showCloneSessionDialog} onOpenChange={setShowCloneSessionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clone workshop session</DialogTitle>
            <DialogDescription>
              Create a copy of the current session with a new ID. You can then change mode or template in the wizard. The new session keeps archived leaderboard history. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneSessionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloneSessionConfirm}>
              Clone session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Workshop Management Tab: Browse Labs & Workshops + template actions */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                Browse Labs & Workshops
              </CardTitle>
              <CardDescription>
                Search labs or workshop templates. In the Workshops tab, open Custom workshop templates for Build Custom and Import; select a template to export, clone, or delete. Or select multiple labs to test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template actions when one is selected: Export, Clone / Delete, Clear. Build Custom + Import live in Custom workshop tab. */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportTemplate}
                />
                {activeTemplate && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    {activeTemplate.isCustom ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleDeleteCustomTemplate}
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleClonePredefinedTemplate} title="Predefined templates can only be cloned (saved as a custom copy), not deleted or overwritten.">
                        Clone as custom
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setActiveTemplate(null); setWorkshopInstance(null); }}
                      className="text-muted-foreground"
                    >
                      Clear selection
                    </Button>
                    <span className="text-xs text-muted-foreground ml-1">
                      Selected: <strong>{activeTemplate.name}</strong>
                      {activeTemplate.isCustom && <Badge variant="secondary" className="ml-1 text-[10px]">Custom</Badge>}
                    </span>
                  </>
                )}
              </div>
              <ContentBrowser
                onBuildCustom={() => setShowDynamicBuilder(true)}
                onImport={() => importInputRef.current?.click()}
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
                onSelectTemplates={(templates) => {
                  if (templates.length === 0) return;
                  if (templates.length === 1) {
                    setActiveTemplate(templates[0]);
                    setWorkshopInstance({
                      id: `workshop-${Date.now()}`,
                      templateId: templates[0].id,
                      createdAt: new Date(),
                      mode: templates[0].defaultMode,
                    });
                    toast.success(`Template "${templates[0].name}" selected`);
                    return;
                  }
                  const seen = new Set<string>();
                  const labIds: string[] = [];
                  for (const t of templates) {
                    for (const id of t.labIds) {
                      if (!seen.has(id)) {
                        seen.add(id);
                        labIds.push(id);
                      }
                    }
                  }
                  const combined: WorkshopTemplate = {
                    id: 'combined-workshops',
                    name: `Combined (${templates.length} workshops)`,
                    description: templates.map((t) => t.name).join(' + '),
                    labIds,
                    defaultMode: currentMode,
                  };
                  setActiveTemplate(combined);
                  setWorkshopInstance({
                    id: `workshop-combined-${Date.now()}`,
                    templateId: combined.id,
                    createdAt: new Date(),
                    mode: currentMode,
                  });
                  setCurrentLabId(labIds[0]);
                  toast.success(`${templates.length} workshops combined (${labIds.length} labs)`);
                  setTimeout(() => {
                    window.location.hash = '#/labs';
                  }, 100);
                }}
              />
            </CardContent>
          </Card>

          {showDynamicBuilder && (
            <Dialog open={showDynamicBuilder} onOpenChange={setShowDynamicBuilder}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Build Custom Workshop Template</DialogTitle>
                  <DialogDescription>
                    Choose labs, configure modes, and review to create a custom workshop template
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

        {/* Advanced Tab: Mode, Lab Access, MongoDB */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Lab Access Control — moved from Workshop Management */}
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
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border mt-3">
                <div>
                  <p className="font-medium">Show competitor comparisons</p>
                  <p className="text-sm text-muted-foreground">
                    Show the right-hand panel in lab steps: Compete (e.g. PostgreSQL comparison) and Preview. When off, only the editor and console are shown. Off by default.
                  </p>
                </div>
                <Switch
                  checked={session?.showCompetitorComparisons === true}
                  onCheckedChange={async (checked) => {
                    await updateWorkshopSession({ showCompetitorComparisons: checked });
                    setSession(getWorkshopSession());
                    toast.success(checked ? 'Competitor comparisons visible in labs' : 'Competitor comparisons hidden');
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Moderators always have access to labs regardless of this setting.
              </p>
            </CardContent>
          </Card>

          {/* MongoDB Configuration — moved from Workshop Management */}
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
                    <Label htmlFor="advancedAtlasConnectionString">Atlas Connection String</Label>
                    <div className="flex gap-2">
                      <Input
                        id="advancedAtlasConnectionString"
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

          {/* Danger Zone — only when a workshop session exists */}
          {session && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="font-medium text-sm mb-2">Delete current workshop session</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Remove the current session from storage. Stats and metrics for this session will no longer be available. You can start a new session anytime.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!window.confirm('Delete the current workshop session? This cannot be undone.')) return;
                      await deleteCurrentWorkshopSession();
                      setSession(null);
                      setLabsEnabledState(false);
                      setParticipantCount(0);
                      setActiveTemplate(null);
                      setWorkshopInstance(null);
                      toast.success('Current session deleted');
                    }}
                  >
                    Delete current session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
