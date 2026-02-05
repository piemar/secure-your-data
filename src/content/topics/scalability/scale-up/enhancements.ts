import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Scale-Up Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/08/README.md (SCALE-UP)
 * Vertical scaling: increase/decrease CPU, RAM, Storage without database downtime.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'scale-up.concepts': {
    id: 'scale-up.concepts',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Vertical Scale-Up',
        language: 'text',
        code: `MongoDB Vertical Scale-Up
=========================

Scale-out (horizontal): Add more shards
  → More machines, distributed data

Scale-up (vertical): Increase CPU/RAM/Storage per node
  → Bigger machines, same replica set
  → Atlas cluster tiers: M10, M20, M30, M40...

Key benefit: Zero downtime
  → Rolling update across replica set members
  → One node at a time upgraded
  → Application continues serving traffic`,
      },
    ],
    tips: [
      'Scale-up is ideal when a single node needs more capacity.',
      'Atlas cluster tiers define CPU, RAM, and storage per node.',
      'M20 → M30 doubles RAM (4GB → 8GB per node).',
      'Scale-down (M30 → M20) works the same way.',
    ],
  },

  'scale-up.rolling-update': {
    id: 'scale-up.rolling-update',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Rolling Update Process',
        language: 'text',
        code: `Scale-Up Rolling Update
======================

1. Secondaries upgrade first (one at a time)
   → Node goes offline briefly
   → Comes back with new RAM/CPU
   → Replication catches up

2. Primary steps down
   → One upgraded secondary elected primary
   → Brief pause (1–2 seconds)
   → Retryable writes ensure no lost inserts

3. Former primary upgrades
   → Joins as secondary
   → Cluster fully upgraded

Application: Minimal interruption
  → Driver retries during election
  → No manual reconnection needed`,
      },
    ],
    tips: [
      'Retryable writes (MongoDB 3.6+) handle primary election transparently.',
      'The brief pause is typically 1–2 seconds.',
      'Monitor script updates every 0.5s to show the transition.',
    ],
  },

  'scale-up.metrics': {
    id: 'scale-up.metrics',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Monitor Output',
        language: 'text',
        code: `monitor.py output (every 0.5 seconds):
  Node 1: PRIMARY (4GB)  Records: 16619
  Node 2: SECONDARY (4GB)  Records: 16619
  Node 3: SECONDARY (4GB)  Records: 16619

After scale-up M20 → M30:
  Node 1: SECONDARY (8GB)  Records: 16650
  Node 2: PRIMARY (8GB)  Records: 16650
  Node 3: SECONDARY (8GB)  Records: 16650

Metrics:
  - Role: PRIMARY or SECONDARY
  - RAM: hostInfo memSizeMB (GB)
  - Records: count_documents({val: {$gte: 0}})`,
      },
    ],
    tips: [
      'Note the record number just before primary step-down for verification.',
      'RAM increases when each node completes its upgrade.',
      'Records count should match across all nodes (after replication catch-up).',
    ],
  },

  'scale-up.laptop-setup': {
    id: 'scale-up.laptop-setup',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Setup - Configure Laptop',
    codeBlocks: [
      {
        filename: 'Laptop Setup',
        language: 'bash',
        code: `# Ensure Python 3
python3 --version

# Install required libraries
pip3 install pymongo asyncio dnspython

# Download Compass
# https://www.mongodb.com/download-center/compass
# Install for your OS`,
      },
    ],
    tips: [
      'Compass is used to verify no records were lost during scale-up.',
      'asyncio is part of Python 3.4+ standard library; pip may not need it.',
      'Use python3 and pip3 explicitly if you have multiple Python versions.',
    ],
  },

  'scale-up.atlas-config': {
    id: 'scale-up.atlas-config',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Setup - Configure Atlas Environment',
    codeBlocks: [
      {
        filename: 'Atlas Configuration',
        language: 'text',
        code: `Atlas Setup for Scale-Up
========================

1. Database Access
   - Add user: main_user
   - Built-in Role: Atlas admin
   - Note the password

2. Create Cluster
   - M20, 3-node replica set
   - Single region (your choice)
   - Default storage settings

3. Network Access
   - Add IP Access List entry
   - Your laptop's current IP

4. Connection String
   - Connect → Connect Your Application
   - Python, latest version
   - Copy Connection String Only (Short SRV)`,
      },
    ],
    tips: [
      'M20 is the minimum tier for this proof (M10 has limited features).',
      'Use SA preallocated Atlas credits for the cluster.',
      'Connection string format: mongodb+srv://main_user:<PASSWORD>@cluster.mongodb.net/test',
    ],
  },

  'scale-up.params-config': {
    id: 'scale-up.params-config',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Setup - Start the Monitoring Script',
    codeBlocks: [
      {
        filename: 'params.py',
        language: 'python',
        code: `# Input parameters
conn_string = 'mongodb+srv://main_user:MyPassword@testcluster-abcde.mongodb.net/test?retryWrites=true'`,
        skeleton: `# Input parameters
conn_string = '_________'`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Atlas SRV connection string with password', answer: "mongodb+srv://main_user:MyPassword@cluster.mongodb.net/test?retryWrites=true" },
        ],
      },
      {
        filename: 'Run Monitor',
        language: 'bash',
        code: `# Start monitor (keep running)
./monitor.py

# If reusing from prior run - clear data first
./reset_data.py`,
      },
    ],
    tips: [
      'Replace <PASSWORD> in the connection string with main_user password.',
      'monitor.py must stay running for the duration of the proof.',
      'reset_data.py drops mydb.records; run only if starting fresh.',
    ],
  },

  'scale-up.run-insert': {
    id: 'scale-up.run-insert',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'insert_data.py',
        language: 'python',
        code: `# Inserts documents with incrementing val
# Run in a separate terminal from monitor.py

connection = pymongo.MongoClient(params.conn_string)
connection.mydb.records.drop()  # Fresh start

val = 1
while True:
    connection.mydb.records.insert_one({'val': val})
    val += 1
    if (val % 100 == 0):
        print(val, 'records inserted')`,
      },
      {
        filename: 'Run Insert',
        language: 'bash',
        code: `# Terminal 1: monitor (already running)
./monitor.py

# Terminal 2: insert load
./insert_data.py`,
      },
    ],
    tips: [
      '~10–15 records inserted every 0.5 seconds (matches monitor refresh).',
      'Let it run until a few thousand records before scaling.',
      'insert_data.py uses retryable writes; handles reconnection automatically.',
    ],
  },

  'scale-up.run-scale': {
    id: 'scale-up.run-scale',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Scale Up in Atlas',
        language: 'text',
        code: `Atlas Console Steps
===================

1. Navigate to your cluster
2. Click "Edit Configuration"
3. Change cluster tier: M20 → M30
4. Click "Apply Changes"

Watch monitor.py:
  - Secondaries upgrade first (RAM 4GB → 8GB)
  - Primary steps down
  - Brief pause at one record number
  - New primary elected
  - Inserts resume

Scale-down: M30 → M20 (same process)`,
      },
    ],
    tips: [
      'Scale-up takes a few minutes (rolling, one node at a time).',
      'Do not stop insert_data.py or monitor.py during the process.',
      'Retryable writes ensure no inserts are lost during the election.',
    ],
  },

  'scale-up.verify': {
    id: 'scale-up.verify',
    povCapability: 'SCALE-UP',
    sourceProof: 'proofs/08/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Compass Verification',
        language: 'javascript',
        code: `// Note record number from monitor before step-down (e.g. 16617)
// In Compass: mydb.records

// Filter for records after step-down
{ val: { $gt: 16617 } }

// Sort by val ascending
// Verify: no gaps; sequence continues 16618, 16619, 16620...`,
        skeleton: `// Filter for records after step-down
{ val: { $gt: _________ } }`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Record number from monitor just before primary step-down', answer: '16617' },
        ],
      },
    ],
    tips: [
      'No gaps = proof successful; zero data loss during scale-up.',
      'If you see gaps, check that retryable writes are enabled (default in driver).',
      'Scale-down verification: same process after M30 → M20.',
    ],
  },
};
