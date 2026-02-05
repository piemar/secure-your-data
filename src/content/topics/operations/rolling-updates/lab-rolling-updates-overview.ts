import { WorkshopLabDefinition } from '@/types';

/**
 * Rolling Updates Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/12/README.md (ROLLING-UPDATES)
 * Introduces MongoDB Atlas ability to apply patches without scheduled downtime.
 */
export const labRollingUpdatesOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-rolling-updates-overview',
  topicId: 'operations',
  title: 'Rolling Updates Overview',
  description:
    'Learn how MongoDB Atlas applies upgrades and patches without scheduled downtime. Applications continue reading and writing during the upgrade process.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['operations', 'rolling-updates', 'upgrade', 'patches', 'zero-downtime'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of replica sets',
  ],
  povCapabilities: ['ROLLING-UPDATES'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Rolling Upgrade', explanation: 'Cluster members upgraded one at a time; primary steps down, secondary upgraded and promoted.' },
    { term: 'Zero-Downtime', explanation: 'Applications continue reading and writing during the upgrade process.' },
    { term: 'Replica Set', explanation: 'Primary and secondaries; upgrade rotates through members without scheduled maintenance.' },
    { term: 'retryWrites', explanation: 'Driver automatically retries writes during brief election when primary steps down.' },
  ],
  steps: [
    {
      id: 'lab-rolling-updates-overview-step-1',
      title: 'Step 1: Understand Zero-Downtime Upgrades',
      narrative:
        'MongoDB Atlas upgrades and patches cluster members one at a time in a rolling fashion. The primary is stepped down, a secondary is upgraded and promoted, and the process continues until all members are upgraded. Applications experience no scheduled downtime.',
      instructions:
        '- Review rolling upgrade flow: replica set members upgraded one by one\n- Primary stepdown: brief election, new primary serves traffic\n- retryWrites: driver automatically retries writes during election\n- Identify the benefit: no maintenance windows, no application changes',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'rolling-updates.concepts',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Description',
    },
    {
      id: 'lab-rolling-updates-overview-step-2',
      title: 'Step 2: Verification with Read/Write Scripts',
      narrative:
        'The proof uses a writer script that inserts data and a reader script that watches via change streams. Both compute MD5 hashes. If hashes match before, during, and after upgrade, no data was lost or duplicated.',
      instructions:
        '- Writer: inserts random data, outputs seq + MD5 per insert\n- Reader: change stream watches for inserts, outputs seq + MD5\n- Start reader before writer (order matters for hash alignment)\n- Verify: matching hashes prove no data loss during upgrade',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rolling-updates.verification',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Execution',
    },
    {
      id: 'lab-rolling-updates-overview-step-3',
      title: 'Step 3: Trigger Upgrade in Atlas',
      narrative:
        'In Atlas Console, click Edit Configuration on the cluster. Change the MongoDB version (e.g. 4.4 to 5.0) and Apply Changes. The upgrade rolls out over a few minutes while applications keep running.',
      instructions:
        '- Atlas Console → Cluster → ... → Edit Configuration\n- Change MongoDB version (e.g. 4.4 → 5.0)\n- Apply Changes\n- Watch upgrade progress; read/write scripts continue without errors\n- Target: no exceptions, matching MD5 hashes throughout',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rolling-updates.trigger',
      sourceProof: 'proofs/12/README.md',
      sourceSection: 'Execution',
    },
  ],
};
