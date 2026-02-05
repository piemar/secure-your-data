import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Rolling Updates Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/12/README.md (ROLLING-UPDATES)
 * Apply patches without scheduled downtime; read/write verification with MD5.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'rolling-updates.concepts': {
    id: 'rolling-updates.concepts',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Rolling Upgrade Flow',
        language: 'text',
        code: `MongoDB Rolling Updates
====================

1. One member at a time
   → Secondary upgraded, then promoted
   → Old primary stepped down
   → New primary serves traffic

2. retryWrites
   → Driver retries during election
   → No application changes needed

3. Zero scheduled downtime
   → Applications keep running
   → Brief election (~seconds)
   → No maintenance windows`,
      },
    ],
    tips: [
      'Atlas handles the rolling sequence automatically.',
      'Minor upgrades occur automatically; major upgrades are manual.',
      'Change streams and retryWrites ensure continuity.',
    ],
  },

  'rolling-updates.verification': {
    id: 'rolling-updates.verification',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Read/Write Verification',
        language: 'text',
        code: `Verification Scripts
===================

Writer (write.py):
  - Inserts random data
  - Outputs seq + MD5 hash per insert
  - retryWrites=True (handles election)

Reader (read.py):
  - Change stream watches inserts
  - Outputs seq + MD5 hash per document
  - Must start BEFORE writer

Matching hashes = no data loss, no duplicates`,
      },
    ],
    tips: [
      'Start read.py before write.py—order matters.',
      'MD5 is cumulative; mismatch means wrong order.',
      'Both scripts run until Ctrl+C.',
    ],
  },

  'rolling-updates.trigger': {
    id: 'rolling-updates.trigger',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Atlas Upgrade Steps',
        language: 'text',
        code: `Trigger Upgrade in Atlas
======================

1. Cluster → ... → Edit Configuration
2. Change MongoDB version (e.g. 4.4 → 5.0)
3. Apply Changes
4. Upgrade rolls out over ~few minutes
5. Applications continue; watch for exceptions`,
      },
    ],
    tips: [
      'Cluster must be on older version to upgrade.',
      'Major upgrades are manual; minor are automatic.',
      'Place script windows side-by-side during demo.',
    ],
  },

  'rolling-updates.python-setup': {
    id: 'rolling-updates.python-setup',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Python Setup',
        language: 'bash',
        code: `# Install required libraries
pip3 install srvlookup dnspython pymongo

# Verify
python3 -c "import srvlookup, dns.resolver, pymongo; print('OK')"`,
        skeleton: `pip3 install _________ dnspython pymongo`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Library for SRV connection string resolution', answer: 'srvlookup' },
        ],
      },
    ],
    tips: [
      'srvlookup resolves mongodb+srv:// hostnames.',
      'pymongo is the MongoDB Python driver.',
      'dnspython is a dependency of srvlookup.',
    ],
  },

  'rolling-updates.atlas-setup': {
    id: 'rolling-updates.atlas-setup',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Cluster',
        language: 'text',
        code: `Atlas Cluster for Rolling Updates
===============================

- M10, 3-node replica set
- MongoDB version: 4.4 (or one behind current)
  → Must have version to upgrade TO
- User: main_user, readWriteAnyDatabase
- IP Whitelist: your laptop IP
- Connection string for scripts`,
      },
    ],
    tips: [
      'Older version required—otherwise nothing to upgrade.',
      'M10 is sufficient for the proof workload.',
      'Copy connection string for read.py and write.py.',
    ],
  },

  'rolling-updates.scripts': {
    id: 'rolling-updates.scripts',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Script Usage',
        language: 'bash',
        code: `# read.py - start FIRST
./read.py -c "mongodb+srv://cluster.mongodb.net" -u main_user

# write.py - start SECOND
./write.py -c "mongodb+srv://cluster.mongodb.net" -u main_user -s 3

# -s 3 = 3 writes per second (adjust for demo)`,
        skeleton: `./read.py -c "_________" -u main_user
./write.py -c "_________" -u main_user -s 3`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'Atlas SRV connection string', answer: 'mongodb+srv://cluster.mongodb.net' },
          { line: 2, blankText: '_________', hint: 'Same connection string', answer: 'mongodb+srv://cluster.mongodb.net' },
        ],
      },
    ],
    tips: [
      'chmod +x read.py write.py',
      'Order: read.py first, then write.py.',
      '-s 3 = 3 inserts/sec; use -s 5 for faster (redirect output to file).',
    ],
  },

  'rolling-updates.start-scripts': {
    id: 'rolling-updates.start-scripts',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Start Order',
        language: 'text',
        code: `Correct Start Order
=================

1. Right terminal: ./read.py -c "..." -u main_user
   → "Successfully connected, watching for changes..."

2. Left terminal: ./write.py -c "..." -u main_user -s 3
   → Seq and MD5 output

3. Verify: matching seq + MD5 in both windows
   → If not, kill both, start read.py first`,
      },
    ],
    tips: [
      'Reader must be watching before first insert.',
      'Mismatched hashes = wrong start order.',
      'Use two terminal windows side by side.',
    ],
  },

  'rolling-updates.upgrade': {
    id: 'rolling-updates.upgrade',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Upgrade During Scripts',
        language: 'text',
        code: `Upgrade While Scripts Run
=======================

1. Atlas → Edit Configuration
2. Version: 4.4 → 5.0 (or next major)
3. Apply Changes
4. Watch both script windows
   - Brief "Cannot write/read" during election OK
   - retryWrites handles it
   - No uncaught exceptions = success
5. Upgrade completes in ~few minutes`,
      },
    ],
    tips: [
      'Scripts continue during upgrade.',
      'Brief pauses during primary election are normal.',
      'Upgrade rolls one member at a time.',
    ],
  },

  'rolling-updates.verify': {
    id: 'rolling-updates.verify',
    povCapability: 'ROLLING-UPDATES',
    sourceProof: 'proofs/12/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Verification',
        language: 'text',
        code: `Post-Upgrade Verification
========================

1. Compare seq + MD5 in both windows
   → Each seq must have matching hash
   → Proves no data lost, no duplicates

2. No exceptions during upgrade
   → Seamless rollout

3. If hashes mismatch
   → read.py was started after write.py
   → Restart with correct order`,
      },
    ],
    tips: [
      'Matching hashes = proof of zero data loss.',
      'Document for proof report.',
      'Scripts run until Ctrl+C.',
    ],
  },
};
