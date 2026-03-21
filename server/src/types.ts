/**
 * Shared types for MongoDB Mayhem backend.
 * Merges game types from the frontend with workshop types from Secure Your Data.
 */

// ===== Roles & Auth =====
export type UserRole = 'moderator' | 'attendee';

export interface UserDoc {
  _id?: string;
  handle: string;
  email?: string;
  password: string; // bcrypt hash (empty for PIN-only users)
  role: UserRole;
  tenantId: string;
  workshopId?: string;
  createdAt: Date;
}

// ===== Player (mirrors frontend Player type) =====
export type PlayerRank =
  | 'Script Kiddie'
  | 'Query Cadet'
  | 'Replica Ranger'
  | 'Shard Commander'
  | 'Atlas Overlord';

export type MissionDifficulty = 'guided' | 'challenge' | 'expert';

export interface PlayerProgressDoc {
  _id?: string;
  userId: string;
  handle: string;
  tenantId: string;
  workshopId?: string;
  xp: number;
  rank: PlayerRank;
  level: number;
  achievements: string[];
  completedMissions: string[];
  totalScore: number;
  fastestMission?: number;
  chaosEventsSurvived: number;
  hintsUsed: number;
  hintXpPenalty: number;
  preferredDifficulty?: MissionDifficulty;
  activeQuestId?: string;
  avatarId?: string;
  createdAt: Date;
}

// ===== Workshop (ported from Secure Your Data) =====
export type WorkshopStatus = 'active' | 'paused' | 'ended';

export type WorkshopExecutionMode = 'sandbox_only' | 'atlas_connected' | 'hybrid';

export interface WorkshopSessionDoc {
  _id?: string;
  tenantId: string;
  name: string;
  customerName?: string;
  technicalChampionName?: string;
  technicalChampionEmail?: string;
  salesforceOpportunityId?: string;
  allowedEmailDomains?: string[];
  logoUrl?: string;
  templateId: string | null;
  missionIds: string[];
  pin: string;
  status: WorkshopStatus;
  moderatorId: string;
  participants: string[]; // userId[]
  timeLimit: number | null; // seconds
  executionMode?: WorkshopExecutionMode;
  /** When set, overrides `SANDBOX_COLLECTION_PREFIX_MODE` for sandboxes keyed to this workshop session. */
  sandboxCollectionPrefixMode?: boolean;
  /**
   * When set, overrides executionMode-derived policy for `POST /api/execute/cloud`.
   * Omitted → inherit from executionMode (legacy workshops without executionMode still allow cloud).
   */
  cloudExecutionAllowed?: boolean;
  archivedAt?: Date | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface WorkshopTemplateDoc {
  _id?: string;
  name: string;
  description: string;
  missionIds: string[];
  defaultTimeLimit: number | null;
  scoringConfig: ScoringConfig;
  flags: WorkshopFlag[];
  seedDataRequirements: LabDataRequirement[];
  createdBy: string;
  createdAt: Date;
}

export interface ScoringConfig {
  baseXpMultiplier: number;
  timeBonusEnabled: boolean;
  chaosEventsEnabled: boolean;
  hintPenaltyMultiplier: number;
}

export interface WorkshopFlag {
  id: string;
  missionId: string;
  verificationId: string;
  label: string;
  hidden: boolean; // Hidden flags are not shown to attendees until captured
  xpBonus: number;
}

export interface FlagCapture {
  flagId: string;
  userId: string;
  capturedAt: Date;
  sessionId: string;
}

export interface LabDataRequirement {
  missionId: string;
  collections: string[];
  seedScript?: string; // mongosh script to set up data
  description: string;
}

// ===== Metrics =====
export type MetricEventType =
  | 'mission_start'
  | 'mission_complete'
  | 'mission_fail'
  | 'hint_used'
  | 'chaos_event_survived'
  | 'chaos_event_failed'
  | 'flag_captured'
  | 'session_joined'
  | 'code_submitted';

export interface MetricEventDoc {
  _id?: string;
  type: MetricEventType;
  userId: string;
  missionId: string | null;
  sessionId: string | null;
  data: Record<string, unknown>;
  timestamp: Date;
}

// ===== Verification (stub for Phase 3) =====
export interface VerificationResult {
  verified: boolean;
  verificationId: string;
  message: string;
  details?: Record<string, unknown>;
}

// ===== Moderation =====
export type ModerationActionType = 'pause' | 'resume' | 'end' | 'hint_all' | 'extend_time';

export interface ModerationAction {
  type: ModerationActionType;
  sessionId: string;
  moderatorId: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

// ===== Team (Phase 4) =====
export interface WorkshopTeam {
  id: string;
  name: string;
  sessionId: string;
  memberIds: string[];
  score: number;
}
