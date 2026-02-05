import { WorkshopLabDefinition, WorkshopLabStep } from '@/types';

/**
 * Lab 1: CSFLE Fundamentals with AWS KMS
 * 
 * This is the structured content definition for Lab 1, extracted from
 * the monolithic Lab1CSFLE.tsx component. In later phases, this will
 * be loaded from YAML/JSON files in the content/ directory.
 * 
 * For now, we keep verification functions and complex code blocks
 * in the component, but the structure and metadata live here.
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md (CSFLE section)
 * This lab covers Client-Side Field Level Encryption fundamentals with AWS KMS.
 * Note: This lab uses AWS KMS (production approach) vs the proof exercise's local key (development approach).
 */
export const lab1Definition: WorkshopLabDefinition = {
  id: 'lab-csfle-fundamentals',
  topicId: 'encryption',
  title: 'Lab 1: CSFLE Fundamentals with AWS KMS',
  description: 'Master the rollout of KMS infrastructure and Client-Side Field Level Encryption',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['csfle', 'aws-kms', 'security', 'hands-on'],
  prerequisites: [
    'MongoDB Atlas M10+ running MongoDB 7.0+',
    'AWS IAM User with KMS Management Permissions',
    'Working Terminal with AWS CLI access'
  ],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/46',
  keyConcepts: [
    { term: 'Client-Side Field Level Encryption (CSFLE)', explanation: 'Encrypts sensitive fields in the application before data reaches MongoDB.' },
    { term: 'Envelope Encryption', explanation: 'CMK wraps DEKs; DEKs encrypt data. CMK never leaves KMS.' },
    { term: 'Data Encryption Key (DEK)', explanation: 'Per-field or per-collection key stored in encryption.__keyVault, encrypted by CMK.' },
    { term: 'Customer Master Key (CMK)', explanation: 'Root key in AWS KMS; never leaves HSM; used to wrap DEKs.' },
  ],
  dataRequirements: [
    {
      id: 'key-vault-collection',
      description: 'encryption.__keyVault collection for DEKs',
      type: 'collection',
      namespace: 'encryption.__keyVault',
      sizeHint: 'created by driver',
    },
    {
      id: 'encrypted-collection',
      description: 'Collection with encrypted fields (e.g. patients)',
      type: 'collection',
      namespace: 'encryption.patients',
      sizeHint: 'sample PII documents',
    },
  ],
  // Source PoV proof exercise
  // See Docs/pov-proof-exercises/proofs/46/README.md, CSFLE section (Setup Steps 1-6, Execution)
  steps: [
    {
      id: 'lab-csfle-fundamentals-step-create-cmk',
      title: 'Create Customer Master Key (CMK)',
      narrative: 'The CMK is the root of trust in Envelope Encryption. It never leaves the KMS Hardware Security Module (HSM). This key will "wrap" (encrypt) the Data Encryption Keys (DEKs) that MongoDB stores.',
      instructions: 'Run the AWS CLI command to create a new symmetric key, create an alias for easier reference, and save the Key ID for the next step.',
      estimatedTimeMinutes: 10,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'csfle.verifyCmkExists',
      points: 10,
      enhancementId: 'csfle.create-cmk',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Setup',
      hints: [
        'The AWS KMS command to create a new key is "create-key" (no space).',
        'The JMESPath query to extract just the KeyId is "KeyId".',
        'The command to create an alias is "create-alias" (no space).'
      ]
    },
    {
      id: 'lab-csfle-fundamentals-step-apply-key-policy',
      title: 'Infrastructure: Apply KMS Key Policy',
      narrative: 'Even if your IAM User has permissions, the Key itself must *trust* you. You must explicitly attach a Key Policy to the CMK to allow your IAM User to administer and use it.',
      instructions: 'Get your Key ID and IAM identity, create a Key Policy JSON file that allows your account root and IAM user full access, then apply the policy to your CMK.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'challenge'],
      verificationId: 'csfle.verifyKeyPolicy',
      points: 10,
      enhancementId: 'csfle.apply-key-policy',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Setup',
      hints: [
        'The command to get details about an existing key is "describe-key".',
        'The STS command to get your identity is "get-caller-identity".',
        'The query to extract your AWS Account ID is "Account".',
        'The command to attach a policy to a KMS key is "put-key-policy".'
      ]
    },
    {
      id: 'lab-csfle-fundamentals-step-init-keyvault',
      title: 'Initialize Key Vault with Unique Index',
      narrative: 'The Key Vault is a special MongoDB collection that stores encrypted DEKs. A unique partial index on keyAltNames prevents duplicate key names.',
      instructions: 'Connect to Atlas using mongosh, switch to the encryption database, and create a unique partial index on the __keyVault collection.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'challenge'],
      verificationId: 'csfle.verifyKeyVaultIndex',
      points: 10,
      enhancementId: 'csfle.init-keyvault',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Setup',
      hints: [
        'The database name for encryption operations is "encryption".',
        'The method to create an index in MongoDB is "createIndex".',
        'The field to index is "keyAltNames".',
        'The operator to check if a field exists is "$exists".'
      ]
    },
    {
      id: 'lab-csfle-fundamentals-step-create-deks',
      title: 'Generate Data Encryption Keys (DEKs)',
      narrative: 'The DEK (Data Encryption Key) is what actually encrypts your data. The CMK "wraps" the DEK, meaning the DEK is stored encrypted in MongoDB using the CMK from AWS KMS.',
      instructions: 'Create a Node.js script (createKey.cjs), configure KMS providers with AWS credentials, use ClientEncryption.createDataKey() to generate and store the DEK, then run the script with Node.js.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'challenge'],
      verificationId: 'csfle.verifyDekCreated',
      points: 15,
      enhancementId: 'csfle.create-deks',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Setup',
      hints: [
        'Import "ClientEncryption" from the mongodb package.',
        'The class to initialize for encryption operations is "ClientEncryption".',
        'The method to create a new Data Encryption Key is "createDataKey".',
        'The option to give your DEK a human-readable name is "keyAltNames".'
      ]
    },
    {
      id: 'lab-csfle-fundamentals-step-verify-dek',
      title: 'Verify DEK Creation in Key Vault',
      narrative: 'Connect to MongoDB Atlas using mongosh and query the key vault to verify that exactly one Data Encryption Key has been created. This is a critical verification step.',
      instructions: 'Connect to Atlas, switch to the encryption database, query the __keyVault collection, and confirm you see exactly 1 document with your keyAltName.',
      estimatedTimeMinutes: 5,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'csfle.verifyKeyVaultCount',
      points: 5,
      enhancementId: 'csfle.verify-dek',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Setup'
    },
    {
      id: 'lab-csfle-fundamentals-step-test-csfle',
      title: 'Test CSFLE: Insert & Query with Encryption',
      narrative: 'Create and run a Node.js test script that demonstrates the difference between encrypted and non-encrypted connections. This proves that CSFLE is working by showing ciphertext vs plaintext side-by-side.',
      instructions: 'Create testCSFLE.cjs that uses both a standard client (no CSFLE) and a CSFLE-enabled client. Insert documents with both, then query to see the difference: standard client shows Binary ciphertext, CSFLE client shows decrypted plaintext.',
      estimatedTimeMinutes: 15,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'csfle.verifyEncryptionWorking',
      points: 20,
      enhancementId: 'csfle.test-csfle',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Execution',
      hints: [
        'The field in __keyVault that stores human-readable key names is "keyAltNames".',
        'Schema map keyword to specify field should be encrypted is "encrypt".',
        'Algorithm suffix for fields that need equality queries is "Deterministic".',
        'MongoClient option that enables automatic encryption is "autoEncryption".'
      ]
    },
    {
      id: 'lab-csfle-fundamentals-step-complete-application',
      title: 'The Complete Application',
      narrative: 'Bringing it all together. Here is the full, clean code for a production-ready CSFLE application. Notice it is only ~50 lines of code!',
      instructions: 'Review the complete application code that brings together all the concepts: CMK setup, DEK creation, schema map definition, and automatic encryption/decryption.',
      estimatedTimeMinutes: 10,
      modes: ['demo', 'lab'],
      verificationId: 'csfle.verifyComplete',
      points: 10,
      enhancementId: 'csfle.complete-application',
      sourceProof: 'proofs/46/README.md',
      sourceSection: 'Execution'
    }
  ],
  modes: ['lab', 'demo', 'challenge'],
  audience: 'all',
  povCapabilities: ['ENCRYPT-FIELDS', 'FLE-QUERYABLE-KMIP', 'ENCRYPTION']
};
