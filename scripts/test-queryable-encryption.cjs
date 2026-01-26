/**
 * Queryable Encryption Test Script
 * 
 * This script tests Queryable Encryption functionality with MongoDB Atlas.
 * 
 * Prerequisites:
 * - MongoDB Atlas 8.0+ cluster (or local MongoDB 8.0+ Enterprise)
 * - AWS KMS access configured
 * - Environment variables set:
 *   - MONGODB_URI
 *   - AWS_ACCESS_KEY_ID
 *   - AWS_SECRET_ACCESS_KEY
 *   - AWS_KEY_ARN
 *   - AWS_KEY_REGION
 * 
 * Usage:
 *   node scripts/test-queryable-encryption.cjs
 */

const { MongoClient, Binary, ClientEncryption } = require('mongodb');
const awsCredProviderPkg = require('@aws-sdk/credential-providers');
const { fromSSO } = awsCredProviderPkg;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Default values
const DEFAULT_MONGODB_URI = 'mongodb+srv://sa-enablement:auA86K9leO3H8Jlg@cluster0.tcrpd.mongodb.net/?appName=Cluster0';
const DEFAULT_AWS_REGION = 'eu-central-1';

// Get AWS credentials from SSO login only
async function getAWSCredentials() {
  // Force use of default SSO profile
  if (!process.env.AWS_PROFILE) {
    process.env.AWS_PROFILE = 'default';
  }
  
  log('🔐 Using AWS SSO credentials from default profile...', 'blue');
  
  try {
    // Use fromSSO to explicitly use SSO credentials
    // This requires the user to be logged in with: aws sso login
    const credentialProvider = fromSSO({ profile: 'default' });
    const credentials = await credentialProvider();
    
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('Failed to get credentials from SSO - credentials are missing');
    }
    
    if (!credentials.sessionToken) {
      throw new Error('Missing session token - SSO session may have expired. Run: aws sso login');
    }
    
    log(`   ✅ SSO credentials obtained successfully`, 'green');
    log(`   Using SSO role: ${credentials.accessKeyId.substring(0, 20)}...`, 'blue');
    
    return {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken // Required for SSO
    };
  } catch (error) {
    log(`❌ Failed to get AWS SSO credentials: ${error.message}`, 'red');
    log('\n💡 To use AWS SSO, you must be logged in:', 'yellow');
    log('   1. Run: aws sso login', 'yellow');
    log('   2. Select your SSO profile if prompted', 'yellow');
    log('   3. Then run this test again', 'yellow');
    log('\n   Your default profile should be configured for SSO in ~/.aws/config', 'yellow');
    throw new Error(`AWS SSO login required: ${error.message}`);
  }
}

// Check environment variables
async function checkEnvVars() {
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = DEFAULT_MONGODB_URI;
    log('ℹ️  Using default MONGODB_URI', 'blue');
  }
  
  if (!process.env.AWS_KEY_REGION) {
    process.env.AWS_KEY_REGION = DEFAULT_AWS_REGION;
    log('ℹ️  Using default AWS_KEY_REGION: eu-central-1', 'blue');
  }
  
  if (!process.env.AWS_KEY_ARN) {
    log('❌ Missing required environment variable: AWS_KEY_ARN', 'red');
    log('\nPlease set the AWS KMS Key ARN:', 'yellow');
    log('  export AWS_KEY_ARN="arn:aws:kms:eu-central-1:123456789012:key/your-key-uuid"', 'yellow');
    process.exit(1);
  }
  
  let awsCredentials;
  try {
    awsCredentials = await getAWSCredentials();
    log('✅ AWS credentials obtained (from SSO or environment)', 'green');
  } catch (error) {
    log(`❌ Failed to get AWS credentials: ${error.message}`, 'red');
    log('\nPlease ensure you are logged in with AWS SSO:', 'yellow');
    log('  aws sso login', 'yellow');
    process.exit(1);
  }
  
  log('✅ All required configuration is set', 'green');
  log(`   MONGODB_URI: ${process.env.MONGODB_URI.substring(0, 50)}...`, 'blue');
  log(`   AWS_KEY_REGION: ${process.env.AWS_KEY_REGION}`, 'blue');
  log(`   AWS_KEY_ARN: ${process.env.AWS_KEY_ARN}`, 'blue');
  
  return awsCredentials;
}

