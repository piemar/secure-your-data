import { Quest } from '@/lib/types';
import { MISSIONS } from '@/content/missions';

export const quest: Quest = {
    id: 'quest-scale-wars',
    title: 'Scale Wars',
    codename: 'OPERATION HORIZON',
    description: 'Push MongoDB to its limits — connection storms, sharding, and horizontal scaling under fire.',
    storyIntro: `OPERATION HORIZON\n\nThe data is growing exponentially. Connections are spiking. The cluster needs to scale horizontally. This quest chain takes you through connection management, shard rebalancing, and full scale-out operations — all under chaos event pressure.`,
    storyOutro: `SCALE WARS WON\n\nFrom 10,000 connections to petabytes of sharded data — you scaled it all. The cluster is balanced, resilient, and ready for whatever comes next.`,
    missionIds: ['mission-4', 'mission-2', 'mission-9'],
    bonusXp: 600,
    icon: '⚔️',
    requiredMissions: 3,
  };
