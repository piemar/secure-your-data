import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Consistency Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/06/README.md (CONSISTENCY)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'consistency.concepts': {
    id: 'consistency.concepts',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Strong Consistency Architecture',
        language: 'text',
        code: `MongoDB Strong Consistency
========================

Write Concern: w:"majority"
  → Write acknowledged only after majority of replicas confirm
  → Prevents data loss on primary failover

Read Concern: readConcernLevel:"majority"
  → Read returns only data committed to majority
  → Never returns uncommitted or rolled-back data

Causal Consistency (session)
  → Guarantees read-your-writes: read sees your prior writes
  → Works across primary and secondary reads
  → Use: connection.start_session(causal_consistency=True)

Result: Read from secondary and still see latest writes!`,
      },
    ],
    tips: [
      'writeConcern majority ensures durability before the driver returns.',
      'readConcern majority prevents reading uncommitted or stale data.',
      'Causal consistency requires using sessions for related operations.',
      'secondaryPreferred distributes read load while maintaining consistency.',
    ],
  },

  'consistency.driver-settings': {
    id: 'consistency.driver-settings',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Python - Driver Settings',
        language: 'python',
        code: `# MongoDB driver settings for strong consistency
connection = MongoClient(
    host=uri,
    w="majority",
    readPreference="secondaryPreferred",
    readConcernLevel="majority",
    retryableWrites=True
)

# Collection with write concern
people = connection.world.get_collection(
    "people",
    write_concern=WriteConcern(w="majority", wtimeout=5000)
)

# Use session for causal consistency (read-your-writes)
with connection.start_session(causal_consistency=True) as session:
    # Write on primary
    people.update_one(filter, {"$set": {"age": new_age}}, session=session)
    # Read from secondary - sees the write we just made
    doc = people.find_one(filter, session=session)`,
        skeleton: `# MongoDB driver settings for strong consistency
connection = MongoClient(
    host=uri,
    w="_________",
    readPreference="_________",
    readConcernLevel="_________",
    retryableWrites=True
)

# Use session for causal consistency
with connection.start_session(causal_consistency=_________) as session:
    people.update_one(filter, {"$set": {"age": new_age}}, session=session)
    doc = people.find_one(filter, session=session)`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Write concern: acknowledge when majority confirms', answer: 'majority' },
          { line: 6, blankText: '_________', hint: 'Read preference: prefer secondaries when available', answer: 'secondaryPreferred' },
          { line: 7, blankText: '_________', hint: 'Read concern: only return majority-committed data', answer: 'majority' },
          { line: 12, blankText: '_________', hint: 'Enable causal consistency for read-your-writes', answer: 'True' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the script (or run mongosh commands in editor).',
      'retryableWrites automatically retries transient failures.',
      'Causal consistency requires passing the session to both write and read.',
      'wtimeout prevents indefinite blocking if majority is unreachable.',
    ],
  },

  'consistency.failover': {
    id: 'consistency.failover',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Failover Behavior',
        language: 'text',
        code: `During Atlas Test Failover:
- Primary steps down, election occurs
- Brief period: "not master", "Connection refused", "READ ERROR"
- Driver retries automatically (retryableWrites, session retry)
- New primary elected, operations resume
- Consistency maintained: no stale reads

Expected log during failover:
  WRITE ERROR - ... (transient)
  READ ERROR - ... (transient)
  DOCUMENT NOT FOUND - ... (retry after failover)
  OK - ... (resumes normally)

Key: No CONSISTENCY ERROR entries = strong consistency holds.`,
      },
    ],
    tips: [
      'Connection errors during failover are expected and transient.',
      'The script retries; consistency is verified once operations succeed.',
      'Run for 10+ minutes to observe multiple successful cycles.',
    ],
  },

  'consistency.atlas-setup': {
    id: 'consistency.atlas-setup',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Setup - Configure Atlas Environment',
    codeBlocks: [
      {
        filename: 'Atlas Cluster Configuration',
        language: 'text',
        code: `Atlas M30 Sharded Cluster for Consistency Proof
==============================================

1. Tier: M30 (minimum for sharding)
2. Cluster Type: Sharded
3. Shards: 4
4. Replicas per shard: 3
5. Region: Single region (low latency)
6. User: main_user with Atlas Admin
7. IP Whitelist: Your machine or EC2 VM

Recommended: Run scripts from EC2 in same region as cluster
for high read/write throughput.`,
      },
    ],
    tips: [
      'M30 is the minimum tier for sharded clusters in Atlas.',
      '4 shards × 3 replicas = 12 nodes total.',
      'Same-region EC2 reduces latency for the consistency test.',
    ],
  },

  'consistency.shard-config': {
    id: 'consistency.shard-config',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Setup - Configure Sharded Database Collection',
    codeBlocks: [
      {
        filename: 'mongosh - Shard Configuration',
        language: 'javascript',
        code: `use world

// Enable sharding on database
sh.enableSharding('world')

// Shard collection with compound key
sh.shardCollection('world.people', {'process': 1, 'index': 1})

// Pre-split chunks for even distribution
sh.splitAt('world.people', {'process': 2, 'index': 1250})
sh.splitAt('world.people', {'process': 4, 'index': 1250})
sh.splitAt('world.people', {'process': 6, 'index': 1250})

// Verify chunk distribution
sh.status()`,
        skeleton: `use world

sh.enableSharding('_________')
sh.shardCollection('world.people', {'_________': 1, 'index': 1})
sh.splitAt('world.people', {'process': 2, 'index': _________})
sh.splitAt('world.people', {'process': 4, 'index': 1250})
sh.splitAt('world.people', {'process': 6, 'index': 1250})

sh._________()`,
        inlineHints: [
          { line: 4, blankText: '_________', hint: 'Database name to enable sharding on', answer: 'world' },
          { line: 5, blankText: '_________', hint: 'First field in compound shard key', answer: 'process' },
          { line: 6, blankText: '_________', hint: 'Index value for first split point', answer: '1250' },
          { line: 9, blankText: '_________', hint: 'Command to view shard status', answer: 'status' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the commands (mongosh-style).',
      'Pre-splitting ensures even chunk distribution before data load.',
      'Shard key (process, index) matches the data generation pattern.',
      'sh.status() shows chunks per shard—should be roughly equal.',
    ],
  },

  'consistency.data-load': {
    id: 'consistency.data-load',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Setup - Generate 1 Million Sample Records',
    codeBlocks: [
      {
        filename: 'Load 1M Records',
        language: 'bash',
        code: `# Install dependencies
pip3 install faker pymongo dnspython certifi

# Run from proof folder (proofs/06)
./generate1Mpeople.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"

# Verify after load (5-10 minutes)
mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net/test" --username USER
use world
db.people.countDocuments()  // Should return 1000000`,
        skeleton: `# Install dependencies
pip3 install faker pymongo dnspython certifi

# Load 1M records
./generate1Mpeople.py "mongodb+srv://_________@cluster.mongodb.net/test?retryWrites=true"

# Verify
mongosh "mongodb+srv://_________" --username _________
use world
db.people._________()  // Should return 1000000`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Connection string: USER:PASS', answer: 'USER:PASS' },
          { line: 8, blankText: '_________', hint: 'Connection string for mongosh', answer: 'USER:PASS@cluster.mongodb.net' },
          { line: 9, blankText: '_________', hint: 'MongoDB username', answer: 'USER' },
          { line: 11, blankText: '_________', hint: 'Method to count documents', answer: 'countDocuments' },
        ],
      },
    ],
    tips: [
      'Data load takes 5-10 minutes; do not interrupt.',
      '8 processes insert 125,000 docs each = 1M total.',
      'Write concern majority is used for durability.',
    ],
  },

  'consistency.run-script': {
    id: 'consistency.run-script',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Run Verification Script',
        language: 'bash',
        code: `# From proof folder (proofs/06)
./updateAndCheckPeople.py "mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true"

# Script runs 8 processes indefinitely
# Each process: update on primary → read on secondary → verify match
# Logs to consistency.log`,
      },
    ],
    tips: [
      'Run from EC2 in same region for best throughput.',
      'Let it run 5+ minutes before checking the log.',
      'Uses causal_consistency=True for read-your-writes.',
    ],
  },

  'consistency.verify-log': {
    id: 'consistency.verify-log',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Verify consistency.log',
        language: 'bash',
        code: `# View recent log entries
head consistency.log

# Check for consistency errors (should return nothing)
grep CONSISTENCY consistency.log

# Check for read errors during failover
grep READ consistency.log`,
        skeleton: `# View recent entries
head _________

# Check for consistency errors
grep _________ consistency.log

# Check for read errors
grep _________ consistency.log`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Log filename', answer: 'consistency.log' },
          { line: 5, blankText: '_________', hint: 'Pattern for consistency errors', answer: 'CONSISTENCY' },
          { line: 8, blankText: '_________', hint: 'Pattern for read errors', answer: 'READ' },
        ],
      },
    ],
    tips: [
      'No output from grep CONSISTENCY = no consistency issues.',
      'OK entries show wrote $age=X read $age=X (values match).',
      'READ ERROR entries during failover are expected.',
    ],
  },

  'consistency.failover-test': {
    id: 'consistency.failover-test',
    povCapability: 'CONSISTENCY',
    sourceProof: 'proofs/06/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Atlas Test Failover',
        language: 'text',
        code: `1. With updateAndCheckPeople.py running...
2. Atlas Console → Your Cluster → "..." menu
3. Select "Test Failover"
4. Confirm the operation

Observe script output:
- "not master" - primary stepped down
- "Connection refused" - brief disconnect
- "READ ERROR" - read during election
- Script retries and continues

After failover: grep CONSISTENCY consistency.log
Expected: No output (strong consistency maintained)`,
      },
    ],
    tips: [
      'Test Failover forces an election; brief downtime is normal.',
      'The script is designed to handle and retry through failover.',
      'Consistency holds because of majority write/read concern.',
    ],
  },
};
