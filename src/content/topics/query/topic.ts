import { WorkshopTopic } from '@/types';

/**
 * Query & Search Topic
 *
 * Groups MongoDB's rich query and search capabilities:
 * - Rich document queries
 * - Text search and auto-complete
 * - Geospatial queries
 * - Graph-style traversals
 */
export const queryTopic: WorkshopTopic = {
  id: 'query',
  name: 'Query & Search',
  description:
    'Rich document queries, text search, auto-complete, geospatial, and graph-style traversals.',
  tags: ['query', 'search', 'text-search', 'autocomplete', 'geospatial', 'graph'],
  prerequisites: [],
  povCapabilities: ['RICH-QUERY', 'TEXT-SEARCH', 'AUTO-COMPLETE', 'GEOSPATIAL', 'GRAPH'],
};
