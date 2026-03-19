export type MissionTier = 'recon' | 'infiltration' | 'exfiltration';
export type MissionStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'failed';

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
}

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
  hint?: string;
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
}

export interface LeaderboardEntry {
  player: Player;
  position: number;
  positionChange: number; // +/- since last update
}