// Check MongoDB version
async function checkMongoVersion(client) {
  logSection('Checking MongoDB Version');
  
  try {
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    const version = serverStatus.version;
    const majorVersion = parseInt(version.split('.')[0]);
    
    log(`MongoDB Version: ${version}`, 'blue');
    
    if (majorVersion >= 8) {
      log('✅ MongoDB 8.0+ detected - Queryable Encryption Range queries are supported', 'green');
      return true;
    } else if (majorVersion === 7) {
      log('⚠️  MongoDB 7.0 detected - Range queries require 8.0+', 'yellow');
      return false;
    } else {
      log('❌ MongoDB version too old for Queryable Encryption', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error checking MongoDB version: ${error.message}`, 'red');
    throw error;
  }
}

// Initialize key vault
async function initKeyVault(client) {
  logSection('Initializing Key Vault');
  
  try {
    const db = client.db('encryption');
    const keyVault = db.collection('__keyVault');
    
    // Check if collection exists, create it if it doesn't
    const collections = await db.listCollections({ name: '__keyVault' }).toArray();
    if (collections.length === 0) {
      log('Creating key vault collection...', 'blue');
      await db.createCollection('__keyVault');
      log('✅ Key vault collection created', 'green');
    }
    
    // Check if index exists
    const indexes = await keyVault.indexes();
    const hasIndex = indexes.some(idx => 
      idx.key && idx.key.keyAltNames === 1 && idx.unique === true
    );
    
    if (!hasIndex) {
      log('Creating unique index on keyAltNames...', 'blue');
      await keyVault.createIndex(
        { keyAltNames: 1 },
        {
          unique: true,
          partialFilterExpression: { keyAltNames: { $exists: true } }
        }
      );
      log('✅ Created unique index on keyAltNames', 'green');
    } else {
      log('✅ Key vault index already exists', 'green');
    }
  } catch (error) {
    log(`❌ Error initializing key vault: ${error.message}`, 'red');
    throw error;
  }
}

// Create DEKs for Queryable Encryption
async function createQEDEKs(client, clientEncryption, masterKey) {
  logSection('Creating Data Encryption Keys (DEKs)');
  
  const deks = {};
  
  try {
    const keyVault = client.db('encryption').collection('__keyVault');
    
    const existingSalaryKey = await keyVault.findOne({ keyAltNames: 'qe-test-salary-key' });
    const existingTaxIdKey = await keyVault.findOne({ keyAltNames: 'qe-test-taxid-key' });
    
    if (existingSalaryKey && existingTaxIdKey) {
      log('✅ DEKs already exist, reusing them', 'green');
      deks.salary = existingSalaryKey._id;
      deks.taxId = existingTaxIdKey._id;
      log(`   Salary DEK: ${deks.salary.toString('hex').substring(0, 16)}...`, 'blue');
      log(`   TaxID DEK: ${deks.taxId.toString('hex').substring(0, 16)}...`, 'blue');
      return deks;
    }
    
    log('Creating salary DEK (for range queries)...', 'blue');
    deks.salary = await clientEncryption.createDataKey('aws', {
      masterKey,
      keyAltNames: ['qe-test-salary-key']
    });
    log(`✅ Salary DEK created: ${deks.salary.toString('hex').substring(0, 16)}...`, 'green');
    
    log('Creating taxId DEK (for equality queries)...', 'blue');
    deks.taxId = await clientEncryption.createDataKey('aws', {
      masterKey,
      keyAltNames: ['qe-test-taxid-key']
    });
    log(`✅ TaxID DEK created: ${deks.taxId.toString('hex').substring(0, 16)}...`, 'green');
    
    return deks;
  } catch (error) {
    log(`❌ Error creating DEKs: ${error.message}`, 'red');
    throw error;
  }
}

// Create QE collection with encryptedFields
async function createQECollection(client, deks) {
  logSection('Creating Queryable Encryption Collection');
  
  try {
    const db = client.db('hr');
    
    const collections = await db.listCollections({ name: 'employees_qe_test' }).toArray();
    if (collections.length > 0) {
      log('⚠️  Collection already exists, dropping it first...', 'yellow');
      await db.collection('employees_qe_test').drop();
    }
    
    const encryptedFields = {
      fields: [
        {
          path: 'salary',
          bsonType: 'int',
          keyId: deks.salary,
          queries: {
            queryType: 'range',
            sparsity: 1,
            min: 30000,
            max: 300000,
            contention: 4
          }
        },
        {
          path: 'taxId',
          bsonType: 'string',
          keyId: deks.taxId,
          queries: { queryType: 'equality' }
        }
      ]
    };
    
    log('Creating collection with Range + Equality query support...', 'blue');
    
    await db.createCollection('employees_qe_test', { encryptedFields });
    log('✅ QE collection created successfully', 'green');
    
    // IMPORTANT: Changed to true so range queries are tested
    return { encryptedFields, useRangeQueries: true };
  } catch (error) {
    log(`❌ Error creating QE collection: ${error.message}`, 'red');
    throw error;
  }
}

// Insert test data
async function insertTestData(secureClient) {
  logSection('Inserting Test Data');
  
  try {
    const employees = secureClient.db('hr').collection('employees_qe_test');
    
    const testEmployees = [
      { name: 'Alice',   department: 'Engineering', salary: 95000, taxId: '111-22-3333' },
      { name: 'Bob',     department: 'Sales',       salary: 75000, taxId: '444-55-6666' },
      { name: 'Charlie', department: 'Engineering', salary: 120000, taxId: '777-88-9999' },
      { name: 'Diana',   department: 'HR',          salary: 65000, taxId: '000-11-2222' },
      { name: 'Eve',     department: 'Marketing',   salary: 85000, taxId: '999-88-7777' }
    ];
    
    // Insert records one by one using a loop
    let insertedCount = 0;
    for (const employee of testEmployees) {
      try {
        const result = await employees.insertOne(employee);
        if (result.insertedId) {
          insertedCount++;
          log(`   ✅ Inserted: ${employee.name} (${employee.department})`, 'blue');
        }
      } catch (insertError) {
        log(`   ❌ Failed to insert ${employee.name}: ${insertError.message}`, 'red');
        throw insertError;
      }
    }
    
    log(`✅ Inserted ${insertedCount} employees with encrypted fields`, 'green');
    
    return testEmployees;
  } catch (error) {
    if (error.message.includes("'range'") && error.message.includes('queryType')) {
      log(`❌ Error inserting test data: ${error.message}`, 'red');
      log('\n🔍 Root Cause Analysis:', 'yellow');
      log('   The MongoDB driver does not support range queries in client-side validation.', 'yellow');
      log('   Even though MongoDB 8.0+ server supports range queries, the driver rejects them.', 'yellow');
      log('\n📋 Driver Support Matrix:', 'yellow');
      log('   • MongoDB 6.x driver: ❌ Does NOT support range queries', 'yellow');
      log('   • MongoDB 7.x driver: ❌ Does NOT support range queries', 'yellow');
      log('   • MongoDB 8.0+ driver: ✅ Will support range queries (not yet released)', 'yellow');
      log('\n💡 Solution:', 'yellow');
      log('   Range queries require MongoDB Node.js driver 8.0+ which is not yet available.', 'yellow');
      log('   For now, use equality queries which work with drivers 6.x and 7.x.', 'yellow');
      log('   Check: https://www.mongodb.com/docs/drivers/node/current/', 'yellow');
    } else {
      log(`❌ Error inserting test data: ${error.message}`, 'red');
    }
    throw error;
  }
}

// Test equality queries
async function testEqualityQueries(secureClient) {
  logSection('Testing Equality Queries');
  
  try {
    const employees = secureClient.db('hr').collection('employees_qe_test');
    
    log('Testing equality query on encrypted taxId field...', 'blue');
    const result = await employees.findOne({ taxId: '444-55-6666' });
    
    if (result) {
      log(`✅ Equality query successful!`, 'green');
      log(`   Found: ${result.name} (Department: ${result.department})`, 'blue');
      log(`   Salary: $${result.salary}`, 'blue');
      log(`   TaxID: ${result.taxId}`, 'blue');
      return true;
    } else {
      log('❌ Equality query returned no results', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing equality queries: ${error.message}`, 'red');
    return false;
  }
}

// Test range queries
async function testRangeQueries(secureClient) {
  logSection('Testing Range Queries');
  
  try {
    const employees = secureClient.db('hr').collection('employees_qe_test');
    
    log('Testing range query on encrypted salary field...', 'blue');
    log('   Query: salary >= 70000 AND salary <= 100000', 'blue');
    
    const results = await employees
      .find({ salary: { $gte: 70000, $lte: 100000 } })
      .toArray();
    
    if (results.length > 0) {
      log(`✅ Range query successful! Found ${results.length} employees:`, 'green');
      results.forEach(emp => {
        log(`   - ${emp.name}: $${emp.salary} (${emp.department})`, 'blue');
      });
      return true;
    } else {
      log('⚠️  Range query returned no results (check data range)', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing range queries: ${error.message}`, 'red');
    return false;
  }
}

// Verify encryption in database
async function verifyEncryption(client) {
  logSection('Verifying Encryption in Database');
  
  try {
    const employees = client.db('hr').collection('employees_qe_test');
    const doc = await employees.findOne({ name: 'Alice' });
    
    if (!doc) {
      log('❌ Could not find test document', 'red');
      return false;
    }
    
    log('Document structure:', 'blue');
    log(`   name: ${doc.name} (plaintext)`, 'blue');
    log(`   department: ${doc.department} (plaintext)`, 'blue');
    
    if (doc.salary instanceof Binary) {
      log(`   salary: Binary(${doc.salary.subtype}) - ✅ ENCRYPTED`, 'green');
    } else {
      log(`   salary: ${doc.salary} - ⚠️ NOT ENCRYPTED`, 'yellow');
    }
    
    if (doc.taxId instanceof Binary) {
      log(`   taxId: Binary(${doc.taxId.subtype}) - ✅ ENCRYPTED`, 'green');
    } else {
      log(`   taxId: ${doc.taxId} - ⚠️ NOT ENCRYPTED`, 'yellow');
    }
    
    const db = client.db('hr');
    const collections = await db.listCollections().toArray();
    const qeCollections = collections.filter(c => c.name.startsWith('enxcol_.employees_qe_test'));
    
    if (qeCollections.length > 0) {
      log('\n✅ Internal QE collections found:', 'green');
      qeCollections.forEach(c => log(`   - ${c.name}`, 'blue'));
    } else {
      log('\n⚠️ No internal QE collections found', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error verifying encryption: ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runTest() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  QUERYABLE ENCRYPTION TEST', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  let client;
  let secureClient;
  let clientEncryption;
  
  try {
    const awsCredentials = await checkEnvVars();
    
    logSection('Connecting to MongoDB');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    log('✅ Connected to MongoDB', 'green');
    
    await checkMongoVersion(client);
    
    await initKeyVault(client);
    
    const kmsProviders = {
      aws: {
        accessKeyId: awsCredentials.accessKeyId,
        secretAccessKey: awsCredentials.secretAccessKey,
        ...(awsCredentials.sessionToken && { sessionToken: awsCredentials.sessionToken })
      }
    };
    
    const masterKey = {
      key: process.env.AWS_KEY_ARN,
      region: process.env.AWS_KEY_REGION
    };
    
    clientEncryption = new ClientEncryption(client, {
      keyVaultNamespace: 'encryption.__keyVault',
      kmsProviders
    });
    
    const deks = await createQEDEKs(client, clientEncryption, masterKey);
    
    const { useRangeQueries } = await createQECollection(client, deks);
    // Configure crypt_shared library path (optional - driver will use mongocryptd if not available)
    
    const cryptSharedLibPath = '/Users/pierre.petersson/SA_ENABLEMENT/csfle-qe-lib/lib/mongo_crypt_v1.dylib';
    const extraOptions = {};
    
    // Check if crypt_shared library exists and matches system architecture
    try {
      const fs = require('fs');
      const { execSync } = require('child_process');
      
      if (fs.existsSync(cryptSharedLibPath)) {
        // Check system architecture
        const systemArch = process.arch; // 'arm64' or 'x64'
        // Check library architecture
        const fileInfo = execSync(`file "${cryptSharedLibPath}"`, { encoding: 'utf-8' });
        const libArch = fileInfo.includes('arm64') ? 'arm64' : fileInfo.includes('x86_64') ? 'x64' : 'unknown';
        
        if (systemArch === libArch || (systemArch === 'arm64' && libArch === 'arm64')) {
          extraOptions.cryptSharedLibPath = cryptSharedLibPath;
          extraOptions.cryptSharedLibRequired = false; // Falls back to mongocryptd if library can't be loaded
          log(`📚 Using crypt_shared library: ${cryptSharedLibPath}`, 'blue');
        } else {
          log(`⚠️  crypt_shared library architecture mismatch (system: ${systemArch}, library: ${libArch})`, 'yellow');
          log('   Will use mongocryptd fallback instead', 'yellow');
        }
      } else {
        log('ℹ️  crypt_shared library not found, will use mongocryptd fallback', 'blue');
      }
    } catch (error) {
      log('ℹ️  Will use mongocryptd fallback (crypt_shared check failed)', 'blue');
    }
    
    secureClient = new MongoClient(process.env.MONGODB_URI, {
      autoEncryption: {
        keyVaultNamespace: 'encryption.__keyVault',
        kmsProviders,
        ...(Object.keys(extraOptions).length > 0 && { extraOptions })
      }
    });
    await secureClient.connect();
    log('✅ Secure client connected', 'green');
    
    await insertTestData(secureClient);
    
    const equalitySuccess = await testEqualityQueries(secureClient);
    
    let rangeSuccess = false;
    if (useRangeQueries) {
      rangeSuccess = await testRangeQueries(secureClient);
    } else {
      logSection('Range Queries');
      log('⚠️ Range query test was disabled in code (useRangeQueries = false)', 'yellow');
    }
    
    await verifyEncryption(client);
    
    logSection('Test Summary');
    log(`Equality Queries: ${equalitySuccess ? '✅ PASS' : '❌ FAIL'}`, equalitySuccess ? 'green' : 'red');
    log(`Range Queries:    ${rangeSuccess    ? '✅ PASS' : '❌ FAIL'}`, rangeSuccess    ? 'green' : 'red');
    
    if (equalitySuccess && rangeSuccess) {
      log('\n🎉 All Queryable Encryption tests passed!', 'green');
    } else {
      log('\n⚠️ Some tests did not pass. Check output above.', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    if (secureClient) await secureClient.close();
    if (client) await client.close();
    log('\n✅ Connections closed', 'green');
  }
}

runTest().catch(error => {
  console.error(`\nFatal error: ${error.message}`);
  process.exit(1);
});