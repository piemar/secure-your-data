import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
  {
    objectiveId: 'obj-22-1',
    rules: [
      { pattern: /(embed|embeddings?)/, description: 'Generate embeddings', required: true },
      { pattern: /(description|input)/, description: 'Embed transaction description inputs', required: true },
    ],
  },
  {
    objectiveId: 'obj-22-2',
    rules: [
      { pattern: /(orthogonal|matrix|multiplyVectorByMatrix)/, description: 'Apply orthogonal transformation', required: true },
      { pattern: /(obfuscatedVectors|obfuscated_vector)/, description: 'Create obfuscated vector output', required: true },
    ],
  },
  {
    objectiveId: 'obj-22-3',
    rules: [
      { pattern: /(insertMany|insertOne)/, description: 'Persist transformed vectors', required: true },
      { pattern: /obfuscated_vector/, description: 'Store obfuscated_vector field', required: true },
    ],
  },
  {
    objectiveId: 'obj-22-4',
    rules: [
      { pattern: /audit_logs/, description: 'Write telemetry event', required: true },
      { pattern: /(latencyMs|vectorDimension)/, description: 'Capture latency and dimension metadata', required: true },
    ],
  },
];
