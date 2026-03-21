import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-8-1',
      rules: [
        { pattern: /\.aggregate\s*\(/, description: 'Use aggregate()', required: true },
        { pattern: /(\$group|\$sum|\$avg|\$count)/, description: 'Use grouping/accumulator operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-8-2',
      rules: [
        { pattern: /\$group/, description: 'Use $group stage', required: true },
        { pattern: /(\$sum|\$avg|\$min|\$max)/, description: 'Use accumulator operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-8-3',
      rules: [
        { pattern: /(readPreference|secondaryPreferred|secondary)/, description: 'Configure read preference for workload isolation', required: true },
      ],
    },
  ];
