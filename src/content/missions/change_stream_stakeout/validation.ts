import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-15-1',
      rules: [
        { pattern: /\.watch\s*\(/, description: 'Open change stream with watch()', required: true },
      ],
    },
    {
      objectiveId: 'obj-15-2',
      rules: [
        { pattern: /\$match.*operationType/, description: 'Filter changes with $match', required: true },
      ],
    },
    {
      objectiveId: 'obj-15-3',
      rules: [
        { pattern: /(resumeAfter|resume|_id)/, description: 'Handle resume token', required: true },
      ],
    },
    {
      objectiveId: 'obj-15-4',
      rules: [
        { pattern: /(operationType|fullDocument)/, description: 'Handle change events', required: true },
      ],
    },
  ];
