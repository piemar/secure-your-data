import { WorkshopLabDefinition } from '@/types';

/**
 * Rich Query Basics: Filtering, Projections & Indexes
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/01/README.md (RICH-QUERY)
 * Covers compound criteria, projections, and secondary indexes for efficient queries.
 */
export const labRichQueryBasicsDefinition: WorkshopLabDefinition = {
  id: 'lab-rich-query-basics',
  topicId: 'query',
  title: 'Rich Query Basics: Filtering & Projections',
  description:
    'Learn how to express rich document queries with filters, projections, and sort operations on nested documents and arrays.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 35,
  tags: ['query', 'rich-query', 'aggregation', 'basics'],
  prerequisites: [],
  povCapabilities: ['RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/01',
  defaultCompetitorId: 'postgresql',
  competitorIds: ['postgresql'],
  dataRequirements: [
    {
      id: 'customer-template',
      description: 'mgeneratejs template for insurance customer records',
      type: 'file',
      path: 'CustomerSingleView.json',
      sizeHint: '~1KB template',
    },
    {
      id: 'customers-collection',
      description: '1M insurance customer single-view records (gender, dob, address, policies)',
      type: 'collection',
      namespace: 'RICH-QUERY.customers',
      sizeHint: '1M docs, ~1GB',
    },
  ],
  steps: [
    {
      id: 'lab-rich-query-basics-step-1',
      title: 'Step 1: Filter Documents with Compound Criteria',
      narrative:
        'Start with basic find() queries that combine multiple fields, nested documents, and array predicates to target a precise subset of records (e.g. gender, date range, address.state, $elemMatch on arrays).',
      instructions:
        '- Use find() with $and / $or to combine conditions.\n- Filter on both top-level and nested fields (e.g. address.state).\n- Use array operators like $elemMatch to target specific elements.\n- Reference: proof 01 uses gender, dob range, address.state, and policies with $elemMatch.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'rich-query.verifyBasicFilters',
      points: 10,
      enhancementId: 'rich-query.compound-query',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - TEST 1',
    },
    {
      id: 'lab-rich-query-basics-step-2',
      title: 'Step 2: Shape Results with Projections & Sorting',
      narrative:
        'Control which fields are returned to the application and in what order using projections and sorts. Reduces network bandwidth by returning only needed fields.',
      instructions:
        '- Add projections to include only relevant fields (e.g. _id: 0, firstname: 1, lastname: 1, dob: 1).\n- Use sort() to order results by one or more fields.\n- Combine filters, projections, and sorts in a single query.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'rich-query.verifyProjectionAndSort',
      points: 10,
      enhancementId: 'rich-query.projection-sort',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - TEST 1',
    },
    {
      id: 'lab-rich-query-basics-step-3',
      title: 'Step 3: Pagination with limit() and skip()',
      narrative:
        'Implement simple pagination so your application can browse through large result sets efficiently.',
      instructions:
        '- Use limit() and skip() to page through results.\n- Combine pagination with filters and sorts.\n- Discuss trade-offs and when to use range-based pagination instead.',
      estimatedTimeMinutes: 9,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'rich-query.verifyPagination',
      points: 10,
      enhancementId: 'rich-query.pagination',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - TEST 1',
    },
    {
      id: 'lab-rich-query-basics-step-4',
      title: 'Step 4: Create a Compound Index and Compare Performance',
      narrative:
        'Create a compound index that matches your query shape (equality fields first, range field last) and use Explain Plan to compare COLLSCAN vs IXSCAN and document examined count.',
      instructions:
        '- In Compass Indexes tab, create a compound index with the same fields as your query (most selective first, range last).\n- Run the same query and use Explain Plan: note IXSCAN vs COLLSCAN and docs examined.\n- Reference: proof 01 index (address.state, policies.policyType, policies.insured_person.smoking, gender, dob).',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'challenge'],
      verificationId: 'rich-query.verifyIndexUsage',
      points: 10,
      enhancementId: 'rich-query.index-explain',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - TEST 1',
    },
  ],
};

