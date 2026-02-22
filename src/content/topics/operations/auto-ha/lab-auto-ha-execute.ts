import { WorkshopLabDefinition } from '@/types';

/**
 * AUTO-HA Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/17/README.md (AUTO-HA)
 * Run continuous insert/read apps, trigger Atlas Test Failover, measure recovery time, then demonstrate retryable writes/reads.
 */
export const labAutoHaExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-ha-execute',
  topicId: 'operations',
  title: 'AUTO-HA Execute',
  description:
    'Run the AUTO-HA proof: start continuous insert and read applications, trigger a test failover in Atlas, measure downtime, then run again with retryable writes and reads to see no visible disruption.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 15,
  tags: ['operations', 'ha', 'failover', 'atlas', 'retryable-writes'],
  prerequisites: ['Lab: AUTO-HA Setup completed', 'Atlas M10 replica set and connection string', 'Python scripts ready'],
  povCapabilities: ['AUTO-HA'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/17',
  steps: [
    {
      id: 'lab-auto-ha-execute-step-1',
      title: 'Step 1: Run apps without retry (baseline)',
      narrative:
        'Start the continuous-insert and continuous-read Python scripts with retryWrites=false and retryReads=false in the connection string. Confirm they connect and report inserts/reads.',
      instructions:
        '- In two terminals, run continuous-insert.py and continuous-read.py with the Atlas URI and retryWrites=false, retryReads=false\n- Verify output shows successful connection and ongoing inserts/reads',
      estimatedTimeMinutes: 4,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'auto-ha.run-without-retry',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-auto-ha-execute-step-2',
      title: 'Step 2: Trigger failover and measure downtime',
      narrative:
        'Use the Atlas console Test Failover feature to force the primary to fail. Watch the application output for DB-CONNECTION-PROBLEM and RECONNECTED-TO-DB; the time between them is the measured downtime (e.g. under 4 seconds).',
      instructions:
        '- In Atlas: cluster → ... → Test Failover; confirm the dialog\n- In terminal output, note the timestamp of the last INSERT before DB-CONNECTION-PROBLEM and the first INSERT after RECONNECTED-TO-DB\n- Calculate downtime (e.g. 3.2 seconds); then stop the apps (Ctrl-C)',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-ha.trigger-failover',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-auto-ha-execute-step-3',
      title: 'Step 3: Run with retryable writes and reads',
      narrative:
        'Restart the applications with retryWrites=true and retryReads=true in the URI. Trigger Test Failover again; the application output should not show connection errors—the driver retries transparently.',
      instructions:
        '- Restart continuous-insert.py and continuous-read.py with retryWrites=true and retryReads=true (and optional "retry" argument if the scripts support it)\n- Trigger Test Failover again from Atlas\n- Observe that no DB-CONNECTION-PROBLEM is reported; failover is transparent to the app',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-ha.run-with-retry',
      sourceProof: 'proofs/17/README.md',
      sourceSection: 'Execution',
    },
  ],
};
