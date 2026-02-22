import { LabRunner } from '@/labs/LabRunner';
import { validatorUtils } from '@/utils/validatorUtils';
import { useLab } from '@/context/LabContext';
import { useCloudProvider, useWorkshopConfig } from '@/context/WorkshopConfigContext';
import { getCreateKeyCodeBlock, getCreateKeyTerminalBlock } from '@/utils/cloudSnippets';
import { DifficultyLevel } from './DifficultyBadge';
import { CSFLEArchitectureDiagram } from './LabArchitectureDiagrams';
import { createStepEnhancements } from '@/utils/labStepEnhancements';
import { LabIntroContent } from '@/components/labs/LabViewWithTabs';

export function Lab1CSFLE() {
  const { mongoUri, awsAccessKeyId, awsSecretAccessKey, awsRegion, verifiedTools } = useLab();
  const cloud = useCloudProvider();
  const { awsDefaultRegion } = useWorkshopConfig();
  const suffix = verifiedTools['suffix']?.path || 'suffix';
  const aliasName = `alias/mongodb-lab-key-${suffix}`;
  const cryptSharedLibPath = verifiedTools['mongoCryptShared']?.path || '';

  const lab1Steps: Array<{
    id: string;
    title: string;
    estimatedTime: string;
    description: string;
    difficulty?: DifficultyLevel;
    understandSection?: string;
    doThisSection?: string[];
    hints?: string[];
    tips?: string[];
    codeBlocks?: Array<{ filename: string; language: string; code: string; skeleton?: string; challengeSkeleton?: string; expertSkeleton?: string; inlineHints?: Array<{ line: number; blankText: string; hint: string; answer: string }> }>;
    troubleshooting?: string[];
    onVerify?: () => Promise<{ success: boolean; message: string }>;
    exercises?: Array<{
      id: string;
      type: 'quiz' | 'fill_blank' | 'challenge';
      title: string;
      description?: string;
      points?: number;
      question?: string;
      options?: Array<{ id: string; label: string; isCorrect: boolean }>;
      codeTemplate?: string;
      blanks?: Array<{ id: string; placeholder: string; correctAnswer: string; hint?: string }>;
      challengeSteps?: Array<{ instruction: string; hint?: string }>;
    }>;
  }> = [

      {
        id: 'lab-csfle-fundamentals-step-create-cmk',
        title: 'Create Customer Master Key (CMK)',
        estimatedTime: '10 min',
        difficulty: 'basic' as DifficultyLevel,
        understandSection: 'The CMK is the root of trust in Envelope Encryption. It never leaves the KMS Hardware Security Module (HSM). This key will "wrap" (encrypt) the Data Encryption Keys (DEKs) that MongoDB stores.',
        doThisSection: [
          'Open your terminal and run the AWS CLI commands below (copy or type them).',
          'Create an alias for easier reference',
          'Save the Key ID for the next step',
          'Click Verify in this lab when done.'
        ],
        description: 'Create your Customer Master Key (CMK) in AWS KMS. This key is the root of trust that wraps all Data Encryption Keys. Copy the commands below into your terminal (where AWS CLI is installed and configured), run them, then click Verify in this lab.',
        tips: [
          'The CMK never leaves the KMS Hardware Security Module (HSM). In customer conversations, you will explain that the CMK is the only key that never leaves the HSM.',
          'Use aliases for keys to allow easier rotation without code changes.'
        ],
        codeBlocks: [
          {
            filename: 'Terminal',
            blockType: 'terminal-window',
            language: 'bash',
            code: `# 1. Create the CMK
KMS_KEY_ID=$(aws kms create-key --description "Lab 1 MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)

# 2. Create a human-readable alias (Unique to you)
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`,
            // Tier 1: Guided - Shows structure with blanks
            skeleton: `# ══════════════════════════════════════════════════════════════
# STEP 1: Create a Customer Master Key (CMK)
# ══════════════════════════════════════════════════════════════
# The CMK is your "root of trust" - it wraps all your Data Encryption Keys.
# It NEVER leaves AWS KMS (protected by hardware security modules).
#
# TASK: Complete the AWS KMS command below to create a new symmetric key.

KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# ══════════════════════════════════════════════════════════════
# STEP 2: Create a Human-Readable Alias
# ══════════════════════════════════════════════════════════════
# Aliases make keys easier to reference and enable key rotation without
# changing your application code.
#
# TASK: Complete the AWS KMS command to link an alias to your key.

aws kms _____________ \\
    --alias-name "${aliasName}" \\
    --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`,
            // Tier 2: Challenge - Task-based, minimal scaffolding
            challengeSkeleton: `# ══════════════════════════════════════════════════════════════
# CHALLENGE MODE - AWS KMS Setup for MongoDB Encryption
# ══════════════════════════════════════════════════════════════

# TASK 1: Create a Customer Master Key (CMK)
# ──────────────────────────────────────────
# Requirements:
#   • Use the AWS KMS CLI (aws kms <command>)
#   • Store the KeyId in a variable called KMS_KEY_ID
#   • Add description: "Lab 1 MongoDB Encryption Key"
#   • Use --query to extract only the KeyId
#
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-key.html

# Write your command:


# TASK 2: Create an Alias for Easy Reference
# ──────────────────────────────────────────
# Requirements:
#   • Create alias named: ${aliasName}
#   • Link it to your CMK using its KeyId
#
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-alias.html

# Write your command:


# Verification (run after completing above):
echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`,
            // Tier 3: Expert - Objective only
            expertSkeleton: `# ══════════════════════════════════════════════════════════════
# EXPERT MODE - AWS KMS Infrastructure
# ══════════════════════════════════════════════════════════════
#
# OBJECTIVE: Prepare AWS KMS for MongoDB Client-Side Field Level Encryption
#
# Your solution must:
#   1. Create a symmetric Customer Master Key (CMK) in AWS KMS
#   2. Store its KeyId in variable: KMS_KEY_ID  
#   3. Create an alias pointing to this key: ${aliasName}
#
# Reference: AWS KMS CLI documentation
# Points available: 25 (if no hints used)
#
# ══════════════════════════════════════════════════════════════

# YOUR SOLUTION:


`,
            // Inline hints for Guided mode - line numbers match skeleton
            // L1-L7: comments, L8: empty, L9: KMS_KEY_ID line with _________ blank, L10: --description, L11: --query with _______ blank
            // L12-L21: more lines, L22: aws kms _____________ blank
            inlineHints: [
              {
                line: 9,
                blankText: '_________',
                hint: 'The AWS KMS command to create a new symmetric key',
                answer: 'create-key'
              },
              {
                line: 11,
                blankText: '_______',
                hint: 'JMESPath query to extract the key identifier',
                answer: 'KeyId'
              },
              {
                line: 22,
                blankText: '_____________',
                hint: 'AWS KMS command to assign a friendly name to a key',
                answer: 'create-alias'
              }
            ]
          }
        ],
        hints: [
          'Blank 1: The AWS KMS command to create a new key is "create-key" (no space). It creates a symmetric key by default.',
          'Blank 2: The JMESPath query to extract just the KeyId is "KeyId" - this returns only the UUID.',
          'Blank 3: The command to create an alias is "create-alias" (no space). It links a friendly name to your target key.'
        ],
        exercises: [
          {
            id: 'l1s1-quiz',
            type: 'quiz' as const,
            title: 'CMK Purpose',
            points: 5,
            question: 'What is the primary purpose of the Customer Master Key (CMK)?',
            options: [
              { id: 'a', label: 'Directly encrypt application data', isCorrect: false },
              { id: 'b', label: 'Wrap (encrypt) Data Encryption Keys', isCorrect: true },
              { id: 'c', label: 'Authenticate users to MongoDB', isCorrect: false },
              { id: 'd', label: 'Generate TLS certificates', isCorrect: false },
            ]
          }
        ],
        onVerify: async () => validatorUtils.checkKmsAlias(aliasName)
      },
      {
        id: 'lab-csfle-fundamentals-step-apply-key-policy',
        title: 'Infrastructure: Apply KMS Key Policy',
        estimatedTime: '5 min',
        description: 'A Common Pitfall: Even if your IAM User has permissions, the Key itself must *trust* you. You must explicity attach a Key Policy to the CMK to allow your IAM User to administer and use it.',
        tips: [
          'KMS keys use resource-based policies (like S3). The key must explicitly trust your IAM principal—this is a common cause of "access denied" in customer setups.',
          'In production, separate "Key Admin" vs "Key User" permissions. For this lab, you are both.'
        ],
        codeBlocks: [
          {
            filename: 'AWS CLI - Put Key Policy',
            language: 'bash',
            code: `# Run these commands in your terminal (AWS CLI must be configured).
# Re-run to get ID if needed
KMS_KEY_ID=$(aws kms describe-key --key-id ${aliasName} --query 'KeyMetadata.KeyId' --output text)
IAM_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Create a policy allowing YOU full access
cat <<EOF > policy.json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "Enable IAM User Permissions",
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::\${ACCOUNT_ID}:root"},
        "Action": "kms:*",
        "Resource": "*"
    }, {
        "Sid": "Allow My User",
        "Effect": "Allow",
        "Principal": {"AWS": "$IAM_ARN"},
        "Action": "kms:*",
        "Resource": "*"
    }]
}
EOF

aws kms put-key-policy --key-id $KMS_KEY_ID --policy-name default --policy file://policy.json`,
            // Tier 1: Guided
            skeleton: `# ══════════════════════════════════════════════════════════════
# Apply a Key Policy to Allow Your IAM User
# ══════════════════════════════════════════════════════════════
# Even if your IAM User has permissions, the Key itself must *trust* you.
#
# TASK: Fill in the AWS CLI commands to get your identity and apply the policy.

# Get the Key ID from your alias
KMS_KEY_ID=$(aws kms ____________ --key-id ${aliasName} --query 'KeyMetadata.KeyId' --output text)

# Get your IAM ARN and Account ID
IAM_ARN=$(aws sts ___________________ --query 'Arn' --output text)
ACCOUNT_ID=$(aws sts get-caller-identity --query '________' --output text)

# Create a policy allowing YOU full access
cat <<EOF > policy.json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "Enable IAM User Permissions",
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::\${ACCOUNT_ID}:root"},
        "Action": "kms:*",
        "Resource": "*"
    }, {
        "Sid": "Allow My User",
        "Effect": "Allow",
        "Principal": {"AWS": "$IAM_ARN"},
        "Action": "kms:*",
        "Resource": "*"
    }]
}
EOF

# Apply the policy to your CMK
aws kms ______________ --key-id $KMS_KEY_ID --policy-name default --policy file://policy.json`,
            // Tier 2: Challenge
            challengeSkeleton: `# ══════════════════════════════════════════════════════════════
# CHALLENGE MODE - Apply KMS Key Policy
# ══════════════════════════════════════════════════════════════

# TASK 1: Get your Key ID and IAM identity
# ─────────────────────────────────────────
# Requirements:
#   • Look up the KeyId using your alias: ${aliasName}
#   • Get your IAM ARN and Account ID
#   • Store them in variables: KMS_KEY_ID, IAM_ARN, ACCOUNT_ID

# Write your commands:


# TASK 2: Create a Key Policy JSON file
# ─────────────────────────────────────
# Requirements:
#   • Allow the account root full access
#   • Allow YOUR IAM user full access
#   • Save to a file called "policy.json"

# Write your heredoc or echo command:


# TASK 3: Apply the policy to your CMK
# ────────────────────────────────────
# Docs: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/put-key-policy.html

# Write your command:

`,
            // Tier 3: Expert
            expertSkeleton: `# ══════════════════════════════════════════════════════════════
# EXPERT MODE - Secure Your KMS Key
# ══════════════════════════════════════════════════════════════
#
# OBJECTIVE: Apply a resource-based policy to your KMS CMK
#
# Your solution must:
#   1. Look up the KeyId using your alias: ${aliasName}
#   2. Create a policy that allows your IAM identity to use the key
#   3. Apply the policy to the CMK
#
# Important: The key policy must grant at least these permissions:
#   - kms:Encrypt, kms:Decrypt, kms:GenerateDataKey
#
# Reference: AWS KMS Key Policies documentation
# Points available: 25 (if no hints used)
#
# ══════════════════════════════════════════════════════════════

# YOUR SOLUTION:


`
            ,
            // Inline hints for Guided mode - line numbers match skeleton exactly
            // L1-6: comments, L7: empty, L8: comment, L9: KMS_KEY_ID line with ____________ blank
            // L10-11: more lines, L12: IAM_ARN with ___________________ blank, L13: ACCOUNT_ID with ________ blank
            // L14-35: more lines, L36: aws kms ______________ blank
            inlineHints: [
              {
                line: 9,
                blankText: '____________',
                hint: 'AWS KMS command to get details about an existing key',
                answer: 'describe-key'
              },
              {
                line: 12,
                blankText: '___________________',
                hint: 'AWS STS command to get information about your identity',
                answer: 'get-caller-identity'
              },
              {
                line: 13,
                blankText: '________',
                hint: 'JMESPath query to extract your AWS Account ID',
                answer: 'Account'
              },
              {
                line: 36,
                blankText: '______________',
                hint: 'AWS KMS command to attach a policy to a key',
                answer: 'put-key-policy'
              }
            ]
          }
        ],
        hints: [
          'Blank 1: The command to get details about an existing key is "describe-key".',
          'Blank 2: The STS command to get your identity is "get-caller-identity".',
          'Blank 3: The query to extract your AWS Account ID is "Account".',
          'Blank 4: The command to attach a policy to a KMS key is "put-key-policy".'
        ],
        onVerify: async () => validatorUtils.checkKeyPolicy(aliasName)
      },
      {
        id: 'lab-csfle-fundamentals-step-init-keyvault',
        title: 'Initialize Key Vault with Unique Index',
        estimatedTime: '5 min',
        difficulty: 'basic' as DifficultyLevel,
        understandSection: 'The Key Vault is a special MongoDB collection that stores encrypted DEKs. A unique partial index on keyAltNames prevents duplicate key names. The collection name __keyVault is required by the MongoDB encryption driver.',
        doThisSection: [
          'Edit keyvault-setup.cjs (uses the Node.js driver)',
          'Run it from the Terminal with: node keyvault-setup.cjs'
        ],
        description: 'The Key Vault collection stores your encrypted DEKs. You MUST create a unique index manually. The driver does NOT do this for you. We use the database "encryption" and collection "__keyVault" because that is the namespace the CSFLE driver expects.',
        tips: [
          'Best practice: The unique partial index on keyAltNames is required by CSFLE. Share with customers: https://www.mongodb.com/docs/manual/core/index-partial/',
          'This step uses the MongoDB Node.js driver instead of mongosh; same result, run with node.'
        ],
        codeBlocks: [
          {
            filename: 'keyvault-setup.cjs',
            blockType: 'editor-window',
            language: 'javascript',
            code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  await db.collection("__keyVault").createIndex(
    { keyAltNames: 1 },
    { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
  );
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
            // Tier 1: Guided
            skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("_________");
  await db.collection("__keyVault").____________(
    { ___________: 1 },
    { unique: true, partialFilterExpression: { keyAltNames: { $_______: true } } }
  );
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
            challengeSkeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  // TASK: Create unique partial index on __keyVault for keyAltNames
  await db.collection("__keyVault").createIndex(/* ... */);
  console.log("Key Vault index created.");
  await client.close();
}
run().catch(console.dir);`,
            expertSkeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
async function run() {
  const client = await MongoClient.connect(uri);
  // TASK: Create unique partial index on encryption.__keyVault (keyAltNames)
  await client.close();
}
run().catch(console.dir);`,
            inlineHints: [
              { line: 7, blankText: '_________', hint: 'Database name for encryption key vault', answer: 'encryption' },
              { line: 8, blankText: '____________', hint: 'Method to create an index on a collection', answer: 'createIndex' },
              { line: 9, blankText: '___________', hint: 'Field that stores alternate names for DEKs', answer: 'keyAltNames' },
              { line: 10, blankText: '$_______', hint: 'Operator to check if a field exists', answer: 'exists' }
            ]
          },
          {
            filename: 'Terminal',
            blockType: 'terminal-window',
            language: 'bash',
            code: `node keyvault-setup.cjs`
          }
        ],
        hints: [
          'Blank 1: The database name for encryption operations is "encryption".',
          'Blank 2: The method to create an index in MongoDB is "createIndex".',
          'Blank 3: The field to index is "keyAltNames" - this stores the human-readable key names.',
          'Blank 4: The operator to check if a field exists is "$exists".'
        ],
        onVerify: async () => validatorUtils.checkKeyVault(mongoUri, 'encryption.__keyVault')
      },
      {
        id: 'lab-csfle-fundamentals-step-create-deks',
        title: 'Generate Data Encryption Keys (DEKs)',
        estimatedTime: '8 min',
        difficulty: 'intermediate' as DifficultyLevel,
        understandSection: 'The DEK (Data Encryption Key) is what actually encrypts your data. The CMK "wraps" the DEK, meaning the DEK is stored encrypted in MongoDB using the CMK from AWS KMS.',
        doThisSection: [
          'Create a Node.js script (createKey.cjs)',
          'Configure KMS providers with AWS credentials',
          'Use ClientEncryption.createDataKey() to generate and store the DEK',
          'Run the script with Node.js'
        ],
        description: 'Generate the actual keys used to encrypt data using a Node.js script with the mongodb-client-encryption library. Understanding createDataKey and keyAltNames helps you explain to customers how DEKs are created and stored. We create the DEK explicitly here so you see the key hierarchy (CMK → DEK); in production you can also let the driver create DEKs on first use (see CSFLE fundamentals in MongoDB docs).',
        tips: [
          'Note: First run npm install mongodb mongodb-client-encryption @aws-sdk/credential-providers',
          'Run this Node.js script in your terminal (not mongosh): node createKey.cjs',
          'Region: The script uses the default region (eu-central-1). To use another region, change the region in the masterKey object to your AWS region (e.g. us-east-1).',
          'In production, create different DEKs for different sensitivity levels.'
        ],
        codeBlocks: [
          {
            filename: 'createKey.cjs',
            blockType: 'editor-window',
            language: 'javascript',
            code: `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

// 1. Configuration
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  // Use default AWS SSO profile (or use fromSSO({ profile: 'your-profile' })() for a specific profile)
  const credentials = await fromSSO()();

  // MongoDB client encryption expects only: accessKeyId, secretAccessKey, sessionToken
  // Filter out expiration and other fields that AWS SDK includes
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-${suffix}-ssn-key";
  
  // Check if DEK already exists
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: keyAltName 
  });

  if (existingKey) {
    console.log("✓ DEK already exists with keyAltName:", keyAltName);
    console.log("  DEK UUID:", existingKey._id.toString());
    console.log("  Reusing existing key. No new key created.");
    await client.close();
    return;
  }

  // 2. Create the Data Key
  const dekId = await encryption.createDataKey("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion}" },
    keyAltNames: [keyAltName]
  });

  console.log("✓ Created new DEK UUID:", dekId.toString());
  console.log("  keyAltName:", keyAltName);
  await client.close();
}

run().catch(console.dir);`,
            skeleton: `// ══════════════════════════════════════════════════════════════
// Generate Data Encryption Key (DEK) using Node.js
// ══════════════════════════════════════════════════════════════
// The DEK is what actually encrypts your data. The CMK "wraps" the DEK.
// Create a file called "createKey.cjs" and run with: node createKey.cjs

const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";

async function run() {
  // Use default AWS SSO profile (or use fromSSO({ profile: 'your-profile' })() for a specific profile)
  const credentials = await fromSSO()();

  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  const keyAltName = "user-${suffix}-ssn-key";
  
  // Check if DEK already exists (idempotent operation)
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ 
    keyAltNames: keyAltName 
  });

  if (existingKey) {
    console.log("✓ DEK already exists with keyAltName:", keyAltName);
    console.log("  DEK UUID:", existingKey._id.toString());
    await client.close();
    return;
  }

  // TASK: Create the Data Encryption Key (fill in the method and option name)
  const dekId = await encryption.________________("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion}" },
    ___________: [keyAltName]
  });

  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}

run().catch(console.dir);`,
            // Inline hints: focus on createDataKey and keyAltNames (line numbers match skeleton)
            inlineHints: [
              {
                line: 44,
                blankText: '________________',
                hint: 'Method to generate a new Data Encryption Key',
                answer: 'createDataKey'
              },
              {
                line: 46,
                blankText: '___________',
                hint: 'Option to assign a human-readable name to the DEK',
                answer: 'keyAltNames'
              }
            ]
          },
          {
            filename: 'Terminal',
            blockType: 'terminal-window',
            language: 'bash',
            code: `# First, install dependencies (if not already done):
npm install mongodb mongodb-client-encryption @aws-sdk/credential-providers

# Run the script from the file above:
node createKey.cjs

# Expected Output:
# ✓ Created new DEK UUID: 7274650f-1ea0-48e1-b47e-33d3bba95a21
#   keyAltName: user-${suffix}-ssn-key
# (Your UUID will be different - save it for the next step!)`
          }
        ],
        hints: [
          'The method to create a new Data Encryption Key is "createDataKey".',
          'The option to give your DEK a human-readable name is "keyAltNames".'
        ],
        onVerify: async () => validatorUtils.checkDataKey(mongoUri, `user-${suffix}-ssn-key`)
      },
      {
        id: 'lab-csfle-fundamentals-step-verify-dek',
        title: 'Verify DEK Creation in Key Vault',
        estimatedTime: '5 min',
        description: 'Run a Node.js script that uses the MongoDB driver to query the key vault and verify that exactly one Data Encryption Key has been created. This is a critical verification step.',
        tips: [
          'This step confirms the DEK was successfully created and stored in the key vault.',
          'The key vault stores encrypted DEKs; the CMK encrypts these DEKs at rest.',
          'If you see 0 keys, re-run createKey.cjs. If you see multiple keys, you may have run it more than once.'
        ],
        codeBlocks: [
          {
            filename: 'keyvault-verify.cjs',
            blockType: 'editor-window',
            language: 'javascript',
            code: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("encryption");
  const docs = await db.collection("__keyVault").find({}).toArray();
  console.log("Key Vault documents:", docs.length);
  docs.forEach((d) => console.log(JSON.stringify(d, null, 2)));
  const count = await db.collection("__keyVault").countDocuments();
  console.log("Total keys:", count);
  await client.close();
}
run().catch(console.dir);`,
            skeleton: `const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

async function run() {
  const client = await MongoClient.connect(uri);
  const db = client.db("_________");
  const docs = await db.collection("__keyVault").______({}).toArray();
  console.log("Key Vault documents:", docs.length);
  docs.forEach((d) => console.log(JSON.stringify(d, null, 2)));
  const count = await db.collection("__keyVault").________________();
  console.log("Total keys:", count);
  await client.close();
}
run().catch(console.dir);`,
            inlineHints: [
              { line: 7, blankText: '_________', hint: 'Database name for encryption key vault', answer: 'encryption' },
              { line: 8, blankText: '______', hint: 'Method to read documents from a collection', answer: 'find' },
              { line: 11, blankText: '________________', hint: 'Method to count documents in a collection', answer: 'countDocuments' }
            ]
          },
          {
            filename: 'Terminal',
            blockType: 'terminal-window',
            language: 'bash',
            code: `node keyvault-verify.cjs`
          }
        ],
        onVerify: async () => validatorUtils.checkKeyVaultCount(1, mongoUri)
      },
      {
        id: 'lab-csfle-fundamentals-step-test-csfle',
        title: 'Test CSFLE: Insert & Query with Encryption',
        estimatedTime: '15 min',
        description: 'Create and run a Node.js test script that demonstrates the difference between encrypted and non-encrypted connections. This proves that CSFLE is working by showing ciphertext vs plaintext side-by-side.',
        tips: [
          'Run this Node.js script in your terminal (not mongosh): node testCSFLE.cjs',
          'Use the same MongoDB URI in testCSFLE.cjs as in Lab Setup. Verification checks the cluster from Lab Setup.',
          'This side-by-side comparison is a strong SA demo for showing CSFLE in action.',
          'The encrypted client automatically encrypts on write and decrypts on read.',
          'Use keyAltNames instead of keyId for better maintainability and key rotation support.'
        ],
        codeBlocks: [
          {
            filename: '1. testCSFLE.cjs',
            language: 'javascript',
            code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyAltName = "user-${suffix}-ssn-key";

async function run() {
  // Use default AWS SSO profile (or use fromSSO({ profile: 'your-profile' })() for a specific profile)
  const credentials = await fromSSO()();

  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // Look up DEK by keyAltName (BEST PRACTICE - use altName instead of hardcoding UUID)
  // Then use the keyId in schemaMap (CSFLE requires keyId, not keyAltName)
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });

  if (!keyDoc) {
    throw new Error(\`Key with altName "\${keyAltName}" not found. Run createKey.cjs first to create the DEK.\`);
  }

  const dekId = keyDoc._id; // This is already a Binary UUID
  console.log(\`Found DEK by altName "\${keyAltName}": \${dekId.toString('base64')}\`);
  await keyVaultClient.close();

  // Schema Map for CSFLE
  // NOTE: CSFLE schemaMap uses keyId (array of Binary UUIDs), NOT keyAltName
  // Queryable Encryption uses keyAltName, but CSFLE uses keyId
  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId] // CSFLE requires keyId (Binary UUID), not keyAltName
          }
        }
      }
    }
  };

  // 1. STANDARD CONNECTION (No CSFLE)
  console.log("\\n=== WITHOUT CSFLE ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("medical");

  // Clean up any existing test data to avoid conflicts
  await standardDb.collection("patients").deleteMany({ 
    $or: [
      { name: "Alice Johnson" },
      { name: "Bob Smith" }
    ]
  });

  // Insert with standard client
  await standardDb.collection("patients").insertOne({
    name: "Alice Johnson",
    ssn: "123-45-6789",
    dob: "1990-01-15"
  });

  // Query with standard client - SSN will be PLAINTEXT in DB
  const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
  console.log("Data in Database (Unencrypted):", docStandard);
  console.log("SSN stored as:", docStandard.ssn); // Plain text!

  await clientStandard.close();

  // 2. CSFLE-ENABLED CONNECTION${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}
  console.log("\\n=== WITH CSFLE ===");
  const clientEncrypted = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      schemaMap,
      bypassQueryAnalysis: false${cryptSharedLibPath ? ',\n      ...extraOptions' : ''} // Allow query analysis for deterministic encryption
    }
  });
  await clientEncrypted.connect();
  const encryptedDb = clientEncrypted.db("medical");

  // Insert with CSFLE client - SSN auto-encrypted
  await encryptedDb.collection("patients").insertOne({
    name: "Bob Smith",
    ssn: "987-65-4321",
    dob: "1985-06-20"
  });
  console.log("Inserted Bob Smith with CSFLE (SSN encrypted before sending to DB)");

  // Query with CSFLE client - SSN auto-decrypted
  // Use a more specific query to avoid MongoDB trying to decrypt Alice's plaintext document
  // Query by the encrypted SSN value (deterministic encryption allows equality queries)
  try {
    const docEncrypted = await encryptedDb.collection("patients").findOne({ 
      name: "Bob Smith"
    });
    
    if (docEncrypted) {
      console.log("Data retrieved (Auto-decrypted):", docEncrypted);
      console.log("SSN returned as:", docEncrypted.ssn); // Decrypted!
    } else {
      console.log("⚠️  Document not found");
    }
  } catch (error) {
    console.error("❌ Error during decryption:", error.message);
    console.log("\\n💡 Troubleshooting:");
    console.log("1. Verify KMS key policy allows kms:Decrypt for your SSO role");
    console.log("2. Check if AWS SSO session is still valid: aws sso login");
    console.log("3. Verify DEK exists: Check encryption.__keyVault collection");
    console.log("4. The error might occur if MongoDB tries to decrypt Alice's plaintext document");
    console.log("   Try deleting Alice's document first or query only Bob's document");
    throw error;
  }

  await clientEncrypted.close();

  // 3. THE PROOF: Query encrypted data WITHOUT CSFLE
  console.log("\\n=== PROOF: Query Bob's record WITHOUT CSFLE ===");
  const clientProof = new MongoClient(uri);
  await clientProof.connect();
  const proofDb = clientProof.db("medical");

  const docProof = await proofDb.collection("patients").findOne({ name: "Bob Smith" });
  console.log("Bob's data WITHOUT CSFLE client:", docProof);
  console.log("SSN field type:", docProof.ssn.constructor.name); // Binary!
  console.log("This is ciphertext - unreadable without the DEK!");

  await clientProof.close();
}

run().catch(console.error);`,
            // Skeleton with blanks for key CSFLE concepts
            skeleton: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyAltName = "user-${suffix}-ssn-key";

async function run() {
  // Use default AWS SSO profile (or use fromSSO({ profile: 'your-profile' })() for a specific profile)
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // Look up DEK by keyAltName (BEST PRACTICE)
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db("encryption");
  const keyDoc = await keyVaultDB.collection("__keyVault").findOne({ _____________: keyAltName });
  const dekId = keyDoc._id;
  await keyVaultClient.close();

  // Schema Map for CSFLE - defines which fields to encrypt
  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "_______": {                              // BLANK 2: encryption config key
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-___________",  // BLANK 3: algorithm type
            "keyId": [dekId]
          }
        }
      }
    }
  };

  // 1. STANDARD CONNECTION (No CSFLE) - Insert unencrypted data
  console.log("\\n=== WITHOUT CSFLE ===");
  const clientStandard = new MongoClient(uri);
  await clientStandard.connect();
  const standardDb = clientStandard.db("medical");
  await standardDb.collection("patients").deleteMany({ name: "Alice Johnson" });
  await standardDb.collection("patients").insertOne({
    name: "Alice Johnson",
    ssn: "123-45-6789",
    dob: "1990-01-15"
  });
  const docStandard = await standardDb.collection("patients").findOne({ name: "Alice Johnson" });
  console.log("SSN stored as:", docStandard.ssn); // Plain text!
  await clientStandard.close();

  // 2. CSFLE-ENABLED CONNECTION - Uses autoEncryption${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}
  console.log("\\n=== WITH CSFLE ===");
  const clientEncrypted = new MongoClient(uri, {
    ______________: {                               // BLANK 4: auto encryption config key
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders,
      schemaMap${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });
  await clientEncrypted.connect();
  const encryptedDb = clientEncrypted.db("medical");

  await encryptedDb.collection("patients").insertOne({
    name: "Bob Smith",
    ssn: "987-65-4321",
    dob: "1985-06-20"
  });
  console.log("Inserted Bob Smith with CSFLE (SSN encrypted)");

  const docEncrypted = await encryptedDb.collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN returned as:", docEncrypted.ssn); // Decrypted!
  await clientEncrypted.close();

  // 3. THE PROOF: Query encrypted data WITHOUT CSFLE
  console.log("\\n=== PROOF: Query Bob's record WITHOUT CSFLE ===");
  const clientProof = new MongoClient(uri);
  await clientProof.connect();
  const docProof = await clientProof.db("medical").collection("patients").findOne({ name: "Bob Smith" });
  console.log("SSN field type:", docProof.ssn.constructor.name); // Binary = ciphertext!
  await clientProof.close();
}

run().catch(console.error);`,
            // Inline hints for the skeleton
            inlineHints: [
              {
                line: 24,
                blankText: '_____________',
                hint: 'The field in __keyVault that stores human-readable key names',
                answer: 'keyAltNames'
              },
              {
                line: 34,
                blankText: '_______',
                hint: 'Schema map keyword to specify field should be encrypted',
                answer: 'encrypt'
              },
              {
                line: 36,
                blankText: '___________',
                hint: 'Algorithm suffix for fields that need equality queries',
                answer: 'Deterministic'
              },
              {
                line: cryptSharedLibPath ? 66 : 62,
                blankText: '______________',
                hint: 'MongoClient option that enables automatic encryption',
                answer: 'autoEncryption'
              }
            ]
          },
          {
            filename: 'Terminal',
            language: 'bash',
            code: `# Run in your terminal (NOT in mongosh):
node testCSFLE.cjs

# Expected Output:
# === WITHOUT CSFLE ===
# Data in Database (Unencrypted): { name: 'Alice Johnson', ssn: '123-45-6789', ... }
# SSN stored as: 123-45-6789
#
# === WITH CSFLE ===
# Inserted Bob Smith with CSFLE (SSN encrypted before sending to DB)
# Data retrieved (Auto-decrypted): { name: 'Bob Smith', ssn: '987-65-4321', ... }
# SSN returned as: 987-65-4321
#
# === PROOF: Query Bob's record WITHOUT CSFLE ===
# Bob's data WITHOUT CSFLE client: { name: 'Bob Smith', ssn: Binary(...), ... }
# SSN field type: Binary
# This is ciphertext - unreadable without the DEK!`
          }
        ],
        onVerify: async () => validatorUtils.checkFieldEncrypted(mongoUri, 'medical', 'patients', 'ssn')
      },
      {
        id: 'lab-csfle-fundamentals-step-complete-application',
        title: 'The Complete Application',
        estimatedTime: '10 min',
        description: 'Bringing it all together. Here is the full, clean code for a production-ready CSFLE application. Notice it is only ~50 lines of code!',
        tips: [
          'BEST PRACTICE: Use keyAltNames instead of keyId for easier key rotation and management.',
          'SIMPLICITY: Once configured, the rest of your app code (Insert/Find) is unchanged.',
          'PRODUCTION TIP: Keep your schemaMap external or generated dynamically.'
        ],
        codeBlocks: [
          {
            filename: 'app.cjs (The Final Product)',
            language: 'javascript',
            code: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

// --- CONFIGURATION ---
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";
const keyAltName = "user-${suffix}-ssn-key";

async function main() {
  // Use default AWS SSO profile (same as Step 6 / testCSFLE.cjs)
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // BEST PRACTICE: Look up DEK by alternative name
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const [db, coll] = keyVaultNamespace.split('.');
  const keyDoc = await keyVaultClient.db(db).collection(coll).findOne({ keyAltNames: keyAltName });
  const dekId = keyDoc._id;
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "bsonType": "object",
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId] // Looked up by altName
          }
        }
      }
    }
  };

  // 1. Initialize Client with AutoEncryption${cryptSharedLibPath ? `
  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      schemaMap${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });

  try {
    await client.connect();
    const db = client.db("medical");
    
    // 2. Insert (Transparently Encrypted)
    await db.collection("patients").insertOne({
      name: "Alice",
      ssn: "987-65-4321" // Becomes BinData in Atlas
    });
    console.log("Document inserted (Encrypted in Atlas).");

    // 3. Query (Transparently Decrypted)
    const doc = await db.collection("patients").findOne({ ssn: "987-65-4321" });
    console.log("Decrypted Document:", doc);

  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
            // Skeleton with blanks for production CSFLE patterns
            skeleton: `const { MongoClient } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

// --- CONFIGURATION ---
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "encryption.__keyVault";
const keyAltName = "user-${suffix}-ssn-key";

async function main() {
  const credentials = await fromSSO()();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  // BEST PRACTICE: Look up DEK by alternative name
  const keyVaultClient = new MongoClient(uri);
  await keyVaultClient.connect();
  const [db, coll] = keyVaultNamespace._____(\'.\');    // BLANK 1: string method
  const keyDoc = await keyVaultClient.db(db).collection(coll).findOne({ keyAltNames: keyAltName });
  const dekId = keyDoc._____;                           // BLANK 2: document field
  await keyVaultClient.close();

  const schemaMap = {
    "medical.patients": {
      "_______": "object",                              // BLANK 3: BSON type key
      "properties": {
        "ssn": {
          "encrypt": {
            "bsonType": "string",
            "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            "keyId": [dekId]
          }
        }
      }
    }
  };${cryptSharedLibPath ? `

  const extraOptions = {
    cryptSharedLibPath: "${cryptSharedLibPath}",
    cryptSharedLibRequired: false
  };` : ''}

  const client = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      _____________,                                   // BLANK 4: KMS config object
      schemaMap${cryptSharedLibPath ? ',\n      ...extraOptions' : ''}
    }
  });

  try {
    await client.connect();
    const db = client.db("medical");
    
    await db.collection("patients").insertOne({
      name: "Alice",
      ssn: "987-65-4321"
    });
    console.log("Document inserted (Encrypted in Atlas).");

    const doc = await db.collection("patients").findOne({ ssn: "987-65-4321" });
    console.log("Decrypted Document:", doc);

  } finally {
    await client.close();
  }
}

main().catch(console.error);`,
            // Inline hints for the skeleton (line numbers after uri + guard lines)
            inlineHints: [
              {
                line: 24,
                blankText: '_____',
                hint: 'JavaScript string method to divide into array of substrings',
                answer: 'split'
              },
              {
                line: 26,
                blankText: '_____',
                hint: 'MongoDB document field that stores the primary key',
                answer: '_id'
              },
              {
                line: 31,
                blankText: '_______',
                hint: 'JSON Schema keyword to specify the BSON type',
                answer: 'bsonType'
              },
              {
                line: cryptSharedLibPath ? 56 : 52,
                blankText: '_____________',
                hint: 'Object that contains AWS KMS credentials configuration',
                answer: 'kmsProviders'
              }
            ]
          },
          {
            filename: 'Terminal',
            language: 'bash',
            code: `# Run the complete CSFLE application:
node app.cjs

# Expected Output:
# ✓ Connected to MongoDB with CSFLE enabled
# ✓ Inserted encrypted patient record
# ✓ Query result (automatically decrypted):
#   { name: "Alice", ssn: "987-65-4321" }
#
# Verify encryption in mongosh (as a DBA would see it):
# mongosh (use same URI as MONGODB_URI / Lab Setup)
# use medical
# db.patients.findOne()
# // SSN appears as Binary (Subtype 6) - encrypted ciphertext!`
          }
        ],
        onVerify: async () => { return { success: true, message: 'Lab 1 Complete! You have built a secure app.' }; }
      }
    ];

  const introContent = {
    whatYouWillBuild: [
      'Create a Customer Master Key (CMK) in AWS KMS',
      'Generate Data Encryption Keys (DEKs) stored in MongoDB',
      'Implement automatic field-level encryption',
      'Demonstrate the "proof": DBAs only see ciphertext'
    ],
    keyConcepts: [
      {
        term: 'Envelope Encryption',
        explanation: 'A two-tier key system where the CMK (Customer Master Key) wraps/encrypts the DEK (Data Encryption Key). The DEK encrypts your actual data.'
      },
      {
        term: 'Client-Side Encryption',
        explanation: 'Data is encrypted BEFORE it leaves your application. MongoDB never sees plaintext - this is fundamentally different from TDE (Transparent Data Encryption).'
      },
      {
        term: 'Deterministic vs Random Algorithms',
        explanation: 'Deterministic encryption allows equality queries on encrypted data. Random encryption is more secure but doesn\'t support queries.'
      }
    ],
    keyInsight: 'The breakthrough: MongoDB never sees plaintext. Ever. The client library encrypts BEFORE the data leaves your application. This is fundamentally different from TDE.',
    showEncryptionFlow: true,
    encryptionFlowType: 'csfle' as const,
    architectureDiagram: <CSFLEArchitectureDiagram />
  };

  // Exercises for Lab 1
  const exercises = [
    {
      id: 'lab1-quiz-1',
      type: 'quiz' as const,
      title: 'Encryption Algorithm Choice',
      description: 'Understanding when to use which encryption algorithm',
      points: 10,
      question: 'You need to query patients by their SSN (Social Security Number). Which CSFLE algorithm should you use?',
      options: [
        { id: 'random', label: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random', isCorrect: false },
        { id: 'deterministic', label: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic', isCorrect: true },
        { id: 'both', label: 'Either algorithm works for equality queries', isCorrect: false },
        { id: 'neither', label: 'CSFLE does not support queries on encrypted fields', isCorrect: false },
      ]
    },
    {
      id: 'lab1-quiz-2',
      type: 'quiz' as const,
      title: 'Key Hierarchy Understanding',
      description: 'Understanding the envelope encryption key hierarchy',
      points: 10,
      question: 'In CSFLE, which key directly encrypts your application data?',
      options: [
        { id: 'cmk', label: 'Customer Master Key (CMK)', isCorrect: false },
        { id: 'dek', label: 'Data Encryption Key (DEK)', isCorrect: true },
        { id: 'tls', label: 'TLS Certificate Key', isCorrect: false },
        { id: 'atlas', label: 'Atlas Cluster Key', isCorrect: false },
      ]
    },
    {
      id: 'lab1-fill-blank',
      type: 'fill_blank' as const,
      title: 'Complete the Schema Map',
      description: 'Fill in the missing parts of a CSFLE schema map',
      points: 15,
      codeTemplate: `const schemaMap = {
  "medical.patients": {
    "bsonType": "object",
    "properties": {
      "ssn": {
        "encrypt": {
          "bsonType": "______",
          "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-______",
          "keyId": [dekId]
        }
      }
    }
  }
};`,
      blanks: [
        { id: 'bsonType', placeholder: 'BSON Type', correctAnswer: 'string', hint: 'SSN is stored as text' },
        { id: 'algorithm', placeholder: 'Algorithm suffix', correctAnswer: 'Deterministic', hint: 'Needed for equality queries' },
      ]
    },
    {
      id: 'lab1-challenge',
      type: 'challenge' as const,
      title: 'Security Audit Challenge',
      description: 'Complete these security audit steps',
      points: 20,
      challengeSteps: [
        { instruction: 'Verify your CMK has key rotation enabled in AWS Console', hint: 'KMS > Customer managed keys > Key rotation' },
        { instruction: 'Confirm the Key Policy allows only your IAM user', hint: 'Check the Principal field in the policy' },
        { instruction: 'Check that the DEK in __keyVault has masterKey.provider set to "aws"', hint: 'Use db.getCollection("__keyVault").findOne()' },
        { instruction: 'Verify encrypted documents show BinData in Atlas Data Explorer', hint: 'Look for subtype 6 in the binary data' },
      ]
    }
  ];

  // Per-cloud code blocks for create DEK step (l1s5): AWS uses full step; Azure/GCP use cloud snippets
  const stepsToUse = cloud === 'aws'
    ? lab1Steps
    : lab1Steps.map((step) => {
        if (step.id !== 'lab-csfle-fundamentals-step-create-deks') return step;
        const opts = {
          mongoUri,
          suffix,
          aliasName,
          awsRegion: awsDefaultRegion || awsRegion,
        };
        return {
          ...step,
          codeBlocks: [
            {
              filename: 'createKey.cjs',
              blockType: 'editor-window',
              language: 'javascript',
              code: getCreateKeyCodeBlock(cloud, opts),
            },
            {
              filename: 'Terminal',
              blockType: 'terminal-window',
              language: 'bash',
              code: getCreateKeyTerminalBlock(cloud),
            },
          ],
        };
      });

  const stepEnhancements = createStepEnhancements(stepsToUse);
  return (
    <LabRunner
      labNumber={1}
      labId="lab-csfle-fundamentals"
      stepEnhancements={stepEnhancements}
      introContent={introContent}
      businessValue="Protect PII at the application layer before it reaches the database"
      atlasCapability="Client-Side Field Level Encryption"
    />
  );
}
