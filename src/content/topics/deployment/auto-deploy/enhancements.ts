import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Auto-Deploy Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/11/README.md (AUTO-DEPLOY)
 * Automated cluster provisioning via Atlas API, single command, 5–10 minutes.
 */

export const enhancements: EnhancementMetadataRegistry = {
  'auto-deploy.concepts': {
    id: 'auto-deploy.concepts',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Atlas API for Provisioning',
        language: 'text',
        code: `Atlas Admin API - Cluster Provisioning
====================================

REST API for programmatic cluster management:
  - POST /groups/{projectId}/clusters → Create cluster
  - GET /groups/{projectId}/clusters/{name} → Check status

Cluster creation is asynchronous:
  - POST returns 201 (Accepted)
  - stateName: CREATING → IDLE
  - Typical: 5–10 minutes

Benefits:
  - Single command deployment
  - No manual UI clicks
  - Consistent config (dev/test/prod)
  - Reduces human error`,
      },
    ],
    tips: [
      'Atlas API uses HTTP Digest auth with API keys.',
      'Cluster config: instance size, region, backup, encryption.',
      'Compare to manual: 10+ steps, prone to drift.',
    ],
  },

  'auto-deploy.flow': {
    id: 'auto-deploy.flow',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Script Flow',
        language: 'text',
        code: `Auto-Deploy Script Flow
=====================

1. POST /clusters with JSON payload
   → Atlas accepts, returns 201

2. Poll GET /clusters/{name} every 5 seconds
   → stateName: CREATING (provisioning)
   → stateName: IDLE (ready)

3. Report total creation time
   → Typically 5–10 minutes
   → Depends on cloud provider, region, size`,
      },
    ],
    tips: [
      'Script uses 15-minute timeout by default.',
      'Place Atlas UI side-by-side during demo.',
      'CREATING = Atlas provisioning VMs, installing MongoDB.',
    ],
  },

  'auto-deploy.config': {
    id: 'auto-deploy.config',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Cluster Payload',
        language: 'json',
        code: `{
  "name": "SA-PoV",
  "clusterType": "REPLICASET",
  "mongoDBMajorVersion": "5.0",
  "numShards": 1,
  "providerSettings": {
    "providerName": "AWS",
    "regionName": "US_WEST_2",
    "instanceSizeName": "M30",
    "encryptEBSVolume": true
  },
  "replicationFactor": 3,
  "providerBackupEnabled": true,
  "autoScaling": { "diskGBEnabled": true }
}`,
        skeleton: `{
  "name": "_________",
  "clusterType": "REPLICASET",
  "providerSettings": {
    "providerName": "_________",
    "regionName": "_________",
    "instanceSizeName": "_________"
  },
  "replicationFactor": _________,
  "providerBackupEnabled": _________
}`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Cluster name (e.g. SA-PoV)', answer: 'SA-PoV' },
          { line: 6, blankText: '_________', hint: 'Cloud provider: AWS, AZURE, or GCP', answer: 'AWS' },
          { line: 7, blankText: '_________', hint: 'Region (e.g. US_WEST_2, US_EAST_1)', answer: 'US_WEST_2' },
          { line: 8, blankText: '_________', hint: 'Instance size (e.g. M10, M30)', answer: 'M30' },
          { line: 11, blankText: '_________', hint: 'Number of replica set members', answer: '3' },
          { line: 12, blankText: '_________', hint: 'Enable continuous backup', answer: 'true' },
        ],
      },
    ],
    tips: [
      'See Atlas API docs for full request body parameters.',
      'M30 = production-ready; M10 = dev/test.',
      'encryptEBSVolume ensures encryption at rest.',
    ],
  },

  'auto-deploy.python-setup': {
    id: 'auto-deploy.python-setup',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Python Setup',
        language: 'bash',
        code: `# Install Python 3 (if needed)
# macOS: brew install python3
# Ubuntu: sudo apt install python3 python3-pip

# Install requests library
pip3 install requests

# Verify
python3 --version
python3 -c "import requests; print(requests.__version__)"`,
        skeleton: `# Install requests
pip3 install _________

# Verify
python3 -c "import _________ ; print(requests.__version__)"`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'HTTP library for Python', answer: 'requests' },
          { line: 5, blankText: '_________', hint: 'Module name for requests', answer: 'requests' },
        ],
      },
    ],
    tips: [
      'Python 3.6+ required.',
      'requests is used for HTTP Digest auth.',
      'Use pip3 or python3 -m pip.',
    ],
  },

  'auto-deploy.atlas-setup': {
    id: 'auto-deploy.atlas-setup',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'Atlas Project',
        language: 'text',
        code: `Atlas Organization & Project
============================

1. Account → Organizations
   → Create or select organization

2. Create or select Project
   → Projects contain clusters

3. Project → Settings
   → Record Project ID (not name!)
   → Example: 507f1f77bcf86cd799439011

Project ID is used in API URLs:
  /groups/{projectId}/clusters`,
      },
    ],
    tips: [
      'Project ID is in Settings, not the project name.',
      'One project can have multiple clusters.',
      'Organization is for billing and access control.',
    ],
  },

  'auto-deploy.api-keys': {
    id: 'auto-deploy.api-keys',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Setup',
    codeBlocks: [
      {
        filename: 'API Key Setup',
        language: 'text',
        code: `Programmatic API Key
==================

1. Project → Access Management → API Keys
2. Create Programmatic API Key
3. Permission: Project Owner (needed for cluster create)
4. Record Public Key and Private Key (private shown once!)
5. Account → API Keys → Whitelist
   → Add your laptop IP (where script runs)

Security: Never commit keys to git. Use env vars.`,
      },
    ],
    tips: [
      'Project Owner allows cluster creation.',
      'IP whitelist must include script execution host.',
      'Private key is shown only at creation.',
    ],
  },

  'auto-deploy.configure': {
    id: 'auto-deploy.configure',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Script Variables',
        language: 'python',
        code: `# Edit auto_deploy_atlas.py - replace these:
apiPublicKey  = "ATLAS-API-PUBLIC-KEY"
apiPrivateKey = "ATLAS-API-PRIVATE-KEY"
projectId     = "ATLAS-PROJECTID"
clusterName   = "SA-PoV"  # optional`,
        skeleton: `apiPublicKey  = "_________"
apiPrivateKey = "_________"
projectId     = "_________"`,
        inlineHints: [
          { line: 1, blankText: '_________', hint: 'API key public part from Atlas', answer: 'ATLAS-API-PUBLIC-KEY' },
          { line: 2, blankText: '_________', hint: 'API key private part (shown once)', answer: 'ATLAS-API-PRIVATE-KEY' },
          { line: 3, blankText: '_________', hint: 'Project ID from Project Settings', answer: 'ATLAS-PROJECTID' },
        ],
      },
    ],
    tips: [
      'Get Project ID from Project → Settings.',
      'Cluster name must be unique in the project.',
      'Optional: change payload for different config.',
    ],
  },

  'auto-deploy.execute': {
    id: 'auto-deploy.execute',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Run Script',
        language: 'bash',
        code: `# Make executable
chmod +x auto_deploy_atlas.py

# Run (cluster creation ~5-10 min)
./auto_deploy_atlas.py

# Output:
# Creating cluster: SA-PoV
# Cluster status: CREATING
# ...
# Cluster status: IDLE
# Cluster created in: 0:03:50`,
        skeleton: `chmod +x _________
./_________`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'Python script filename', answer: 'auto_deploy_atlas.py' },
          { line: 3, blankText: '_________', hint: 'Same script to execute', answer: 'auto_deploy_atlas.py' },
        ],
      },
    ],
    tips: [
      'Script polls every 5 seconds.',
      '15-minute timeout by default.',
      'Place Atlas UI side-by-side for demo.',
    ],
  },

  'auto-deploy.verify': {
    id: 'auto-deploy.verify',
    povCapability: 'AUTO-DEPLOY',
    sourceProof: 'proofs/11/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Verification',
        language: 'text',
        code: `Auto-Deploy Verification
=======================

1. Script output: stateName IDLE
   → Cluster ready for connections

2. Atlas UI: Cluster listed, status ready
   → Connection string available

3. Creation time
   → Target: 5–10 minutes
   → Record for proof report
   → Example: 0:03:50 (3 min 50 sec)`,
      },
    ],
    tips: [
      'IDLE means cluster is fully provisioned.',
      'Time varies by cloud, region, instance size.',
      'M30 typically 5–8 minutes on AWS.',
    ],
  },
};
