import type { Step } from '@/components/labs/LabViewWithTabs';

/**
 * Step enhancements for Rich Query labs.
 *
 * These are referenced from lab steps via `enhancementId`, e.g.
 *  - enhancementId: 'rich-query.compound-query'
 *
 * Each factory returns a Partial<Step> that will be merged into the UI
 * representation for that step (code blocks, tips, troubleshooting, etc).
 */

type StepEnhancementFactory = () => Partial<Step>;

export const richQueryEnhancements: Record<string, StepEnhancementFactory> = {
  'rich-query.compound-query': () => ({
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
        // Guided skeleton with blanks and inline hints
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
  }),

  'rich-query.projection-sort': () => ({
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
  }),

  'rich-query.pagination': () => ({
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
  }),

  'rich-query.index-explain': () => ({
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
  }),
};

