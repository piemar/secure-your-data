import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Rich Query Enhancement Metadata
 * 
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/01/README.md (RICH-QUERY)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'rich-query.compound-query': {
    id: 'rich-query.compound-query',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'compound-query.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

function createCustomer(status, gender, dob, state, accountBalance, policies) {
  return { status, gender, dob, address: { state }, accountBalance, policies };
}

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const coll = db.collection("customers");
  await coll.drop().catch(() => {});
  const docs = [
    createCustomer('active', 'Female', new Date('1990-06-15'), 'UT', 1500.50, [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }]),
    createCustomer('active', 'Female', new Date('1990-03-20'), 'UT', 2200.75, [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }]),
    createCustomer('active', 'Male', new Date('1985-01-10'), 'UT', 800.25, [{ policyType: 'auto', premium: 180 }]),
  ];
  for (let i = 3; i < 200; i++) {
    docs.push(createCustomer('active', i % 2 === 0 ? 'Female' : 'Male', new Date(1980 + (i % 20), i % 12, 1), 'UT', 500 + i * 10, [{ policyType: 'auto', premium: 100 + (i % 50) }]));
  }
  await coll.insertMany(docs);
  console.log("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
  const results = await coll.find({
    gender: 'Female',
    dob: { $gte: new Date('1990-01-01'), $lte: new Date('1990-12-31') },
    'address.state': 'UT',
    policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
  }).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

function createCustomer(status, gender, dob, state, accountBalance, policies) {
  return { status, gender, dob, address: { state }, accountBalance, policies };
}

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const coll = db.collection("customers");
  await coll.drop().catch(() => {});
  const docs = [
    createCustomer('active', 'Female', new Date('1990-06-15'), 'UT', 1500.50, [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }]),
    createCustomer('active', 'Female', new Date('1990-03-20'), 'UT', 2200.75, [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }]),
    createCustomer('active', 'Male', new Date('1985-01-10'), 'UT', 800.25, [{ policyType: 'auto', premium: 180 }]),
  ];
  for (let i = 3; i < 200; i++) {
    docs.push(createCustomer('active', i % 2 === 0 ? 'Female' : 'Male', new Date(1980 + (i % 20), i % 12, 1), 'UT', 500 + i * 10, [{ policyType: 'auto', premium: 100 + (i % 50) }]));
  }
  await coll.insertMany(docs);
  console.log("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
  const results = await coll.find({
    gender: '_________',
    dob: { $gte: new Date('1990-01-01'), $lte: new Date('__________') },
    'address.state': 'UT',
    policies: { $elemMatch: { policyType: 'life', 'insured_person.________': true } }
  }).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        competitorEquivalents: {
          postgresql: {
            language: 'sql',
            code: `-- PostgreSQL: Same filter as MongoDB compound query
-- Female, born in 1990, state UT, at least one life policy with smoker insured

SELECT c.*
FROM customers c
WHERE c.gender = 'Female'
  AND c.dob >= '1990-01-01' AND c.dob <= '1990-12-31'
  AND c.address->>'state' = 'UT'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(c.policies) AS pol
    WHERE pol->>'policyType' = 'life'
      AND (pol->'insured_person'->>'smoking')::boolean = true
  );`,
            workaroundNote: 'Requires JSONB and jsonb_array_elements for array subdocuments; no native nested document query like MongoDB $elemMatch.',
          },
        },
        inlineHints: [
          { line: 25, blankText: '_________', hint: "Filter by the customer's gender using a string literal.", answer: 'Female' },
          { line: 26, blankText: '__________', hint: 'Use the last day of 1990 as the upper bound for the date of birth.', answer: '1990-12-31' },
          { line: 28, blankText: '________', hint: 'This nested field indicates whether the insured person is a smoker.', answer: 'smoking' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Step 1: Create 200 customers in rich_query.customers (drop first), then run compound query. State always UT.
db = db.getSiblingDB('rich_query');
function createCustomer(status, gender, dob, state, accountBalance, policies) {
  return { status, gender, dob, address: { state }, accountBalance, policies };
}
db.customers.drop();
const docs = [];
docs.push(createCustomer('active', 'Female', ISODate('1990-06-15'), 'UT', 1500.50, [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }]));
docs.push(createCustomer('active', 'Female', ISODate('1990-03-20'), 'UT', 2200.75, [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }]));
docs.push(createCustomer('active', 'Male', ISODate('1985-01-10'), 'UT', 800.25, [{ policyType: 'auto', premium: 180 }]));
for (let i = 3; i < 200; i++) {
  docs.push(createCustomer('active', i % 2 === 0 ? 'Female' : 'Male', new Date(1980 + (i % 20), i % 12, 1), 'UT', 500 + i * 10, [{ policyType: 'auto', premium: 100 + (i % 50) }]));
}
db.customers.insertMany(docs);
print("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
const results = db.customers.find({
  gender: 'Female',
  dob: { $gte: ISODate('1990-01-01'), $lte: ISODate('1990-12-31') },
  'address.state': 'UT',
  policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
}).toArray();
printjson(results);
print("Query completed.");`,
        skeleton: `db = db.getSiblingDB('rich_query');
function createCustomer(status, gender, dob, state, accountBalance, policies) {
  return { status, gender, dob, address: { state }, accountBalance, policies };
}
db.customers.drop();
const docs = [];
docs.push(createCustomer('active', 'Female', ISODate('1990-06-15'), 'UT', 1500.50, [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }]));
docs.push(createCustomer('active', 'Female', ISODate('1990-03-20'), 'UT', 2200.75, [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }]));
docs.push(createCustomer('active', 'Male', ISODate('1985-01-10'), 'UT', 800.25, [{ policyType: 'auto', premium: 180 }]));
for (let i = 3; i < 200; i++) {
  docs.push(createCustomer('active', i % 2 === 0 ? 'Female' : 'Male', new Date(1980 + (i % 20), i % 12, 1), 'UT', 500 + i * 10, [{ policyType: 'auto', premium: 100 + (i % 50) }]));
}
db.customers.insertMany(docs);
print("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
const results = db.customers.find({
  gender: '_________',
  dob: { $gte: ISODate('1990-01-01'), $lte: ISODate('__________') },
  'address.state': 'UT',
  policies: { $elemMatch: { policyType: 'life', 'insured_person.________': true } }
}).toArray();
printjson(results);
print("Query completed.");`,
        inlineHints: [
          { line: 16, blankText: '_________', hint: "Filter by the customer's gender using a string literal.", answer: 'Female' },
          { line: 17, blankText: '__________', hint: 'Use the last day of 1990 as the upper bound for the date of birth.', answer: '1990-12-31' },
          { line: 19, blankText: '________', hint: 'This nested field indicates whether the insured person is a smoker.', answer: 'smoking' },
        ],
      },
      {
        filename: 'compound-query.cs',
        language: 'csharp',
        code: `// Compound query: same logic as mongosh — Female, born 1990, UT, life policy with smoker
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

// Generate one customer document (keeps sample-data code maintainable and scalable)
BsonDocument CreateCustomer(string status, string gender, DateTime dob, string state, double accountBalance, BsonArray policies) {
  var doc = new BsonDocument();
  doc.Add("status", status);
  doc.Add("gender", gender);
  doc.Add("dob", dob);
  doc.Add("address", new BsonDocument("state", state));
  doc.Add("accountBalance", accountBalance);
  doc.Add("policies", policies);
  return doc;
}

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
db.DropCollection("customers");

var docs = new List<BsonDocument>();
// First 3: seed data that will match the compound query (Female, 1990, UT, life policy with smoking)
var p1a = new BsonDocument(); p1a.Add("policyType", "life"); p1a.Add("premium", 100); p1a.Add("insured_person", new BsonDocument("smoking", true));
var p1b = new BsonDocument(); p1b.Add("policyType", "auto"); p1b.Add("premium", 200);
var policies1 = new BsonArray(); policies1.Add(p1a); policies1.Add(p1b);
docs.Add(CreateCustomer("active", "Female", new DateTime(1990, 6, 15), "UT", 1500.50, policies1));
var p2 = new BsonArray(); var p2a = new BsonDocument(); p2a.Add("policyType", "life"); p2a.Add("premium", 150); p2a.Add("insured_person", new BsonDocument("smoking", false)); p2.Add(p2a);
docs.Add(CreateCustomer("active", "Female", new DateTime(1990, 3, 20), "UT", 2200.75, p2));
var p3 = new BsonArray(); var p3a = new BsonDocument(); p3a.Add("policyType", "auto"); p3a.Add("premium", 180); p3.Add(p3a);
docs.Add(CreateCustomer("active", "Male", new DateTime(1985, 1, 10), "UT", 800.25, p3));
// Remaining 197: varied customers (state UT; won't all match the filter) so we have 200 total
for (int i = 3; i < 200; i++) {
  var ps = new BsonArray();
  var pol = new BsonDocument(); pol.Add("policyType", "auto"); pol.Add("premium", 100 + (i % 50)); ps.Add(pol);
  docs.Add(CreateCustomer("active", i % 2 == 0 ? "Female" : "Male", new DateTime(1980 + (i % 20), (i % 12) + 1, 1), "UT", 500 + i * 10, ps));
}
coll.InsertMany(docs);
Console.WriteLine("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Eq("gender", "Female"),
  Builders<BsonDocument>.Filter.Gte("dob", new DateTime(1990, 1, 1)),
  Builders<BsonDocument>.Filter.Lte("dob", new DateTime(1990, 12, 31)),
  Builders<BsonDocument>.Filter.Eq("address.state", "UT"),
  Builders<BsonDocument>.Filter.ElemMatch("policies", Builders<BsonDocument>.Filter.And(
    Builders<BsonDocument>.Filter.Eq("policyType", "life"),
    Builders<BsonDocument>.Filter.Eq("insured_person.smoking", true)
  ))
);
var results = coll.Find(filter).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Query completed.");`,
        skeleton: `// Compound query: same as mongosh — Female, born 1990, UT, life policy with smoker
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

BsonDocument CreateCustomer(string status, string gender, DateTime dob, string state, double accountBalance, BsonArray policies) {
  var doc = new BsonDocument();
  doc.Add("status", status);
  doc.Add("gender", gender);
  doc.Add("dob", dob);
  doc.Add("address", new BsonDocument("state", state));
  doc.Add("accountBalance", accountBalance);
  doc.Add("policies", policies);
  return doc;
}

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
db.DropCollection("customers");

var docs = new List<BsonDocument>();
var p1a = new BsonDocument(); p1a.Add("policyType", "life"); p1a.Add("premium", 100); p1a.Add("insured_person", new BsonDocument("smoking", true));
var p1b = new BsonDocument(); p1b.Add("policyType", "auto"); p1b.Add("premium", 200);
var policies1 = new BsonArray(); policies1.Add(p1a); policies1.Add(p1b);
docs.Add(CreateCustomer("active", "Female", new DateTime(1990, 6, 15), "UT", 1500.50, policies1));
var p2 = new BsonArray(); var p2a = new BsonDocument(); p2a.Add("policyType", "life"); p2a.Add("premium", 150); p2a.Add("insured_person", new BsonDocument("smoking", false)); p2.Add(p2a);
docs.Add(CreateCustomer("active", "Female", new DateTime(1990, 3, 20), "UT", 2200.75, p2));
var p3 = new BsonArray(); var p3a = new BsonDocument(); p3a.Add("policyType", "auto"); p3a.Add("premium", 180); p3.Add(p3a);
docs.Add(CreateCustomer("active", "Male", new DateTime(1985, 1, 10), "UT", 800.25, p3));
for (int i = 3; i < 200; i++) {
  var ps = new BsonArray();
  var pol = new BsonDocument(); pol.Add("policyType", "auto"); pol.Add("premium", 100 + (i % 50)); ps.Add(pol);
  docs.Add(CreateCustomer("active", i % 2 == 0 ? "Female" : "Male", new DateTime(1980 + (i % 20), (i % 12) + 1, 1), "UT", 500 + i * 10, ps));
}
coll.InsertMany(docs);
Console.WriteLine("Dropped and recreated 200 sample customers (state UT) for Rich Query labs.");
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Eq("gender", "_________"),
  Builders<BsonDocument>.Filter.Gte("dob", new DateTime(1990, 1, 1)),
  Builders<BsonDocument>.Filter.Lte("dob", new DateTime(1990, 12, 31)),
  Builders<BsonDocument>.Filter.Eq("address.state", "UT"),
  Builders<BsonDocument>.Filter.ElemMatch("policies", Builders<BsonDocument>.Filter.And(
    Builders<BsonDocument>.Filter.Eq("policyType", "life"),
    Builders<BsonDocument>.Filter.Eq("insured_person.________", true)
  ))
);
var results = coll.Find(filter).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        inlineHints: [
          { line: 41, blankText: '_________', hint: "Filter by the customer's gender using a string literal.", answer: 'Female' },
          { line: 47, blankText: '________', hint: 'Nested field indicating whether the insured person is a smoker.', answer: 'smoking' },
        ],
      },
    ],
    tips: [
      'Use the mongosh, node, or C# tab to run the same logic; Run uses the mongosh path from Workshop Settings for mongosh.',
      'This query mirrors the RICH-QUERY proof exercise compound criteria.',
      'Explain to the audience that all filtering happens server-side in MongoDB.',
    ],
  },

  'rich-query.projection-sort': {
    id: 'rich-query.projection-sort',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'projection-and-sort.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").find(
      {
        gender: 'Female',
        dob: { $gte: new Date('1990-01-01'), $lte: new Date('1990-12-31') },
        'address.state': 'UT',
        policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
      },
      {
        projection: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          dob: 1
        }
      }
    )
    .sort({ dob: 1 })
    .toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").find(
      {
        gender: 'Female',
        dob: { $gte: new Date('1990-01-01'), $lte: new Date('1990-12-31') },
        'address.state': 'UT',
        policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
      },
      {
        projection: {
          _id: 0,
          _________: 1,
          _________: 1,
          dob: 1
        }
      }
    )
    .sort({ _______: 1 })
    .toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          {
            line: 18,
            blankText: '_________',
            hint: 'Include the given name field in the projection.',
            answer: 'firstName',
          },
          {
            line: 19,
            blankText: '_________',
            hint: 'Include the family name field in the projection.',
            answer: 'lastName',
          },
          {
            line: 24,
            blankText: '_______',
            hint: 'Sort by the same date field you projected.',
            answer: 'dob',
          },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Same filter, but only return the fields the application needs
// and order by date of birth.

const results = db.customers.find(
    {
      gender: 'Female',
      dob: {
        $gte: ISODate('1990-01-01'),
        $lte: ISODate('1990-12-31')
      },
      'address.state': 'UT',
      policies: {
        $elemMatch: {
          policyType: 'life',
          'insured_person.smoking': true
        }
      }
    },
    {
      _id: 0,
      firstName: 1,
      lastName: 1,
      dob: 1
    }
  )
  .sort({ dob: 1 })
  .toArray();
printjson(results);
print("Query completed.");`,
        skeleton: `// Same filter, but only return the fields the application needs
// and order by date of birth.

const results = db.customers.find(
    {
      gender: 'Female',
      dob: {
        $gte: ISODate('1990-01-01'),
        $lte: ISODate('1990-12-31')
      },
      'address.state': 'UT',
      policies: {
        $elemMatch: {
          policyType: 'life',
          'insured_person.smoking': true
        }
      }
    },
    {
      _id: 0,
      _________: 1,
      _________: 1,
      dob: 1
    }
  )
  .sort({ _______: 1 })
  .toArray();
printjson(results);
print("Query completed.");`,
        inlineHints: [
          { line: 21, blankText: '_________', hint: 'Include the given name field in the projection.', answer: 'firstName' },
          { line: 22, blankText: '_________', hint: 'Include the family name field in the projection.', answer: 'lastName' },
          { line: 26, blankText: '_______', hint: 'Sort by the same date field you projected.', answer: 'dob' },
        ],
      },
      {
        filename: 'projection-and-sort.cs',
        language: 'csharp',
        code: `// Projection and sort: same as mongosh — filter, project _id:0 firstName lastName dob, sort by dob
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Eq("gender", "Female"),
  Builders<BsonDocument>.Filter.Gte("dob", new DateTime(1990, 1, 1)),
  Builders<BsonDocument>.Filter.Lte("dob", new DateTime(1990, 12, 31)),
  Builders<BsonDocument>.Filter.Eq("address.state", "UT"),
  Builders<BsonDocument>.Filter.ElemMatch("policies", Builders<BsonDocument>.Filter.And(
    Builders<BsonDocument>.Filter.Eq("policyType", "life"),
    Builders<BsonDocument>.Filter.Eq("insured_person.smoking", true)
  ))
);
var projection = Builders<BsonDocument>.Projection.Exclude("_id").Include("firstName").Include("lastName").Include("dob");
var results = db.GetCollection<BsonDocument>("customers").Find(filter).Project(projection).Sort(Builders<BsonDocument>.Sort.Ascending("dob")).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        skeleton: `// Projection and sort: same as mongosh
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var filter = Builders<BsonDocument>.Filter.And(
  Builders<BsonDocument>.Filter.Eq("gender", "Female"),
  Builders<BsonDocument>.Filter.Gte("dob", new DateTime(1990, 1, 1)),
  Builders<BsonDocument>.Filter.Lte("dob", new DateTime(1990, 12, 31)),
  Builders<BsonDocument>.Filter.Eq("address.state", "UT"),
  Builders<BsonDocument>.Filter.ElemMatch("policies", Builders<BsonDocument>.Filter.And(
    Builders<BsonDocument>.Filter.Eq("policyType", "life"),
    Builders<BsonDocument>.Filter.Eq("insured_person.smoking", true)
  ))
);
var projection = Builders<BsonDocument>.Projection.Exclude("_id")
  .Include("_________")
  .Include("_________")
  .Include("dob");
var results = db.GetCollection<BsonDocument>("customers").Find(filter).Project(projection).Sort(Builders<BsonDocument>.Sort._________("dob")).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        inlineHints: [
          { line: 20, blankText: '_________', hint: 'Include the given name field in the projection.', answer: 'firstName' },
          { line: 21, blankText: '_________', hint: 'Include the family name field in the projection.', answer: 'lastName' },
          { line: 23, blankText: '_________', hint: 'Sort ascending by the given field (use Descending for descending order).', answer: 'Ascending' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query. Use mongosh, node, or C# tab.',
      'Show how projections reduce network payload compared to returning full documents.',
      'Sorting on an indexed field will later benefit from the compound index you create.',
    ],
  },

  'rich-query.pagination': {
    id: 'rich-query.pagination',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'pagination.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const pageSize = 20;
  const page = 2; // zero-based page index
  const results = await db.collection("customers")
    .find({ 'address.state': 'UT' })
    .sort({ lastName: 1, firstName: 1 })
    .skip(page * pageSize)
    .limit(pageSize)
    .toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const pageSize = 20;
  const page = ______; // zero-based page index
  const results = await db.collection("customers")
    .find({ 'address.state': 'UT' })
    .sort({ lastName: 1, firstName: 1 })
    .skip(page * pageSize)
    .limit(pageSize)
    .toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          {
            line: 9,
            blankText: '______',
            hint: 'Remember that the first page is page 0 in zero-based indexing.',
            answer: '2',
          },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Simple offset-based pagination using limit() and skip().
// In production, prefer range-based pagination for large collections.

const pageSize = 20;
const page = 2; // zero-based page index

const results = db.customers
  .find({ 'address.state': 'UT' })
  .sort({ lastName: 1, firstName: 1 })
  .skip(page * pageSize)
  .limit(pageSize)
  .toArray();
printjson(results);
print("Query completed.");`,
        skeleton: `// Simple offset-based pagination using limit() and skip().
// In production, prefer range-based pagination for large collections.

const pageSize = 20;
const page = ______; // zero-based page index

const results = db.customers
  .find({ 'address.state': 'UT' })
  .sort({ lastName: 1, firstName: 1 })
  .skip(page * pageSize)
  .limit(pageSize)
  .toArray();
printjson(results);
print("Query completed.");`,
        inlineHints: [
          { line: 5, blankText: '______', hint: 'Remember that the first page is page 0 in zero-based indexing.', answer: '2' },
        ],
      },
      {
        filename: 'pagination.cs',
        language: 'csharp',
        code: `// Pagination: same as mongosh — find, sort, skip, limit
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var pageSize = 20;
var page = 2;
var results = db.GetCollection<BsonDocument>("customers")
  .Find(Builders<BsonDocument>.Filter.Eq("address.state", "UT"))
  .Sort(Builders<BsonDocument>.Sort.Ascending("lastName").Ascending("firstName"))
  .Skip(page * pageSize)
  .Limit(pageSize)
  .ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Query completed.");`,
        skeleton: `// Pagination: same as mongosh
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var pageSize = 20;
var page = ______;
var results = db.GetCollection<BsonDocument>("customers")
  .Find(Builders<BsonDocument>.Filter.Eq("address.state", "UT"))
  .Sort(Builders<BsonDocument>.Sort.Ascending("lastName").Ascending("firstName"))
  .______(page * pageSize)
  .______(pageSize)
  .ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        inlineHints: [
          { line: 10, blankText: '______', hint: 'Zero-based page index (e.g. 2 for third page).', answer: '2' },
          { line: 14, blankText: '______', hint: 'Cursor method to skip the first n documents.', answer: 'Skip' },
          { line: 15, blankText: '______', hint: 'Cursor method to cap the number of documents returned.', answer: 'Limit' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query. Use mongosh, node, or C# tab.',
      'Discuss trade-offs of skip/limit vs range-based pagination.',
      'Explain that skip gets slower on very high offsets, motivating alternative patterns.',
    ],
  },

  'rich-query.index-explain': {
    id: 'rich-query.index-explain',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - TEST 1',
    codeBlocks: [
      {
        filename: 'index-and-explain.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  await db.collection("customers").createIndex({
    'address.state': 1,
    'policies.policyType': 1,
    'policies.insured_person.smoking': 1,
    gender: 1,
    dob: 1
  });
  console.log("Index created.");
  const explain = await db.collection("customers")
    .find({
      gender: 'Female',
      dob: { $gte: new Date('1990-01-01'), $lte: new Date('1990-12-31') },
      'address.state': 'UT',
      policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
    })
    .explain('executionStats');
  console.log(JSON.stringify(explain, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  await db.collection("customers").createIndex({
    'address.state': 1,
    'policies.policyType': 1,
    'policies.insured_person.smoking': 1,
    gender: 1,
    dob: 1
  });
  console.log("Index created.");
  const explain = await db.collection("customers")
    .find({
      gender: 'Female',
      dob: { $gte: new Date('1990-01-01'), $lte: new Date('1990-12-31') },
      'address.state': 'UT',
      policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
    })
    .explain('_________');
  console.log(JSON.stringify(explain, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 23, blankText: '_________', hint: 'Explain mode that returns execution stats (e.g. IXSCAN vs COLLSCAN).', answer: 'executionStats' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Create compound index then run explain() in one script (equality fields first, range last).
db = db.getSiblingDB('rich_query');
db.customers.createIndex({
  'address.state': 1,
  'policies.policyType': 1,
  'policies.insured_person.smoking': 1,
  gender: 1,
  dob: 1
});
print("Index created.");
const explainResult = db.customers.find({
  gender: 'Female',
  dob: { $gte: ISODate('1990-01-01'), $lte: ISODate('1990-12-31') },
  'address.state': 'UT',
  policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
}).explain('executionStats');
printjson(explainResult);
print("Explain completed.");`,
        skeleton: `db = db.getSiblingDB('rich_query');
db.customers.createIndex({
  'address.state': 1,
  'policies.policyType': 1,
  'policies.insured_person.smoking': 1,
  gender: 1,
  dob: 1
});
print("Index created.");
const explainResult = db.customers.find({
  gender: 'Female',
  dob: { $gte: ISODate('1990-01-01'), $lte: ISODate('1990-12-31') },
  'address.state': 'UT',
  policies: { $elemMatch: { policyType: 'life', 'insured_person.smoking': true } }
}).explain('_________');
printjson(explainResult);
print("Explain completed.");`,
        inlineHints: [
          { line: 15, blankText: '_________', hint: 'Explain mode that returns execution stats (e.g. IXSCAN vs COLLSCAN).', answer: 'executionStats' },
        ],
      },
      {
        filename: 'index-and-explain.cs',
        language: 'csharp',
        code: `// Create compound index then run explain via RunCommand (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var indexKeys = Builders<BsonDocument>.IndexKeys
  .Ascending("address.state")
  .Ascending("policies.policyType")
  .Ascending("policies.insured_person.smoking")
  .Ascending("gender")
  .Ascending("dob");
coll.Indexes.CreateOne(new CreateIndexModel<BsonDocument>(indexKeys));
Console.WriteLine("Index created.");
var filterDoc = new BsonDocument {
  { "gender", "Female" },
  { "dob", new BsonDocument { { "$gte", new BsonDateTime(new DateTime(1990, 1, 1)) }, { "$lte", new BsonDateTime(new DateTime(1990, 12, 31)) } } },
  { "address.state", "UT" },
  { "policies", new BsonDocument { { "$elemMatch", new BsonDocument { { "policyType", "life" }, { "insured_person.smoking", true } } } } }
};
var explainCmd = new BsonDocument {
  { "explain", new BsonDocument { { "find", "customers" }, { "filter", filterDoc } } },
  { "verbosity", "executionStats" }
};
var explain = db.RunCommand<BsonDocument>(explainCmd);
Console.WriteLine(explain.ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Explain completed.");`,
        skeleton: `// Create compound index then run explain via RunCommand (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var indexKeys = Builders<BsonDocument>.IndexKeys
  .Ascending("address.state")
  .Ascending("policies.policyType")
  .Ascending("policies.insured_person.smoking")
  .Ascending("gender")
  .Ascending("dob");
coll.Indexes.CreateOne(new CreateIndexModel<BsonDocument>(indexKeys));
Console.WriteLine("Index created.");
var filterDoc = new BsonDocument {
  { "gender", "Female" },
  { "dob", new BsonDocument { { "$gte", new BsonDateTime(new DateTime(1990, 1, 1)) }, { "$lte", new BsonDateTime(new DateTime(1990, 12, 31)) } } },
  { "address.state", "UT" },
  { "policies", new BsonDocument { { "$elemMatch", new BsonDocument { { "policyType", "life" }, { "insured_person.smoking", true } } } } }
};
var explainCmd = new BsonDocument {
  { "explain", new BsonDocument { { "find", "customers" }, { "filter", filterDoc } } },
  { "verbosity", "_________" }
};
var explain = db.RunCommand<BsonDocument>(explainCmd);
Console.WriteLine(explain.ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Explain completed.");`,
        inlineHints: [
          { line: 26, blankText: '_________', hint: 'Explain verbosity that returns execution stats (e.g. IXSCAN vs COLLSCAN).', answer: 'executionStats' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the full script (index creation then explain).',
      'Highlight the difference in docsExamined and executionTimeMillis before/after the index.',
      'Use screenshots from Compass Explain Plan to reinforce the IXSCAN vs COLLSCAN change.',
    ],
  },

  'rich-query.basic-aggregation': {
    id: 'rich-query.basic-aggregation',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'basic-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const coll = db.collection("customers");
  // Data initialized in Rich Query Basics Step 1 (compound-query)
  const results = await coll.aggregate([
    { $match: { 'address.state': 'UT', status: 'active' } },
    { $group: { _id: '$address.state', totalCustomers: { $sum: 1 }, totalValue: { $sum: '$accountBalance' } } },
    { $sort: { totalValue: -1 } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const coll = db.collection("customers");
  const results = await coll.aggregate([
    { $match: { 'address.state': 'UT', status: '_________' } },
    {
      $group: {
        _id: '$address.state',
        totalCustomers: { $sum: _________ },
        totalValue: { $sum: '$_________' }
      }
    },
    { $sort: { totalValue: _________ } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '_________', hint: 'Filter for customers with active status.', answer: 'active' },
          { line: 14, blankText: '_________', hint: 'Use 1 to count each document in the group.', answer: '1' },
          { line: 15, blankText: '$_________', hint: 'Sum the account balance field for each customer.', answer: 'accountBalance' },
          { line: 18, blankText: '_________', hint: 'Sort in descending order (highest value first).', answer: '-1' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Data initialized in Rich Query Basics Step 1 (compound-query)
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { 'address.state': 'UT', status: 'active' } },
  { $group: { _id: '$address.state', totalCustomers: { $sum: 1 }, totalValue: { $sum: '$accountBalance' } } },
  { $sort: { totalValue: -1 } }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        skeleton: `db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { 'address.state': 'UT', status: '_________' } },
  {
    $group: {
      _id: '$address.state',
      totalCustomers: { $sum: _________ },
      totalValue: { $sum: '$_________' }
    }
  },
  { $sort: { totalValue: _________ } }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        inlineHints: [
          { line: 3, blankText: '_________', hint: 'Filter for customers with active status.', answer: 'active' },
          { line: 7, blankText: '_________', hint: 'Use 1 to count each document in the group.', answer: '1' },
          { line: 8, blankText: '$_________', hint: 'Sum the account balance field for each customer.', answer: 'accountBalance' },
          { line: 11, blankText: '_________', hint: 'Sort in descending order (highest value first).', answer: '-1' },
        ],
      },
      {
        filename: 'basic-aggregation.cs',
        language: 'csharp',
        code: `// Step 1: $match + $group + $sort (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument { { "address.state", "UT" }, { "status", "active" } }),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "totalCustomers", new BsonDocument("$sum", 1) },
    { "totalValue", new BsonDocument("$sum", "$accountBalance") }
  }),
  new BsonDocument("$sort", new BsonDocument("totalValue", -1))
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Aggregation completed.");`,
        skeleton: `// Step 1: $match + $group + $sort (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument { { "address.state", "UT" }, { "status", "_________" } }),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "totalCustomers", new BsonDocument("$sum", _________) },
    { "totalValue", new BsonDocument("$sum", "$_________") }
  }),
  new BsonDocument("$sort", new BsonDocument("totalValue", _________))
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Aggregation completed.");`,
        inlineHints: [
          { line: 13, blankText: '_________', hint: 'Filter for customers with active status.', answer: 'active' },
          { line: 17, blankText: '_________', hint: 'Use 1 to count each document in the group.', answer: '1' },
          { line: 18, blankText: '$_________', hint: 'Sum the account balance field for each customer.', answer: 'accountBalance' },
          { line: 20, blankText: '_________', hint: 'Sort in descending order (highest value first).', answer: '-1' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'The customers collection is initialized in Rich Query Basics Step 1; run that step first if you have no data.',
      'The $match stage filters documents before grouping, improving performance.',
      'Use $group to compute aggregations like counts, sums, and averages.',
      'Add $sort to order results by aggregated values.',
    ],
  },

  'rich-query.projection-aggregation': {
    id: 'rich-query.projection-aggregation',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'projection-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$address.state', count: { $sum: 1 }, avgBalance: { $avg: '$accountBalance' } } },
    { $project: { _id: 0, state: '$_id', customerCount: '$count', averageBalance: { $round: ['$avgBalance', 2] }, status: 'active' } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$address.state', count: { $sum: 1 }, avgBalance: { $avg: '$_________' } } },
    {
      $project: {
        _id: 0,
        state: '$_id',
        customerCount: '$count',
        averageBalance: { $round: ['$_________', 2] },
        status: '_________'
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Calculate the average of the account balance field.', answer: 'accountBalance' },
          { line: 16, blankText: '$_________', hint: 'Round the average balance value (reference the $group output field with $).', answer: '$avgBalance' },
          { line: 17, blankText: '_________', hint: 'Add a static status field with the value "active".', answer: 'active' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Use same database as Step 1 (customers collection created there)
db = db.getSiblingDB('rich_query');
// Use $project to rename and compute derived fields
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$address.state', count: { $sum: 1 }, avgBalance: { $avg: '$accountBalance' } } },
  { $project: { _id: 0, state: '$_id', customerCount: '$count', averageBalance: { $round: ['$avgBalance', 2] }, status: 'active' } }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        skeleton: `// Use same database as Step 1 (run Step 1 first to create customers)
db = db.getSiblingDB('rich_query');
// Use $project to rename and compute derived fields
const results = db.customers.aggregate([
  { $match: { status: '_________' } },
  { $group: { _id: '$address.state', count: { $sum: 1 }, avgBalance: { $avg: '$_________' } } },
  {
    $project: {
      _id: 0,
      state: '$_id',
      customerCount: '$count',
      averageBalance: { $round: ['$_________', 2] },
      status: '_________'
    }
  }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Filter for customers with active status.', answer: 'active' },
          { line: 6, blankText: '$_________', hint: 'Calculate the average of the account balance field.', answer: 'accountBalance' },
          { line: 12, blankText: '$_________', hint: 'Round the average balance value (reference the $group output field with $).', answer: '$avgBalance' },
          { line: 13, blankText: '_________', hint: 'Add a static status field with the value "active".', answer: 'active' },
        ],
      },
      {
        filename: 'projection-aggregation.cs',
        language: 'csharp',
        code: `// Step 2: $match + $group + $project (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "count", new BsonDocument("$sum", 1) },
    { "avgBalance", new BsonDocument("$avg", "$accountBalance") }
  }),
  new BsonDocument("$project", new BsonDocument
  {
    { "_id", 0 },
    { "state", "$_id" },
    { "customerCount", "$count" },
    { "averageBalance", new BsonDocument("$round", new BsonArray { "$avgBalance", 2 }) },
    { "status", "active" }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Aggregation completed.");`,
        skeleton: `// Step 2: $match + $group + $project (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "count", new BsonDocument("$sum", 1) },
    { "avgBalance", new BsonDocument("$avg", "$_________") }
  }),
  new BsonDocument("$project", new BsonDocument
  {
    { "_id", 0 },
    { "state", "$_id" },
    { "customerCount", "$count" },
    { "averageBalance", new BsonDocument("$round", new BsonArray { "$_________", 2 }) },
    { "status", "_________" }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Aggregation completed.");`,
        inlineHints: [
          { line: 18, blankText: '$_________', hint: 'Calculate the average of the account balance field.', answer: 'accountBalance' },
          { line: 25, blankText: '$_________', hint: 'Round the average balance value (reference the $group output field with $).', answer: 'avgBalance' },
          { line: 26, blankText: '_________', hint: 'Add a static status field with the value "active".', answer: 'active' },
        ],
      },
    ],
    tips: [
      'Run Step 1 first so the customers collection exists; then run this step.',
      'Use $project to reshape output documents for your application.',
      'Computed fields can use expressions like $round, $cond, and $divide.',
      'Hide internal fields by setting _id: 0 or excluding fields.',
    ],
  },

  'rich-query.facets': {
    id: 'rich-query.facets',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'facet-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    {
      $facet: {
        byRegion: [
          { $group: { _id: '$address.state', count: { $sum: 1 }, totalValue: { $sum: '$accountBalance' } } },
          { $sort: { count: -1 } }
        ],
        byProduct: [
          { $unwind: { path: '$policies' } },
          { $group: { _id: '$policies.policyType', count: { $sum: 1 }, avgPremium: { $avg: '$policies.premium' } } },
          { $sort: { count: -1 } }
        ]
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    {
      $facet: {
        byRegion: [
          { $group: { _id: '$address.state', count: { $sum: 1 }, totalValue: { $sum: '$_________' } } },
          { $sort: { count: _________ } }
        ],
        byProduct: [
          { $unwind: { path: '$_________' } },
          { $group: { _id: '$policies.policyType', count: { $sum: 1 }, avgPremium: { $avg: '$policies._________' } } },
          { $sort: { count: -1 } }
        ]
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 14, blankText: '$_________', hint: 'Sum the account balance field.', answer: 'accountBalance' },
          { line: 15, blankText: '_________', hint: 'Sort in descending order (highest count first).', answer: '-1' },
          { line: 18, blankText: '$_________', hint: 'Unwind the policies array to process each policy separately (use $ prefix for field path).', answer: '$policies' },
          { line: 19, blankText: '$policies._________', hint: 'Calculate the average premium for each policy type.', answer: 'premium' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Run multiple aggregations in a single pipeline using $facet
// Feed multiple dashboards from one query
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $facet: {
      byRegion: [
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 },
            totalValue: { $sum: '$accountBalance' }
          }
        },
        { $sort: { count: -1 } }
      ],
      byProduct: [
        {
          $unwind: { path: '$policies' }
        },
        {
          $group: {
            _id: '$policies.policyType',
            count: { $sum: 1 },
            avgPremium: { $avg: '$policies.premium' }
          }
        },
        { $sort: { count: -1 } }
      ]
    }
  }
]).toArray();
printjson(results);
print("Facet aggregation completed.");`,
        skeleton: `// Run multiple aggregations in a single pipeline using $facet
// Feed multiple dashboards from one query
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  {
    $match: { status: 'active' }
  },
  {
    $facet: {
      byRegion: [
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 },
            totalValue: { $sum: '$_________' }
          }
        },
        { $sort: { count: _________ } }
      ],
      byProduct: [
        {
          $unwind: { path: '$_________' }
        },
        {
          $group: {
            _id: '$policies.policyType',
            count: { $sum: 1 },
            avgPremium: { $avg: '$policies._________' }
          }
        },
        { $sort: { count: -1 } }
      ]
    }
  }
]).toArray();
printjson(results);
print("Facet aggregation completed.");`,
        inlineHints: [
          { line: 16, blankText: '$_________', hint: 'Sum the account balance field.', answer: 'accountBalance' },
          { line: 19, blankText: '_________', hint: 'Sort in descending order (highest count first).', answer: '-1' },
          { line: 23, blankText: '$_________', hint: 'Array field name to unwind (path is prefixed with $).', answer: '$policies' },
          { line: 29, blankText: '$policies._________', hint: 'Calculate the average premium for each policy type.', answer: 'premium' },
        ],
      },
      {
        filename: 'facet-aggregation.cs',
        language: 'csharp',
        code: `// Step 5: $facet — multiple aggregations in one pipeline (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$facet", new BsonDocument
  {
    { "byRegion", new BsonArray
      {
        new BsonDocument("$group", new BsonDocument { { "_id", "$address.state" }, { "count", new BsonDocument("$sum", 1) }, { "totalValue", new BsonDocument("$sum", "$accountBalance") } }),
        new BsonDocument("$sort", new BsonDocument("count", -1))
      }
    },
    { "byProduct", new BsonArray
      {
        new BsonDocument("$unwind", new BsonDocument("path", "$policies")),
        new BsonDocument("$group", new BsonDocument { { "_id", "$policies.policyType" }, { "count", new BsonDocument("$sum", 1) }, { "avgPremium", new BsonDocument("$avg", "$policies.premium") } }),
        new BsonDocument("$sort", new BsonDocument("count", -1))
      }
    }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Facet aggregation completed.");`,
        skeleton: `// Step 5: $facet — multiple aggregations in one pipeline (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$facet", new BsonDocument
  {
    { "byRegion", new BsonArray
      {
        new BsonDocument("$group", new BsonDocument { { "_id", "$address.state" }, { "count", new BsonDocument("$sum", 1) }, { "totalValue", new BsonDocument("$sum", "$_________") } }),
        new BsonDocument("$sort", new BsonDocument("count", _________))
      }
    },
    { "byProduct", new BsonArray
      {
        new BsonDocument("$unwind", new BsonDocument("path", "$_________")),
        new BsonDocument("$group", new BsonDocument { { "_id", "$policies.policyType" }, { "count", new BsonDocument("$sum", 1) }, { "avgPremium", new BsonDocument("$avg", "$policies._________") } }),
        new BsonDocument("$sort", new BsonDocument("count", -1))
      }
    }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Facet aggregation completed.");`,
        inlineHints: [
          { line: 18, blankText: '$_________', hint: 'Sum the account balance field.', answer: 'accountBalance' },
          { line: 19, blankText: '_________', hint: 'Sort in descending order (highest count first).', answer: '-1' },
          { line: 24, blankText: '$_________', hint: 'Array field name to unwind (path is prefixed with $).', answer: 'policies' },
          { line: 25, blankText: '$policies._________', hint: 'Calculate the average premium for each policy type.', answer: 'premium' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$facet allows you to run multiple independent aggregation pipelines in one pass.',
      'Each facet produces a separate output array in the result document.',
      'This is more efficient than running separate queries for each dashboard.',
    ],
  },

  'rich-query.unwind': {
    id: 'rich-query.unwind',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'unwind-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $unwind: { path: '$policies' } },
    { $group: { _id: '$policies.policyType', count: { $sum: 1 }, avgPremium: { $avg: '$policies.premium' } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: '_________' } },
    { $unwind: { path: '$_________' } },
    {
      $group: {
        _id: '$policies.policyType',
        count: { $sum: _________ },
        avgPremium: { $avg: '$policies._________' }
      }
    },
    { $sort: { count: _________ } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '_________', hint: 'Filter to active customers only.', answer: 'active' },
          { line: 11, blankText: '$_________', hint: 'Array field to deconstruct (path must be $-prefixed, e.g. $policies).', answer: '$policies' },
          { line: 14, blankText: '_________', hint: 'Use 1 to count each unwound document.', answer: '1' },
          { line: 15, blankText: '$policies._________', hint: 'Average this numeric field from each policy.', answer: 'premium' },
          { line: 17, blankText: '_________', hint: 'Sort descending so highest count is first.', answer: '-1' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// STEP 3: Unwind Arrays with $unwind
// Deconstruct the policies array and aggregate per policy type.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $unwind: { path: '$policies' } },
  {
    $group: {
      _id: '$policies.policyType',
      count: { $sum: 1 },
      avgPremium: { $avg: '$policies.premium' }
    }
  },
  { $sort: { count: -1 } }
]).toArray();
printjson(results);
print("Unwind aggregation completed.");`,
        skeleton: `// STEP 3: Unwind Arrays with $unwind
// TASK: Fill in the $match filter, $unwind path (field name; path is prefixed with $), and $group accumulators.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { status: '_________' } },
  { $unwind: { path: '$_________' } },
  {
    $group: {
      _id: '$policies.policyType',
      count: { $sum: _________ },
      avgPremium: { $avg: '$policies._________' }
    }
  },
  { $sort: { count: _________ } }
]).toArray();
printjson(results);
print("Unwind aggregation completed.");`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Filter to active customers only.', answer: 'active' },
          { line: 6, blankText: '$_________', hint: 'Array field name to unwind (path is prefixed with $).', answer: 'policies' },
          { line: 10, blankText: '_________', hint: 'Use 1 to count each unwound document.', answer: '1' },
          { line: 11, blankText: '$policies._________', hint: 'Average this numeric field from each policy.', answer: 'premium' },
          { line: 14, blankText: '_________', hint: 'Sort descending so highest count is first.', answer: '-1' },
        ],
      },
      {
        filename: 'unwind-aggregation.cs',
        language: 'csharp',
        code: `// Step 3: $unwind + $group (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$unwind", new BsonDocument("path", "$policies")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$policies.policyType" },
    { "count", new BsonDocument("$sum", 1) },
    { "avgPremium", new BsonDocument("$avg", "$policies.premium") }
  }),
  new BsonDocument("$sort", new BsonDocument("count", -1))
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Unwind aggregation completed.");`,
        skeleton: `// Step 3: $unwind + $group (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "_________")),
  new BsonDocument("$unwind", new BsonDocument("path", "$_________")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$policies.policyType" },
    { "count", new BsonDocument("$sum", _________) },
    { "avgPremium", new BsonDocument("$avg", "$policies._________") }
  }),
  new BsonDocument("$sort", new BsonDocument("count", _________))
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Unwind aggregation completed.");`,
        inlineHints: [
          { line: 13, blankText: '_________', hint: 'Filter to active customers only.', answer: 'active' },
          { line: 14, blankText: '$_________', hint: 'Array field name to unwind (path is prefixed with $).', answer: 'policies' },
          { line: 18, blankText: '_________', hint: 'Use 1 to count each unwound document.', answer: '1' },
          { line: 19, blankText: '_________', hint: 'Average this numeric field from each policy (e.g. premium).', answer: 'premium' },
          { line: 21, blankText: '_________', hint: 'Sort descending so highest count is first.', answer: '-1' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$unwind path must be a field path (e.g. $policies); the object form { path: "$policies" } ensures the $ prefix is correct.',
      'Group by the unwound field path (e.g. $policies.policyType) for per-item analytics.',
    ],
  },

  'rich-query.top-n': {
    id: 'rich-query.top-n',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'top-n-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$address.state', totalCustomers: { $sum: 1 }, totalValue: { $sum: '$accountBalance' } } },
    { $sort: { totalValue: -1 } },
    { $limit: 5 }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$address.state', totalCustomers: { $sum: 1 }, totalValue: { $sum: '$_________' } } },
    { $sort: { totalValue: _________ } },
    { $limit: _________ }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Sum this field to get total value per state.', answer: 'accountBalance' },
          { line: 11, blankText: '_________', hint: 'Use -1 for descending (highest total first).', answer: '-1' },
          { line: 12, blankText: '_________', hint: 'Return only the top 5 groups.', answer: '5' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// STEP 4: Top N with $sort and $limit
// Return only the top 5 states by total account value.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  {
    $group: {
      _id: '$address.state',
      totalCustomers: { $sum: 1 },
      totalValue: { $sum: '$accountBalance' }
    }
  },
  { $sort: { totalValue: -1 } },
  { $limit: 5 }
]).toArray();
printjson(results);
print("Top N aggregation completed.");`,
        skeleton: `// STEP 4: Top N with $sort and $limit
