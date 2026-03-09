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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const doc = { name: "Widget", quantity: 10, tags: ["a", "b"] };
const result = db.items.insertOne(doc);
print("Inserted id:", result.insertedId);
const docs = [{ name: "Gadget", quantity: 5 }, { name: "Gizmo", quantity: 15 }];
const manyResult = db.items.insertMany(docs);
print("insertMany insertedIds:", JSON.stringify(manyResult.insertedIds));`,
        skeleton: `_____ crud_lab;
const doc = { name: "Widget", quantity: 10, tags: ["a", "b"] };
const result = db.items.___________(doc);
print("Inserted id:", result.insertedId);
const docs = [{ name: "Gadget", quantity: 5 }, { name: "Gizmo", quantity: 15 }];
const manyResult = db.items.___________(docs);
print("insertMany insertedIds:", JSON.stringify(manyResult.insertedIds));`,
        inlineHints: [
          { line: 1, blankText: '_____', hint: 'Keyword to switch to a database by name', answer: 'use' },
          { line: 3, blankText: '___________', hint: 'Method to add a single document to the collection', answer: 'insertOne' },
          { line: 6, blankText: '___________', hint: 'Method to add an array of documents in one call', answer: 'insertMany' },
        ],
      },
      {
        filename: 'connect-insert.cs',
        language: 'csharp',
        code: `// STEP 1: Connect and Insert (InsertOne & InsertMany)
// Same logic as mongosh: connect, insert one document, insert many. Sync API; driver sets _id on doc(s) in-place.
// TASK: Complete Connect, InsertOne, and InsertMany (fill the blanks).

using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var doc = new BsonDocument { { "name", "Widget" }, { "quantity", 10 }, { "tags", new BsonArray { "a", "b" } } };
coll.InsertOne(doc);
Console.WriteLine("Inserted id: " + doc["_id"]);
var docs = new List<BsonDocument> {
  new BsonDocument { { "name", "Gadget" }, { "quantity", 5 } },
  new BsonDocument { { "name", "Gizmo" }, { "quantity", 15 } }
};
coll.InsertMany(docs);
Console.WriteLine("insertMany insertedIds: " + System.Text.Json.JsonSerializer.Serialize(docs.Select(d => d["_id"].ToString()).ToList()));`,
        skeleton: `// STEP 1: Connect and Insert (InsertOne & InsertMany)
// Same logic as mongosh: connect, insert one document, insert many. Sync API; driver sets _id on doc(s) in-place.
// TASK: Complete Connect, InsertOne, and InsertMany (fill the blanks).

