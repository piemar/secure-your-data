import { WorkshopLabDefinition } from '@/types';

/**
 * In-Place Analytics Basics: Setup & Foundation Aggregations
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/04/README.md (IN-PLACE-ANALYTICS)
 * This lab covers setting up the environment, loading sample data, creating indexes,
 * and running basic aggregation pipelines on indexed subsets of data.
 */
export const labInPlaceAnalyticsBasicsDefinition: WorkshopLabDefinition = {
  id: 'lab-in-place-analytics-basics',
  topicId: 'analytics',
  title: 'In-Place Analytics: Setup & Basic Aggregations',
  description:
    'Learn how to set up MongoDB for in-place analytics by loading sample data, creating indexes, and running aggregation pipelines that efficiently process indexed subsets of large datasets.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 45,
  tags: ['analytics', 'aggregation', 'in-place-analytics', 'indexes'],
  prerequisites: [
    'MongoDB Atlas M30+ cluster (3-node replica set)',
    'MongoDB Shell (mongosh) or MongoDB Compass',
    'Basic understanding of MongoDB queries'
  ],
  povCapabilities: ['IN-PLACE-ANALYTICS'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/04',
  dataRequirements: [
    {
      id: 'customers-collection',
      description: 'Bank customer dataset (1M or 10M records). Restore from customers.bson.gz (download link in proof README)',
      type: 'collection',
      namespace: 'FAST-ANALYTICS.customers',
      sizeHint: '64MB (1M) or 628MB (10M)',
    },
  ],
  steps: [
    {
      id: 'lab-in-place-analytics-basics-step-1',
      title: 'Step 1: Configure Atlas Environment & Load Sample Data',
      narrative:
        'Set up your MongoDB Atlas cluster and load the bank customer dataset. This dataset contains customer records with nested account information, demonstrating MongoDB\'s ability to aggregate across flexible schemas.',
      instructions:
        '- Create an M30 Atlas cluster with 3-node replica set\n- Create a database user with readWriteAnyDatabase privileges\n- Configure IP whitelist for your machine\n- Download the sample dataset (customers.bson.gz for 10M records or customers_1m.bson.gz for 1M records)\n- Restore the dataset using mongorestore:\n  `mongorestore --uri mongodb+srv://USER:PASS@cluster.mongodb.net --authenticationDatabase admin -d FAST-ANALYTICS -c customers --gzip customers.bson.gz`\n- Verify data load: `db.customers.countDocuments()`',
      estimatedTimeMinutes: 20,
      modes: ['lab', 'challenge'],
      verificationId: 'analytics.verifyDataLoad',
      points: 10,
      enhancementId: 'in-place-analytics.data-setup',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Setup - Import Sample Data',
    },
    {
      id: 'lab-in-place-analytics-basics-step-2',
      title: 'Step 2: Create Indexes for Efficient Aggregation',
      narrative:
        'Create indexes on fields that will be used to filter data in aggregation pipelines. Indexes enable MongoDB to efficiently target subsets of documents before running aggregations.',
      instructions:
        '- Connect to your Atlas cluster using mongosh\n- Switch to the FAST-ANALYTICS database: `use FAST-ANALYTICS`\n- Create an index on the country field: `db.customers.createIndex({country:1})`\n- Verify the index was created: `db.customers.getIndexes()`\n- You should see both the _id index and the country_1 index\n- Note: The country field will be used to filter subsets in later aggregations',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'analytics.verifyIndexCreation',
      points: 10,
      enhancementId: 'in-place-analytics.index-creation',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Setup - Create Index',
    },
    {
      id: 'lab-in-place-analytics-basics-step-3',
      title: 'Step 3: Run Basic Aggregation with $match and $group',
      narrative:
        'Execute your first aggregation pipeline that filters documents using $match (leveraging the index) and groups results using $group. This demonstrates MongoDB\'s ability to aggregate totals and averages on indexed subsets.',
      instructions:
        '- Run Aggregation 1: Average credit score for customers in England\n  `db.customers.aggregate([{ $match: { "country":"EN"} }, { $group: {_id: "$country", avgRank: {$avg: "$rankLevel"}} }])`\n- Observe the result (should show avgRank around 4.49-4.50)\n- Note that ~25% of records match the country filter (266,414 records for 1M dataset)\n- The $match stage uses the index to efficiently filter before aggregation\n- This aggregation completes in under 500ms for 1M records',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'analytics.verifyBasicAggregation',
      points: 15,
      enhancementId: 'in-place-analytics.basic-aggregation',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Execution - Aggregation 1',
    },
    {
      id: 'lab-in-place-analytics-basics-step-4',
      title: 'Step 4: Measure Aggregation Performance with Explain',
      narrative:
        'Use explain() to analyze how MongoDB executes the aggregation pipeline, including index usage, documents examined, and execution time.',
      instructions:
        '- Run explain on Aggregation 1:\n  `db.customers.explain("executionStats").aggregate([{ $match: { "country":"EN"} }, { $group: {_id: "$country", avgRank: {$avg: "$rankLevel"}} }])`\n- Review the executionStats output:\n  - Check executionTimeMillis (should be under 500ms for 1M records)\n  - Verify index usage in the $match stage\n  - Note documents examined vs documents returned\n- Compare performance: indexed query vs collection scan (if you remove the index temporarily)',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'challenge'],
      verificationId: 'analytics.verifyExplainPlan',
      points: 10,
      enhancementId: 'in-place-analytics.explain-performance',
      sourceProof: 'proofs/04/README.md',
      sourceSection: 'Measurement',
    },
  ],
};
