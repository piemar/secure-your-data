import { WorkshopLabDefinition } from '@/types';

export const labGraphFraudDetectionDefinition: WorkshopLabDefinition = {
  id: 'lab-graph-fraud-detection',
  topicId: 'query',
  title: 'Graph-Based Fraud Detection',
  description:
    'Detect suspicious patterns using graph-style queries across accounts, devices, and transactions.',
  difficulty: 'advanced',
  estimatedTotalTimeMinutes: 35,
  tags: ['query', 'graph', 'fraud-detection'],
  prerequisites: ['lab-graph-traversal'],
  povCapabilities: ['GRAPH', 'RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-graph-fraud-step-1',
      title: 'Step 1: Model Fraud-Relevant Relationships',
      narrative:
        'Model entities such as accounts, devices, IP addresses, and transactions as a connected graph.',
      instructions:
        '- Insert sample documents for accounts, devices, and transactions.\n- Link entities using IDs and references.\n- Identify high-level fraud scenarios (shared devices, unusual paths).',
      estimatedTimeMinutes: 12,
      verificationId: 'graph.verifyFraudModel',
      points: 10,
    },
    {
      id: 'lab-graph-fraud-step-2',
      title: 'Step 2: Write Suspicious-Pattern Queries',
      narrative:
        'Use aggregations and $graphLookup to surface suspicious subgraphs or paths between entities.',
      instructions:
        '- Build aggregations that traverse from a suspicious account outwards.\n- Flag patterns such as many accounts sharing one device or IP.\n- Return sets of entities that merit manual review.',
      estimatedTimeMinutes: 12,
      verificationId: 'graph.verifyFraudQueries',
      points: 10,
    },
    {
      id: 'lab-graph-fraud-step-3',
      title: 'Step 3: Design an Analyst Playbook',
      narrative:
        'Translate your detection queries into a repeatable playbook for fraud analysts.',
      instructions:
        '- Document steps analysts should follow with your queries.\n- Show example query outputs and how to interpret them.\n- Capture limits and follow-up actions for production hardening.',
      estimatedTimeMinutes: 11,
      verificationId: 'graph.verifyFraudPlaybook',
      points: 10,
    },
  ],
};

