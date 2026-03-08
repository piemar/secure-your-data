import { WorkshopLabDefinition } from '@/types';

/**
 * Rich Query Aggregations: Grouping & Facets
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/01/README.md (RICH-QUERY)
 * Extends rich query capability with aggregation pipelines over the same data model.
 */
export const labRichQueryAggregationsDefinition: WorkshopLabDefinition = {
  id: 'lab-rich-query-aggregations',
  topicId: 'query',
  title: 'Rich Query Aggregations: Grouping & Facets',
  description:
    'Use aggregation pipelines to compute grouped summaries, facets, and filtered views over operational data.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 50,
  tags: ['query', 'aggregation', 'facets', 'analytics'],
  prerequisites: [
    'lab-rich-query-basics',
    'MongoDB Atlas (M0+) or local MongoDB',
    'Node.js 18+',
    'mongosh installed; path in Workshop Settings for Run',
  ],
  povCapabilities: ['RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/01',
  whatYouWillBuild: [
    'A $match + $group + $sort pipeline for counts and totals',
    '$project and computed fields to shape output for dashboards or APIs',
    '$unwind to flatten arrays and aggregate per array element (e.g. per policy)',
    'Top N results using $sort and $limit in the pipeline',
    'Multi-facet aggregation with $facet to run several grouped views in one round trip',
    'Document count with the $count stage after filtering',
  ],
  keyInsight:
    'Aggregation pipelines process documents in stages; $unwind flattens arrays for per-item analytics, and $facet lets you compute multiple summaries in a single pass over the data.',
  keyConcepts: [
    { term: '$match', explanation: 'Filters documents early in the pipeline; reduces work for later stages.' },
    { term: '$group', explanation: 'Groups documents by a key and applies accumulators like $sum and $count.' },
    { term: '$unwind', explanation: 'Deconstructs an array field so each element becomes a separate document for downstream stages.' },
    { term: '$facet', explanation: 'Runs multiple sub-pipelines on the same input; outputs one document with one array per facet.' },
    { term: '$count', explanation: 'Returns the number of documents at the current pipeline position; useful for totals after $match or $group.' },
    { term: 'Accumulator', explanation: 'Operators such as $sum, $avg, $push used inside $group to compute values per group.' },
  ],
  dataRequirements: [
    {
      id: 'customers-collection',
      description: 'Customer collection with indexed fields for aggregation',
      type: 'collection',
      namespace: 'RICH-QUERY.customers',
      sizeHint: '1M docs',
    },
  ],
  steps: [
    {
      id: 'lab-rich-query-aggregations-step-1',
      title: 'Step 1: Build a Simple Aggregation Pipeline',
      narrative:
        'Start with a basic $match + $group pipeline to compute counts and totals over a filtered subset of documents.',
      instructions:
        '- Use $match to restrict to a business-relevant subset (e.g., active customers).\n- Use $group to compute count and sum over a numeric field.\n- Add $sort to order groups by total value.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.basic-aggregation',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        'Use $match as the first stage to filter documents before grouping.',
        'In $group, use _id for the grouping key and accumulator operators like $sum, $count for values.',
        'Add $sort after $group to order the grouped results (e.g. by total descending).',
      ],
    },
    {
      id: 'lab-rich-query-aggregations-step-2',
      title: 'Step 2: Add Projections and Derived Fields',
      narrative:
        'Use $project and computed fields to prepare results for downstream consumers like dashboards or APIs.',
      instructions:
        '- Use $project to rename and hide internal fields.\n- Add computed fields with $cond or $divide.\n- Verify that the final documents match the shape expected by a frontend chart.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.projection-aggregation',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        'Use $project to include, exclude, or rename fields in the pipeline output.',
        'Use $cond for conditional computed fields (e.g. tier based on a numeric range).',
        'Shape the output to match what your dashboard or API expects.',
      ],
    },
    {
      id: 'lab-rich-query-aggregations-step-3',
      title: 'Step 3: Unwind Arrays with $unwind',
      narrative:
        'Use $unwind to deconstruct array fields so each element becomes its own document. This lets you group and aggregate by array contents, such as counting or averaging per policy type across all customers.',
      instructions:
        '- Add a $match stage to restrict to active customers (or another filter).\n- Use $unwind on the policies array so each policy is a separate document.\n- Use $group to aggregate by policy type (e.g. count and average premium).\n- Add $sort to order by count or value.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.unwind',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$unwind takes a field path (e.g. $policies) and outputs one document per array element.',
        'After $unwind, each document has the array field replaced by a single element; other fields are preserved.',
        'Group by the unwound field (e.g. $policies.policyType) to get per-type stats.',
      ],
    },
    {
      id: 'lab-rich-query-aggregations-step-4',
      title: 'Step 4: Top N Results with $sort and $limit',
      narrative:
        'Combine $sort and $limit to return only the top N groups or documents. This pattern is common for dashboards (e.g. top 5 states by revenue, top 10 products by sales).',
      instructions:
        '- Build a pipeline with $match and $group (e.g. by state or category).\n- Add $sort to order groups by the metric you care about (e.g. totalValue descending).\n- Add $limit with the desired N (e.g. 5 or 10) to return only the top results.',
      estimatedTimeMinutes: 6,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.top-n',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$sort must come before $limit so the pipeline orders first, then truncates.',
        'Use -1 for descending order (highest first) when you want "top" by value.',
        '$limit is the last stage in this pattern; it reduces the number of documents passed to the client.',
      ],
    },
    {
      id: 'lab-rich-query-aggregations-step-5',
      title: 'Step 5: Multi-Facet Aggregation with $facet',
      narrative:
        'Run multiple aggregations in a single pipeline using $facet to feed multiple dashboards from one query.',
      instructions:
        '- Add a $facet stage to compute multiple grouped views in one pass.\n- Include at least two facets (e.g., by region and by product category).\n- Discuss performance benefits vs running separate queries.',
      estimatedTimeMinutes: 8,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.facets',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        'Use a single $facet stage with multiple sub-pipelines (each an array of stages).',
        'Each sub-pipeline runs over the same input documents and can $match, $group, $sort independently.',
        'Return at least two facets (e.g. by region and by category) in one round trip.',
      ],
    },
    {
      id: 'lab-rich-query-aggregations-step-6',
      title: 'Step 6: Document Count with $count',
      narrative:
        'Use the $count stage to return the total number of documents at the current pipeline position. This is useful for "how many match?" after $match or for simple totals without grouping.',
      instructions:
        '- Start with $match to filter documents (e.g. status, region).\n- Add a $count stage with a field name for the result (e.g. totalActive).\n- Run the pipeline and confirm the output is a single document with the count.',
      estimatedTimeMinutes: 5,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.count',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$count takes a string: the name of the output field that will hold the count.',
        'The pipeline before $count can be any stages; $count counts documents after the last stage.',
        'The result is a single document, e.g. { totalActive: 42 }, not an array of groups.',
      ],
    },
  ],
};

