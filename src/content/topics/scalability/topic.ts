import { WorkshopTopic } from '@/types';

/**
 * Scalability Topic
 *
 * Covers MongoDB scalability features including sharding, elastic scaling,
 * multi-region HA, and multi-cloud deployments.
 */
export const scalabilityTopic: WorkshopTopic = {
  id: 'scalability',
  name: 'Scalability & High Availability',
  description: 'Horizontal and vertical scaling, multi-region deployments, and high availability',
  tags: ['scalability', 'sharding', 'elastic-scale', 'multi-region', 'ha'],
  prerequisites: [],
  povCapabilities: [
    'CONSISTENCY',
    'INGEST-RATE',
    'SCALE-OUT',
    'SCALE-UP',
    'ELASTIC-SCALE',
    'AUTO-HA',
    'MULTI-REGION-HA',
    'MULTI-CLOUD',
    'DATA-LOCALITY',
    'SAFE-WRITES'
  ]
};
