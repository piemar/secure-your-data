import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-6-1',
      rules: [
        { pattern: /\.find\s*\(/, description: 'Use find() for queries', required: true },
        { pattern: /(\$and|\$or|\$elemMatch)/, description: 'Use compound query operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-2',
      rules: [
        { pattern: /projection|_id\s*:\s*0|:\s*1/, description: 'Apply projections to limit returned fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-3',
      rules: [
        { pattern: /\.sort\s*\(/, description: 'Use sort()', required: true },
        { pattern: /(limit|skip)\s*\(/, description: 'Use limit/skip for pagination', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-4',
      rules: [
        { pattern: /\.createIndex\s*\(/, description: 'Create compound index', required: true },
        { pattern: /\.explain\s*\(/, description: 'Use explain() to verify IXSCAN', required: true },
      ],
    },
  ];
