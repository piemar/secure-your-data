import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
  {
    objectiveId: 'obj-21-1',
    rules: [
      { pattern: /(encryption_vault\.keyVault|keyVaultNamespace)/, description: 'Define CSFLE key vault namespace', required: true },
      { pattern: /orthogonal_matrix/, description: 'Target orthogonal_matrix for encryption', required: true },
    ],
  },
  {
    objectiveId: 'obj-21-2',
    rules: [
      { pattern: /createDataKey/, description: 'Create a data key', required: true },
      { pattern: /keyAltNames?\s*:\s*\[.*vector-matrix-key.*\]/, description: 'Set keyAltName for reuse', required: true },
    ],
  },
  {
    objectiveId: 'obj-21-3',
    rules: [
      { pattern: /schemaMap/, description: 'Define auto-encryption schema map', required: true },
      { pattern: /AEAD_AES_256_CBC_HMAC_SHA_512-Random/, description: 'Use CSFLE Random encryption algorithm', required: true },
    ],
  },
  {
    objectiveId: 'obj-21-4',
    rules: [
      { pattern: /(insertOne|save)\(/, description: 'Persist obfuscation_config document', required: true },
      { pattern: /findOne\(/, description: 'Read encrypted document back through driver', required: true },
    ],
  },
];
