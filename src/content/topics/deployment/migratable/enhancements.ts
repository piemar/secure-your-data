import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Migratable Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/09/README.md (MIGRATABLE)
 * On-prem to Atlas migration with Live Migration, minimal downtime.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'migratable.concepts': {
    id: 'migratable.concepts',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Live Migration Flow',
        language: 'text',
        code: `MongoDB Live Migration
====================

1. Initial Sync
   → Full copy of source data to Atlas
   → Progress visible in Atlas cluster overview

2. Continuous Oplog Tailing
   → Source oplog streamed to Atlas
   → Replication lag shows catch-up progress
   → Application can keep writing to source

3. Cutover
   → Stop writes to source
   → Start Cutover in Atlas
   → Point application to Atlas
   → Restart application
   → Downtime: typically < 1 minute`,
      },
    ],
    tips: [
      'Live Migration uses the same replication protocol as replica sets.',
      'The source must be a replica set (or standalone with rs.initiate()).',
      'Cutover is the only moment of application downtime.',
      'Atlas provides CIDR blocks for firewall configuration.',
    ],
  },

  'migratable.cutover': {
    id: 'migratable.cutover',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Cutover Sequence',
        language: 'text',
        code: `Cutover Steps (measure with stopwatch)
========================================

1. Stop application writing to source
2. Atlas Console → Start Cutover
3. Update connection string to Atlas URI
4. Restart application
5. Stop stopwatch

Target: < 1 minute elapsed

Connection string change:
  FROM: mongodb://source-host:27017/?replicaSet=rsMigration
  TO:   mongodb+srv://user:pass@cluster.mongodb.net/`,
      },
    ],
    tips: [
      'Start the stopwatch when you stop the application.',
      'Stop the stopwatch when the application is writing to Atlas again.',
      'POCDriver -e flag empties the collection; omit it when restarting.',
    ],
  },

  'migratable.prerequisites': {
    id: 'migratable.prerequisites',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Network Requirements',
        language: 'text',
        code: `Live Migration Prerequisites
============================

Source cluster:
  - Replica set (rs.initiate() for standalone)
  - Port 27017 accessible from Atlas

Firewall / Security Group:
  - Allow Atlas Live Migration CIDR blocks (2 blocks)
  - Get from: Atlas → ... → Migrate Data → I'm ready to migrate

Example security group rules:
  - CustomTCP 27017 from 52.56.155.160/32
  - CustomTCP 27017 from 35.176.204.43/32
  - CustomTCP 27017 from your VPC subnet (e.g. 172.32.0.0/20)`,
      },
    ],
    tips: [
      'Atlas CIDR blocks are region-specific; use the ones shown for your cluster.',
      'Source can run without authentication for the proof.',
      'Same AWS region for source and Atlas reduces latency.',
    ],
  },

  'migratable.atlas-setup': {
    id: 'migratable.atlas-setup',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Cluster Config',
        language: 'text',
        code: `Atlas Destination Cluster
=========================

Cluster: M30, 3-node replica set
Region: Match source (e.g. us-east-1)

User: main_user
Roles: readWriteAnyDatabase, clusterMonitor

CIDR blocks for Live Migration:
  - Atlas → Cluster → ... → Migrate Data to this Cluster
  - I'm ready to migrate
  - Copy the two CIDR blocks shown
  - Add to source EC2 security group inbound rules`,
      },
    ],
    tips: [
      'M30 provides sufficient capacity for the proof workload.',
      'Backup can be disabled to reduce cost during the proof.',
      'Note the connection string for the cutover step.',
    ],
  },

  'migratable.source-setup': {
    id: 'migratable.source-setup',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'mongod.conf',
        language: 'yaml',
        code: `# /etc/mongod.conf
net:
  port: 27017
  bindIp: 0.0.0.0

replication:
  replSetName: rsMigration`,
        skeleton: `# /etc/mongod.conf
net:
  port: 27017
  bindIp: _________

replication:
  replSetName: _________`,
        inlineHints: [
          { line: 4, blankText: '_________', hint: 'Bind to all interfaces for remote access', answer: '0.0.0.0' },
          { line: 7, blankText: '_________', hint: 'Replica set name used in connection string', answer: 'rsMigration' },
        ],
      },
    ],
    tips: [
      'bindIp 0.0.0.0 allows Atlas Live Migration to connect.',
      'Set hostname: sudo hostnamectl set-hostname PUBLIC-DNS.compute.amazonaws.com',
      'rs.initiate() initializes the single-node replica set.',
    ],
  },

  'migratable.pocdriver-setup': {
    id: 'migratable.pocdriver-setup',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'POCDriver Build',
        language: 'bash',
        code: `# Install and build POCDriver
sudo yum -y install maven
wget https://github.com/johnlpage/POCDriver/archive/master.zip
unzip master.zip
cd POCDriver*
mvn clean package
cd bin
ls POCDriver.jar   # Verify JAR exists`,
        skeleton: `# Install and build POCDriver
sudo yum -y install _________
wget https://github.com/johnlpage/POCDriver/archive/master.zip
unzip master.zip
cd POCDriver*
_________ clean package
cd bin
ls POCDriver.jar`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Build tool that pulls Java as dependency', answer: 'maven' },
          { line: 6, blankText: '_________', hint: 'Maven goal to compile and package', answer: 'mvn' },
        ],
      },
    ],
    tips: [
      'POCDriver simulates application writes during migration.',
      'Run POCDriver from the second EC2 instance.',
      'Add both EC2 public IPs to Atlas IP whitelist.',
    ],
  },

  'migratable.initiate': {
    id: 'migratable.initiate',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'POCDriver Initial Load',
        language: 'bash',
        code: `# Generate ~900MB in 1 minute (-e empties first)
java -jar POCDriver.jar -c "mongodb://SOURCE-DNS:27017/?replicaSet=rsMigration" \\
  -t 1 -e -d 60 -f 25 -a 5:5 --depth 2 -x 3

# Restart for live migration (no -e, limit ops/sec)
java -jar POCDriver.jar -c "mongodb://SOURCE-DNS:27017/?replicaSet=rsMigration" \\
  -t 1 -d 600 -q 100 -f 25 -a 5:5 --depth 2 -x 3`,
        skeleton: `# Initial load: -e empties, -d 60 = 1 minute
java -jar POCDriver.jar -c "mongodb://_________/..." -t 1 -e -d 60 ...

# Live tailing: no -e, -q 100 limits ops/sec
java -jar POCDriver.jar -c "mongodb://_________/..." -t 1 -d 600 -q _________ ...`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Source host:port or Public DNS', answer: 'SOURCE-DNS' },
          { line: 6, blankText: '_________', hint: 'Source host:port', answer: 'SOURCE-DNS' },
          { line: 6, blankText: '_________', hint: 'Limit operations per second for catch-up', answer: '100' },
        ],
      },
    ],
    tips: [
      '-e flag empties the collection; use only for initial load.',
      '-q 100 limits write rate so migration can catch up.',
      'Watch Atlas Metrics | Collections for POCDB.POCCOLL growth.',
    ],
  },

  'migratable.cutover-execute': {
    id: 'migratable.cutover-execute',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Cutover Commands',
        language: 'bash',
        code: `# 1. Stop POCDriver (Ctrl+C)
# 2. START STOPWATCH
# 3. Atlas Console → Start Cutover
# 4. Update -c to Atlas URI, restart:

java -jar POCDriver.jar -c "mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true" \\
  -t 1 -d 600 -f 25 -a 5:5 --depth 2 -x 3

# 5. STOP STOPWATCH`,
        skeleton: `# After cutover, point to Atlas:
java -jar POCDriver.jar -c "mongodb+srv://_________" \\
  -t 1 -d 600 -f 25 -a 5:5 --depth 2 -x 3`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Atlas connection string (user:pass@cluster.mongodb.net)', answer: 'user:pass@cluster.mongodb.net' },
        ],
      },
    ],
    tips: [
      'Do NOT use -e when restarting; that would empty Atlas.',
      'RetryWrites is enabled by default in Atlas connection strings.',
      'Elapsed time from stop to restart should be < 1 minute.',
    ],
  },

  'migratable.verify': {
    id: 'migratable.verify',
    povCapability: 'MIGRATABLE',
    sourceProof: 'proofs/09/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Verification',
        language: 'text',
        code: `Migration Verification
====================

1. Atlas Metrics | Collections
   → POCDB.POCCOLL document count increasing
   → Confirms POCDriver writing to Atlas

2. Stopwatch
   → Elapsed time < 1 minute
   → Proves minimal downtime

3. Optional: Compass
   → Connect to Atlas cluster
   → Browse POCDB.POCCOLL
   → Verify document structure`,
      },
    ],
    tips: [
      'Collection size grows as POCDriver continues inserting.',
      'No data loss: all source data + live tail = complete dataset.',
      'Record stopwatch time for the proof report.',
    ],
  },
};
