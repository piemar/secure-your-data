import { WorkshopLabDefinition, WorkshopLabStep } from '@/types';

/**
 * Lab 2: Queryable Encryption & Range Queries
 * 
 * This lab teaches Queryable Encryption (QE) with range queries on salary
 * and equality queries on taxId. It demonstrates the differences between
 * CSFLE and QE, particularly the requirement for separate DEKs per field.
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/46/README.md (Queryable Encryption section)
 * This lab covers Queryable Encryption with encryptedFields configuration.
 */
export const lab2Definition: WorkshopLabDefinition = {
  id: 'lab-queryable-encryption',
  topicId: 'encryption',
  title: 'Lab 2: Queryable Encryption & Range Queries',
  description: 'Implement Queryable Encryption with range queries on salary and equality queries on taxId. Learn how QE differs from CSFLE and when to use each.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['queryable-encryption', 'qe', 'range-queries', 'security', 'hands-on'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/46',
  keyConcepts: [
    { term: 'Queryable Encryption (QE)', explanation: 'Encrypt fields while supporting equality and range queries on ciphertext.' },
    { term: 'DEK per Field', explanation: 'QE requires a separate DEK for each encrypted field (unlike CSFLE).' },
    { term: 'Encrypted Index', explanation: 'QE creates special indexes that enable queries on encrypted data.' },
    { term: 'Range vs Equality', explanation: 'QE supports both; different encryption types for each query pattern.' },
  ],
  dataRequirements: [
    {
      id: 'qe-key-vault',
      description: 'Queryable Encryption key vault',
      type: 'collection',
      namespace: 'encryption.__keyVault',
      sizeHint: 'QE metadata',
    },
    {
      id: 'encrypted-employees',
      description: 'Collection with QE encrypted fields (salary, taxId)',
      type: 'collection',
      namespace: 'encryption.employees',
      sizeHint: 'sample encrypted docs',
    },
  ],
  prerequisites: [
    'Lab 1: CSFLE Fundamentals completed',
    'MongoDB Atlas M10+ running MongoDB 7.0+',
    'AWS KMS CMK created (from Lab 1)',
    'Node.js and npm installed'
  ],
  // Source PoV proof exercise
  // See Docs/pov-proof-exercises/proofs/46/README.md, Queryable Encryption section (Setup Step 6, Execution)
  steps: [
    {
      id: 'lab-queryable-encryption-step-create-deks',
      title: 'Step 1: Create Data Encryption Keys (DEKs) for QE',
      narrative: 'Before defining encrypted fields, you need to create Data Encryption Keys (DEKs) for each field you want to encrypt. Unlike CSFLE, QE requires a separate DEK for each encrypted field. Create DEKs for both salary (range queries) and taxId (equality queries). We will use keyAltNames to reference them, making the code more maintainable.',
      instructions: 'Create a Node.js script (createQEDeks.cjs) that creates two separate DEKs - one for salary and one for taxId. Use keyAltNames "qe-salary-dek" and "qe-taxid-dek" respectively. Run the script to generate the keys.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'challenge'],
      verificationId: 'qe.verifyQEDEKs',
      points: 15,
      enhancementId: 'queryable-encryption.create-deks',
      sourceProof: 'proofs/54/README.md',
      sourceSection: 'Setup',
      hints: [
        'QE requires a separate DEK for each encrypted field (unlike CSFLE which can reuse DEKs).',
        'Use keyAltNames to make your code more maintainable than hardcoding UUIDs.',
        'The ClientEncryption.createDataKey() method is the same as CSFLE, but you need one per field.'
      ]
    },
    {
      id: 'lab-queryable-encryption-step-create-collection',
      title: 'Step 2: Create QE Collection with Encrypted Fields',
      narrative: 'Create the collection with the encryptedFields configuration. This single step defines which fields to encrypt AND creates the collection. MongoDB will automatically create the system catalog (.esc) and context cache (.ecoc) collections. We use keyAltNames to look up the DEKs, making the code cleaner and more maintainable.',
      instructions: 'Create the collection with encryptedFields configuration using either Node.js script or mongosh commands. Define salary and taxId as encrypted fields with their respective query types.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      verificationId: 'qe.verifyQECollection',
      points: 20,
      enhancementId: 'queryable-encryption.create-collection',
      sourceProof: 'proofs/54/README.md',
      sourceSection: 'Setup',
      hints: [
        'Use encryptedFields instead of schemaMap for QE.',
        'MongoDB automatically creates metadata collections (.esc, .ecoc).',
        'Reference DEKs using keyAltNames, not UUIDs.',
        'You can only create a collection with encryptedFields ONCE - drop it first if it exists.'
      ]
    },
    {
      id: 'lab-queryable-encryption-step-test-queries',
      title: 'Step 3: Insert Test Data with Encrypted Fields',
      narrative: 'Before you can test queries, you need to insert documents with encrypted fields. Use a QE-enabled client connection to insert data so that fields defined in encryptedFields are automatically encrypted.',
      instructions: 'Create a QE-enabled client using autoEncryption and encryptedFieldsMap, then insert at least 3–5 test documents into the hr.employees collection with different salary values and taxId strings.',
      estimatedTimeMinutes: 12,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'qe.verifyQERangeQuery',
      points: 20,
      enhancementId: 'queryable-encryption.test-queries',
      sourceProof: 'proofs/54/README.md',
      sourceSection: 'Execution',
      hints: [
        'Use the same keyAltNames and DEKs that you created in Step 1.',
        'Configure encryptedFieldsMap on the client so that salary and taxId are encrypted automatically.',
        'Insert multiple documents so you can later demonstrate equality and (future) range queries.'
      ]
    },
    {
      id: 'lab-queryable-encryption-step-metadata',
      title: 'Step 4: Query Encrypted Data - QE vs Non-QE Client Comparison',
      narrative: 'Demonstrate the power of Queryable Encryption by comparing queries with a QE-enabled client versus a standard client. The standard client only sees Binary ciphertext, while the QE client transparently decrypts and allows equality queries on encrypted fields.',
      instructions: 'Write a script that first queries hr.employees with a standard MongoClient (showing Binary ciphertext and failed equality queries), then connects with a QE-enabled client using encryptedFieldsMap and successfully runs equality queries on salary and taxId.',
      estimatedTimeMinutes: 15,
      modes: ['demo', 'lab'],
      verificationId: 'qe.verifyQERangeQuery',
      points: 20,
      enhancementId: 'queryable-encryption.metadata',
      sourceProof: 'proofs/54/README.md',
      sourceSection: 'Execution',
      hints: [
        'Use a plain MongoClient first to show that encrypted fields appear as Binary and equality queries on taxId fail.',
        'Then create a QE-enabled client with the same encryptedFields configuration used when inserting data.',
        'Show at least one successful equality query on an encrypted field to prove QE is working.'
      ]
    }
  ],
  modes: ['lab', 'demo', 'challenge'],
  audience: 'all',
  povCapabilities: ['ENCRYPT-FIELDS', 'FLE-QUERYABLE-KMIP', 'ENCRYPTION']
};
