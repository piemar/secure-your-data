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

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("rich_query");
  const coll = db.collection("customers");
  // Initialize data where it first appears (this step); drop then insert to ensure correct state
  await coll.drop().catch(() => {});
  await coll.insertMany([
    { status: 'active', gender: 'Female', dob: new Date('1990-06-15'), address: { state: 'UT' }, accountBalance: 1500.50, policies: [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }] },
    { status: 'active', gender: 'Female', dob: new Date('1990-03-20'), address: { state: 'UT' }, accountBalance: 2200.75, policies: [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }] },
    { status: 'active', gender: 'Male', dob: new Date('1985-01-10'), address: { state: 'CA' }, accountBalance: 800.25, policies: [{ policyType: 'auto', premium: 180 }] },
  ]);
  console.log("Dropped and recreated sample customers for Rich Query labs.");
  const results = await coll.find({
    gender: 'Female',
    dob: {
      $gte: new Date('1990-01-01'),
      $lte: new Date('1990-12-31')
    },
    'address.state': 'UT',
    policies: {
      $elemMatch: {
        policyType: 'life',
        'insured_person.smoking': true
      }
    }
  }).toArray();
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
  await coll.drop().catch(() => {});
  await coll.insertMany([
    { status: 'active', gender: 'Female', dob: new Date('1990-06-15'), address: { state: 'UT' }, accountBalance: 1500.50, policies: [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }] },
    { status: 'active', gender: 'Female', dob: new Date('1990-03-20'), address: { state: 'UT' }, accountBalance: 2200.75, policies: [{ policyType: 'life', premium: 150 }] },
    { status: 'active', gender: 'Male', dob: new Date('1985-01-10'), address: { state: 'CA' }, accountBalance: 800.25, policies: [{ policyType: 'auto', premium: 180 }] },
  ]);
  console.log("Dropped and recreated sample customers for Rich Query labs.");
  const results = await coll.find({
    gender: '_________',
    dob: {
      $gte: new Date('1990-01-01'),
      $lte: new Date('__________')
    },
    'address.state': 'UT',
    policies: {
      $elemMatch: {
        policyType: 'life',
        'insured_person.________': true
      }
    }
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
          {
            line: 17,
            blankText: '_________',
            hint: "Filter by the customer's gender using a string literal.",
            answer: 'Female',
          },
          {
            line: 20,
            blankText: '__________',
            hint: 'Use the last day of 1990 as the upper bound for the date of birth.',
            answer: '1990-12-31',
          },
          {
            line: 26,
            blankText: '________',
            hint: 'This nested field indicates whether the insured person is a smoker.',
            answer: 'smoking',
          },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Data for rich_query.customers is initialized in Rich Query Basics Step 1 (compound-query); drop then insert to ensure correct state
use rich_query;
db.customers.drop();
db.customers.insertMany([
  { status: 'active', gender: 'Female', dob: ISODate('1990-06-15'), address: { state: 'UT' }, accountBalance: 1500.50, policies: [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }, { policyType: 'auto', premium: 200 }] },
  { status: 'active', gender: 'Female', dob: ISODate('1990-03-20'), address: { state: 'UT' }, accountBalance: 2200.75, policies: [{ policyType: 'life', premium: 150, insured_person: { smoking: false } }] },
  { status: 'active', gender: 'Male', dob: ISODate('1985-01-10'), address: { state: 'CA' }, accountBalance: 800.25, policies: [{ policyType: 'auto', premium: 180 }] },
]);
print("Dropped and recreated sample customers for Rich Query labs.");
// Find customers who are:
// - Female
// - Born in 1990
// - Living in Utah
// - Have at least one life insurance policy where the insured person is a smoker
const results = db.customers.find({
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
}).toArray();
printjson(results);
print("Query completed.");`,
        skeleton: `use rich_query;
db.customers.drop();
db.customers.insertMany([
  { status: 'active', gender: 'Female', dob: ISODate('1990-06-15'), address: { state: 'UT' }, accountBalance: 1500.50, policies: [{ policyType: 'life', premium: 100, insured_person: { smoking: true } }] },
  { status: 'active', gender: 'Female', dob: ISODate('1990-03-20'), address: { state: 'UT' }, accountBalance: 2200.75, policies: [{ policyType: 'life', premium: 150 }] },
  { status: 'active', gender: 'Male', dob: ISODate('1985-01-10'), address: { state: 'CA' }, accountBalance: 800.25, policies: [{ policyType: 'auto', premium: 180 }] },
]);
print("Dropped and recreated sample customers for Rich Query labs.");
// Find customers who are:
// - Female
// - Born in 1990
// - Living in Utah
// - Have at least one life insurance policy where the insured person is a smoker
const results = db.customers.find({
  gender: '_________',
  dob: {
    $gte: ISODate('1990-01-01'),
    $lte: ISODate('__________')
  },
  'address.state': 'UT',
  policies: {
    $elemMatch: {
      policyType: 'life',
      'insured_person.________': true
    }
  }
}).toArray();
printjson(results);
print("Query completed.");`,
        inlineHints: [
          { line: 15, blankText: '_________', hint: "Filter by the customer's gender using a string literal.", answer: 'Female' },
          { line: 18, blankText: '__________', hint: 'Use the last day of 1990 as the upper bound for the date of birth.', answer: '1990-12-31' },
          { line: 24, blankText: '________', hint: 'This nested field indicates whether the insured person is a smoker.', answer: 'smoking' },
        ],
      },
      {
        filename: 'compound-query.cs',
        language: 'csharp',
        code: `// Compound query: same logic as mongosh — Female, born 1990, UT, life policy with smoker
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
coll.Drop();
var docs = new List<BsonDocument> {
  new BsonDocument { { "status", "active" }, { "gender", "Female" }, { "dob", new DateTime(1990, 6, 15) }, { "address", new BsonDocument { { "state", "UT" } } }, { "accountBalance", 1500.50 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "life" }, { "premium", 100 }, { "insured_person", new BsonDocument { { "smoking", true } } } }, new BsonDocument { { "policyType", "auto" }, { "premium", 200 } } } } },
  new BsonDocument { { "status", "active" }, { "gender", "Female" }, { "dob", new DateTime(1990, 3, 20) }, { "address", new BsonDocument { { "state", "UT" } } }, { "accountBalance", 2200.75 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "life" }, { "premium", 150 }, { "insured_person", new BsonDocument { { "smoking", false } } } } } },
  new BsonDocument { { "status", "active" }, { "gender", "Male" }, { "dob", new DateTime(1985, 1, 10) }, { "address", new BsonDocument { { "state", "CA" } } }, { "accountBalance", 800.25 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "auto" }, { "premium", 180 } } } } },
};
coll.InsertMany(docs);
Console.WriteLine("Dropped and recreated sample customers for Rich Query labs.");
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
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
Console.WriteLine("Query completed.");`,
        skeleton: `// Compound query: same as mongosh — Female, born 1990, UT, life policy with smoker
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Driver;

