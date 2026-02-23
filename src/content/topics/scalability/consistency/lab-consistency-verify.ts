import { WorkshopLabDefinition } from '@/types';

/**
 * Consistency: Verification & Failover Test
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/06/README.md (CONSISTENCY)
 * Run the consistency verification script, verify results, and test behavior during failover.
 */
export const labConsistencyVerifyDefinition: WorkshopLabDefinition = {
  id: 'lab-consistency-verify',
  topicId: 'scalability',
  title: 'Consistency: Verification & Failover Test',
  description:
    'Run the update-and-check script that verifies strong consistency (write on primary, read on secondary). Induce a failover and confirm no consistency errors occur.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 40,
  tags: ['consistency', 'verification', 'failover', 'read-concern'],
  prerequisites: [
    'Completed lab-consistency-sharded-setup (1M records loaded)',
    'Python 3 with pymongo installed',
    'Atlas cluster with Test Failover capability',
  ],
  povCapabilities: ['CONSISTENCY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/06',
  dataRequirements: [
    {
      id: 'update-and-check-script',
      description: 'Consistency verification script (update + read from secondary)',
      type: 'script',
      path: 'updateAndCheckPeople.py',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '5KB',
    },
    {
      id: 'people-collection',
      description: '1M person documents from lab-consistency-sharded-setup',
      type: 'collection',
      namespace: 'world.people',
      sizeHint: '~200MB',
    },
  ],
  steps: [
    {
      id: 'lab-consistency-verify-step-1',
      title: 'Step 1: Run Consistency Verification Script',
      narrative:
        'The updateAndCheckPeople.py script launches 8 processes. Each process: 1) updates a random document\'s age on the primary, 2) reads the same document from a secondary, 3) verifies the read value matches the written value. Uses causal consistency sessions for read-your-writes guarantees.',
      instructions:
        '- From the proof folder: `./updateAndCheckPeople.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"`\n- The script runs indefinitely; let it run for several minutes\n- Results are logged to consistency.log\n- Recommended: run from an EC2 VM in the same region as Atlas for high read/write rate',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'consistency.run-script',
      sourceProof: 'proofs/06/README.md',
      sourceSection: 'Execution',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-consistency-verify-step-2',
      title: 'Step 2: Verify No Consistency Errors',
      narrative:
        'Check the consistency.log file. With proper driver settings (writeConcern:majority, readConcern:majority, causal consistency), the log should contain only OK entries. Any mismatch between written and read values would be logged as CONSISTENCY ERROR.',
      instructions:
        '- View recent log entries: `head consistency.log`\n- Expected format: `OK - HH:MM:SS - process N - index X - loop Y - wrote $age=A read $age=A`\n- Check for consistency errors: `grep CONSISTENCY consistency.log`\n- Expected: no output (no consistency issues)\n- If errors exist, review driver settings (writeConcern, readConcern, causal_consistency)',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'consistency.verifyLog',
      points: 15,
      enhancementId: 'consistency.verify-log',
      sourceProof: 'proofs/06/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
    {
      id: 'lab-consistency-verify-step-3',
      title: 'Step 3: Induce Failover and Observe',
      narrative:
        'While the script is running, trigger Atlas Test Failover. Observe that connection errors occur during the election, but the script retries and continues. After failover, consistency is maintained—no CONSISTENCY ERROR entries should appear.',
      instructions:
        '- With updateAndCheckPeople.py running, open Atlas console\n- Navigate to your cluster → Test Failover\n- Trigger the failover\n- Observe script output: "not master", "Connection refused", "READ ERROR" messages are expected during failover\n- After failover completes, script continues normally\n- Run `grep CONSISTENCY consistency.log` again—should still show no errors',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 20,
      enhancementId: 'consistency.failover-test',
      sourceProof: 'proofs/06/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
  ],
};
