import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Rich Query Enhancement Metadata
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/01/README.md (RICH-QUERY)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'rich-query.compound-query': {
    id: 'rich-query.compound-query',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'compound-query.js',
        language: 'javascript',
        code: `// Find customers who are:
// - Female
// - Born in 1990
// - Living in Utah
// - Have at least one life insurance policy where the insured person is a smoker

db.customers.find({
  gender: 'Female',
  dob: {
    $gte: ISODate('1990-01-01'),
    $lte: ISODate('1990-12-31')
  },
  'address.state': 'UT',
  policies: {
    $elemMatch: {
      policyType: 'life',
      'insured_person.smoking': true
    }
  }
});`,
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: Same filter as MongoDB compound query
-- Female, born in 1990, state UT, at least one life policy with smoker insured

SELECT c.*
FROM customers c
WHERE c.gender = 'Female'
  AND c.dob >= '1990-01-01' AND c.dob <= '1990-12-31'
  AND c.address->>'state' = 'UT'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(c.policies) AS pol
    WHERE pol->>'policyType' = 'life'
      AND (pol->'insured_person'->>'smoking')::boolean = true
  );`,
            workaroundNote: 'Requires JSONB and jsonb_array_elements for array subdocuments; no native nested document query like MongoDB $elemMatch.',
          },
        },
        skeleton: `// Find customers who are:
// - Female
// - Born in 1990
// - Living in Utah
// - Have at least one life insurance policy where the insured person is a smoker

db.customers.find({
  gender: '_________',
  dob: {
    $gte: ISODate('1990-01-01'),
    $lte: ISODate('__________')
  },
  'address.state': 'UT',
  policies: {
    $elemMatch: {
      policyType: 'life',
      'insured_person.________': true
    }
  }
});`,
        inlineHints: [
          {
            line: 8,
            blankText: '_________',
            hint: "Filter by the customer's gender using a string literal.",
            answer: 'Female',
          },
          {
            line: 11,
            blankText: '__________',
            hint: 'Use the last day of 1990 as the upper bound for the date of birth.',
            answer: '1990-12-31',
          },
          {
            line: 15,
            blankText: '________',
            hint: 'This nested field indicates whether the insured person is a smoker.',
            answer: 'smoking',
          },
        ],
      },
    ],
    tips: [
      'This query mirrors the RICH-QUERY proof exercise compound criteria.',
      'Explain to the audience that all filtering happens server-side in MongoDB.',
    ],
  },

  'rich-query.projection-sort': {
    id: 'rich-query.projection-sort',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'projection-and-sort.js',
        language: 'javascript',
        code: `// Same filter, but only return the fields the application needs
// and order by date of birth.

db.customers
  .find(
    {
      gender: 'Female',
      dob: {
        $gte: ISODate('1990-01-01'),
        $lte: ISODate('1990-12-31')
      },
      'address.state': 'UT',
      policies: {
        $elemMatch: {
          policyType: 'life',
          'insured_person.smoking': true
        }
      }
    },
    {
      _id: 0,
      firstName: 1,
      lastName: 1,
      dob: 1
    }
  )
  .sort({ dob: 1 });`,
        skeleton: `// Same filter, but only return the fields the application needs
// and order by date of birth.

db.customers
  .find(
    {
      gender: 'Female',
      dob: {
        $gte: ISODate('1990-01-01'),
        $lte: ISODate('1990-12-31')
      },
      'address.state': 'UT',
      policies: {
        $elemMatch: {
          policyType: 'life',
          'insured_person.smoking': true
        }
      }
    },
    {
      _id: 0,
      _________: 1,
      _________: 1,
      dob: 1
    }
  )
  .sort({ _______: 1 });`,
        inlineHints: [
          {
            line: 27,
            blankText: '_________',
            hint: 'Include the given name field in the projection.',
            answer: 'firstName',
          },
          {
            line: 28,
            blankText: '_________',
            hint: 'Include the family name field in the projection.',
            answer: 'lastName',
          },
          {
            line: 31,
            blankText: '_______',
            hint: 'Sort by the same date field you projected.',
            answer: 'dob',
          },
        ],
      },
    ],
    tips: [
      'Show how projections reduce network payload compared to returning full documents.',
      'Sorting on an indexed field will later benefit from the compound index you create.',
    ],
  },

  'rich-query.pagination': {
    id: 'rich-query.pagination',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'pagination.js',
        language: 'javascript',
        code: `// Simple offset-based pagination using limit() and skip().
// In production, prefer range-based pagination for large collections.

const pageSize = 20;
const page = 2; // zero-based page index

db.customers
  .find({ 'address.state': 'UT' })
  .sort({ lastName: 1, firstName: 1 })
  .skip(page * pageSize)
  .limit(pageSize);`,
        skeleton: `// Simple offset-based pagination using limit() and skip().
