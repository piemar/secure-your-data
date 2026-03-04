import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trophy, Award, Users, TrendingUp, Medal, Trash2, ChevronLeft, ChevronRight, Info, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLab } from '@/context/LabContext';
import { useRole } from '@/contexts/RoleContext';
import { heartbeat, type LeaderboardEntry } from '@/utils/leaderboardUtils';
import { runCleanupForParticipant } from '@/services/resetCleanup';
import type { CleanupResult } from '@/services/resetCleanup';
import { toast } from 'sonner';

const PAGE_SIZE = 25;
const POLL_INTERVAL_MS = 5000;

/** Derive lab suffix from leaderboard entry (firstname-lastname or email local part). */
function deriveSuffix(entry: LeaderboardEntry): string {
  const first = (entry.firstName || '').trim();
  const last = (entry.lastName || '').trim();
  if (first || last) {
    return `${first}-${last}`.replace(/-+$/, '').replace(/^-+/, '').replace(/\s+/g, '-').toLowerCase();
  }
  return (entry.email || '').split('@')[0] || '';
}

type DeleteDialogPhase = 'confirm' | 'loading' | 'done';
interface DeleteResult {
  email: string;
  status: 'success' | 'error';
  message?: string;
  cleanupResults?: CleanupResult[];
}

