import { MongoClient } from 'mongodb';
import { executeCode } from './code-executor.js';
import { parseCode, validateCodeSafety } from './code-parser.js';
import { simulateCommand } from './simulation.js';

let atlasClient: MongoClient | null = null;

const READ_ONLY_OPS = new Set([
  'find',
  'findOne',
  'countDocuments',
  'estimatedDocumentCount',
  'distinct',
  'aggregate',
  'listIndexes',
  'explain',
]);

function isAtlasProxyEnabled(): boolean {
  return process.env.ATLAS_PROXY_ENABLED === 'true' && !!process.env.ATLAS_PROXY_URI;
}

async function getAtlasClient(): Promise<MongoClient> {
  const uri = process.env.ATLAS_PROXY_URI;
  if (!uri) throw new Error('ATLAS_PROXY_URI not configured');
  if (!atlasClient) {
    atlasClient = new MongoClient(uri, { maxPoolSize: 10, minPoolSize: 1 });
    await atlasClient.connect();
  }
  return atlasClient;
}

export interface AtlasProxyResult {
  tier: 'simulate' | 'proxy';
  success: boolean;
  output: Array<{ command: string; result: unknown; error?: string; timeMs?: number; simulated?: boolean; message?: string }>;
  message?: string;
  executionTimeMs?: number;
}

export async function runAtlasProxy(
  code: string,
  opts?: { dbName?: string; allowWrites?: boolean }
): Promise<AtlasProxyResult> {
  const sim = simulateCommand(code);
  if (!isAtlasProxyEnabled()) {
    return {
      tier: 'simulate',
      success: sim.length > 0,
      output: sim.map(item => ({
        command: item.command,
        result: item.output,
        simulated: true,
        message: item.message,
      })),
      message: 'Atlas proxy disabled — returning simulated cloud output',
    };
  }

  const safetyErrors = validateCodeSafety(code);
  if (safetyErrors.length > 0) {
    return {
      tier: 'proxy',
      success: false,
      output: [],
      message: `Blocked by safety policy: ${safetyErrors.join('; ')}`,
    };
  }

  const parsed = parseCode(code);
  if (parsed.errors.length > 0) {
    return {
      tier: 'proxy',
      success: false,
      output: [],
      message: `Parse errors: ${parsed.errors.join('; ')}`,
    };
  }

  const allowWrites = opts?.allowWrites === true;
  if (!allowWrites) {
    const illegal = parsed.commands.find(cmd => !READ_ONLY_OPS.has(cmd.operation));
    if (illegal) {
      return {
        tier: 'proxy',
        success: false,
        output: [],
        message: `Operation ${illegal.operation} is blocked in Atlas proxy read-only mode`,
      };
    }
  }

  const dbName = opts?.dbName || process.env.ATLAS_PROXY_DB_NAME || 'admin';
  const client = await getAtlasClient();
  const db = client.db(dbName);
  const exec = await executeCode(db, code);

  return {
    tier: 'proxy',
    success: exec.success,
    output: exec.output,
    message: exec.error || 'Atlas proxy execution completed',
    executionTimeMs: exec.executionTimeMs,
  };
}

export async function closeAtlasProxy(): Promise<void> {
  if (atlasClient) {
    await atlasClient.close();
    atlasClient = null;
  }
}
