import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-5-1',
      rules: [
        { pattern: /(getCollectionInfos|listCollections|collMod|validator)/, description: 'Audit collection validators', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-2',
      rules: [
        { pattern: /(validator|\$jsonSchema|bsonType|required)/, description: 'Identify validation rules', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-3',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix users validation', required: true },
        { pattern: /users/, description: 'Target users collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-4',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix transactions validation', required: true },
        { pattern: /transactions/, description: 'Target transactions collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-5',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix sessions validation', required: true },
        { pattern: /sessions/, description: 'Target sessions collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-6',
      rules: [
        { pattern: /(insertOne|insertMany|insert\()/, description: 'Test with insert operation', required: true },
        { pattern: /(error|validation|failed|rejected)/, description: 'Verify rejection of invalid docs', required: false },
      ],
    },
  ];
