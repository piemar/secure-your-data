import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * CRUD Enhancement Metadata
 *
 * CRUD operations with the MongoDB Node.js driver.
 * Source: MongoDB Manual - CRUD (https://www.mongodb.com/docs/manual/crud/)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'crud.connect-insert': {
    id: 'crud.connect-insert',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Create Operations',
    codeBlocks: [
      {
        filename: 'connect-insert.cjs',
        language: 'javascript',
        code: `// STEP 1: Connect and Insert (insertOne & insertMany)
// ══════════════════════════════════════════════════════════════
// Connect to MongoDB; add one document with insertOne, multiple with insertMany.
//
// TASK: Complete the connect call and the insert methods (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const doc = { name: "Widget", quantity: 10, tags: ["a", "b"] };
  const result = await coll.insertOne(doc);
  console.log("Inserted id:", result.insertedId);
  const docs = [
    { name: "Gadget", quantity: 5 },
    { name: "Gizmo", quantity: 15 },
  ];
  const manyResult = await coll.insertMany(docs);
  console.log("insertMany insertedIds:", manyResult.insertedIds);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 1: Connect and Insert (insertOne & insertMany)
// ══════════════════════════════════════════════════════════════
// Connect to MongoDB; add one document with insertOne, multiple with insertMany.
//
// TASK: Complete the connect call and the insert methods (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient._________(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const doc = { name: "Widget", quantity: 10 };
  const result = await coll.___________(doc);
  console.log("Inserted id:", result.insertedId);
  const docs = [{ name: "Gadget", quantity: 5 }, { name: "Gizmo", quantity: 15 }];
  const manyResult = await coll.___________(docs);
  console.log("insertMany insertedIds:", manyResult.insertedIds);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 12, blankText: '_________', hint: 'Method on MongoClient to open a connection to the URI', answer: 'connect' },
          { line: 16, blankText: '___________', hint: 'Method to add a single document to the collection', answer: 'insertOne' },
          { line: 19, blankText: '___________', hint: 'Method to add an array of documents in one call', answer: 'insertMany' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to execute; no separate terminal block is needed.',
      'insertMany() returns { acknowledged, insertedIds }. MongoDB creates the collection if it does not exist.',
    ],
  },

  'crud.find': {
    id: 'crud.find',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Read Operations',
    codeBlocks: [
      {
        filename: 'find.cjs',
        language: 'javascript',
        code: `// STEP 2: Read with find, findOne, limit, and skip
// ══════════════════════════════════════════════════════════════
// find(filter) returns a cursor; use limit/skip for pagination. findOne returns one doc or null.
//
// TASK: Fill in find, limit, skip, and findOne.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const docs = await coll.find({}).limit(2).skip(0).toArray();
  console.log("Found (limit 2):", docs.length);
  const one = await coll.findOne({ name: "Widget" });
  console.log("findOne:", one);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 2: Read with find, findOne, limit, and skip
// ══════════════════════════════════════════════════════════════
// find(filter) returns a cursor; use limit/skip for pagination. findOne returns one doc or null.
//
// TASK: Fill in find, limit, skip, and findOne.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const docs = await coll.______({}).________(2)._______(0).toArray();
  console.log("Found (limit 2):", docs.length);
  const one = await coll.___________({ name: "Widget" });
  console.log("findOne:", one);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '______', hint: 'Method to query documents; returns a cursor', answer: 'find' },
          { line: 15, blankText: '________', hint: 'Cursor method to cap the number of documents returned', answer: 'limit' },
          { line: 15, blankText: '_______', hint: 'Cursor method to skip the first n documents (for pagination)', answer: 'skip' },
          { line: 17, blankText: '___________', hint: 'Method to return a single document or null', answer: 'findOne' },
        ],
      },
    ],
    tips: [
      'find(filter) returns a cursor; chain .limit(n).skip(n).toArray() for pagination.',
      'findOne(filter) returns a Promise of the document or null; no cursor.',
    ],
  },

  'crud.update': {
    id: 'crud.update',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Update Operations',
    codeBlocks: [
      {
        filename: 'update.cjs',
        language: 'javascript',
        code: `// STEP 3: Update with updateOne and updateMany
// ══════════════════════════════════════════════════════════════
// updateOne updates the first match; updateMany updates all. Use $set for field changes.
//
// TASK: Complete updateOne, $set, and updateMany.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const r1 = await coll.updateOne(
    { name: "Widget" },
    { $set: { quantity: 20 } }
  );
  console.log("updateOne matched:", r1.matchedCount, "modified:", r1.modifiedCount);
  const r2 = await coll.updateMany(
    { quantity: { $lt: 10 } },
    { $set: { status: "updated" } }
  );
  console.log("updateMany matched:", r2.matchedCount, "modified:", r2.modifiedCount);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 3: Update with updateOne and updateMany
// ══════════════════════════════════════════════════════════════
// updateOne updates the first match; updateMany updates all. Use $set for field changes.
//
// TASK: Complete updateOne, $set, and updateMany.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const r1 = await coll.__________(
    { name: "Widget" },
    { _____: { quantity: 20 } }
  );
  console.log("updateOne matched:", r1.matchedCount, "modified:", r1.modifiedCount);
  const r2 = await coll.___________(
    { quantity: { $lt: 10 } },
    { $set: { status: "updated" } }
  );
  console.log("updateMany matched:", r2.matchedCount, "modified:", r2.modifiedCount);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '__________', hint: 'Method to update one document matching the filter', answer: 'updateOne' },
          { line: 17, blankText: '_____', hint: 'Update operator to set the value of a field', answer: '$set' },
          { line: 20, blankText: '___________', hint: 'Method to update all documents matching the filter', answer: 'updateMany' },
        ],
      },
    ],
    tips: [
      'updateOne(filter, update) updates at most one document; updateMany(filter, update) updates all matches.',
      'Use $set to change specific fields. matchedCount and modifiedCount are in the result.',
    ],
  },

  'crud.replace-one': {
    id: 'crud.replace-one',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Update Operations',
    codeBlocks: [
      {
        filename: 'replace-one.cjs',
        language: 'javascript',
        code: `// STEP 4: Replace a Document with replaceOne
// ══════════════════════════════════════════════════════════════
// replaceOne replaces the first matching document with a full replacement document (no $set).
//
// TASK: Complete the replaceOne call.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const doc = await coll.findOne({ name: "Widget" });
  if (doc) {
    const result = await coll.replaceOne(
      { _id: doc._id },
      { _id: doc._id, name: "WidgetV2", quantity: 99, replaced: true }
    );
    console.log("replaceOne matched:", result.matchedCount, "modified:", result.modifiedCount);
  }
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 4: Replace a Document with replaceOne
// ══════════════════════════════════════════════════════════════
// replaceOne replaces the first matching document with a full replacement document (no $set).
//
// TASK: Complete the replaceOne call.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const doc = await coll.findOne({ name: "Widget" });
  if (doc) {
    const result = await coll.___________(
      { _id: doc._id },
      { _id: doc._id, name: "WidgetV2", quantity: 99 }
    );
    console.log("replaceOne matched:", result.matchedCount, "modified:", result.modifiedCount);
  }
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 17, blankText: '___________', hint: 'Method to replace the first matching document with a full document', answer: 'replaceOne' },
        ],
      },
    ],
    tips: [
      'replaceOne(filter, replacement) takes a full document as the second argument, not update operators.',
      'Include _id in the replacement to keep the same _id.',
    ],
  },

  'crud.upsert': {
    id: 'crud.upsert',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Update Operations',
    codeBlocks: [
      {
        filename: 'upsert.cjs',
        language: 'javascript',
        code: `// STEP 5: Upserts (update or insert)
// ══════════════════════════════════════════════════════════════
// With upsert: true, updateOne/updateMany insert a document if no match exists.
//
// TASK: Complete updateOne and the upsert option.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const result = await coll.updateOne(
    { name: "NonExistent" },
    { $set: { name: "Upserted", value: 1 } },
    { upsert: true }
  );
  console.log("matchedCount:", result.matchedCount, "modifiedCount:", result.modifiedCount);
  if (result.upsertedId) console.log("upsertedId:", result.upsertedId);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 5: Upserts (update or insert)
// ══════════════════════════════════════════════════════════════
// With upsert: true, updateOne/updateMany insert a document if no match exists.
//
// TASK: Complete updateOne and the upsert option.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const result = await coll.__________(
    { name: "NonExistent" },
    { $set: { name: "Upserted", value: 1 } },
    { _________: true }
  );
  console.log("matchedCount:", result.matchedCount, "modifiedCount:", result.modifiedCount);
  if (result.upsertedId) console.log("upsertedId:", result.upsertedId);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '__________', hint: 'Method to update one document; with upsert option can insert if no match', answer: 'updateOne' },
          { line: 18, blankText: '_________', hint: 'Option: when true, insert a document if no document matches the filter', answer: 'upsert' },
        ],
      },
    ],
    tips: [
      'When no document matches, MongoDB inserts one. The new document combines equality fields from the filter with fields from the update ($set).',
      'result.upsertedId is set when an insert occurred; result.matchedCount and result.modifiedCount indicate an update.',
    ],
  },

  'crud.delete': {
    id: 'crud.delete',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Delete Operations',
    codeBlocks: [
      {
        filename: 'delete.cjs',
        language: 'javascript',
        code: `// STEP 6: Delete with deleteOne and deleteMany
// ══════════════════════════════════════════════════════════════
// deleteOne removes at most one match; deleteMany removes all matches. Same filter syntax as find.
//
// TASK: Complete deleteOne and deleteMany.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const resultOne = await coll.deleteOne({ name: "Gizmo" });
  console.log("deleteOne deleted:", resultOne.deletedCount);
  const resultMany = await coll.deleteMany({ name: "Widget" });
  console.log("deleteMany deleted:", resultMany.deletedCount);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 6: Delete with deleteOne and deleteMany
// ══════════════════════════════════════════════════════════════
// deleteOne removes at most one match; deleteMany removes all matches. Same filter syntax as find.
//
// TASK: Complete deleteOne and deleteMany.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const resultOne = await coll.__________({ name: "Gizmo" });
  console.log("deleteOne deleted:", resultOne.deletedCount);
  const resultMany = await coll.___________({ name: "Widget" });
  console.log("deleteMany deleted:", resultMany.deletedCount);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '__________', hint: 'Method to remove at most one document matching the filter', answer: 'deleteOne' },
          { line: 17, blankText: '___________', hint: 'Method to remove all documents matching the filter', answer: 'deleteMany' },
        ],
      },
    ],
    tips: [
      'deleteOne(filter) removes at most one document; deleteMany(filter) removes all matching documents.',
      'Always verify your filter so you do not delete more data than intended.',
    ],
  },

  'crud.bulk-write': {
    id: 'crud.bulk-write',
    povCapability: 'RICH-QUERY',
    sourceProof: 'MongoDB Manual - CRUD',
    sourceSection: 'Bulk Write',
    codeBlocks: [
      {
        filename: 'bulk-write.cjs',
        language: 'javascript',
        code: `// STEP 7: Batch Operations with bulkWrite
// ══════════════════════════════════════════════════════════════
// bulkWrite sends multiple insert/update/replace/delete operations in one round trip.
//
// TASK: Complete bulkWrite and the ordered option.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const result = await coll.bulkWrite([
    { insertOne: { document: { name: "Bulk1", qty: 1 } } },
    { updateOne: { filter: { name: "Bulk1" }, update: { $set: { qty: 2 } } } },
    { deleteOne: { filter: { name: "Bulk1" } } },
  ], { ordered: true });
  console.log("insertedCount:", result.insertedCount);
  console.log("modifiedCount:", result.modifiedCount);
  console.log("deletedCount:", result.deletedCount);
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 7: Batch Operations with bulkWrite
// ══════════════════════════════════════════════════════════════
// bulkWrite sends multiple insert/update/replace/delete operations in one round trip.
//
// TASK: Complete bulkWrite and the ordered option.

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("crud_lab");
  const coll = db.collection("items");
  const result = await coll.__________([
    { insertOne: { document: { name: "Bulk1", qty: 1 } } },
    { updateOne: { filter: { name: "Bulk1" }, update: { $set: { qty: 2 } } } },
    { deleteOne: { filter: { name: "Bulk1" } } },
  ], { _________: true });
  console.log("insertedCount:", result.insertedCount, "modifiedCount:", result.modifiedCount, "deletedCount:", result.deletedCount);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '__________', hint: 'Method to send multiple insert/update/delete operations in one round trip', answer: 'bulkWrite' },
          { line: 19, blankText: '_________', hint: 'Option: true = stop on first error, false = continue and report all errors', answer: 'ordered' },
        ],
      },
    ],
    tips: [
      'bulkWrite(operations, { ordered: true }) stops at the first error; ordered: false continues and reports all errors.',
      'Each operation: { insertOne: { document } }, { updateOne: { filter, update } }, { deleteOne: { filter } }, or { replaceOne: { filter, replacement } }.',
    ],
  },
};
