export type MissionTier = 'recon' | 'infiltration' | 'exfiltration';
export type MissionStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'failed';
export type MissionDifficulty = 'guided' | 'challenge' | 'expert';

export interface Mission {
  id: string;
  title: string;
  codename: string;
  tier: MissionTier;
  description: string;
  briefing: string;
  objectives: MissionObjective[];
  timeLimit: number; // seconds
  xpReward: number;
  chaosEvents: ChaosEvent[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  povCapabilities?: string[]; // PoV proof references from secure-your-data
  topic?: string; // e.g. 'query', 'encryption', 'analytics'
}

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
  hint?: string;
}

export interface InlineHint {
  line: number;         // 1-based line in the skeleton
  blankText: string;    // the placeholder text (e.g. '_________')
  hint: string;         // progressive hint text
  answer: string;       // the correct fill-in
  xpPenalty?: number;   // XP deducted when this hint is revealed (default: 25)
}

export interface MissionSkeleton {
  guided: string;       // Heavy hints, TODOs clearly marked, most structure given
  challenge: string;    // Moderate scaffolding, fewer hints
  expert: string;       // Blank slate — just the objective comments
  hints: {
    guided: InlineHint[];
    challenge: InlineHint[];
  };
}

export interface ChaosEvent {
  id: string;
  title: string;
  description: string;
  triggerAt: number; // seconds into mission
  penalty: number; // XP penalty if not handled
  duration: number; // seconds to resolve
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: number;
}

export type PlayerRank = 
  | 'Script Kiddie' 
  | 'Query Cadet' 
  | 'Replica Ranger' 
  | 'Shard Commander' 
  | 'Atlas Overlord';

export interface Player {
  id: string;
  handle: string;
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
}

export interface LeaderboardEntry {
  player: Player;
  position: number;
  positionChange: number;
}

// === Quest System ===
export interface Quest {
  id: string;
  title: string;
  codename: string;
  description: string;
  storyIntro: string;
  storyOutro: string;
  missionIds: string[];    // ordered mission IDs in quest chain
  bonusXp: number;         // XP awarded for completing the full quest
  icon: string;
  requiredMissions: number; // how many missions needed to "complete" the quest
}

export interface QuestProgress {
  questId: string;
  completedMissionIds: string[];
  started: boolean;
  completed: boolean;
  startedAt?: number;
  completedAt?: number;
}

// ===================================================================
// Workshop types (ported from Secure Your Data)
// ===================================================================

export type WorkshopMode = 'demo' | 'lab' | 'challenge';
export type WorkshopRole = 'moderator' | 'attendee' | 'observer';
export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkshopStatus = 'active' | 'paused' | 'ended';

export interface WorkshopTopic {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  defaultLabIds?: string[];
  prerequisites?: string[];
  povCapabilities?: string[];
  labIds?: string[];
}

export interface LabDataRequirement {
  id: string;
  description: string;
  type: 'collection' | 'file' | 'script';
  path?: string;
  namespace?: string;
  sizeHint?: string;
}

export interface WorkshopLabStep {
  id: string;
  title: string;
  narrative?: string;
  instructions: string;
  estimatedTimeMinutes?: number;
  dataRequirements?: LabDataRequirement[];
  codeSnippets?: { language: string; code: string; description?: string }[];
  verificationId?: string;
  points?: number;
  hints?: string[];
  dependsOnStepIds?: string[];
  modes?: WorkshopMode[];
  enhancementId?: string;
  sourceProof?: string;
  sourceSection?: string;
}

export interface WorkshopLabDefinition {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  estimatedTotalTimeMinutes?: number;
  tags?: string[];
  prerequisites?: string[];
  steps: WorkshopLabStep[];
  modes?: WorkshopMode[];
  audience?: WorkshopRole | 'all';
  povCapabilities?: string[];
  dataRequirements?: LabDataRequirement[];
  keyConcepts?: Array<{ term: string; explanation: string }>;
  whatYouWillBuild?: string[];
  keyInsight?: string;
  defaultCompetitorId?: string;
  competitorIds?: string[];
}

