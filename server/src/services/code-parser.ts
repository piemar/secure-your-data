/**
 * Code Parser — safely parses MongoDB shell commands into structured driver calls.
 * NO eval(). Parses `db.collection.method(args)` into { collection, operation, args }.
 */

export interface ParsedCommand {
  collection: string;
  operation: string;
  args: unknown[];
  raw: string;
}

export interface ParseResult {
  commands: ParsedCommand[];
  errors: string[];
}

// Operations allowed for sandbox execution
const ALLOWED_OPERATIONS = new Set([
  // CRUD
  'insertOne', 'insertMany', 'find', 'findOne', 'updateOne', 'updateMany',
  'deleteOne', 'deleteMany', 'replaceOne', 'bulkWrite', 'countDocuments',
  'estimatedDocumentCount', 'distinct',
  // Index
  'createIndex', 'createIndexes', 'dropIndex', 'dropIndexes', 'listIndexes',
  // Aggregation
  'aggregate',
  // Collection management
  'drop', 'rename',
  // Explain
  'explain',
  // Watch (change streams)
  'watch',
]);

// Dangerous operations that are never allowed
const BLOCKED_PATTERNS = [
  /\beval\s*\(/,
  /\bdropDatabase\s*\(/,
  /\bdb\.dropDatabase/,
  /\bdb\.adminCommand/,
  /\bdb\.shutdownServer/,
  /\bdb\.currentOp/,
  /\$where/,
  /\bsystem\./,
  /\b__proto__\b/,
  /\bconstructor\b\s*\[/,
  /\bprocess\b/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\bglobal\b/,
];

/**
 * Parse a single line like: db.agents.insertOne({ name: "Bond", level: 5 })
 * Returns null if line is a comment, empty, or non-db command.
 */
function parseSingleCommand(line: string): ParsedCommand | null {
  const trimmed = line.trim();

  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
    return null;
  }

  // Match db.<collection>.<operation>(...)
  // Also handles chained methods like db.collection.find().sort().limit()
  const dbMatch = trimmed.match(/^db\.(\w+)\.(\w+)\s*\(([\s\S]*)\)$/);
  if (!dbMatch) return null;

  const [, collection, operation, argsStr] = dbMatch;
  return { collection, operation, args: [argsStr], raw: trimmed };
}

/**
 * Safely parse a JSON-like argument string from MongoDB shell syntax.
 * Handles: objects, arrays, strings, numbers, booleans, null, regex, Date, ObjectId.
 * Returns parsed value or the raw string if parsing fails.
 */
export function parseArgs(argsStr: string): unknown[] {
  if (!argsStr.trim()) return [];

  // Pre-process MongoDB shell helpers into JSON-safe representations
  let processed = argsStr
    // new Date(...) / ISODate(...)
    .replace(/new\s+Date\s*\(([^)]*)\)/g, (_, inner) => {
      return inner.trim() ? `"__DATE__${inner.replace(/['"]/g, '')}"` : `"__DATE__NOW"`;
    })
    .replace(/ISODate\s*\(([^)]*)\)/g, (_, inner) => {
      return inner.trim() ? `"__DATE__${inner.replace(/['"]/g, '')}"` : `"__DATE__NOW"`;
    })
    // ObjectId(...)
    .replace(/ObjectId\s*\(([^)]*)\)/g, (_, inner) => {
      return inner.trim() ? `"__OID__${inner.replace(/['"]/g, '')}"` : `"__OID__AUTO"`;
    })
    // NumberLong / NumberInt / NumberDecimal
    .replace(/NumberLong\s*\(([^)]*)\)/g, '$1')
    .replace(/NumberInt\s*\(([^)]*)\)/g, '$1')
    .replace(/NumberDecimal\s*\(([^)]*)\)/g, '"__DECIMAL__$1"')
    // Regex literals /pattern/flags
    .replace(/\/([^/]+)\/([gimsuy]*)/g, '"__REGEX__$1__FLAGS__$2"');

  try {
    // Wrap in array brackets for JSON parsing
    const json = JSON.parse(`[${processed}]`);
    return json;
  } catch {
    // If JSON parse fails, return raw string as single arg
    return [argsStr.trim()];
  }
}

/**
 * Parse multi-line MongoDB shell code into structured commands.
 */
export function parseCode(code: string): ParseResult {
  const errors: string[] = [];

  // Security check — block dangerous patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Blocked operation detected: ${pattern.source}`);
      return { commands: [], errors };
    }
  }

  const commands: ParsedCommand[] = [];

  // Handle multi-line statements by joining lines ending with common continuation chars
  const normalizedLines = normalizeMultiline(code);

  for (const line of normalizedLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Handle createCollection separately: db.createCollection("name", {...})
    const createCollMatch = trimmed.match(/^db\.createCollection\s*\(([\s\S]*)\)$/);
    if (createCollMatch) {
      commands.push({
        collection: '__db__',
        operation: 'createCollection',
        args: [createCollMatch[1]],
        raw: trimmed,
      });
      continue;
    }

    // Handle chained operations: db.coll.find({}).sort({}).limit(N)
    const chainMatch = trimmed.match(/^db\.(\w+)\.(\w+)\s*\(([\s\S]*?)\)((?:\.\w+\s*\([^)]*\))*)$/);
    if (chainMatch) {
      const [, collection, operation, argsStr, chainStr] = chainMatch;

      if (!ALLOWED_OPERATIONS.has(operation)) {
        errors.push(`Operation "${operation}" is not allowed in sandbox mode`);
        continue;
      }

      const chain: { method: string; args: string }[] = [];
      if (chainStr) {
        const chainRegex = /\.(\w+)\s*\(([^)]*)\)/g;
        let m;
        while ((m = chainRegex.exec(chainStr)) !== null) {
          chain.push({ method: m[1], args: m[2] });
        }
      }

      commands.push({
        collection,
        operation,
        args: [argsStr, ...(chain.length ? [JSON.stringify(chain)] : [])],
        raw: trimmed,
      });
      continue;
    }

    // Simple db.collection.operation(args)
    const parsed = parseSingleCommand(trimmed);
    if (parsed) {
      if (!ALLOWED_OPERATIONS.has(parsed.operation)) {
        errors.push(`Operation "${parsed.operation}" is not allowed in sandbox mode`);
        continue;
      }
      commands.push(parsed);
    }
    // Lines that don't match db.* pattern are silently skipped (comments, variable assignments, etc.)
  }

  return { commands, errors };
}

/**
 * Normalize multi-line code by joining continuation lines.
 * Handles statements that span multiple lines (e.g., aggregation pipelines).
 */
function normalizeMultiline(code: string): string[] {
  const lines = code.split('\n');
  const result: string[] = [];
  let buffer = '';
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
      if (!buffer) {
        result.push(trimmed);
        continue;
      }
    }

    buffer += (buffer ? ' ' : '') + trimmed;

    // Count brackets to determine if statement is complete
    for (const char of trimmed) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
      if (char === '[') bracketDepth++;
      if (char === ']') bracketDepth--;
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }

    if (braceDepth <= 0 && bracketDepth <= 0 && parenDepth <= 0) {
      result.push(buffer);
      buffer = '';
      braceDepth = 0;
      bracketDepth = 0;
      parenDepth = 0;
    }
  }

  if (buffer) result.push(buffer);
  return result;
}

/**
 * Validate that code is safe for sandbox execution.
 * Returns list of error messages (empty = safe).
 */
export function validateCodeSafety(code: string): string[] {
  const errors: string[] = [];
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }
  return errors;
}
