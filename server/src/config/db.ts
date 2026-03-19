import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) throw new Error('MONGODB_URI environment variable is required');
  if (!dbName) throw new Error('MONGODB_DB_NAME environment variable is required');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName); // "mongodb_mayhem" — never hardcode

  console.log(`✅ Connected to MongoDB database: ${dbName}`);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('Database not initialized — call connectDB() first');
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) await client.close();
}