export function Leaderboard() {
  const { userEmail } = useLab();
  const { isModerator } = useRole();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogPhase, setDeleteDialogPhase] = useState<DeleteDialogPhase>('confirm');
  const [deleteDialogResults, setDeleteDialogResults] = useState<DeleteResult[]>([]);

  const updateLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { syncLeaderboardFromApi, getSortedLeaderboard } = await import('@/utils/leaderboardUtils');
      await syncLeaderboardFromApi();
      const entries = getSortedLeaderboard();
      setLeaderboard(entries);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Leaderboard unavailable';
      setError(message);
      const { getSortedLeaderboard } = await import('@/utils/leaderboardUtils');
      setLeaderboard(getSortedLeaderboard());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateLeaderboard();
    if (userEmail) {
      heartbeat(userEmail);
    }
    const interval = setInterval(() => {
      updateLeaderboard();
      if (userEmail) {
        heartbeat(userEmail);
      }
    }, POLL_INTERVAL_MS);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workshop_leaderboard') {
        updateLeaderboard();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userEmail, updateLeaderboard]);

  const openDeleteDialog = useCallback(() => {
    if (selectedEmails.size === 0) return;
    setDeleteDialogResults([]);
    setDeleteDialogPhase('confirm');
    setDeleteDialogOpen(true);
  }, [selectedEmails.size]);

  const runDeleteSelected = useCallback(async () => {
    const list = Array.from(selectedEmails);
    setDeleteDialogPhase('loading');
    setDeleting(true);
    const results: DeleteResult[] = [];

    const uriKey = userEmail
      ? `lab_mongo_uri_${userEmail.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
      : 'lab_mongo_uri';
    const moderatorUri = typeof localStorage !== 'undefined'
      ? (localStorage.getItem(uriKey) || localStorage.getItem('lab_mongo_uri') || '')
      : '';
    const moderatorProfile = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('lab_aws_profile') || '')
      : '';
    const moderatorRegion = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('lab_aws_region') || '')
      : '';

    try {
      const { postDeleteLeaderboardEntry } = await import('@/services/leaderboardApi');
      for (const email of list) {
        const entry = leaderboard.find((e) => e.email === email);
        const suffix = entry ? deriveSuffix(entry) : email.split('@')[0] || '';

        const cleanupResults: CleanupResult[] = [];
        if (suffix && (moderatorUri.trim() || moderatorProfile)) {
          try {
            const cleanup = await runCleanupForParticipant(suffix, moderatorUri.trim() || ' ', moderatorProfile || undefined, moderatorRegion || undefined);
            cleanupResults.push(...cleanup);
          } catch {
            cleanupResults.push({ item: 'Cleanup', status: 'error', message: 'Cleanup failed' });
          }
        }

        try {
          await postDeleteLeaderboardEntry(email);
          results.push({ email, status: 'success', cleanupResults: cleanupResults.length ? cleanupResults : undefined });
        } catch (e) {
          results.push({
            email,
            status: 'error',
            message: e instanceof Error ? e.message : 'Request failed',
            cleanupResults: cleanupResults.length ? cleanupResults : undefined,
          });
        }
      }
      setDeleteDialogResults(results);
      setDeleteDialogPhase('done');
      const ok = results.filter((r) => r.status === 'success').length;
      if (ok > 0) {
        setSelectedEmails(new Set());
        await updateLeaderboard();
        toast.success(ok === 1 ? 'Participant removed' : `${ok} participants removed`);
      }
    } catch (e) {
      setDeleteDialogResults([{ email: '', status: 'error', message: e instanceof Error ? e.message : 'Failed' }]);
      setDeleteDialogPhase('done');
      toast.error('Failed to remove participant(s)');
    } finally {
      setDeleting(false);
    }
  }, [selectedEmails, updateLeaderboard, leaderboard, userEmail]);

  const handleDeleteSelected = useCallback(() => {
    openDeleteDialog();
  }, [openDeleteDialog]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && isModerator && selectedEmails.size > 0) {
      e.preventDefault();
      handleDeleteSelected();
    }
  }, [isModerator, selectedEmails.size, handleDeleteSelected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleSelect = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAllOnPage = (emailsOnPage: string[]) => {
    const allSelected = emailsOnPage.every(e => selectedEmails.has(e));
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (allSelected) emailsOnPage.forEach(e => next.delete(e));
      else emailsOnPage.forEach(e => next.add(e));
      return next;
    });
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.completedLabs.length - a.completedLabs.length;
  });

  const searchLower = emailSearch.trim().toLowerCase();
  const filteredLeaderboard = searchLower
    ? sortedLeaderboard.filter((entry) => {
        const email = (entry.email || '').toLowerCase();
        const first = (entry.firstName || '').toLowerCase();
        const last = (entry.lastName || '').toLowerCase();
        const name = `${first} ${last}`.trim();
        return email.includes(searchLower) || name.includes(searchLower) || first.includes(searchLower) || last.includes(searchLower);
      })
    : sortedLeaderboard;

  const totalPages = Math.max(1, Math.ceil(filteredLeaderboard.length / PAGE_SIZE));
  const pageIndex = Math.min(currentPage, totalPages - 1);
  const paginatedEntries = filteredLeaderboard.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);
  const userRank = sortedLeaderboard.findIndex(entry => entry.email === userEmail) + 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">See how you rank against other participants</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1" title="The list refreshes from the server every few seconds.">
            <Info className="w-3 h-3" />
            Refreshes every {POLL_INTERVAL_MS / 1000}s.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by email or name..."
              value={emailSearch}
              onChange={(e) => { setEmailSearch(e.target.value); setCurrentPage(0); }}
              className="pl-9 font-mono text-sm"
              aria-label="Filter participants by email or name"
            />
          </div>
          {emailSearch.trim() && (
            <p className="text-xs text-muted-foreground mt-1">
              Showing {filteredLeaderboard.length} of {sortedLeaderboard.length} participants
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <p className="font-medium">Leaderboard unavailable</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-muted-foreground">Set LEADERBOARD_MONGODB_URI on the server or use a local MongoDB. Showing cached data if any.</p>
          </div>
        )}

        {userEmail && userRank > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Your Rank: #{userRank}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{sortedLeaderboard[userRank - 1]?.score || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Labs</p>
                  <p className="text-2xl font-bold">{sortedLeaderboard[userRank - 1]?.completedLabs.length || 0}/3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Participants ({filteredLeaderboard.length}{emailSearch.trim() ? ` of ${sortedLeaderboard.length}` : ''})
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  Ranked by score and lab completion
                  {totalPages > 1 && (
                    <span className="text-muted-foreground"> · Page {pageIndex + 1} of {totalPages}</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isModerator && selectedEmails.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete selected ({selectedEmails.size})
                  </Button>
                )}
                {loading && <span className="text-sm text-muted-foreground">Refreshing...</span>}
              </div>
            </div>
            {isModerator && filteredLeaderboard.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Select participants and press <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">Delete</kbd> or click &quot;Delete selected&quot; to reset their progress and remove them from the leaderboard.
              </p>
            )}
          </CardHeader>
          <CardContent>
            {filteredLeaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{emailSearch.trim() ? 'No participants match your search. Try a different email or name.' : 'No participants yet. Be the first to complete a lab!'}</p>
              </div>
            ) : (
              <>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={pageIndex === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, filteredLeaderboard.length)} of {filteredLeaderboard.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={pageIndex >= totalPages - 1}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {paginatedEntries.map((entry, idx) => {
                    const globalIndex = pageIndex * PAGE_SIZE + idx;
                    const isCurrentUser = entry.email === userEmail;
                    const isSelected = selectedEmails.has(entry.email);
                    return (
                      <div
                        key={entry.email}
                        className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                          isCurrentUser
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : globalIndex < 3
                            ? 'border-border bg-card'
                            : 'border-border bg-card/50'
                        } ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
                      >
                        {isModerator && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedEmails(prev => {
                                const next = new Set(prev);
                                if (checked === true) next.add(entry.email);
                                else next.delete(entry.email);
                                return next;
                              });
                            }}
                            aria-label={`Select ${entry.email}`}
                          />
                        )}
                        <div className="w-12 flex items-center justify-center flex-shrink-0">
                          {getMedalIcon(globalIndex) || (
                            <span className="text-lg font-bold text-muted-foreground">#{globalIndex + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                              {[entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.email}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded flex-shrink-0">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {(entry.firstName != null || entry.lastName != null) && (
                              <span className="truncate">{entry.email}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 flex-shrink-0" />
                              {entry.score} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4 flex-shrink-0" />
                              {entry.completedLabs.length}/3 labs
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {[1, 2, 3].map((labNum) => (
                            <div
                              key={labNum}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                entry.completedLabs.includes(labNum)
                                  ? 'bg-green-500 text-white'
                                  : entry.labTimes?.[labNum]
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                              title={
                                entry.completedLabs.includes(labNum)
                                  ? `Lab ${labNum} completed`
                                  : entry.labTimes?.[labNum]
                                  ? `Lab ${labNum} in progress (${formatTime(entry.labTimes[labNum])})`
                                  : `Lab ${labNum} not started`
                              }
                            >
                              {labNum}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isModerator && paginatedEntries.length > 0 && filteredLeaderboard.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelectAllOnPage(paginatedEntries.map(e => e.email))}
                      className="text-muted-foreground"
                    >
                      {paginatedEntries.every(e => selectedEmails.has(e.email)) ? 'Deselect all on page' : 'Select all on page'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Remove participant(s) dialog – runs full cleanup (KMS + MongoDB by suffix) then removes from leaderboard */}
        {isModerator && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => deleteDialogPhase === 'confirm' && e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Remove participant(s) from leaderboard</DialogTitle>
                <DialogDescription>
                  {deleteDialogPhase === 'confirm' && (
                    <>
                      This will run the same steps as <strong>Reset progress</strong> for each participant, then remove them from the leaderboard:
                      <br /><br />
                      <span className="text-muted-foreground">
                        <strong>1.</strong> KMS: delete alias <code className="text-xs">alias/mongodb-lab-key-&lt;suffix&gt;</code> and schedule key deletion.
                        <br />
                        <strong>2.</strong> MongoDB: drop their lab DBs <code className="text-xs">encryption_&lt;suffix&gt;</code>, <code className="text-xs">medical_&lt;suffix&gt;</code>, <code className="text-xs">hr_&lt;suffix&gt;</code> (using your stored URI and their suffix from name/email).
                        <br />
                        <strong>3.</strong> Leaderboard: reset entry and remove.
                        <br /><br />
                        Your stored MongoDB URI and AWS profile are used (shared workshop cluster/account). Suffix is derived from each participant&apos;s first/last name or email.
                      </span>
                    </>
                  )}
                  {deleteDialogPhase === 'loading' && 'Cleaning up KMS + MongoDB, then removing from leaderboard…'}
                  {deleteDialogPhase === 'done' && 'Summary of what was done.'}
                </DialogDescription>
              </DialogHeader>
              {deleteDialogPhase === 'confirm' && (
                <p className="text-sm text-muted-foreground py-2">
                  {selectedEmails.size === 1
                    ? `Remove "${Array.from(selectedEmails)[0]}"?`
                    : `Remove ${selectedEmails.size} participants?`}
                </p>
              )}
              {deleteDialogPhase === 'loading' && (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cleaning up KMS + MongoDB, then removing…</span>
                </div>
              )}
              {deleteDialogPhase === 'done' && (
                <div className="space-y-3">
                  <ul className="space-y-2 max-h-[280px] overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm">
                    {deleteDialogResults.map((r, i) => (
                      <li key={i} className="flex flex-col gap-1">
                        <div className="flex items-start gap-2">
                          {r.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          )}
                          <span>
                            {r.status === 'success' ? 'Removed: ' : 'Failed: '}
                            <span className="font-mono">{r.email || '(request)'}</span>
                            {r.message && <span className="text-muted-foreground"> – {r.message}</span>}
                          </span>
                        </div>
                        {r.cleanupResults && r.cleanupResults.length > 0 && (
                          <ul className="ml-6 text-xs text-muted-foreground space-y-0.5">
                            {r.cleanupResults.map((c, j) => (
                              <li key={j}>
                                {c.status === 'success' && <CheckCircle2 className="w-3 h-3 text-green-500 inline mr-1" />}
                                {c.status === 'error' && <XCircle className="w-3 h-3 text-destructive inline mr-1" />}
                                {c.item}{c.message ? ` – ${c.message}` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <DialogFooter>
                {deleteDialogPhase === 'confirm' && (
                  <>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={runDeleteSelected}>
                      Remove from leaderboard
                    </Button>
                  </>
                )}
                {deleteDialogPhase === 'done' && (
                  <Button onClick={() => setDeleteDialogOpen(false)}>OK</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