// TASK: Add $sort and $limit to return the top 5 states.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  {
    $group: {
      _id: '$address.state',
      totalCustomers: { $sum: 1 },
      totalValue: { $sum: '$_________' }
    }
  },
  { $sort: { totalValue: _________ } },
  { $limit: _________ }
]).toArray();
printjson(results);
print("Top N aggregation completed.");`,
        inlineHints: [
          { line: 10, blankText: '$_________', hint: 'Sum this field to get total value per state.', answer: 'accountBalance' },
          { line: 13, blankText: '_________', hint: 'Use -1 for descending (highest total first).', answer: '-1' },
          { line: 14, blankText: '_________', hint: 'Return only the top 5 groups.', answer: '5' },
        ],
      },
      {
        filename: 'top-n-aggregation.cs',
        language: 'csharp',
        code: `// Step 4: Top N with $sort + $limit (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "totalCustomers", new BsonDocument("$sum", 1) },
    { "totalValue", new BsonDocument("$sum", "$accountBalance") }
  }),
  new BsonDocument("$sort", new BsonDocument("totalValue", -1)),
  new BsonDocument("$limit", 5)
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Top N aggregation completed.");`,
        skeleton: `// Step 4: Top N with $sort + $limit (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "totalCustomers", new BsonDocument("$sum", 1) },
    { "totalValue", new BsonDocument("$sum", "$_________") }
  }),
  new BsonDocument("$sort", new BsonDocument("totalValue", _________)),
  new BsonDocument("$limit", _________)
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Top N aggregation completed.");`,
        inlineHints: [
          { line: 18, blankText: '$_________', hint: 'Sum this field to get total value per state.', answer: 'accountBalance' },
          { line: 20, blankText: '_________', hint: 'Use -1 for descending (highest total first).', answer: '-1' },
          { line: 21, blankText: '_________', hint: 'Return only the top 5 groups.', answer: '5' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$sort must come before $limit so the server orders first, then truncates.',
      'Top N is a common dashboard pattern; avoid fetching more data than you need.',
    ],
  },

  'rich-query.count': {
    id: 'rich-query.count',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'count-aggregation.cjs',
        language: 'javascript',
        code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active', 'address.state': 'UT' } },
    { $count: 'totalActive' }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: {
      status: '_________',
      'address.state': '_________'
    } },
    { $count: '_________' }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 10, blankText: '_________', hint: 'Filter by this status value.', answer: 'active' },
          { line: 11, blankText: '_________', hint: 'Filter by state (e.g. UT).', answer: 'UT' },
          { line: 13, blankText: '_________', hint: 'Output field name for the count (e.g. totalActive).', answer: 'totalActive' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// STEP 6: Document count with $count
// Count documents that match the filter.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: {
    status: '_________',
    'address.state': '_________'
  } },
  { $count: '_________' }
]).toArray();
printjson(results);
print("Count aggregation completed.");`,
        skeleton: `// STEP 6: Document count with $count
