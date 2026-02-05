import { WorkshopLabDefinition } from '@/types';

/**
 * In-Place Analytics Advanced: Complex Aggregations & Performance Analysis
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/04/README.md (IN-PLACE-ANALYTICS)
 * This lab covers advanced aggregation pipelines including $unwind, $project, $sort,
 * and demonstrates MongoDB's ability to efficiently aggregate across nested arrays
 * and compute complex metrics on large datasets.
 */
export const labInPlaceAnalyticsAdvancedDefinition: WorkshopLabDefinition = {
  id: 'lab-in-place-analytics-advanced',
  topicId: 'analytics',
  title: 'In-Place Analytics: Advanced Aggregations & Performance',
  description:
    'Master advanced aggregation pipelines with $unwind, $project, and $sort stages. Learn to aggregate across nested arrays, compute totals by category, and analyze performance on large datasets (1M-10M records).',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 50,
  tags: ['analytics', 'aggregation', 'in-place-analytics', 'performance', 'advanced'],
  prerequisites: [
    'Completed lab-in-place-analytics-basics',
    'MongoDB Atlas M30+ cluster with FAST-ANALYTICS.customers collection loaded',
    'Understanding of basic aggregation stages ($match, $group)'
  ],
  povCapabilities: ['IN-PLACE-ANALYTICS'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/04',
  dataRequirements: [
    {
      id: 'customers-collection',
      description: 'Bank customer dataset from lab-in-place-analytics-basics',
      type: 'collection',
      namespace: 'FAST-ANALYTICS.customers',
      sizeHint: '64MB (1M) or 628MB (10M)',
    },
  ],
  steps: [
    {
      id: 'lab-in-place-analytics-advanced-step-1',
      title: 'Step 1: Aggregate Across Nested Arrays with $unwind',
      narrative:
        'Use $unwind to expand nested arrays (accounts) and aggregate totals by account type. This demonstrates MongoDB\'s ability to process complex nested structures efficiently.',
      instructions:
        '- Run Aggregation 2: Total value of bank holdings by account type in England\n  `db.customers.aggregate([{ $match: {"country":"EN"} }, { $unwind: { path: "$accounts"} }, { $group: {_id: "$accounts.accountType", total: {$sum: "$accounts.balance"}} }])`\n- Observe the results showing totals for each account type (Mortgage, Savings, ISA, Current)\n- Understand how $unwind expands each customer document into multiple documents (one per account)\n- Note that negative balances (Mortgage) are correctly summed\n- This aggregation processes ~266K customers with multiple accounts each',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'analytics.verifyUnwindAggregation',
      points: 15,
      enhancementId: 'in-place-analytics.unwind-aggregation',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Execution - Aggregation 2',
    },
    {
      id: 'lab-in-place-analytics-advanced-step-2',
      title: 'Step 2: Multi-Stage Aggregation with $group and $sort',
      narrative:
        'Build a multi-stage pipeline that groups by country, computes averages, and sorts results. This demonstrates MongoDB\'s ability to aggregate across all records and present ordered results.',
      instructions:
        '- Run Aggregation 3: Average credit score by country, sorted highest first\n  `db.customers.aggregate([{ $group: {_id: "$country", avgRank: {$avg: "$rankLevel"}} }, {$sort:{"avgRank":-1}}])`\n- Review the results showing average credit scores for all countries (EN, IT, DE, FR, etc.)\n- Note that this aggregation processes all documents (no $match filter)\n- The $sort stage orders results by avgRank descending\n- Compare execution time: this should complete in under 1 second for 1M records',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'analytics.verifyGroupSortAggregation',
      points: 15,
      enhancementId: 'in-place-analytics.group-sort',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Execution - Aggregation 3',
    },
    {
      id: 'lab-in-place-analytics-advanced-step-3',
      title: 'Step 3: Complex Aggregation with $project and Array Size',
      narrative:
        'Use $project to compute derived fields (array size) and aggregate totals. This demonstrates MongoDB\'s ability to compute metrics on document structure and aggregate efficiently.',
      instructions:
        '- Run Aggregation 4: Countries with most products (accounts per customer)\n  `db.customers.aggregate([{$project: {country: 1, numProducts: { $size: "$accounts" }}},{ $group: {_id: "$country", productCount: {$sum: "$numProducts"}} },{$sort:{"productCount":-1}}])`\n- Understand how $project computes numProducts using $size on the accounts array\n- The $group stage sums numProducts across all customers per country\n- Results show total product count per country (EN typically has the most)\n- This aggregation demonstrates processing flexibility across varying document shapes',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'analytics.verifyProjectAggregation',
      points: 15,
      enhancementId: 'in-place-analytics.project-aggregation',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Execution - Aggregation 4',
    },
    {
      id: 'lab-in-place-analytics-advanced-step-4',
      title: 'Step 4: Performance Analysis & Scaling Comparison',
      narrative:
        'Analyze aggregation performance using explain() and compare execution times between 1M and 10M record datasets. Understand how MongoDB scales aggregation performance.',
      instructions:
        '- Run explain("executionStats") on Aggregation 2:\n  `db.customers.explain("executionStats").aggregate([{ $match: {"country":"EN"} }, { $unwind: { path: "$accounts"} }, { $group: {_id: "$accounts.accountType", total: {$sum: "$accounts.balance"}} }])`\n- Review executionTimeMillis and compare to expected benchmarks:\n  - Aggregation 1: ~0.5s (1M) / ~6s (10M)\n  - Aggregation 2: ~1.2s (1M) / ~17s (10M)\n  - Aggregation 3: ~0.8s (1M) / ~12s (10M)\n  - Aggregation 4: ~3s (1M) / ~37s (10M)\n- Document your results and discuss factors affecting performance (index usage, document size, pipeline complexity)\n- Consider how workload isolation (analytics nodes) could improve performance',
      estimatedTimeMinutes: 16,
      modes: ['lab', 'challenge'],
      verificationId: 'analytics.verifyPerformanceAnalysis',
      points: 20,
      enhancementId: 'in-place-analytics.performance-analysis',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
