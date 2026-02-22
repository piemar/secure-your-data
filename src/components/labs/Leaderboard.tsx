import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Users, TrendingUp, Medal } from 'lucide-react';
import { useLab } from '@/context/LabContext';
import { getSortedLeaderboard, heartbeat, syncLeaderboard, type LeaderboardEntry } from '@/utils/leaderboardUtils';

export function Leaderboard() {
  const { userEmail } = useLab();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateLeaderboard = async () => {
      await syncLeaderboard();
      const entries = getSortedLeaderboard();
      setLeaderboard(entries);
      setLoading(false);
    };

    // Initial load
    updateLeaderboard();

    // Send heartbeat for current user
    if (userEmail) {
      heartbeat(userEmail);
    }

    // Refresh every 2 seconds so other participants' progress appears quickly
    const interval = setInterval(async () => {
      await updateLeaderboard();
      if (userEmail) {
        await heartbeat(userEmail);
      }
    }, 2000);

    // Listen for storage changes (another tab updated the leaderboard)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workshop_leaderboard') {
        updateLeaderboard();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for immediate refresh when current user completes a step (same tab)
    const handleLeaderboardUpdate = () => {
      updateLeaderboard();
    };
    window.addEventListener('workshop-leaderboard-update', handleLeaderboardUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('workshop-leaderboard-update', handleLeaderboardUpdate);
    };
  }, [userEmail]);

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
    // Sort by score first, then by completed labs count
    if (b.score !== a.score) return b.score - a.score;
    return b.completedLabs.length - a.completedLabs.length;
  });

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
        </div>

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Participants ({sortedLeaderboard.length})
                </CardTitle>
                <CardDescription>Ranked by score and lab completion</CardDescription>
              </div>
              {loading && <div className="text-sm text-muted-foreground">Refreshing...</div>}
            </div>
          </CardHeader>
          <CardContent>
            {sortedLeaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No participants yet. Be the first to complete a lab!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedLeaderboard.map((entry, index) => {
                  const isCurrentUser = entry.email === userEmail;

                  return (
                    <div
                      key={entry.email}
                      className={`p-4 rounded-lg border transition-all ${isCurrentUser
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : index < 3
                            ? 'border-border bg-card'
                            : 'border-border bg-card/50'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex items-center justify-center">
                          {getMedalIcon(index) || (
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                              {entry.email}
                            </p>
                            {isCurrentUser && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {entry.score} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {entry.completedLabs.length}/3 labs
                            </span>
                          </div>
                        </div>

                        {/* Progress bars for each lab */}
                        <div className="flex gap-2">
                          {[1, 2, 3].map((labNum) => (
                            <div
                              key={labNum}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${entry.completedLabs.includes(labNum)
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
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
