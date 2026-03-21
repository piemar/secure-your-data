import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-6',
    title: 'Rich Query Recon',
    codename: 'RICHQUERY',
    tier: 'recon',
    description: 'Master compound queries with nested fields, array operators, projections, and compound indexes on 1M customer records.',
    briefing: `INTEL BRIEFING\n\nA customer database with 1 million insurance records needs to be queried efficiently. Your targets: female customers born in 1990, living in Utah, with life insurance policies where the insured person is a smoker.\n\nBuild compound queries with $elemMatch on nested arrays, add projections to reduce payload, sort and paginate results, then create the perfect compound index to prove IXSCAN.\n\nSpeed is everything. The data analysts are waiting.`,
    objectives: [
      { id: 'obj-6-1', text: 'Build compound find() with $elemMatch on nested arrays', completed: false },
      { id: 'obj-6-2', text: 'Add projections to return only needed fields', completed: false },
      { id: 'obj-6-3', text: 'Sort and paginate results with sort/limit/skip', completed: false },
      { id: 'obj-6-4', text: 'Create compound index and verify IXSCAN with explain()', completed: false },
    ],
    timeLimit: 480,
    xpReward: 600,
    difficulty: 2,
    topic: 'query',
    povCapabilities: ['RICH-QUERY'],
    chaosEvents: [
      { id: 'chaos-6-1', title: '📈 QUERY SPIKE', description: 'Another team just fired 10,000 concurrent queries! Collection scans are killing the cluster.', triggerAt: 150, penalty: 100, duration: 45 },
    ],
  };
