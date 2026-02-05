import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Full Recovery RPO Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/13/README.md (FULL-RECOVERY-RPO)
 * Point-in-time recovery with zero data loss (RPO=0).
 */

export const enhancements: EnhancementMetadataRegistry = {
  'full-recovery-rpo.concepts': {
    id: 'full-recovery-rpo.concepts',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'RPO and Point-in-Time',
        language: 'text',
        code: `RPO = Recovery Point Objective
============================

RPO=0: Zero data loss
  - Recover to exact moment before incident
  - No "last backup" gap

Atlas Continuous Backup:
  - Oplog streamed continuously
  - Snapshots + oplog = any point in time
  - Restore to cluster or new cluster`,
      },
    ],
    tips: [
      'Continuous Backup required for point-in-time.',
      'Use case: accidental delete, corruption, ransomware.',
      'Restore can target existing or new cluster.',
    ],
  },

  'full-recovery-rpo.flow': {
    id: 'full-recovery-rpo.flow',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Proof Flow',
        language: 'text',
        code: `Full Recovery RPO Flow
====================

1. Load 1000 good docs (docType: BEFORE_CORRUPTION)
2. Note timestamp (restore target)
3. Load 100 bad docs (docType: AFTER_CORRUPTION)
4. Point-in-time restore to step 2 timestamp
5. Verify: 1000 docs, all BEFORE_CORRUPTION`,
      },
    ],
    tips: [
      'Record time between load-good and load-bad.',
      'Restore replaces cluster data to that point.',
      'Corrupt docs are gone after restore.',
    ],
  },

  'full-recovery-rpo.requirements': {
    id: 'full-recovery-rpo.requirements',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Requirements',
        language: 'text',
        code: `Continuous Backup Requirements
============================

- Cluster: M10+ (Continuous Backup default)
- Backup tab: Snapshots + oplog
- Enable at cluster creation or in config
- Without it: snapshot-only restore (not point-in-time)`,
      },
    ],
    tips: [
      'M10+ has Continuous Backup by default.',
      'Check Backup tab for snapshot list.',
      'Oplog enables point-in-time granularity.',
    ],
  },

  'full-recovery-rpo.mgeneratejs': {
    id: 'full-recovery-rpo.mgeneratejs',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'mgeneratejs Setup',
        language: 'bash',
        code: `# Install
npm install -g mgeneratejs

# Templates from proofs/13/
# mgenerateBefore.json → docType: BEFORE_CORRUPTION
# mgenerateAfter.json  → docType: AFTER_CORRUPTION`,
        skeleton: `npm install -g _________`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'JSON document generator', answer: 'mgeneratejs' },
        ],
      },
    ],
    tips: [
      'mgenerateBefore = good data.',
      'mgenerateAfter = corrupt/bad data.',
      'docType field distinguishes them.',
    ],
  },

  'full-recovery-rpo.atlas-setup': {
    id: 'full-recovery-rpo.atlas-setup',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Cluster',
        language: 'text',
        code: `Atlas Cluster for RPO Proof
=======================

- M10, 3-node replica set
- Continuous Backup: ENABLED
- User: main_user, readWriteAnyDatabase
- IP Whitelist: laptop IP
- Connection string for mongoimport`,
      },
    ],
    tips: [
      'Continuous Backup is default on M10+.',
      'Verify in Backup tab before starting.',
      'Collection: test.RPO',
    ],
  },

  'full-recovery-rpo.snapshots': {
    id: 'full-recovery-rpo.snapshots',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Backup Tab',
        language: 'text',
        code: `Backup Tab
==========

- Cluster → Metrics → Backup
- Review snapshots (auto or manual)
- If none: Take Snapshot Now
- Point-in-time restore needs snapshot + oplog`,
      },
    ],
    tips: [
      'Snapshots occur automatically.',
      'Manual snapshot optional for demo.',
      'Oplog enables point-in-time.',
    ],
  },

  'full-recovery-rpo.load-good': {
    id: 'full-recovery-rpo.load-good',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Load Good Data',
        language: 'bash',
        code: `# Record time before and after
date
mgeneratejs mgenerateBefore.json -n 1000 | mongoimport \\
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/test" \\
  --collection RPO
date

# Note the timestamp (use for restore)`,
        skeleton: `mgeneratejs mgenerateBefore.json -n _________ | mongoimport --uri "_________" --collection RPO`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Number of good documents', answer: '1000' },
          { line: 1, blankText: '_________', hint: 'Atlas connection string', answer: 'mongodb+srv://user:pass@cluster.mongodb.net/test' },
        ],
      },
    ],
    tips: [
      'Record timestamp for restore target.',
      'All docs have docType BEFORE_CORRUPTION.',
      'Collection test.RPO',
    ],
  },

  'full-recovery-rpo.corrupt': {
    id: 'full-recovery-rpo.corrupt',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Load Corrupt Data',
        language: 'bash',
        code: `# Simulate corruption
mgeneratejs mgenerateAfter.json -n 100 | mongoimport \\
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/test" \\
  --collection RPO

# Now: 1100 docs, 100 with docType AFTER_CORRUPTION`,
        skeleton: `mgeneratejs mgenerateAfter.json -n _________ | mongoimport --uri "_________" --collection RPO`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Number of corrupt documents', answer: '100' },
          { line: 1, blankText: '_________', hint: 'Same connection string', answer: 'mongodb+srv://user:pass@cluster.mongodb.net/test' },
        ],
      },
    ],
    tips: [
      'Simulates program error or bad import.',
      'docType AFTER_CORRUPTION.',
      'Restore will remove these.',
    ],
  },

  'full-recovery-rpo.restore': {
    id: 'full-recovery-rpo.restore',
    povCapability: 'FULL-RECOVERY-RPO',
    sourceProof: 'proofs/13/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Point-in-Time Restore',
        language: 'text',
        code: `Point-in-Time Restore
===================

1. Backup tab → Point in Time Restore
2. Date: today
3. Time: from load-good step (before corrupt)
4. Next → Select current cluster
5. Restore (replaces cluster data)

Verify in Compass:
- Count: 1000
- All docType: BEFORE_CORRUPTION
- Zero AFTER_CORRUPTION`,
      },
    ],
    tips: [
      'Time zone: convert if needed.',
      'Restore replaces cluster; backup first if needed.',
      'RPO=0 demonstrated: zero data loss.',
    ],
  },
};