// TASK: Add $match filter and $count output field name.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: {
    status: '_________',
    'address.state': '_________'
  } },
  { $count: '_________' }
]).toArray();
printjson(results);
print("Count aggregation completed.");`,
        skeleton: `// STEP 6: Document count with $count
// TASK: Add $match filter and $count output field name.
db = db.getSiblingDB('rich_query');
const results = db.customers.aggregate([
  { $match: {
    status: '_________',
    'address.state': '_________'
  } },
  { $count: '_________' }
]).toArray();
printjson(results);
print("Count aggregation completed.");`,
        inlineHints: [
          { line: 7, blankText: '_________', hint: 'Filter by this status value.', answer: 'active' },
          { line: 8, blankText: '_________', hint: 'Filter by state (e.g. UT).', answer: 'UT' },
          { line: 10, blankText: '_________', hint: 'Output field name for the count (e.g. totalActive).', answer: 'totalActive' },
        ],
      },
      {
        filename: 'count-aggregation.cs',
        language: 'csharp',
        code: `// Step 6: $match + $count (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument { { "status", "active" }, { "address.state", "UT" } }),
  new BsonDocument("$count", "totalActive")
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Count aggregation completed.");`,
        skeleton: `// Step 6: $match + $count (same logic as mongosh).
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument
  {
    { "status", "_________" },
    { "address.state", "_________" }
  }),
  new BsonDocument("$count", "_________")
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Count aggregation completed.");`,
        inlineHints: [
          { line: 15, blankText: '_________', hint: 'Filter by this status value.', answer: 'active' },
          { line: 16, blankText: '_________', hint: 'Filter by state (e.g. UT).', answer: 'UT' },
          { line: 18, blankText: '_________', hint: 'Output field name for the count (e.g. totalActive).', answer: 'totalActive' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      '$count returns a single document with one field: the name you provide and the count value.',
      'Place $count after any filtering or grouping; it counts documents at that pipeline position.',
    ],
  },

  'rich-query.encrypted-vs-plain-setup': {
    id: 'rich-query.encrypted-vs-plain-setup',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Baseline Query (Plain Collection)',
        language: 'javascript',
        code: `// Confirm plain and encrypted collections exist
// encryption.patients (CSFLE), encryption.employees (QE), plain reference

// Baseline query against plain collection
db.customers.find(
  { 'address.state': 'CA', status: 'active' },
  { name: 1, email: 1, 'address.city': 1 }
).sort({ name: 1 });`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'Reuse collections from CSFLE and QE labs.',
      'Plain collection for baseline comparison.',
      'Review indexes before querying encrypted fields.',
    ],
  },

  'rich-query.encrypted-vs-plain-queries': {
    id: 'rich-query.encrypted-vs-plain-queries',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Queries on Encrypted Fields',
        language: 'javascript',
        code: `// CSFLE (Deterministic): equality only
db.patients.find({ ssn: encryptedValue });

// QE: equality and range (if indexed)
db.employees.find({ 'encryptedField': { $gte: value } });

// Compare: which patterns work with CSFLE vs QE
// CSFLE: deterministic = equality; random = no queries
// QE: equality + range when indexed`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'CSFLE deterministic: equality queries only.',
      'QE supports equality and range when properly indexed.',
      'Document limitations for customer playbook.',
    ],
  },

  'rich-query.encrypted-vs-plain-design': {
    id: 'rich-query.encrypted-vs-plain-design',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Encrypted vs Plain',
    codeBlocks: [
      {
        filename: 'Customer-Safe Query Pattern',
        language: 'javascript',
        code: `// Design: PII encrypted, non-PII plain for queries
// Encrypted: ssn, dob, name (PII)
// Plain: region, status, productType (queryable)

// Example: query by region (plain) + return encrypted fields
db.customers.find(
  { region: 'West', status: 'active' },
  { name: 1, ssn: 1 }
);
// Application decrypts ssn client-side`,
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the query.',
      'Keep PII encrypted; leave queryable fields plain.',
      'Document trade-offs: security vs query flexibility.',
      'One working end-to-end query demonstrates pattern.',
    ],
  },

  'rich-query.bucket': {
    id: 'rich-query.bucket',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'bucket-histogram.cjs',
        language: 'javascript',
        code: `// STEP: Build a histogram with $bucket
// ═══════════════════════════════════════
// $bucket groups documents into range buckets. Use groupBy and boundaries.
// TASK: Complete the boundaries and output accumulator (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    {
      $bucket: {
        groupBy: '$accountBalance',
        boundaries: [0, 1000, 5000, 10000, 50000],
        default: 'other',
        output: {
          count: { $sum: 1 },
          minBalance: { $min: '$accountBalance' },
          maxBalance: { $max: '$accountBalance' }
        }
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP: Build a histogram with $bucket
// ═══════════════════════════════════════
// $bucket groups documents into range buckets. Use groupBy and boundaries.
// TASK: Complete the boundaries and output accumulator (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: '_________' } },
    {
      $bucket: {
        groupBy: '$_________',
        boundaries: [0, 1000, 5000, 10000, 50000],
        default: 'other',
        output: {
          count: { $sum: _________ },
          minBalance: { $min: '$accountBalance' },
          maxBalance: { $max: '$accountBalance' }
        }
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 14, blankText: '_________', hint: 'Filter for active customers only.', answer: 'active' },
          { line: 17, blankText: '$_________', hint: 'Group by the numeric account balance field (must be $-prefixed path).', answer: '$accountBalance' },
          { line: 21, blankText: '_________', hint: 'Use 1 to count each document in the bucket.', answer: '1' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Build a histogram with $bucket
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  {
    $bucket: {
      groupBy: '$accountBalance',
      boundaries: [0, 1000, 5000, 10000, 50000],
      default: 'other',
      output: {
        count: { $sum: 1 },
        minBalance: { $min: '$accountBalance' },
        maxBalance: { $max: '$accountBalance' }
      }
    }
  }
]).toArray();
printjson(results);
print("Bucket aggregation completed.");`,
        skeleton: `// Build a histogram with $bucket
const results = db.customers.aggregate([
  { $match: { status: '_________' } },
  {
    $bucket: {
      groupBy: '$_________',
      boundaries: [0, 1000, 5000, 10000, 50000],
      default: 'other',
      output: {
        count: { $sum: _________ },
        minBalance: { $min: '$accountBalance' },
        maxBalance: { $max: '$accountBalance' }
      }
    }
  }
]).toArray();
printjson(results);
print("Bucket aggregation completed.");`,
        inlineHints: [
          { line: 3, blankText: '_________', hint: 'Filter for active customers only.', answer: 'active' },
          { line: 6, blankText: '$_________', hint: 'Group by the numeric account balance field (must be $-prefixed path).', answer: '$accountBalance' },
          { line: 10, blankText: '_________', hint: 'Use 1 to count each document in the bucket.', answer: '1' },
        ],
      },
      {
        filename: 'bucket-histogram.cs',
        language: 'csharp',
        code: `// Build a histogram with $bucket (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$bucket", new BsonDocument
  {
    { "groupBy", "$accountBalance" },
    { "boundaries", new BsonArray { 0, 1000, 5000, 10000, 50000 } },
    { "default", "other" },
    { "output", new BsonDocument
      {
        { "count", new BsonDocument("$sum", 1) },
        { "minBalance", new BsonDocument("$min", "$accountBalance") },
        { "maxBalance", new BsonDocument("$max", "$accountBalance") }
      }
    }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Bucket aggregation completed.");`,
        skeleton: `// Build a histogram with $bucket (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "_________")),
  new BsonDocument("$bucket", new BsonDocument
  {
    { "groupBy", "$_________" },
    { "boundaries", new BsonArray { 0, 1000, 5000, 10000, 50000 } },
    { "default", "other" },
    { "output", new BsonDocument
      {
        { "count", new BsonDocument("$sum", _________) },
        { "minBalance", new BsonDocument("$min", "$accountBalance") },
        { "maxBalance", new BsonDocument("$max", "$accountBalance") }
      }
    }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        inlineHints: [
          { line: 12, blankText: '_________', hint: 'Filter for active customers only.', answer: 'active' },
          { line: 15, blankText: '$_________', hint: 'Group by the numeric account balance field (must be $-prefixed path).', answer: 'accountBalance' },
          { line: 20, blankText: '_________', hint: 'Use 1 to count each document in the bucket.', answer: '1' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the pipeline.',
      'boundaries define bucket edges; documents are grouped into [boundaries[i], boundaries[i+1]).',
      'default is the bucket for values that do not fall into any boundary range.',
    ],
  },

  'rich-query.lookup': {
    id: 'rich-query.lookup',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'lookup-join.cjs',
        language: 'javascript',
        code: `// STEP: Join collections with $lookup
// ═══════════════════════════════════════
// $lookup performs a left outer join to another collection in the same database.
// TASK: Complete the localField, foreignField, and as (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'state_info',
        localField: 'address.state',
        foreignField: '_id',
        as: 'stateDetails'
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP: Join collections with $lookup
// ═══════════════════════════════════════
// $lookup performs a left outer join to another collection in the same database.
// TASK: Complete the localField, foreignField, and as (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const results = await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $limit: 5 },
    {
      $lookup: {
        from: '_________',
        localField: '_________.state',
        foreignField: '_id',
        as: '_________'
      }
    }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 18, blankText: '_________', hint: 'The collection to join from (e.g. state_info).', answer: 'state_info' },
          { line: 19, blankText: '_________.state', hint: 'The field on customers that holds the state code (nested under address).', answer: 'address' },
          { line: 21, blankText: '_________', hint: 'The output array field name for the joined documents.', answer: 'stateDetails' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Join customers with state_info using $lookup
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $limit: 5 },
  {
    $lookup: {
      from: 'state_info',
      localField: 'address.state',
      foreignField: '_id',
      as: 'stateDetails'
    }
  }
]).toArray();
printjson(results);
print("Lookup completed.");`,
        skeleton: `// Join customers with state_info using $lookup
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $limit: 5 },
  {
    $lookup: {
      from: '_________',
      localField: '_________.state',
      foreignField: '_id',
      as: '_________'
    }
  }
]).toArray();
printjson(results);
print("Lookup completed.");`,
        inlineHints: [
          { line: 6, blankText: '_________', hint: 'The collection to join from (e.g. state_info).', answer: 'state_info' },
          { line: 7, blankText: '_________.state', hint: 'The field on customers that holds the state code (nested under address).', answer: 'address' },
          { line: 9, blankText: '_________', hint: 'The output array field name for the joined documents.', answer: 'stateDetails' },
        ],
      },
      {
        filename: 'lookup-join.cs',
        language: 'csharp',
        code: `// Join customers with state_info using $lookup (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$limit", 5),
  new BsonDocument("$lookup", new BsonDocument
  {
    { "from", "state_info" },
    { "localField", "address.state" },
    { "foreignField", "_id" },
    { "as", "stateDetails" }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
Console.WriteLine("Lookup completed.");`,
        skeleton: `// Join customers with state_info using $lookup (same logic as mongosh).
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$limit", 5),
  new BsonDocument("$lookup", new BsonDocument
  {
    { "from", "_________" },
    { "localField", "_________.state" },
    { "foreignField", "_id" },
    { "as", "_________" }
  })
};
var results = coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine(new BsonArray(results).ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));`,
        inlineHints: [
          { line: 16, blankText: '_________', hint: 'The collection to join from (e.g. state_info).', answer: 'state_info' },
          { line: 17, blankText: '_________.state', hint: 'The field on customers that holds the state code (nested under address).', answer: 'address' },
          { line: 19, blankText: '_________', hint: 'The output array field name for the joined documents.', answer: 'stateDetails' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the pipeline.',
      'state_info (or similar) must exist in the same database with _id matching address.state values.',
      'Joined documents appear as an array; use $unwind to flatten one-to-one joins.',
    ],
  },

  'rich-query.merge': {
    id: 'rich-query.merge',
    povCapability: 'RICH-QUERY',
    sourceProof: 'proofs/01/README.md',
    sourceSection: 'Execution - Aggregation',
    codeBlocks: [
      {
        filename: 'merge-output.cjs',
        language: 'javascript',
        code: `// STEP: Write pipeline results with $merge
