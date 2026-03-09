#!/usr/bin/env node
/**
 * Diagnose Rich Query Lab 2 Step 3 "wrong database" issue.
 *
 * The app substitutes "rich_query" → "rich_query_<suffix>" (e.g. rich_query_jak-jak)
 * in step code. If Step 1 (compound-query) was run with a different suffix—or data
 * was never created in the suffixed DB—Step 3 will query an empty/non-existent DB.
 *
 * Usage (from project root):
 *   MONGODB_URI="mongodb+srv://..." node scripts/diagnose-rich-query-db.mjs
 *
 * Optional:
 *   RICH_QUERY_DB=rich_query node scripts/diagnose-rich-query-db.mjs
 *   → runs the Step 3 pagination query against that DB and prints results.
 */
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri || !uri.trim()) {
  console.error('Set MONGODB_URI (e.g. your Atlas connection string).');
  process.exit(1);
}

const targetDb = process.env.RICH_QUERY_DB || null;

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();

    const richQueryDbs = databases
      .map((d) => d.name)
      .filter((name) => name === 'rich_query' || name.startsWith('rich_query_'));

    console.log('--- Databases matching rich_query / rich_query_* ---');
    if (richQueryDbs.length === 0) {
      console.log('(none found)');
    } else {
      for (const dbName of richQueryDbs.sort()) {
        const db = client.db(dbName);
        const count = await db.collection('customers').countDocuments();
        console.log(`  ${dbName}.customers: ${count} documents`);
      }
    }

    const dbToQuery = targetDb || richQueryDbs[0];
    if (!dbToQuery) {
      console.log('\nNo rich_query* database found. Run Lab 2 Step 1 (compound-query) first to create data.');
      return;
    }

    if (targetDb) {
      console.log(`\n--- Pagination query (Step 3) on DB: ${targetDb} ---`);
    } else {
      console.log(`\n--- Pagination query (Step 3) on first found DB: ${dbToQuery} ---`);
    }

    const pageSize = 20;
    const page = 2;
    const results = await client
      .db(dbToQuery)
      .collection('customers')
      .find({ 'address.state': 'UT' })
      .sort({ lastName: 1, firstName: 1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray();

    console.log(`  Result count: ${results.length} (expected up to ${pageSize} for page ${page})`);
    if (results.length > 0) {
      console.log('  First document keys:', Object.keys(results[0]).join(', '));
    } else {
      console.log('  (No documents. If you see rich_query_<suffix> in the lab UI, ensure Step 1 was run with the same suffix so data exists in that DB.)');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
