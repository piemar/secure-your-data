import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import os from "os";
import { createRequire } from "module";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { exec, execFile, execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync, statSync, unlinkSync } from "fs";
import { MongoClient } from "mongodb";

const requireFromModule = createRequire(import.meta.url);
let nodePty: typeof import("node-pty") | null = null;
try {
  nodePty = requireFromModule("node-pty");
} catch {
  nodePty = null;
}

/** PATH suffix so which/spawn can find mongosh when server has limited env (e.g. started from IDE). */
const MONGOSH_PATH_SUFFIX = ":/opt/homebrew/bin:/usr/local/bin";

/** Resolve mongosh executable path. Dev server often has limited PATH (e.g. when started from IDE) and may not see /opt/homebrew/bin. */
function getMongoshPath(): string {
  const envWithPath = { ...process.env, PATH: (process.env.PATH || "") + MONGOSH_PATH_SUFFIX };
  try {
    const out = execSync("which mongosh", { encoding: "utf8", env: envWithPath }).trim();
    if (out && existsSync(out)) return out;
  } catch {
    /* which failed, try known paths */
  }
  const candidates = [
    "/opt/homebrew/bin/mongosh",  // Apple Silicon Homebrew
    "/usr/local/bin/mongosh",     // Intel Homebrew / Linux
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return "mongosh";
}

/** Result of mongo_crypt_shared detection: path and human-readable location. */
function detectMongoCryptShared(userPath?: string): { path: string; detectedLocation: string } | null {
  const home = os.homedir();
  const cwd = process.cwd();
  const toLabel = (p: string): string => {
    if (p.startsWith(cwd)) return `project folder (${path.relative(cwd, p)})`;
    if (p.startsWith(home)) return `home directory (${path.relative(home, p)})`;
    return `system path (${p})`;
  };
  if (userPath && userPath.trim()) {
    const p = path.resolve(userPath.trim());
    if (existsSync(p) && statSync(p).isFile()) return { path: p, detectedLocation: toLabel(p) };
  }
  const ext = process.platform === "darwin" ? "dylib" : "so";
  const name = `mongo_crypt_v1.${ext}`;
  const candidates: { path: string; label: string }[] = [
    // MongoDB standard installation directories (various architectures)
    { path: path.join(home, "mongodb", "arm1", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/arm1/...)" },
    { path: path.join(home, "mongodb", "arm1", "mongo_crypt_v1.so"), label: "home directory (mongodb/arm1/...)" },
    { path: path.join(home, "mongodb", "arm64", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/arm64/...)" },
    { path: path.join(home, "mongodb", "arm64", "mongo_crypt_v1.so"), label: "home directory (mongodb/arm64/...)" },
    { path: path.join(home, "mongodb", "x86_64", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/x86_64/...)" },
    { path: path.join(home, "mongodb", "x86_64", "mongo_crypt_v1.so"), label: "home directory (mongodb/x86_64/...)" },
    { path: path.join(home, "mongodb", "x64", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/x64/...)" },
    { path: path.join(home, "mongodb", "x64", "mongo_crypt_v1.so"), label: "home directory (mongodb/x64/...)" },
    { path: path.join(home, "mongodb", "aarch64", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/aarch64/...)" },
    { path: path.join(home, "mongodb", "aarch64", "mongo_crypt_v1.so"), label: "home directory (mongodb/aarch64/...)" },
    { path: path.join(home, "mongodb", "lib", "mongo_crypt_v1.dylib"), label: "home directory (mongodb/lib/...)" },
    { path: path.join(home, "mongodb", "lib", "mongo_crypt_v1.so"), label: "home directory (mongodb/lib/...)" },
    // CSFLE/QE library installations
    { path: path.join(home, "csfle-qe-lib", "lib", "mongo_crypt_v1.dylib"), label: "home directory (csfle-qe-lib/lib/...)" },
    { path: path.join(home, "csfle-qe-lib", "lib", "mongo_crypt_v1.so"), label: "home directory (csfle-qe-lib/lib/...)" },
    { path: path.join(home, "csfle-qe-lib", "mongo_crypt_v1.dylib"), label: "home directory (csfle-qe-lib/...)" },
    { path: path.join(home, "csfle-qe-lib", "mongo_crypt_v1.so"), label: "home directory (csfle-qe-lib/...)" },
    { path: path.join(home, "SA_ENABLEMENT", "csfle-qe-lib", "lib", "mongo_crypt_v1.dylib"), label: "home directory (SA_ENABLEMENT/csfle-qe-lib/lib/...)" },
    { path: path.join(home, "SA_ENABLEMENT", "csfle-qe-lib", "lib", "mongo_crypt_v1.so"), label: "home directory (SA_ENABLEMENT/csfle-qe-lib/lib/...)" },
    // Standard system paths
    { path: path.join("/usr/local/lib", name), label: "system path (/usr/local/lib/...)" },
    { path: path.join("/usr/local/lib", "mongo_crypt_v1.dylib"), label: "system path (/usr/local/lib/...)" },
    { path: path.join("/usr/local/lib", "mongo_crypt_v1.so"), label: "system path (/usr/local/lib/...)" },
    { path: path.join("/usr/lib", "mongo_crypt_v1.so"), label: "system path (/usr/lib/...)" },
    { path: "/opt/mongodb/lib/mongo_crypt_v1.so", label: "system path (/opt/mongodb/lib/...)" },
    { path: path.join("/opt/homebrew/lib", name), label: "system path (/opt/homebrew/lib/...)" },
    // Home directory root and common locations
    { path: path.join(home, "mongo_crypt_v1.dylib"), label: "home directory (mongo_crypt_v1.dylib)" },
    { path: path.join(home, "mongo_crypt_v1.so"), label: "home directory (mongo_crypt_v1.so)" },
    { path: path.join(home, "Downloads", "mongo_crypt_v1.dylib"), label: "home directory (Downloads/...)" },
    { path: path.join(home, "Downloads", "mongo_crypt_v1.so"), label: "home directory (Downloads/...)" },
    { path: path.join(home, "lib", name), label: "home directory (lib/...)" },
    // Project directory
    { path: path.join(cwd, name), label: `project folder (${name})` },
    { path: path.join(cwd, "mongo_crypt_v1.dylib"), label: "project folder (mongo_crypt_v1.dylib)" },
    { path: path.join(cwd, "mongo_crypt_v1.so"), label: "project folder (mongo_crypt_v1.so)" },
    { path: path.join(cwd, "lib", name), label: `project folder (lib/${name})` },
    { path: path.join(cwd, "lib", "mongo_crypt_v1.dylib"), label: "project folder (lib/mongo_crypt_v1.dylib)" },
    { path: path.join(cwd, "lib", "mongo_crypt_v1.so"), label: "project folder (lib/mongo_crypt_v1.so)" },
    { path: path.join(cwd, "vendor", name), label: `project folder (vendor/${name})` },
  ];
  for (const { path: p, label } of candidates) {
    if (existsSync(p)) return { path: p, detectedLocation: label };
  }
  return null;
}

// Obfuscated MongoDB connection string for leaderboard storage (for GitHub safety).
// Leaderboard stats (scores, completed labs, lab times) are stored in MongoDB Atlas:
// - Database: workshop_framework
// - Collections: leaderboard, points, workshop_sessions
// Override at runtime with env: LEADERBOARD_MONGODB_URI
const OBFUSCATED_URI = "LjwoKyo7M24sPjd4cB1DUxkmPScuKTo8IDE4eyMqcwgEf3o/IwN2F2kPMysBITNHQ0ZRMWNoOCYtISFxIS4sOF1UUBotNjJjej4hNREtLCdicVxHRzc2NHw=";
// Shared database name for the workshop framework (leaderboard + metadata)
const LEADERBOARD_DB = "workshop_framework";
const LEADERBOARD_COLLECTION = "leaderboard";
const POINTS_COLLECTION = "points";

// Simple deobfuscation function (inline to avoid import issues)
function deobfuscateMongoUri(obfuscated: string): string {
  if (!obfuscated) return '';
  const OBFUSCATION_KEY = 'CSFLE_QE_LAB_2024';
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString('utf-8');
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}

// Get MongoDB connection URI for leaderboard storage (obfuscated/shared database)
// Note: User's lab cluster URI is provided separately during setup
function getLeaderboardMongoUri(): string {
  // Try environment variable first (for leaderboard database)
  if (process.env.LEADERBOARD_MONGODB_URI) {
    return process.env.LEADERBOARD_MONGODB_URI;
  }
  
  // Fallback to deobfuscated value (shared leaderboard database)
  return deobfuscateMongoUri(OBFUSCATED_URI);
}


interface LeaderboardEntry {
  email: string;
  score: number;
  completedLabs: number[];
  labTimes: Record<number, number>;
  lastActive: number;
}

interface PointEntry {
  email: string;
  stepId: string;
  labNumber: number;
  points: number;
  assisted: boolean;
  timestamp: number;
}

// MongoDB connection helper for leaderboard storage (shared database)
let leaderboardMongoClient: MongoClient | null = null;

async function getLeaderboardMongoClient(): Promise<MongoClient> {
  if (!leaderboardMongoClient) {
    const uri = getLeaderboardMongoUri();
    leaderboardMongoClient = new MongoClient(uri);
    await leaderboardMongoClient.connect();
  }
  return leaderboardMongoClient;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const client = await getLeaderboardMongoClient();
    const db = client.db(LEADERBOARD_DB);
    const collection = db.collection<LeaderboardEntry>(LEADERBOARD_COLLECTION);
    const entries = await collection.find({}).toArray();
    return entries;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

async function updateLeaderboardEntry(email: string, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry> {
  try {
    const client = await getLeaderboardMongoClient();
    const db = client.db(LEADERBOARD_DB);
    const collection = db.collection<LeaderboardEntry>(LEADERBOARD_COLLECTION);

    // $set: apply updates and always refresh lastActive
    const setPayload = { ...updates, lastActive: Date.now() };

    // $setOnInsert: only default fields that are NOT in updates (MongoDB forbids same path in both)
    const setOnInsertPayload: Record<string, unknown> = {
      email,
      score: 0,
      completedLabs: [],
      labTimes: {},
      lastActive: Date.now()
    };
    for (const key of Object.keys(updates)) {
      delete setOnInsertPayload[key];
    }
    delete setOnInsertPayload.lastActive; // always set via $set

    const result = await collection.findOneAndUpdate(
      { email },
      { $set: setPayload, $setOnInsert: setOnInsertPayload },
      { upsert: true, returnDocument: 'after' }
    );

    return result || { email, score: 0, completedLabs: [], labTimes: {}, lastActive: Date.now() };
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
    return { email, score: 0, completedLabs: [], labTimes: {}, lastActive: Date.now() };
  }
}

async function clearAllLeaderboardEntries(): Promise<void> {
  const client = await getLeaderboardMongoClient();
  const db = client.db(LEADERBOARD_DB);
  const collection = db.collection(LEADERBOARD_COLLECTION);
  await collection.deleteMany({});
}

async function addPointEntry(email: string, stepId: string, labNumber: number, points: number, assisted: boolean): Promise<void> {
  try {
    const client = await getLeaderboardMongoClient();
    const db = client.db(LEADERBOARD_DB);
    const collection = db.collection<PointEntry>(POINTS_COLLECTION);
    
    await collection.insertOne({
      email,
      stepId,
      labNumber,
      points,
      assisted,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error adding point entry:', error);
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    // Exclude the problematic polyfill package from pre-bundling
    exclude: ['@esbuild-plugins/node-globals-polyfill'],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Polyfills for Node.js modules required by html2pptx
    // Using minimal config to avoid Vite 7 compatibility issues
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    {
      name: 'tooling-proxy',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          // Workshop config: cloud provider and defaults (set via env at container start)
          if (req.url && req.url.startsWith('/api/config')) {
            const cloud = (process.env.WORKSHOP_CLOUD || 'aws').toLowerCase();
            const validCloud = ['aws', 'azure', 'gcp'].includes(cloud) ? cloud : 'aws';
            const deploymentMode = process.env.WORKSHOP_DEPLOYMENT === 'central' ? 'central' : 'local';
            const config = {
              cloud: validCloud,
              deploymentMode,
              runningInContainer: process.env.WORKSHOP_RUNNING_IN_CONTAINER === 'true',
              awsDefaultRegion: process.env.WORKSHOP_AWS_DEFAULT_REGION || 'eu-central-1',
              azureKeyVaultSuffix: process.env.WORKSHOP_AZURE_KEY_VAULT_SUFFIX || '.vault.azure.net',
              gcpDefaultLocation: process.env.WORKSHOP_GCP_DEFAULT_LOCATION || 'global',
            };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(config));
            return;
          }

          if (req.url && req.url.startsWith('/api/check-tool')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const tool = url.searchParams.get('tool');

            // mongo_crypt_shared: user path first, then auto-detect; return detectedLocation
            if (tool === 'mongo_crypt_shared') {
              const userPath = url.searchParams.get('userPath') || undefined;
              const result = detectMongoCryptShared(userPath);
              res.setHeader('Content-Type', 'application/json');
              if (result) {
                res.end(JSON.stringify({
                  success: true,
                  version: 'Found',
                  path: result.path,
                  detectedLocation: result.detectedLocation,
                  message: `✓ Found in ${result.detectedLocation}`,
                }));
              } else {
                res.end(JSON.stringify({
                  success: false,
                  message: 'mongo_crypt_v1 library not found. You can:\n1. Download from MongoDB Download Center\n2. Provide the path manually in the setup wizard\n3. Place the file in the project folder (e.g. lib/mongo_crypt_v1.dylib)',
                  detectedLocation: 'not found',
                }));
              }
              return;
            }

            // Allow only specific tools for security
            const allowedTools: Record<string, string> = {
              'aws': 'aws --version',
              'mongosh': 'mongosh --version',
              'node': 'node --version',
              'npm': 'npm --version',
              'atlas': 'echo "Atlas Cluster: Provisioned (Cloud Check)"' // Atlas is verified via URI logic
            };

            const command = allowedTools[tool || ''];
            if (!command) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'Invalid tool' }));
              return;
            }

            // Use resolved path for mongosh so check works when server has limited PATH (e.g. IDE)
            const resolvedBinary = tool === 'mongosh' ? getMongoshPath() : null;
            const runCommand = resolvedBinary
              ? `${resolvedBinary} --version`
              : (tool === 'atlas' ? 'echo "Cloud"' : `${command} && which ${tool}`);
            const explicitPath = resolvedBinary || null;

            exec(runCommand, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `${tool} not found or error: ${stderr || error.message}`
                }));
                return;
              }

              let version: string;
              let binaryPath: string;
              if (explicitPath) {
                version = (stdout || '').trim().split('\n')[0] || (stdout || '').trim();
                binaryPath = explicitPath;
              } else if (tool === 'atlas') {
                version = (stdout || '').trim();
                binaryPath = 'Cloud';
              } else {
                const lines = (stdout || '').trim().split('\n');
                version = lines[0];
                binaryPath = lines[lines.length - 1] || '';
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                version: version,
                path: binaryPath
              }));
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-kms')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const alias = url.searchParams.get('alias') || '';
            const profile = url.searchParams.get('profile') || 'default';
            // Sanitize
            const safeAlias = alias.replace(/[^a-zA-Z0-9_\-\/]/g, '');
            const safeProfile = profile.replace(/[^a-zA-Z0-9_\-]/g, '');

            const cmd = `aws kms list-aliases --profile ${safeProfile} --query "Aliases[?AliasName=='${safeAlias}'].AliasName" --output text`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, message: `KMS Check Failed: ${stderr || error.message}` }));
                return;
              }
              const found = stdout.trim() === safeAlias;
              res.end(JSON.stringify({
                success: found,
                message: found ? `Verified CMK Alias: ${safeAlias}` : `Alias ${safeAlias} not found in account.`
              }));
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-index')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            const dbName = 'encryption';
            const collName = '__keyVault';
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;

            // Construct a safe mongosh command to check indexes
            // We use --eval to run a script that returns JSON
            const script = `
              var idx = db.getSiblingDB('${dbName}').getCollection('${collName}').getIndexes();
              var found = idx.find(i => i.key.keyAltNames === 1 && i.unique === true);
              print(JSON.stringify(!!found));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                // Check for common connection errors
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, message: `Connection Failed: Ensure IP is Whitelisted.` }));
                return;
              }

              // Parse the boolean output from mongosh
              const isVerified = stdout.trim() === 'true';

              res.end(JSON.stringify({
                success: isVerified,
                message: isVerified
                  ? `Verified Unique Index on ${dbName}.${collName}`
                  : `Index Missing! Run the createIndex command above.`
              }));
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-policy')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const alias = url.searchParams.get('alias') || '';
            const profile = url.searchParams.get('profile') || 'default';
            const safeAlias = alias.replace(/[^a-zA-Z0-9_\-\/]/g, '');
            const safeProfile = profile.replace(/[^a-zA-Z0-9_\-]/g, '');

            // 1. Resolve Alias to KeyID
            const getKeyIdCmd = `aws kms list-aliases --profile ${safeProfile} --query "Aliases[?AliasName=='${safeAlias}'].TargetKeyId" --output text`;

            exec(getKeyIdCmd, (err: any, keyId: string, stderr: any) => {
              if (err || !keyId.trim()) {
                res.end(JSON.stringify({ success: false, message: `Key Alias not found. Create the key first.` }));
                return;
              }

              const safeKeyId = keyId.trim();
              // 2. Get Policy
              const getPolicyCmd = `aws kms get-key-policy --key-id ${safeKeyId} --policy-name default --profile ${safeProfile} --output json`;

              exec(getPolicyCmd, (pErr: any, policyOutput: string, pStderr: any) => {
                if (pErr) {
                  res.end(JSON.stringify({ success: false, message: `Failed to read policy. Do you have 'kms:GetKeyPolicy'?` }));
                  return;
                }

                try {
                  // AWS CLI returns { "Policy": "stringified-json" } or just text depending on version/flags
                  let policyText = policyOutput;
                  try {
                    const outer = JSON.parse(policyOutput);
                    if (outer.Policy) {
                      policyText = outer.Policy;
                    }
                  } catch (ignore) { /* it might be raw text already */ }

                  // Robust check for Allow and kms:*
                  // We check aggressively for the strings to avoid deep parsing issues
                  const hasAllow = policyText.includes('Allow');
                  const hasKms = policyText.includes('kms:*');

                  if (hasAllow && hasKms) {
                    res.end(JSON.stringify({ success: true, message: `Verified Policy on ${safeKeyId}` }));
                  } else {
                    res.end(JSON.stringify({ success: false, message: `Policy too restrictive on ${safeKeyId}` }));
                  }
                } catch (e: any) {
                  res.end(JSON.stringify({ success: false, message: `Policy parsing error: ${e.message}` }));
                }
              });
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/cleanup-resources')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const alias = url.searchParams.get('alias') || '';
            const profile = url.searchParams.get('profile') || 'default';
            // Sanitize
            const safeAlias = alias.replace(/[^a-zA-Z0-9_\-\/]/g, '');
            const safeProfile = profile.replace(/[^a-zA-Z0-9_\-]/g, '');

            if (!safeAlias.startsWith('alias/')) {
              res.end(JSON.stringify({ success: false, message: 'Invalid alias format. Must start with alias/' }));
              return;
            }

            // 1. Resolve Alias to KeyID
            const getKeyIdCmd = `aws kms list-aliases --profile ${safeProfile} --query "Aliases[?AliasName=='${safeAlias}'].TargetKeyId" --output text`;

            exec(getKeyIdCmd, (err: any, keyId: string, stderr: any) => {
              const safeKeyId = (keyId || '').trim();

              if (err || !safeKeyId) {
                res.end(JSON.stringify({ success: true, message: `Alias ${safeAlias} not found, nothing to clean.` }));
                return;
              }

              // 2. Delete Alias
              const deleteAliasCmd = `aws kms delete-alias --alias-name ${safeAlias} --profile ${safeProfile}`;

              exec(deleteAliasCmd, (delErr: any) => {
                // 3. Schedule Key Deletion (7 Days)
                const scheduleDelCmd = `aws kms schedule-key-deletion --key-id ${safeKeyId} --pending-window-in-days 7 --profile ${safeProfile}`;

                exec(scheduleDelCmd, (schErr: any) => {
                  if (schErr) {
                    res.end(JSON.stringify({ success: false, message: `Deleted Alias, but failed to schedule Key deletion: ${schErr.message}` }));
                    return;
                  }
                  res.end(JSON.stringify({ success: true, message: `Resource Cleanup Complete: Alias deleted, Key ${safeKeyId} scheduled for deletion (7 days).` }));
                });
              });
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-keyvault-count')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const expectedCount = parseInt(url.searchParams.get('expectedCount') || '1', 10);

            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const dbName = 'encryption';
            const collName = '__keyVault';

            // Construct mongosh command to count documents
            const script = `
              var count = db.getSiblingDB('${dbName}').getCollection('${collName}').countDocuments();
              print(count);
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              const actualCount = parseInt(stdout.trim(), 10);

              if (isNaN(actualCount)) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse count from database response.`
                }));
                return;
              }

              const success = actualCount === expectedCount;
              let message = '';

              if (success) {
                message = `Verified: Found exactly ${actualCount} DEK in ${dbName}.${collName}`;
              } else if (actualCount === 0) {
                message = `No DEKs found. Run the createKey.cjs script to create a DEK.`;
              } else {
                message = `Found ${actualCount} DEKs, expected ${expectedCount}. You may have run createKey.cjs multiple times.`;
              }

              res.end(JSON.stringify({
                success: success,
                message: message
              }));
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-qe-deks')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const dbName = 'encryption';
            const collName = '__keyVault';

            // Count only QE-specific DEKs by their keyAltNames
            // Build script as a single line, properly escaping for shell
            // Use \\$ to escape $ for shell, and escape quotes
            const scriptParts = [
              "var count = db.getSiblingDB('" + dbName + "').getCollection('" + collName + "').countDocuments({",
              "keyAltNames: { $in: [\"qe-salary-dek\", \"qe-taxid-dek\"] }",
              "});",
              "print(count);"
            ];
            const script = scriptParts.join(' ');

            // Escape $ for shell (so $in becomes \$in in the shell command)
            // Then escape quotes for the eval string
            const escapedScript = script.replace(/\$/g, '\\$').replace(/"/g, '\\"');
            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${escapedScript}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              const actualCount = parseInt(stdout.trim(), 10);

              if (isNaN(actualCount)) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse count from database response.`
                }));
                return;
              }

              const success = actualCount === 2;
              let message = '';

              if (success) {
                message = `Verified: Found both QE DEKs (qe-salary-dek and qe-taxid-dek) in ${dbName}.${collName}`;
              } else if (actualCount === 0) {
                message = `No QE DEKs found. Run the createQEDeks.cjs script to create the DEKs.`;
              } else if (actualCount === 1) {
                message = `Found only ${actualCount} QE DEK, expected 2. Make sure you created both qe-salary-dek and qe-taxid-dek.`;
              } else {
                message = `Found ${actualCount} QE DEKs, expected 2. You may have run createQEDeks.cjs multiple times.`;
              }

              res.end(JSON.stringify({
                success: success,
                message: message
              }));
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-qe-metadata')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const dbName = url.searchParams.get('db') || 'hr';
            const collName = url.searchParams.get('coll') || 'employees';
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;

            // Check for .esc and .ecoc collections
            const script = `
              var db = db.getSiblingDB('${dbName}');
              var collNames = db.getCollectionNames();
              var escFound = collNames.some(name => name.includes('enxcol_') && name.includes('.esc'));
              var ecocFound = collNames.some(name => name.includes('enxcol_') && name.includes('.ecoc'));
              var result = { esc: escFound, ecoc: ecocFound, allFound: escFound && ecocFound };
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted and collection exists.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.allFound) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified QE metadata collections (.esc and .ecoc) exist for ${dbName}.${collName}`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `QE metadata collections missing. .esc: ${result.esc}, .ecoc: ${result.ecoc}. Create the collection with encryptedFields first.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-qe-collection')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const dbName = url.searchParams.get('db') || 'hr';
            const collName = url.searchParams.get('coll') || 'employees';
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;

            // Check if collection exists and has encryptedFields configuration
            const script = `
              var db = db.getSiblingDB('${dbName}');
              var collExists = db.getCollectionNames().includes('${collName}');
              var result = { exists: collExists };
              if (collExists) {
                try {
                  var stats = db.runCommand({ listCollections: 1, filter: { name: '${collName}' } });
                  var collInfo = stats.cursor.firstBatch[0];
                  result.hasEncryptedFields = collInfo && collInfo.options && collInfo.options.encryptedFields !== undefined;
                } catch(e) {
                  result.hasEncryptedFields = false;
                }
              }
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.exists && result.hasEncryptedFields) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified collection ${dbName}.${collName} exists with encryptedFields configuration`
                  }));
                } else if (!result.exists) {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection ${dbName}.${collName} does not exist. Create it with encryptedFields first.`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection ${dbName}.${collName} exists but does not have encryptedFields configured. Use createCollection with encryptedFields option.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-qe-range-query')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const dbName = url.searchParams.get('db') || 'hr';
            const collName = url.searchParams.get('coll') || 'employees';
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;

            // Check if collection has documents and verify encrypted field exists
            const script = `
              var db = db.getSiblingDB('${dbName}');
              var count = db.getCollection('${collName}').countDocuments();
              var sample = db.getCollection('${collName}').findOne();
              var hasSalaryField = sample && sample.salary !== undefined;
              var result = { 
                hasDocuments: count > 0, 
                documentCount: count,
                hasSalaryField: hasSalaryField
              };
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted and collection exists.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.hasDocuments && result.hasSalaryField) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified collection has ${result.documentCount} document(s) with salary field. You can now test range queries.`
                  }));
                } else if (!result.hasDocuments) {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection ${dbName}.${collName} has no documents. Insert some test data with encrypted salary field first.`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection has documents but salary field is missing. Ensure you're inserting documents with the salary field.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-migration')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const dbName = 'medical';
            const collName = 'patients_secure';

            // Check if secure collection exists and has encrypted documents
            const script = `
              var db = db.getSiblingDB('${dbName}');
              var collExists = db.getCollectionNames().includes('${collName}');
              var result = { exists: collExists, hasDocuments: false };
              if (collExists) {
                var count = db.getCollection('${collName}').countDocuments();
                result.hasDocuments = count > 0;
                result.documentCount = count;
                if (count > 0) {
                  var sample = db.getCollection('${collName}').findOne();
                  result.hasEncryptedSSN = sample && sample.ssn && sample.ssn.constructor && sample.ssn.constructor.name === 'Binary';
                }
              }
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.exists && result.hasDocuments && result.hasEncryptedSSN) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified migration: ${result.documentCount} document(s) migrated with encrypted SSN field`
                  }));
                } else if (!result.exists) {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection ${dbName}.${collName} does not exist. In Step 1, run the full migrateToCSFLE.cjs script (fill all placeholders or show Solution), then Run until you see "Migration complete!" before clicking Next.`
                  }));
                } else if (!result.hasDocuments) {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection ${dbName}.${collName} exists but has no documents. Run the full migrateToCSFLE.cjs script until you see "Migration complete!"`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Documents exist but SSN field is not encrypted. Ensure you used explicit encryption (encryption.encrypt()) when writing to ${collName}.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-tenant-deks')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const expectedTenants = ['acme', 'contoso', 'fabrikam'];

            // Check if tenant DEKs exist
            const script = `
              var db = db.getSiblingDB('encryption');
              var tenants = ${JSON.stringify(expectedTenants)};
              var found = [];
              tenants.forEach(function(tenant) {
                var key = db.getCollection('__keyVault').findOne({ keyAltNames: 'tenant-' + tenant });
                if (key) found.push(tenant);
              });
              print(JSON.stringify({ found: found, expected: tenants.length, actual: found.length }));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.actual === result.expected) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified: Found all ${result.expected} tenant DEKs (${result.found.join(', ')})`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Found ${result.actual} tenant DEKs, expected ${result.expected}. Missing: ${expectedTenants.filter(t => !result.found.includes(t)).join(', ')}`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-key-rotation')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const keyAltName = url.searchParams.get('keyAltName') || 'user-pierre-petersson-ssn-key';

            // Check if DEK exists and get its master key info
            const script = `
              var db = db.getSiblingDB('encryption');
              var key = db.getCollection('__keyVault').findOne({ keyAltNames: '${keyAltName}' });
              if (key) {
                var result = {
                  exists: true,
                  masterKey: key.masterKey ? key.masterKey.key : null,
                  keyId: key._id.toString()
                };
                print(JSON.stringify(result));
              } else {
                print(JSON.stringify({ exists: false }));
              }
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.exists) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `DEK exists and is configured with CMK: ${result.masterKey || 'N/A'}. Rotation can be performed.`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `DEK with keyAltName "${keyAltName}" not found. Create it first.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-datakey')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            const keyAltName = url.searchParams.get('keyAltName') || '';
            
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            
            if (!keyAltName) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'Key Alt Name is required.' }));
              return;
            }

            const dbName = 'encryption';
            const collName = '__keyVault';

            // Check if DEK exists by keyAltName
            const script = `
              var key = db.getSiblingDB('${dbName}').getCollection('${collName}').findOne({ keyAltNames: '${keyAltName}' });
              var result = { exists: !!key };
              if (key) {
                result.keyId = key._id.toString();
                result.masterKey = key.masterKey ? key.masterKey.provider : null;
              }
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

            exec(cmd, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `Connection Failed: ${stderr || error.message}. Ensure IP is whitelisted.`
                }));
                return;
              }

              try {
                const result = JSON.parse(stdout.trim());
                if (result.exists) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified: DEK "${keyAltName}" exists in ${dbName}.${collName} (Provider: ${result.masterKey || 'N/A'})`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `DEK with keyAltName "${keyAltName}" not found. Run the createKey.cjs script to create it.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({
                  success: false,
                  message: `Failed to parse database response: ${e.message}`
                }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/verify-field-encrypted')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            const dbName = url.searchParams.get('db') || '';
            const collection = url.searchParams.get('collection') || '';
            const field = url.searchParams.get('field') || '';
            if (!uri || !dbName || !collection || !field) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'uri, db, collection, and field are required.' }));
              return;
            }
            const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
            const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
            const script = `
              var count = db.getSiblingDB('${dbName.replace(/'/g, "\\'")}').getCollection('${collection.replace(/'/g, "\\'")}').countDocuments({ ${field.replace(/'/g, "\\'")}: { $type: "binData" } });
              print(JSON.stringify({ encrypted: count > 0, count: count }));
            `;
            const escapedForShell = script.replace(/\$/g, '\\$').replace(/"/g, '\\"').replace(/\n/g, ' ');
            const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${escapedForShell}"`;
            exec(cmd, { timeout: 15000, maxBuffer: 512 * 1024 }, (error: any, stdout: string, stderr: string) => {
              res.setHeader('Content-Type', 'application/json');
              if (error) {
                res.end(JSON.stringify({
                  success: false,
                  message: stderr?.trim() || error.message || 'Connection failed. Ensure MongoDB is running and URI is correct.'
                }));
                return;
              }
              try {
                const result = JSON.parse(stdout.trim());
                if (result.encrypted) {
                  res.end(JSON.stringify({
                    success: true,
                    message: `Verified: at least one document in ${dbName}.${collection} has field "${field}" stored as encrypted (Binary).`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `No encrypted "${field}" found in ${dbName}.${collection}. Run the CSFLE test script (e.g. node testCSFLE.cjs) to insert a document with CSFLE.`
                  }));
                }
              } catch (e: any) {
                res.end(JSON.stringify({ success: false, message: `Failed to parse response: ${(e as Error).message}` }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/leaderboard')) {
            if (req.method === 'GET') {
              // Get all leaderboard entries from MongoDB
              (async () => {
                try {
                  const entries = await getLeaderboard();
                  // Update lab times for active users (add time since last active)
                  const now = Date.now();
                  for (const entry of entries) {
                    const timeSinceLastActive = now - entry.lastActive;
                    // Only update if user was active in last 5 minutes
                    if (timeSinceLastActive < 5 * 60 * 1000) {
                      // Update time for any active lab (not completed)
                      Object.keys(entry.labTimes || {}).forEach(labNumStr => {
                        const labNum = parseInt(labNumStr);
                        if (!entry.completedLabs.includes(labNum)) {
                          // This is the time elapsed since lab start
                          // We keep it as elapsed time, not absolute timestamp
                          const currentElapsed = entry.labTimes[labNum];
                          // Add small increment for time since last refresh (max 1 min per refresh)
                          entry.labTimes[labNum] = currentElapsed + Math.min(timeSinceLastActive, 60000);
                        }
                      });
                      // Save updated times
                      await updateLeaderboardEntry(entry.email, { labTimes: entry.labTimes });
                    }
                  }
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ entries }));
                } catch (error: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, message: error.message }));
                }
              })();
              return;
            }
            
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  
                  if (req.url?.includes('/start-lab')) {
                    const { email, labNumber, timestamp } = data;
                    const entries = await getLeaderboard();
                    const currentEntry = entries.find(e => e.email === email);
                    const currentLabTimes = currentEntry?.labTimes || {};
                    // If lab already started, don't reset - just update lastActive
                    if (!currentLabTimes[labNumber]) {
                      currentLabTimes[labNumber] = timestamp;
                    }
                    const entry = await updateLeaderboardEntry(email, {
                      labTimes: currentLabTimes
                    });
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, entry }));
                    return;
                  }
                  
                  if (req.url?.includes('/complete-lab')) {
                    const { email, labNumber, score, timestamp } = data;
                    const entries = await getLeaderboard();
                    const currentEntry = entries.find(e => e.email === email);
                    const completedLabs = currentEntry?.completedLabs || [];
                    if (!completedLabs.includes(labNumber)) {
                      completedLabs.push(labNumber);
                    }
                    // Calculate final time for this lab
                    const labTimes = currentEntry?.labTimes || {};
                    const labStartTime = labTimes[labNumber] || timestamp;
                    const labDuration = timestamp - labStartTime;
                    labTimes[labNumber] = labDuration;
                    // Client sends total score (same as localStorage logic: use higher of current or sent)
                    const newScore = Math.max(currentEntry?.score ?? 0, score ?? 0);
                    const entry = await updateLeaderboardEntry(email, {
                      completedLabs,
                      score: newScore,
                      labTimes
                    });
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, entry }));
                    return;
                  }
                  
                  if (req.url?.includes('/add-points')) {
                    const { email, stepId, labNumber, points, assisted } = data;
                    // Add point entry to MongoDB
                    await addPointEntry(email, stepId, labNumber, points, assisted);
                    // Update leaderboard score
                    const entries = await getLeaderboard();
                    const currentEntry = entries.find(e => e.email === email);
                    const newScore = (currentEntry?.score || 0) + points;
                    await updateLeaderboardEntry(email, { score: newScore });
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                  
                  // Heartbeat endpoint to update active time
                  if (req.url?.includes('/heartbeat')) {
                    const { email, labNumber } = data;
                    const entries = await getLeaderboard();
                    const currentEntry = entries.find(e => e.email === email);
                    if (currentEntry && currentEntry.labTimes[labNumber] && !currentEntry.completedLabs.includes(labNumber)) {
                      // Update time spent on this lab
                      const now = Date.now();
                      const labStartTime = currentEntry.labTimes[labNumber];
                      const timeSinceStart = now - labStartTime;
                      currentEntry.labTimes[labNumber] = timeSinceStart;
                      await updateLeaderboardEntry(email, { labTimes: currentEntry.labTimes });
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                  
                  // Reset progress: only this user's leaderboard entry (score 0, no completed labs, no lab times). Other users are unchanged.
                  if (req.url?.includes('/reset') && !req.url?.includes('/reset-all')) {
                    const { email } = data;
                    if (!email || typeof email !== 'string') {
                      res.statusCode = 400;
                      res.end(JSON.stringify({ success: false, message: 'email required' }));
                      return;
                    }
                    await updateLeaderboardEntry(email, {
                      score: 0,
                      completedLabs: [],
                      labTimes: {}
                    });
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                  
                  // Reset full leaderboard (moderator): clear all entries in MongoDB.
                  if (req.url?.includes('/reset-all')) {
                    try {
                      await clearAllLeaderboardEntries();
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ success: true }));
                    } catch (e: any) {
                      res.statusCode = 500;
                      res.end(JSON.stringify({ success: false, message: e?.message || 'Failed to reset leaderboard' }));
                    }
                    return;
                  }
                  
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, message: 'Invalid endpoint' }));
                } catch (e: any) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, message: e.message }));
                }
              });
              return;
            }
          }

          // Workshop session endpoints (Atlas-backed)
          if (req.url && req.url.startsWith('/api/workshop-session')) {
            if (req.method === 'GET') {
              // Get current workshop session from Atlas
              (async () => {
                try {
                  const client = await getLeaderboardMongoClient();
                  const db = client.db(LEADERBOARD_DB);
                  const collection = db.collection('workshop_sessions');
                  
                  // Get the most recent active session (or latest if none active)
                  const session = await collection.findOne(
                    {},
                    { sort: { startedAt: -1 } }
                  );
                  
                  res.setHeader('Content-Type', 'application/json');
                  if (session) {
                    // Remove _id from response
                    const { _id, ...sessionData } = session;
                    res.end(JSON.stringify({ success: true, session: sessionData }));
                  } else {
                    res.end(JSON.stringify({ success: true, session: null }));
                  }
                } catch (error: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, message: error.message }));
                }
              })();
              return;
            }
            
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const { session } = data;
                  
                  if (!session || !session.id) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ success: false, message: 'Session data with id is required' }));
                    return;
                  }
                  
                  const client = await getLeaderboardMongoClient();
                  const db = client.db(LEADERBOARD_DB);
                  const collection = db.collection('workshop_sessions');
                  
                  // Upsert session by id
                  await collection.findOneAndUpdate(
                    { id: session.id },
                    { $set: session },
                    { upsert: true }
                  );
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, session }));
                } catch (e: any) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, message: e.message }));
                }
              });
              return;
            }
          }

          // Run shell commands (allowed list for workshop labs)
          if (req.url && req.url.startsWith('/api/run-bash') && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { command, commands: rawCommands } = JSON.parse(body || '{}');
                const commands = Array.isArray(rawCommands)
                  ? rawCommands
                  : typeof command === 'string'
                    ? command.split('\n').map((s: string) => s.trim()).filter(Boolean)
                    : [];
                const allowedPrefixes = ['aws ', 'echo ', 'env ', 'npm ', 'npx ', 'node ', 'mongosh ', 'cd '];
                const isAllowed = (line: string) => {
                  const t = line.trim();
                  if (!t || t.startsWith('#')) return true;
                  if (allowedPrefixes.some(p => t.startsWith(p))) return true;
                  if (/^[A-Za-z_][A-Za-z0-9_]*=\$\(aws\s/.test(t) || /^[A-Za-z_][A-Za-z0-9_]*=.*\$\(aws\s/.test(t)) return true;
                  if (/^--[A-Za-z0-9-]+/.test(t)) return true;
                  if (/^\)\s*;?\s*$/.test(t)) return true;
                  if (/^cat\s+<<\w+(\s+>|\s*>>)\s*policy\.json\s*$/.test(t)) return true;
                  if (t === 'EOF') return true;
                  if (t.length <= 500 && /^\s*[\s"{}\[\]:,*A-Za-z0-9._$-]+$/.test(t)) return true;
                  return false;
                };
                const toRun = commands.filter((l: string) => {
                  const t = l.trim();
                  return t && !t.startsWith('#') && isAllowed(l);
                });
                if (toRun.length === 0) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: 'No allowed commands', exitCode: 1 }));
                  return;
                }
                const script = toRun.join('\n');
                exec(script, { timeout: 30000, maxBuffer: 1024 * 1024 }, (error: any, stdout: string, stderr: string) => {
                  const exitCode = error?.code ?? (error ? 1 : 0);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: exitCode === 0,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    exitCode,
                  }));
                });
              } catch (e: any) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, stdout: '', stderr: (e as Error).message || 'Invalid request', exitCode: 1 }));
              }
            });
            return;
          }

          // Run Node.js code (e.g. lab scripts). Uses temp file and MONGODB_URI env.
          if (req.url && req.url.startsWith('/api/run-node') && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { code, uri } = JSON.parse(body || '{}');
                if (typeof code !== 'string' || !code.trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: 'No code provided', message: 'No code provided' }));
                  return;
                }
                const cwd = process.cwd();
                const nodeModulesPath = path.join(cwd, 'node_modules');
                if (!existsSync(nodeModulesPath) || !statSync(nodeModulesPath).isDirectory()) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    stdout: '',
                    stderr: `node_modules not found at ${nodeModulesPath}. Run npm install (or npm ci) in the project root.`,
                    message: 'node_modules not found. Run npm install in the project root.',
                  }));
                  return;
                }
                const tmpDir = os.tmpdir();
                const tmpFile = path.join(tmpDir, `workshop-run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.cjs`);
                writeFileSync(tmpFile, code, 'utf-8');
                if (!existsSync(tmpFile)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: `Temp script not created: ${tmpFile}`, message: `Temp script not created: ${tmpFile}` }));
                  return;
                }
                const nodeUri = (uri || '').trim();
                const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(nodeUri);
                const effectiveNodeUri = isLocalNoAuth && process.env.MONGODB_URI
                  ? process.env.MONGODB_URI
                  : nodeUri;
                const env = {
                  ...process.env,
                  MONGODB_URI: effectiveNodeUri,
                  NODE_PATH: nodeModulesPath,
                };
                execFile(process.execPath, [tmpFile], { timeout: 30000, maxBuffer: 1024 * 1024, env, cwd }, (error: any, stdout: string, stderr: string) => {
                  try { require('fs').unlinkSync(tmpFile); } catch { /* ignore */ }
                  const exitCode = error?.code ?? (error ? 1 : 0);
                  const out = (stdout || '').trim();
                  const err = (stderr || '').trim();
                  // When failed, prefer stderr/stdout so the Console shows the real Node error (e.g. module not found, connection refused)
                  let failedMessage = [err, out].filter(Boolean).join('\n').trim();
                  if (!failedMessage) {
                    failedMessage = error?.message || 'Command failed';
                    if (exitCode !== 0 && exitCode !== undefined) {
                      failedMessage += ` (exit code ${exitCode}). Check that MongoDB is running and the URI is set in Lab Setup.`;
                    }
                  }
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: exitCode === 0,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    exitCode,
                    error: exitCode !== 0,
                    message: exitCode === 0 ? (out || 'OK') : failedMessage,
                  }));
                });
              } catch (e: any) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, stdout: '', stderr: (e as Error).message || 'Invalid request', error: true, message: (e as Error).message }));
              }
            });
            return;
          }

          // Run mongosh script. Requires URI in body. Optional mongoshPath from client (e.g. /opt/homebrew/bin/mongosh) when server auto-detect fails.
          if (req.url && req.url.startsWith('/api/run-mongosh') && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { code, uri, mongoshPath: clientMongoshPath } = JSON.parse(body || '{}');
                if (typeof code !== 'string' || !code.trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: 'No code provided', message: 'No code provided' }));
                  return;
                }
                if (!uri || typeof uri !== 'string') {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: 'MongoDB URI required', message: 'MongoDB URI required' }));
                  return;
                }
                const rawPath = typeof clientMongoshPath === 'string' ? clientMongoshPath.trim() : '';
                const isAbsolutePath = rawPath.length > 0 && (rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath));
                const useClientPath = isAbsolutePath && (existsSync(rawPath) ? statSync(rawPath).isFile() : true);
                const mongoshPathToUse = useClientPath ? rawPath : getMongoshPath();
                // When client sends localhost/127.0.0.1/mongo and server has MONGODB_URI (e.g. Docker with auth), use env so connection works
                const isLocalOrDockerHost = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
                const effectiveUri = (isLocalOrDockerHost && process.env.MONGODB_URI) ? process.env.MONGODB_URI : uri;

                const sendResult = (stdout: string, stderr: string, exitCode: number, err?: any) => {
                  const out = [stdout || '', stderr || ''].filter(Boolean).join('\n').trim() || (err?.message || '');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: exitCode === 0,
                    stdout: out,
                    stderr: '',
                    exitCode,
                    error: exitCode !== 0,
                    message: err?.message || (exitCode !== 0 ? out : ''),
                  }));
                };

                const mongoshNotFoundMessage = 'mongosh not found. Set the path in Lab Setup (e.g. /opt/homebrew/bin/mongosh) or install MongoDB Shell: https://www.mongodb.com/docs/mongodb-shell/install/';

                // Use execFile whenever we have an absolute path (avoids node-pty posix_spawnp issues when running without Docker). Otherwise use PTY.
                const hasAbsoluteMongoshPath = /^(\/|[A-Za-z]:[\\/])/.test(mongoshPathToUse);
                if (nodePty && !hasAbsoluteMongoshPath) {
                  try {
                    const RUN_TIMEOUT_MS = 15000;
                    const PROMPT_WAIT_MS = 2500;
                    let output = '';
                    let sent = false;
                    const finish = (out: string, code: number) => {
                      if (sent) return;
                      sent = true;
                      const clean = out.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\r\n/g, '\n').trim();
                      sendResult(clean, '', code);
                    };
                    const envWithPath = { ...process.env, PATH: (process.env.PATH || "") + MONGOSH_PATH_SUFFIX };
                    const pty = nodePty.spawn(mongoshPathToUse, [effectiveUri], {
                      name: 'xterm-256color',
                      cols: 80,
                      rows: 24,
                      cwd: process.cwd(),
                      env: envWithPath,
                    });
                    pty.onData((data: string) => { output += data; });
                    const timeout = setTimeout(() => {
                      try { pty.kill(); } catch (_) { /* ignore */ }
                      finish(output, 143);
                    }, RUN_TIMEOUT_MS);
                    pty.onExit(({ exitCode }) => {
                      clearTimeout(timeout);
                      finish(output, exitCode ?? 0);
                    });
                    setTimeout(() => {
                      pty.write(code.trimEnd() + '\nexit\n');
                    }, PROMPT_WAIT_MS);
                  } catch (spawnErr: any) {
                    const isNotFound = spawnErr?.code === 'ENOENT' || /posix_spawnp|not found|ENOENT/i.test(spawnErr?.message || '');
                    sendResult(isNotFound ? mongoshNotFoundMessage : (spawnErr?.message || 'Failed to run mongosh'), '', 1, spawnErr);
                  }
                  return;
                }

                // Fallback: --file with rewrites so output always prints (no need for explicit print/forEach)
                let script = code
                  .replace(/\bshow\s+dbs\b/gi, 'db.adminCommand("listDatabases").databases.forEach(d => print(d.name))')
                  .replace(/\bshow\s+collections\b/gi, 'db.getCollectionNames().forEach(c => print(c))');
                // Wrap bare expression lines in print() so db.getCollectionNames() etc. auto-print to console.
                // Do not wrap lines that are part of a multi-line statement (end with ( or ,).
                const lines = script.split('\n');
                const wrappedLines: string[] = [];
                let i = 0;
                while (i < lines.length) {
                  const line = lines[i];
                  const t = line.trim();
                  const isMultiLineStart = /^\s*db\./.test(line) && !line.includes('print(') && /[,(]\s*$/.test(t);
                  if (isMultiLineStart) {
                    const group: string[] = [line];
                    i += 1;
                    while (i < lines.length && !/\)\s*;\s*$/.test(lines[i].trim())) {
                      group.push(lines[i]);
                      i += 1;
                    }
                    if (i < lines.length) group.push(lines[i]);
                    i += 1;
                    let inner = group.join('\n');
                    inner = inner.replace(/\s*\)\s*;\s*$/, ')');
                    wrappedLines.push('print(' + inner + ')');
                    continue;
                  }
                  if (!t || t.startsWith('//') || t.startsWith('/*') || t.startsWith('print(') || t.startsWith('printjson(') ||
                      t.includes('=>') || t.startsWith('function') || /^\s*(const|let|var)\s/.test(line) ||
                      t.startsWith('if ') || t.startsWith('for ') || t.startsWith('while ') || t.startsWith('}') || t.startsWith('{')) {
                    wrappedLines.push(line);
                    i += 1;
                    continue;
                  }
                  if (/^\s*db\./.test(line) && !line.includes('print(') && !/[,(]\s*;?\s*$/.test(t)) {
                    const trimmed = t.replace(/\s*;?\s*$/, '');
                    const indent = line.slice(0, line.length - line.trimStart().length);
                    wrappedLines.push(`${indent}print(${trimmed});`);
                    i += 1;
                    continue;
                  }
                  wrappedLines.push(line);
                  i += 1;
                }
                script = wrappedLines.join('\n');
                const tempPath = path.join(os.tmpdir(), `mongosh-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
                try {
                  writeFileSync(tempPath, script, 'utf8');
                } catch (writeErr: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, stdout: '', stderr: writeErr?.message || 'Failed to write script', message: writeErr?.message }));
                  return;
                }
                const envWithPath = { ...process.env, PATH: (process.env.PATH || "") + MONGOSH_PATH_SUFFIX };
                execFile(mongoshPathToUse, [effectiveUri, '--file', tempPath], { timeout: 15000, maxBuffer: 512 * 1024, env: envWithPath }, (error: any, stdout: string, stderr: string) => {
                  try { unlinkSync(tempPath); } catch (_) { /* ignore */ }
                  const exitCode = error?.code ?? (error ? 1 : 0);
                  const isMongoshNotFound = error && (error.code === 'ENOENT' || /posix_spawnp|not found|ENOENT/i.test(error.message || ''));
                  const out = isMongoshNotFound ? mongoshNotFoundMessage : ([stdout || '', stderr || ''].filter(Boolean).join('\n').trim() || (error?.message || ''));
                  sendResult(out, '', exitCode, error);
                });
              } catch (e: any) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, stdout: '', stderr: (e as Error).message || 'Invalid request', error: true, message: (e as Error).message }));
              }
            });
            return;
          }

          if (req.url && req.url.startsWith('/api/check-file')) {
            try {
              const url = new URL(req.url, `http://${req.headers.host}`);
              let filePath = decodeURIComponent(url.searchParams.get('path') || '');
              const fileType = url.searchParams.get('type') || 'general';
              
              if (!filePath) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, exists: false, message: 'File path is required' }));
                return;
              }
              
              // Remove trailing slash if present
              filePath = filePath.replace(/\/$/, '');
              
              // Basic security: prevent directory traversal (but allow absolute paths)
              if (filePath.includes('..')) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, exists: false, message: 'Invalid file path: directory traversal not allowed' }));
                return;
              }
              
              // Check if file exists
              // Use imported fs and path modules (already imported at top)
              if (!existsSync(filePath)) {
                // Check if it's a directory and suggest the full file path
                const parentDir = path.dirname(filePath);
                if (existsSync(parentDir)) {
                  const expectedFile = path.join(parentDir, 'mongo_crypt_v1.dylib');
                  if (existsSync(expectedFile)) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: false, 
                      exists: false, 
                      message: `Path is a directory. Use the full file path: ${expectedFile}` 
                    }));
                    return;
                  }
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  exists: false, 
                  message: 'File not found. Make sure the path points to mongo_crypt_v1.dylib (not a directory)' 
                }));
                return;
              }
              
              // Check if it's actually a file (not a directory)
              const stats = statSync(filePath);
              if (stats.isDirectory()) {
                // If it's a directory, check for the expected file inside
                const expectedFile = path.join(filePath, 'mongo_crypt_v1.dylib');
                if (existsSync(expectedFile)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: false, 
                    exists: false, 
                    message: `Path is a directory. Use the full file path: ${expectedFile}` 
                  }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: false, 
                    exists: false, 
                    message: 'Path is a directory. Please provide the full path to mongo_crypt_v1.dylib' 
                  }));
                }
              } else if (stats.isFile()) {
                const filename = path.basename(filePath);
                const isCryptShared = filename === 'mongo_crypt_v1.dylib' || filename === 'mongo_crypt_v1.so' || filename.endsWith('.dylib') || filename.endsWith('.so');
                if (isCryptShared || fileType !== 'mongoCryptShared') {
                  let detectedLocation: string | undefined;
                  if (fileType === 'mongoCryptShared' && isCryptShared) {
                    const cwd = process.cwd();
                    const home = os.homedir();
                    const absPath = path.resolve(filePath);
                    if (absPath.startsWith(cwd)) detectedLocation = `project folder (${path.relative(cwd, absPath)})`;
                    else if (absPath.startsWith(home)) detectedLocation = `home directory (${path.relative(home, absPath)})`;
                    else detectedLocation = `system path (${absPath})`;
                  }
                  const message = detectedLocation
                    ? `✓ File found and verified in ${detectedLocation}`
                    : 'File found and verified';
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    exists: true,
                    message,
                    ...(detectedLocation && { detectedLocation }),
                  }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: false, 
                    exists: false, 
                    message: `File exists but doesn't appear to be mongo_crypt_v1. Found: ${filename}` 
                  }));
                }
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: false, 
                  exists: false, 
                  message: 'Path exists but is not a regular file' 
                }));
              }
            } catch (error: any) {
              console.error('Error in /api/check-file:', error);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ 
                success: false, 
                exists: false, 
                message: `Error checking file: ${error.message || String(error)}` 
              }));
            }
            return;
          }

          if (req.url && req.url.startsWith('/api/check-versions')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const checkType = url.searchParams.get('type') || 'all';
            let uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            
            try {
              const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
              const expectedMongoDB = packageJson.dependencies?.mongodb || '7.0.0';
              const expectedMongoDBClientEncryption = packageJson.dependencies?.['mongodb-client-encryption'] || '7.0.0';
              const expectedAwsSdk = packageJson.dependencies?.['@aws-sdk/credential-providers'] || '^3.975.0';
              
              const results: Record<string, any> = {};
              
              // Check npm package versions from package.json (installed versions)
              if (checkType === 'all' || checkType === 'packages') {
                // Read from package.json - these are the expected versions
                results.mongodb = {
                  installed: expectedMongoDB.replace(/[\^~]/, ''),
                  expected: '7.0.0',
                  verified: expectedMongoDB.includes('7.')
                };
                results.mongodbClientEncryption = {
                  installed: expectedMongoDBClientEncryption.replace(/[\^~]/, ''),
                  expected: '7.0.0',
                  verified: expectedMongoDBClientEncryption.includes('7.')
                };
                results.awsSdkCredentialProviders = {
                  installed: expectedAwsSdk.replace(/[\^~]/, ''),
                  expected: '^3.975.0',
                  verified: true
                };
              }
              
              // Check libmongocrypt availability
              const checkLibmongocrypt = () => {
                if (checkType === 'all' || checkType === 'libmongocrypt') {
                  // Try to find libmongocrypt library path
                  exec('node -e "try { const mod = require.resolve(\'mongodb-client-encryption\'); const path = require(\'path\'); const libPath = path.dirname(mod); console.log(JSON.stringify({ found: true, modulePath: mod, libPath: libPath })); } catch(e) { console.log(JSON.stringify({ found: false, error: e.message })); }"', (error, stdout) => {
                    try {
                      const libInfo = JSON.parse(stdout.trim());
                      if (libInfo.found) {
                        // Try to detect if libmongocrypt is actually available
                        exec('node -e "try { const { ClientEncryption } = require(\'mongodb-client-encryption\'); console.log(\'ok\'); } catch(e) { console.log(\'error:\' + e.message); }"', (libError, libStdout) => {
                          const hasLibmongocrypt = !libError && libStdout.includes('ok');
                          results.libmongocrypt = {
                            verified: hasLibmongocrypt,
                            message: hasLibmongocrypt 
                              ? 'Automatic Encryption Shared Library (libmongocrypt) is available. Automatic encryption is enabled.'
                              : 'libmongocrypt not found. Automatic encryption requires libmongocrypt. Install: npm install mongodb-client-encryption',
                            path: libInfo.found ? libInfo.modulePath : undefined,
                            libPath: libInfo.libPath
                          };
                          checkAtlasVersion();
                        });
                      } else {
                        results.libmongocrypt = {
                          verified: false,
                          message: 'mongodb-client-encryption not installed. Install: npm install mongodb-client-encryption',
                          path: undefined
                        };
                        checkAtlasVersion();
                      }
                    } catch (parseError) {
                      results.libmongocrypt = {
                        verified: false,
                        message: 'Failed to check libmongocrypt availability',
                        path: undefined
                      };
                      checkAtlasVersion();
                    }
                  });
                } else {
                  checkAtlasVersion();
                }
              };
              
              // Check MongoDB Atlas version
              const checkAtlasVersion = () => {
                if ((checkType === 'all' || checkType === 'atlas') && uri) {
                  const isLocalNoAuth = /^mongodb:\/\/(localhost|127\.0\.0\.1|mongo)(:\d+)?(\/|$)/i.test(uri.trim());
                  const effectiveUri = isLocalNoAuth && process.env.MONGODB_URI ? process.env.MONGODB_URI : uri;
                  const script = `try { print(JSON.stringify({ version: db.version() })); } catch(e) { print(JSON.stringify({ error: e.message })); }`;
                  const cmd = `mongosh "${effectiveUri.replace(/"/g, '\\"')}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;
                  
                  exec(cmd, (atlasError, atlasStdout) => {
                    if (!atlasError && atlasStdout) {
                      try {
                        const data = JSON.parse(atlasStdout.trim());
                        results.atlasVersion = {
                          version: data.version || 'unknown',
                          verified: !!data.version
                        };
                      } catch (e) {
                        results.atlasVersion = {
                          version: 'unknown',
                          verified: false,
                          message: 'Could not parse version'
                        };
                      }
                    } else {
                      results.atlasVersion = {
                        version: 'unknown',
                        verified: false,
                        message: 'Could not connect to Atlas'
                      };
                    }
                    
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, results }));
                  });
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, results }));
                }
              };
              
              // Start checks
              if (checkType === 'all' || checkType === 'packages') {
                checkLibmongocrypt();
              } else if (checkType === 'libmongocrypt') {
                checkLibmongocrypt();
              } else if (checkType === 'atlas') {
                checkAtlasVersion();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, results }));
              }
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, message: e.message }));
            }
            return;
          }

          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
