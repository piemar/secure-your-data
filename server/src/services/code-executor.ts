/**
 * Code Executor — executes parsed MongoDB commands against a sandbox database.
 * Uses the official MongoDB driver programmatically — NO eval().
 * Enforces 5-second timeout per command and 15-second total timeout.
 */

import { Db, Document, FindCursor } from 'mongodb';
import { parseCode, parseArgs, ParsedCommand } from './code-parser.js';

export interface ExecutionResult {
  success: boolean;
  output: CommandOutput[];
  error?: string;
  executionTimeMs: number;
}

export interface CommandOutput {
  command: string;
  result: unknown;
  error?: string;
  timeMs: number;
}

const COMMAND_TIMEOUT_MS = 5000;
const TOTAL_TIMEOUT_MS = 15000;

/**
 * Execute user code against a sandbox database.
 */
export async function executeCode(db: Db, code: string): Promise<ExecutionResult> {
  const start = Date.now();
  const parseResult = parseCode(code);

  if (parseResult.errors.length > 0) {
    return {
      success: false,
      output: [],
      error: `Parse errors: ${parseResult.errors.join('; ')}`,
      executionTimeMs: Date.now() - start,
    };
  }

  if (parseResult.commands.length === 0) {
    return {
      success: false,
      output: [],
      error: 'No executable MongoDB commands found in the submitted code.',
      executionTimeMs: Date.now() - start,
    };
  }

  const outputs: CommandOutput[] = [];

  for (const cmd of parseResult.commands) {
    if (Date.now() - start > TOTAL_TIMEOUT_MS) {
      return {
        success: false,
        output: outputs,
        error: `Total execution timeout exceeded (${TOTAL_TIMEOUT_MS}ms)`,
        executionTimeMs: Date.now() - start,
      };
    }

    const cmdOutput = await executeCommand(db, cmd);
    outputs.push(cmdOutput);

    if (cmdOutput.error) {
      return {
        success: false,
        output: outputs,
        error: cmdOutput.error,
        executionTimeMs: Date.now() - start,
      };
    }
  }

  return {
    success: true,
    output: outputs,
    executionTimeMs: Date.now() - start,
  };
}

/**
 * Execute a single parsed command against the database.
 */
async function executeCommand(db: Db, cmd: ParsedCommand): Promise<CommandOutput> {
  const cmdStart = Date.now();

  try {
    const result = await withTimeout(
      runCommand(db, cmd),
      COMMAND_TIMEOUT_MS,
      `Command timed out after ${COMMAND_TIMEOUT_MS}ms: ${cmd.raw}`
    );

    return {
      command: cmd.raw,
      result: sanitizeResult(result),
      timeMs: Date.now() - cmdStart,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      command: cmd.raw,
      result: null,
      error: message,
      timeMs: Date.now() - cmdStart,
    };
  }
}

/**
 * Map a parsed command to an actual MongoDB driver call.
 */
