/**
 * MetricsService collects and stores workshop metrics for analytics.
 * 
 * CURRENT IMPLEMENTATION: Uses localStorage and logs to console.
 * FUTURE: Will integrate with backend MongoDB for persistent storage and dashboards.
 */

export interface WorkshopEvent {
  type: 'workshop_started' | 'lab_started' | 'lab_completed' | 'step_completed' | 
        'quest_started' | 'quest_completed' | 'flag_captured' | 'verification_failed' |
        'workshop_completed';
  timestamp: number;
  participantId?: string;
  labId?: string;
  stepId?: string;
  questId?: string;
  flagId?: string;
  verificationId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WorkshopMetrics {
  workshopId: string;
  startedAt: number;
  completedAt?: number;
  totalParticipants: number;
  labsStarted: number;
  labsCompleted: number;
  stepsCompleted: number;
  questsCompleted: number;
  flagsCaptured: number;
  verificationFailures: number;
  averageTimeToFirstLab?: number;
  completionRate?: number;
}

class MetricsService {
  private events: WorkshopEvent[] = [];

  /**
   * Record a workshop event
   */
  recordEvent(event: Omit<WorkshopEvent, 'timestamp'>): void {
    const fullEvent: WorkshopEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);
    
    // Persist to localStorage
    try {
      const stored = localStorage.getItem('workshop_metrics_events');
      const existingEvents: WorkshopEvent[] = stored ? JSON.parse(stored) : [];
      existingEvents.push(fullEvent);
      // Keep only last 1000 events
      const recentEvents = existingEvents.slice(-1000);
      localStorage.setItem('workshop_metrics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to persist metrics event:', error);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Metrics]', fullEvent);
    }
  }

  /**
   * Get all events
   */
  getEvents(): WorkshopEvent[] {
    try {
      const stored = localStorage.getItem('workshop_metrics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get metrics summary for a workshop
   */
  getMetrics(workshopId: string): WorkshopMetrics {
    const events = this.getEvents();
    const workshopEvents = events.filter(e => 
      e.type === 'workshop_started' || 
      (e.metadata?.workshopId === workshopId)
    );

    const startedEvent = workshopEvents.find(e => e.type === 'workshop_started');
    const participants = new Set(
      workshopEvents
        .filter(e => e.participantId)
        .map(e => e.participantId!)
    );

    const labsStarted = new Set(
      workshopEvents
        .filter(e => e.type === 'lab_started' && e.labId)
        .map(e => e.labId!)
    ).size;

    const labsCompleted = new Set(
      workshopEvents
        .filter(e => e.type === 'lab_completed' && e.labId)
        .map(e => e.labId!)
    ).size;

    const stepsCompleted = workshopEvents.filter(e => e.type === 'step_completed').length;
    const questsCompleted = workshopEvents.filter(e => e.type === 'quest_completed').length;
    const flagsCaptured = workshopEvents.filter(e => e.type === 'flag_captured').length;
    const verificationFailures = workshopEvents.filter(e => e.type === 'verification_failed').length;

    // Calculate average time to first lab
    const firstLabEvents = workshopEvents
      .filter(e => e.type === 'lab_started')
      .map(e => e.timestamp);
    const averageTimeToFirstLab = firstLabEvents.length > 0 && startedEvent
      ? firstLabEvents.reduce((sum, ts) => sum + (ts - startedEvent.timestamp), 0) / firstLabEvents.length
      : undefined;

    // Calculate completion rate
    const completionRate = participants.size > 0
      ? (labsCompleted / Math.max(labsStarted, 1)) * 100
      : undefined;

    return {
      workshopId,
      startedAt: startedEvent?.timestamp || Date.now(),
      totalParticipants: participants.size,
      labsStarted,
      labsCompleted,
      stepsCompleted,
      questsCompleted,
      flagsCaptured,
      verificationFailures,
      averageTimeToFirstLab,
      completionRate
    };
  }

  /**
   * Get failure points (where participants stall)
   */
  getFailurePoints(): Array<{ stepId: string; count: number; lastError?: string }> {
    const events = this.getEvents();
    const failures = events.filter(e => e.type === 'verification_failed');
    
    const failureMap = new Map<string, { count: number; lastError?: string }>();
    
    failures.forEach(failure => {
      if (failure.stepId) {
        const existing = failureMap.get(failure.stepId) || { count: 0 };
        failureMap.set(failure.stepId, {
          count: existing.count + 1,
          lastError: failure.errorMessage || existing.lastError
        });
      }
    });

    return Array.from(failureMap.entries())
      .map(([stepId, data]) => ({ stepId, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Clear all metrics (for testing/reset)
   */
  clearMetrics(): void {
    localStorage.removeItem('workshop_metrics_events');
    this.events = [];
  }
}

// Singleton instance
let metricsServiceInstance: MetricsService | null = null;

export function getMetricsService(): MetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new MetricsService();
  }
  return metricsServiceInstance;
}
