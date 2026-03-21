import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-20-1',
      rules: [
        { pattern: /\$rename/, description: 'Use $rename operator', required: true },
        { pattern: /updateMany/, description: 'Apply to multiple documents', required: true },
      ],
    },
    {
      objectiveId: 'obj-20-2',
      rules: [
        { pattern: /\$unset/, description: 'Use $unset to remove fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-20-3',
      rules: [
        { pattern: /\$set/, description: 'Use $set to add defaults', required: true },
        { pattern: /\$exists/, description: 'Check field existence', required: true },
      ],
    },
    {
      objectiveId: 'obj-20-4',
      rules: [
        { pattern: /\$exists/, description: 'Query with $exists', required: true },
        { pattern: /\$type/, description: 'Query with $type', required: true },
      ],
    },
  ];
