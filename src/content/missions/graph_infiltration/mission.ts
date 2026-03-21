import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-14',
    title: 'Graph Infiltration',
    codename: 'GRAPHWEB',
    tier: 'infiltration',
    description: 'Traverse a social network graph with $graphLookup to uncover hidden connections and fraud rings.',
    briefing: `NETWORK ANALYSIS\n\nWe've mapped a suspected fraud ring through transaction patterns. The connections are buried in a social graph — friends of friends of friends. Your mission: use $graphLookup to traverse the relationship graph, find all connections up to 4 degrees of separation, detect cycles that indicate money laundering patterns.\n\nFollow the money. Find the ring.`,
    objectives: [
      { id: 'obj-14-1', text: 'Build $graphLookup to traverse connections', completed: false },
      { id: 'obj-14-2', text: 'Set maxDepth to limit traversal', completed: false },
      { id: 'obj-14-3', text: 'Filter results with restrictSearchWithMatch', completed: false },
      { id: 'obj-14-4', text: 'Identify fraud patterns in the graph output', completed: false },
    ],
    timeLimit: 600,
    xpReward: 850,
    difficulty: 3,
    topic: 'query',
    povCapabilities: ['GRAPH'],
    chaosEvents: [
      { id: 'chaos-14-1', title: '🕸️ RECURSIVE LOOP', description: 'Graph traversal hitting circular reference! Limit your depth or it will time out.', triggerAt: 250, penalty: 150, duration: 60 },
    ],
  };
