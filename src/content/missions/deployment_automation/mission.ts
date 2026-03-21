import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-11',
    title: 'Deployment Automation',
    codename: 'TERRAFORM',
    tier: 'exfiltration',
    description: 'Automate Atlas cluster provisioning with Terraform — define, plan, and apply infrastructure as code.',
    briefing: `DEPLOYMENT ORDER\n\nManual cluster provisioning is over. Command wants infrastructure as code. Define a production-ready Atlas cluster in Terraform: specify the provider, region, instance size, and replication specs. Plan the deployment. Apply it. Verify the cluster is live.\n\nNo more clicking. Code the infrastructure.`,
    objectives: [
      { id: 'obj-11-1', text: 'Define Terraform resource for Atlas cluster', completed: false },
      { id: 'obj-11-2', text: 'Configure cluster specs (region, instance, replication)', completed: false },
      { id: 'obj-11-3', text: 'Run Terraform init/plan/apply commands', completed: false },
    ],
    timeLimit: 600,
    xpReward: 700,
    difficulty: 3,
    topic: 'deployment',
    povCapabilities: ['AUTO-DEPLOY', 'TERRAFORM'],
    chaosEvents: [
      { id: 'chaos-11-1', title: '🏗️ DRIFT DETECTED', description: 'Someone changed the cluster config manually! Your Terraform state is out of sync.', triggerAt: 250, penalty: 150, duration: 60 },
    ],
  };
