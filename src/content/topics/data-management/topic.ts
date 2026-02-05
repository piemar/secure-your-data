import { WorkshopTopic } from '@/types';

/**
 * Data Management Topic
 *
 * Covers MongoDB data management features including schema flexibility,
 * transactions, change streams, and data migration.
 */
export const dataManagementTopic: WorkshopTopic = {
  id: 'data-management',
  name: 'Data Management',
  description: 'Schema flexibility, transactions, change streams, and data migration patterns',
  tags: ['data-management', 'schema', 'transactions', 'change-streams', 'migration'],
  prerequisites: [],
  povCapabilities: [
    'FLEXIBLE',
    'SCHEMA',
    'CONSISTENCY',
    'TRANSACTION',
    'CHANGE-CAPTURE',
    'STREAM-PROCESSING',
    'DECIMAL-PRECISION',
    'MULTIMEDIA',
    'ARCHIVE-STORAGE',
    'MIGRATABLE',
    'PORTABLE',
    'INGEST-RATE',
    'DEVICE-SYNC'
  ]
};
