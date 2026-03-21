import { Mission } from '@/lib/types';

export const mission: Mission = {
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
    topic: 'query',
    povCapabilities: ['RICH-QUERY'],
    chaosEvents: [
      { id: 'chaos-1-1', title: '⚠ WRITE LOCK DETECTED', description: 'A background index build is blocking writes. Queries are queueing up!', triggerAt: 180, penalty: 100, duration: 60 },
    ],
  };