// ═══════════════════════════════════════
// $merge must be the last stage. It writes results to a collection. Use YOUR_SUFFIX for multi-tenancy.
// TASK: Complete the output collection name and whenNotMatched (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  await db.collection("customers").aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$address.state', count: { $sum: 1 }, totalBalance: { $sum: '$accountBalance' } } },
    {
      $merge: {
        into: { db: 'rich_query', coll: 'summary_YOUR_SUFFIX' },
        whenNotMatched: 'insert'
      }
    }
  ]).toArray();
  console.log("Merge completed. Check the summary_YOUR_SUFFIX collection.");
  await client.close();
}
run().catch(console.dir);`,
        skeleton: `// STEP: Write pipeline results with $merge
// ═══════════════════════════════════════
// $merge must be the last stage. It writes results to a collection. Use YOUR_SUFFIX for multi-tenancy.
// TASK: Complete the output collection name and whenNotMatched (fill the blanks).

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  await db.collection("customers").aggregate([
    { $match: { status: '_________' } },
    { $group: { _id: '$address.state', count: { $sum: 1 }, totalBalance: { $sum: '$_________' } } },
    {
      $merge: {
        into: { db: 'rich_query', coll: 'summary_YOUR_SUFFIX' },
        whenNotMatched: '_________'
      }
    }
  ]).toArray();
  console.log("Merge completed. Check the summary_YOUR_SUFFIX collection.");
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 14, blankText: '_________', hint: 'Filter for active customers before grouping.', answer: 'active' },
          { line: 15, blankText: '$_________', hint: 'Sum this field per group (account balance).', answer: 'accountBalance' },
          { line: 19, blankText: '_________', hint: 'Use "insert" to add new documents that do not exist in the target.', answer: 'insert' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Write aggregation results to a collection with $merge
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$address.state', count: { $sum: 1 }, totalBalance: { $sum: '$accountBalance' } } },
  {
    $merge: {
      into: { db: 'rich_query', coll: 'summary_YOUR_SUFFIX' },
      whenNotMatched: 'insert'
    }
  }
]).toArray();
printjson(results);
print("Merge completed. Check the summary_YOUR_SUFFIX collection.");`,
        skeleton: `// Write aggregation results to a collection with $merge
