import { Mission, Achievement } from './types';

export const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    title: 'The Phantom Index',
    codename: 'PHANTOM',
    tier: 'recon',
    description: 'Diagnose why queries are running 100x slower than expected on a collection with 50 million documents.',
    briefing: `INCOMING TRANSMISSION...\n\nAgent, we've detected anomalous query latency on Collection ALPHA-7. Response times have spiked from 2ms to 15 seconds. The data pipeline is hemorrhaging. Intel suggests missing compound indexes — but something else is wrong. Your mission: analyze the explain() output, identify the collection scan, create the optimal index, and restore query performance before the pipeline collapses.\n\nTime is critical. Good luck.`,
    objectives: [
      { id: 'obj-1-1', text: 'Analyze the slow query explain() output', completed: false },
      { id: 'obj-1-2', text: 'Identify the missing compound index', completed: false },
      { id: 'obj-1-3', text: 'Create the optimal index strategy', completed: false },
      { id: 'obj-1-4', text: 'Verify query performance improvement', completed: false },
    ],
    timeLimit: 600,
    xpReward: 500,
    difficulty: 2,
    chaosEvents: [
      {
        id: 'chaos-1-1',
        title: '⚠ WRITE LOCK DETECTED',
        description: 'A background index build is blocking writes. Queries are queueing up!',
        triggerAt: 180,
        penalty: 100,
        duration: 60,
      },
    ],
  },
  {
    id: 'mission-2',
    title: 'Shard Under Siege',
    codename: 'SIEGE',
    tier: 'infiltration',
    description: 'A shard is failing under load. Rebalance data across the cluster before total collapse.',
    briefing: `PRIORITY ONE ALERT\n\nShard rs2 is at 95% capacity and climbing. The chunk balancer has stalled, and data distribution is critically skewed. Three microservices are timing out. You need to manually trigger chunk migration, rebalance the shard key ranges, and stabilize the cluster — all while live traffic continues to flow.\n\nDo NOT let the shard go down.`,
    objectives: [
      { id: 'obj-2-1', text: 'Assess shard distribution with sh.status()', completed: false },
      { id: 'obj-2-2', text: 'Identify the hot shard and uneven chunk ranges', completed: false },
      { id: 'obj-2-3', text: 'Initiate manual chunk migration', completed: false },
      { id: 'obj-2-4', text: 'Verify balanced distribution across all shards', completed: false },
      { id: 'obj-2-5', text: 'Confirm all services are responding', completed: false },
    ],
    timeLimit: 900,
    xpReward: 1000,
    difficulty: 4,
    chaosEvents: [
      {
        id: 'chaos-2-1',
        title: '🔥 REPLICA SET MEMBER DOWN',
        description: 'Secondary member rs2-b has crashed! Failover in progress...',
        triggerAt: 240,
        penalty: 200,
        duration: 90,
      },
      {
        id: 'chaos-2-2',
        title: '⚡ NETWORK PARTITION',
        description: 'Network split detected between rs1 and rs2. Reads are failing!',
        triggerAt: 500,
        penalty: 150,
        duration: 60,
      },
    ],
  },
  {
    id: 'mission-3',
    title: 'The Aggregation Heist',
    codename: 'PIPELINE',
    tier: 'recon',
    description: 'Build a complex aggregation pipeline to extract critical intel from deeply nested documents.',
    briefing: `DECRYPTION COMPLETE\n\nWe've intercepted a data dump with 2 million nested documents. The intel is buried deep — nested arrays within arrays, polymorphic schemas, and no two documents are alike. Your mission: construct an aggregation pipeline using $unwind, $lookup, $facet, and $merge to extract the target data and prepare it for analysis.\n\nThe data self-destructs in 8 minutes.`,
    objectives: [
      { id: 'obj-3-1', text: 'Analyze the document schema structure', completed: false },
      { id: 'obj-3-2', text: 'Build the $unwind and $match stages', completed: false },
      { id: 'obj-3-3', text: 'Add $lookup for cross-collection joins', completed: false },
      { id: 'obj-3-4', text: 'Implement $facet for parallel aggregations', completed: false },
      { id: 'obj-3-5', text: 'Output results with $merge', completed: false },
    ],
    timeLimit: 480,
    xpReward: 750,
    difficulty: 3,
    chaosEvents: [
      {
        id: 'chaos-3-1',
        title: '💾 MEMORY LIMIT HIT',
        description: 'Aggregation exceeding 100MB memory limit! Enable allowDiskUse or optimize.',
        triggerAt: 200,
        penalty: 100,
        duration: 45,
      },
    ],
  },
  {
    id: 'mission-4',
    title: 'Connection Storm',
    codename: 'STORM',
    tier: 'infiltration',
    description: 'Handle a sudden 10,000 connection spike without dropping a single request.',
    briefing: `SURGE DETECTED\n\nConnections are flooding in — 10,000 simultaneous clients hammering the cluster. Connection pools are maxed, the driver is throwing "pool exhausted" errors, and the application layer is starting to cascade fail. Configure connection pooling, implement retry logic, and set up proper timeout strategies before everything goes dark.\n\nEvery millisecond counts.`,
    objectives: [
      { id: 'obj-4-1', text: 'Diagnose connection pool exhaustion', completed: false },
      { id: 'obj-4-2', text: 'Configure optimal pool size settings', completed: false },
      { id: 'obj-4-3', text: 'Implement exponential backoff retry logic', completed: false },
      { id: 'obj-4-4', text: 'Set server selection and socket timeouts', completed: false },
    ],
    timeLimit: 720,
    xpReward: 850,
    difficulty: 3,
    chaosEvents: [
      {
        id: 'chaos-4-1',
        title: '🌊 SECOND WAVE INCOMING',
        description: 'Connection count doubled! Another 10K connections hitting the cluster!',
        triggerAt: 300,
        penalty: 200,
        duration: 120,
      },
    ],
  },
  {
    id: 'mission-5',
    title: 'The Schema Saboteur',
    codename: 'SABOTEUR',
    tier: 'exfiltration',
    description: 'Find and fix schema validation issues planted by a rogue insider across 5 collections.',
    briefing: `INSIDER THREAT CONFIRMED\n\nA rogue developer has sabotaged schema validation rules across 5 critical collections. Invalid documents are being inserted, data integrity is compromised, and downstream services are consuming corrupted data. Hunt down every tampered validation rule, restore proper JSON Schema validators, and ensure no more bad data gets through.\n\nTrust no document.`,
    objectives: [
      { id: 'obj-5-1', text: 'Audit all collection validators', completed: false },
      { id: 'obj-5-2', text: 'Identify tampered validation rules', completed: false },
      { id: 'obj-5-3', text: 'Fix validation on users collection', completed: false },
      { id: 'obj-5-4', text: 'Fix validation on transactions collection', completed: false },
      { id: 'obj-5-5', text: 'Fix validation on sessions collection', completed: false },
      { id: 'obj-5-6', text: 'Verify all validators reject invalid documents', completed: false },
    ],
    timeLimit: 1200,
    xpReward: 1500,
    difficulty: 5,
    chaosEvents: [
      {
        id: 'chaos-5-1',
        title: '🕵️ INSIDER STILL ACTIVE',
        description: 'The saboteur just changed another validator! Check the orders collection!',
        triggerAt: 400,
        penalty: 300,
        duration: 120,
      },
      {
        id: 'chaos-5-2',
        title: '📊 DATA CORRUPTION SPREADING',
        description: 'Invalid documents detected in analytics pipeline. Corruption rate: 23%',
        triggerAt: 700,
        penalty: 250,
        duration: 90,
      },
    ],
  },
];

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
