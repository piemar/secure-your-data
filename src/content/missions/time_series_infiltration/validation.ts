import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-18-1',
      rules: [
        { pattern: /createCollection/, description: 'Use createCollection()', required: true },
        { pattern: /timeseries/, description: 'Define timeseries options', required: true },
        { pattern: /timeField/, description: 'Specify timeField', required: true },
      ],
    },
    {
      objectiveId: 'obj-18-2',
      rules: [
        { pattern: /(insertMany|insertOne)/, description: 'Insert sensor readings', required: true },
        { pattern: /timestamp|Date/, description: 'Include timestamps', required: true },
      ],
    },
    {
      objectiveId: 'obj-18-3',
      rules: [
        { pattern: /\$dateTrunc/, description: 'Use $dateTrunc for windowed aggregation', required: true },
        { pattern: /\$group/, description: 'Use $group stage', required: true },
      ],
    },
    {
      objectiveId: 'obj-18-4',
      rules: [
        { pattern: /\$match/, description: 'Use $match to filter', required: true },
        { pattern: /(\$gt|\$gte|\$lt|\$lte)/, description: 'Use comparison operator for threshold', required: true },
      ],
    },
  ];
