import { WorkshopTopic } from '@/types';

/**
 * MongoDB Time Series Topic
 *
 * Covers time series collections, ingestion, time and metadata queries,
 * aggregation ($group), and windowing ($setWindowFields, $expMovingAvg, gap fill).
 */
export const timeseriesTopic: WorkshopTopic = {
  id: 'timeseries',
  name: 'Timeseries',
  description:
    'Create and query time series collections, run aggregations, and use windowing operators for analytics.',
  tags: ['timeseries', 'sensors', 'metrics', 'aggregation', 'windowing', 'iot'],
  prerequisites: [],
  povCapabilities: ['TIME-SERIES'],
};
