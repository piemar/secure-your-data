import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Time Series enhancements
 * Labs: Timeseries Fundamentals, Timeseries Queries and Windowing
 * Multi-tenancy: DB_NAME uses pattern A (timeseries-YOUR_SUFFIX) so built-in substitution applies.
 */
const DB_NAME = 'timeseries-YOUR_SUFFIX';

export const enhancements: EnhancementMetadataRegistry = {
  'timeseries.create-collection': {
    id: 'timeseries.create-collection',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Time Series',
    sourceSection: 'Create',
    codeBlocks: [
      {
        filename: 'create-collection.cjs',
        language: 'javascript',
        code: `// STEP 1: Create a time series collection
// Use createCollection with timeseries option: timeField, metaField, granularity.
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("${DB_NAME}");
  await db.createCollection("sensors", {
    timeseries: {
      timeField: "timestamp",
      metaField: "sensorId",
      granularity: "seconds",
    },
  });
  console.log("Time series collection 'sensors' created.");
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 1: Create a time series collection
// Use createCollection with timeseries option: timeField, metaField, granularity.
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient._________(uri);
  const db = client.db("${DB_NAME}");
  await db.__________("sensors", {
    timeseries: {
      timeField: "_________",
      metaField: "sensorId",
      granularity: "seconds",
    },
  });
  console.log("Time series collection 'sensors' created.");
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 8, blankText: '_________', hint: 'MongoClient method to open a connection', answer: 'connect' },
          { line: 10, blankText: '__________', hint: 'Database method to create a new collection with options', answer: 'createCollection' },
          { line: 12, blankText: '_________', hint: 'Required timeseries option: the field name that holds the date', answer: 'timestamp' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
db.createCollection("sensors", {
  timeseries: {
    timeField: "timestamp",
    metaField: "sensorId",
    granularity: "seconds",
  },
});
print("Time series collection 'sensors' created.");`,
        skeleton: `_____ ${DB_NAME};
db.__________("sensors", {
  timeseries: {
    timeField: "_________",
    metaField: "sensorId",
    granularity: "seconds",
  },
});
print("Time series collection 'sensors' created.");`,
        inlineHints: [
          { line: 1, blankText: '_____', hint: 'Keyword to switch to a database', answer: 'use' },
          { line: 2, blankText: '__________', hint: 'Method to create a collection with options', answer: 'createCollection' },
          { line: 4, blankText: '_________', hint: 'Required: field name for the date in each document', answer: 'timestamp' },
        ],
      },
      {
        filename: 'create-collection.cs',
        language: 'csharp',
        code: `// STEP 1: Create a time series collection (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("${DB_NAME}");
var options = new CreateCollectionOptions<BsonDocument>();
options.TimeSeriesOptions = new TimeSeriesOptions("timestamp", "sensorId", TimeSeriesGranularity.Seconds);
await db.CreateCollectionAsync("sensors", options);
Console.WriteLine("Time series collection 'sensors' created.");`,
        skeleton: `// STEP 1: Create a time series collection (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("${DB_NAME}");
var options = new CreateCollectionOptions<BsonDocument>();
options.TimeSeriesOptions = new TimeSeriesOptions("_________", "sensorId", TimeSeriesGranularity.Seconds);
await db.__________("sensors", options);
Console.WriteLine("Time series collection 'sensors' created.");`,
        inlineHints: [
          { line: 10, blankText: '_________', hint: 'Time field name (same as timeField in mongosh)', answer: 'timestamp' },
          { line: 11, blankText: '__________', hint: 'Method to create the collection', answer: 'CreateCollectionAsync' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection; no separate terminal needed.',
      'timeField is required; metaField and granularity improve query and storage efficiency.',
    ],
  },

  'timeseries.insert-measurements': {
    id: 'timeseries.insert-measurements',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Time Series',
    sourceSection: 'Insert',
    codeBlocks: [
      {
        filename: 'insert-measurements.cjs',
        language: 'javascript',
        code: `// STEP 2: Insert measurements (drop first, then 200+ docs)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("${DB_NAME}");
  const coll = db.collection("sensors");
  await coll.drop().catch(() => {});
  const docs = [];
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    const t = new Date(now.getTime() - (200 - i) * 1000);
    docs.push({
      timestamp: t,
      sensorId: i % 3 === 0 ? "sensor1" : i % 3 === 1 ? "sensor2" : "sensor3",
      temperature: 20 + Math.random() * 10,
    });
  }
  await coll.insertMany(docs);
  console.log("Inserted", docs.length, "measurements.");
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 2: Insert measurements (drop first, then 200+ docs)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("${DB_NAME}");
  const coll = db.collection("sensors");
  await coll.______().catch(() => {});
  const docs = [];
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    docs.push({
      timestamp: new Date(now.getTime() - (200 - i) * 1000),
      sensorId: i % 3 === 0 ? "sensor1" : i % 3 === 1 ? "sensor2" : "sensor3",
      temperature: 20 + Math.random() * 10,
    });
  }
  await coll.___________(docs);
  console.log("Inserted", docs.length, "measurements.");
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '______', hint: 'Method to remove the collection before re-inserting', answer: 'drop' },
          { line: 20, blankText: '___________', hint: 'Method to insert many documents at once', answer: 'insertMany' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
db.sensors.drop();
const docs = [];
const now = new Date();
for (let i = 0; i < 200; i++) {
  docs.push({
    timestamp: new Date(now.getTime() - (200 - i) * 1000),
    sensorId: i % 3 === 0 ? "sensor1" : i % 3 === 1 ? "sensor2" : "sensor3",
    temperature: 20 + Math.random() * 10,
  });
}
db.sensors.insertMany(docs);
print("Inserted", docs.length, "measurements.");`,
        skeleton: `use ${DB_NAME};
db.sensors.______();
const docs = [];
const now = new Date();
for (let i = 0; i < 200; i++) {
  docs.push({
    timestamp: new Date(now.getTime() - (200 - i) * 1000),
    sensorId: i % 3 === 0 ? "sensor1" : i % 3 === 1 ? "sensor2" : "sensor3",
    temperature: 20 + Math.random() * 10,
  });
}
db.sensors.___________(docs);
print("Inserted", docs.length, "measurements.");`,
        inlineHints: [
          { line: 2, blankText: '______', hint: 'Method to remove the collection', answer: 'drop' },
          { line: 12, blankText: '___________', hint: 'Method to insert many documents', answer: 'insertMany' },
        ],
      },
      {
        filename: 'insert-measurements.cs',
        language: 'csharp',
        code: `// STEP 2: Insert measurements (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("${DB_NAME}");
var coll = db.GetCollection<BsonDocument>("sensors");
await coll.DropAsync();
var docs = new List<BsonDocument>();
var now = DateTime.UtcNow;
for (int i = 0; i < 200; i++) {
  docs.Add(new BsonDocument {
    { "timestamp", now.AddSeconds(-(200 - i)) },
    { "sensorId", i % 3 == 0 ? "sensor1" : i % 3 == 1 ? "sensor2" : "sensor3" },
    { "temperature", 20 + (double)Random.Shared.NextSingle() * 10 },
  });
}
await coll.InsertManyAsync(docs);
Console.WriteLine("Inserted " + docs.Count + " measurements.");`,
        skeleton: `// STEP 2: Insert measurements (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("${DB_NAME}");
var coll = db.GetCollection<BsonDocument>("sensors");
await coll.______();
var docs = new List<BsonDocument>();
for (int i = 0; i < 200; i++) {
  docs.Add(new BsonDocument {
    { "timestamp", DateTime.UtcNow.AddSeconds(-(200 - i)) },
    { "sensorId", i % 3 == 0 ? "sensor1" : i % 3 == 1 ? "sensor2" : "sensor3" },
    { "temperature", 20 + (double)Random.Shared.NextSingle() * 10 },
  });
}
await coll.___________(docs);
Console.WriteLine("Inserted " + docs.Count + " measurements.");`,
        inlineHints: [
          { line: 10, blankText: '______', hint: 'Method to drop the collection', answer: 'DropAsync' },
          { line: 19, blankText: '___________', hint: 'Method to insert many documents', answer: 'InsertManyAsync' },
        ],
      },
    ],
    tips: [
      'Drop before insert so re-runs start clean.',
      'Each document must have the timeField (timestamp); metaField (sensorId) is optional but useful for filtering.',
    ],
  },

  'timeseries.query-range': {
    id: 'timeseries.query-range',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Time Series',
    sourceSection: 'Query',
    codeBlocks: [
      {
        filename: 'query-range.cjs',
        language: 'javascript',
        code: `// STEP 3: Query by time range
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const now = new Date();
  const start = new Date(now.getTime() - 120 * 1000);
  const end = new Date(now.getTime() - 60 * 1000);
  const docs = await coll.find({ timestamp: { $gte: start, $lte: end } }).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 3: Query by time range
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const now = new Date();
  const start = new Date(now.getTime() - 120 * 1000);
  const end = new Date(now.getTime() - 60 * 1000);
  const docs = await coll.find({ _________: { $gte: start, $lte: end } }).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 12, blankText: '_________', hint: 'The timeField name (timestamp)', answer: 'timestamp' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const now = new Date();
const start = new Date(now.getTime() - 120 * 1000);
const end = new Date(now.getTime() - 60 * 1000);
const docs = db.sensors.find({ timestamp: { $gte: start, $lte: end } }).toArray();
printjson(docs);`,
        skeleton: `use ${DB_NAME};
const now = new Date();
const start = new Date(now.getTime() - 120 * 1000);
const end = new Date(now.getTime() - 60 * 1000);
const docs = db.sensors.find({ _________: { $gte: start, $lte: end } }).toArray();
printjson(docs);`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Time field name for range filter', answer: 'timestamp' },
        ],
      },
      {
        filename: 'query-range.cs',
        language: 'csharp',
        code: `// STEP 3: Query by time range (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var now = DateTime.UtcNow;
var start = now.AddSeconds(-120);
var end = now.AddSeconds(-60);
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Gte("timestamp", start),
  Builders<BsonDocument>.Filter.Lte("timestamp", end));
var docs = coll.Find(filter).ToList();
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(docs.Select(d => d.ToDictionary()).ToList(), new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        skeleton: `// STEP 3: Query by time range (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var now = DateTime.UtcNow;
var start = now.AddSeconds(-120);
var end = now.AddSeconds(-60);
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Gte("_________", start),
  Builders<BsonDocument>.Filter.Lte("_________", end));
var docs = coll.Find(filter).ToList();
Console.WriteLine(docs.Count + " documents");`,
        inlineHints: [
          { line: 13, blankText: '_________', hint: 'Time field name for $gte', answer: 'timestamp' },
          { line: 14, blankText: '_________', hint: 'Time field name for $lte', answer: 'timestamp' },
        ],
      },
    ],
    tips: ['Use $gte and $lte for inclusive range; index on (metaField, timeField) supports efficient range + metadata queries.'],
  },

  'timeseries.query-meta': {
    id: 'timeseries.query-meta',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Time Series',
    sourceSection: 'Query',
    codeBlocks: [
      {
        filename: 'query-meta.cjs',
        language: 'javascript',
        code: `// STEP 4: Query by metadata (sensorId)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const docs = await coll.find({ sensorId: "sensor1" }).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 4: Query by metadata (sensorId)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const docs = await coll.find({ _________: "sensor1" }).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 9, blankText: '_________', hint: 'The metaField name you used when creating the collection', answer: 'sensorId' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const docs = db.sensors.find({ sensorId: "sensor1" }).toArray();
printjson(docs);`,
        skeleton: `use ${DB_NAME};
const docs = db.sensors.find({ _________: "sensor1" }).toArray();
printjson(docs);`,
        inlineHints: [
          { line: 2, blankText: '_________', hint: 'The metaField name (e.g. sensorId)', answer: 'sensorId' },
        ],
      },
      {
        filename: 'query-meta.cs',
        language: 'csharp',
        code: `// STEP 4: Query by metadata (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var docs = coll.Find(Builders<BsonDocument>.Filter.Eq("sensorId", "sensor1")).ToList();
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(docs, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        skeleton: `// STEP 4: Query by metadata (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var docs = coll.Find(Builders<BsonDocument>.Filter.Eq("_________", "sensor1")).ToList();
Console.WriteLine(docs.Count + " documents");`,
        inlineHints: [
          { line: 9, blankText: '_________', hint: 'The metaField name (e.g. sensorId)', answer: 'sensorId' },
        ],
      },
    ],
    tips: ['Filter on metaField to get one sensor\'s series; combine with time range for efficiency.'],
  },

  'timeseries.aggregate-basics': {
    id: 'timeseries.aggregate-basics',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Aggregation',
    sourceSection: '$group',
    codeBlocks: [
      {
        filename: 'aggregate-basics.cjs',
        language: 'javascript',
        code: `// STEP 5: $group by sensorId, $avg temperature
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP 5: $group by sensorId, $avg temperature
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    {
      $group: {
        _id: "$_________",
        avgTemp: { $avg: "$temperature" },
      },
    },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 12, blankText: '$_________', hint: 'Group by this field (metaField)', answer: 'sensorId' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  {
    $group: {
      _id: "$_________",
      avgTemp: { $_________: "$temperature" },
    },
  },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 5, blankText: '$_________', hint: 'Group by this field (metaField)', answer: 'sensorId' },
          { line: 6, blankText: '$_________', hint: 'Accumulator for average', answer: 'avg' },
        ],
      },
      {
        filename: 'aggregate-basics.cs',
        language: 'csharp',
        code: `// STEP 5: $group (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] { BsonDocument.Parse("{ $group: { _id: \\"$sensorId\\", avgTemp: { $avg: \\"$temperature\\" } } }") };
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result.Select(d => d.ToDictionary()).ToList(), new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        skeleton: `// STEP 5: $group (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $group: { _id: \\"$_________\\", avgTemp: { $avg: \\"$temperature\\" } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " groups");`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Group by this field (metaField)', answer: 'sensorId' },
        ],
      },
    ],
    tips: ['$group _id is the grouping key; use $avg, $sum, $min, $max for accumulators.'],
  },

  'timeseries.match-sort': {
    id: 'timeseries.match-sort',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Aggregation',
    sourceSection: '$match, $sort',
    codeBlocks: [
      {
        filename: 'match-sort.cjs',
        language: 'javascript',
        code: `// Lab 2 Step 1: $match and $sort
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// Lab 2 Step 1: $match and $sort
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $_________: { sensorId: "sensor1" } },
    { $_________: { timestamp: 1 } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Stage to filter documents', answer: 'match' },
          { line: 11, blankText: '$_________', hint: 'Stage to order by timestamp ascending', answer: 'sort' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $_________: { sensorId: "sensor1" } },
  { $_________: { timestamp: 1 } },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 3, blankText: '$_________', hint: 'Stage to filter documents', answer: 'match' },
          { line: 4, blankText: '$_________', hint: 'Stage to order by timestamp', answer: 'sort' },
        ],
      },
      {
        filename: 'match-sort.cs',
        language: 'csharp',
        code: `// Lab 2 Step 1: $match and $sort (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(result.Select(d => d.ToDictionary()).ToList(), new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        skeleton: `// Lab 2 Step 1: $match and $sort (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $_________: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $_________: { timestamp: 1 } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " documents");`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Stage to filter documents', answer: 'match' },
          { line: 11, blankText: '$_________', hint: 'Stage to order by timestamp', answer: 'sort' },
        ],
      },
    ],
    tips: ['$match reduces documents; $sort by timeField (timestamp: 1) for time-ordered input.'],
  },

  'timeseries.window-exp-moving-avg': {
    id: 'timeseries.window-exp-moving-avg',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - $setWindowFields',
    sourceSection: '$expMovingAvg',
    codeBlocks: [
      {
        filename: 'window-exp-moving-avg.cjs',
        language: 'javascript',
        code: `// Lab 2 Step 2: $setWindowFields with $expMovingAvg
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: {
          tempExpAvg: {
            $expMovingAvg: { input: "$temperature", N: 5 },
          },
        },
      },
    },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// Lab 2 Step 2: $setWindowFields with $expMovingAvg
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: {
          tempExpAvg: {
            $expMovingAvg: { input: "$_________", N: 5 },
          },
        },
      },
    },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 17, blankText: '$_________', hint: 'Field to compute exponential moving average over (metric)', answer: 'temperature' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  {
    $setWindowFields: {
      sortBy: { timestamp: 1 },
      output: {
        tempExpAvg: {
          $expMovingAvg: { input: "$temperature", N: 5 },
        },
      },
    },
  },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  {
    $setWindowFields: {
      sortBy: { timestamp: 1 },
      output: {
        tempExpAvg: {
          $expMovingAvg: { input: "$_________", N: 5 },
        },
      },
    },
  },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Field to compute exponential moving average over', answer: 'temperature' },
        ],
      },
      {
        filename: 'window-exp-moving-avg.cs',
        language: 'csharp',
        code: `// Lab 2 Step 2: $setWindowFields $expMovingAvg (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: \\"$temperature\\", N: 5 } } } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " documents with tempExpAvg");`,
        skeleton: `// Lab 2 Step 2: $setWindowFields $expMovingAvg (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: \\"$_________\\", N: 5 } } } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " documents");`,
        inlineHints: [
          { line: 12, blankText: '$_________', hint: 'Metric field for exponential moving average', answer: 'temperature' },
        ],
      },
    ],
    tips: ['$expMovingAvg weights recent values more; N is the window size in documents.'],
  },

  'timeseries.window-gap-fill': {
    id: 'timeseries.window-gap-fill',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - $setWindowFields',
    sourceSection: 'Gap fill',
    codeBlocks: [
      {
        filename: 'window-gap-fill.cjs',
        language: 'javascript',
        code: `// Lab 2 Step 3: Gap fill with $linearFill (or $locf)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: {
          tempFilled: {
            $linearFill: "$temperature",
          },
        },
      },
    },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// Lab 2 Step 3: Gap fill with $linearFill (or $locf)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: {
          tempFilled: {
            $_________: "$temperature",
          },
        },
      },
    },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 17, blankText: '$_________', hint: 'Operator to fill nulls with linear interpolation', answer: 'linearFill' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  {
    $setWindowFields: {
      sortBy: { timestamp: 1 },
      output: {
        tempFilled: { $linearFill: "$temperature" },
      },
    },
  },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  {
    $setWindowFields: {
      sortBy: { timestamp: 1 },
      output: {
        tempFilled: { $_________: "$temperature" },
      },
    },
  },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 9, blankText: '$_________', hint: 'Operator to fill nulls (linear interpolation)', answer: 'linearFill' },
        ],
      },
      {
        filename: 'window-gap-fill.cs',
        language: 'csharp',
        code: `// Lab 2 Step 3: Gap fill (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempFilled: { $linearFill: \\"$temperature\\" } } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " documents");`,
        skeleton: `// Lab 2 Step 3: Gap fill (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempFilled: { $_________: \\"$temperature\\" } } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " documents");`,
        inlineHints: [
          { line: 12, blankText: '$_________', hint: 'Gap-fill operator (linear interpolation)', answer: 'linearFill' },
        ],
      },
    ],
    tips: ['$linearFill interpolates between known values; $locf carries last observation forward.'],
  },

  'timeseries.group-summary': {
    id: 'timeseries.group-summary',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - $group',
    sourceSection: '$group',
    codeBlocks: [
      {
        filename: 'group-summary.cjs',
        language: 'javascript',
        code: `// Lab 2 Step 4: $group summary
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" }, count: { $sum: 1 } } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// Lab 2 Step 4: $group summary
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $group: { _id: "$sensorId", avgTemp: { $_________: "$temperature" }, count: { $sum: 1 } } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Accumulator for average', answer: 'avg' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" }, count: { $sum: 1 } } },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $group: { _id: "$sensorId", avgTemp: { $_________: "$temperature" }, count: { $sum: 1 } } },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 3, blankText: '$_________', hint: 'Accumulator for average', answer: 'avg' },
        ],
      },
      {
        filename: 'group-summary.cs',
        language: 'csharp',
        code: `// Lab 2 Step 4: $group summary (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] { BsonDocument.Parse("{ $group: { _id: \\"$sensorId\\", avgTemp: { $avg: \\"$temperature\\" }, count: { $sum: 1 } } }") };
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " groups");`,
        skeleton: `// Lab 2 Step 4: $group summary (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] { BsonDocument.Parse("{ $group: { _id: \\"$sensorId\\", avgTemp: { $_________: \\"$temperature\\" }, count: { $sum: 1 } } }") };
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " groups");`,
        inlineHints: [
          { line: 9, blankText: '$_________', hint: 'Accumulator for average', answer: 'avg' },
        ],
      },
    ],
    tips: ['$group by sensorId; use $avg, $sum, $min, $max for metrics.'],
  },

  'timeseries.summary': {
    id: 'timeseries.summary',
    povCapability: 'TIME-SERIES',
    sourceProof: 'MongoDB Manual - Time Series, Aggregation',
    sourceSection: 'Windowing',
    codeBlocks: [
      {
        filename: 'summary.cjs',
        language: 'javascript',
        code: `// Lab 2 Step 5: Recap – match, sort, window, group
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: { tempExpAvg: { $expMovingAvg: { input: "$temperature", N: 5 } } },
      },
    },
    { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// Lab 2 Step 5: Recap – match, sort, window, group
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const coll = client.db("${DB_NAME}").collection("sensors");
  const result = await coll.aggregate([
    { $match: { sensorId: "sensor1" } },
    { $sort: { timestamp: 1 } },
    {
      $setWindowFields: {
        sortBy: { timestamp: 1 },
        output: { tempExpAvg: { $expMovingAvg: { input: "$_________", N: 5 } } },
      },
    },
    { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
  ]).toArray();
  console.log(JSON.stringify(result, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 15, blankText: '$_________', hint: 'Metric field for $expMovingAvg', answer: 'temperature' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  { $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: "$temperature", N: 5 } } } } } },
  { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
]).toArray();
printjson(result);`,
        skeleton: `use ${DB_NAME};
