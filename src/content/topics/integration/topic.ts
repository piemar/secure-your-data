import { WorkshopTopic } from '@/types';

/**
 * Integration Topic
 *
 * Covers MongoDB integration capabilities including REST APIs, GraphQL,
 * and Kafka connectors.
 */
export const integrationTopic: WorkshopTopic = {
  id: 'integration',
  name: 'Integration & APIs',
  description: 'REST APIs, GraphQL, Kafka integration, and data access patterns',
  tags: ['integration', 'api', 'rest', 'graphql', 'kafka'],
  prerequisites: [],
  povCapabilities: [
    'DATA-REST-API',
    'DATA-API',
    'GRAPHQL',
    'KAFKA',
    'REPORTING'
  ]
};
