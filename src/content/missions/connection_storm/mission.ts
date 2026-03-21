import { Mission } from '@/lib/types';

export const mission: Mission = {
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
    topic: 'scalability',
    povCapabilities: ['CONSISTENCY'],
    chaosEvents: [
      { id: 'chaos-4-1', title: '🌊 SECOND WAVE INCOMING', description: 'Connection count doubled! Another 10K connections hitting the cluster!', triggerAt: 300, penalty: 200, duration: 120 },
    ],
  };
