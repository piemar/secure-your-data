import type { Step } from '@/components/labs/LabViewWithTabs';

/**
 * Component Registry for Dynamic Enhancement Content
 * 
 * Provides reusable components that can be referenced from enhancement metadata
 * via componentId. This allows dynamic content generation (e.g., AWS KMS code
 * with user-specific aliases, MongoDB connection strings, etc.)
 */

type ComponentFactory = (props: Record<string, any>) => Partial<Step>;

export const enhancementComponents: Record<string, ComponentFactory> = {
  /**
   * Verification component for rich query compound queries
   */
  'verification.richQueryCompound': (props) => ({
    onVerify: async () => {
      // Dynamic verification logic can be added here
      // For now, return a placeholder
      return { success: true, message: 'Query verified successfully' };
    },
  }),

  /**
   * AWS KMS code block generator
   * Props: { aliasName: string, region?: string, filename?: string }
   */
  'codeBlock.awsKms': (props) => {
    const aliasName = props.aliasName || 'alias/mongodb-lab-key';
    const region = props.region || 'eu-central-1';
    const filename = props.filename || 'aws-kms.sh';

    return {
      codeBlocks: [
        {
          filename,
          language: 'bash',
          code: `# Create CMK
KMS_KEY_ID=$(aws kms create-key --description "MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)

# Create alias
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias: ${aliasName}"`,
          skeleton: `# Create CMK
KMS_KEY_ID=$(aws kms _________ --description "MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)

# Create alias
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID`,
        },
      ],
    };
  },

  /**
   * MongoDB connection code block generator
   * Props: { uri?: string, filename?: string, dbName?: string }
   */
  'codeBlock.mongoConnection': (props) => {
    const uri = props.uri || 'YOUR_ATLAS_URI_STRING';
    const filename = props.filename || 'connect.js';
    const dbName = props.dbName || 'test';

    return {
      codeBlocks: [
        {
          filename,
          language: 'javascript',
          code: `const { MongoClient } = require('mongodb');

const client = new MongoClient('${uri}');
await client.connect();
const db = client.db('${dbName}');
const collection = db.collection('myCollection');`,
          skeleton: `const { MongoClient } = require('mongodb');

const client = new MongoClient('_________');
await client.connect();
const db = client.db('${dbName}');`,
        },
      ],
    };
  },

  /**
   * Python MongoDB connection code block generator
   * Props: { uri?: string, filename?: string, dbName?: string }
   */
  'codeBlock.mongoConnectionPython': (props) => {
    const uri = props.uri || 'YOUR_ATLAS_URI_STRING';
    const filename = props.filename || 'connect.py';
    const dbName = props.dbName || 'test';

    return {
      codeBlocks: [
        {
          filename,
          language: 'python',
          code: `from pymongo import MongoClient

client = MongoClient("${uri}")
db = client["${dbName}"]
collection = db["myCollection"]`,
          skeleton: `from pymongo import MongoClient

client = MongoClient("_________")
db = client["${dbName}"]`,
        },
      ],
    };
  },
};
