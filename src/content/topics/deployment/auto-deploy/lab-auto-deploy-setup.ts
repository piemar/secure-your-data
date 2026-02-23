import { WorkshopLabDefinition } from '@/types';

/**
 * Auto-Deploy Setup
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/11/README.md (AUTO-DEPLOY)
 * Environment setup: Python, requests, Atlas API keys, project ID.
 */
export const labAutoDeploySetupDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-deploy-setup',
  topicId: 'deployment',
  title: 'Auto-Deploy: Environment Setup',
  description:
    'Configure Python, the requests library, Atlas API keys, and project ID to prepare for automated cluster provisioning.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['deployment', 'atlas-api', 'python', 'automation', 'setup'],
  prerequisites: [
    'MongoDB Atlas account with SA credits',
  ],
  povCapabilities: ['AUTO-DEPLOY'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/11',
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-auto-deploy-setup-step-1',
      title: 'Step 1: Install Python and requests',
      narrative:
        'The proof uses a Python script that calls the Atlas REST API. Ensure Python 3 and the requests library are installed on your laptop.',
      instructions:
        'Install Python 3 per your OS. Verify: python3 --version. Install requests: pip3 install requests. Verify: python3 -c "import requests; print(requests.__version__)".',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 5,
      enhancementId: 'auto-deploy.python-setup',
      sourceProof: 'proofs/11/README.md',
      sourceSection: 'Setup',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-deploy-setup-step-2',
      title: 'Step 2: Create Atlas Organization and Project',
      narrative:
        'Atlas clusters are created under an Organization and Project. Create or identify the project you will use. Record the Project ID (not the name) from Project Settings.',
      instructions:
        'In Atlas: Account → Organizations. Create or select an organization. Create or select a project. Navigate to the project → Settings. Record the Project ID (e.g. 507f1f77bcf86cd799439011).',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'auto-deploy.atlas-setup',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
    {
      id: 'lab-auto-deploy-setup-step-3',
      title: 'Step 3: Generate Programmatic API Key',
      narrative:
        'The Atlas API requires authentication via API keys. Create a Programmatic API Key with Project Owner permission. Add your laptop IP to the API whitelist.',
      instructions:
        'In project: Access Management → API Keys. Create Programmatic API Key. Permission: Project Owner. Record Public Key and Private Key (private shown once). Add your laptop IP to the API whitelist (Account → API Keys → Whitelist).',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'auto-deploy.api-keys',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Setup',
    },
  ],
};
