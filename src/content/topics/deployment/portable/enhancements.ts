import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Portable Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/10/README.md (PORTABLE)
 * Cloud-to-cloud migration (e.g. AWS → Azure) with Live Migration, minimal downtime.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'portable.concepts': {
    id: 'portable.concepts',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Cloud-to-Cloud Migration Flow',
        language: 'text',
        code: `MongoDB Portable (Cloud-to-Cloud)
====================================

1. Source: Atlas cluster in AWS (e.g. AWSTestCluster)
2. Target: Atlas cluster in Azure (e.g. AzureTestCluster)
3. Same Live Migration flow:
   - Initial sync
   - Continuous oplog tailing
   - Cutover

4. Benefit: Avoid cloud vendor lock-in
   - Migrate AWS → Azure, Azure → GCP, etc.
   - < 1 minute scheduled downtime
   - No data loss`,
      },
    ],
    tips: [
      'Both source and target are Atlas clusters—just in different clouds.',
      'Live Migration uses the same replication protocol as MIGRATABLE.',
      'Cutover is the only moment of application downtime.',
      'Use mgeneratejs + mongoimport for load generation (proof uses insurance customer data).',
    ],
  },

  'portable.cutover': {
    id: 'portable.cutover',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Cutover Sequence',
        language: 'text',
        code: `Cutover Steps (measure with stopwatch)
========================================

1. Stop mgeneratejs writing to source (AWS)
2. Atlas Console (Azure cluster) → Start Cutover
3. Update mongoimport URI to Azure cluster
4. Restart mgeneratejs | mongoimport
5. Stop stopwatch

Target: < 1 minute elapsed

Connection string change:
  FROM: mongodb+srv://...@awstestcluster-xxxx.mongodb.net/test
  TO:   mongodb+srv://...@azuretestcluster-xxxx.mongodb.net/test`,
      },
    ],
    tips: [
      'Start the stopwatch when you stop the load generator.',
      'Stop the stopwatch when the load generator is writing to Azure again.',
      'Both clusters use Atlas SRV connection strings.',
    ],
  },

  'portable.prerequisites': {
    id: 'portable.prerequisites',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Network Requirements',
        language: 'text',
        code: `Portable Migration Prerequisites
===============================

Source: Atlas cluster in one cloud (e.g. AWS)
Target: Atlas cluster in another cloud (e.g. Azure)

IP Whitelist:
  - Add the two CIDR blocks from Migrate Data dialog
  - Get from: Target cluster → ... → Migrate Data → I'm ready to migrate

Hostname for Migration Tool:
  - Migration tool cannot use SRV format
  - Use non-SRV: first primary hostname only
  - Example: awstestcluster-shard-00-00-abcd.mongodb.net
  - Get from: Connect → earliest Node.js version`,
      },
    ],
    tips: [
      'CIDR blocks are shown when you click Migrate Data on the target cluster.',
      'Both clusters must be in the same Atlas project.',
      'M30 for both clusters provides sufficient capacity.',
    ],
  },

  'portable.atlas-setup': {
    id: 'portable.atlas-setup',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Cluster Config',
        language: 'text',
        code: `Portable: Two Atlas Clusters
============================

Source (AWS):
  - M30, 3-node replica set
  - Region: AWS (e.g. us-east-1)
  - Name: AWSTestCluster
  - Backup: can disable

Target (Azure):
  - M30, 3-node replica set
  - Region: Azure (e.g. eastus)
  - Name: AzureTestCluster
  - Backup: can disable

User: main_user
Roles: readWriteAnyDatabase, clusterMonitor

CIDR blocks:
  - AzureTestCluster → ... → Migrate Data to this Cluster
  - I'm ready to migrate
  - Add both CIDR blocks to IP Whitelist`,
      },
    ],
    tips: [
      'Use different cloud providers to demonstrate portability.',
      'Same region within each cloud reduces latency.',
      'Note both connection strings for the execute lab.',
    ],
  },

  'portable.connection-strings': {
    id: 'portable.connection-strings',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Connection Strings',
        language: 'text',
        code: `Connection Strings for Portable
==============================

For mgeneratejs | mongoimport (SRV OK):
  - AWSTestCluster: mongodb+srv://main_user:PASS@awstestcluster-xxxx.mongodb.net/test
  - AzureTestCluster: mongodb+srv://main_user:PASS@azuretestcluster-xxxx.mongodb.net/test

For Migration Tool (non-SRV required):
  - AWSTestCluster primary hostname only
  - Example: awstestcluster-shard-00-00-xxxx.mongodb.net
  - Get: Connect → earliest Node.js version → copy first host`,
      },
    ],
    tips: [
      'The migration tool cannot resolve SRV records.',
      'Use the first primary hostname from the replica set.',
      'Port 27017 is implied for Atlas.',
    ],
  },

  'portable.mgeneratejs-setup': {
    id: 'portable.mgeneratejs-setup',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'mgeneratejs Install',
        language: 'bash',
        code: `# Install mgeneratejs globally
npm install -g mgeneratejs

# Verify
mgeneratejs --help

# Download template (from proofs/10/)
# CustomerSingleView.json - insurance customer records`,
        skeleton: `# Install mgeneratejs
npm install -g _________

# Verify
_________ --help`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'NPM package for JSON document generation', answer: 'mgeneratejs' },
          { line: 5, blankText: '_________', hint: 'Command to run mgeneratejs', answer: 'mgeneratejs' },
        ],
      },
    ],
    tips: [
      'mgeneratejs uses a JSON template to generate documents.',
      'CustomerSingleView.json creates insurance customer single-view records.',
      'Pipe to mongoimport for direct insert into MongoDB.',
    ],
  },

  'portable.initiate': {
    id: 'portable.initiate',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Initial Load and Migration',
        language: 'bash',
        code: `# Initial load: 200k documents (~10 min)
mgeneratejs CustomerSingleView.json -n 200000 | mongoimport \\
  --uri "mongodb+srv://main_user:PASS@awstestcluster-xxxx.mongodb.net/test" \\
  --collection customers

# After initial sync, restart for live tailing (same command)
# Migration: AzureTestCluster → Migrate Data
# Hostname: awstestcluster-shard-00-00-xxxx.mongodb.net (non-SRV)
# Validate → Start Migration
# Wait for replication lag near zero`,
        skeleton: `# Load 200k insurance customer records
mgeneratejs CustomerSingleView.json -n _________ | mongoimport \\
  --uri "mongodb+srv://_________/test" --collection customers`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Number of documents to generate', answer: '200000' },
          { line: 3, blankText: '_________', hint: 'AWSTestCluster connection string (user:pass@cluster.mongodb.net)', answer: 'main_user:PASS@awstestcluster-xxxx.mongodb.net' },
        ],
      },
    ],
    tips: [
      'Initial load takes ~10 minutes for 200k documents.',
      'Restart the same command during migration for live tailing.',
      'Watch Metrics | Collections for test.customers in both clusters.',
    ],
  },

  'portable.cutover-execute': {
    id: 'portable.cutover-execute',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Cutover Commands',
        language: 'bash',
        code: `# 1. Stop mgeneratejs (Ctrl+C)
# 2. START STOPWATCH
# 3. Atlas → AzureTestCluster → Start Cutover
# 4. Update URI to Azure, restart:

mgeneratejs CustomerSingleView.json -n 200000 | mongoimport \\
  --uri "mongodb+srv://main_user:PASS@azuretestcluster-xxxx.mongodb.net/test" \\
  --collection customers

# 5. STOP STOPWATCH`,
        skeleton: `# After cutover, point to Azure cluster:
mgeneratejs CustomerSingleView.json -n 200000 | mongoimport \\
  --uri "mongodb+srv://_________/test" --collection customers`,
        inlineHints: [
          { line: 3, blankText: '_________', hint: 'AzureTestCluster connection string', answer: 'main_user:PASS@azuretestcluster-xxxx.mongodb.net' },
        ],
      },
    ],
    tips: [
      'Elapsed time from stop to restart should be < 1 minute.',
      'Use the same mgeneratejs command; only the URI changes.',
      'Document count in Azure should continue increasing.',
    ],
  },

  'portable.verify': {
    id: 'portable.verify',
    povCapability: 'PORTABLE',
    sourceProof: 'proofs/10/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Verification',
        language: 'text',
        code: `Migration Verification
====================

1. Atlas Metrics | Collections
   → AWSTestCluster test.customers: NOT increasing
   → AzureTestCluster test.customers: IS increasing

2. Stopwatch
   → Elapsed time < 1 minute
   → Proves minimal downtime

3. Cloud portability demonstrated
   → Data migrated AWS → Azure
   → No vendor lock-in`,
      },
    ],
    tips: [
      'Source count stops when load generator switches to target.',
      'Target count continues as mgeneratejs writes to Azure.',
      'Record stopwatch time for the proof report.',
    ],
  },
};
