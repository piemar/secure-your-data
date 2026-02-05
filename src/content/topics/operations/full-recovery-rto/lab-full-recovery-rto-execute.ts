import { WorkshopLabDefinition } from '@/types';

/**
 * Full Recovery RTO Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/14/README.md (FULL-RECOVERY-RTO)
 * Simulate disaster, restore from snapshot, measure RTO.
 */
export const labFullRecoveryRtoExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-full-recovery-rto-execute',
  topicId: 'operations',
  title: 'Full Recovery RTO: Execute Restore and Measure',
  description:
    'Delete all data to simulate disaster, restore from backup snapshot to the same cluster, and measure the Restore Time Objective (RTO) achieved.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['operations', 'backup', 'recovery', 'rto', 'disaster-recovery'],
  prerequisites: [
    'lab-full-recovery-rto-setup completed',
    '10 GB data in test.customers',
    'At least one backup snapshot',
  ],
  povCapabilities: ['FULL-RECOVERY-RTO'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/14',
  dataRequirements: [
    { id: 'customer360', type: 'file', path: 'Customer360Data.json', description: 'mgeneratejs template for customer docs', sizeHint: '~2KB' },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-full-recovery-rto-execute-step-1',
      title: 'Step 1: Simulate Disaster - Delete All Data',
      narrative:
        'In Atlas Console, delete the test database and its collections. This simulates a complete data loss disaster. Refresh to confirm no databases remain.',
      instructions:
        'Collections → test database → wastebasket → Delete. Confirm. Refresh. Cluster should show no databases.',
      estimatedTimeMinutes: 2,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'full-recovery-rto.simulate-disaster',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rto-execute-step-2',
      title: 'Step 2: Start Stopwatch and Initiate Restore',
      narrative:
        'Start a stopwatch (simulating ops team detecting the disaster). In Backup tab, select the most recent snapshot, choose Restore to existing cluster, and confirm.',
      instructions:
        'Start stopwatch. Backup → View All Snapshots → most recent → Restore or Download. Choose cluster to restore to → select current cluster → Restore → Confirm & Continue.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'full-recovery-rto.restore',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-full-recovery-rto-execute-step-3',
      title: 'Step 3: Wait for Restore and Verify',
      narrative:
        'Refresh the Atlas console until deployment status returns to active. Verify test.customers exists with 8,370,000 documents and ~10 GB. Stop the stopwatch—the elapsed time is the RTO achieved (~5 min for 10 GB on M40).',
      instructions:
        'Refresh until "We are deploying your changes" becomes active. Collections → test → customers. Verify: 8,370,000 docs, ~10 GB. Stop stopwatch. Record RTO.',
      estimatedTimeMinutes: 28,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'full-recovery-rto.verify',
      sourceProof: 'proofs/14/README.md',
      sourceSection: 'Execution',
    },
  ],
};
