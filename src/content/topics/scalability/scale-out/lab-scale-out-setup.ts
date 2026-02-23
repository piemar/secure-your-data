import { WorkshopLabDefinition } from '@/types';

/**
 * Scale-Out: Environment Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/07/README.md (SCALE-OUT)
 * Covers AWS EC2 setup, Atlas configuration, API keys, and proof script deployment.
 */
export const labScaleOutSetupDefinition: WorkshopLabDefinition = {
  id: 'lab-scale-out-setup',
  topicId: 'scalability',
  title: 'Scale-Out: Environment Setup',
  description:
    'Configure AWS EC2, MongoDB Atlas project, API keys, and deploy the scale-out proof scripts. Supports both automated (API-driven) and manual cluster provisioning modes.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['scale-out', 'atlas', 'aws', 'api', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
    'AWS account access',
    'Python 3',
  ],
  povCapabilities: ['SCALE-OUT'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/07',
  dataRequirements: [
    {
      id: 'atlas-properties-template',
      description: 'Atlas API and cluster config template',
      type: 'file',
      path: 'atlas.properties.template',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '1KB',
    },
    {
      id: 'makefile',
      description: 'Build targets for automated/manual test',
      type: 'file',
      path: 'Makefile',
      sizeHint: '2KB',
    },
    {
      id: 'mongodb-atlas-helper',
      description: 'Atlas API helper for cluster creation',
      type: 'script',
      path: 'MongoDBAtlasHelper.py',
      sizeHint: '10KB',
    },
    {
      id: 'run-test-py',
      description: 'Load generation and metrics script',
      type: 'script',
      path: 'run_test.py',
      sizeHint: '15KB',
    },
  ],
  steps: [
    {
      id: 'lab-scale-out-setup-step-1',
      title: 'Step 1: Create AWS EC2 Instance',
      narrative:
        'Launch an EC2 instance in the same region as your Atlas cluster. Use Amazon Linux 2023 AMI and m4.xlarge instance type. The instance runs the load generation and metrics collection scripts.',
      instructions:
        '- Log into AWS Console, select region matching your Atlas cluster\n- Launch EC2: Amazon Linux 2023 AMI, m4.xlarge\n- Add tags: Name, owner, expire-on (per MongoDB AWS guidelines)\n- Security group: allow SSH (port 22) from 0.0.0.0/0\n- Note the IPv4 Public IP for Atlas IP whitelist\n- SSH into the instance to verify connectivity',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      points: 10,
      enhancementId: 'scale-out.aws-setup',
      sourceProof: 'proofs/07/README.md',
      sourceSection: 'Setup - Create AWS Environment',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-scale-out-setup-step-2',
      title: 'Step 2: Configure Atlas and API Keys',
      narrative:
        'Create an Atlas project, generate a Programmatic API Key with Project Owner permission, add a database user (main_user), and whitelist both your laptop IP and the EC2 instance IP.',
      instructions:
        '- Create or select an Atlas Organization and Project\n- Access Management → API Keys → Generate Programmatic API Key\n- Grant Project Owner permission (needed to create clusters)\n- Security → Database Access: add main_user with Atlas admin\n- Security → Network Access: whitelist laptop IP and EC2 IPv4 Public IP\n- Note: EC2 IP must be in both Database and Public API whitelist',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      points: 15,
      enhancementId: 'scale-out.atlas-config',
      sourceProof: 'proofs/07/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup - Configure Atlas Environment',
    },
    {
      id: 'lab-scale-out-setup-step-3',
      title: 'Step 3: Deploy Proof Scripts and Configure',
      narrative:
        'Install Python dependencies on EC2, copy the proof scripts via SCP, and configure atlas.properties with your API keys, user credentials, project name, cluster name, and region.',
      instructions:
        '- On EC2: `sudo yum -y install python3`; install pip; `pip3 install pymongo dnspython requests configparser`\n- From laptop: `scp -i key.pem atlas.properties.template Makefile MongoDBAtlasHelper.py run_test.py ec2-user@EC2_HOST:~/`\n- On EC2: `cp atlas.properties.template atlas.properties`\n- Edit atlas.properties: api_public_key, api_private_key, atlas_user, atlas_pwd, project_name, cluster_name, cluster_region',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      points: 15,
      enhancementId: 'scale-out.script-config',
      sourceProof: 'proofs/07/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup - Configure The Main Proof Scripts',
    },
  ],
};
