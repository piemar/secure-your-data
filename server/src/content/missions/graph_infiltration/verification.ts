import { VerificationCheck } from '../../../sandbox/verification/types.js';
import { traceContains } from '../../../sandbox/verification/helpers.js';

export const mission14VerificationChecks: VerificationCheck[] = [
  {
    objectiveId: 'obj-14-1',
    description: 'Verify $graphLookup executed',
    successMessage: '$graphLookup traversal completed',
    failMessage: 'Use $graphLookup with connectFromField',
    verify: async (_db, context) =>
      traceContains(context, '$graphlookup') && traceContains(context, 'connectfromfield'),
  },
  {
    objectiveId: 'obj-14-2',
    description: 'Verify maxDepth was set',
    successMessage: 'maxDepth limit applied to traversal',
    failMessage: 'Set maxDepth in $graphLookup to limit traversal depth',
    verify: async (_db, context) => traceContains(context, 'maxdepth'),
  },
  {
    objectiveId: 'obj-14-3',
    description: 'Verify restrictSearchWithMatch used',
    successMessage: 'Traversal filtered with restrictSearchWithMatch',
    failMessage: 'Add restrictSearchWithMatch to filter $graphLookup results',
    verify: async (_db, context) => traceContains(context, 'restrictsearchwithmatch'),
  },
  {
    objectiveId: 'obj-14-4',
    description: 'Verify graph output analyzed',
    successMessage: 'Fraud patterns identified in graph output',
    failMessage: 'Analyze the graph output with $project or $size',
    verify: async (_db, context) =>
      traceContains(context, '$project') ||
      traceContains(context, '$size') ||
      traceContains(context, 'networksize'),
  },
];
