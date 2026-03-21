import { Document } from 'mongodb';
import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate } from '../../../sandbox/seeding/helpers.js';

export const mission20SeedData: SeedDefinition = {
  missionId: 'mission-20',
  collections: [
    {
      name: 'legacy_docs',
      documents: [
        ...generate(30, i => {
          const base: Document = {
            old_name: `Item ${i}`,
            deprecated_field: 'remove',
            version: 1,
          };
          if (i % 3 === 0) {
            base.extra_data = { nested: true, value: i };
          }
          if (i % 5 === 0) {
            base.tags = ['legacy', 'v1'];
          }
          return base;
        }),
        ...generate(10, i => ({
          name: `Migrated Item ${i}`,
          version: 2,
          status: 'active',
          migratedAt: new Date(2024, 5, i + 1),
        })),
      ],
    },
  ],
};
