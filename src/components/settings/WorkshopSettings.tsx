import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Users, Power, AlertTriangle, Trash2, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  getWorkshopSession,
  areLabsEnabled,
  setLabsEnabled,
  startNewWorkshop,
  resetLeaderboard,
  getParticipantCount,
  syncWorkshopSession,
  type WorkshopSession
} from '@/utils/workshopUtils';

export const WorkshopSettings: React.FC = () => {
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [labsEnabled, setLabsEnabledState] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // New workshop form state
  const [customerName, setCustomerName] = useState('');
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      await syncWorkshopSession();
      setSession(getWorkshopSession());
      setLabsEnabledState(areLabsEnabled());
      setParticipantCount(getParticipantCount());
    };

    loadSession();
    // Refresh every 10 seconds for session and participant sync
    const interval = setInterval(loadSession, 10000);
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

    const confirmMessage = session
      ? 'Starting a new workshop will archive the current leaderboard and reset all scores. Continue?'
      : 'Start a new workshop session?';

    if (!window.confirm(confirmMessage)) return;

    const dateStr = format(workshopDate, 'yyyy-MM-dd');
    const newSession = await startNewWorkshop(customerName.trim(), dateStr);
    setSession(newSession);
    setLabsEnabledState(true);
    setCustomerName('');
    setParticipantCount(0);

    toast.success(`Workshop "${customerName}" started! Labs are now enabled.`);
  };

  const handleResetLeaderboard = async () => {
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
          <p className="text-muted-foreground">Manage workshop sessions and lab access</p>
        </div>
      </div>

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
    </div>
  );
};
