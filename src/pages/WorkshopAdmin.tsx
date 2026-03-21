import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUDBar } from '@/components/HUDBar';
import { ActivityTicker } from '@/components/ActivityTicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { getPlayer } from '@/lib/game-store';
import { api } from '@/services/api';
import { MISSIONS } from '@/content/missions/mission';
import { QUESTS } from '@/content/quests/quest';
import { useRole } from '@/contexts/RoleContext';
import { isMissionTierOnHold } from '@/lib/mission-tiers';
import { WorkshopConfigPanel } from '@/components/WorkshopConfigPanel';
import type { Player } from '@/lib/types';
import { CalendarDays, LayoutGrid, List, Pencil, Plus, Settings2 } from 'lucide-react';

type SessionRecord = {
  _id: string;
  name: string;
  status: string;
  pin?: string;
  missionIds?: string[];
  customerName?: string;
  technicalChampionEmail?: string;
  allowedEmailDomains?: string[];
  archivedAt?: string;
  createdAt?: string;
  scheduledFor?: string;
  executionMode?: 'sandbox_only' | 'atlas_connected' | 'hybrid';
};

export default function WorkshopAdmin() {
  const navigate = useNavigate();
  const { isModerator } = useRole();
  const [player, setPlayer] = useState<Player | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [activePanel, setActivePanel] = useState<'sessions' | 'composer' | 'advanced'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    customerName: '',
    technicalChampionName: '',
    technicalChampionEmail: '',
    salesforceOpportunityId: '',
    logoUrl: '',
    timeLimit: '',
    scheduledFor: '',
    missionIds: [] as string[],
  });
  const selectableMissions = useMemo(() => MISSIONS.filter(m => !isMissionTierOnHold(m.id)), []);
  const missionById = useMemo(() => new Map(MISSIONS.map((mission) => [mission.id, mission])), []);
  const selectedSession = useMemo(
    () => sessions.find((session) => session._id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  const domainFromChampion = useMemo(() => {
    const at = form.technicalChampionEmail.lastIndexOf('@');
    if (at <= 0 || at === form.technicalChampionEmail.length - 1) return '';
    return form.technicalChampionEmail.slice(at + 1).toLowerCase();
  }, [form.technicalChampionEmail]);

  useEffect(() => {
    const currentPlayer = getPlayer();
    if (!currentPlayer) {
      navigate('/');
      return;
    }
    setPlayer(currentPlayer);
  }, [navigate]);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.workshops.list(includeArchived);
      setSessions(result as SessionRecord[]);
    } catch (e) {
      console.error('Failed to load workshops', e);
    } finally {
      setIsLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const resetForm = useCallback(() => {
    setSelectedSessionId(null);
    setForm({
      name: '',
      customerName: '',
      technicalChampionName: '',
      technicalChampionEmail: '',
      salesforceOpportunityId: '',
      logoUrl: '',
      timeLimit: '',
      scheduledFor: '',
      missionIds: [],
    });
  }, []);

  const toDateInputValue = (value?: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
    return value.slice(0, 10);
  };

  const loadSessionIntoForm = (session: SessionRecord) => {
    setSelectedSessionId(session._id);
    setActivePanel('composer');
    setForm({
      name: session.name || '',
      customerName: session.customerName || '',
      technicalChampionName: session.technicalChampionName || '',
      technicalChampionEmail: session.technicalChampionEmail || '',
      salesforceOpportunityId: session.salesforceOpportunityId || '',
      logoUrl: session.logoUrl || '',
      timeLimit: typeof session.timeLimit === 'number' ? String(session.timeLimit) : '',
      scheduledFor: toDateInputValue(session.scheduledFor),
      missionIds: Array.isArray(session.missionIds) ? session.missionIds : [],
    });
  };

  const formatScheduledDate = (session: SessionRecord): string => {
    const value = session.scheduledFor || session.createdAt;
    if (!value) return 'No date set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const toggleMission = (missionId: string) => {
    setForm(prev => ({
      ...prev,
      missionIds: prev.missionIds.includes(missionId)
        ? prev.missionIds.filter(id => id !== missionId)
        : [...prev.missionIds, missionId],
    }));
  };

  const applyQuest = (questId: string) => {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;
    const allowedMissionIds = new Set(selectableMissions.map(m => m.id));
    setForm(prev => ({
      ...prev,
      missionIds: Array.from(
        new Set([...prev.missionIds, ...quest.missionIds.filter(id => allowedMissionIds.has(id))])
      ),
    }));
  };

  const createWorkshop = async () => {
    setSaving(true);
    try {
      const timeLimitNumber = form.timeLimit.trim() ? Number(form.timeLimit) : undefined;
      const payload = {
        name: form.name.trim(),
        missionIds: form.missionIds,
        ...(typeof timeLimitNumber === 'number' && Number.isFinite(timeLimitNumber)
          ? { timeLimit: timeLimitNumber }
          : {}),
        ...(form.customerName.trim() ? { customerName: form.customerName.trim() } : {}),
        ...(form.technicalChampionName.trim()
          ? { technicalChampionName: form.technicalChampionName.trim() }
          : {}),
        ...(form.technicalChampionEmail.trim()
          ? { technicalChampionEmail: form.technicalChampionEmail.trim().toLowerCase() }
          : {}),
        ...(form.salesforceOpportunityId.trim()
          ? { salesforceOpportunityId: form.salesforceOpportunityId.trim() }
          : {}),
        ...(form.logoUrl.trim() ? { logoUrl: form.logoUrl.trim() } : {}),
        ...(form.scheduledFor.trim() ? { scheduledFor: form.scheduledFor.trim() } : {}),
        ...(domainFromChampion ? { allowedEmailDomains: [domainFromChampion] } : {}),
      };
      if (selectedSessionId) {
        await api.workshops.update(selectedSessionId, payload);
      } else {
        await api.workshops.create(payload);
      }
      resetForm();
      await loadSessions();
    } catch (e) {
      console.error('Failed to create workshop', e);
    } finally {
      setSaving(false);
    }
  };

  const archiveSession = async (id: string) => {
    try {
      await api.workshops.archive(id, 'Archived from workshop admin page');
      await loadSessions();
    } catch (e) {
      console.error('Failed to archive workshop', e);
    }
  };

  const inputClass =
    'font-mono text-xs bg-secondary/50 border-primary/30 focus-visible:border-primary';
  const sectionTitleClass = 'font-mono text-[11px] font-bold tracking-wider text-primary';
  const sectionHintClass = 'font-mono text-[10px] text-muted-foreground';
  const selectedMissionCount = form.missionIds.length;
  const activeSessions = sessions.filter((session) => !session.archivedAt);

  if (!player) return null;

  return (
    <div className="min-h-screen bg-background/70 relative flex flex-col">
      <HUDBar player={player} />
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 pt-16 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-mono text-2xl font-bold text-primary text-glow">WORKSHOP CONTROL</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {activeSessions.length} active sessions • {sessions.length} total loaded
              </p>
              {!isModerator && (
                <p className="mt-1 font-mono text-[11px] text-amber-500">
                  Moderator token required for create/update/archive actions.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePanel('sessions')}
                className={`rounded border px-2 py-1 font-mono text-[10px] ${
                  activePanel === 'sessions'
                    ? 'border-primary/40 text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                SESSIONS
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('composer')}
                className={`rounded border px-2 py-1 font-mono text-[10px] ${
                  activePanel === 'composer'
                    ? 'border-primary/40 text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                COMPOSER
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('advanced')}
                className={`rounded border px-2 py-1 font-mono text-[10px] ${
                  activePanel === 'advanced'
                    ? 'border-primary/40 text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                ADVANCED
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded border border-primary/40 px-2 py-1 font-mono text-[10px] text-primary hover:bg-primary/10"
              >
                MISSION CONTROL
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-4 pt-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-primary/20 bg-card/80 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-sm font-semibold text-primary">Workshop Sessions</h2>
                  <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                    {sessions.length} loaded
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'cards' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Card view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <label className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <Checkbox
                      checked={includeArchived}
                      onCheckedChange={(checked) => setIncludeArchived(Boolean(checked))}
                    />
                    include archived
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadSessions()}
                    className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {sessions.length === 0 && (
                <p className="font-mono text-xs text-muted-foreground">
                  {isLoading ? 'Loading sessions...' : 'No workshop sessions yet.'}
                </p>
              )}

              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sessions.map((session) => {
                    const missionNames = (session.missionIds || [])
                      .map((id) => missionById.get(id)?.title || id)
                      .slice(0, 3);
                    const missionOverflow = Math.max(0, (session.missionIds || []).length - missionNames.length);
                    return (
                      <div
                        key={session._id}
                        className="rounded-lg border border-primary/20 bg-card/70 p-3 transition-all hover:border-primary/40 hover:border-glow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <p className="font-mono text-sm font-semibold text-foreground truncate">{session.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              Customer: {session.customerName || 'n/a'} • PIN: {session.pin || 'n/a'}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> {formatScheduledDate(session)}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="border-primary/30 font-mono text-[10px] text-primary">
                                {session.status}
                              </Badge>
                              {session.allowedEmailDomains?.map((domain) => (
                                <Badge key={domain} variant="outline" className="border-primary/30 font-mono text-[10px] text-primary">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {missionNames.map((name) => (
                                <span key={name} className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                                  {name}
                                </span>
                              ))}
                              {missionOverflow > 0 && (
                                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  +{missionOverflow} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                              onClick={() => loadSessionIntoForm(session)}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            {!session.archivedAt && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="font-mono text-xs"
                                onClick={() => void archiveSession(session._id)}
                              >
                                Archive
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const missionNames = (session.missionIds || [])
                      .map((id) => missionById.get(id)?.title || id)
                      .join(', ') || 'No missions selected';
                    return (
                      <div key={session._id} className="rounded-lg border border-border bg-card/70 p-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-sm text-foreground truncate">{session.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground truncate">
                              {missionNames}
                            </p>
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground w-28 text-right">
                            {formatScheduledDate(session)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => loadSessionIntoForm(session)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-primary/20 bg-card/80 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs font-bold text-foreground">
                  {selectedSessionId ? 'Edit Session' : 'Create Session'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                  onClick={resetForm}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="font-mono text-[11px]">Session Name</Label>
                  <Input className={inputClass} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[11px]">Customer Name</Label>
                  <Input className={inputClass} value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[11px]">Scheduled For</Label>
                  <Input type="date" className={inputClass} value={form.scheduledFor} onChange={(e) => setForm((prev) => ({ ...prev, scheduledFor: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[11px]">Technical Champion Email</Label>
                  <Input className={inputClass} value={form.technicalChampionEmail} onChange={(e) => setForm((prev) => ({ ...prev, technicalChampionEmail: e.target.value }))} />
                  {domainFromChampion && (
                    <p className="rounded border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      Domain mapping will use <span className="text-foreground">{domainFromChampion}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[11px]">Time Limit (seconds)</Label>
                  <Input className={inputClass} value={form.timeLimit} onChange={(e) => setForm((prev) => ({ ...prev, timeLimit: e.target.value }))} />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className={sectionTitleClass}>QUEST PRESETS</p>
                <p className={sectionHintClass}>Use a preset, then fine tune mission selection.</p>
                <div className="flex flex-wrap gap-2">
                  {QUESTS.map((quest) => (
                    <Button
                      key={quest.id}
                      variant="outline"
                      size="sm"
                      className="font-mono text-[10px] border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/40"
                      onClick={() => applyQuest(quest.id)}
                    >
                      {quest.icon} {quest.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-primary/20 bg-secondary/30 p-2">
                {selectableMissions.map((mission) => {
                  const checked = form.missionIds.includes(mission.id);
                  return (
                    <label
                      key={mission.id}
                      className={`flex items-start gap-2 rounded px-2 py-2 transition-colors ${
                        checked ? 'bg-primary/10' : 'hover:bg-primary/5'
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleMission(mission.id)} />
                      <span className="font-mono text-[11px] leading-tight">
                        <span className="text-foreground">{mission.title}</span>
                        <span className="block text-muted-foreground">{mission.id}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                Selected missions: <span className="font-bold text-primary">{selectedMissionCount}</span>
              </p>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => void createWorkshop()}
                  disabled={saving || !form.name.trim() || form.missionIds.length === 0}
                  className="flex-1 font-mono text-xs font-bold tracking-wider animate-pulse-glow"
                >
                  {saving ? 'SAVING...' : selectedSessionId ? '[ SAVE CHANGES ]' : '[ CREATE SESSION ]'}
                </Button>
              </div>
            </Card>

            <Card className="border border-border rounded-lg p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="w-4 h-4 text-primary" />
                <h3 className="font-mono text-xs font-bold text-foreground">ADVANCED SETTINGS</h3>
              </div>
              {selectedSession ? (
                <WorkshopConfigPanel
                  workshopId={selectedSession._id}
                  currentMode={selectedSession.executionMode || 'sandbox_only'}
                />
              ) : (
                <p className="font-mono text-[11px] text-muted-foreground">
                  Select a session card and click Edit to manage execution mode and advanced config.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <ActivityTicker />
      </div>
    </div>
  );
}

