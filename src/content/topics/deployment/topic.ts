import { WorkshopTopic } from '@/types';

/**
 * Deployment Topic
 *
 * Covers MongoDB deployment automation including Live Migration
 * (on-prem to Atlas, cloud-to-cloud), Terraform, and automated cluster provisioning.
 */
export const deploymentTopic: WorkshopTopic = {
  id: 'deployment',
  name: 'Deployment & Automation',
  description: 'Live Migration (on-prem to Atlas, cloud-to-cloud), Terraform, and infrastructure as code',
  tags: ['deployment', 'automation', 'terraform', 'iac', 'migration'],
  prerequisites: [],
  povCapabilities: [
    'MIGRATABLE',
    'PORTABLE',
    'AUTO-DEPLOY',
    'TERRAFORM'
  ]
};
