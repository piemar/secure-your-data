import { WorkshopLabDefinition } from '@/types';

/**
 * Partial Recovery Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/15/README.md (PARTIAL-RECOVERY)
 * Verify 100 customers, delete them, PITR to temp cluster, mongoexport/mongoimport back to main, verify restoration.
 */
export const labPartialRecoveryExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-partial-recovery-execute',
  topicId: 'operations',
  title: 'Partial Recovery: Execute Restore and Verify',
  description:
    'Verify the 100 customer documents are present, note the time, delete them, perform PITR to the temp cluster, export the lost records, import them back into the main cluster, and verify—with the app still running.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['operations', 'backup', 'recovery', 'partial-recovery', 'pitr', 'mongoexport', 'mongoimport'],
  prerequisites: [
    'lab-partial-recovery-setup completed',
    'Continuous insert script running',
    'At least one snapshot on Main cluster',
  ],
  povCapabilities: ['PARTIAL-RECOVERY'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/15',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-partial-recovery-execute-step-1',
      title: 'Step 1: Verify 100 Customers Present and Note Time',
      narrative:
        'In the Mongo Shell connected to the Main cluster, confirm test.customers has the 100 customer documents (firstname exists) and that the total count is increasing due to continuous insert. Write down the current time (e.g. 11:20) and wait for the next minute to start the delete.',
      instructions:
        'Open Mongo Shell to Main cluster. use test; db.customers.find({firstname: {$exists:true}}).count()  // 100. db.customers.count()  // >100 and growing. Write down time (e.g. 11:20), wait for next minute (e.g. 11:21). Keep shell open for later steps.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'partial-recovery.verify-present',
      sourceProof: 'proofs/15/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-partial-recovery-execute-step-2',
      title: 'Step 2: Delete the 100 Customer Documents',
      narrative:
        'In the same Mongo Shell session, delete the 100 customer documents. The continuous-insert script keeps adding other documents; only the 100 with firstname are removed.',
      instructions:
        'In open shell: db.customers.remove({firstname: {$exists:true}}). Verify: db.customers.find({firstname: {$exists:true}}).count()  // 0. db.customers.count()  // still >0 (other docs from script).',
      estimatedTimeMinutes: 2,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'partial-recovery.delete-docs',
      sourceProof: 'proofs/15/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-partial-recovery-execute-step-3',
      title: 'Step 3: PITR to Temp, Export, Import Back to Main',
      narrative:
        'In Atlas Backup for the Main cluster, run Point-in-Time Restore to the time you noted (convert to UTC). Target cluster = Temp. After restore completes, use mongoexport from Temp (query firstname exists) to lost_records.json, then mongoimport into Main. Verify 100 customers are back.',
      instructions:
        'Backup → Point in Time Restore → set time (UTC) → Target: Temp cluster. Wait for restore (~10 min). From laptop: mongoexport --uri "temp-srv" --collection customers --query \'{"firstname":{"$exists":true}}\' --out lost_records.json. mongoimport --uri "main-srv" --collection customers --file lost_records.json. In shell: db.customers.find({firstname: {$exists:true}}).count()  // 100. Confirm continuous-insert.py still running.',
      estimatedTimeMinutes: 23,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'partial-recovery.pitr-export-import',
      sourceProof: 'proofs/15/README.md',
      sourceSection: 'Execution',
    },
  ],
};
