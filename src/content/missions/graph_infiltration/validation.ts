import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-14-1',
      rules: [
        { pattern: /\$graphLookup/, description: 'Use $graphLookup', required: true },
        { pattern: /connectFromField/, description: 'Define connectFromField', required: true },
      ],
    },
    {
      objectiveId: 'obj-14-2',
      rules: [
        { pattern: /maxDepth/, description: 'Set maxDepth limit', required: true },
      ],
    },
    {
      objectiveId: 'obj-14-3',
      rules: [
        { pattern: /restrictSearchWithMatch/, description: 'Filter traversal with restrictSearchWithMatch', required: true },
      ],
    },
    {
      objectiveId: 'obj-14-4',
      rules: [
        { pattern: /(\$project|\$size|network)/, description: 'Analyze graph output', required: true },
      ],
    },
  ];
