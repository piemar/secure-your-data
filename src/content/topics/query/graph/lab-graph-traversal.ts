import { WorkshopLabDefinition } from '@/types';

export const labGraphTraversalDefinition: WorkshopLabDefinition = {
  id: 'lab-graph-traversal',
  topicId: 'query',
  title: 'Graph Traversal with $graphLookup',
  description:
    'Model relationships between documents and traverse them using $graphLookup to answer multi-hop questions.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 30,
  tags: ['query', 'graph', 'graphlookup'],
  prerequisites: ['lab-rich-query-basics'],
  povCapabilities: ['GRAPH'],
  modes: ['lab', 'demo', 'challenge'],
  steps: [
    {
      id: 'lab-graph-traversal-step-1',
      title: 'Step 1: Model Relationships as a Graph',
      narrative:
        'Represent hierarchical or network relationships (e.g., employees and managers) in document form.',
      instructions:
        '- Insert sample documents that reference related documents via IDs.\n- Choose a relationship to explore (e.g., reporting lines, dependencies).\n- Sketch the graph these relationships form.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyModel',
      points: 10,
    },
    {
      id: 'lab-graph-traversal-step-2',
      title: 'Step 2: Use $graphLookup to Traverse Relationships',
      narrative:
        'Use $graphLookup in an aggregation pipeline to traverse multiple hops and return connected nodes.',
      instructions:
        '- Build an aggregation pipeline with $graphLookup.\n- Traverse multiple hops (e.g., manager → reports → indirect reports).\n- Inspect the shape and depth of the returned graph data.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyTraversal',
      points: 10,
    },
    {
      id: 'lab-graph-traversal-step-3',
      title: 'Step 3: Explain Graph Queries to a Customer',
      narrative:
        'Summarize how MongoDB handles graph-like queries and when to use $graphLookup vs separate graph tools.',
      instructions:
        '- Capture a short explanation suitable for slides or a demo.\n- Highlight supported use cases and limitations.\n- Map this back to the GRAPH PoV capability.',
      estimatedTimeMinutes: 10,
      verificationId: 'graph.verifyExplanation',
      points: 10,
    },
  ],
};

