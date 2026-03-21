import { Mission } from '@/lib/types';

export const mission: Mission = {
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
    topic: 'scalability',
    povCapabilities: ['SCALE-OUT'],
    chaosEvents: [
      { id: 'chaos-2-1', title: '🔥 REPLICA SET MEMBER DOWN', description: 'Secondary member rs2-b has crashed! Failover in progress...', triggerAt: 240, penalty: 200, duration: 90 },
      { id: 'chaos-2-2', title: '⚡ NETWORK PARTITION', description: 'Network split detected between rs1 and rs2. Reads are failing!', triggerAt: 500, penalty: 150, duration: 60 },
    ],
  };