var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
if (string.IsNullOrEmpty(uri)) throw new InvalidOperationException("MONGODB_URI not set");
var client = new MongoClient(uri);
var db = client.GetDatabase("rich_query");
var coll = db.GetCollection<BsonDocument>("customers");
coll.Drop();
var docs = new List<BsonDocument> {
  new BsonDocument { { "status", "active" }, { "gender", "Female" }, { "dob", new DateTime(1990, 6, 15) }, { "address", new BsonDocument { { "state", "UT" } } }, { "accountBalance", 1500.50 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "life" }, { "insured_person", new BsonDocument { { "smoking", true } } } } } },
  new BsonDocument { { "status", "active" }, { "gender", "Female" }, { "dob", new DateTime(1990, 3, 20) }, { "address", new BsonDocument { { "state", "UT" } } }, { "accountBalance", 2200.75 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "life" }, { "insured_person", new BsonDocument { { "smoking", false } } } } } },
  new BsonDocument { { "status", "active" }, { "gender", "Male" }, { "dob", new DateTime(1985, 1, 10) }, { "address", new BsonDocument { { "state", "CA" } } }, { "accountBalance", 800.25 }, { "policies", new BsonArray { new BsonDocument { { "policyType", "auto" }, { "premium", 180 } } } } },
};
coll.InsertMany(docs);
Console.WriteLine("Dropped and recreated sample customers for Rich Query labs.");
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
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        inlineHints: [
          { line: 22, blankText: '_________', hint: "Filter by the customer's gender using a string literal.", answer: 'Female' },
          { line: 28, blankText: '________', hint: 'Nested field indicating whether the insured person is a smoker.', answer: 'smoking' },
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
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
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
var results = db.GetCollection<BsonDocument>("customers").Find(filter).Project(projection).Sort(Builders<BsonDocument>.Sort.___________("dob")).ToList();
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        inlineHints: [
          { line: 21, blankText: '_________', hint: 'Include the given name field in the projection.', answer: 'firstName' },
          { line: 22, blankText: '_________', hint: 'Include the family name field in the projection.', answer: 'lastName' },
          { line: 24, blankText: '___________', hint: 'Sort ascending by the given field.', answer: 'Ascending' },
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
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
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
Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));`,
        inlineHints: [
          { line: 11, blankText: '______', hint: 'Zero-based page index (e.g. 2 for third page).', answer: '2' },
          { line: 16, blankText: '______', hint: 'Cursor method to skip the first n documents.', answer: 'Skip' },
          { line: 17, blankText: '______', hint: 'Cursor method to cap the number of documents returned.', answer: 'Limit' },
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
use rich_query;
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
        skeleton: `use rich_query;
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
use rich_query;
const results = db.customers.aggregate([
  { $match: { 'address.state': 'UT', status: 'active' } },
  { $group: { _id: '$address.state', totalCustomers: { $sum: 1 }, totalValue: { $sum: '$accountBalance' } } },
  { $sort: { totalValue: -1 } }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        skeleton: `use rich_query;
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
use rich_query;
// Use $project to rename and compute derived fields
const results = db.customers.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$address.state', count: { $sum: 1 }, avgBalance: { $avg: '$accountBalance' } } },
  { $project: { _id: 0, state: '$_id', customerCount: '$count', averageBalance: { $round: ['$avgBalance', 2] }, status: 'active' } }
]).toArray();
printjson(results);
print("Aggregation completed.");`,
        skeleton: `// Use same database as Step 1 (run Step 1 first to create customers)
use rich_query;
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
          {
            line: 13,
            blankText: '$_________',
            hint: 'Sum the account balance field.',
            answer: 'accountBalance',
          },
          {
            line: 14,
            blankText: '_________',
            hint: 'Sort in descending order (highest count first).',
            answer: '-1',
          },
          {
            line: 17,
            blankText: '$_________',
            hint: 'Unwind the policies array to process each policy separately (use $ prefix for field path).',
            answer: '$policies',
          },
          {
            line: 18,
            blankText: '$policies._________',
            hint: 'Calculate the average premium for each policy type.',
            answer: 'premium',
          },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// Run multiple aggregations in a single pipeline using $facet
// Feed multiple dashboards from one query

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
          { line: 15, blankText: '$_________', hint: 'Sum the account balance field.', answer: 'accountBalance' },
          { line: 18, blankText: '_________', hint: 'Sort in descending order (highest count first).', answer: '-1' },
          { line: 22, blankText: '$_________', hint: 'Array field name to unwind (path is prefixed with $).', answer: '$policies' },
          { line: 28, blankText: '$policies._________', hint: 'Calculate the average premium for each policy type.', answer: 'premium' },
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
    { $group: { _id: '$policies.policyType', count: { $sum: _________ }, avgPremium: { $avg: '$policies._________' } } },
    { $sort: { count: _________ } }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 9, blankText: '_________', hint: 'Filter to active customers only.', answer: 'active' },
          { line: 10, blankText: '$_________', hint: 'Array field to deconstruct (path must be $-prefixed, e.g. $policies).', answer: '$policies' },
          { line: 11, blankText: '_________', hint: 'Use 1 to count each unwound document.', answer: '1' },
          { line: 11, blankText: '$policies._________', hint: 'Average this numeric field from each policy.', answer: 'premium' },
          { line: 12, blankText: '_________', hint: 'Sort descending so highest count is first.', answer: '-1' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// STEP 3: Unwind Arrays with $unwind
// Deconstruct the policies array and aggregate per policy type.

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
    { $match: { status: '_________', 'address.state': '_________' } },
    { $count: '_________' }
  ]).toArray();
  console.log(JSON.stringify(results, null, 2));
  await client.close();
}
run().catch(console.dir);`,
        inlineHints: [
          { line: 9, blankText: '_________', hint: 'Filter by this status value.', answer: 'active' },
          { line: 9, blankText: '_________', hint: 'Filter by state (e.g. UT).', answer: 'UT' },
          { line: 10, blankText: '_________', hint: 'Output field name for the count (e.g. totalActive).', answer: 'totalActive' },
        ],
      },
      {
        filename: 'Mongosh',
        language: 'mongosh',
        code: `// STEP 6: Document count with $count
// Count documents that match the filter.

const results = db.customers.aggregate([
  { $match: { status: 'active', 'address.state': 'UT' } },
  { $count: 'totalActive' }
]).toArray();
printjson(results);
print("Count aggregation completed.");`,
        skeleton: `// STEP 6: Document count with $count
// TASK: Add $match filter and $count output field name.

const results = db.customers.aggregate([
  { $match: { status: '_________', 'address.state': '_________' } },
  { $count: '_________' }
]).toArray();
printjson(results);
print("Count aggregation completed.");`,
        inlineHints: [
          { line: 5, blankText: '_________', hint: 'Filter by this status value.', answer: 'active' },
          { line: 5, blankText: '_________', hint: 'Filter by state (e.g. UT).', answer: 'UT' },
          { line: 6, blankText: '_________', hint: 'Output field name for the count (e.g. totalActive).', answer: 'totalActive' },
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
    ],
    tips: [
      'Use Run all or Run selection in the editor to run the pipeline.',
      '$merge must be the last stage; no stage can follow it.',
      'Use YOUR_SUFFIX in the collection name so each participant has their own output collection.',
    ],
  },
};
