import { WorkshopFlag } from '@/types';

/**
 * Flags related to encryption objectives in the retail data breach simulation.
 */

export const encryptedPiiCollectionsFlag: WorkshopFlag = {
  id: 'flag-encrypted-pii-collections',
  name: 'Encrypted All PII Collections',
  description: 'All collections containing PII have been encrypted using CSFLE or Queryable Encryption',
  visibility: 'visible',
  verificationId: 'verify-encrypted-collections',
  points: 50
};

export const noPlaintextPiiFlag: WorkshopFlag = {
  id: 'flag-no-plaintext-pii',
  name: 'No Queries Returning Plaintext PII',
  description: 'Verified that no queries can return plaintext PII data without proper decryption keys',
  visibility: 'visible',
  verificationId: 'verify-no-plaintext-pii',
  points: 75
};

export const queryableEncryptionActiveFlag: WorkshopFlag = {
  id: 'flag-queryable-encryption-active',
  name: 'Queryable Encryption Active',
  description: 'Queryable Encryption is properly configured and supporting range queries on encrypted fields',
  visibility: 'visible',
  verificationId: 'verify-queryable-encryption',
  points: 50
};

export const properIndexesFlag: WorkshopFlag = {
  id: 'flag-proper-indexes',
  name: 'Proper Indexes Created',
  description: 'All critical query patterns have appropriate indexes for optimal performance',
  visibility: 'visible',
  verificationId: 'verify-indexes',
  points: 30
};

export const accessControlAuditFlag: WorkshopFlag = {
  id: 'flag-access-control-audit',
  name: 'Access Control Audit Complete',
  description: 'All database access has been audited and restricted to authorized services only',
  visibility: 'visible',
  verificationId: 'verify-access-control',
  points: 40
};

export const queryOptimizationFlag: WorkshopFlag = {
  id: 'flag-query-optimization',
  name: 'Query Optimization Complete',
  description: 'All slow queries have been optimized and meet performance SLAs',
  visibility: 'hidden',
  verificationId: 'verify-query-performance',
  points: 25
};
