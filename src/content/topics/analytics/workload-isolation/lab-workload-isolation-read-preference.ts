import { WorkshopLabDefinition } from '@/types';

/**
 * Workload Isolation: Read Preference & Dual Workload
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/05/README.md (WORKLOAD-ISOLATION)
 * Run operational (update) and analytical (aggregation) workloads in parallel and verify
 * isolation via Atlas Metrics.
 */
export const labWorkloadIsolationReadPreferenceDefinition: WorkshopLabDefinition = {
  id: 'lab-workload-isolation-read-preference',
  topicId: 'analytics',
  title: 'Workload Isolation: Read Preference & Dual Workload',
  description:
    'Run a continuous update workload against the primary and a continuous aggregation workload against analytics nodes. Verify in Atlas Metrics that the two workloads are isolated.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['workload-isolation', 'read-preference', 'aggregation', 'metrics'],
  prerequisites: [
    'M30+ cluster with analytics nodes and sample data loaded',
    'Python 3 with pymongo and dnspython installed',
    'Completed lab-workload-isolation-replica-tags',
  ],
  povCapabilities: ['WORKLOAD-ISOLATION'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/05',
  dataRequirements: [
    {
      id: 'update-docs-py',
      description: 'Operational update workload script',
      type: 'script',
      path: 'update_docs.py',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '3KB',
    },
    {
      id: 'query-docs-py',
      description: 'Analytical aggregation workload script',
      type: 'script',
      path: 'query_docs.py',
      sizeHint: '3KB',
    },
    {
      id: 'customers-collection',
      description: 'Customer data from lab-workload-isolation-replica-tags',
      type: 'collection',
      namespace: 'acme_inc.customers',
      sizeHint: '~500MB',
    },
  ],
  steps: [
    {
      id: 'lab-workload-isolation-read-preference-step-1',
      title: 'Step 1: Run Operational Update Workload',
      narrative:
        'Start the update script that performs continuous random updates against the primary. This simulates an operational/transactional workload (e.g., order updates, inventory changes).',
      instructions:
        '- Install Python dependencies: `pip3 install pymongo dnspython`\n- Run the update script with your connection string: `./update_docs.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"`\n- The script bulk-updates ~1k documents per cycle against the primary\n- Leave this running in a terminal; it runs indefinitely\n- Writes always go to the primary regardless of read preference',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'workload-isolation.update-script',
      sourceProof: 'proofs/05/README.md',
      sourceSection: 'Execution - Update Workload',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-workload-isolation-read-preference-step-2',
      title: 'Step 2: Run Analytical Aggregation Workload',
      narrative:
        'Start the query script that performs continuous aggregations with read preference tags targeting analytics nodes. This workload uses secondaryPreferred + nodeType:ANALYTICS so reads go to the tagged analytics secondaries.',
      instructions:
        '- In a separate terminal, run: `./query_docs.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"`\n- The script runs aggregation pipelines (e.g., $match + $bucket) repeatedly\n- It uses readPreference="secondaryPreferred" and readPreferenceTags="nodeType:ANALYTICS"\n- Leave this running alongside the update script\n- Both workloads run in parallel on different nodes',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'workload-isolation.query-script',
      sourceProof: 'proofs/05/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution - Query Workload',
    },
    {
      id: 'lab-workload-isolation-read-preference-step-3',
      title: 'Step 3: Verify Isolation in Atlas Metrics',
      narrative:
        'After running both workloads for at least 10 minutes, check Atlas Metrics to confirm that aggregation queries target only the analytics nodes, while the electable replicas handle the update workload.',
      instructions:
        '- Navigate to Atlas → your cluster → Metrics tab\n- View Query Targeting, Query Executor, and Scan & Order metrics\n- Toggle members to see each replica\n- Verify: aggregation queries appear only on analytics nodes\n- Verify: electable nodes show update/write activity, not aggregation traffic\n- This proves workload isolation: analytics and operational traffic are separated',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'workload-isolation.verifyMetrics',
      points: 20,
      enhancementId: 'workload-isolation.metrics-verification',
      sourceProof: 'proofs/05/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
