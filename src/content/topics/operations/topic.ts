import { WorkshopTopic } from '@/types';

/**
 * Operations Topic
 *
 * Covers MongoDB operations capabilities including monitoring, alerts,
 * backup/recovery, and performance optimization.
 */
export const operationsTopic: WorkshopTopic = {
  id: 'operations',
  name: 'Operations & Monitoring',
  description: 'Monitoring, alerting, backup/recovery, and performance optimization',
  tags: ['operations', 'monitoring', 'alerts', 'backup', 'recovery', 'performance'],
  prerequisites: [],
  povCapabilities: [
    'MONITORING',
    'ALERTS',
    'PERF-ADVICE',
    'FULL-RECOVERY-RPO',
    'FULL-RECOVERY-RTO',
    'PARTIAL-RECOVERY',
    'ROLLING-UPDATES',
    'AUTO-HA',
    'TRIGGER-ALERT'
  ]
};
