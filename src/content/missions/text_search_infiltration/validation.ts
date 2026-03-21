import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-17-1',
      rules: [
        { pattern: /(mappings|fields|analyzer|type)/, description: 'Define search index mappings', required: true },
      ],
    },
    {
      objectiveId: 'obj-17-2',
      rules: [
        { pattern: /\$search/, description: 'Use $search stage', required: true },
        { pattern: /fuzzy/, description: 'Include fuzzy matching', required: true },
      ],
    },
    {
      objectiveId: 'obj-17-3',
      rules: [
        { pattern: /autocomplete/, description: 'Implement autocomplete', required: true },
      ],
    },
    {
      objectiveId: 'obj-17-4',
      rules: [
        { pattern: /\$searchMeta/, description: 'Use $searchMeta for facets', required: true },
        { pattern: /facet/, description: 'Define faceted search', required: true },
      ],
    },
  ];
