import { Achievement } from '@/lib/types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', name: 'First Blood', description: 'Complete your first mission', icon: '🩸', rarity: 'common', unlocked: false },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a mission in under 2 minutes', icon: '⚡', rarity: 'rare', unlocked: false },
  { id: 'chaos-survivor', name: 'Chaos Survivor', description: 'Complete a mission during a chaos event', icon: '🌪️', rarity: 'epic', unlocked: false },
  { id: 'full-collection', name: 'Full Collection', description: 'Complete all missions', icon: '🏆', rarity: 'legendary', unlocked: false },
  { id: 'perfect-run', name: 'Perfect Run', description: 'Complete a mission with all objectives and no penalties', icon: '💎', rarity: 'epic', unlocked: false },
  { id: 'recon-master', name: 'Recon Master', description: 'Complete all Recon tier missions', icon: '🔍', rarity: 'common', unlocked: false },
  { id: 'infiltrator', name: 'Infiltrator', description: 'Complete all Infiltration tier missions', icon: '🥷', rarity: 'rare', unlocked: false },
  { id: 'data-exfiltrator', name: 'Data Exfiltrator', description: 'Complete all Exfiltration tier missions', icon: '📡', rarity: 'epic', unlocked: false },
  { id: 'no-sleep', name: 'No Sleep Till Mongo', description: 'Play for over 60 minutes total', icon: '☕', rarity: 'common', unlocked: false },
  { id: 'index-everything', name: 'Index Everything', description: 'Complete The Phantom Index in under 3 minutes', icon: '📑', rarity: 'rare', unlocked: false },
  { id: 'cluster-whisperer', name: 'Cluster Whisperer', description: 'Survive 5 chaos events', icon: '🌀', rarity: 'epic', unlocked: false },
  { id: 'atlas-overlord', name: 'Atlas Overlord', description: 'Reach the highest rank', icon: '👑', rarity: 'legendary', unlocked: false },
  { id: 'query-ninja', name: 'Query Ninja', description: 'Complete Rich Query Recon without any hints', icon: '🥷', rarity: 'rare', unlocked: false },
  { id: 'crypto-agent', name: 'Crypto Agent', description: 'Complete Encryption Lockdown', icon: '🔐', rarity: 'epic', unlocked: false },
  { id: 'scale-master', name: 'Scale Master', description: 'Complete Scale-Out Siege', icon: '📐', rarity: 'rare', unlocked: false },
  { id: 'infra-coder', name: 'Infra as Code', description: 'Complete Deployment Automation', icon: '🏗️', rarity: 'epic', unlocked: false },
  { id: 'no-hints', name: 'No Training Wheels', description: 'Complete 3 missions on Expert difficulty', icon: '🎓', rarity: 'epic', unlocked: false },
  { id: 'hint-master', name: 'Hint Hunter', description: 'Reveal 20 hints across all missions', icon: '💡', rarity: 'common', unlocked: false },
  { id: 'quest-genesis', name: 'Genesis Agent', description: 'Complete The Data Heist quest chain', icon: '🎯', rarity: 'rare', unlocked: false },
  { id: 'quest-fortress', name: 'Fortress Guardian', description: 'Complete Fortress Protocol quest chain', icon: '🏰', rarity: 'epic', unlocked: false },
  { id: 'quest-overlord', name: 'Full Stack Operative', description: 'Complete Operation Overlord quest', icon: '👑', rarity: 'legendary', unlocked: false },
  { id: 'geo-tracker', name: 'Geo Tracker', description: 'Complete Geospatial Pursuit', icon: '🗺️', rarity: 'rare', unlocked: false },
  { id: 'graph-detective', name: 'Graph Detective', description: 'Complete Graph Infiltration', icon: '🕸️', rarity: 'rare', unlocked: false },
  { id: 'wire-tapper', name: 'Wire Tapper', description: 'Complete Change Stream Stakeout', icon: '📡', rarity: 'rare', unlocked: false },
];

export const RANK_THRESHOLDS: { rank: string; minXP: number }[] = [
  { rank: 'Script Kiddie', minXP: 0 },
  { rank: 'Query Cadet', minXP: 500 },
  { rank: 'Replica Ranger', minXP: 1500 },
  { rank: 'Shard Commander', minXP: 3000 },
  { rank: 'Atlas Overlord', minXP: 5000 },
];

export const HACKER_ADJECTIVES = [
  'Shadow', 'Phantom', 'Cyber', 'Null', 'Binary', 'Rogue', 'Ghost', 'Neon',
  'Quantum', 'Stealth', 'Dark', 'Zero', 'Void', 'Glitch', 'Vector',
];

export const HACKER_NOUNS = [
  'Mongoose', 'Cursor', 'Shard', 'Replica', 'Pipeline', 'Atlas', 'Cluster',
  'Index', 'Document', 'Schema', 'Query', 'Oplog', 'Chunk', 'Node', 'Driver',
];

export function generateHandle(): string {
  const adj = HACKER_ADJECTIVES[Math.floor(Math.random() * HACKER_ADJECTIVES.length)];
  const noun = HACKER_NOUNS[Math.floor(Math.random() * HACKER_NOUNS.length)];
  const num = Math.floor(Math.random() * 99);
  return `${adj}${noun}${num}`;
}

export const MOCK_LEADERBOARD_PLAYERS = [
  { handle: 'PhantomShard42', xp: 4850, totalScore: 12400, completedMissions: 5, chaosEventsSurvived: 7 },
  { handle: 'CyberCursor99', xp: 4200, totalScore: 10800, completedMissions: 4, chaosEventsSurvived: 5 },
  { handle: 'NullPipeline7', xp: 3600, totalScore: 9200, completedMissions: 4, chaosEventsSurvived: 4 },
  { handle: 'GhostIndex33', xp: 3100, totalScore: 7900, completedMissions: 3, chaosEventsSurvived: 3 },
  { handle: 'VoidReplica88', xp: 2800, totalScore: 7100, completedMissions: 3, chaosEventsSurvived: 2 },
  { handle: 'StealthQuery56', xp: 2200, totalScore: 5600, completedMissions: 2, chaosEventsSurvived: 3 },
  { handle: 'DarkCluster11', xp: 1800, totalScore: 4500, completedMissions: 2, chaosEventsSurvived: 1 },
  { handle: 'NeonSchema77', xp: 1200, totalScore: 3000, completedMissions: 1, chaosEventsSurvived: 1 },
];
