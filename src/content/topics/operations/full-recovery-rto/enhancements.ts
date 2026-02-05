import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Full Recovery RTO Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/14/README.md (FULL-RECOVERY-RTO)
 * Restore Time Objective - recover database within X minutes for Y GB.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'full-recovery-rto.concepts': {
    id: 'full-recovery-rto.concepts',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'RTO and Full Restore',
        language: 'text',
        code: `RTO = Restore Time Objective
========================

RTO: How quickly you recover from disaster
  - Time from detection to data restored
  - Depends on data size and cluster tier

Atlas Backup:
  - Snapshot restore to live cluster
  - Replaces cluster data
  - DirectAttach speeds restore (same project/region)`,
      },
    ],
    tips: [
      'RTO complements RPO: RPO=what you lose, RTO=how long to recover.',
      'Use case: accidental delete, corruption, ransomware.',
      'Tier and data size affect restore time.',
    ],
  },

  'full-recovery-rto.flow': {
    id: 'full-recovery-rto.flow',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Proof Flow',
        language: 'text',
        code: `Full Recovery RTO Flow
====================

1. Load 10 GB (8.37M docs) into test.customers
2. Enable Continuous Backup
3. Wait for snapshot
4. Delete database (simulate disaster)
5. Restore from snapshot to same cluster
6. Measure elapsed time = RTO achieved (~5 min)`,
      },
    ],
    tips: [
      'Stopwatch starts when disaster detected.',
      'Restore replaces cluster data.',
      '10 GB on M40: ~5 minutes.',
    ],
  },

  'full-recovery-rto.requirements': {
    id: 'full-recovery-rto.requirements',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'RTO by Tier (Reference)',
        language: 'text',
        code: `RTO Reference (proof test framework)
====================================

M30, 17 GB   → ~16 min
M40, 34 GB   → ~22 min
M40_NVMe, 150 GB → ~165 min
M50, 69 GB   → ~55 min

This proof: M40, 10 GB → ~5 min`,
      },
    ],
    tips: [
      'Backup must be enabled before disaster.',
      'DirectAttach: same project, cloud, region.',
      'Choose tier based on RTO target.',
    ],
  },

  'full-recovery-rto.mgeneratejs': {
    id: 'full-recovery-rto.mgeneratejs',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'mgeneratejs Setup',
        language: 'bash',
        code: `# Install
npm install -g mgeneratejs

# Template from proofs/14/
# Customer360Data.json → insurance customer records`,
        skeleton: `npm install -g _________`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'JSON document generator', answer: 'mgeneratejs' },
        ],
      },
    ],
    tips: [
      'Customer360Data = insurance customer schema.',
      '8.37M docs ≈ 10 GB uncompressed.',
      'mongoimport for bulk load.',
    ],
  },

  'full-recovery-rto.atlas-setup': {
    id: 'full-recovery-rto.atlas-setup',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Cluster',
        language: 'text',
        code: `Atlas Cluster for RTO Proof
=======================

- M40, 3-node replica set
- Storage: 400 GB
- Backup: OFF initially (enable after load)
- User: main_user, readWriteAnyDatabase
- IP Whitelist: laptop IP`,
      },
    ],
    tips: [
      'Enable backup AFTER loading data.',
      'Snapshot must contain test data.',
      'Collection: test.customers',
    ],
  },

  'full-recovery-rto.load-data': {
    id: 'full-recovery-rto.load-data',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Load 10 GB',
        language: 'bash',
        code: `# 8.37M docs ≈ 10 GB (may take ~1 hour)
mgeneratejs Customer360Data.json -n 8370000 | mongoimport \\
  --uri "mongodb+srv://main_user:PASSWORD@cluster.mongodb.net/test" \\
  --collection customers`,
        skeleton: `mgeneratejs Customer360Data.json -n _________ | mongoimport --uri "_________" --collection customers`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Number of documents (8.37 million)', answer: '8370000' },
          { line: 1, blankText: '_________', hint: 'Atlas connection string', answer: 'mongodb+srv://main_user:PASSWORD@cluster.mongodb.net/test' },
        ],
      },
    ],
    tips: [
      'Target: test.customers.',
      'Load may take up to an hour.',
      'Verify count in Atlas Data Explorer.',
    ],
  },

  'full-recovery-rto.enable-backup': {
    id: 'full-recovery-rto.enable-backup',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Enable Backup',
        language: 'text',
        code: `Enable Continuous Backup
=====================

1. Cluster → ... → Edit Configuration
2. Backup → Enable (Continuous)
3. Apply changes
4. Backup tab → View All Snapshots
5. Wait for at least 1 snapshot`,
      },
    ],
    tips: [
      'Enable AFTER data load.',
      'Snapshot must include test data.',
      'Required for restore step.',
    ],
  },

  'full-recovery-rto.simulate-disaster': {
    id: 'full-recovery-rto.simulate-disaster',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Delete Database',
        language: 'text',
        code: `Simulate Disaster
================

1. Atlas Console → Collections
2. test database → wastebasket icon
3. Delete database
4. Confirm
5. Refresh - no databases remain`,
      },
    ],
    tips: [
      'Simulates complete data loss.',
      'Backup snapshot still exists.',
      'Restore will recover from snapshot.',
    ],
  },

  'full-recovery-rto.restore': {
    id: 'full-recovery-rto.restore',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Restore from Snapshot',
        language: 'text',
        code: `Restore Process
==============

1. Backup → View All Snapshots
2. Most recent snapshot → Restore or Download
3. Choose cluster to restore to
4. Select existing cluster (same one)
5. Restore → Confirm & Continue
6. Status: "We are deploying your changes"`,
      },
    ],
    tips: [
      'Start stopwatch before restore.',
      'Restore replaces cluster data.',
      'Refresh until status returns to active.',
    ],
  },

  'full-recovery-rto.verify': {
    id: 'full-recovery-rto.verify',
    povCapability: 'FULL-RECOVERY-RTO',
    sourceProof: 'proofs/14/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Verify Restore',
        language: 'text',
        code: `Verify Restore
=============

1. Refresh until deployment active
2. Collections → test → customers
3. Verify: 8,370,000 documents
4. Verify: ~10 GB data size
5. Stop stopwatch = RTO achieved`,
      },
    ],
    tips: [
      'RTO = elapsed time from disaster to verified restore.',
      '~5 min for 10 GB on M40.',
      'Document RTO for SLA planning.',
    ],
  },
};
