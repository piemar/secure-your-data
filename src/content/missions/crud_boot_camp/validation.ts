import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-12-1',
      rules: [
        { pattern: /\.insertOne\s*\(/, description: 'Use insertOne() to insert a document', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-2',
      rules: [
        { pattern: /\.insertMany\s*\(/, description: 'Use insertMany() to bulk insert', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-3',
      rules: [
        { pattern: /(\.find\s*\(|\.findOne\s*\()/, description: 'Use find() or findOne() to query', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-4',
      rules: [
        { pattern: /\.updateOne\s*\(/, description: 'Use updateOne()', required: true },
        { pattern: /\$set/, description: 'Use $set operator', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-5',
      rules: [
        { pattern: /\.deleteOne\s*\(/, description: 'Use deleteOne()', required: true },
      ],
    },
  ];
