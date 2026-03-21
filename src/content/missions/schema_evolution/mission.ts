import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-20',
    title: 'Schema Evolution',
    codename: 'EVOLVE',
    tier: 'recon',
    description: 'Perform in-place schema changes — rename fields, restructure documents, and handle polymorphic data without downtime.',
    briefing: `FIELD OPERATION\n\nThe data model has evolved but the database hasn't caught up. Legacy fields need renaming, nested structures need flattening, and new fields need defaults. Your mission: use $rename, $unset, and $set to transform documents in-place. Then handle polymorphic schemas where different documents have different shapes.\n\nNo downtime allowed.`,
    objectives: [
      { id: 'obj-20-1', text: 'Rename fields using $rename operator', completed: false },
      { id: 'obj-20-2', text: 'Remove deprecated fields with $unset', completed: false },
      { id: 'obj-20-3', text: 'Add default values to existing documents with $set', completed: false },
      { id: 'obj-20-4', text: 'Query polymorphic documents with $exists and $type', completed: false },
    ],
    timeLimit: 420,
    xpReward: 500,
    difficulty: 2,
    topic: 'data-management',
    povCapabilities: ['FLEXIBLE'],
    chaosEvents: [],
  };
