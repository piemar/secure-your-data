import { WorkshopTopic } from '@/types';

/**
 * Encryption Topic
 *
 * Covers MongoDB Client-Side Field Level Encryption (CSFLE) and
 * Queryable Encryption (QE) technologies.
 */
export const encryptionTopic: WorkshopTopic = {
  id: 'encryption',
  name: 'Encryption',
  description: 'Client-Side Field Level Encryption and Queryable Encryption for zero-trust data protection',
  tags: ['security', 'encryption', 'csfle', 'qe', 'compliance'],
  defaultLabIds: [
    'lab-csfle-fundamentals',
    'lab-queryable-encryption',
    'lab-right-to-erasure'
  ],
  prerequisites: [],
  povCapabilities: [
    'ENCRYPT-FIELDS',
    'FLE-QUERYABLE-KMIP',
    'ENCRYPTION'
  ]
};
