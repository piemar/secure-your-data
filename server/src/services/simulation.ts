/**
 * Simulation Engine — Tier 3 mock responses for infrastructure commands.
 * Returns realistic output for sharding, replica set, and cloud-only operations
 * without requiring actual cluster infrastructure.
 */

export interface SimulatedResponse {
  command: string;
  output: unknown;
  simulated: true;
  message: string;
}

type SimulationHandler = (code: string) => SimulatedResponse | null;

const simulationHandlers: SimulationHandler[] = [
  // ===== sh.status() =====
  (code) => {
    if (!/sh\.status\s*\(/.test(code)) return null;
    return {
      command: 'sh.status()',
      simulated: true,
      message: 'Simulated sharded cluster status',
      output: {
        shardingVersion: { _id: 1, minCompatibleVersion: 5, currentVersion: 6 },
        shards: [
          { _id: 'rs0', host: 'rs0/mongo-rs0-0:27017,mongo-rs0-1:27017,mongo-rs0-2:27017', state: 1 },
          { _id: 'rs1', host: 'rs1/mongo-rs1-0:27017,mongo-rs1-1:27017,mongo-rs1-2:27017', state: 1 },
          { _id: 'rs2', host: 'rs2/mongo-rs2-0:27017,mongo-rs2-1:27017,mongo-rs2-2:27017', state: 1 },
        ],
        databases: [
          { _id: 'admin', primary: 'config', partitioned: false },
          {
            _id: 'operations',
            primary: 'rs0',
            partitioned: true,
            collections: {
              'operations.events': {
                shardKey: { region: 1, timestamp: 1 },
                unique: false,
                chunks: [
                  { shard: 'rs0', chunks: 45 },
                  { shard: 'rs1', chunks: 12 },
                  { shard: 'rs2', chunks: 8 },
                ],
                totalChunks: 65,
                balancerStatus: 'imbalanced',
              },
            },
          },
        ],
        balancer: { enabled: true, running: false, lastMigration: '2024-06-15T08:30:00Z' },
      },
    };
  },

  // ===== sh.moveChunk / moveRange =====
  (code) => {
    if (!/sh\.moveChunk|moveChunk|moveRange/.test(code)) return null;
    return {
      command: 'sh.moveChunk()',
      simulated: true,
      message: 'Simulated chunk migration',
      output: {
        ok: 1,
        millis: 3420,
        moved: { from: 'rs0', to: 'rs2', chunkSize: '64MB' },
      },
    };
  },

  // ===== sh.shardCollection =====
  (code) => {
    if (!/sh\.shardCollection|shardCollection/.test(code)) return null;
    return {
      command: 'sh.shardCollection()',
      simulated: true,
      message: 'Simulated shard collection',
      output: {
        ok: 1,
        collectionsharded: 'operations.events',
        collectionUUID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
    };
  },

  // ===== sh.addShard =====
  (code) => {
    if (!/sh\.addShard|addShard/.test(code)) return null;
    return {
      command: 'sh.addShard()',
      simulated: true,
      message: 'Simulated add shard',
      output: {
        ok: 1,
        shardAdded: 'rs3',
        host: 'rs3/mongo-rs3-0:27017,mongo-rs3-1:27017,mongo-rs3-2:27017',
      },
    };
  },

  // ===== rs.status() =====
  (code) => {
    if (!/rs\.status\s*\(|replSetGetStatus/.test(code)) return null;
    return {
      command: 'rs.status()',
      simulated: true,
      message: 'Simulated replica set status',
      output: {
        set: 'rs0',
        date: new Date().toISOString(),
        myState: 1,
        members: [
          { _id: 0, name: 'mongo-rs0-0:27017', stateStr: 'PRIMARY', health: 1, uptime: 86400, optime: { ts: '7300000000000', t: 1 } },
          { _id: 1, name: 'mongo-rs0-1:27017', stateStr: 'SECONDARY', health: 1, uptime: 86350, syncSourceHost: 'mongo-rs0-0:27017' },
          { _id: 2, name: 'mongo-rs0-2:27017', stateStr: 'SECONDARY', health: 1, uptime: 86300, syncSourceHost: 'mongo-rs0-0:27017' },
        ],
        ok: 1,
      },
    };
  },

  // ===== getShardDistribution =====
  (code) => {
    if (!/getShardDistribution/.test(code)) return null;
    return {
      command: 'db.collection.getShardDistribution()',
      simulated: true,
      message: 'Simulated shard distribution',
      output: {
        'Shard rs0': { data: '4.2GB', docs: 3200000, chunks: 45, 'estimated data per chunk': '95MB', 'estimated docs per chunk': 71111 },
        'Shard rs1': { data: '1.1GB', docs: 850000, chunks: 12, 'estimated data per chunk': '93MB', 'estimated docs per chunk': 70833 },
        'Shard rs2': { data: '0.7GB', docs: 520000, chunks: 8, 'estimated data per chunk': '87MB', 'estimated docs per chunk': 65000 },
        totals: { data: '6.0GB', docs: 4570000, chunks: 65 },
      },
    };
  },

  // ===== serverStatus / connPoolStats =====
  (code) => {
    if (!/serverStatus|connPoolStats/.test(code)) return null;
    return {
      command: 'db.serverStatus()',
      simulated: true,
      message: 'Simulated server status',
      output: {
        connections: { current: 847, available: 51153, totalCreated: 12453, active: 234, exhaustIsMaster: 0 },
        network: { bytesIn: 1024000000, bytesOut: 2048000000, numRequests: 5600000 },
        opcounters: { insert: 120000, query: 3400000, update: 890000, delete: 45000 },
        mem: { resident: 2048, virtual: 4096, mapped: 0 },
      },
    };
  },

  // ===== $search / Atlas Search =====
  (code) => {
    if (!/\$search(?!Meta)/.test(code)) return null;
    return {
      command: '$search (Atlas Search)',
      simulated: true,
      message: 'Simulated Atlas Search result — requires Atlas for real execution',
      output: {
        results: [
          { _id: 'doc_001', score: 9.8, title: 'Intelligence Report Alpha', highlight: 'Found <em>matching</em> terms' },
          { _id: 'doc_002', score: 8.5, title: 'Surveillance Log Beta', highlight: 'Partial <em>fuzzy</em> match' },
          { _id: 'doc_003', score: 7.2, title: 'Operation Summary Gamma', highlight: 'Related <em>terms</em> found' },
        ],
        count: { lowerBound: 3 },
      },
    };
  },

  // ===== $searchMeta / facets =====
  (code) => {
    if (!/\$searchMeta/.test(code)) return null;
    return {
      command: '$searchMeta (Atlas Search Facets)',
      simulated: true,
      message: 'Simulated Atlas Search faceted results',
      output: {
        count: { lowerBound: 1250 },
        facet: {
          classification: { buckets: [{ _id: 'SECRET', count: 450 }, { _id: 'TOP_SECRET', count: 300 }, { _id: 'CONFIDENTIAL', count: 500 }] },
          source: { buckets: [{ _id: 'HUMINT', count: 400 }, { _id: 'SIGINT', count: 350 }, { _id: 'OSINT', count: 500 }] },
        },
      },
    };
  },

  // ===== $vectorSearch =====
  (code) => {
    if (!/\$vectorSearch/.test(code)) return null;
    return {
      command: '$vectorSearch (Atlas Vector Search)',
      simulated: true,
      message: 'Simulated Atlas Vector Search — requires Atlas for real execution',
      output: {
        results: [
          { _id: 'vec_001', score: 0.95, title: 'Operation Nightfall Brief', semanticMatch: 'High similarity' },
          { _id: 'vec_002', score: 0.87, title: 'Agent Deployment Protocol', semanticMatch: 'Strong semantic overlap' },
          { _id: 'vec_003', score: 0.79, title: 'Extraction Guidelines v3', semanticMatch: 'Contextually related' },
        ],
      },
    };
  },

  // ===== CSFLE / ClientEncryption =====
  (code) => {
    if (!/ClientEncryption|createDataKey|autoEncryption/.test(code)) return null;
    return {
      command: 'ClientEncryption (CSFLE)',
      simulated: true,
      message: 'Simulated CSFLE — requires MongoDB Enterprise or Atlas + KMS for real execution',
      output: {
        keyVault: '__keyVault.dataKeys',
        dataKeyId: 'UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")',
        encryptedFieldResult: 'BinData(6, "encrypted-payload-base64...")',
        decryptedResult: { ssn: '123-45-6789', name: 'Agent Smith' },
        note: 'In a real environment, the encrypted field would show BinData(6,...) when queried without the encryption key.',
      },
    };
  },

  // ===== Terraform =====
  (code) => {
    if (!/terraform\s+(apply|plan|init)/.test(code)) return null;
    return {
      command: 'terraform (Atlas IaC)',
      simulated: true,
      message: 'Simulated Terraform execution — requires Terraform CLI + Atlas API key for real execution',
      output: {
        action: code.includes('init') ? 'init' : code.includes('plan') ? 'plan' : 'apply',
        resources: [
          { type: 'mongodbatlas_cluster', name: 'production', action: 'create', status: 'planned' },
        ],
        summary: 'Plan: 1 to add, 0 to change, 0 to destroy.',
      },
    };
  },
];

/**
 * Try to simulate a response for the given code.
 * Returns all matching simulated responses, or empty array if none match.
 */
export function simulateCommand(code: string): SimulatedResponse[] {
  const results: SimulatedResponse[] = [];
  for (const handler of simulationHandlers) {
    const result = handler(code);
    if (result) results.push(result);
  }
  return results;
}

/**
 * Check if a piece of code contains commands that require simulation (Tier 3).
 */
export function requiresSimulation(code: string): boolean {
  return simulationHandlers.some(handler => handler(code) !== null);
}

export type { ValidationTier } from '../config/mission-tiers.js';
export { MISSION_TIERS } from '../config/mission-tiers.js';
