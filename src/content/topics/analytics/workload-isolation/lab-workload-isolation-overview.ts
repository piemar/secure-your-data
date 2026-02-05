import { WorkshopLabDefinition } from '@/types';

/**
 * Workload Isolation Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/05/README.md (WORKLOAD-ISOLATION)
 * Introduces MongoDB's ability to isolate analytical workloads from operational CRUD
 * on the same cluster using replica set tags and read preferences.
 */
export const labWorkloadIsolationOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-workload-isolation-overview',
  topicId: 'analytics',
  title: 'Workload Isolation Overview',
  description:
    'Learn how MongoDB isolates analytical aggregations from operational CRUD on the same cluster using replica set tags and read preferences, enabling both workloads to run with appropriate performance.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['workload-isolation', 'analytics', 'replica-set', 'read-preference'],
  prerequisites: [
    'MongoDB Atlas M30+ cluster (3-node replica set)',
    'Basic understanding of replica sets and aggregation',
  ],
  povCapabilities: ['WORKLOAD-ISOLATION'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Workload Isolation', explanation: 'Separate analytical aggregations from operational CRUD on the same cluster.' },
    { term: 'Replica Set Tags', explanation: 'Tag nodes (e.g. nodeType:ANALYTICS) to designate analytics-only secondaries.' },
    { term: 'Read Preference Tags', explanation: 'Route aggregation queries to tagged analytics nodes via readPreferenceTags.' },
    { term: 'Analytics Nodes', explanation: 'Read-only secondaries that do not participate in elections; dedicated for heavy queries.' },
  ],
  steps: [
    {
      id: 'lab-workload-isolation-overview-step-1',
      title: 'Step 1: Understand Workload Isolation Concepts',
      narrative:
        'MongoDB can run aggregations and CRUD operations on the same cluster. Without isolation, heavy analytical queries can impact latency-sensitive transactional workloads. Workload isolation uses replica set tags to designate specific nodes for analytics, then routes aggregation queries to those nodes via read preference tags.',
      instructions:
        '- Review the concept of replica set members (primary + secondaries)\n- Understand that analytical queries (aggregations) can be CPU-intensive\n- Learn that read preference tags allow routing reads to specific secondaries\n- Identify the benefit: operational traffic stays on primary/electable nodes; analytics runs on dedicated analytics nodes',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'workload-isolation.concepts',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Description',
    },
    {
      id: 'lab-workload-isolation-overview-step-2',
      title: 'Step 2: Atlas Cluster Topology for Workload Isolation',
      narrative:
        'To enable workload isolation, you need an M30+ cluster with at least 2 analytical nodes in addition to the 3 electable nodes. The analytical nodes are tagged (e.g., nodeType:ANALYTICS) and do not participate in elections.',
      instructions:
        '- Log into MongoDB Atlas and navigate to your project\n- Create or identify an M30+ cluster with 3 electable nodes\n- Add at least 2 analytical nodes via the cluster configuration\n- Verify the topology: 5 total nodes (3 electable + 2 analytical)\n- Note: Analytical nodes are read-only secondaries with a special tag',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'workload-isolation.atlas-topology',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Setup - Configure Atlas Environment',
    },
    {
      id: 'lab-workload-isolation-overview-step-3',
      title: 'Step 3: Read Preference Tags and Query Routing',
      narrative:
        'Applications use read preference with tags to route aggregation queries to analytics nodes. For example, readPreference="secondaryPreferred" with readPreferenceTags="nodeType:ANALYTICS" sends reads to the tagged analytics nodes, while writes always go to the primary.',
      instructions:
        '- Understand readPreference options: primary, primaryPreferred, secondary, secondaryPreferred, nearest\n- Learn how readPreferenceTags filters which secondaries can receive reads\n- For analytics: use secondaryPreferred + nodeType:ANALYTICS to target analytics nodes\n- For operational: use primary (default) so CRUD goes to primary\n- Result: two workloads run on different nodes with no interference',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'workload-isolation.read-preference-tags',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Execution',
    },
  ],
};
