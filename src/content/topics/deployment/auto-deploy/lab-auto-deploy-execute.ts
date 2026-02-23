import { WorkshopLabDefinition } from '@/types';

/**
 * Auto-Deploy Execute
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/11/README.md (AUTO-DEPLOY)
 * Run the Python script to provision a cluster via Atlas API and measure creation time.
 */
export const labAutoDeployExecuteDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-deploy-execute',
  topicId: 'deployment',
  title: 'Auto-Deploy: Execute Cluster Provisioning',
  description:
    'Configure and run the auto_deploy_atlas.py script to create a production-ready M30 cluster via the Atlas API, then verify it is ready within 5–10 minutes.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 25,
  tags: ['deployment', 'atlas-api', 'python', 'automation', 'provisioning'],
  prerequisites: [
    'lab-auto-deploy-setup completed (Python, API keys, Project ID)',
    'auto_deploy_atlas.py from proofs/11/',
  ],
  povCapabilities: ['AUTO-DEPLOY'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/11',
  dataRequirements: [
    {
      id: 'auto-deploy-script',
      description: 'auto_deploy_atlas.py provisioning script',
      type: 'file',
      path: 'auto_deploy_atlas.py',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '~2KB',
    },
  ],
  modes: ['lab', 'demo'],
  steps: [
    {
      id: 'lab-auto-deploy-execute-step-1',
      title: 'Step 1: Configure the Python Script',
      narrative:
        'Edit auto_deploy_atlas.py and set apiPublicKey, apiPrivateKey, and projectId with your Atlas credentials. Optionally adjust cluster configuration (name, region, instance size).',
      instructions:
        'Open auto_deploy_atlas.py. Set apiPublicKey, apiPrivateKey, projectId. Optional: change clusterName, regionName (e.g. US_EAST_1), instanceSizeName (e.g. M10). Save the file.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'auto-deploy.configure',
      sourceProof: 'proofs/11/README.md',
      sourceSection: 'Execution',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-deploy-execute-step-2',
      title: 'Step 2: Run the Provisioning Script',
      narrative:
        'Execute the script. It will POST to the Atlas API to create the cluster, then poll every 5 seconds until the cluster state changes from CREATING to IDLE. Typical time: 5–10 minutes.',
      instructions:
        'Make executable: chmod +x auto_deploy_atlas.py. Run: ./auto_deploy_atlas.py. Watch the output: cluster status CREATING, then IDLE. Script reports total creation time. Place Atlas UI side-by-side to show cluster creation in progress.',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo'],
      points: 15,
      enhancementId: 'auto-deploy.execute',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-auto-deploy-execute-step-3',
      title: 'Step 3: Verify Cluster and Measure',
      narrative:
        'When the script reports IDLE, the cluster is ready. The Atlas UI will show the cluster as available. Record the creation time for the proof report—target is within X minutes (typically 5–10).',
      instructions:
        'In Atlas UI: verify cluster is listed and status is ready. Note connection string. Record creation time from script output (e.g. 0:03:50). Target: 5–10 minutes depending on cloud/region. Document for proof report.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo'],
      points: 10,
      enhancementId: 'auto-deploy.verify',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Measurement',
    },
  ],
};