const result = db.sensors.aggregate([
  { $match: { sensorId: "sensor1" } },
  { $sort: { timestamp: 1 } },
  { $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: "$_________", N: 5 } } } } } },
  { $group: { _id: "$sensorId", avgTemp: { $avg: "$temperature" } } },
]).toArray();
printjson(result);`,
        inlineHints: [
          { line: 5, blankText: '$_________', hint: 'Metric field for $expMovingAvg', answer: 'temperature' },
        ],
      },
      {
        filename: 'summary.cs',
        language: 'csharp',
        code: `// Lab 2 Step 5: Recap (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: \\"$temperature\\", N: 5 } } } } }"),
  BsonDocument.Parse("{ $group: { _id: \\"$sensorId\\", avgTemp: { $avg: \\"$temperature\\" } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " groups");`,
        skeleton: `// Lab 2 Step 5: Recap (same as mongosh)
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var coll = client.GetDatabase("${DB_NAME}").GetCollection<BsonDocument>("sensors");
var pipeline = new[] {
  BsonDocument.Parse("{ $match: { sensorId: \\"sensor1\\" } }"),
  BsonDocument.Parse("{ $sort: { timestamp: 1 } }"),
  BsonDocument.Parse("{ $setWindowFields: { sortBy: { timestamp: 1 }, output: { tempExpAvg: { $expMovingAvg: { input: \\"$_________\\", N: 5 } } } } }"),
  BsonDocument.Parse("{ $group: { _id: \\"$sensorId\\", avgTemp: { $avg: \\"$temperature\\" } } }"),
};
var result = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(result.Count + " groups");`,
        inlineHints: [
          { line: 12, blankText: '$_________', hint: 'Metric field for $expMovingAvg', answer: 'temperature' },
        ],
      },
    ],
    tips: ['Order: $match → $sort → $setWindowFields → $group. Use same DB (timeseries-<suffix>).'],
  },
};
