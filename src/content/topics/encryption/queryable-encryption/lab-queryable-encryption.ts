import { WorkshopLabDefinition, WorkshopLabStep } from '@/types';

/**
 * Lab 2: Queryable Encryption & Range Queries
 * 
 * This lab teaches Queryable Encryption (QE) with range queries on salary
 * and equality queries on taxId. It demonstrates the differences between
 * CSFLE and QE, particularly the requirement for separate DEKs per field.
 * 
 * This lab covers Queryable Encryption with encryptedFields configuration.
 * See Docs/Guides/Lab_2_QE.md for additional reference.
 */
export const lab2Definition: WorkshopLabDefinition = {
  id: 'lab-queryable-encryption',
  topicId: 'encryption',
  title: 'Lab 2: Queryable Encryption & Range Queries',
  description: 'Implement Queryable Encryption with range queries on salary and equality queries on taxId. Learn how QE differs from CSFLE and when to use each.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 45,
  tags: ['queryable-encryption', 'qe', 'range-queries', 'security', 'hands-on'],
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

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the step instructions and Help for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: 'QE metadata',
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
  steps: [
    {
      id: 'lab-queryable-encryption-step-create-encrypted-collection',
      title: 'Step 1: Create QE collection with automatic DEK creation',
      narrative: 'The driver provides createEncryptedCollection(), which creates DEKs for each encrypted field that does not have a keyId and then creates the collection in one call. You do not need to call createDataKey per field manually. Define encryptedFields for salary (range) and taxId (equality) without keyId; the helper generates the keys and creates hr.employees.',
      instructions: 'Write a script that uses ClientEncryption.createEncryptedCollection() with an encryptedFields definition (salary and taxId, with range and equality query types). Drop hr.employees first if it exists. Run the script and add keyAltNames (qe-salary-dek, qe-taxid-dek) so later steps can look up DEKs by name.\nUse Run all or Run selection in the editor to run the script.\nClick Check progress or Next to verify.',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'challenge'],
      verificationId: 'qe.verifyQECollection',
      points: 25,
      enhancementId: 'queryable-encryption.create-encrypted-collection',
      preview: { type: 'encryption-demo', config: { variant: 'csfle-toggle', fields: ['salary', 'taxId'] } },
      sourceProof: 'Docs/Guides/Lab_2_QE.md',
      sourceSection: 'Setup',
      hints: [
        'Use createEncryptedCollection(db, "employees", { createCollectionOptions: { encryptedFields }, provider: "aws", masterKey: { key, region } }).',
        'Define encryptedFields.fields without keyId so the driver creates DEKs automatically.',
        'Drop the collection first if it already exists so the script can be re-run.'
      ]
    },
    {
      id: 'lab-queryable-encryption-step-test-queries',
      title: 'Step 2: Insert Test Data with Encrypted Fields',
      narrative: 'Before you can test queries, you need to insert documents with encrypted fields. Use a QE-enabled client connection to insert data so that fields defined in encryptedFields are automatically encrypted. The DEKs created in Step 1 (with keyAltNames qe-salary-dek and qe-taxid-dek) are used by the client.',
      instructions: 'Create a QE-enabled client with autoEncryption and encryptedFieldsMap.\nInsert at least 3–5 test documents into hr.employees with different salary and taxId values.\nUse Run all or Run selection in the editor to run the insert script.\nClick Check progress or Next to verify.',
      estimatedTimeMinutes: 12,
      modes: ['demo', 'lab', 'challenge'],
      verificationId: 'qe.verifyQERangeQuery',
      points: 20,
      enhancementId: 'queryable-encryption.test-queries',
      preview: { type: 'encryption-demo', config: { variant: 'csfle-toggle', fields: ['salary', 'taxId'] } },
      sourceProof: 'Docs/Guides/Lab_2_QE.md',
      sourceSection: 'Execution',
      hints: [
        'Use the keyAltNames (qe-salary-dek, qe-taxid-dek) from the collection created in Step 1.',
        'Configure encryptedFieldsMap on the client so that salary and taxId are encrypted automatically.',
        'Insert multiple documents so you can later demonstrate equality and range queries.'
      ]
    },
    {
      id: 'lab-queryable-encryption-step-metadata',
      title: 'Step 3: Query Encrypted Data - QE vs Non-QE Client Comparison',
      narrative: 'Demonstrate the power of Queryable Encryption by comparing queries with a QE-enabled client versus a standard client. The standard client only sees Binary ciphertext, while the QE client transparently decrypts and allows equality queries on encrypted fields.',
      instructions: 'Write a script that queries hr.employees with a standard MongoClient (Binary ciphertext, failed equality), then with a QE-enabled client (successful equality on salary and taxId).\nUse Run all or Run selection in the editor to run the script.\nClick Check progress or Next to verify.',
      estimatedTimeMinutes: 15,
      modes: ['demo', 'lab'],
      verificationId: 'qe.verifyQERangeQuery',
      points: 20,
      enhancementId: 'queryable-encryption.metadata',
      preview: { type: 'encryption-demo', config: { variant: 'csfle-toggle', fields: ['salary', 'taxId'] } },
      sourceProof: 'Docs/Guides/Lab_2_QE.md',
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
