import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-8',
    title: 'Analytics Extraction',
    codename: 'ANALYTICS',
    tier: 'recon',
    description: 'Run in-place analytics with aggregation pipelines while isolating workloads to protect production reads.',
    briefing: `DATA EXTRACTION REQUEST\n\nThe business team needs real-time revenue analytics — total, average, min, max by category and time period. But the CRUD workload on the primary is already at 80% capacity.\n\nYour mission: build aggregation pipelines for in-place analytics, group by time dimensions, and route analytics queries to secondary replicas using read preferences to achieve workload isolation.\n\nDon't let analytics kill production.`,
    objectives: [
      { id: 'obj-8-1', text: 'Build aggregation pipeline with $group and accumulators', completed: false },
      { id: 'obj-8-2', text: 'Add time-based grouping with $year/$month', completed: false },
      { id: 'obj-8-3', text: 'Configure read preference for workload isolation', completed: false },
    ],
    timeLimit: 420,
    xpReward: 550,
    difficulty: 2,
    topic: 'analytics',
    povCapabilities: ['IN-PLACE-ANALYTICS', 'WORKLOAD-ISOLATION'],
    chaosEvents: [
      { id: 'chaos-8-1', title: '📊 PIPELINE OVERFLOW', description: 'Aggregation is consuming too much memory! Consider allowDiskUse.', triggerAt: 180, penalty: 100, duration: 45 },
    ],
  };
