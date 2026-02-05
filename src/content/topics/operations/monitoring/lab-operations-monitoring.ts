import { WorkshopLabDefinition } from '@/types';

/**
 * Lab: Monitoring & Alerts for Encrypted Workloads
 *
 * Short lab that showcases how to monitor and alert on an Atlas cluster
 * running CSFLE / Queryable Encryption workloads. This lab is content-only
 * and is intended to pair with the encryption labs.
 */
export const labOperationsMonitoringDefinition: WorkshopLabDefinition = {
  id: 'lab-operations-monitoring-encryption',
  topicId: 'operations',
  title: 'Monitoring & Alerts for Encrypted Workloads',
  description:
    'Configure monitoring, performance advice, and alerts for an Atlas cluster running CSFLE / Queryable Encryption workloads.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 25,
  tags: ['operations', 'monitoring', 'alerts', 'performance', 'encryption'],
  prerequisites: [
    'MongoDB Atlas cluster deployed',
    'Basic understanding of CSFLE / Queryable Encryption labs',
  ],
  steps: [
    {
      id: 'lab-operations-monitoring-step-metrics',
      title: 'Explore Cluster Metrics & Slow Queries',
      narrative:
        'Before you can tune performance, you need visibility. Atlas provides detailed metrics and slow query views even when the underlying collections store encrypted fields.',
      instructions:
        'Open the Atlas UI for your workshop cluster. Explore the Metrics tab and identify CPU, memory, and operation rate graphs. Then open the Performance Advisor / slow queries view and note how queries against encrypted collections appear. Capture a screenshot or notes about which metrics you would watch during a workshop.',
      estimatedTimeMinutes: 10,
      points: 10,
    },
    {
      id: 'lab-operations-monitoring-step-alerts',
      title: 'Configure Basic Alerts',
      narrative:
        'Configure a small set of alerts to detect performance or availability issues during your encryption workshop or customer POC.',
      instructions:
        'In Atlas, create at least two alerts: one for high CPU or operation rate, and one for low disk space or replica set unhealthy status. Use email as the notification channel. Think about thresholds that would be appropriate during a live workshop vs. production.',
      estimatedTimeMinutes: 10,
      points: 10,
    },
    {
      id: 'lab-operations-monitoring-step-perf-advice',
      title: 'Review Performance Advice for Encrypted Collections',
      narrative:
        'Atlas can recommend indexes and other tuning actions based on observed query patterns, even when those queries target encrypted fields.',
      instructions:
        'Use the Performance Advisor or Query Profiler to inspect recommended indexes for your CSFLE / QE sample workload. Note any recommendations for encrypted collections and decide which you would apply. Document how you would explain these recommendations to a customer.',
      estimatedTimeMinutes: 5,
      points: 5,
    },
  ],
  // This lab is primarily demo and lab oriented; challenge mode can still
  // reuse the content as part of an operations-focused quest.
  modes: ['demo', 'lab', 'challenge'],
  povCapabilities: ['MONITORING', 'ALERTS', 'PERF-ADVICE'],
};

