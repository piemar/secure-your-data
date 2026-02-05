import { WorkshopLabDefinition } from '@/types';

/**
 * Rich Queries on Encrypted vs Plain Data
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/01/README.md (RICH-QUERY)
 * Applies rich query patterns (compound criteria, projections) to encrypted vs plain collections.
 */
export const labRichQueryEncryptedVsPlainDefinition: WorkshopLabDefinition = {
  id: 'lab-rich-query-encrypted-vs-plain',
  topicId: 'query',
  title: 'Rich Queries on Encrypted vs Plain Data',
  description:
    'Compare how rich queries behave on plain collections vs collections that use CSFLE/QE, and learn which patterns are supported.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 35,
  tags: ['query', 'encryption', 'csfle', 'qe', 'rich-query'],
  prerequisites: ['lab-csfle-fundamentals', 'lab-queryable-encryption'],
  povCapabilities: ['RICH-QUERY', 'ENCRYPT-FIELDS', 'FLE-QUERYABLE-KMIP'],
  modes: ['lab', 'demo', 'challenge'],
  keyConcepts: [
    { term: 'Rich Query', explanation: 'Compound criteria, projections, sorts, and aggregations on encrypted fields.' },
    { term: 'CSFLE Query Limits', explanation: 'Deterministic encryption supports equality only; no range or sort on ciphertext.' },
    { term: 'QE Query Support', explanation: 'Queryable Encryption supports equality and range queries on encrypted fields.' },
    { term: 'Field-Level Design', explanation: 'Choose which fields stay encrypted vs plain based on query requirements.' },
  ],
  steps: [
    {
      id: 'lab-rich-query-encrypted-step-1',
      title: 'Step 1: Reuse Existing Encrypted Collections',
      narrative:
        'Reuse the encrypted collections from the CSFLE and QE labs, alongside a plain-text reference collection, to compare query behavior.',
      instructions:
        '- Confirm that both plain and encrypted collections are populated.\n- Review existing indexes and schema definitions.\n- Write a baseline query against the plain collection to answer a business question.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'rich-query.encrypted-vs-plain-setup',
      points: 10,
    },
    {
      id: 'lab-rich-query-encrypted-step-2',
      title: 'Step 2: Apply Rich Queries to Encrypted Fields',
      narrative:
        'Run the same rich queries (filters, sorts, aggregations) against encrypted fields and observe which patterns are supported with CSFLE vs QE.',
      instructions:
        '- Attempt equality and range-style queries on encrypted fields.\n- Compare which queries succeed with CSFLE vs QE.\n- Capture limitations (e.g., deterministic-only equality, QE equality queries).',
      estimatedTimeMinutes: 15,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'rich-query.encrypted-vs-plain-queries',
      points: 15,
    },
    {
      id: 'lab-rich-query-encrypted-step-3',
      title: 'Step 3: Design a Customer-Safe Query Pattern',
      narrative:
        'Design a query pattern that keeps PII encrypted while still supporting the business queries your customer needs.',
      instructions:
        '- Propose which fields stay encrypted and which remain plain.\n- Show at least one query that works end-to-end without exposing PII.\n- Document trade-offs for the SA playbook.',
      estimatedTimeMinutes: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'rich-query.encrypted-vs-plain-design',
      points: 10,
    },
  ],
};

