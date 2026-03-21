import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-13-1',
      rules: [
        { pattern: /createIndex.*2dsphere/, description: 'Create 2dsphere index', required: true },
      ],
    },
    {
      objectiveId: 'obj-13-2',
      rules: [
        { pattern: /\$geoNear/, description: 'Use $geoNear aggregation stage', required: true },
      ],
    },
    {
      objectiveId: 'obj-13-3',
      rules: [
        { pattern: /\$geoWithin/, description: 'Use $geoWithin query', required: true },
        { pattern: /(Polygon|\$geometry)/, description: 'Use Polygon geometry', required: true },
      ],
    },
    {
      objectiveId: 'obj-13-4',
      rules: [
        { pattern: /\$geoWithin|\$geoNear/, description: 'Use geo query', required: true },
        { pattern: /(status|type|active|category)/, description: 'Combine with non-geo filter', required: true },
      ],
    },
  ];
