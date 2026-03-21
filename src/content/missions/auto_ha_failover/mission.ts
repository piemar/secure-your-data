import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-10',
    title: 'Auto-HA Failover',
    codename: 'FAILOVER',
    tier: 'infiltration',
    description: 'Test automatic high availability: trigger failover and prove retryable writes make it transparent.',
    briefing: `HIGH AVAILABILITY DRILL\n\nCommand wants proof that our database survives primary failure. Your mission: connect without retryable writes and measure the downtime during failover. Then reconnect WITH retryable writes and prove zero visible disruption.\n\nTrigger the failover. Measure. Prove resilience.`,
    objectives: [
      { id: 'obj-10-1', text: 'Check replica set status and identify PRIMARY', completed: false },
      { id: 'obj-10-2', text: 'Connect without retryable writes (baseline)', completed: false },
      { id: 'obj-10-3', text: 'Enable retryable writes and reads', completed: false },
      { id: 'obj-10-4', text: 'Verify failover recovery is transparent', completed: false },
    ],
    timeLimit: 600,
    xpReward: 800,
    difficulty: 3,
    topic: 'operations',
    povCapabilities: ['AUTO-HA'],
    chaosEvents: [
      { id: 'chaos-10-1', title: '🔄 UNEXPECTED FAILOVER', description: 'The primary just stepped down! Was your app prepared?', triggerAt: 200, penalty: 150, duration: 60 },
    ],
  };
