/**
 * MetricsService — ported from Secure Your Data, adapted for MongoDB backend.
 * Replaces localStorage with mongodb_mayhem.metrics_events collection.
 */
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';

export type WorkshopEventType =
  | 'workshop_started'
  | 'lab_started'
  | 'lab_completed'
  | 'step_completed'
  | 'quest_started'
  | 'quest_completed'
  | 'flag_captured'
  | 'verification_failed'
  | 'workshop_completed'
  | 'mission_start'
  | 'mission_complete'
  | 'mission_fail'
  | 'hint_used'
  | 'chaos_event_survived'
  | 'chaos_event_failed'
  | 'code_submitted'
  | 'session_joined';

export interface WorkshopMetrics {
  workshopId: string;
  startedAt: Date;
  completedAt?: Date;
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

/**
 * Get aggregated metrics for a workshop session.
 */
export async function getWorkshopMetrics(sessionId: string): Promise<WorkshopMetrics> {
  const db = getDb();
  const col = db.collection(COLLECTIONS.METRICS_EVENTS);

  const [
    participantResult,
    labsStartedResult,
    labsCompletedResult,
    stepsResult,
    questsResult,
    flagsResult,
    failuresResult,
    startEvent,
  ] = await Promise.all([
    col.distinct('userId', { sessionId }),
    col.distinct('data.labId', { sessionId, type: 'lab_started' }),
    col.distinct('data.labId', { sessionId, type: 'lab_completed' }),
    col.countDocuments({ sessionId, type: 'step_completed' }),
    col.countDocuments({ sessionId, type: 'quest_completed' }),
    col.countDocuments({ sessionId, type: 'flag_captured' }),
    col.countDocuments({ sessionId, type: 'verification_failed' }),
    col.findOne({ sessionId, type: 'workshop_started' }, { sort: { timestamp: 1 } }),
  ]);

  const labsStarted = labsStartedResult.length;
  const labsCompleted = labsCompletedResult.length;

  return {
    workshopId: sessionId,
    startedAt: startEvent?.timestamp || new Date(),
    totalParticipants: participantResult.length,
    labsStarted,
    labsCompleted,
    stepsCompleted: stepsResult,
    questsCompleted: questsResult,
    flagsCaptured: flagsResult,
    verificationFailures: failuresResult,
    completionRate: labsStarted > 0 ? (labsCompleted / labsStarted) * 100 : undefined,
  };
}

/**
 * Get failure hotspots — steps where participants stall most.
 */
export async function getFailurePoints(sessionId?: string): Promise<Array<{ stepId: string; count: number; lastError?: string }>> {
  const db = getDb();
  const match: Record<string, unknown> = { type: 'verification_failed' };
  if (sessionId) match.sessionId = sessionId;

  const results = await db.collection(COLLECTIONS.METRICS_EVENTS).aggregate([
    { $match: match },
    {
      $group: {
        _id: '$data.stepId',
        count: { $sum: 1 },
        lastError: { $last: '$data.errorMessage' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]).toArray();

  return results.map((r: any) => ({
    stepId: r._id,
    count: r.count,
    lastError: r.lastError,
  }));
}
