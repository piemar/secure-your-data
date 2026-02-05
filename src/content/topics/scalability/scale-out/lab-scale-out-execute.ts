import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Out: Execution and Verification
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/07/README.md (SCALE-OUT)
 * Run the scale-out test (automated or manual), add shards, and visualize results in Atlas Charts.
 */
export const labScaleOutExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-out-execute',
  topicId: 'scalability',
  title: 'Scale-Out: Execution and Verification',
  description:
    'Run the scale-out proof in automated or manual mode, observe shard addition during sustained load, and visualize metrics in Atlas Charts.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 90,
  tags: ['scale-out', 'execution', 'atlas-charts', 'metrics'],
  prerequisites: [
    'Completed lab-scale-out-setup',
    'Atlas cluster (2 shards, M40, or use automated creation)',
    'EC2 instance with proof scripts configured',
  ],
  povCapabilities: ['SCALE-OUT'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/07',
  dataRequirements: [
    {
      id: 'test-results',
      description: 'Metrics collection (batch_execution_times, chunk_counts, disk_sizes)',
      type: 'collection',
      namespace: 'test_results.test_results',
      sizeHint: 'grows during run',
    },
  ],
  steps: [
    {
      id: 'lab-scale-out-execute-step-1',
      title: 'Step 1: Run Automated or Manual Test',
      narrative:
        'Automated mode: `make automatic` creates a 2-shard cluster, injects load, and adds shards (2→3→4) via the Atlas API. Manual mode: provision cluster in Atlas UI first, then `make manual` runs load and metrics only—you add shards manually.',
      instructions:
        '- Automated: `make automatic` (takes ~2 hours, inserts 1B docs, creates cluster via API)\n- Manual: Create 2-shard M40 cluster in Atlas, then `make manual`\n- Let load run 15 min before adding shards (manual mode)\n- Allow 20 min after shard increase for balancer to settle\n- Script logs progress; results written to test_results.test_results',
      estimatedTimeMinutes: 30,
      modes: ['lab', 'demo', 'challenge'],
      points: 15,
      enhancementId: 'scale-out.run-test',
      sourceProof: 'proofs/07/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-scale-out-execute-step-2',
      title: 'Step 2: Inspect Test Results',
      narrative:
        'Results are stored in test_results.test_results. Each document contains batch_execution_times, chunk_counts, and disk_sizes arrays. Use {latest: true} to find the most recent run.',
      instructions:
        '- Connect with mongosh to your cluster\n- `use test_results`\n- `db.test_results.find({latest: true}).pretty()`\n- Review test_data.batch_execution_times (ts, duration, total_docs)\n- Review test_data.chunk_counts (ts, chunk_counts per shard)\n- Review test_data.disk_sizes (ts, disk_total, disk_used)',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'scale-out.inspect-results',
      sourceProof: 'proofs/07/README.md',
      sourceSection: 'Measurement',
    },
    {
      id: 'lab-scale-out-execute-step-3',
      title: 'Step 3: Visualize with Atlas Charts',
      narrative:
        'Create Atlas Charts with filter {latest: true} to visualize batch execution times, chunk counts, disk capacity, and disk used. The charts demonstrate that response times stay constant while capacity grows as shards are added.',
      instructions:
        '- Atlas Console → Charts → Create Chart\n- Data source: test_results.test_results, filter: {latest: true}\n- Chart 1: batch_execution_times - X: ts, Y: duration (insert latency over time)\n- Chart 2: chunk_counts - show balancer activity\n- Chart 3: disk_sizes - disk_total (capacity grows with shards)\n- Chart 4: disk_sizes - disk_used (data grows continuously)\n- Expected: latency roughly constant; capacity increases when shards added',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'scale-out.verifyCharts',
      points: 20,
      enhancementId: 'scale-out.atlas-charts',
      sourceProof: 'proofs/07/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
