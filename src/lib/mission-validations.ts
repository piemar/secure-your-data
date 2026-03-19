/**
 * Validation rules for each mission's objectives.
 * Maps mission IDs to objective validations with regex patterns.
 */
import { ObjectiveValidation } from './validation';

export const MISSION_VALIDATIONS: Record<string, ObjectiveValidation[]> = {
  // Mission 12: CRUD Boot Camp
  'mission-12': [
    {
      objectiveId: 'obj-12-1',
      rules: [
        { pattern: /\.insertOne\s*\(/, description: 'Use insertOne() to insert a document', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-2',
      rules: [
        { pattern: /\.insertMany\s*\(/, description: 'Use insertMany() to bulk insert', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-3',
      rules: [
        { pattern: /(\.find\s*\(|\.findOne\s*\()/, description: 'Use find() or findOne() to query', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-4',
      rules: [
        { pattern: /\.updateOne\s*\(/, description: 'Use updateOne()', required: true },
        { pattern: /\$set/, description: 'Use $set operator', required: true },
      ],
    },
    {
      objectiveId: 'obj-12-5',
      rules: [
        { pattern: /\.deleteOne\s*\(/, description: 'Use deleteOne()', required: true },
      ],
    },
  ],

  // Mission 1: The Phantom Index — Query & Index optimization
  'mission-1': [
    {
      objectiveId: 'obj-1-1',
      rules: [
        { pattern: /\.explain\s*\(/, description: 'Use explain() to analyze query', required: true },
        { pattern: /(executionStats|queryPlanner|allPlansExecution)/, description: 'Specify explain verbosity', required: false },
      ],
    },
    {
      objectiveId: 'obj-1-2',
      rules: [
        { pattern: /COLLSCAN|collscan|totalDocsExamined/, description: 'Identify collection scan or docs examined', required: true },
      ],
    },
    {
      objectiveId: 'obj-1-3',
      rules: [
        { pattern: /\.createIndex\s*\(/, description: 'Use createIndex() to create an index', required: true },
        { pattern: /\{[^}]*:[^}]*,[^}]*:[^}]*\}/, description: 'Create a compound index with multiple fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-1-4',
      rules: [
        { pattern: /\.explain\s*\(/, description: 'Run explain() again to verify improvement', required: true },
        { pattern: /IXSCAN|ixscan|indexName/, description: 'Confirm index scan is used', required: true },
      ],
    },
  ],

  // Mission 2: Shard Under Siege — Sharding & rebalancing
  'mission-2': [
    {
      objectiveId: 'obj-2-1',
      rules: [
        { pattern: /sh\.status\s*\(/, description: 'Run sh.status() to assess distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-2',
      rules: [
        { pattern: /(chunks|dataSize|jumboChunk|shard)/, description: 'Identify shard/chunk information', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-3',
      rules: [
        { pattern: /sh\.moveChunk|moveChunk|moveRange/, description: 'Initiate chunk migration', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-4',
      rules: [
        { pattern: /sh\.status\s*\(|getShardDistribution/, description: 'Verify balanced distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-2-5',
      rules: [
        { pattern: /(ping|hello|serverStatus|ismaster|isMaster)/, description: 'Confirm services responding', required: true },
      ],
    },
  ],

  // Mission 3: The Aggregation Heist — Aggregation pipelines
  'mission-3': [
    {
      objectiveId: 'obj-3-1',
      rules: [
        { pattern: /(findOne|find\(|\.aggregate)/, description: 'Explore document structure', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-2',
      rules: [
        { pattern: /\$unwind/, description: 'Use $unwind stage', required: true },
        { pattern: /\$match/, description: 'Use $match stage', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-3',
      rules: [
        { pattern: /\$lookup/, description: 'Use $lookup for cross-collection join', required: true },
        { pattern: /(from|localField|foreignField|as)\s*:/, description: 'Configure $lookup fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-4',
      rules: [
        { pattern: /\$facet/, description: 'Use $facet for parallel aggregations', required: true },
      ],
    },
    {
      objectiveId: 'obj-3-5',
      rules: [
        { pattern: /\$merge|\$out/, description: 'Use $merge or $out to output results', required: true },
      ],
    },
  ],

  // Mission 4: Connection Storm — Connection pooling
  'mission-4': [
    {
      objectiveId: 'obj-4-1',
      rules: [
        { pattern: /(serverStatus|connPoolStats|connections|currentActive)/, description: 'Diagnose connection pool state', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-2',
      rules: [
        { pattern: /(maxPoolSize|minPoolSize|maxIdleTimeMS)/, description: 'Configure pool size settings', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-3',
      rules: [
        { pattern: /(retry|retryWrites|retryReads|backoff|exponential)/, description: 'Implement retry logic', required: true },
      ],
    },
    {
      objectiveId: 'obj-4-4',
      rules: [
        { pattern: /(serverSelectionTimeoutMS|socketTimeoutMS|connectTimeoutMS)/, description: 'Set timeout strategies', required: true },
      ],
    },
  ],

  // Mission 5: The Schema Saboteur — Schema validation
  'mission-5': [
    {
      objectiveId: 'obj-5-1',
      rules: [
        { pattern: /(getCollectionInfos|listCollections|collMod|validator)/, description: 'Audit collection validators', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-2',
      rules: [
        { pattern: /(validator|\$jsonSchema|bsonType|required)/, description: 'Identify validation rules', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-3',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix users validation', required: true },
        { pattern: /users/, description: 'Target users collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-4',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix transactions validation', required: true },
        { pattern: /transactions/, description: 'Target transactions collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-5',
      rules: [
        { pattern: /(collMod|validator)/, description: 'Apply collMod to fix sessions validation', required: true },
        { pattern: /sessions/, description: 'Target sessions collection', required: true },
      ],
    },
    {
      objectiveId: 'obj-5-6',
      rules: [
        { pattern: /(insertOne|insertMany|insert\()/, description: 'Test with insert operation', required: true },
        { pattern: /(error|validation|failed|rejected)/, description: 'Verify rejection of invalid docs', required: false },
      ],
    },
  ],

  // Mission 6: Rich Query Recon
  'mission-6': [
    {
      objectiveId: 'obj-6-1',
      rules: [
        { pattern: /\.find\s*\(/, description: 'Use find() for queries', required: true },
        { pattern: /(\$and|\$or|\$elemMatch)/, description: 'Use compound query operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-2',
      rules: [
        { pattern: /projection|_id\s*:\s*0|:\s*1/, description: 'Apply projections to limit returned fields', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-3',
      rules: [
        { pattern: /\.sort\s*\(/, description: 'Use sort()', required: true },
        { pattern: /(limit|skip)\s*\(/, description: 'Use limit/skip for pagination', required: true },
      ],
    },
    {
      objectiveId: 'obj-6-4',
      rules: [
        { pattern: /\.createIndex\s*\(/, description: 'Create compound index', required: true },
        { pattern: /\.explain\s*\(/, description: 'Use explain() to verify IXSCAN', required: true },
      ],
    },
  ],

  // Mission 7: Encryption Lockdown (CSFLE)
  'mission-7': [
    {
      objectiveId: 'obj-7-1',
      rules: [
        { pattern: /(aws\s+kms|create-key|createKey|KMS)/, description: 'Create CMK in KMS', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-2',
      rules: [
        { pattern: /(ClientEncryption|createDataKey|keyAltNames)/, description: 'Generate DEK using ClientEncryption', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-3',
      rules: [
        { pattern: /(\$jsonSchema|encrypt|schemaMap)/, description: 'Define schema map with encryption', required: true },
        { pattern: /(Deterministic|Random)/, description: 'Specify encryption algorithm', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-4',
      rules: [
        { pattern: /(autoEncryption|encryptedFieldsMap)/, description: 'Enable auto encryption on client', required: true },
        { pattern: /MongoClient/, description: 'Create encrypted MongoClient', required: true },
      ],
    },
    {
      objectiveId: 'obj-7-5',
      rules: [
        { pattern: /(insertOne|insert)/, description: 'Insert document with encrypted fields', required: true },
        { pattern: /(find|findOne)/, description: 'Query and verify decryption', required: true },
      ],
    },
  ],

  // Mission 8: Analytics Extraction
  'mission-8': [
    {
      objectiveId: 'obj-8-1',
      rules: [
        { pattern: /\.aggregate\s*\(/, description: 'Use aggregate()', required: true },
        { pattern: /(\$group|\$sum|\$avg|\$count)/, description: 'Use grouping/accumulator operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-8-2',
      rules: [
        { pattern: /\$group/, description: 'Use $group stage', required: true },
        { pattern: /(\$sum|\$avg|\$min|\$max)/, description: 'Use accumulator operators', required: true },
      ],
    },
    {
      objectiveId: 'obj-8-3',
      rules: [
        { pattern: /(readPreference|secondaryPreferred|secondary)/, description: 'Configure read preference for workload isolation', required: true },
      ],
    },
  ],

  // Mission 9: Scale-Out Siege
  'mission-9': [
    {
      objectiveId: 'obj-9-1',
      rules: [
        { pattern: /(sh\.enableSharding|sh\.shardCollection|shardCollection)/, description: 'Enable sharding on collection', required: true },
        { pattern: /(shardKey|hashed|ranged)/, description: 'Define shard key strategy', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-2',
      rules: [
        { pattern: /(insertMany|insert|bulkWrite)/, description: 'Insert test load data', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-3',
      rules: [
        { pattern: /sh\.status|getShardDistribution/, description: 'Verify shard distribution', required: true },
      ],
    },
    {
      objectiveId: 'obj-9-4',
      rules: [
        { pattern: /(addShard|sh\.addShard)/, description: 'Add new shard to cluster', required: true },
      ],
    },
  ],

  // Mission 10: Auto-HA Failover
  'mission-10': [
    {
      objectiveId: 'obj-10-1',
      rules: [
        { pattern: /(rs\.status|replSetGetStatus|members)/, description: 'Check replica set status', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-2',
      rules: [
        { pattern: /(retryWrites\s*=\s*false|retryReads\s*=\s*false|retryWrites=false)/, description: 'Configure without retry', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-3',
      rules: [
        { pattern: /(retryWrites\s*=\s*true|retryReads\s*=\s*true|retryWrites=true)/, description: 'Enable retryable writes/reads', required: true },
      ],
    },
    {
      objectiveId: 'obj-10-4',
      rules: [
        { pattern: /(rs\.status|replSetGetStatus|PRIMARY|SECONDARY)/, description: 'Verify failover recovery', required: true },
      ],
    },
  ],

  // Mission 11: Deployment Automation
  'mission-11': [
    {
      objectiveId: 'obj-11-1',
      rules: [
        { pattern: /(terraform|mongodbatlas_cluster|resource\s+")/, description: 'Define Terraform resource', required: true },
      ],
    },
    {
      objectiveId: 'obj-11-2',
      rules: [
        { pattern: /(provider_name|region_name|instance_size|electable_specs)/, description: 'Configure cluster specifications', required: true },
      ],
    },
    {
      objectiveId: 'obj-11-3',
      rules: [
        { pattern: /(terraform\s+(apply|plan|init))/, description: 'Run Terraform commands', required: true },
      ],
    },
  ],
};
