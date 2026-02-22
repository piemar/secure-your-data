import type { CloudProvider } from '@/types/cloud';

/** Options used to fill in createKey / DEK snippets (AWS: alias + region; Azure: endpoint + key; GCP: project/location/ring/key). */
export interface CreateKeySnippetOptions {
  mongoUri: string;
  suffix: string;
  /** AWS */
  aliasName?: string;
  awsRegion?: string;
  /** Azure */
  keyVaultEndpoint?: string;
  keyName?: string;
  /** GCP */
  projectId?: string;
  location?: string;
  keyRing?: string;
  keyNameGcp?: string;
}

/** Returns the createKey.cjs code block content for the given cloud. */
export function getCreateKeyCodeBlock(cloud: CloudProvider, opts: CreateKeySnippetOptions): string {
  const { mongoUri, suffix } = opts;
  const keyVaultNamespace = 'encryption.__keyVault';
  const keyAltName = `user-${suffix}-ssn-key`;

  if (cloud === 'aws') {
    const aliasName = opts.aliasName ?? `alias/mongodb-lab-key-${suffix}`;
    const awsRegion = opts.awsRegion ?? 'eu-central-1';
    return `const { MongoClient, ClientEncryption } = require("mongodb");
const { fromSSO } = require("@aws-sdk/credential-providers");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "${keyVaultNamespace}";

async function run() {
  const credentials = await fromSSO({ profile: 'YOUR_SSO_PROFILE' })();
  const kmsProviders = {
    aws: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, { keyVaultNamespace, kmsProviders });

  const keyAltName = "${keyAltName}";
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });
  if (existingKey) {
    console.log("✓ DEK already exists:", keyAltName);
    await client.close();
    return;
  }

  const dekId = await encryption.createDataKey("aws", {
    masterKey: { key: "${aliasName}", region: "${awsRegion}" },
    keyAltNames: [keyAltName]
  });
  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}
run().catch(console.dir);`;
  }

  if (cloud === 'azure') {
    const endpoint = opts.keyVaultEndpoint ?? 'https://YOUR_KEY_VAULT_NAME.vault.azure.net';
    const keyName = opts.keyName ?? 'lab-cmk';
    return `const { MongoClient, ClientEncryption } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "${keyVaultNamespace}";

async function run() {
  const kmsProviders = {
    azure: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, { keyVaultNamespace, kmsProviders });

  const keyAltName = "${keyAltName}";
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });
  if (existingKey) {
    console.log("✓ DEK already exists:", keyAltName);
    await client.close();
    return;
  }

  const dekId = await encryption.createDataKey("azure", {
    masterKey: {
      keyVaultEndpoint: "${endpoint}",
      keyName: "${keyName}"
    },
    keyAltNames: [keyAltName]
  });
  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}
run().catch(console.dir);`;
  }

  // GCP
  const projectId = opts.projectId ?? 'your-gcp-project';
  const location = opts.location ?? 'global';
  const keyRing = opts.keyRing ?? 'lab-keyring';
  const keyNameGcp = opts.keyNameGcp ?? 'lab-cmk';
  return `const { MongoClient, ClientEncryption } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
const keyVaultNamespace = "${keyVaultNamespace}";

async function run() {
  const kmsProviders = {
    gcp: {
      email: process.env.GCP_EMAIL,
      privateKey: process.env.GCP_PRIVATE_KEY
    }
  };

  const client = await MongoClient.connect(uri);
  const encryption = new ClientEncryption(client, { keyVaultNamespace, kmsProviders });

  const keyAltName = "${keyAltName}";
  const keyVaultDB = client.db("encryption");
  const existingKey = await keyVaultDB.collection("__keyVault").findOne({ keyAltNames: keyAltName });
  if (existingKey) {
    console.log("✓ DEK already exists:", keyAltName);
    await client.close();
    return;
  }

  const dekId = await encryption.createDataKey("gcp", {
    masterKey: {
      projectId: "${projectId}",
      location: "${location}",
      keyRing: "${keyRing}",
      keyName: "${keyNameGcp}"
    },
    keyAltNames: [keyAltName]
  });
  console.log("✓ Created new DEK UUID:", dekId.toString());
  await client.close();
}
run().catch(console.dir);`;
}

/** Terminal run snippet for createKey (cloud-specific deps). */
export function getCreateKeyTerminalBlock(cloud: CloudProvider): string {
  if (cloud === 'aws') {
    return `# Install dependencies:
npm install mongodb mongodb-client-encryption @aws-sdk/credential-providers

# Run (after: aws sso login):
node createKey.cjs`;
  }
  if (cloud === 'azure') {
    return `# Install dependencies:
npm install mongodb mongodb-client-encryption

# Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, then:
node createKey.cjs`;
  }
  return `# Install dependencies:
npm install mongodb mongodb-client-encryption

# Set GCP_EMAIL and GCP_PRIVATE_KEY, then:
node createKey.cjs`;
}
