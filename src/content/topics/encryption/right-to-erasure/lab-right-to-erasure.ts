import { WorkshopLabDefinition, WorkshopLabStep } from '@/types';

/**
 * Lab 3: Right to Erasure & Multi-Tenant Patterns
 * 
 * This lab teaches data migration from plaintext to encrypted state,
 * per-tenant key isolation, and GDPR right-to-erasure / crypto-shredding patterns.
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md (CSFLE section - advanced patterns)
 * This lab extends the proof exercise with production-ready patterns including migration,
 * multi-tenant key isolation, and key rotation.
 */
export const lab3Definition: WorkshopLabDefinition = {
  id: 'lab-right-to-erasure',
  topicId: 'encryption',
  title: 'Lab 3: Right to Erasure & Multi-Tenant Patterns',
  description: 'Learn data migration from plaintext to encrypted state, per-tenant key isolation, and GDPR right-to-erasure / crypto-shredding patterns.',
  difficulty: 'advanced',
  estimatedTotalTimeMinutes: 50,
  tags: ['csfle', 'migration', 'gdpr', 'crypto-shredding', 'multi-tenant', 'compliance'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/46',
  keyConcepts: [
    { term: 'Right to Erasure', explanation: 'GDPR requirement to delete personal data; crypto-shredding destroys DEK to make ciphertext unrecoverable.' },
    { term: 'Crypto-Shredding', explanation: 'Delete the DEK used to encrypt data; ciphertext becomes permanently unreadable.' },
    { term: 'Explicit Encryption', explanation: 'Manual encrypt() for migration; required when moving plaintext to encrypted.' },
    { term: 'Multi-Tenant Key Isolation', explanation: 'Each tenant has its own DEK; enables per-tenant erasure and isolation.' },
  ],
  dataRequirements: [
    {
      id: 'legacy-collection',
      description: 'Plaintext collection to migrate from',
      type: 'collection',
      namespace: 'encryption.legacy_customers',
      sizeHint: 'pre-migration data',
    },
    {
      id: 'secure-collection',
      description: 'Encrypted collection after migration',
      type: 'collection',
      namespace: 'encryption.customers',
      sizeHint: 'post-migration',
    },
  ],
  prerequisites: [
    'Lab 1: CSFLE Fundamentals completed',
    'MongoDB Atlas M10+ running MongoDB 7.0+',
    'AWS KMS CMK created (from Lab 1)',
    'DEK created (from Lab 1)',
    'Node.js and npm installed'
  ],
  defaultCompetitorId: 'postgresql',
  competitorIds: ['postgresql', 'cosmosdb-vcore'],
  // Source PoV proof exercise
  // See Docs/pov-proof-exercises/proofs/46/README.md, CSFLE section (advanced patterns: migration, multi-tenant, key rotation)
  steps: [
    {
      id: 'lab-right-to-erasure-step-explicit-encryption',
      title: 'Step 1: Explicit Encryption for Migration',
      narrative: 'When migrating existing plaintext data to CSFLE, you cannot use automatic encryption because the driver expects to find ciphertext. You must use the "Explicit Encryption" API to encrypt each field manually. This step demonstrates migrating data from a legacy collection to a secure, encrypted collection.',
      instructions: 'Create a migration script that reads plaintext data from a legacy collection, encrypts each field explicitly using ClientEncryption.encrypt(), and writes the encrypted data to a new secure collection.',
      estimatedTimeMinutes: 15,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'csfle.verifyMigration',
      points: 20,
      enhancementId: 'right-to-erasure.explicit-encryption',
      hints: [
        'Use explicit encryption API: encryption.encrypt() for each field during migration.',
        'Read from legacy collection → Encrypt each field → Write to secure collection.',
        'Deterministic encryption is critical if you need to maintain query capabilities on PII.',
        'After migration, query the secure collection without CSFLE to see Binary ciphertext.'
      ]
    },
    {
      id: 'lab-right-to-erasure-step-multi-tenant-keys',
      title: 'Step 2: Multi-Tenant Key Isolation',
      narrative: 'In a multi-tenant application, each tenant should have their own Data Encryption Key (DEK). This provides tenant isolation and enables per-tenant crypto-shredding for GDPR compliance. Learn how to create and manage per-tenant DEKs using keyAltNames.',
      instructions: 'Create DEKs for multiple tenants, each with a unique keyAltName (e.g., "tenant-1-ssn-key", "tenant-2-ssn-key"). Insert encrypted data for each tenant using their respective DEKs.',
      estimatedTimeMinutes: 15,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'csfle.verifyMultiTenantKeys',
      points: 20,
      enhancementId: 'right-to-erasure.multi-tenant-keys',
      hints: [
        'Use keyAltNames to identify tenant-specific DEKs (e.g., "tenant-{id}-ssn-key").',
        'Each tenant\'s data is encrypted with their own DEK, providing isolation.',
        'Look up DEKs by keyAltName when encrypting/decrypting tenant data.',
        'This pattern enables per-tenant crypto-shredding for GDPR compliance.'
      ]
    },
    {
      id: 'lab-right-to-erasure-step-key-rotation',
      title: 'Step 3: Key Rotation (RewrapManyDataKey)',
      narrative: 'Rotate the Customer Master Key (CMK) without re-encrypting the actual data. This "envelope rotation" strategy updates DEK metadata to use a new CMK, while the encrypted data itself never changes.',
      instructions: 'Create a script that locates the DEK used for SSN encryption by keyAltName, then uses ClientEncryption.rewrapManyDataKey() to rewrap that DEK with a (simulated) new CMK alias.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      verificationId: 'csfle.verifyKeyRotation',
      points: 20,
      enhancementId: 'right-to-erasure.key-rotation',
      hints: [
        'Use rewrapManyDataKey() to update the DEKs with a new CMK. This is a metadata-only operation and is extremely fast.',
        'Ensure the old CMK is still accessible during rotation so the driver can decrypt the DEK before rewrapping.',
        'In production, point to a NEW CMK alias (e.g., alias/mongodb-lab-key-v2).',
        'After rotation, your encrypted data remains unchanged, but the trust root has been updated.'
      ]
    },
    {
      id: 'lab-right-to-erasure-step-production-patterns',
      title: 'Step 4: Infrastructure: Rotation Readiness Check',
      narrative: 'Before rotating keys in MongoDB, you must verify that the (new) CMK exists and is accessible. Use the AWS CLI to check aliases, key policy, and basic encrypt/decrypt operations to ensure rotation will succeed.',
      instructions: 'Use the AWS CLI to list KMS aliases, describe the CMK backing your MongoDB alias, inspect the key policy, and run a test encrypt/decrypt round trip. Confirm that KeyState is "Enabled" and that your IAM principal can both encrypt and decrypt.',
      estimatedTimeMinutes: 8,
      modes: ['lab'],
      verificationId: 'csfle.verifyKmsAlias',
      points: 15,
      enhancementId: 'right-to-erasure.rotation-readiness',
      hints: [
        'Use aws kms list-aliases to confirm your CMK alias exists.',
        'Use aws kms describe-key to check that the key is enabled.',
        'Use aws kms get-key-policy to verify your IAM principal is allowed to use the key.',
        'Run aws kms encrypt and aws kms decrypt with a small payload to validate end-to-end access.'
      ]
    }
  ],
  modes: ['lab', 'demo', 'challenge'],
  audience: 'all',
  povCapabilities: ['ENCRYPT-FIELDS', 'ENCRYPTION']
};
