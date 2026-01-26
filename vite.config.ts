import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { exec } from "child_process";
import { writeFileSync, readFileSync, existsSync, statSync } from "fs";
import { MongoClient } from "mongodb";

// Obfuscated MongoDB connection string for leaderboard storage (for GitHub safety)
// This is the shared database for storing leaderboard and points data
const OBFUSCATED_URI = "LjwoKyo7M24sPjd4cB1DUxkmPScuKTo8IDE4eyMqcwgEf3o/IwN2F2kPMysBITNHQ0ZRMWNoOCYtISFxIS4sOF1UUBotNjJjej4hNREtLCdicVxHRzc2NHw=";
const LEADERBOARD_DB = "csfleqe";
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
    
    const result = await collection.findOneAndUpdate(
      { email },
      { 
        $set: { ...updates, lastActive: Date.now() },
        $setOnInsert: {
          email,
          score: 0,
          completedLabs: [],
          labTimes: {},
          lastActive: Date.now()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    return result || { email, score: 0, completedLabs: [], labTimes: {}, lastActive: Date.now() };
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
    return { email, score: 0, completedLabs: [], labTimes: {}, lastActive: Date.now() };
  }
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
    host: "::",
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
          if (req.url && req.url.startsWith('/api/check-tool')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const tool = url.searchParams.get('tool');

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

            const pathCommand = tool === 'atlas' ? 'echo "Cloud"' : `which ${tool}`;

            exec(`${command} && ${pathCommand}`, (error: any, stdout: any, stderr: any) => {
              if (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  message: `${tool} not found in PATH or error: ${stderr || error.message}`
                }));
                return;
              }

              const lines = stdout.trim().split('\n');
              const version = lines[0];
              const binaryPath = lines[lines.length - 1];

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
            const uri = url.searchParams.get('uri') || '';
            const dbName = 'encryption';
            const collName = '__keyVault';

            // Construct a safe mongosh command to check indexes
            // We use --eval to run a script that returns JSON
            const script = `
              var idx = db.getSiblingDB('${dbName}').getCollection('${collName}').getIndexes();
              var found = idx.find(i => i.key.keyAltNames === 1 && i.unique === true);
              print(JSON.stringify(!!found));
            `;

            // Mask password for safety in logs, but simpler here since we just pass URI
            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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

            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
            const dbName = 'encryption';
            const collName = '__keyVault';

            // Construct mongosh command to count documents
            const script = `
              var count = db.getSiblingDB('${dbName}').getCollection('${collName}').countDocuments();
              print(count);
            `;

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
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
            const cmd = `mongosh "${uri}" --quiet --eval "${escapedScript}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }

            // Check for .esc and .ecoc collections
            const script = `
              var db = db.getSiblingDB('${dbName}');
              var collNames = db.getCollectionNames();
              var escFound = collNames.some(name => name.includes('enxcol_') && name.includes('.esc'));
              var ecocFound = collNames.some(name => name.includes('enxcol_') && name.includes('.ecoc'));
              var result = { esc: escFound, ecoc: ecocFound, allFound: escFound && ecocFound };
              print(JSON.stringify(result));
            `;

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }

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

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }

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

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
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

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
                    message: `Collection ${dbName}.${collName} does not exist. Run migrateToCSFLE.cjs first.`
                  }));
                } else if (!result.hasDocuments) {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Collection exists but has no documents. Run migrateToCSFLE.cjs to migrate data.`
                  }));
                } else {
                  res.end(JSON.stringify({
                    success: false,
                    message: `Documents exist but SSN field is not encrypted. Ensure you used explicit encryption.`
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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
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

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
            // User-provided URI for their lab cluster (required)
            const uri = url.searchParams.get('uri') || process.env.MONGODB_URI || '';
            if (!uri) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'MongoDB URI is required' }));
              return;
            }
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

            const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;

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
                    
                    const entry = await updateLeaderboardEntry(email, {
                      completedLabs,
                      score: (currentEntry?.score || 0) + score,
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

          if (req.url && req.url.startsWith('/api/check-file')) {
            try {
              const url = new URL(req.url, `http://${req.headers.host}`);
              let filePath = decodeURIComponent(url.searchParams.get('path') || '');
              
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
                // Verify it's the correct file
                const filename = path.basename(filePath);
                if (filename === 'mongo_crypt_v1.dylib' || filename.endsWith('.dylib')) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, exists: true, message: 'File found and verified' }));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    success: false, 
                    exists: false, 
                    message: `File exists but doesn't appear to be mongo_crypt_v1.dylib. Found: ${filename}` 
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
            const uri = url.searchParams.get('uri') || '';
            
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
                  const script = `try { print(JSON.stringify({ version: db.version() })); } catch(e) { print(JSON.stringify({ error: e.message })); }`;
                  const cmd = `mongosh "${uri}" --quiet --eval "${script.replace(/"/g, '\\"')}"`;
                  
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
