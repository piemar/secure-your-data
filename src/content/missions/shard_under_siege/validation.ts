import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-2-1',
      rules: [
        { pattern: /sh\.status\s*\(/, description: 'Run sh.status() to assess distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-2',
      rules: [
        { pattern: /(chunks|dataSize|jumboChunk|shard)/, description: 'Identify shard/chunk information', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-3',
      rules: [
        { pattern: /sh\.moveChunk|moveChunk|moveRange/, description: 'Initiate chunk migration', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-4',
      rules: [
        { pattern: /sh\.status\s*\(|getShardDistribution/, description: 'Verify balanced distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-5',
      rules: [
        { pattern: /(ping|hello|serverStatus|ismaster|isMaster)/, description: 'Confirm services responding', required: true },
      ],
    },
  ];
