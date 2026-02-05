import { WorkshopTopic } from '@/types';

/**
 * Analytics Topic
 *
 * Covers MongoDB analytics capabilities including aggregation pipelines,
 * time-series data, vector search, and visualization.
 */
export const analyticsTopic: WorkshopTopic = {
  id: 'analytics',
  name: 'Analytics & Aggregation',
  description: 'In-place analytics, time-series data, vector search, and visualization capabilities',
  tags: ['analytics', 'aggregation', 'time-series', 'vector-search', 'visualization'],
  prerequisites: [],
  povCapabilities: [
    'IN-PLACE-ANALYTICS',
    'TIME-SERIES',
    'RETRIEVAL-AUGMENTED-GENERATION',
    'VECTOR-AUTO-EMBEDDING',
    'INCREMENTAL-ANALYTICS',
    'WORKLOAD-ISOLATION',
    'JOINS',
    'NATIVE-VISUALIZATION',
    'EMBED-VISUALIZATION',
    'REPORTING'
  ]
};
