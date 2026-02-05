import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, Users, Target, Flag, CheckCircle2, XCircle, Clock, TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { getMetricsService, WorkshopMetrics } from '@/services/metricsService';
import { getWorkshopSession } from '@/utils/workshopUtils';
import { cn } from '@/lib/utils';

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<WorkshopMetrics | null>(null);
  const [failurePoints, setFailurePoints] = useState<Array<{ stepId: string; count: number; lastError?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = () => {
      const session = getWorkshopSession();
      if (session) {
        const metricsService = getMetricsService();
        const workshopMetrics = metricsService.getMetrics(session.id);
        const failures = metricsService.getFailurePoints();
        
        setMetrics(workshopMetrics);
        setFailurePoints(failures);
      }
      setLoading(false);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6">Loading metrics...</div>;
  }

  if (!metrics) {
    return (
      <Card className="m-6">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No workshop session active. Start a workshop to see metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workshop Metrics</h1>
          <p className="text-muted-foreground">Analytics and insights for this workshop session</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="failures">Failure Points</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{metrics.totalParticipants}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Labs Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    {metrics.labsCompleted} / {metrics.labsStarted}
                  </span>
                </div>
                {metrics.labsStarted > 0 && (
                  <Progress 
                    value={(metrics.labsCompleted / metrics.labsStarted) * 100} 
                    className="mt-2 h-2"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Steps Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{metrics.stepsCompleted}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Flags Captured
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{metrics.flagsCaptured}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion Rate */}
          {metrics.completionRate !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Completion Rate
                </CardTitle>
                <CardDescription>
                  Percentage of participants who completed at least one lab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.completionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Metrics */}
          {metrics.averageTimeToFirstLab && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average time to first lab</span>
                    <span className="font-medium">
                      {Math.round(metrics.averageTimeToFirstLab / 1000 / 60)} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quest & Flag Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{metrics.questsCompleted} completed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification Failures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-lg font-semibold">{metrics.verificationFailures} failures</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participant Activity</CardTitle>
              <CardDescription>
                {metrics.totalParticipants} total participants in this workshop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Labs Started</span>
                  <Badge variant="secondary">{metrics.labsStarted}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Labs Completed</span>
                  <Badge variant="default" className="bg-green-500">
                    {metrics.labsCompleted}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Steps Completed</span>
                  <Badge variant="secondary">{metrics.stepsCompleted}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failure Points Tab */}
        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Failure Points
              </CardTitle>
              <CardDescription>
                Steps where participants encountered verification failures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failurePoints.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No verification failures recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {failurePoints.map((failure, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{failure.stepId}</span>
                        <Badge variant="destructive">{failure.count} failures</Badge>
                      </div>
                      {failure.lastError && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last error: {failure.lastError}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
