import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-16-1',
      rules: [
        { pattern: /(startSession|session)/, description: 'Start a client session', required: true },
      ],
    },
    {
      objectiveId: 'obj-16-2',
      rules: [
        { pattern: /startTransaction/, description: 'Begin transaction', required: true },
        { pattern: /(readConcern|writeConcern)/, description: 'Configure read/write concern', required: true },
      ],
    },
    {
      objectiveId: 'obj-16-3',
      rules: [
        { pattern: /(updateOne|insertOne|updateMany)/, description: 'Execute writes in transaction', required: true },
        { pattern: /session/, description: 'Pass session to operations', required: true },
      ],
    },
    {
      objectiveId: 'obj-16-4',
      rules: [
        { pattern: /(commitTransaction|abortTransaction)/, description: 'Commit or abort', required: true },
      ],
    },
  ];
