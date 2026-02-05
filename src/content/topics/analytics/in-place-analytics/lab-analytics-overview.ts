import { WorkshopLabDefinition } from '@/types';

/**
 * Lab: Analytics & Aggregation Overview
 *
 * Short, presentation-friendly lab that introduces core MongoDB analytics
 * capabilities that pair well with encrypted workloads:
 * - In-place analytics on operational data
 * - Workload isolation between OLTP and analytics
 * - Time-series and basic reporting
 */
export const labAnalyticsOverviewDefinition: WorkshopLabDefinition = {
  id: 'lab-analytics-overview',
  topicId: 'analytics',
  title: 'Analytics & Aggregation Overview',
  description:
    'Explore MongoDB in-place analytics, aggregation pipelines, time-series, and lightweight reporting on operational data.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 30,
  tags: ['analytics', 'aggregation', 'time-series'],
  prerequisites: ['MongoDB Atlas M10+', 'Basic familiarity with MongoDB'],
  keyConcepts: [
    { term: 'In-Place Analytics', explanation: 'Run aggregations directly on operational data without exporting to a warehouse.' },
    { term: 'Aggregation Pipeline', explanation: 'MongoDB stages (match, group, project, etc.) for transforming and analyzing data.' },
    { term: 'Time-Series Collections', explanation: 'Optimized for metrics and events; efficient storage and querying over time.' },
    { term: 'Workload Isolation', explanation: 'Route analytics to dedicated nodes so OLTP and analytics do not interfere.' },
  ],
  steps: [
    {
      id: 'lab-analytics-overview-step-intro',
      title: 'Introduction to Aggregation & Workload Isolation',
      narrative:
        'MongoDB supports in-place analytics using the aggregation pipeline while isolating analytical workloads from latency-sensitive OLTP traffic. In this step you will get familiar with the aggregation framework and the concept of dedicated analytics nodes.',
      instructions:
        'Use the MongoDB documentation to review the stages of the aggregation pipeline. Then, in your Atlas project, identify how you would route analytics queries to isolated secondaries or analytics nodes.',
      estimatedTimeMinutes: 10,
      points: 5,
      enhancementId: 'in-place-analytics.overview-intro',
    },
    {
      id: 'lab-analytics-overview-step-build-report',
      title: 'Build a Simple Aggregation Report',
      narrative:
        'You will build a small report (total sales and average order value) directly in MongoDB using the aggregation pipeline. This demonstrates in-place analytics without exporting data to a separate warehouse.',
      instructions:
        'Using a sample dataset (e.g., `sales` or `orders`), write an aggregation pipeline that groups by day and computes total revenue and average order value. Run it in mongosh and verify the shape of the result. Think about how this could be extended to report on encrypted customer segments.',
      estimatedTimeMinutes: 10,
      points: 10,
      enhancementId: 'in-place-analytics.overview-report',
    },
    {
      id: 'lab-analytics-overview-step-time-series',
      title: 'Explore Time-Series & Visualization Options',
      narrative:
        'Time-series collections and visualization tools like Atlas Charts make it easy to explore operational metrics over time without ETL.',
      instructions:
        'Review how you would model a time-series collection for application or security metrics (for example, login attempts or encryption key usage). Sketch an aggregation that produces a time-bucketed view and identify how you would visualize it in Atlas Charts or another BI tool.',
      estimatedTimeMinutes: 10,
      points: 10,
      enhancementId: 'in-place-analytics.overview-time-series',
    },
  ],
  // Demo mode can use all steps as talking points; lab mode is for actually
  // running the aggregation and time-series explorations.
  modes: ['demo', 'lab'],
  povCapabilities: [
    'IN-PLACE-ANALYTICS',
    'WORKLOAD-ISOLATION',
    'JOINS',
    'TIME-SERIES',
    'REPORTING',
  ],
};
