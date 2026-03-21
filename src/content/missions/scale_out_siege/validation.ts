import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-9-1',
      rules: [
        { pattern: /(sh\.enableSharding|sh\.shardCollection|shardCollection)/, description: 'Enable sharding on collection', required: true },
        { pattern: /(shardKey|hashed|ranged)/, description: 'Define shard key strategy', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-2',
      rules: [
        { pattern: /(insertMany|insert|bulkWrite)/, description: 'Insert test load data', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-3',
      rules: [
        { pattern: /sh\.status|getShardDistribution/, description: 'Verify shard distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-4',
      rules: [
        { pattern: /(addShard|sh\.addShard)/, description: 'Add new shard to cluster', required: true },
      ],
    },
  ];
