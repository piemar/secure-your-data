import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * AUTO-HA Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/17/README.md (AUTO-HA)
 * Automatic failover in a single region; recovery within seconds without human intervention.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'auto-ha.concepts': {
    id: 'auto-ha.concepts',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'AUTO-HA Concepts',
        language: 'text',
        code: `Automatic failover (AUTO-HA)
=============================

- When the primary of a replica set fails, another member is automatically promoted to primary.
- The MongoDB driver detects the new primary and reconnects—typically within a few seconds.
- No application code changes are required.
- RTO (Recovery Time Objective): in this proof, application recovery is under 4 seconds.
- Single region: all nodes in one cloud region for fast election and failover.`,
      },
    ],
    tips: [
      'Use a replica set (3 nodes) for automatic failover; standalone has no failover.',
      'Retryable writes and retryable reads minimize visible impact of brief failover.',
    ],
  },

  'auto-ha.flow': {
    id: 'auto-ha.flow',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Failover flow',
        language: 'text',
        code: `Failover sequence
=================

1. Primary fails (or Test Failover in Atlas).
2. Replica set members detect the failure and hold an election.
3. A secondary is elected as the new primary.
4. Client driver sees connection errors briefly, then reconnects to the new primary.
5. Application output: DB-CONNECTION-PROBLEM → RECONNECTED-TO-DB.
6. With retryWrites=true and retryReads=true, the driver retries automatically and the app may see no errors.`,
      },
    ],
    tips: [
      'Atlas may take a few minutes to schedule the Test Failover action.',
      'Measure downtime as the time between last successful op before error and first after RECONNECTED.',
    ],
  },

  'auto-ha.requirements': {
    id: 'auto-ha.requirements',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Requirements',
        language: 'text',
        code: `AUTO-HA requirements
=====================

- Replica set (not standalone).
- M10 or higher for Atlas (3-node recommended).
- Single region: all nodes in the same cloud region for single-region failover.
- No manual intervention: failover is automatic.
- Application: use a supported driver; connection string with correct options (retryWrites, retryReads).`,
      },
    ],
    tips: [
      'Multi-region HA is a separate proof (MULTI-REGION-HA); this proof is single-region.',
    ],
  },

  'auto-ha.atlas-cluster': {
    id: 'auto-ha.atlas-cluster',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas cluster and user',
        language: 'text',
        code: `Atlas setup
===========

1. Log in to cloud.mongodb.com → your project.
2. Create cluster:
   - M10, 3 nodes, single region (default settings).
3. Security → Database Access → Add Database User:
   - Username: main_user
   - Password: (choose and save)
   - Privileges: Read and write to any database.`,
      },
    ],
    tips: [
      'Use a dedicated user (e.g. main_user) for the proof; avoid using your Atlas admin.',
    ],
  },

  'auto-ha.connection-string': {
    id: 'auto-ha.connection-string',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Connection string',
        language: 'text',
        code: `Get connection string
=====================

1. Security → Network Access → Add IP Address (current IP).
2. Cluster → Connect → Connect your application.
3. Driver: Python, version latest.
4. Copy "Connection string only" (SRV URI).

Example (replace <username>, <password>, <cluster>):
  mongodb+srv://<username>:<password>@<cluster>.mongodb.net

For the proof you will append:
  ?retryWrites=false&retryReads=false   (first run)
  ?retryWrites=true&retryReads=true     (second run)`,
      },
    ],
    tips: [
      'URL-encode the password if it contains special characters.',
    ],
  },

  'auto-ha.python-env': {
    id: 'auto-ha.python-env',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Python environment',
        language: 'bash',
        code: `# Ensure Python 3 is installed
python3 --version

# Install required libraries
pip3 install pymongo dnspython

# Scripts: continuous-insert.py and continuous-read.py
# Obtain from Docs/pov-proof-exercises/proofs/17/ (or proof repo).
# They connect to AUTO_HA.records and insert/read continuously.`,
      },
    ],
    tips: [
      'MongoDB command-line tools (e.g. mongosh) are optional for this proof; Python scripts are used.',
    ],
  },

  'auto-ha.run-without-retry': {
    id: 'auto-ha.run-without-retry',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Run without retry',
        language: 'bash',
        code: `# Terminal 1: continuous insert (retryWrites=false)
./continuous-insert.py 'mongodb+srv://<user>:<password>@<cluster>.mongodb.net?retryWrites=false'

# Terminal 2: continuous read (retryReads=false)
./continuous-read.py 'mongodb+srv://<user>:<password>@<cluster>.mongodb.net?retryReads=false'

# Confirm both show successful connection and ongoing inserts/reads.`,
      },
    ],
    tips: [
      'Use the same connection string in both scripts; only the retry parameter differs per script.',
    ],
  },

  'auto-ha.trigger-failover': {
    id: 'auto-ha.trigger-failover',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Trigger failover and measure',
        language: 'text',
        code: `Measurement (proof 17)
=====================

1. In Atlas: cluster → ... → Test Failover → confirm.
2. In terminal output, watch for:
   - Last INSERT before: DB-CONNECTION-PROBLEM: connection closed
   - First INSERT after: RECONNECTED-TO-DB
3. Downtime = (time of first INSERT after RECONNECTED) - (time of last INSERT before PROBLEM).
   Example from proof: ~3.2 seconds.
4. Stop the apps (Ctrl-C) when done measuring.`,
      },
    ],
    tips: [
      'Atlas may take a few minutes before it invokes the test failover.',
    ],
  },

  'auto-ha.run-with-retry': {
    id: 'auto-ha.run-with-retry',
    povCapability: 'AUTO-HA',
    sourceProof: 'proofs/17/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Run with retryable writes/reads',
        language: 'bash',
        code: `# Terminal 1: with retryWrites=true (and optional "retry" arg if script supports it)
./continuous-insert.py 'mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true' retry

# Terminal 2: with retryReads=true
./continuous-read.py 'mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryReads=true' retry

# Trigger Test Failover again. The application output should NOT report connection problems.`,
      },
    ],
    tips: [
      'Retryable writes and retryable reads allow the driver to retry failed operations automatically during failover.',
    ],
  },
};
