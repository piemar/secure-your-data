import { WorkshopLabDefinition } from '@/types';

/**
 * Auto-Deploy Overview
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/11/README.md (AUTO-DEPLOY)
 * Introduces MongoDB Atlas API for automated cluster provisioning with a single command.
 */
export const labAutoDeployOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-auto-deploy-overview',
  topicId: 'deployment',
  title: 'Auto-Deploy Overview',
  description:
    'Learn how MongoDB Atlas API enables automated deployment of a production-ready cluster within 5–10 minutes of invoking a single command, with full control over configuration.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 20,
  tags: ['deployment', 'atlas-api', 'automation', 'provisioning', 'infrastructure'],
  prerequisites: [
    'MongoDB Atlas account',
    'Basic understanding of cloud deployment',
  ],
  povCapabilities: ['AUTO-DEPLOY'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Atlas API', explanation: 'REST API for programmatic cluster management—create, update, delete clusters.' },
    { term: 'Cluster Provisioning', explanation: 'Single API call creates a production-ready cluster in 5–10 minutes.' },
    { term: 'Asynchronous Creation', explanation: 'POST returns 201; cluster state goes CREATING → IDLE when ready.' },
    { term: 'Production-Ready', explanation: 'Replica set, backup, encryption, and auto-scaling configured by default.' },
  ],
  steps: [
    {
      id: 'lab-auto-deploy-overview-step-1',
      title: 'Step 1: Understand Atlas API for Cluster Provisioning',
      narrative:
        'MongoDB Atlas exposes a REST API for programmatic cluster management. A single API call can create a production-ready cluster with replica set, backup, encryption, and auto-scaling—reducing manual steps and human error.',
      instructions:
        '- Review the Atlas Admin API: clusters, projects, users, IP whitelist\n- Understand that cluster creation is asynchronous: POST returns 201, cluster goes CREATING → IDLE\n- Learn that the API supports full configuration: instance size, region, backup, encryption\n- Identify the benefit: deploy dev/test/prod clusters consistently in minutes',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 5,
      enhancementId: 'auto-deploy.concepts',
      sourceProof: 'proofs/11/README.md',
      sourceSection: 'Description',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],
    },
    {
      id: 'lab-auto-deploy-overview-step-2',
      title: 'Step 2: Single Command Deployment',
      narrative:
        'A Python script (or similar) invokes the Atlas API and polls until the cluster is IDLE. The proof typically completes in 5–10 minutes depending on cloud provider and cluster size. No manual clicks in the Atlas UI required.',
      instructions:
        '- Script flow: POST /clusters → poll GET /clusters/{name} every 5 seconds\n- Cluster state: CREATING (provisioning) → IDLE (ready)\n- Script reports total creation time\n- Compare to manual provisioning: multiple steps, prone to drift',
      estimatedTimeMinutes: 7,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-deploy.flow',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
    {
      id: 'lab-auto-deploy-overview-step-3',
      title: 'Step 3: Production-Ready Configuration',
      narrative:
        'The proof deploys an M30 3-node replica set with backup enabled and encrypted EBS volumes. This matches production checklist requirements: replication, backup, encryption. The payload is fully configurable.',
      instructions:
        '- Default: M30, AWS US_WEST_2, replicationFactor 3, providerBackupEnabled true\n- Optional: change instanceSizeName, regionName, providerName (AWS/Azure/GCP)\n- See Atlas API docs for full request body parameters\n- Ensures consistency across environments',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'auto-deploy.config',
      sourceProof: 'proofs/11/README.md',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sourceSection: 'Execution',
    },
  ],
};
