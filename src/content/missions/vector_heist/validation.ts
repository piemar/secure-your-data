import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-19-1',
      rules: [
        { pattern: /(vector|numDimensions|similarity)/, description: 'Define vector search index', required: true },
      ],
    },
    {
      objectiveId: 'obj-19-2',
      rules: [
        { pattern: /(embedding|insertMany|insertOne)/, description: 'Store document embeddings', required: true },
      ],
    },
    {
      objectiveId: 'obj-19-3',
      rules: [
        { pattern: /\$vectorSearch/, description: 'Use $vectorSearch', required: true },
        { pattern: /numCandidates/, description: 'Specify numCandidates', required: true },
      ],
    },
    {
      objectiveId: 'obj-19-4',
      rules: [
        { pattern: /\$vectorSearch/, description: 'Use $vectorSearch', required: true },
        { pattern: /filter/, description: 'Add pre-filter', required: true },
      ],
    },
  ];