export interface LabContextOverlay {
  labId: string;
  titleOverride?: string;
  descriptionOverride?: string;
  introNarrative?: string;
  outroNarrative?: string;
  stepNarrativeOverrides?: Record<string, string>;
  stepFilter?: {
    stepIds?: string[];
    excludeStepIds?: string[];
    modeFilter?: WorkshopMode[];
  };
}

export interface WorkshopGamificationConfig {
  enabled: boolean;
  basePointsPerStep?: number;
  bonusPointsPerFlag?: number;
  bonusPointsPerQuest?: number;
  allowTeams?: boolean;
}

export interface WorkshopQuest {
  id: string;
  title: string;
  storyContext: string;
  objectiveSummary: string;
  labIds: string[];
  requiredFlagIds: string[];
  optionalFlagIds?: string[];
  modes?: WorkshopMode[];
  labContextOverlays?: LabContextOverlay[];
}

export interface WorkshopFlag {
  id: string;
  name: string;
  description?: string;
  visibility: 'hidden' | 'visible';
  verificationId: string;
  points?: number;
}

export interface WorkshopTemplate {
  id: string;
  name: string;
  description: string;
  topicIds: string[];
  labIds: string[];
  questIds?: string[];
  defaultMode: WorkshopMode;
  allowedModes?: WorkshopMode[];
  gamification?: WorkshopGamificationConfig;
  labContextOverlays?: LabContextOverlay[];
  includeCompetitorComparisons?: boolean;
  defaultCompetitorId?: string;
  industry?: string;
  storyIntro?: string;
  storyOutro?: string;
  isCustom?: boolean;
}

export interface WorkshopInstance {
  id: string;
  templateId: string;
  name: string;
  pin: string;
  status: WorkshopStatus;
  moderatorId: string;
  participants: string[];
  missionIds: string[];
  timeLimit: number | null;
  customerName?: string;
  mode: WorkshopMode;
  createdAt: Date;
  updatedAt?: Date;
}

export interface WorkshopScoreEntry {
  participantId: string;
  teamId?: string;
  totalPoints: number;
  completedLabIds: string[];
  completedQuestIds: string[];
  capturedFlagIds: string[];
}

export interface WorkshopTeam {
  id: string;
  name: string;
  memberIds: string[];
  score: number;
}

// Verification IDs (ported from Secure Your Data's VerificationService)
export type VerificationId =
  | 'csfle.verifyKeyVaultIndex' | 'csfle.verifyCmkExists' | 'csfle.verifyKeyPolicy'
  | 'csfle.verifyKeyVaultCount' | 'csfle.verifyDekCreated' | 'csfle.verifyEncryptionWorking'
  | 'csfle.verifyComplete' | 'csfle.verifyMigration' | 'csfle.verifyTenantDEKs'
  | 'csfle.verifyMultiTenantKeys' | 'csfle.verifyKeyRotation' | 'csfle.verifyDataKey'
  | 'qe.verifyDEKs' | 'qe.verifyQEDEKs' | 'qe.verifyCollection' | 'qe.verifyQECollection'
  | 'qe.verifyMetadata' | 'qe.verifyQEMetadata' | 'qe.verifyRangeQuery' | 'qe.verifyQERangeQuery'
  | 'rich-query.verifyBasicFilters' | 'rich-query.verifyProjectionAndSort'
  | 'rich-query.verifyPagination' | 'rich-query.verifyIndexUsage'
  | 'rich-query.verifyBasicAggregation' | 'rich-query.verifyProjectionAggregation'
  | 'rich-query.verifyFacets'
  | 'ingest-rate.verifyClusterConfig' | 'ingest-rate.verifySmallRecordRate'
  | 'ingest-rate.verifyReplication' | 'ingest-rate.verifyBulkComparison'
  | 'graph.verifyModel' | 'graph.verifyTraversal' | 'graph.verifyExplanation'
  | 'graph.verifyFraudModel' | 'graph.verifyFraudQueries'
  | 'geospatial.verifyIndex' | 'geospatial.verifyNearQueries'
  | 'analytics.verifyDataLoad' | 'analytics.verifyBasicAggregation'
  | 'text-search.verifyIndexCreated' | 'text-search.verifyQueries'
  | 'verify-encrypted-collections' | 'verify-no-plaintext-pii'
  | 'verify-queryable-encryption' | 'verify-indexes'
  | 'verify-access-control' | 'verify-query-performance';