using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new Mongo_________(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var doc = new BsonDocument { { "name", "Widget" }, { "quantity", 10 } };
coll.___________(doc);
Console.WriteLine("Inserted id: " + doc["_id"]);
var docs = new List<BsonDocument> { new BsonDocument { { "name", "Gadget" }, { "quantity", 5 } }, new BsonDocument { { "name", "Gizmo" }, { "quantity", 15 } } };
coll.___________(docs);
Console.WriteLine("insertMany insertedIds: " + System.Text.Json.JsonSerializer.Serialize(docs.Select(d => d["_id"].ToString()).ToList()));`,
        inlineHints: [
          { line: 12, blankText: '_________', hint: 'Class to create a connection to MongoDB (e.g. MongoClient)', answer: 'Client' },
          { line: 16, blankText: '___________', hint: 'Method to add a single document; driver sets doc["_id"] after insert', answer: 'InsertOne' },
          { line: 19, blankText: '___________', hint: 'Method to add multiple documents in one call', answer: 'InsertMany' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to execute; no separate terminal block is needed.',
      'Use the mongosh, node, or C# tab to run the same logic; Run echoes to the Terminal tab when you run.',
      'Run uses the mongosh path from Workshop Settings; set it if Run fails or you see "mongosh missing".',
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
  const docs = await coll.______({})
    .________(2)
    ._______(0).toArray();
  console.log("Found (limit 2):", docs.length);
  const one = await coll.___________({ name: "Widget" });
  console.log("findOne:", one);
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '______', hint: 'Method to query documents; returns a cursor', answer: 'find' },
          { line: 16, blankText: '________', hint: 'Cursor method to cap the number of documents returned', answer: 'limit' },
          { line: 17, blankText: '_______', hint: 'Cursor method to skip the first n documents (for pagination)', answer: 'skip' },
          { line: 19, blankText: '___________', hint: 'Method to return a single document or null', answer: 'findOne' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const docs = db.items.find({}).limit(2).skip(0).toArray();
print("Found (limit 2):", docs.length);
const one = db.items.findOne({ name: "Widget" });
printjson(one);`,
        skeleton: `use crud_lab;
const docs = db.items.______({})
  .________(2)
  ._______(0).toArray();
print("Found (limit 2):", docs.length);
const one = db.items.___________({ name: "Widget" });
printjson(one);`,
        inlineHints: [
          { line: 2, blankText: '______', hint: 'Method to query documents; returns a cursor', answer: 'find' },
          { line: 3, blankText: '________', hint: 'Cursor method to cap the number of documents returned', answer: 'limit' },
          { line: 4, blankText: '_______', hint: 'Cursor method to skip the first n documents', answer: 'skip' },
          { line: 6, blankText: '___________', hint: 'Method to return a single document or null', answer: 'findOne' },
        ],
      },
      {
        filename: 'find.cs',
        language: 'csharp',
        code: `// STEP 2: Read with Find, FindOne, Limit, and Skip (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var docs = coll.Find(new BsonDocument()).Limit(2).Skip(0).ToList();
Console.WriteLine("Found (limit 2): " + docs.Count);
var one = coll.Find(Builders<BsonDocument>.Filter.Eq("name", "Widget")).FirstOrDefault();
Console.WriteLine("findOne: " + (one?.ToJson() ?? "null"));`,
        skeleton: `// STEP 2: Read with Find, FindOne, Limit, and Skip (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var docs = coll.______(new BsonDocument())
  .________(2)
  ._______(0).ToList();
Console.WriteLine("Found (limit 2): " + docs.Count);
var one = coll.___________(Builders<BsonDocument>.Filter.Eq("name", "Widget")).FirstOrDefault();
Console.WriteLine("findOne: " + (one?.ToJson() ?? "null"));`,
        inlineHints: [
          { line: 12, blankText: '______', hint: 'Method to query documents; returns a cursor', answer: 'Find' },
          { line: 13, blankText: '________', hint: 'Cursor method to cap the number of documents returned', answer: 'Limit' },
          { line: 14, blankText: '_______', hint: 'Cursor method to skip the first n documents', answer: 'Skip' },
          { line: 16, blankText: '___________', hint: 'Method to return a single document or null', answer: 'Find' },
        ],
      },
    ],
    tips: [
      'find(filter) returns a cursor; chain .limit(n).skip(n).toArray() for pagination.',
      'Use the mongosh, node, or C# tab to run the same queries in the shell.',
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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const r1 = db.items.updateOne({ name: "Widget" }, { $set: { quantity: 20 } });
print("updateOne matched:", r1.matchedCount, "modified:", r1.modifiedCount);
const r2 = db.items.updateMany({ quantity: { $lt: 10 } }, { $set: { status: "updated" } });
print("updateMany matched:", r2.matchedCount, "modified:", r2.modifiedCount);`,
        skeleton: `use crud_lab;
const r1 = db.items.__________({ name: "Widget" },
  { _____: { quantity: 20 } });
print("updateOne matched:", r1.matchedCount, "modified:", r1.modifiedCount);
const r2 = db.items.___________({ quantity: { $lt: 10 } }, { $set: { status: "updated" } });
print("updateMany matched:", r2.matchedCount, "modified:", r2.modifiedCount);`,
        inlineHints: [
          { line: 2, blankText: '__________', hint: 'Method to update one document matching the filter', answer: 'updateOne' },
          { line: 3, blankText: '_____', hint: 'Update operator to set the value of a field', answer: '$set' },
          { line: 5, blankText: '___________', hint: 'Method to update all documents matching the filter', answer: 'updateMany' },
        ],
      },
      {
        filename: 'update.cs',
        language: 'csharp',
        code: `// STEP 3: Update with UpdateOne and UpdateMany (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var r1 = coll.UpdateOne(Builders<BsonDocument>.Filter.Eq("name", "Widget"), Builders<BsonDocument>.Update.Set("quantity", 20));
Console.WriteLine("updateOne matched: " + r1.MatchedCount + " modified: " + r1.ModifiedCount);
var r2 = coll.UpdateMany(Builders<BsonDocument>.Filter.Lt("quantity", 10), Builders<BsonDocument>.Update.Set("status", "updated"));
Console.WriteLine("updateMany matched: " + r2.MatchedCount + " modified: " + r2.ModifiedCount);`,
        skeleton: `// STEP 3: Update with UpdateOne and UpdateMany (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var r1 = coll.__________(
  Builders<BsonDocument>.Filter.Eq("name", "Widget"),
  Builders<BsonDocument>.Update._____("quantity", 20));
