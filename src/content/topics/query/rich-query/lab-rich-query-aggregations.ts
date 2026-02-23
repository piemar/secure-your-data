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
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'aggregation', 'facets', 'analytics'],
  prerequisites: ['lab-rich-query-basics'],
  povCapabilities: ['RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/01',
  dataRequirements: [
    {
      id: 'customers-collection',
      description: 'Customer collection with indexed fields for aggregation',
      type: 'collection',
      namespace: 'RICH-QUERY.customers',

      hints: [
        'Review the step instructions and narrative above for what to do.',
        'Check the lab folder path or source proof document for detailed guidance.',
        'Use "Check my progress" or verification when available to confirm completion.',
      ],      sizeHint: '1M docs',
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
      verificationId: 'rich-query.verifyBasicAggregation',
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
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'rich-query.verifyProjectionAggregation',
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
      title: 'Step 3: Multi-Facet Aggregation with $facet',
      narrative:
        'Run multiple aggregations in a single pipeline using $facet to feed multiple dashboards from one query.',
      instructions:
        '- Add a $facet stage to compute multiple grouped views in one pass.\n- Include at least two facets (e.g., by region and by product category).\n- Discuss performance benefits vs running separate queries.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      verificationId: 'rich-query.verifyFacets',
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
  ],
};

