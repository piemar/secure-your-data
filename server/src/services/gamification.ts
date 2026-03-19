/**
 * GamificationService — ported from Secure Your Data, adapted for MongoDB backend.
 * Replaces localStorage with mongodb_mayhem.player_progress + metrics_events.
 */
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';

export type GamificationEventType =
  | 'step_completed'
  | 'flag_captured'
  | 'quest_completed'
  | 'mission_completed'
  | 'lab_completed';

export interface GamificationEvent {
  type: GamificationEventType;
  userId: string;
  missionId?: string;
  labId?: string;
  stepId?: string;
  flagId?: string;
  questId?: string;
  sessionId?: string;
  assisted?: boolean;
}

export interface ScoringConfig {
  baseXpMultiplier: number;
  timeBonusEnabled: boolean;
  chaosEventsEnabled: boolean;
  hintPenaltyMultiplier: number;
  basePointsPerStep: number;
  bonusPointsPerFlag: number;
  bonusPointsPerQuest: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
  baseXpMultiplier: 1,
  timeBonusEnabled: true,
  chaosEventsEnabled: true,
  hintPenaltyMultiplier: 1,
  basePointsPerStep: 10,
  bonusPointsPerFlag: 25,
  bonusPointsPerQuest: 50,
};

export function calculatePoints(event: GamificationEvent, config: Partial<ScoringConfig> = {}): number {
  const c = { ...DEFAULT_CONFIG, ...config };

  switch (event.type) {
    case 'step_completed': {
      const base = c.basePointsPerStep * c.baseXpMultiplier;
      return event.assisted ? Math.floor(base / 2) : base;
    }
    case 'flag_captured':
      return c.bonusPointsPerFlag * c.baseXpMultiplier;
    case 'quest_completed':
      return c.bonusPointsPerQuest * c.baseXpMultiplier;
    case 'mission_completed':
      return c.basePointsPerStep * 5 * c.baseXpMultiplier;
    case 'lab_completed':
      return c.basePointsPerStep * 5 * c.baseXpMultiplier;
    default:
      return 0;
  }
}

/**
 * Record a gamification event: award XP to player and log metric event.
 */
export async function recordGamificationEvent(
  event: GamificationEvent,
  config: Partial<ScoringConfig> = {}
): Promise<number> {
  const points = calculatePoints(event, config);
  if (points <= 0) return 0;

  const db = getDb();

  // Update player XP + totalScore atomically
  await db.collection(COLLECTIONS.PLAYER_PROGRESS).updateOne(
    { userId: event.userId },
    {
      $inc: { xp: points, totalScore: points },
      $set: { updatedAt: new Date() },
    }
  );

  // Log as metric event
  await db.collection(COLLECTIONS.METRICS_EVENTS).insertOne({
    type: event.type,
    userId: event.userId,
    missionId: event.missionId || null,
    sessionId: event.sessionId || null,
    data: {
      labId: event.labId,
      stepId: event.stepId,
      flagId: event.flagId,
      questId: event.questId,
      assisted: event.assisted,
      pointsAwarded: points,
    },
    timestamp: new Date(),
  });

  return points;
}

/**
 * Capture a flag for a user in a session.
 */
export async function captureFlag(
  userId: string,
  flagId: string,
  sessionId: string,
  config: Partial<ScoringConfig> = {}
): Promise<{ points: number; alreadyCaptured: boolean }> {
  const db = getDb();

  // Check if already captured
  const existing = await db.collection(COLLECTIONS.FLAGS).findOne({
    flagId,
    userId,
    sessionId,
  });

  if (existing) return { points: 0, alreadyCaptured: true };

  // Record capture
  await db.collection(COLLECTIONS.FLAGS).insertOne({
    flagId,
    userId,
    sessionId,
    capturedAt: new Date(),
  });

  const points = await recordGamificationEvent(
    { type: 'flag_captured', userId, flagId, sessionId },
    config
  );

  return { points, alreadyCaptured: false };
}