const results = db.customers.aggregate([
  { $match: { status: '_________' } },
  { $group: { _id: '$address.state', count: { $sum: 1 }, totalBalance: { $sum: '$_________' } } },
  {
    $merge: {
      into: { db: 'rich_query', coll: 'summary_YOUR_SUFFIX' },
      whenNotMatched: '_________'
    }
  }
]).toArray();
printjson(results);
print("Merge completed. Check the summary_YOUR_SUFFIX collection.");`,
        inlineHints: [
          { line: 3, blankText: '_________', hint: 'Filter for active customers before grouping.', answer: 'active' },
          { line: 4, blankText: '$_________', hint: 'Sum this field per group (account balance).', answer: 'accountBalance' },
          { line: 8, blankText: '_________', hint: 'Use "insert" to add new documents that do not exist in the target.', answer: 'insert' },
        ],
      },
      {
        filename: 'merge-output.cs',
        language: 'csharp',
        code: `// Write pipeline results with $merge (same logic as mongosh). Use YOUR_SUFFIX for multi-tenancy.
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "active")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "count", new BsonDocument("$sum", 1) },
    { "totalBalance", new BsonDocument("$sum", "$accountBalance") }
  }),
  new BsonDocument("$merge", new BsonDocument
  {
    { "into", new BsonDocument { { "db", "rich_query" }, { "coll", "summary_YOUR_SUFFIX" } } },
    { "whenNotMatched", "insert" }
  })
};
coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine("Merge completed. Check the summary_YOUR_SUFFIX collection.");`,
        skeleton: `// Write pipeline results with $merge. Use YOUR_SUFFIX in the output collection name.
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
var pipeline = new List<BsonDocument>
{
  new BsonDocument("$match", new BsonDocument("status", "_________")),
  new BsonDocument("$group", new BsonDocument
  {
    { "_id", "$address.state" },
    { "count", new BsonDocument("$sum", 1) },
    { "totalBalance", new BsonDocument("$sum", "$_________") }
  }),
  new BsonDocument("$merge", new BsonDocument
  {
    { "into", new BsonDocument { { "db", "rich_query" }, { "coll", "summary_YOUR_SUFFIX" } } },
    { "whenNotMatched", "_________" }
  })
};
coll.Aggregate<BsonDocument>(pipeline).ToList();
Console.WriteLine("Merge completed. Check the summary_YOUR_SUFFIX collection.");`,
        inlineHints: [
          { line: 12, blankText: '_________', hint: 'Filter for active customers before grouping.', answer: 'active' },
          { line: 17, blankText: '$_________', hint: 'Sum this field per group (account balance).', answer: 'accountBalance' },
          { line: 22, blankText: '_________', hint: 'Use "insert" to add new documents that do not exist in the target.', answer: 'insert' },
        ],
      },
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the pipeline.',
      '$merge must be the last stage; no stage can follow it.',
      'Use YOUR_SUFFIX in the collection name so each participant has their own output collection.',
    ],
  },
};
