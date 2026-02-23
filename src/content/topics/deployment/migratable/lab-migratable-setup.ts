import { WorkshopLabDefinition } from '@/types';

/**
 * Migratable Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/09/README.md (MIGRATABLE)
 * Environment setup: Atlas cluster, source cluster on EC2, POCDriver, network config.
 */
export const labMigratableSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-migratable-setup',
  topicId: 'deployment',
  title: 'Migratable: Environment Setup',
  description:
    'Configure Atlas destination cluster, on-prem source replica set, and the load generator (POCDriver) to prepare for Live Migration.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['migration', 'atlas', 'ec2', 'live-migration', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
    'AWS account access',
    'SSH key for EC2',
  ],
  povCapabilities: ['MIGRATABLE'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/09',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-migratable-setup-step-1',
      title: 'Step 1: Create Atlas Destination Cluster',
      narrative:
        'Create an M30 3-node replica set in Atlas as the migration target. Note the CIDR blocks required for Live Migration—these must be allowed in the source cluster firewall.',
      instructions:
        'Create M30 3-node replica set in Atlas (single AWS region). Add user main_user with readWriteAnyDatabase and clusterMonitor. Click cluster ... → Migrate Data to this Cluster → I\'m ready to migrate. Copy the two CIDR blocks for firewall config. Copy the connection string for later.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'migratable.atlas-setup',
      sourceProof: 'proofs/09/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-migratable-setup-step-2',
      title: 'Step 2: Launch Source Cluster on EC2',
      narrative:
        'Deploy a single-node replica set on an EC2 instance. This simulates an on-prem MongoDB deployment. Configure mongod.conf with replSetName, bind to 0.0.0.0, and initialize the replica set.',
      instructions:
        'Launch EC2 (m4.xlarge, Amazon Linux 2). Security group: SSH 22, CustomTCP 27017 from Atlas CIDR blocks and VPC subnet. Install mongodb-enterprise. Edit /etc/mongod.conf: bindIp 0.0.0.0, replication.replSetName rsMigration. Start mongod. Run rs.initiate() and rs.config() in mongo shell. Note Public DNS for connection string.',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'migratable.source-setup',
      sourceProof: 'proofs/09/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-migratable-setup-step-3',
      title: 'Step 3: Install POCDriver on Second EC2',
      narrative:
        'POCDriver simulates an application writing to the database. Install Java, Maven, and build the POCDriver JAR on a second EC2 instance. This instance will run the load generator during migration.',
      instructions:
        'Launch second EC2 in same VPC. Install: sudo yum -y install maven. Download POCDriver from GitHub, unzip, run mvn clean package. Verify POCDriver.jar in bin/. Add both EC2 public IPs to Atlas IP whitelist. Test connectivity from POCDriver host to source and Atlas.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'migratable.pocdriver-setup',
      sourceProof: 'proofs/09/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
