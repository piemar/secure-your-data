import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-17',
    title: 'Text Search Infiltration',
    codename: 'SEARCHOPS',
    tier: 'exfiltration',
    description: 'Build Atlas Search indexes with fuzzy matching, autocomplete, and faceted search across document collections.',
    briefing: `SEARCH AND RECOVER\n\nIntelligence documents are scattered across millions of records. Keyword search isn't enough — you need fuzzy matching for misspellings, autocomplete for rapid identification, and faceted search to drill down by classification, date, and source.\n\nBuild the search infrastructure. Find the needle in the haystack.`,
    objectives: [
      { id: 'obj-17-1', text: 'Create an Atlas Search index with field mappings', completed: false },
      { id: 'obj-17-2', text: 'Build a $search query with fuzzy matching', completed: false },
      { id: 'obj-17-3', text: 'Implement autocomplete with edge n-gram', completed: false },
      { id: 'obj-17-4', text: 'Add faceted search with $searchMeta', completed: false },
    ],
    timeLimit: 720,
    xpReward: 1000,
    difficulty: 4,
    topic: 'query',
    povCapabilities: ['TEXT-SEARCH', 'AUTO-COMPLETE'],
    chaosEvents: [
      { id: 'chaos-17-1', title: '🔍 INDEX BUILDING', description: 'Search index is still building! Queries returning partial results.', triggerAt: 250, penalty: 150, duration: 90 },
    ],
  };
