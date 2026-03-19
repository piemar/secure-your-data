/**
 * Skeleton code templates for each mission.
 * Attendees start with this code and fill in the blanks.
 */

export const MISSION_SKELETONS: Record<string, string> = {
  'mission-1': `// MISSION: The Phantom Index
// Diagnose slow queries and create the optimal compound index
// Database: analytics  |  Collection: events (50M documents)

// Step 1: Analyze the slow query with explain()
db.events.find({
  status: "active",
  category: "purchase",
  timestamp: { $gte: ISODate("2024-01-01") }
}).explain("executionStats");

// TODO: Examine the output — look for COLLSCAN and totalDocsExamined

// Step 2: Identify the problem
// What stage is being used? COLLSCAN means no index is helping.
// How many documents are being examined vs returned?

// Step 3: Create the optimal compound index
// Equality fields first, range fields last
db.events.createIndex({
  // TODO: Add your compound index fields here
  // Hint: status and category are equality, timestamp is range
});

// Step 4: Re-run explain to verify IXSCAN
db.events.find({
  status: "active",
  category: "purchase",
  timestamp: { $gte: ISODate("2024-01-01") }
}).explain("executionStats");

// Verify: Should show IXSCAN and much fewer docsExamined
`,

  'mission-2': `// MISSION: Shard Under Siege
// Rebalance data across the cluster before total collapse

// Step 1: Assess shard distribution
sh.status();

// Step 2: Identify the hot shard and uneven chunk ranges
// Look for shard with disproportionate chunks/data

// Step 3: Initiate manual chunk migration
// TODO: Move chunks from overloaded shard to underloaded shard
sh.moveChunk("mydb.orders",
  { /* TODO: specify the chunk lower bound */ },
  "/* TODO: target shard name */"
);

// Step 4: Verify balanced distribution
sh.status();
db.orders.getShardDistribution();

// Step 5: Confirm all services
db.adminCommand({ ping: 1 });
db.adminCommand({ serverStatus: 1 }).connections;
`,

  'mission-3': `// MISSION: The Aggregation Heist
// Build a complex aggregation pipeline on nested documents

// Step 1: Analyze document structure
db.intel.findOne();

// Step 2: Build $unwind and $match stages
db.intel.aggregate([
  { $unwind: "$/* TODO: array field to unwind */" },
  { $match: {
    // TODO: Add your match criteria
  }},

  // Step 3: Add $lookup for cross-collection join
  { $lookup: {
    from: "/* TODO: target collection */",
    localField: "/* TODO: local join field */",
    foreignField: "/* TODO: foreign join field */",
    as: "/* TODO: output array name */"
  }},

  // Step 4: Use $facet for parallel aggregations
  { $facet: {
    "byCategory": [
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ],
    "byPriority": [
      { $group: { _id: "$priority", total: { $sum: "$value" } } }
    ]
  }},

  // Step 5: Output results with $merge
  { $merge: {
    into: "/* TODO: output collection */",
    whenMatched: "replace",
    whenNotMatched: "insert"
  }}
]);
`,

  'mission-4': `// MISSION: Connection Storm
// Handle 10,000 simultaneous connections

// Step 1: Diagnose connection pool exhaustion
db.serverStatus().connections;
db.adminCommand({ connPoolStats: 1 });

// Step 2: Configure optimal pool size
// TODO: Set these in your connection string or MongoClient options
const uri = "mongodb+srv://cluster.example.net/mydb?" +
  "maxPoolSize=/* TODO */" +
  "&minPoolSize=/* TODO */" +
  "&maxIdleTimeMS=/* TODO */";

// Step 3: Implement exponential backoff retry logic
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      // TODO: Implement exponential backoff
      const backoff = Math.pow(2, attempt) * 100;
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

// Step 4: Set timeouts
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: /* TODO */,
  socketTimeoutMS: /* TODO */,
  connectTimeoutMS: /* TODO */,
});
`,

  'mission-5': `// MISSION: The Schema Saboteur
// Find and fix tampered schema validation rules

// Step 1: Audit all collection validators
db.getCollectionInfos({ type: "collection" }).forEach(c => {
  printjson({ name: c.name, validator: c.options.validator });
});

// Step 2: Identify tampered rules
// TODO: Compare current validators against expected schemas

// Step 3: Fix users collection validation
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt"],
      properties: {
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

// Step 4: Fix transactions collection
db.runCommand({
  collMod: "transactions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["/* TODO: add required fields */"],
      properties: {
        // TODO: Define proper field types
      }
    }
  }
});

// Step 5: Fix sessions collection
db.runCommand({
  collMod: "sessions",
  validator: {
    $jsonSchema: {
      // TODO: Define sessions schema
    }
  }
});

// Step 6: Verify validators reject invalid documents
try {
  db.users.insertOne({ invalid: true });
  print("ERROR: Validator should have rejected this!");
} catch (e) {
  print("SUCCESS: Invalid document rejected - " + e.message);
}
`,

  // Mission 6: Rich Query Recon (from secure-your-data RICH-QUERY proof)
  'mission-6': `// MISSION: Rich Query Recon
// Master compound queries, projections, and indexing

// Step 1: Compound query with nested fields and array operators
db.customers.find({
  gender: "/* TODO: target gender */",
  dob: {
    $gte: ISODate("1990-01-01"),
    $lte: ISODate("/* TODO: end date */")
  },
  "address.state": "UT",
  policies: {
    $elemMatch: {
      policyType: "life",
      "insured_person./* TODO: field */": true
    }
  }
});

// Step 2: Add projections to reduce payload
db.customers.find(
  { gender: "Female", "address.state": "UT" },
  {
    projection: {
      _id: 0,
      /* TODO: include firstName, lastName, dob */
    }
  }
);

// Step 3: Sort and paginate results
db.customers.find({ "address.state": "UT" })
  .sort({ /* TODO: sort field and order */ })
  .limit(/* TODO: page size */)
  .skip(/* TODO: offset for page 2 */);

// Step 4: Create compound index and verify with explain
db.customers.createIndex({
  /* TODO: equality fields first, range field last */
});

db.customers.find({
  gender: "Female",
  "address.state": "UT",
  dob: { $gte: ISODate("1990-01-01") }
}).explain("executionStats");
// Verify: should show IXSCAN, not COLLSCAN
`,

  // Mission 7: Encryption Lockdown (from secure-your-data CSFLE)
  'mission-7': `// MISSION: Encryption Lockdown
// Implement Client-Side Field Level Encryption (CSFLE)

const { MongoClient, ClientEncryption } = require("mongodb");

// Step 1: Create Customer Master Key (CMK) in KMS
// In AWS CLI:
// aws kms create-key --description "MongoDB CSFLE CMK"
// Save the KeyId for the next step

// Step 2: Generate Data Encryption Key (DEK)
const encryption = new ClientEncryption(client, {
  keyVaultNamespace: "encryption.__keyVault",
  kmsProviders: {
    aws: {
      accessKeyId: "/* TODO */",
      secretAccessKey: "/* TODO */"
    }
  }
});

const dekId = await encryption.createDataKey("aws", {
  masterKey: { key: "/* TODO: CMK ARN */", region: "/* TODO */" },
  keyAltNames: ["/* TODO: key alias */"]
});

// Step 3: Define encryption schema map
const schemaMap = {
  "medical.patients": {
    bsonType: "object",
    encryptMetadata: { keyId: [dekId] },
    properties: {
      ssn: {
        encrypt: {
          bsonType: "string",
          algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
        }
      }
    }
  }
};

// Step 4: Create encrypted MongoClient
const encryptedClient = new MongoClient(uri, {
  autoEncryption: {
    keyVaultNamespace: "encryption.__keyVault",
    kmsProviders: { /* TODO: configure */ },
    schemaMap: schemaMap
  }
});

// Step 5: Test insert and query
const patients = encryptedClient.db("medical").collection("patients");
await patients.insertOne({
  name: "Jane Doe",
  ssn: "123-45-6789",
  dob: new Date("1990-01-01")
});

// Query with encrypted client (auto-decrypts)
const result = await patients.findOne({ ssn: "123-45-6789" });
console.log("Decrypted:", result);

// Query with standard client (shows encrypted Binary)
const standardResult = await client.db("medical")
  .collection("patients").findOne({});
console.log("Encrypted view:", standardResult.ssn);
`,

  // Mission 8: Analytics Extraction (from IN-PLACE-ANALYTICS + WORKLOAD-ISOLATION)
  'mission-8': `// MISSION: Analytics Extraction
// Run in-place analytics with workload isolation

// Step 1: Build aggregation for analytics
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: {
    _id: "$category",
    totalRevenue: { $sum: "$amount" },
    avgOrderValue: { $avg: "$amount" },
    orderCount: { $count: {} }
  }},
  { $sort: { totalRevenue: -1 } }
]);

// Step 2: Advanced analytics with time-based grouping
db.orders.aggregate([
  { $group: {
    _id: {
      year: { $year: "$orderDate" },
      month: { $month: "$orderDate" }
    },
    revenue: { $sum: "$amount" },
    orders: { $sum: 1 },
    avgValue: { $avg: "$amount" },
    maxOrder: { $max: "$amount" },
    minOrder: { $min: "$amount" }
  }},
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);

// Step 3: Workload isolation — read from secondary
const cursor = db.orders.aggregate(
  [
    { $group: { _id: "$region", total: { $sum: "$amount" } } }
  ],
  { readPreference: "secondaryPreferred" }
);
cursor.forEach(printjson);
`,

  // Mission 9: Scale-Out Siege (from SCALE-OUT proof)
  'mission-9': `// MISSION: Scale-Out Siege
// Scale the cluster horizontally under sustained load

// Step 1: Enable sharding and shard the collection
sh.enableSharding("loadtest");
sh.shardCollection("loadtest.events", {
  /* TODO: choose shard key — e.g. hashed _id or ranged timestamp */
});

// Step 2: Generate sustained load
for (let i = 0; i < 100000; i++) {
  db.events.insertMany(
    Array.from({ length: 100 }, (_, j) => ({
      _id: ObjectId(),
      timestamp: new Date(),
      value: Math.random() * 1000,
      category: ["web", "mobile", "api"][i % 3],
      batchId: i
    }))
  );
  if (i % 1000 === 0) print("Inserted " + (i * 100) + " documents");
}

// Step 3: Check distribution
sh.status();
db.events.getShardDistribution();

// Step 4: Add a new shard to the cluster
sh.addShard("newShard/host:port");

// Wait for balancer, then verify:
sh.status();
`,

  // Mission 10: Auto-HA Failover (from AUTO-HA proof)
  'mission-10': `// MISSION: Auto-HA Failover
// Test automatic high availability and retryable writes

// Step 1: Check replica set status
rs.status();
// Note which member is PRIMARY, which are SECONDARY

// Step 2: Connect WITHOUT retryable writes (baseline)
const uriNoRetry = "mongodb+srv://cluster.example.net/mydb?" +
  "retryWrites=false&retryReads=false";

// Run continuous insert (simulate in your terminal):
// while true; do
//   mongosh $URI --eval 'db.ha_test.insertOne({ts: new Date(), v: Math.random()})'
// done

// Step 3: Enable retryable writes and reads
const uriWithRetry = "mongodb+srv://cluster.example.net/mydb?" +
  "retryWrites=true&retryReads=true";

// Trigger failover (Atlas UI: Test Failover, or):
// db.adminCommand({ replSetStepDown: 60 });

// Step 4: Verify recovery
rs.status();
// Confirm new PRIMARY elected, all members healthy
// With retryWrites=true, the application saw zero errors
`,

  // Mission 11: Deployment Automation (from AUTO-DEPLOY / TERRAFORM)
  'mission-11': `// MISSION: Deployment Automation
// Automate Atlas cluster provisioning with Terraform

// Step 1: Define the Terraform resource
/*
resource "mongodbatlas_cluster" "heist_cluster" {
  project_id = var.atlas_project_id
  name       = "heist-production"

  // Step 2: Configure cluster specifications
  provider_name               = "AWS"
  region_name                 = "US_EAST_1"
  
  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = "US_EAST_1"
      electable_specs {
        instance_size = "M10"
        node_count    = 3
      }
    }
  }

  cloud_backup = true
}

// Step 3: Run Terraform commands
// terraform init
// terraform plan -out=tfplan
// terraform apply tfplan
*/

// Verify deployment via API or mongosh:
// mongosh "mongodb+srv://heist-production.example.net" --eval "db.adminCommand({hello:1})"
`,
};
