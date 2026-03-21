import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-3-1',
      rules: [
        { pattern: /(findOne|find\(|\.aggregate)/, description: 'Explore document structure', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-2',
      rules: [
        { pattern: /\$unwind/, description: 'Use $unwind stage', required: true },
        { pattern: /\$match/, description: 'Use $match stage', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-3',
      rules: [
        { pattern: /\$lookup/, description: 'Use $lookup for cross-collection join', required: true },
        { pattern: /(from|localField|foreignField|as)\s*:/, description: 'Configure $lookup fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-4',
      rules: [
        { pattern: /\$facet/, description: 'Use $facet for parallel aggregations', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-5',
      rules: [
        { pattern: /\$merge|\$out/, description: 'Use $merge or $out to output results', required: true },
      ],
    },
  ];
