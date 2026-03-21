import { Db, Document, CreateCollectionOptions } from 'mongodb';

export interface CollectionSeed {
  name: string;
  documents: Document[];
  options?: CreateCollectionOptions;
  indexes?: Array<{ key: Document; options?: Document }>;
}

export interface SeedDefinition {
  missionId: string;
  collections: CollectionSeed[];
  setup?: (db: Db) => Promise<void>;
}
