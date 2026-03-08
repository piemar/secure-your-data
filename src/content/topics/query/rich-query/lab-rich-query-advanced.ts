import { WorkshopLabDefinition } from '@/types';

/**
 * Rich Query: Aggregation Advanced Concepts
 *
 * Covers $bucket (histograms), $lookup (joins), and $merge (materialized output).
 * Builds on Rich Query Basics and Rich Query Aggregations.
 */
export const labRichQueryAdvancedDefinition: WorkshopLabDefinition = {
  id: 'lab-rich-query-advanced',
  topicId: 'query',
  title: 'Rich Query: Aggregation Advanced Concepts',
  description:
    'Use advanced aggregation stages: $bucket for histograms, $lookup for joins, and $merge to write pipeline results to a collection.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 40,
  tags: ['query', 'aggregation', 'bucket', 'lookup', 'merge'],
  prerequisites: ['lab-rich-query-aggregations'],
  povCapabilities: ['RICH-QUERY'],
  modes: ['lab', 'demo', 'challenge'],
  labFolderPath: 'Docs/pov-proof-exercises/proofs/01',
  whatYouWillBuild: [
    'A $bucket pipeline to build histograms (e.g. account balance ranges)',
    'A $lookup stage to join documents with another collection (e.g. state or product info)',
    'A $merge stage to write aggregation results into a new or existing collection',
  ],
  keyInsight:
    'Advanced aggregation stages let you build histograms, join collections like SQL, and materialize results for dashboards or incremental updates—all in the database.',
  keyConcepts: [
    { term: '$bucket', explanation: 'Groups documents into buckets based on boundaries; useful for histograms and range analysis.' },
    { term: '$lookup', explanation: 'Performs a left outer join to another collection in the same database; adds an array of matching documents.' },
    { term: '$merge', explanation: 'Writes pipeline results to a collection; must be the last stage; supports insert, merge, or replace.' },
    { term: 'Materialized view', explanation: 'Pre-computed results stored in a collection; $merge can create or update such collections.' },
  ],
  dataRequirements: [
    {
      id: 'customers-collection',
      description: 'Customer collection for aggregation (same as Rich Query Basics)',
      type: 'collection',
      namespace: 'RICH-QUERY.customers',
      sizeHint: '1M docs',
    },
    {
      id: 'state-info-collection',
      description: 'Small collection of state codes and names for $lookup join',
      type: 'collection',
      namespace: 'RICH-QUERY.state_info',
      sizeHint: '~50 docs',
    },
  ],
  steps: [
    {
      id: 'lab-rich-query-advanced-step-1',
      title: 'Step 1: Build a Histogram with $bucket',
      narrative:
        'Use the $bucket stage to group documents into range buckets based on a numeric or date expression. This is ideal for histograms (e.g. account balance ranges, age groups) and lets you analyze distribution in a single pass.',
      instructions:
        '- Define boundaries for your buckets (e.g. 0, 1000, 5000, 10000 for account balance).\n- Use groupBy to specify the field to bucket (e.g. $accountBalance).\n- Add output with accumulators like $sum: 1 to count documents per bucket.\n- Optionally set default for documents that fall outside all boundaries.',
      estimatedTimeMinutes: 12,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.bucket',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$bucket requires boundaries (array of values in ascending order) and groupBy (expression to bucket).',
        'Use output: { count: { $sum: 1 } } to count documents in each bucket.',
        'Documents outside boundaries go to default bucket if you specify default.',
      ],
    },
    {
      id: 'lab-rich-query-advanced-step-2',
      title: 'Step 2: Join Collections with $lookup',
      narrative:
        '$lookup performs a left outer join to another collection. You can match on a single field (localField, foreignField) or use a subpipeline for correlated joins. Results are added as an array field to each input document.',
      instructions:
        '- Choose the from collection (e.g. state_info) and the field to join on.\n- Set localField (e.g. address.state) and foreignField (e.g. _id or stateCode) and as (e.g. stateDetails).\n- Run the pipeline and inspect the new array field on each document.\n- Optionally $unwind the joined array to flatten one-to-one joins.',
      estimatedTimeMinutes: 14,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.lookup',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$lookup from, localField, foreignField, and as are the four key parameters for a simple equality join.',
        'The joined collection must be in the same database.',
        'Use $unwind with preserveNullAndEmptyArrays: true if you want one document per match and keep documents with no match.',
      ],
    },
    {
      id: 'lab-rich-query-advanced-step-3',
      title: 'Step 3: Write Results with $merge',
      narrative:
        '$merge must be the last stage in the pipeline. It writes the pipeline output to a collection—either a new one or an existing one. You can insert new documents, merge (upsert), replace, or keep existing. Use this for materialized views or ETL-style outputs.',
      instructions:
        '- Add a $merge stage as the last stage with into: { db: "your_db", coll: "summary_YOUR_SUFFIX" } (use YOUR_SUFFIX for multi-tenancy).\n- Choose whenMatched and whenNotMatched (e.g. whenNotMatched: "insert" for a fresh summary collection).\n- Run the pipeline and verify documents appear in the target collection.\n- Use a unique key (e.g. _id) so merge/replace behavior is predictable.',
      estimatedTimeMinutes: 14,
      modes: ['lab', 'demo', 'challenge'],
      points: 10,
      enhancementId: 'rich-query.merge',
      sourceProof: 'proofs/01/README.md',
      sourceSection: 'Execution - Aggregation',
      hints: [
        '$merge must be the last stage; no stage can follow it.',
        'Use into: { coll: "name_YOUR_SUFFIX" } so each participant writes to their own collection.',
        'whenNotMatched: "insert" inserts new documents; whenMatched controls what happens when the document already exists.',
      ],
    },
  ],
};
