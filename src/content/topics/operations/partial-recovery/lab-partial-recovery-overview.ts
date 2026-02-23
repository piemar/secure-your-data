import { WorkshopLabDefinition } from '@/types';

/**
 * Partial Recovery Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/15/README.md (PARTIAL-RECOVERY)
 * Recover a subset of data to the live database without downtime using PITR to temp cluster + export/import.
 */
export const labPartialRecoveryOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-partial-recovery-overview',
  topicId: 'operations',
  title: 'Partial Recovery Overview',
  description:
    'Learn how to recover a subset of accidentally deleted data back into the live database using PITR to a temporary cluster, mongoexport, and mongoimport—with zero application downtime.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['operations', 'backup', 'recovery', 'partial-recovery', 'pitr', 'mongoexport', 'mongoimport'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of backup and PITR concepts',
  ],
  povCapabilities: ['PARTIAL-RECOVERY'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    {
      term: 'Partial recovery',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      explanation: 'Restore only the lost subset of data (e.g. 100 customer records) into the live database, not a full cluster restore.',
    },
    {
      term: 'PITR to temp cluster',
      explanation: 'Point-in-time restore from the main cluster backup to a separate temporary cluster that holds the lost data at that point in time.',
    },
    {
      term: 'Export / import to live',
      explanation: 'Use mongoexport from the temp cluster to get the lost records, then mongoimport into the main (live) cluster—application keeps running.',
    },
    {
      term: 'No downtime',
      explanation: 'The live database and application (e.g. continuous insert script) stay up during the entire recovery process.',
    },
  ],
  steps: [
    {
      id: 'lab-partial-recovery-overview-step-1',
      title: 'Step 1: Understand Partial Recovery',
      narrative:
        'Partial recovery lets you restore only the data that was lost (e.g. 100 customer records) back into the live database. You use PITR to a temporary cluster to get a copy of the data at the point before the delete, then export and import just that subset.',
      instructions:
        '- Partial recovery = restore subset to live DB, not full cluster replace\n- Main cluster stays live; app keeps running\n- Temp cluster used only to get a copy of lost data at a point in time\n- mongoexport from temp → mongoimport to main',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'partial-recovery.concepts',
      sourceProof: 'proofs/15/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-partial-recovery-overview-step-2',
      title: 'Step 2: Partial Recovery Flow',
      narrative:
        'The proof loads 100 customer docs, runs a continuous-insert script (simulating live app), deletes the 100 docs, restores to a temp cluster at the point before the delete, exports the 100 from temp, imports them back into the main cluster. The app never stops.',
      instructions:
        '- Load 100 customer docs into test.customers\n- Run continuous-insert.py (keep it running)\n- Take snapshot so PITR is available\n- Delete the 100 customer docs\n- PITR restore to temp cluster (time before delete)\n- mongoexport from temp (query firstname exists) → lost_records.json\n- mongoimport into main cluster\n- Verify 100 docs restored; continuous insert never stopped',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'partial-recovery.flow',
      sourceProof: 'proofs/15/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-partial-recovery-overview-step-3',
      title: 'Step 3: Requirements (Main + Temp Clusters)',
      narrative:
        'You need a main cluster with Continuous Backup (for PITR) and a temp cluster (backup can be off). Same Atlas project, cloud provider, and region speeds up restore via DirectAttach.',
      instructions:
        '- Main cluster: M10, 100GB, Continuous Cloud Backup on\n- Temp cluster: M10, 100GB, Cloud Backup off\n- Same project, provider, region for faster PITR\n- main_user, IP whitelist, connection strings for both',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'partial-recovery.requirements',
      sourceProof: 'proofs/15/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
