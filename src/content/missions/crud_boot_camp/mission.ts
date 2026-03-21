import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-12',
    title: 'CRUD Boot Camp',
    codename: 'BOOTCAMP',
    tier: 'recon',
    description: 'Master the fundamentals: insert, find, update, and delete documents under time pressure.',
    briefing: `WELCOME TO THE GRID\n\nEvery heist starts with the basics. Before you can crack compound queries or shard clusters, you need to master CRUD. Your mission: insert documents with insertOne and insertMany, query with find and findOne, update with updateOne and updateMany, and delete the evidence.\n\nThis is your proving ground, agent. Show us what you've got.`,
    objectives: [
      { id: 'obj-12-1', text: 'Insert a single document with insertOne()', completed: false },
      { id: 'obj-12-2', text: 'Bulk insert documents with insertMany()', completed: false },
      { id: 'obj-12-3', text: 'Query documents with find() and findOne()', completed: false },
      { id: 'obj-12-4', text: 'Update documents with updateOne() and $set', completed: false },
      { id: 'obj-12-5', text: 'Delete documents with deleteOne()', completed: false },
    ],
    timeLimit: 420,
    xpReward: 350,
    difficulty: 1,
    topic: 'query',
    povCapabilities: ['RICH-QUERY'],
    chaosEvents: [],
  };
