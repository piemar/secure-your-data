import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-4-1',
      rules: [
        { pattern: /(serverStatus|connPoolStats|connections|currentActive)/, description: 'Diagnose connection pool state', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-2',
      rules: [
        { pattern: /(maxPoolSize|minPoolSize|maxIdleTimeMS)/, description: 'Configure pool size settings', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-3',
      rules: [
        { pattern: /(retry|retryWrites|retryReads|backoff|exponential)/, description: 'Implement retry logic', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-4',
      rules: [
        { pattern: /(serverSelectionTimeoutMS|socketTimeoutMS|connectTimeoutMS)/, description: 'Set timeout strategies', required: true },
      ],
    },
  ];