// In production, prefer range-based pagination for large collections.

const pageSize = 20;
const page = ______; // zero-based page index

db.customers
  .find({ 'address.state': 'UT' })
  .sort({ lastName: 1, firstName: 1 })
  .skip(page * pageSize)
  .limit(pageSize);`,
        inlineHints: [
          {
            line: 6,
            blankText: '______',
            hint: 'Remember that the first page is page 0 in zero-based indexing.',
            answer: '2',
          },
        ],
      },
    ],
    tips: [
      'Discuss trade-offs of skip/limit vs range-based pagination.',
      'Explain that skip gets slower on very high offsets, motivating alternative patterns.',
    ],
  },

  'rich-query.index-explain': {
    id: 'rich-query.index-explain',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'create-index.js',
        language: 'javascript',
        code: `// Create a compound index that matches the query shape:
// equality fields first, range field last.

db.customers.createIndex({
  'address.state': 1,
  'policies.policyType': 1,
  'policies.insured_person.smoking': 1,
  gender: 1,
  dob: 1
});`,
      },
      {
        filename: 'explain-query.js',
        language: 'javascript',
        code: `// Compare COLLSCAN vs IXSCAN using explain().

db.customers
  .find({
    gender: 'Female',
    dob: {
      $gte: ISODate('1990-01-01'),
      $lte: ISODate('1990-12-31')
    },
    'address.state': 'UT',
    policies: {
      $elemMatch: {
        policyType: 'life',
        'insured_person.smoking': true
      }
    }
  })
  .explain('executionStats');`,
      },
    ],
    tips: [
      'Highlight the difference in docsExamined and executionTimeMillis before/after the index.',
      'Use screenshots from Compass Explain Plan to reinforce the IXSCAN vs COLLSCAN change.',
    ],
  },

  'rich-query.basic-aggregation': {
    id: 'rich-query.basic-aggregation',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'basic-aggregation.js',
        language: 'javascript',
        code: `// Build a simple aggregation pipeline with $match and $group
// Compute counts and totals over a filtered subset of documents

db.customers.aggregate([
  {
    $match: {
      'address.state': 'UT',
      status: 'active'
    }
  },
  {
    $group: {
      _id: '$address.state',
      totalCustomers: { $sum: 1 },
      totalValue: { $sum: '$accountBalance' }
    }
  },
  {
    $sort: { totalValue: -1 }
  }
]);`,
        skeleton: `// Build a simple aggregation pipeline with $match and $group
// Compute counts and totals over a filtered subset of documents

db.customers.aggregate([
  {
    $match: {
      'address.state': 'UT',
      status: '_________'
    }
  },
  {
    $group: {
      _id: '$address.state',
      totalCustomers: { $sum: _________ },
      totalValue: { $sum: '$_________' }
    }
  },
  {
    $sort: { totalValue: _________ }
  }
]);`,
        inlineHints: [
          {
            line: 6,
            blankText: '_________',
            hint: 'Filter for customers with active status.',
            answer: 'active',
          },
          {
            line: 11,
            blankText: '_________',
            hint: 'Use 1 to count each document in the group.',
            answer: '1',
          },
          {
            line: 12,
            blankText: '$_________',
            hint: 'Sum the account balance field for each customer.',
            answer: 'accountBalance',
          },
          {
            line: 16,
            blankText: '_________',
            hint: 'Sort in descending order (highest value first).',
            answer: '-1',
          },
        ],
      },
    ],
    tips: [
      'The $match stage filters documents before grouping, improving performance.',
      'Use $group to compute aggregations like counts, sums, and averages.',
      'Add $sort to order results by aggregated values.',
    ],
  },

  'rich-query.projection-aggregation': {
    id: 'rich-query.projection-aggregation',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'projection-aggregation.js',
        language: 'javascript',
        code: `// Use $project to rename and compute derived fields
// Prepare results for downstream consumers like dashboards or APIs

db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $group: {
      _id: '$address.state',
      count: { $sum: 1 },
      avgBalance: { $avg: '$accountBalance' }
    }
  },
  {
    $project: {
      _id: 0,
      state: '$_id',
      customerCount: '$count',
      averageBalance: { $round: ['$avgBalance', 2] },
      status: 'active'
    }
  }
]);`,
        skeleton: `// Use $project to rename and compute derived fields
// Prepare results for downstream consumers like dashboards or APIs

