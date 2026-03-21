import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-7-1',
      rules: [
        { pattern: /(aws\s+kms|create-key|createKey|KMS)/, description: 'Create CMK in KMS', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-2',
      rules: [
        { pattern: /(ClientEncryption|createDataKey|keyAltNames)/, description: 'Generate DEK using ClientEncryption', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-3',
      rules: [
        { pattern: /(\$jsonSchema|encrypt|schemaMap)/, description: 'Define schema map with encryption', required: true },
        { pattern: /(Deterministic|Random)/, description: 'Specify encryption algorithm', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-4',
      rules: [
        { pattern: /(autoEncryption|encryptedFieldsMap)/, description: 'Enable auto encryption on client', required: true },
        { pattern: /MongoClient/, description: 'Create encrypted MongoClient', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-5',
      rules: [
        { pattern: /(insertOne|insert)/, description: 'Insert document with encrypted fields', required: true },
        { pattern: /(find|findOne)/, description: 'Query and verify decryption', required: true },
      ],
    },
  ];
