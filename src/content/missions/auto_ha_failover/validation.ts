import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-10-1',
      rules: [
        { pattern: /(rs\.status|replSetGetStatus|members)/, description: 'Check replica set status', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-2',
      rules: [
        { pattern: /(retryWrites\s*=\s*false|retryReads\s*=\s*false|retryWrites=false)/, description: 'Configure without retry', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-3',
      rules: [
        { pattern: /(retryWrites\s*=\s*true|retryReads\s*=\s*true|retryWrites=true)/, description: 'Enable retryable writes/reads', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-4',
      rules: [
        { pattern: /(rs\.status|replSetGetStatus|PRIMARY|SECONDARY)/, description: 'Verify failover recovery', required: true },
      ],
    },
  ];