Console.WriteLine("updateOne matched: " + r1.MatchedCount + " modified: " + r1.ModifiedCount);
var r2 = coll.___________(
  Builders<BsonDocument>.Filter.Lt("quantity", 10),
  Builders<BsonDocument>.Update.Set("status", "updated"));
Console.WriteLine("updateMany matched: " + r2.MatchedCount + " modified: " + r2.ModifiedCount);`,
        inlineHints: [
          { line: 12, blankText: '__________', hint: 'Method to update one document matching the filter', answer: 'UpdateOne' },
          { line: 14, blankText: '_____', hint: 'Update builder method to set the value of a field', answer: 'Set' },
          { line: 16, blankText: '___________', hint: 'Method to update all documents matching the filter', answer: 'UpdateMany' },
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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const doc = db.items.findOne({ name: "Widget" });
if (doc) {
  const result = db.items.replaceOne(
    { _id: doc._id },
    { _id: doc._id, name: "WidgetV2", quantity: 99, replaced: true }
  );
  print("replaceOne matched:", result.matchedCount, "modified:", result.modifiedCount);
}`,
        skeleton: `use crud_lab;
const doc = db.items.findOne({ name: "Widget" });
if (doc) {
  const result = db.items.___________(
    { _id: doc._id },
    { _id: doc._id, name: "WidgetV2", quantity: 99, replaced: true }
  );
  print("replaceOne matched:", result.matchedCount, "modified:", result.modifiedCount);
}`,
        inlineHints: [
          { line: 4, blankText: '___________', hint: 'Method to replace the first matching document with a full document', answer: 'replaceOne' },
        ],
      },
      {
        filename: 'replace-one.cs',
        language: 'csharp',
        code: `// STEP 4: Replace a Document with ReplaceOne (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var doc = coll.Find(Builders<BsonDocument>.Filter.Eq("name", "Widget")).FirstOrDefault();
if (doc != null) {
  var replacement = new BsonDocument { { "_id", doc["_id"] }, { "name", "WidgetV2" }, { "quantity", 99 }, { "replaced", true } };
  var result = coll.ReplaceOne(Builders<BsonDocument>.Filter.Eq("_id", doc["_id"]), replacement);
  Console.WriteLine("replaceOne matched: " + result.MatchedCount + " modified: " + result.ModifiedCount);
}`,
        skeleton: `// STEP 4: Replace a Document with ReplaceOne (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var doc = coll.Find(Builders<BsonDocument>.Filter.Eq("name", "Widget")).FirstOrDefault();
if (doc != null) {
  var replacement = new BsonDocument { { "_id", doc["_id"] }, { "name", "WidgetV2" }, { "quantity", 99 } };
  var result = coll.___________(
    Builders<BsonDocument>.Filter.Eq("_id", doc["_id"]),
    replacement);
  Console.WriteLine("replaceOne matched: " + result.MatchedCount + " modified: " + result.ModifiedCount);
}`,
        inlineHints: [
          { line: 13, blankText: '___________', hint: 'Method to replace the first matching document with a full document', answer: 'ReplaceOne' },
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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const result = db.items.updateOne(
  { name: "NonExistent" },
  { $set: { name: "Upserted", value: 1 } },
  { upsert: true }
);
print("matchedCount:", result.matchedCount, "modifiedCount:", result.modifiedCount);
if (result.upsertedId) print("upsertedId:", result.upsertedId);`,
        skeleton: `use crud_lab;
const result = db.items.__________(
  { name: "NonExistent" },
  { $set: { name: "Upserted", value: 1 } },
  { _________: true }
);
print("matchedCount:", result.matchedCount, "modifiedCount:", result.modifiedCount);
if (result.upsertedId) print("upsertedId:", result.upsertedId);`,
        inlineHints: [
          { line: 2, blankText: '__________', hint: 'Method to update one document; with upsert option can insert if no match', answer: 'updateOne' },
          { line: 5, blankText: '_________', hint: 'Option: when true, insert a document if no document matches the filter', answer: 'upsert' },
        ],
      },
      {
        filename: 'upsert.cs',
        language: 'csharp',
        code: `// STEP 5: Upserts (update or insert) — same as mongosh
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var options = new UpdateOptions { IsUpsert = true };
var result = coll.UpdateOne(
  Builders<BsonDocument>.Filter.Eq("name", "NonExistent"),
  Builders<BsonDocument>.Update.Set("name", "Upserted").Set("value", 1),
  options);
Console.WriteLine("matchedCount: " + result.MatchedCount + " modifiedCount: " + result.ModifiedCount);
if (result.UpsertedId != null) Console.WriteLine("upsertedId: " + result.UpsertedId);`,
        skeleton: `// STEP 5: Upserts (update or insert) — same as mongosh
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var options = new UpdateOptions { _____________ = true };
var result = coll.__________(
  Builders<BsonDocument>.Filter.Eq("name", "NonExistent"),
  Builders<BsonDocument>.Update.Set("name", "Upserted").Set("value", 1),
  options);
Console.WriteLine("matchedCount: " + result.MatchedCount + " modifiedCount: " + result.ModifiedCount);
if (result.UpsertedId != null) Console.WriteLine("upsertedId: " + result.UpsertedId);`,
        inlineHints: [
          { line: 12, blankText: '_____________', hint: 'Option: when true, insert a document if no document matches the filter', answer: 'IsUpsert' },
          { line: 13, blankText: '__________', hint: 'Method to update one document; with upsert option can insert if no match', answer: 'UpdateOne' },
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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const resultOne = db.items.deleteOne({ name: "Gizmo" });
print("deleteOne deleted:", resultOne.deletedCount);
const resultMany = db.items.deleteMany({ name: "Widget" });
print("deleteMany deleted:", resultMany.deletedCount);`,
        skeleton: `use crud_lab;
const resultOne = db.items.__________({ name: "Gizmo" });
print("deleteOne deleted:", resultOne.deletedCount);
const resultMany = db.items.___________({ name: "Widget" });
print("deleteMany deleted:", resultMany.deletedCount);`,
        inlineHints: [
          { line: 2, blankText: '__________', hint: 'Method to remove at most one document matching the filter', answer: 'deleteOne' },
          { line: 4, blankText: '___________', hint: 'Method to remove all documents matching the filter', answer: 'deleteMany' },
        ],
      },
      {
        filename: 'delete.cs',
        language: 'csharp',
        code: `// STEP 6: Delete with DeleteOne and DeleteMany (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var resultOne = coll.DeleteOne(Builders<BsonDocument>.Filter.Eq("name", "Gizmo"));
Console.WriteLine("deleteOne deleted: " + resultOne.DeletedCount);
var resultMany = coll.DeleteMany(Builders<BsonDocument>.Filter.Eq("name", "Widget"));
Console.WriteLine("deleteMany deleted: " + resultMany.DeletedCount);`,
        skeleton: `// STEP 6: Delete with DeleteOne and DeleteMany (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var resultOne = coll.__________(Builders<BsonDocument>.Filter.Eq("name", "Gizmo"));
Console.WriteLine("deleteOne deleted: " + resultOne.DeletedCount);
var resultMany = coll.___________(Builders<BsonDocument>.Filter.Eq("name", "Widget"));
Console.WriteLine("deleteMany deleted: " + resultMany.DeletedCount);`,
        inlineHints: [
          { line: 12, blankText: '__________', hint: 'Method to remove at most one document matching the filter', answer: 'DeleteOne' },
          { line: 14, blankText: '___________', hint: 'Method to remove all documents matching the filter', answer: 'DeleteMany' },
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
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use crud_lab;
const result = db.items.bulkWrite([
  { insertOne: { document: { name: "Bulk1", qty: 1 } } },
  { updateOne: { filter: { name: "Bulk1" }, update: { $set: { qty: 2 } } } },
  { deleteOne: { filter: { name: "Bulk1" } } },
], { ordered: true });
print("insertedCount:", result.insertedCount, "modifiedCount:", result.modifiedCount, "deletedCount:", result.deletedCount);`,
        skeleton: `use crud_lab;
const result = db.items.__________([
  { insertOne: { document: { name: "Bulk1", qty: 1 } } },
  { updateOne: { filter: { name: "Bulk1" }, update: { $set: { qty: 2 } } } },
  { deleteOne: { filter: { name: "Bulk1" } } },
], { _________: true });
print("insertedCount:", result.insertedCount, "modifiedCount:", result.modifiedCount, "deletedCount:", result.deletedCount);`,
        inlineHints: [
          { line: 2, blankText: '__________', hint: 'Method to send multiple insert/update/delete operations in one round trip', answer: 'bulkWrite' },
          { line: 6, blankText: '_________', hint: 'Option: true = stop on first error, false = continue and report all errors', answer: 'ordered' },
        ],
      },
      {
        filename: 'bulk-write.cs',
        language: 'csharp',
        code: `// STEP 7: Batch Operations with BulkWrite (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var ops = new List<WriteModel<BsonDocument>> {
  new InsertOneModel<BsonDocument>(new BsonDocument { { "name", "Bulk1" }, { "qty", 1 } }),
  new UpdateOneModel<BsonDocument>(Builders<BsonDocument>.Filter.Eq("name", "Bulk1"), Builders<BsonDocument>.Update.Set("qty", 2)),
  new DeleteOneModel<BsonDocument>(Builders<BsonDocument>.Filter.Eq("name", "Bulk1")),
};
var result = coll.BulkWrite(ops, new BulkWriteOptions { IsOrdered = true });
Console.WriteLine("insertedCount: " + result.InsertedCount + " modifiedCount: " + result.ModifiedCount + " deletedCount: " + result.DeletedCount);`,
        skeleton: `// STEP 7: Batch Operations with BulkWrite (same as mongosh)
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("crud_lab");
var coll = db.GetCollection<BsonDocument>("items");
var ops = new List<WriteModel<BsonDocument>> {
  new InsertOneModel<BsonDocument>(new BsonDocument { { "name", "Bulk1" }, { "qty", 1 } }),
  new UpdateOneModel<BsonDocument>(Builders<BsonDocument>.Filter.Eq("name", "Bulk1"), Builders<BsonDocument>.Update.Set("qty", 2)),
  new DeleteOneModel<BsonDocument>(Builders<BsonDocument>.Filter.Eq("name", "Bulk1")),
};
var result = coll.__________(
  ops,
  new BulkWriteOptions { _________: true });
Console.WriteLine("insertedCount: " + result.InsertedCount + " modifiedCount: " + result.ModifiedCount + " deletedCount: " + result.DeletedCount);`,
        inlineHints: [
          { line: 15, blankText: '__________', hint: 'Method to send multiple insert/update/delete operations in one round trip', answer: 'BulkWrite' },
          { line: 17, blankText: '_________', hint: 'Option: true = stop on first error, false = continue and report all errors', answer: 'IsOrdered' },
        ],
      },
    ],
    tips: [
      'bulkWrite(operations, { ordered: true }) stops at the first error; ordered: false continues and reports all errors.',
      'Each operation: { insertOne: { document } }, { updateOne: { filter, update } }, { deleteOne: { filter } }, or { replaceOne: { filter, replacement } }.',
    ],
  },
};
