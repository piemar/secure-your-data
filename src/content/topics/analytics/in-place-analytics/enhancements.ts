import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * In-Place Analytics Enhancement Metadata
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/04/README.md (IN-PLACE-ANALYTICS)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'in-place-analytics.data-setup': {
    id: 'in-place-analytics.data-setup',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Setup - Import Sample Data',
    codeBlocks: [
      {
        filename: 'mongorestore - Load Sample Data',
        language: 'bash',
        code: `# Download the sample dataset (1M or 10M records)
# From Google Drive: customers_1m.bson.gz (1M) or customers.bson.gz (10M)

# Restore 1M record dataset
mongorestore --uri mongodb+srv://USER:PASS@cluster.mongodb.net \\
  --authenticationDatabase admin \\
  -d FAST-ANALYTICS \\
  -c customers \\
  --gzip customers_1m.bson.gz

# Or restore 10M record dataset
mongorestore --uri mongodb+srv://USER:PASS@cluster.mongodb.net \\
  --authenticationDatabase admin \\
  -d FAST-ANALYTICS \\
  -c customers \\
  --gzip customers.bson.gz

# Verify data load
mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net" --username USER
use FAST-ANALYTICS
db.customers.countDocuments()`,
        skeleton: `# Restore dataset
mongorestore --uri mongodb+srv://_________ \\
  --authenticationDatabase admin \\
  -d FAST-ANALYTICS \\
  -c customers \\
  --gzip customers.bson.gz

# Verify data load
mongosh "mongodb+srv://_________" --username _________
use FAST-ANALYTICS
db.customers._________()`,
        inlineHints: [
          {
            line: 2,
            blankText: '_________',
            hint: 'Your MongoDB Atlas connection string with username and password',
            answer: 'USER:PASS@cluster.mongodb.net',
          },
          {
            line: 8,
            blankText: '_________',
            hint: 'Your MongoDB Atlas connection string',
            answer: 'USER:PASS@cluster.mongodb.net',
          },
          {
            line: 10,
            blankText: '_________',
            hint: 'Your MongoDB Atlas username',
            answer: 'USER',
          },
          {
            line: 12,
            blankText: '_________',
            hint: 'Method to count documents in a collection',
            answer: 'countDocuments',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the mongosh verify commands.',
      'Use the 1M record dataset for faster setup and testing.',
      'The 10M record dataset is better for performance benchmarking.',
      'Ensure you have sufficient storage on your Atlas cluster.',
      'The restore process may take 10-30 minutes depending on dataset size.',
    ],
  },

  'in-place-analytics.index-creation': {
    id: 'in-place-analytics.index-creation',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Setup - Create Index',
    codeBlocks: [
      {
        filename: 'mongosh - Create Index',
        language: 'javascript',
        code: `// Connect to Atlas cluster
mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net" --username USER

// Switch to FAST-ANALYTICS database
use FAST-ANALYTICS

// Create index on country field
db.customers.createIndex({country:1})

// Verify index was created
db.customers.getIndexes()

// Expected output shows:
// - _id_ index (default)
// - country_1 index (newly created)`,
        skeleton: `use FAST-ANALYTICS

// Create index on country field
db.customers.createIndex({_________})

// Verify index was created
db.customers._________()`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Index specification object with field name and sort order',
            answer: '{country:1}',
          },
          {
            line: 7,
            blankText: '_________',
            hint: 'Method to list all indexes on a collection',
            answer: 'getIndexes',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the commands (mongosh-style).',
      'Indexes enable efficient filtering before aggregation.',
      'The country index will be used by $match stages in aggregations.',
      'Index creation may take a few minutes on large collections.',
      'Use getIndexes() to verify index creation before proceeding.',
    ],
  },

  'in-place-analytics.basic-aggregation': {
    id: 'in-place-analytics.basic-aggregation',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Execution - Aggregation 1',
    codeBlocks: [
      {
        filename: 'mongosh - Basic Aggregation',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Aggregation 1: Average credit score for customers in England
db.customers.aggregate([
  { $match: { "country": "EN" } },
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$rankLevel" }
    }
  }
])

// Expected result:
// { "_id" : "EN", "avgRank" : 4.495924982426205 }

// Note: ~25% of records match (266,414 records for 1M dataset)
// Execution time: under 500ms for 1M records`,
        skeleton: `use FAST-ANALYTICS

// Average credit score for customers in England
db.customers.aggregate([
  { $match: { "country": "_________" } },
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$_________" }
    }
  }
])`,
        inlineHints: [
          {
            line: 5,
            blankText: '_________',
            hint: 'Country code for England',
            answer: 'EN',
          },
          {
            line: 8,
            blankText: '_________',
            hint: 'Field name containing credit score/rank level',
            answer: 'rankLevel',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'The $match stage uses the country index for efficient filtering.',
      '$avg calculates the average of numeric values.',
      'This aggregation demonstrates single-command analytics on indexed subsets.',
      'Performance is optimized because the index targets only ~25% of documents.',
    ],
  },

  'in-place-analytics.explain-performance': {
    id: 'in-place-analytics.explain-performance',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'mongosh - Explain Plan',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Run explain on Aggregation 1
db.customers.explain("executionStats").aggregate([
  { $match: { "country": "EN" } },
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$rankLevel" }
    }
  }
])

// Review executionStats:
// - executionTimeMillis: should be under 500ms for 1M records
// - totalDocsExamined: should match documents matching country="EN"
// - executionStages: should show IXSCAN (index scan) in $match stage`,
        skeleton: `use FAST-ANALYTICS

// Run explain on aggregation
db.customers.explain("_________").aggregate([
  { $match: { "country": "EN" } },
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$rankLevel" }
    }
  }
])`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Explain mode that includes execution statistics',
            answer: 'executionStats',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'executionStats provides detailed performance metrics.',
      'Look for IXSCAN vs COLLSCAN to verify index usage.',
      'Compare executionTimeMillis to expected benchmarks.',
      'Documents examined should match filtered subset, not entire collection.',
    ],
  },

  'in-place-analytics.unwind-aggregation': {
    id: 'in-place-analytics.unwind-aggregation',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Execution - Aggregation 2',
    codeBlocks: [
      {
        filename: 'mongosh - Unwind Aggregation',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Aggregation 2: Total value of bank holdings by account type in England
db.customers.aggregate([
  { $match: { "country": "EN" } },
  { $unwind: { path: "$accounts" } },
  { $group: {
      _id: "$accounts.accountType",
      total: { $sum: "$accounts.balance" }
    }
  }
])

// Expected results:
// { "_id" : "Mortgage", "total" : -111264379917.01 }
// { "_id" : "Savings", "total" : 37973829103.02 }
// { "_id" : "ISA", "total" : 37842003995.77 }
// { "_id" : "Current", "total" : 7299579827.89 }

// Note: $unwind expands each customer into multiple documents (one per account)
// Execution time: ~1.2s for 1M records, ~17s for 10M records`,
        skeleton: `use FAST-ANALYTICS

// Total value by account type in England
db.customers.aggregate([
  { $match: { "country": "EN" } },
  { $unwind: { path: "$_________" } },
  { $group: {
      _id: "$accounts.accountType",
      total: { $sum: "$accounts._________" }
    }
  }
])`,
        inlineHints: [
          {
            line: 6,
            blankText: '_________',
            hint: 'Array field name containing account documents',
            answer: 'accounts',
          },
          {
            line: 9,
            blankText: '_________',
            hint: 'Field name containing account balance',
            answer: 'balance',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$unwind expands arrays, creating one document per array element.',
      'This allows aggregating across nested structures.',
      'Negative balances (Mortgage) are correctly summed.',
      'Performance scales well even with multiple accounts per customer.',
    ],
  },

  'in-place-analytics.group-sort': {
    id: 'in-place-analytics.group-sort',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Execution - Aggregation 3',
    codeBlocks: [
      {
        filename: 'mongosh - Group and Sort',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Aggregation 3: Average credit score by country, sorted highest first
db.customers.aggregate([
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$rankLevel" }
    }
  },
  { $sort: { "avgRank": -1 } }
])

// Expected results (sorted by avgRank descending):
// { "_id" : "DN", "avgRank" : 4.499913779271937 }
// { "_id" : "PT", "avgRank" : 4.499837366201849 }
// { "_id" : "ES", "avgRank" : 4.499768091490534 }
// { "_id" : "EN", "avgRank" : 4.499717220449537 }
// ... (other countries)

// Execution time: ~0.8s for 1M records, ~12s for 10M records`,
        skeleton: `use FAST-ANALYTICS

// Average credit score by country, sorted highest first
db.customers.aggregate([
  { $group: {
      _id: "$country",
      avgRank: { $avg: "$rankLevel" }
    }
  },
  { $sort: { "avgRank": _________ } }
])`,
        inlineHints: [
          {
            line: 10,
            blankText: '_________',
            hint: 'Sort order: -1 for descending, 1 for ascending',
            answer: '-1',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'This aggregation processes all documents (no $match filter).',
      '$sort orders results after grouping.',
      'Performance is good even without filtering because grouping is efficient.',
      'Results show credit score distribution across all countries.',
    ],
  },

  'in-place-analytics.project-aggregation': {
    id: 'in-place-analytics.project-aggregation',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Execution - Aggregation 4',
    codeBlocks: [
      {
        filename: 'mongosh - Project and Aggregate',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Aggregation 4: Countries with most products (accounts per customer)
db.customers.aggregate([
  {
    $project: {
      country: 1,
      numProducts: { $size: "$accounts" }
    }
  },
  {
    $group: {
      _id: "$country",
      productCount: { $sum: "$numProducts" }
    }
  },
  {
    $sort: { "productCount": -1 }
  }
])

// Expected results (sorted by productCount descending):
// { "_id" : "EN", "productCount" : 6220517 }
// { "_id" : "IT", "productCount" : 3116449 }
// { "_id" : "DE", "productCount" : 3114276 }
// ... (other countries)

// Execution time: ~3s for 1M records, ~37s for 10M records`,
        skeleton: `use FAST-ANALYTICS

// Countries with most products
db.customers.aggregate([
  {
    $project: {
      country: 1,
      numProducts: { $size: "$_________" }
    }
  },
  {
    $group: {
      _id: "$country",
      productCount: { $sum: "$_________" }
    }
  },
  {
    $sort: { "productCount": -1 }
  }
])`,
        inlineHints: [
          {
            line: 6,
            blankText: '_________',
            hint: 'Array field name to compute size of',
            answer: 'accounts',
          },
          {
            line: 12,
            blankText: '_________',
            hint: 'Field name computed in $project stage',
            answer: 'numProducts',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$project computes derived fields before grouping.',
      '$size calculates the length of an array.',
      'This demonstrates aggregating on document structure metrics.',
      'Performance scales well even with complex projections.',
    ],
  },

  'in-place-analytics.performance-analysis': {
    id: 'in-place-analytics.performance-analysis',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'mongosh - Performance Analysis',
        language: 'javascript',
        code: `use FAST-ANALYTICS

// Run explain on Aggregation 2 (unwind example)
db.customers.explain("executionStats").aggregate([
  { $match: { "country": "EN" } },
  { $unwind: { path: "$accounts" } },
  { $group: {
      _id: "$accounts.accountType",
      total: { $sum: "$accounts.balance" }
    }
  }
])

// Review executionStats output:
// - executionTimeMillis: compare to benchmarks
// - totalDocsExamined: should match filtered subset
// - executionStages: analyze pipeline stages

// Expected benchmarks (1M records):
// - Aggregation 1: ~0.5s
// - Aggregation 2: ~1.2s
// - Aggregation 3: ~0.8s
// - Aggregation 4: ~3s

// Expected benchmarks (10M records):
// - Aggregation 1: ~6s
// - Aggregation 2: ~17s
// - Aggregation 3: ~12s
// - Aggregation 4: ~37s`,
        skeleton: `use FAST-ANALYTICS

// Analyze performance
db.customers.explain("_________").aggregate([
  { $match: { "country": "EN" } },
  { $unwind: { path: "$accounts" } },
  { $group: {
      _id: "$accounts.accountType",
      total: { $sum: "$accounts.balance" }
    }
  }
])

// Review executionStats:
// - executionTimeMillis: compare to benchmarks
// - totalDocsExamined: should match filtered subset`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Explain mode that includes execution statistics',
            answer: 'executionStats',
          },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'Compare your results to MongoDB benchmarks.',
      'Index usage significantly improves performance.',
      'Complex pipelines ($unwind, $project) take longer but scale well.',
      'Consider workload isolation (analytics nodes) for production.',
    ],
  },

  'in-place-analytics.overview-intro': {
    id: 'in-place-analytics.overview-intro',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Overview',
    codeBlocks: [
      {
        filename: 'Aggregation Pipeline Stages',
        language: 'text',
        code: `Aggregation Pipeline
===================

Key stages: $match, $group, $project, $sort, $unwind
- $match: filter documents (like find)
- $group: aggregate by field (sum, count, avg)
- $project: reshape output
- $sort: order results
- $unwind: expand arrays

Workload Isolation:
- Route analytics to dedicated secondaries
- Or use Atlas Analytics Nodes
- Keeps OLTP latency low`,
      },
    ],
    tips: [
      'Review aggregation stages in MongoDB docs.',
      'Atlas: configure read preference for analytics.',
      'Analytics nodes isolate analytical workload.',
    ],
  },

  'in-place-analytics.overview-report': {
    id: 'in-place-analytics.overview-report',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Overview',
    codeBlocks: [
      {
        filename: 'Simple Aggregation Report',
        language: 'javascript',
        code: `// Total sales and average order value by day
db.sales.aggregate([
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      totalRevenue: { $sum: "$amount" },
      avgOrderValue: { $avg: "$amount" },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'Group by day using $dateToString.',
      'Use $sum and $avg for metrics.',
      'Extend to encrypted segments with proper schema.',
    ],
  },

  'in-place-analytics.overview-time-series': {
    id: 'in-place-analytics.overview-time-series',
    povCapability: 'IN-PLACE-ANALYTICS',
    sourceProof: 'proofs/04/README.md',
    sourceSection: 'Overview',
    codeBlocks: [
      {
        filename: 'Time-Series Aggregation',
        language: 'javascript',
        code: `// Time-bucketed view for metrics
db.metrics.aggregate([
  {
    $group: {
      _id: {
        $dateTrunc: {
          date: "$timestamp",
          unit: "hour"
        }
      },
      count: { $sum: 1 },
      avgValue: { $avg: "$value" }
    }
  },
  { $sort: { _id: 1 } }
]);

// Visualize in Atlas Charts: line chart, time on X-axis`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'Time-series collections optimize storage.',
      '$dateTrunc for hourly/daily buckets.',
      'Atlas Charts for auto-refresh dashboards.',
    ],
  },
};
