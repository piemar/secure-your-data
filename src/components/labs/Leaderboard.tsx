import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Award, Users, TrendingUp, Medal } from 'lucide-react';
import { useLab } from '@/context/LabContext';

interface LeaderboardEntry {
  email: string;
  score: number;
  completedLabs: number[];
  labTimes: Record<number, number>; // lab number -> time spent in ms
  lastActive: number;
}

export function Leaderboard() {
  const { userEmail } = useLab();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTotalTime = (entry: LeaderboardEntry) => {
    return Object.values(entry.labTimes || {}).reduce((sum, time) => sum + time, 0);
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{sortedLeaderboard[userRank - 1]?.score || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Labs</p>
                  <p className="text-2xl font-bold">{sortedLeaderboard[userRank - 1]?.completedLabs.length || 0}/3</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">
                    {formatTime(getTotalTime(sortedLeaderboard[userRank - 1] || { labTimes: {} }))}
                  </p>
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
                  const totalTime = getTotalTime(entry);
                  
                  return (
                    <div
                      key={entry.email}
                      className={`p-4 rounded-lg border transition-all ${
                        isCurrentUser
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
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(totalTime)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bars for each lab */}
                        <div className="flex gap-2">
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
