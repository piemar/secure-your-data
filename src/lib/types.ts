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