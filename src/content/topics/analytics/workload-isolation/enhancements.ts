import type { EnhancementMetadataRegistry } from '@/labs/enhancements/schema';

/**
 * Workload Isolation Enhancement Metadata
 *
 * Source PoV Proof Exercise: Docs/pov-proof-exercises/proofs/05/README.md (WORKLOAD-ISOLATION)
 */

export const enhancements: EnhancementMetadataRegistry = {
  'workload-isolation.concepts': {
    id: 'workload-isolation.concepts',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Description',
    codeBlocks: [
      {
        filename: 'Workload Isolation Diagram',
        language: 'text',
        code: `MongoDB Workload Isolation Architecture
============================================

[Primary]  <-- Operational CRUD (writes, low-latency reads)
[Secondary 1] <-- Replication
[Secondary 2] <-- Replication
[Analytics Node 1] <-- Aggregation queries (tagged: nodeType:ANALYTICS)
[Analytics Node 2] <-- Aggregation queries (tagged: nodeType:ANALYTICS)

Read Preference Tags route aggregation reads to analytics nodes only.
Writes always go to primary. Result: No interference between workloads.`,
      },
    ],
    tips: [
      'Analytical queries (aggregations) can be CPU-intensive and slow down OLTP.',
      'Replica set tags let you designate specific nodes for analytics.',
      'readPreference + readPreferenceTags routes reads to tagged nodes.',
      'Operational apps use primary (default); analytics apps use secondaryPreferred + tags.',
    ],
  },

  'workload-isolation.atlas-topology': {
    id: 'workload-isolation.atlas-topology',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Setup - Configure Atlas Environment',
    codeBlocks: [
      {
        filename: 'Atlas Cluster Configuration',
        language: 'text',
        code: `Atlas M30+ Cluster for Workload Isolation
==============================================

1. Create M30+ cluster (3-node replica set)
2. Add Analytical Nodes:
   - Cluster → Edit Configuration → Add Analytical Nodes
   - Add at least 2 analytical nodes for high availability
3. Topology after configuration:
   - 3 Electable nodes (primary + 2 secondaries)
   - 2 Analytical nodes (tagged nodeType:ANALYTICS)
   - Total: 5 nodes

Analytical nodes do NOT participate in elections.
They are read-only replicas with a special tag.`,
      },
    ],
    tips: [
      'M30 is the minimum tier for analytical nodes.',
      'Use a single cloud region for simplicity.',
      '2+ analytical nodes ensure analytics workload remains available during failover.',
      'Analytical nodes replicate data like secondaries but are dedicated to analytics.',
    ],
  },

  'workload-isolation.read-preference-tags': {
    id: 'workload-isolation.read-preference-tags',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Execution',
    codeBlocks: [
      {
        filename: 'Python - Read Preference with Tags',
        language: 'python',
        code: `# Connect with read preference targeting analytics nodes
client = pymongo.MongoClient(
    url,
    readPreference="secondaryPreferred",
    readPreferenceTags="nodeType:ANALYTICS"
)
db = client["test"]
col = db["customers"]

# Aggregation queries will be routed to analytics nodes
for doc in col.aggregate(pipeline):
    print(doc)`,
        skeleton: `# Connect with read preference targeting analytics nodes
client = pymongo.MongoClient(
    url,
    readPreference="_________",
    readPreferenceTags="_________"
)
db = client["test"]
col = db["customers"]

# Aggregation queries will be routed to analytics nodes
for doc in col.aggregate(pipeline):
    print(doc)`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Read preference: prefer secondaries, fall back to primary if none available',
            answer: 'secondaryPreferred',
          },
          {
            line: 5,
            blankText: '_________',
            hint: 'Tag set to match analytics nodes (format: key:value)',
            answer: 'nodeType:ANALYTICS',
          },
        ],
      },
    ],
    tips: [
      'secondaryPreferred sends reads to secondaries when available; falls back to primary.',
      'readPreferenceTags filters which secondaries qualify (must match node tags).',
      'Writes (insert, update, delete) always go to primary regardless of read preference.',
      'Use primary (default) for operational workloads; use tagged secondaryPreferred for analytics.',
    ],
  },

  'workload-isolation.data-load': {
    id: 'workload-isolation.data-load',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Setup - Load Data',
    codeBlocks: [
      {
        filename: 'Load Sample Data',
        language: 'bash',
        code: `# Install mgeneratejs
npm install -g mgeneratejs

# Generate 1M documents and import (replace USER, PASS, cluster)
mgeneratejs CustomerSingleView.json -n 1000000 | mongoimport \\
  --uri "mongodb+srv://USER:PASS@cluster.mongodb.net/acme_inc" \\
  --collection customers

# Verify data load
mongosh "mongodb+srv://USER:PASS@cluster.mongodb.net" --username USER
use acme_inc
db.customers.countDocuments()`,
        skeleton: `# Generate and import 1M documents
mgeneratejs CustomerSingleView.json -n _________ | mongoimport \\
  --uri "mongodb+srv://_________@cluster.mongodb.net/acme_inc" \\
  --collection customers

# Verify
mongosh "mongodb+srv://_________" --username _________
use acme_inc
db.customers._________()`,
        inlineHints: [
          {
            line: 2,
            blankText: '_________',
            hint: 'Number of documents to generate',
            answer: '1000000',
          },
          {
            line: 3,
            blankText: '_________',
            hint: 'Atlas credentials: username:password',
            answer: 'USER:PASS',
          },
          {
            line: 7,
            blankText: '_________',
            hint: 'Connection string for mongosh',
            answer: 'USER:PASS@cluster.mongodb.net',
          },
          {
            line: 8,
            blankText: '_________',
            hint: 'Atlas username',
            answer: 'USER',
          },
          {
            line: 10,
            blankText: '_________',
            hint: 'Method to count documents in collection',
            answer: 'countDocuments',
          },
        ],
      },
    ],
    tips: [
      'Data load may take up to an hour for 1M records.',
      'CustomerSingleView.json defines the document schema (policies, address, etc.).',
      'Use acme_inc database and customers collection to match proof scripts.',
      'Verify count before proceeding to replica set inspection.',
    ],
  },

  'workload-isolation.print-repset-conf': {
    id: 'workload-isolation.print-repset-conf',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Setup - View Replica Set Topology',
    codeBlocks: [
      {
        filename: 'print_repset_conf.js',
        language: 'javascript',
        code: `sleep(2000)
print();
print("Replica Set Configuration Summary");
print("---------------------------------");

for (var i = 0; i < rs.conf().members.length; i++) {
    var node = rs.conf().members[i];
    print(" NODE: " + node.host);
    print(" - TAG: nodeType:" + node.tags.nodeType);
}

print();`,
        skeleton: `sleep(2000)
print();
print("Replica Set Configuration Summary");
print("---------------------------------");

for (var i = 0; i < rs.conf().members._________; i++) {
    var node = rs.conf().members[i];
    print(" NODE: " + node.host);
    print(" - TAG: nodeType:" + node.tags._________);
}

print();`,
        inlineHints: [
          {
            line: 6,
            blankText: '_________',
            hint: 'Array property for number of elements',
            answer: 'length',
          },
          {
            line: 9,
            blankText: '_________',
            hint: 'Tag key for node type (ANALYTICS or ELECTABLE)',
            answer: 'nodeType',
          },
        ],
      },
    ],
    tips: [
      'Run with: mongosh "mongodb+srv://..." --username USER ./print_repset_conf.js',
      'Output shows each node host and its nodeType tag.',
      'Expect 2 nodes with nodeType:ANALYTICS and 3 with nodeType:ELECTABLE.',
      'Analytics nodes are read-only and do not participate in elections.',
    ],
  },

  'workload-isolation.inspect-tags': {
    id: 'workload-isolation.inspect-tags',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Setup - View Replica Set Topology',
    codeBlocks: [
      {
        filename: 'mongosh - Inspect rs.conf()',
        language: 'javascript',
        code: `// View full replica set configuration
rs.conf()

// Inspect each member's tags
rs.conf().members.forEach((m, i) => {
  print("Member " + i + ": " + m.host);
  print("  tags: " + JSON.stringify(m.tags));
});

// Expected: 2 members with tags: { "nodeType": "ANALYTICS" }
//           3 members with tags: { "nodeType": "ELECTABLE" }`,
        skeleton: `// View full replica set configuration
rs.conf()

// Inspect each member's tags
rs.conf().members.forEach((m, i) => {
  print("Member " + i + ": " + m.host);
  print("  tags: " + JSON.stringify(m._________));
});

// Expected: 2 members with nodeType:ANALYTICS, 3 with nodeType:ELECTABLE`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'Member property containing tag key-value pairs',
            answer: 'tags',
          },
        ],
      },
    ],
    tips: [
      'rs.conf() returns the replica set configuration document.',
      'members array contains one object per node.',
      'tags object is used by read preference to route queries.',
      'Document your analytics node hostnames for troubleshooting.',
    ],
  },

  'workload-isolation.update-script': {
    id: 'workload-isolation.update-script',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Execution - Update Workload',
    codeBlocks: [
      {
        filename: 'update_docs.py',
        language: 'python',
        code: `#!/usr/bin/env python3
import pymongo
import random
from pymongo import UpdateOne
import sys

url = sys.argv[1].strip()
client = pymongo.MongoClient(url)  # Default: primary for writes
db = client["test"]
col = db["customers"]

while True:
    docs = []
    for c in col.find(skip=random.randint(0, 999000)).limit(1000):
        new_region = random.randint(2000, 9999)
        docs.append(UpdateOne({'_id': c['_id']}, {'$set': {'region': new_region}}))
    if docs:
        result = col.bulk_write(docs, ordered=False)
        print("Records updated:", result.modified_count)`,
        skeleton: `#!/usr/bin/env python3
import pymongo
import random
from pymongo import UpdateOne

url = sys.argv[1].strip()
client = pymongo.MongoClient(url)  # Writes go to _________
db = client["test"]
col = db["customers"]

while True:
    docs = []
    for c in col.find(skip=random.randint(0, 999000)).limit(1000):
        new_region = random.randint(2000, 9999)
        docs.append(UpdateOne({'_id': c['_id']}, {'$set': {'region': _________}}))
    if docs:
        result = col.bulk_write(docs, ordered=_________)
        print("Records updated:", result.modified_count)`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'Where all writes are sent (primary node)',
            answer: 'primary',
          },
          {
            line: 14,
            blankText: '_________',
            hint: 'Variable containing the random region value',
            answer: 'new_region',
          },
          {
            line: 16,
            blankText: '_________',
            hint: 'False for parallel execution, True for ordered',
            answer: 'False',
          },
        ],
      },
    ],
    tips: [
      'MongoClient without read preference uses primary for all operations.',
      'bulk_write sends writes to the primary; replication propagates to secondaries.',
      'Run this script in one terminal; it runs indefinitely.',
      'This simulates operational/transactional workload (e.g., order updates).',
    ],
  },

  'workload-isolation.query-script': {
    id: 'workload-isolation.query-script',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Execution - Query Workload',
    codeBlocks: [
      {
        filename: 'query_docs.py',
        language: 'python',
        code: `#!/usr/bin/env python3
import pymongo
import random
import datetime

url = sys.argv[1].strip()
client = pymongo.MongoClient(
    url,
    readPreference="secondaryPreferred",
    readPreferenceTags="nodeType:ANALYTICS"
)
db = client["test"]
col = db["customers"]

start = datetime.datetime(2017, 1, 1)
end = datetime.datetime(2018, 1, 1, 23, 59, 59)
policy_types = ['auto', 'home', 'life']
states = ["AK","AL","AR","AZ","CA", ...]

while True:
    policy = random.choice(policy_types)
    state = random.choice(states)
    pipeline = [
        {'$match': {
            'policies.nextRenewalDt': {'$gte': start, '$lte': end},
            'policies.policyType': policy,
            'policies.address.state': state
        }},
        {'$bucket': {
            'groupBy': "$region",
            'boundaries': [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800],
            'default': "Other",
            'output': {"count": {'$sum': 1}}
        }}
    ]
    for doc in col.aggregate(pipeline):
        print(doc)`,
        skeleton: `#!/usr/bin/env python3
import pymongo

url = sys.argv[1].strip()
client = pymongo.MongoClient(
    url,
    readPreference="_________",
    readPreferenceTags="_________"
)
db = client["test"]
col = db["customers"]

# Aggregation runs on analytics nodes
pipeline = [
    {'$match': {...}},
    {'$bucket': {...}}
]
for doc in col.aggregate(pipeline):
    print(doc)`,
        inlineHints: [
          {
            line: 8,
            blankText: '_________',
            hint: 'Read preference that prefers secondaries',
            answer: 'secondaryPreferred',
          },
          {
            line: 9,
            blankText: '_________',
            hint: 'Tag set to target analytics nodes',
            answer: 'nodeType:ANALYTICS',
          },
        ],
      },
    ],
    tips: [
      'readPreference + readPreferenceTags routes aggregation reads to analytics nodes.',
      'Run this in a separate terminal from the update script.',
      'Both scripts run indefinitely; let them run 10+ minutes before checking metrics.',
      'Aggregations are CPU-intensive; isolation prevents impact on OLTP.',
      'Ensure the database name in the script (e.g., "test" or "acme_inc") matches where you loaded the data.',
    ],
  },

  'workload-isolation.metrics-verification': {
    id: 'workload-isolation.metrics-verification',
    povCapability: 'WORKLOAD-ISOLATION',
    sourceProof: 'proofs/05/README.md',
    sourceSection: 'Measurement',
    codeBlocks: [
      {
        filename: 'Atlas Metrics Checklist',
        language: 'text',
        code: `Atlas Metrics Verification
=========================

1. Navigate to: Atlas → Your Cluster → Metrics
2. View these metrics (toggle members to see each node):
   - Query Targeting
   - Query Executor
   - Scan & Order

3. Verify isolation:
   - Analytics nodes: Show aggregation query activity
   - Electable nodes: Show update/write activity, NOT aggregation
   - Primary: Handles writes from update script
   - Secondaries: Replication traffic

4. Run both workloads for at least 10 minutes before checking.
5. Toggle members in UI to view all 5 nodes if not all visible.`,
      },
    ],
    tips: [
      'Query Targeting shows which nodes receive queries.',
      'Aggregation queries should appear only on analytics nodes.',
      'If aggregations appear on electable nodes, check readPreferenceTags.',
      'Screen resolution may hide some nodes; use Toggle members.',
    ],
  },
};