async function runCommand(db: Db, cmd: ParsedCommand): Promise<unknown> {
  // Handle db-level operations
  if (cmd.collection === '__db__') {
    return runDbCommand(db, cmd);
  }

  const collection = db.collection(cmd.collection);
  const args = parseArgs(cmd.args[0] as string);
  const chainOps = cmd.args[1] ? JSON.parse(cmd.args[1] as string) : [];

  // Restore special types
  const processedArgs = args.map(processSpecialTypes);

  switch (cmd.operation) {
    // CRUD
    case 'insertOne':
      return collection.insertOne(processedArgs[0] as Document);

    case 'insertMany':
      return collection.insertMany(processedArgs[0] as Document[]);

    case 'find': {
      let cursor: FindCursor = collection.find(
        (processedArgs[0] as Document) || {},
        processedArgs[1] ? { projection: processedArgs[1] as Document } : undefined
      );
      // Apply chain operations (sort, limit, skip)
      for (const chain of chainOps) {
        const chainArgs = parseArgs(chain.args);
        switch (chain.method) {
          case 'sort':
            cursor = cursor.sort(chainArgs[0] as Document);
            break;
          case 'limit':
            cursor = cursor.limit(chainArgs[0] as number);
            break;
          case 'skip':
            cursor = cursor.skip(chainArgs[0] as number);
            break;
          case 'explain':
            return cursor.explain(chainArgs[0] as string || 'executionStats');
        }
      }
      return cursor.limit(100).toArray();
    }

    case 'findOne':
      return collection.findOne(
        (processedArgs[0] as Document) || {},
        processedArgs[1] ? { projection: processedArgs[1] as Document } : undefined
      );

    case 'updateOne':
      return collection.updateOne(
        processedArgs[0] as Document,
        processedArgs[1] as Document,
        processedArgs[2] as Document
      );

    case 'updateMany':
      return collection.updateMany(
        processedArgs[0] as Document,
        processedArgs[1] as Document,
        processedArgs[2] as Document
      );

    case 'deleteOne':
      return collection.deleteOne(processedArgs[0] as Document);

    case 'deleteMany':
      return collection.deleteMany(processedArgs[0] as Document);

    case 'replaceOne':
      return collection.replaceOne(
        processedArgs[0] as Document,
        processedArgs[1] as Document
      );

    case 'countDocuments':
      return collection.countDocuments(processedArgs[0] as Document || {});

    case 'distinct':
      return collection.distinct(
        processedArgs[0] as string,
        processedArgs[1] as Document || {}
      );

    // Index operations
    case 'createIndex':
      return collection.createIndex(
        processedArgs[0] as Document,
        processedArgs[1] as Document
      );

    case 'createIndexes':
      return collection.createIndexes(processedArgs[0] as Array<{ key: Document; name?: string }>);

    case 'dropIndex':
      return collection.dropIndex(processedArgs[0] as string);

    case 'dropIndexes':
      return collection.dropIndexes();

    case 'listIndexes':
      return collection.listIndexes().toArray();

    // Aggregation
    case 'aggregate': {
      const pipeline = processedArgs[0] as Document[];
      const options = processedArgs[1] as Document || {};
      return collection.aggregate(pipeline, { ...options, allowDiskUse: true }).toArray();
    }

    // Explain
    case 'explain': {
      const explainArgs = parseArgs(cmd.args[0] as string);
      // db.collection.explain().find(...)
      return collection.find(explainArgs[0] as Document || {}).explain('executionStats');
    }

    // Watch (change streams) — return acknowledgment, don't keep stream open
    case 'watch':
      return { acknowledged: true, message: 'Change stream opened (sandbox mode — auto-closed)' };

    // Collection management
    case 'drop':
      return collection.drop().catch(() => false);

    default:
      throw new Error(`Unsupported operation: ${cmd.operation}`);
  }
}

/**
 * Handle db-level commands (createCollection, etc.)
 */
async function runDbCommand(db: Db, cmd: ParsedCommand): Promise<unknown> {
  const args = parseArgs(cmd.args[0] as string);

  switch (cmd.operation) {
    case 'createCollection': {
      const name = args[0] as string;
      const options = (args[1] as Document) || {};
      return db.createCollection(name, options);
    }
    default:
      throw new Error(`Unsupported db-level operation: ${cmd.operation}`);
  }
}

/**
 * Process special type markers back into real values.
 */
function processSpecialTypes(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value === '__DATE__NOW') return new Date();
    if (value.startsWith('__DATE__')) return new Date(value.slice(8));
    if (value === '__OID__AUTO') return undefined; // Let MongoDB generate
    if (value.startsWith('__OID__')) return value.slice(6); // Use as string ID
    if (value.startsWith('__DECIMAL__')) return parseFloat(value.slice(11));
    if (value.startsWith('__REGEX__')) {
      const parts = value.split('__FLAGS__');
      return new RegExp(parts[0].slice(9), parts[1] || '');
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(processSpecialTypes);
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = processSpecialTypes(v);
    }
    return result;
  }

  return value;
}

/**
 * Sanitize result for JSON serialization (handle BigInt, Binary, ObjectId, etc.)
 */
function sanitizeResult(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[nested]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'function') return undefined;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();

  if (typeof value === 'object' && 'toHexString' in (value as Record<string, unknown>)) {
    return (value as { toHexString: () => string }).toHexString();
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map(v => sanitizeResult(v, depth + 1));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = sanitizeResult(v, depth + 1);
    }
    return result;
  }

  return value;
}

/**
 * Promise with timeout wrapper.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then(value => { clearTimeout(timer); resolve(value); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}
