import type { Step } from '@/components/labs/LabViewWithTabs';

/**
 * Step enhancements for Ingest Rate labs.
 *
 * These are referenced from lab steps via `enhancementId`, e.g.
 *  - enhancementId: 'ingest-rate.cluster-setup'
 *
 * Each factory returns a Partial<Step> that will be merged into the UI
 * representation for that step (code blocks, tips, troubleshooting, etc).
 */

type StepEnhancementFactory = () => Partial<Step>;

export const ingestRateEnhancements: Record<string, StepEnhancementFactory> = {
  'ingest-rate.cluster-setup': () => ({
    codeBlocks: [
      {
        filename: 'mongosh - Verify Cluster Configuration',
        language: 'javascript',
        code: `// Connect to your Atlas cluster
mongosh "YOUR_ATLAS_URI_STRING"

// Check replica set status
rs.status()

// Verify cluster tier and node count
db.serverStatus().host

// Check database user roles
db.getUsers()

// Create indexes for optimal ingestion
use ingest_test
db.performance.createIndex({ timestamp: 1 })
db.performance.createIndex({ category: 1, timestamp: -1 })
db.performance.createIndex({ userId: 1 })

// Verify indexes
db.performance.getIndexes()`,
        skeleton: `// Connect to Atlas cluster
mongosh "_________"

// Check replica set status
rs._________()

// Create indexes for optimal ingestion
use ingest_test
db.performance.createIndex({ timestamp: 1 })
db.performance.createIndex({ category: 1, timestamp: -1 })
db.performance.createIndex({ userId: 1 })

// Verify indexes
db.performance._________()`,
        inlineHints: [
          {
            line: 2,
            blankText: '_________',
            hint: 'Your MongoDB Atlas connection string',
            answer: 'YOUR_ATLAS_URI_STRING',
          },
          {
            line: 5,
            blankText: '_________',
            hint: 'Method to check replica set status',
            answer: 'status',
          },
          {
            line: 12,
            blankText: '_________',
            hint: 'Method to list all indexes on a collection',
            answer: 'getIndexes',
          },
        ],
      },
    ],
    tips: [
      'Use M40 or higher cluster tier for production-like performance testing.',
      'Ensure backup is enabled on your Atlas cluster.',
      'Create indexes before ingestion for better performance.',
      'Use clusterMonitor role to access monitoring metrics.',
    ],
  }),

  'ingest-rate.small-records': () => ({
    codeBlocks: [
      {
        filename: 'ingest-small-records.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function ingestSmallRecords() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: 'majority' }
  });
  
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('performance');
  
  const batchSize = 5000;
  const totalRecords = 200000; // Target: 20,000/sec for 10 seconds
  const batches = Math.ceil(totalRecords / batchSize);
  
  const startTime = Date.now();
  
  for (let i = 0; i < batches; i++) {
    const docs = [];
    for (let j = 0; j < batchSize && (i * batchSize + j) < totalRecords; j++) {
      docs.push({
        timestamp: new Date(),
        userId: Math.floor(Math.random() * 10000),
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        data: 'x'.repeat(1000) // ~1KB document
      });
    }
    
    // Use ordered: false for parallel processing
    await collection.insertMany(docs, { ordered: false });
    
    if ((i + 1) % 10 === 0) {
      console.log(\`Inserted batch \${i + 1}/\${batches}\`);
    }
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // seconds
  const rate = totalRecords / duration;
  
  console.log(\`\\nIngestion complete!\`);
  console.log(\`Total records: \${totalRecords}\`);
  console.log(\`Duration: \${duration.toFixed(2)} seconds\`);
  console.log(\`Rate: \${rate.toFixed(0)} records/second\`);
  
  await client.close();
}

ingestSmallRecords().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function ingestSmallRecords() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: '_________' }
  });
  
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('performance');
  
  const batchSize = 5000;
  const totalRecords = 200000;
  
  const startTime = Date.now();
  
  for (let i = 0; i < batches; i++) {
    const docs = [];
    for (let j = 0; j < batchSize; j++) {
      docs.push({
        timestamp: new Date(),
        userId: Math.floor(Math.random() * 10000),
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        data: 'x'.repeat(1000) // ~1KB
      });
    }
    
    // Use ordered: false for parallel processing
    await collection.insertMany(docs, { ordered: _________ });
  }
  
  const endTime = Date.now();
  const rate = totalRecords / ((endTime - startTime) / 1000);
  console.log(\`Rate: \${rate.toFixed(0)} records/second\`);
  
  await client.close();
}

ingestSmallRecords().catch(console.error);`,
        inlineHints: [
          {
            line: 4,
            blankText: '_________',
            hint: 'Write concern value to ensure replication (majority, 1, 2)',
            answer: 'majority',
          },
          {
            line: 25,
            blankText: '_________',
            hint: 'Boolean: false allows parallel processing, true stops on error',
            answer: 'false',
          },
        ],
      },
    ],
    tips: [
      'Use ordered: false for better performance when errors are acceptable.',
      'Batch size of 5000-10000 documents typically works well for small records.',
      'Monitor ingestion rate using mongostat or Atlas metrics.',
      'Target rate: 20,000+ inserts/second for 1KB documents on M40 cluster.',
    ],
  }),

  'ingest-rate.measure-rate': () => ({
    codeBlocks: [
      {
        filename: 'measure-ingestion-rate.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function measureIngestionRate() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('performance');
  
  // Count documents
  const count = await collection.countDocuments({});
  console.log(\`Total documents: \${count}\`);
  
  // Get first and last document timestamps
  const first = await collection.findOne({}, { sort: { timestamp: 1 } });
  const last = await collection.findOne({}, { sort: { timestamp: -1 } });
  
  if (first && last) {
    const duration = (last.timestamp - first.timestamp) / 1000; // seconds
    const rate = count / duration;
    console.log(\`Duration: \${duration.toFixed(2)} seconds\`);
    console.log(\`Average rate: \${rate.toFixed(0)} documents/second\`);
  }
  
  // Verify replication - connect to secondary
  const secondaryClient = new MongoClient('YOUR_ATLAS_URI_STRING', {
    readPreference: 'secondary'
  });
  await secondaryClient.connect();
  const secondaryDb = secondaryClient.db('ingest_test');
  const secondaryCount = await secondaryDb.collection('performance').countDocuments({});
  
  console.log(\`\\nReplication verification:\`);
  console.log(\`Primary count: \${count}\`);
  console.log(\`Secondary count: \${secondaryCount}\`);
  console.log(\`Replication status: \${count === secondaryCount ? 'SYNCED' : 'LAGGING'}\`);
  
  await secondaryClient.close();
  await client.close();
}

measureIngestionRate().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function measureIngestionRate() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('performance');
  
  // Count documents
  const count = await collection._________({});
  
  // Get first and last document timestamps
  const first = await collection.findOne({}, { sort: { timestamp: 1 } });
  const last = await collection.findOne({}, { sort: { timestamp: -1 } });
  
  if (first && last) {
    const duration = (last.timestamp - first.timestamp) / 1000;
    const rate = count / duration;
    console.log(\`Average rate: \${rate.toFixed(0)} documents/second\`);
  }
  
  // Verify replication
  const secondaryClient = new MongoClient('YOUR_ATLAS_URI_STRING', {
    readPreference: '_________'
  });
  await secondaryClient.connect();
  const secondaryCount = await secondaryClient.db('ingest_test').collection('performance').countDocuments({});
  
  console.log(\`Replication status: \${count === secondaryCount ? 'SYNCED' : 'LAGGING'}\`);
  
  await secondaryClient.close();
  await client.close();
}

measureIngestionRate().catch(console.error);`,
        inlineHints: [
          {
            line: 8,
            blankText: '_________',
            hint: 'Method to count documents in a collection',
            answer: 'countDocuments',
          },
          {
            line: 20,
            blankText: '_________',
            hint: 'Read preference to read from secondary nodes',
            answer: 'secondary',
          },
        ],
      },
    ],
    tips: [
      'Compare your results to MongoDB benchmarks: 20K/sec (1KB), 3.5K/sec (10KB), 460/sec (50KB).',
      'Use rs.printSlaveReplicationInfo() to check replication lag.',
      'Verify data on all replica set members to ensure redundancy.',
    ],
  }),

  'ingest-rate.ordered-vs-unordered': () => ({
    codeBlocks: [
      {
        filename: 'compare-bulk-operations.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function compareBulkOperations() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  
  const testDocs = Array.from({ length: 10000 }, (_, i) => ({
    index: i,
    timestamp: new Date(),
    data: 'x'.repeat(1000)
  }));
  
  // Test 1: Ordered operations
  const collection1 = db.collection('test_ordered');
  const start1 = Date.now();
  await collection1.insertMany(testDocs, { ordered: true });
  const duration1 = (Date.now() - start1) / 1000;
  const rate1 = testDocs.length / duration1;
  console.log(\`Ordered: \${rate1.toFixed(0)} docs/sec\`);
  
  // Test 2: Unordered operations
  const collection2 = db.collection('test_unordered');
  const start2 = Date.now();
  await collection2.insertMany(testDocs, { ordered: false });
  const duration2 = (Date.now() - start2) / 1000;
  const rate2 = testDocs.length / duration2;
  console.log(\`Unordered: \${rate2.toFixed(0)} docs/sec\`);
  
  console.log(\`\\nPerformance difference: \${((rate2 / rate1 - 1) * 100).toFixed(1)}% faster with unordered\`);
  
  await client.close();
}

compareBulkOperations().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function compareBulkOperations() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  
  const testDocs = Array.from({ length: 10000 }, (_, i) => ({
    index: i,
    timestamp: new Date(),
    data: 'x'.repeat(1000)
  }));
  
  // Test ordered operations
  const start1 = Date.now();
  await db.collection('test_ordered').insertMany(testDocs, { ordered: _________ });
  const rate1 = testDocs.length / ((Date.now() - start1) / 1000);
  
  // Test unordered operations
  const start2 = Date.now();
  await db.collection('test_unordered').insertMany(testDocs, { ordered: _________ });
  const rate2 = testDocs.length / ((Date.now() - start2) / 1000);
  
  console.log(\`Ordered: \${rate1.toFixed(0)} docs/sec\`);
  console.log(\`Unordered: \${rate2.toFixed(0)} docs/sec\`);
  
  await client.close();
}

compareBulkOperations().catch(console.error);`,
        inlineHints: [
          {
            line: 13,
            blankText: '_________',
            hint: 'Boolean: true stops on first error',
            answer: 'true',
          },
          {
            line: 18,
            blankText: '_________',
            hint: 'Boolean: false continues on errors, faster',
            answer: 'false',
          },
        ],
      },
    ],
    tips: [
      'Unordered operations are typically 10-30% faster for bulk inserts.',
      'Use ordered: false when you can handle partial failures.',
      'Use ordered: true when you need to stop on first error.',
    ],
  }),

  'ingest-rate.batch-sizing': () => ({
    codeBlocks: [
      {
        filename: 'optimize-batch-size.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function optimizeBatchSize() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('batch_test');
  
  const totalDocs = 50000;
  const batchSizes = [100, 500, 1000, 5000, 10000];
  
  const results = [];
  
  for (const batchSize of batchSizes) {
    await collection.deleteMany({}); // Clear collection
    
    const batches = Math.ceil(totalDocs / batchSize);
    const startTime = Date.now();
    
    for (let i = 0; i < batches; i++) {
      const docs = [];
      const remaining = Math.min(batchSize, totalDocs - i * batchSize);
      for (let j = 0; j < remaining; j++) {
        docs.push({
          batch: i,
          index: i * batchSize + j,
          timestamp: new Date(),
          data: 'x'.repeat(1000)
        });
      }
      await collection.insertMany(docs, { ordered: false });
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const rate = totalDocs / duration;
    
    results.push({ batchSize, rate: rate.toFixed(0), duration: duration.toFixed(2) });
    console.log(\`Batch size \${batchSize}: \${rate.toFixed(0)} docs/sec (\${duration.toFixed(2)}s)\`);
  }
  
  // Find optimal batch size
  const optimal = results.reduce((best, current) => 
    parseFloat(current.rate) > parseFloat(best.rate) ? current : best
  );
  
  console.log(\`\\nOptimal batch size: \${optimal.batchSize} (\${optimal.rate} docs/sec)\`);
  
  await client.close();
}

optimizeBatchSize().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function optimizeBatchSize() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('batch_test');
  
  const totalDocs = 50000;
  const batchSizes = [100, 500, 1000, 5000, 10000];
  
  for (const batchSize of batchSizes) {
    await collection.deleteMany({});
    
    const batches = Math.ceil(totalDocs / batchSize);
    const startTime = Date.now();
    
    for (let i = 0; i < batches; i++) {
      const docs = [];
      for (let j = 0; j < batchSize && (i * batchSize + j) < totalDocs; j++) {
        docs.push({ index: i * batchSize + j, data: 'x'.repeat(1000) });
      }
      await collection.insertMany(docs, { ordered: false });
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const rate = totalDocs / duration;
    console.log(\`Batch \${batchSize}: \${rate.toFixed(0)} docs/sec\`);
  }
  
  await client.close();
}

optimizeBatchSize().catch(console.error);`,
        inlineHints: [],
      },
    ],
    tips: [
      'Optimal batch size depends on document size and network latency.',
      'For small documents (1KB), batch sizes of 5000-10000 work well.',
      'For larger documents, use smaller batches (1000-5000) to avoid memory issues.',
      'Monitor memory usage when testing different batch sizes.',
    ],
  }),

  'ingest-rate.write-concern': () => ({
    codeBlocks: [
      {
        filename: 'test-write-concern.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function testWriteConcern() {
  const testDocs = Array.from({ length: 20000 }, (_, i) => ({
    index: i,
    timestamp: new Date(),
    data: 'x'.repeat(1000)
  }));
  
  const writeConcerns = [
    { w: 1 },
    { w: 'majority' },
    { w: 2 }
  ];
  
  for (const wc of writeConcerns) {
    const client = new MongoClient('YOUR_ATLAS_URI_STRING', {
      writeConcern: wc
    });
    await client.connect();
    const db = client.db('ingest_test');
    const collection = db.collection(\`wc_test_\${wc.w}\`);
    
    await collection.deleteMany({});
    
    const startTime = Date.now();
    await collection.insertMany(testDocs, { ordered: false });
    const duration = (Date.now() - startTime) / 1000;
    const rate = testDocs.length / duration;
    
    console.log(\`Write concern \${JSON.stringify(wc)}: \${rate.toFixed(0)} docs/sec\`);
    
    await client.close();
  }
}

testWriteConcern().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function testWriteConcern() {
  const testDocs = Array.from({ length: 20000 }, (_, i) => ({
    index: i,
    timestamp: new Date(),
    data: 'x'.repeat(1000)
  }));
  
  // Test w: 1 (fastest, no replication guarantee)
  const client1 = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: _________ }
  });
  await client1.connect();
  const start1 = Date.now();
  await client1.db('ingest_test').collection('wc1').insertMany(testDocs, { ordered: false });
  const rate1 = testDocs.length / ((Date.now() - start1) / 1000);
  console.log(\`w: 1 rate: \${rate1.toFixed(0)} docs/sec\`);
  await client1.close();
  
  // Test w: 'majority' (ensures replication)
  const client2 = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: '_________' }
  });
  await client2.connect();
  const start2 = Date.now();
  await client2.db('ingest_test').collection('wc2').insertMany(testDocs, { ordered: false });
  const rate2 = testDocs.length / ((Date.now() - start2) / 1000);
  console.log(\`w: majority rate: \${rate2.toFixed(0)} docs/sec\`);
  await client2.close();
}

testWriteConcern().catch(console.error);`,
        inlineHints: [
          {
            line: 11,
            blankText: '_________',
            hint: 'Write concern value: 1 means acknowledge from primary only',
            answer: '1',
          },
          {
            line: 20,
            blankText: '_________',
            hint: 'Write concern value: majority ensures replication to majority of nodes',
            answer: 'majority',
          },
        ],
      },
    ],
    tips: [
      'w: 1 is fastest but provides no replication guarantee.',
      'w: "majority" ensures data is replicated but may be slightly slower.',
      'Choose write concern based on your durability requirements.',
      'For high-volume ingestion, w: "majority" is recommended for safety.',
    ],
  }),

  'ingest-rate.monitor-replication': () => ({
    codeBlocks: [
      {
        filename: 'monitor-replication.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function monitorReplication() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const adminDb = client.db('admin');
  
  // Get replica set status
  const status = await adminDb.command({ replSetGetStatus: 1 });
  
  console.log('Replica Set Status:');
  console.log(\`Primary: \${status.members.find(m => m.stateStr === 'PRIMARY')?.name}\`);
  
  status.members.forEach(member => {
    if (member.stateStr === 'SECONDARY') {
      const lag = member.optimeDate ? 
        (Date.now() - member.optimeDate.getTime()) / 1000 : 0;
      console.log(\`\${member.name}: \${member.stateStr}, lag: \${lag.toFixed(2)}s\`);
    }
  });
  
  // Check oplog
  const oplog = client.db('local').collection('oplog.rs');
  const oplogSize = await oplog.countDocuments({});
  console.log(\`\\nOplog entries: \${oplogSize}\`);
  
  await client.close();
}

monitorReplication().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function monitorReplication() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING');
  await client.connect();
  const adminDb = client.db('admin');
  
  // Get replica set status
  const status = await adminDb.command({ replSetGetStatus: _________ });
  
  console.log('Replica Set Status:');
  status.members.forEach(member => {
    console.log(\`\${member.name}: \${member.stateStr}\`);
  });
  
  // Check oplog
  const oplog = client.db('local').collection('_________');
  const oplogSize = await oplog.countDocuments({});
  console.log(\`Oplog entries: \${oplogSize}\`);
  
  await client.close();
}

monitorReplication().catch(console.error);`,
        inlineHints: [
          {
            line: 7,
            blankText: '_________',
            hint: 'Command parameter value (number)',
            answer: '1',
          },
          {
            line: 15,
            blankText: '_________',
            hint: 'Collection name for replication oplog',
            answer: 'oplog.rs',
          },
        ],
      },
    ],
    tips: [
      'Replication lag should stay under 1 second during normal operations.',
      'Use rs.printSlaveReplicationInfo() in mongosh for detailed lag info.',
      'Monitor oplog size to ensure it doesn\'t fill up.',
      'Atlas UI provides real-time replication lag metrics.',
    ],
  }),

  'ingest-rate.verify-nodes': () => ({
    codeBlocks: [
      {
        filename: 'verify-all-nodes.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function verifyAllNodes() {
  // Connect to primary
  const primaryClient = new MongoClient('YOUR_ATLAS_URI_STRING');
  await primaryClient.connect();
  const primaryDb = primaryClient.db('ingest_test');
  const primaryCount = await primaryDb.collection('performance').countDocuments({});
  console.log(\`Primary count: \${primaryCount}\`);
  
  // Connect to secondary
  const secondaryClient = new MongoClient('YOUR_ATLAS_URI_STRING', {
    readPreference: 'secondary'
  });
  await secondaryClient.connect();
  const secondaryDb = secondaryClient.db('ingest_test');
  const secondaryCount = await secondaryDb.collection('performance').countDocuments({});
  console.log(\`Secondary count: \${secondaryCount}\`);
  
  // Verify counts match
  if (primaryCount === secondaryCount) {
    console.log('✅ All nodes have the same document count - replication verified!');
  } else {
    console.log('⚠️ Count mismatch - replication may still be in progress');
  }
  
  // Sample documents from each node
  const primarySample = await primaryDb.collection('performance').findOne({});
  const secondarySample = await secondaryDb.collection('performance').findOne({});
  
  if (primarySample && secondarySample && primarySample._id.equals(secondarySample._id)) {
    console.log('✅ Sample documents match - data integrity verified!');
  }
  
  await secondaryClient.close();
  await primaryClient.close();
}

verifyAllNodes().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function verifyAllNodes() {
  // Connect to primary
  const primaryClient = new MongoClient('YOUR_ATLAS_URI_STRING');
  await primaryClient.connect();
  const primaryCount = await primaryClient.db('ingest_test').collection('performance').countDocuments({});
  
  // Connect to secondary
  const secondaryClient = new MongoClient('YOUR_ATLAS_URI_STRING', {
    readPreference: '_________'
  });
  await secondaryClient.connect();
  const secondaryCount = await secondaryClient.db('ingest_test').collection('performance').countDocuments({});
  
  console.log(\`Primary: \${primaryCount}, Secondary: \${secondaryCount}\`);
  
  if (primaryCount === secondaryCount) {
    console.log('✅ Replication verified!');
  }
  
  await secondaryClient.close();
  await primaryClient.close();
}

verifyAllNodes().catch(console.error);`,
        inlineHints: [
          {
            line: 10,
            blankText: '_________',
            hint: 'Read preference to read from secondary nodes',
            answer: 'secondary',
          },
        ],
      },
    ],
    tips: [
      'Always verify data on all replica set members after high-volume ingestion.',
      'Use readPreference: "secondary" to read from secondary nodes.',
      'Sample random documents to verify data integrity, not just counts.',
      'Use rs.status() to check replica set health.',
    ],
  }),

  'ingest-rate.failover-test': () => ({
    codeBlocks: [
      {
        filename: 'test-failover-during-ingestion.js',
        language: 'javascript',
        code: `const { MongoClient } = require('mongodb');

async function testFailoverDuringIngestion() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: 'majority' }
  });
  await client.connect();
  const db = client.db('ingest_test');
  const collection = db.collection('failover_test');
  
  let inserted = 0;
  const target = 100000;
  const batchSize = 5000;
  
  console.log('Starting high-volume ingestion...');
  console.log('⚠️  In another terminal, step down the primary: rs.stepDown()');
  console.log('Or use Atlas UI to stop the primary node');
  console.log('Press Ctrl+C to stop ingestion\\n');
  
  const startTime = Date.now();
  let lastCount = 0;
  
  try {
    while (inserted < target) {
      const docs = [];
      const remaining = Math.min(batchSize, target - inserted);
      for (let i = 0; i < remaining; i++) {
        docs.push({
          index: inserted + i,
          timestamp: new Date(),
          data: 'x'.repeat(1000),
          batch: Math.floor(inserted / batchSize)
        });
      }
      
      try {
        await collection.insertMany(docs, { ordered: false });
        inserted += docs.length;
        
        // Check current count periodically
        if (inserted % 50000 === 0) {
          const currentCount = await collection.countDocuments({});
          const rate = (inserted - lastCount) / ((Date.now() - startTime) / 1000);
          console.log(\`Inserted: \${inserted}, Count: \${currentCount}, Rate: \${rate.toFixed(0)}/sec\`);
          lastCount = inserted;
        }
      } catch (error) {
        if (error.message.includes('not master') || error.message.includes('primary')) {
          console.log('\\n⚠️  Primary changed - reconnecting...');
          await client.close();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for election
          await client.connect();
          console.log('✅ Reconnected to new primary');
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error during ingestion:', error.message);
  }
  
  const finalCount = await collection.countDocuments({});
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(\`\\nIngestion complete:\`);
  console.log(\`Documents inserted: \${inserted}\`);
  console.log(\`Documents in collection: \${finalCount}\`);
  console.log(\`Duration: \${duration.toFixed(2)} seconds\`);
  console.log(\`Data loss: \${inserted - finalCount} documents\`);
  
  await client.close();
}

testFailoverDuringIngestion().catch(console.error);`,
        skeleton: `const { MongoClient } = require('mongodb');

async function testFailoverDuringIngestion() {
  const client = new MongoClient('YOUR_ATLAS_URI_STRING', {
    writeConcern: { w: 'majority' }
  });
  await client.connect();
  const collection = client.db('ingest_test').collection('failover_test');
  
  let inserted = 0;
  const target = 100000;
  
  while (inserted < target) {
    const docs = Array.from({ length: 5000 }, (_, i) => ({
      index: inserted + i,
      timestamp: new Date()
    }));
    
    try {
      await collection.insertMany(docs, { ordered: false });
      inserted += docs.length;
    } catch (error) {
      if (error.message.includes('not master')) {
        console.log('Primary changed - reconnecting...');
        await client.close();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await client._________();
      }
    }
  }
  
  const finalCount = await collection.countDocuments({});
  console.log(\`Inserted: \${inserted}, Final count: \${finalCount}\`);
  
  await client.close();
}

testFailoverDuringIngestion().catch(console.error);`,
        inlineHints: [
          {
            line: 25,
            blankText: '_________',
            hint: 'Method to reconnect to MongoDB',
            answer: 'connect',
          },
        ],
      },
    ],
    tips: [
      'Use writeConcern: {w: "majority"} to ensure data survives failover.',
      'Handle "not master" errors gracefully - reconnect after failover.',
      'Ingestion may pause briefly during primary election.',
      'Verify no data loss after failover completes.',
    ],
  }),
};
