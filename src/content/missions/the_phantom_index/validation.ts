import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-1-1',
      rules: [
        { pattern: /\.explain\s*\(/, description: 'Use explain() to analyze query', required: true },
        { pattern: /(executionStats|queryPlanner|allPlansExecution)/, description: 'Specify explain verbosity', required: false },
      ],
    },
    {
      objectiveId: 'obj-1-2',
      rules: [
        { pattern: /COLLSCAN|collscan|totalDocsExamined/, description: 'Identify collection scan or docs examined', required: true },
      ],
    },
    {
      objectiveId: 'obj-1-3',
      rules: [
        { pattern: /\.createIndex\s*\(/, description: 'Use createIndex() to create an index', required: true },
        { pattern: /\{[^}]*:[^}]*,[^}]*:[^}]*\}/, description: 'Create a compound index with multiple fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-1-4',
      rules: [
        { pattern: /\.explain\s*\(/, description: 'Run explain() again to verify improvement', required: true },
        { pattern: /IXSCAN|ixscan|indexName/, description: 'Confirm index scan is used', required: true },
      ],
    },
  ];
