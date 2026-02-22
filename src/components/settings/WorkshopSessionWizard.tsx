import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getContentService } from '@/services/contentService';
import {
  startNewWorkshop,
  type WorkshopSession,
  type StartNewWorkshopOptions,
  type ProgrammingLanguage,
  type WorkshopSessionMode,
} from '@/utils/workshopUtils';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import type { WorkshopTemplate } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Building2, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateBrowser } from './TemplateBrowser';

const STEPS = [
  { id: 1, title: 'Customer & context', icon: Building2 },
  { id: 2, title: 'Mode & tech', icon: Settings },
  { id: 3, title: 'Template or labs', icon: LayoutGrid },
] as const;

export interface WorkshopSessionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When cloning, pre-fill from this session */
  initialSession?: WorkshopSession | null;
  onSuccess?: (session: WorkshopSession) => void;
}

export function WorkshopSessionWizard({
  open,
  onOpenChange,
  initialSession,
  onSuccess,
}: WorkshopSessionWizardProps) {
  const [step, setStep] = useState(1);
  const { setActiveTemplate, setMode } = useWorkshopSession();

  // Step 1
  const [customerName, setCustomerName] = useState(initialSession?.customerName ?? '');
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(
    initialSession?.workshopDate ? new Date(initialSession.workshopDate) : new Date()
  );
  const [salesforceWorkloadName, setSalesforceWorkloadName] = useState(
    initialSession?.salesforceWorkloadName ?? ''
  );
  const [technicalChampionName, setTechnicalChampionName] = useState(
    initialSession?.technicalChampionName ?? ''
  );
  const [technicalChampionEmail, setTechnicalChampionEmail] = useState(
    initialSession?.technicalChampionEmail ?? ''
  );
  const [currentDatabase, setCurrentDatabase] = useState(
    initialSession?.currentDatabase ?? ''
  );

  // Step 2
  const [mode, setModeState] = useState<WorkshopSessionMode>(
    (initialSession?.mode as WorkshopSessionMode) ?? 'lab'
  );
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>(
    (initialSession?.programmingLanguage as ProgrammingLanguage) ?? 'node'
  );
  const [mongodbSource, setMongodbSource] = useState<'local' | 'atlas'>(
    initialSession?.mongodbSource ?? 'local'
  );
  const [atlasConnectionString, setAtlasConnectionString] = useState(
    initialSession?.atlasConnectionString ?? ''
  );

  // Step 3
  const [selectedTemplate, setSelectedTemplate] = useState<WorkshopTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setStep(1);
    setCustomerName(initialSession?.customerName ?? '');
    setWorkshopDate(
      initialSession?.workshopDate ? new Date(initialSession.workshopDate) : new Date()
    );
    setSalesforceWorkloadName(initialSession?.salesforceWorkloadName ?? '');
    setTechnicalChampionName(initialSession?.technicalChampionName ?? '');
    setTechnicalChampionEmail(initialSession?.technicalChampionEmail ?? '');
    setCurrentDatabase(initialSession?.currentDatabase ?? '');
    setModeState((initialSession?.mode as WorkshopSessionMode) ?? 'lab');
    setProgrammingLanguage((initialSession?.programmingLanguage as ProgrammingLanguage) ?? 'node');
    setMongodbSource(initialSession?.mongodbSource ?? 'local');
    setAtlasConnectionString(initialSession?.atlasConnectionString ?? '');
    setSelectedTemplate(null);
  }, [initialSession]);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const canProceedStep1 =
    customerName.trim().length > 0 && workshopDate != null;
  const canProceedStep2 = true;
  const canFinish =
    selectedTemplate != null &&
    customerName.trim().length > 0 &&
    workshopDate != null &&
    (mongodbSource !== 'atlas' || atlasConnectionString.trim().length > 0);

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    if (!canFinish || !workshopDate) return;
    setIsSubmitting(true);
    try {
      const options: StartNewWorkshopOptions = {
        customerName: customerName.trim(),
        workshopDate: format(workshopDate, 'yyyy-MM-dd'),
        mongodbSource,
        atlasConnectionString:
          mongodbSource === 'atlas' ? atlasConnectionString.trim() : undefined,
        salesforceWorkloadName: salesforceWorkloadName.trim() || undefined,
        technicalChampionName: technicalChampionName.trim() || undefined,
        technicalChampionEmail: technicalChampionEmail.trim() || undefined,
        currentDatabase: currentDatabase.trim() || undefined,
        mode,
        programmingLanguage,
        templateId: selectedTemplate?.id,
        labIds: selectedTemplate?.labIds,
      };
      const newSession = await startNewWorkshop(options);
      setActiveTemplate(selectedTemplate);
      setMode(selectedTemplate?.defaultMode ?? mode);
      onSuccess?.(newSession);
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialSession ? 'Clone and reconfigure workshop' : 'Start new workshop session'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3: {STEPS[step - 1].title}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors',
                  step === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.id}
              </button>
              {s.id < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Customer & context */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wizard-customer">Customer name</Label>
              <Input
                id="wizard-customer"
                placeholder="e.g. Acme Corp"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wizard-sf">Salesforce workload name</Label>
              <Input
                id="wizard-sf"
                placeholder="Optional"
                value={salesforceWorkloadName}
                onChange={(e) => setSalesforceWorkloadName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wizard-champion">Technical champion</Label>
                <Input
                  id="wizard-champion"
                  placeholder="Name"
                  value={technicalChampionName}
                  onChange={(e) => setTechnicalChampionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wizard-email">Champion email</Label>
                <Input
                  id="wizard-email"
                  type="email"
                  placeholder="email@company.com"
                  value={technicalChampionEmail}
                  onChange={(e) => setTechnicalChampionEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current database used</Label>
              <Input
                placeholder="e.g. PostgreSQL, Oracle"
                value={currentDatabase}
                onChange={(e) => setCurrentDatabase(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Workshop date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !workshopDate && 'text-muted-foreground'
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
                    onSelect={(d) => setWorkshopDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Step 2: Mode & tech */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setModeState(v as WorkshopSessionMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Demo (SA-led presentation)</SelectItem>
                  <SelectItem value="lab">Labs (hands-on)</SelectItem>
                  <SelectItem value="challenge">Challenge (timed, scored)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target programming language</Label>
              <Select
                value={programmingLanguage}
                onValueChange={(v) => setProgrammingLanguage(v as ProgrammingLanguage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>MongoDB for labs</Label>
              <Select value={mongodbSource} onValueChange={(v) => setMongodbSource(v as 'local' | 'atlas')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local MongoDB Community (default)</SelectItem>
                  <SelectItem value="atlas">Atlas (connection string required)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Each lab manages spinning up and cleaning up the database when needed.
              </p>
            </div>
            {mongodbSource === 'atlas' && (
              <div className="space-y-2">
                <Label htmlFor="wizard-atlas">Atlas connection string</Label>
                <Input
                  id="wizard-atlas"
                  type="password"
                  placeholder="mongodb+srv://..."
                  value={atlasConnectionString}
                  onChange={(e) => setAtlasConnectionString(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Template or labs */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Choose a predefined template (industry or use case). You can also build a custom
              template later in the Template tab.
            </p>
            <div className="min-h-[280px] border rounded-lg p-3 bg-muted/20">
              <TemplateBrowser
                pageSize={4}
                onSelectTemplate={(t) => setSelectedTemplate(t)}
              />
            </div>
            {selectedTemplate && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium">Selected: {selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.labIds?.length ?? 0} labs · Default mode: {selectedTemplate.defaultMode}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !canProceedStep1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={!canFinish || isSubmitting}>
              {initialSession ? 'Clone and start' : 'Start workshop'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
