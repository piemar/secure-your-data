import { WorkshopLabDefinition } from '@/types';

/**
 * Rolling Updates Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/12/README.md (ROLLING-UPDATES)
 * Run read/write scripts, trigger Atlas upgrade, verify no data loss.
 */
export const labRollingUpdatesExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-rolling-updates-execute',
  topicId: 'operations',
  title: 'Rolling Updates: Execute Upgrade and Verify',
  description:
    'Run the reader and writer scripts side by side, trigger a major version upgrade in Atlas, and verify no data was lost or duplicated during the upgrade.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 25,
  tags: ['operations', 'rolling-updates', 'upgrade', 'verification'],
  prerequisites: [
    'lab-rolling-updates-setup completed (cluster, scripts)',
    'Cluster on older MongoDB version (e.g. 4.4)',
  ],
  povCapabilities: ['ROLLING-UPDATES'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/12',
  dataRequirements: [
    {
      id: 'read-write-scripts',
      description: 'read.py and write.py from proofs/12',
      type: 'file',
      path: 'read.py',
      sizeHint: '~3KB',
    },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-rolling-updates-execute-step-1',
      title: 'Step 1: Start Reader First, Then Writer',
      narrative:
        'Start read.py in the right terminal, then write.py in the left. Order matters: reader must be watching before writer starts, or MD5 hashes will not align. Verify matching seq and MD5 hashes.',
      instructions:
        'Terminal 1: ./read.py -c "mongodb+srv://cluster-xxx.mongodb.net" -u main_user. Terminal 2: ./write.py -c "mongodb+srv://cluster-xxx.mongodb.net" -u main_user -s 3. Verify: seq numbers and MD5 hashes match in both windows.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'rolling-updates.start-scripts',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-rolling-updates-execute-step-2',
      title: 'Step 2: Trigger Upgrade in Atlas',
      narrative:
        'With both scripts running, go to Atlas Console. Edit Configuration, change MongoDB version to the next major (e.g. 4.4 → 5.0), Apply Changes. The upgrade takes a few minutes. Watch both script windows—they should continue without exceptions.',
      instructions:
        'Atlas → Cluster → ... → Edit Configuration. Change version (e.g. 4.4 to 5.0). Apply Changes. Wait for upgrade to complete. Observe: scripts may briefly show "Cannot write" or "Cannot read" during election; retryWrites handles it. No exceptions if order was correct.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'rolling-updates.upgrade',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-rolling-updates-execute-step-3',
      title: 'Step 3: Verify No Data Loss',
      narrative:
        'After upgrade completes, compare both script outputs. Corresponding sequence numbers must have identical MD5 hashes. If any mismatch, reader was started after writer. No exceptions during upgrade indicates seamless rollout.',
      instructions:
        'Compare seq and MD5 in both windows. Each seq from writer should match reader. If hashes differ, restart read.py before write.py. No data lost, no duplicates. Document for proof report.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'rolling-updates.verify',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
