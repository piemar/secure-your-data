import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Scale-Out Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/07/README.md (SCALE-OUT)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'scale-out.concepts': {
    id: 'scale-out.concepts',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Horizontal Scale-Out',
        language: 'text',
        code: `MongoDB Horizontal Scale-Out
============================

Vertical scaling: Bigger machines (CPU, RAM, disk)
  → Has limits; single point of failure

Horizontal scale-out: Add more shards
  → Each shard = replica set
  → Data distributed via shard key
  → Balancer migrates chunks when shards added

Key benefit: Add shards at runtime, no downtime
  → Cluster continues serving traffic
  → Balancer runs in background
  → Application sees no interruption`,
      },
    ],
    tips: [
      'Sharding distributes data across multiple replica sets (shards).',
      'The balancer automatically redistributes chunks when shards are added.',
      'Choose a shard key that distributes writes and supports your queries.',
      'Atlas allows adding shards via UI or API during cluster operation.',
    ],
  },

  'scale-out.sustained-load': {
    id: 'scale-out.sustained-load',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Scale-Out During Load',
        language: 'text',
        code: `Proof flow:
1. Start 2-shard cluster
2. Begin insert load: 100K docs/batch, 1s think time
3. After iterations: add 3rd shard
4. After more iterations: add 4th shard
5. Load continues throughout

Expected:
- Batch execution time: roughly constant (spikes during balancer)
- Chunk counts: balancer migrates chunks to new shards
- Disk capacity: increases when shard added
- Disk used: grows continuously with ingest`,
      },
    ],
    tips: [
      'Allow 15+ minutes of load before adding first shard (manual mode).',
      'Allow 20 minutes after shard increase for balancer to settle.',
      'Temporary latency spikes during chunk migration are normal.',
    ],
  },

  'scale-out.metrics': {
    id: 'scale-out.metrics',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Metrics Schema',
        language: 'javascript',
        code: `// test_results.test_results document structure
{
  _id: "shard_test_2026-02-03 12:00:00",
  latest: true,
  test_data: {
    batch_execution_times: [
      { ts: ISODate(...), duration: 12.5, total_docs: 100000 },
      { ts: ISODate(...), duration: 11.8, total_docs: 200000 }
    ],
    chunk_counts: [
      { ts: ISODate(...), chunk_counts: [5, 5] },
      { ts: ISODate(...), chunk_counts: [4, 3, 3] }  // after 3rd shard
    ],
    disk_sizes: [
      { ts: ISODate(...), disk_total: 480, disk_used: 12 },
      { ts: ISODate(...), disk_total: 720, disk_used: 45 }  // after shard add
    ]
  }
}`,
      },
    ],
    tips: [
      'duration = seconds to insert 100K document batch.',
      'chunk_counts array has one value per shard.',
      'disk_total increases when a new shard is added.',
    ],
  },

  'scale-out.aws-setup': {
    id: 'scale-out.aws-setup',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Setup - Create AWS Environment',
    codeBlocks: [
      {
        filename: 'EC2 Instance Configuration',
        language: 'text',
        code: `EC2 for Scale-Out Proof
======================

AMI: Amazon Linux 2023 (not Amazon Linux 2 - SSL outdated)
Instance: m4.xlarge

Tags (required per MongoDB AWS guidelines):
  Name: scale-out-proof
  owner: your.email@mongodb.com
  expire-on: YYYY-MM-DD

Security Group:
  Inbound: SSH port 22 from 0.0.0.0/0

Region: Same as Atlas cluster (low latency)

Note IPv4 Public IP for Atlas IP whitelist.`,
      },
    ],
    tips: [
      'Use same region as Atlas cluster for best performance.',
      'm4.xlarge provides sufficient CPU for load generation.',
      'Set expire-on tag to avoid premature instance reaping.',
    ],
  },

  'scale-out.atlas-config': {
    id: 'scale-out.atlas-config',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Setup - Configure Atlas Environment',
    codeBlocks: [
      {
        filename: 'Atlas Configuration Checklist',
        language: 'text',
        code: `Atlas Setup for Scale-Out
=======================

1. Organization & Project
   - Create or select project

2. API Keys (Access Management)
   - Generate Programmatic API Key
   - Permission: Project Owner (creates clusters)
   - Save public and private keys

3. Database User
   - Add main_user, Atlas admin

4. Network Access (IP Whitelist)
   - Laptop IP
   - EC2 IPv4 Public IP
   - For API: Public API Whitelist must include EC2 IP`,
      },
    ],
    tips: [
      'Project Owner permission required for automated cluster creation.',
      'EC2 IP must be in both Database and API whitelists.',
      'Store API keys securely; never commit to version control.',
    ],
  },

  'scale-out.script-config': {
    id: 'scale-out.script-config',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Setup - Configure The Main Proof Scripts',
    codeBlocks: [
      {
        filename: 'atlas.properties',
        language: 'properties',
        code: `[Atlas]
api_public_key=your_public_key
api_private_key=your_private_key
atlas_user=main_user
atlas_pwd=your_password
project_name=Your Project Name
cluster_name=auto-scale-test
cluster_region=EU_WEST_2`,
        skeleton: `[Atlas]
api_public_key=_________
api_private_key=_________
atlas_user=_________
atlas_pwd=_________
project_name=_________
cluster_name=_________
cluster_region=_________`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Atlas API public key', answer: 'your_public_key' },
          { line: 3, blankText: '_________', hint: 'Atlas API private key', answer: 'your_private_key' },
          { line: 4, blankText: '_________', hint: 'Database username', answer: 'main_user' },
          { line: 5, blankText: '_________', hint: 'Database password', answer: 'your_password' },
          { line: 6, blankText: '_________', hint: 'Atlas project name', answer: 'Your Project Name' },
          { line: 7, blankText: '_________', hint: 'Cluster name to create', answer: 'auto-scale-test' },
          { line: 8, blankText: '_________', hint: 'AWS region (e.g. EU_WEST_2)', answer: 'EU_WEST_2' },
        ],
      },
      {
        filename: 'Install and Copy',
        language: 'bash',
        code: `# On EC2 - install Python deps
pip3 install --user pymongo dnspython requests configparser

# From laptop - copy scripts
scp -i key.pem atlas.properties.template Makefile \\
  MongoDBAtlasHelper.py run_test.py \\
  ec2-user@EC2_HOST:~/

# On EC2 - configure
cp atlas.properties.template atlas.properties
vi atlas.properties  # fill in values`,
      },
    ],
    tips: [
      'cluster_region must match Atlas region codes (e.g., EU_WEST_2).',
      'Use scp to copy files; ensure EC2 key has correct permissions.',
    ],
  },

  'scale-out.run-test': {
    id: 'scale-out.run-test',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Run Test',
        language: 'bash',
        code: `# Automated: creates cluster, adds shards via API (~2 hours)
make automatic

# Manual: use existing cluster, you add shards in Atlas UI
make manual`,
      },
    ],
    tips: [
      'Automated mode creates cluster; delete manually from Atlas UI when done.',
      'Manual mode: create 2-shard M40 cluster first, 160GB storage, 480 IOPS.',
      'Automated test inserts ~1 billion documents total.',
    ],
  },

  'scale-out.inspect-results': {
    id: 'scale-out.inspect-results',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'mongosh - View Results',
        language: 'javascript',
        code: `use test_results

// Latest test run
db.test_results.find({latest: true}).pretty()

// Or by test_id
db.test_results.find({test_id: "shard_test"}).sort({ts: -1}).limit(1)`,
        skeleton: `use test_results

db.test_results.find({_________: true}).pretty()`,
        inlineHints: [
          { line: 3, blankText: '_________', hint: 'Field to filter for most recent run', answer: 'latest' },
        ],
      },
    ],
    tips: [
      'latest: true marks the most recent test run.',
      'test_data contains arrays; use $unwind for charting.',
    ],
  },

  'scale-out.atlas-charts': {
    id: 'scale-out.atlas-charts',
    povCapability: 'SCALE-OUT',
    sourceProof: 'proofs/07/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Atlas Charts Setup',
        language: 'text',
        code: `Charts to Create (filter: {latest: true})

1. Batch Execution Time
   - Data: test_data.batch_execution_times
   - X: ts, Y: duration
   - Shows insert latency over time (should stay ~constant)

2. Chunk Counts
   - Data: test_data.chunk_counts
   - X: ts, Y: chunk_counts (array)
   - Shows balancer activity when shards added

3. Disk Capacity
   - Data: test_data.disk_sizes
   - X: ts, Y: disk_total
   - Capacity increases when shard added

4. Disk Used
   - Data: test_data.disk_sizes
   - X: ts, Y: disk_used
   - Data grows continuously with ingest`,
      },
    ],
    tips: [
      'Use $unwind on array fields if Charts requires flattened data.',
      'Spikes in batch execution time during balancer activity are expected.',
      'Dashboard demonstrates: constant latency + growing capacity = scale-out success.',
    ],
  },
};