db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $group: {
      _id: '$address.state',
      count: { $sum: 1 },
      avgBalance: { $avg: '$_________' }
    }
  },
  {
    $project: {
      _id: 0,
      state: '$_id',
      customerCount: '$count',
      averageBalance: { $round: ['$_________', 2] },
      status: '_________'
    }
  }
]);`,
        inlineHints: [
          {
            line: 10,
            blankText: '$_________',
            hint: 'Calculate the average of the account balance field.',
            answer: 'accountBalance',
          },
          {
            line: 17,
            blankText: '$_________',
            hint: 'Round the average balance value.',
            answer: 'avgBalance',
          },
          {
            line: 18,
            blankText: '_________',
            hint: 'Add a static status field with the value "active".',
            answer: 'active',
          },
        ],
      },
    ],
    tips: [
      'Use $project to reshape output documents for your application.',
      'Computed fields can use expressions like $round, $cond, and $divide.',
      'Hide internal fields by setting _id: 0 or excluding fields.',
    ],
  },

  'rich-query.facets': {
    id: 'rich-query.facets',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'facet-aggregation.js',
        language: 'javascript',
        code: `// Run multiple aggregations in a single pipeline using $facet
// Feed multiple dashboards from one query

db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $facet: {
      byRegion: [
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 },
            totalValue: { $sum: '$accountBalance' }
          }
        },
        { $sort: { count: -1 } }
      ],
      byProduct: [
        {
          $unwind: '$policies'
        },
        {
          $group: {
            _id: '$policies.policyType',
            count: { $sum: 1 },
            avgPremium: { $avg: '$policies.premium' }
          }
        },
        { $sort: { count: -1 } }
      ]
    }
  }
]);`,
        skeleton: `// Run multiple aggregations in a single pipeline using $facet
// Feed multiple dashboards from one query

db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $facet: {
      byRegion: [
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 },
            totalValue: { $sum: '$_________' }
          }
        },
        { $sort: { count: _________ } }
      ],
      byProduct: [
        {
          $unwind: '$_________'
        },
        {
          $group: {
            _id: '$policies.policyType',
            count: { $sum: 1 },
            avgPremium: { $avg: '$policies._________' }
          }
        },
        { $sort: { count: -1 } }
      ]
    }
  }
]);`,
        inlineHints: [
          {
            line: 12,
            blankText: '$_________',
            hint: 'Sum the account balance field.',
            answer: 'accountBalance',
          },
          {
            line: 14,
            blankText: '_________',
            hint: 'Sort in descending order (highest count first).',
            answer: '-1',
          },
          {
            line: 19,
            blankText: '$_________',
            hint: 'Unwind the policies array to process each policy separately.',
            answer: 'policies',
          },
          {
            line: 24,
            blankText: '$policies._________',
            hint: 'Calculate the average premium for each policy type.',
            answer: 'premium',
          },
        ],
      },
    ],
    tips: [
      '$facet allows you to run multiple independent aggregation pipelines in one pass.',
      'Each facet produces a separate output array in the result document.',
      'This is more efficient than running separate queries for each dashboard.',
    ],
  },

  'rich-query.encrypted-vs-plain-setup': {
    id: 'rich-query.encrypted-vs-plain-setup',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Baseline Query (Plain Collection)',
        language: 'javascript',
        code: `// Confirm plain and encrypted collections exist
// encryption.patients (CSFLE), encryption.employees (QE), plain reference

// Baseline query against plain collection
db.customers.find(
  { 'address.state': 'CA', status: 'active' },
  { name: 1, email: 1, 'address.city': 1 }
).sort({ name: 1 });`,
      },
    ],
    tips: [
      'Reuse collections from CSFLE and QE labs.',
      'Plain collection for baseline comparison.',
      'Review indexes before querying encrypted fields.',
    ],
  },

  'rich-query.encrypted-vs-plain-queries': {
    id: 'rich-query.encrypted-vs-plain-queries',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Queries on Encrypted Fields',
        language: 'javascript',
        code: `// CSFLE (Deterministic): equality only
db.patients.find({ ssn: encryptedValue });

// QE: equality and range (if indexed)
db.employees.find({ 'encryptedField': { $gte: value } });

// Compare: which patterns work with CSFLE vs QE
// CSFLE: deterministic = equality; random = no queries
// QE: equality + range when indexed`,
      },
    ],
    tips: [
      'CSFLE deterministic: equality queries only.',
      'QE supports equality and range when properly indexed.',
      'Document limitations for customer playbook.',
    ],
  },

  'rich-query.encrypted-vs-plain-design': {
    id: 'rich-query.encrypted-vs-plain-design',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Customer-Safe Query Pattern',
        language: 'javascript',
        code: `// Design: PII encrypted, non-PII plain for queries
// Encrypted: ssn, dob, name (PII)
// Plain: region, status, productType (queryable)

// Example: query by region (plain) + return encrypted fields
db.customers.find(
  { region: 'West', status: 'active' },
  { name: 1, ssn: 1 }
);
// Application decrypts ssn client-side`,
      },
    ],
    tips: [
      'Keep PII encrypted; leave queryable fields plain.',
      'Document trade-offs: security vs query flexibility.',
      'One working end-to-end query demonstrates pattern.',
    ],
  },
};
