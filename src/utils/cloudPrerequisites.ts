import type { CloudProvider } from '@/types/cloud';

export interface PrerequisiteItem {
  id: string;
  label: string;
  description: string;
  installCommand?: string;
  downloadUrl?: string;
  required: boolean;
  /** Label passed to check-tool (e.g. 'AWS CLI' -> aws, 'Azure CLI' -> az) */
  checkToolLabel?: string;
  setupInstructions?: string[];
}

const SHARED_PREREQS: PrerequisiteItem[] = [
  { id: 'mongosh', label: 'mongosh', description: 'MongoDB Shell (Tip: Use .editor for multiline code)', installCommand: 'brew install mongodb-community-shell', downloadUrl: 'https://www.mongodb.com/try/download/shell', required: true, checkToolLabel: 'mongosh', setupInstructions: ['macOS: brew install mongosh', 'Verify: mongosh --version', '', 'Use .editor for multiline scripts.'] },
  { id: 'node', label: 'Node.js v18+', description: 'JavaScript runtime', installCommand: 'brew install node', downloadUrl: 'https://nodejs.org/', required: true, checkToolLabel: 'node', setupInstructions: ['macOS: brew install node', 'Verify: node --version'] },
  { id: 'npm', label: 'npm', description: 'Package manager (comes with Node.js)', installCommand: 'Included with Node.js', required: true, checkToolLabel: 'npm', setupInstructions: ['Included with Node.js', 'Verify: npm --version'] },
  { id: 'mongoCryptShared', label: 'mongo_crypt_shared', description: 'Required for Lab 1 (CSFLE) and Lab 2 (Queryable Encryption) — replaces mongocryptd for client-side encryption', installCommand: 'Download from MongoDB', downloadUrl: 'https://www.mongodb.com/try/download/crypt-shared', required: true, checkToolLabel: 'mongo_crypt_shared', setupInstructions: ['Download from MongoDB Download Center', 'Extract and set cryptSharedLibPath in scripts.'] },
];

const AWS_CLI_PREREQ: PrerequisiteItem = {
  id: 'awsCli',
  label: 'AWS CLI v2 + SSO',
  description: 'Required for KMS operations',
  installCommand: 'brew install awscli',
  downloadUrl: 'https://aws.amazon.com/cli/',
  required: true,
  checkToolLabel: 'AWS CLI',
  setupInstructions: [
    '── Install ──',
    'macOS: brew install awscli',
    '',
    '── Configure SSO ──',
    'aws configure sso',
    'aws sso login',
    'aws sts get-caller-identity',
  ],
};

const AZURE_CLI_PREREQ: PrerequisiteItem = {
  id: 'azureCli',
  label: 'Azure CLI',
  description: 'Required for Key Vault operations',
  installCommand: 'brew install azure-cli',
  downloadUrl: 'https://docs.microsoft.com/en-us/cli/azure/install-azure-cli',
  required: true,
  checkToolLabel: 'az',
  setupInstructions: ['Install Azure CLI', 'az login', 'Create Key Vault and key; note endpoint and key name.'],
};

const GCLOUD_PREREQ: PrerequisiteItem = {
  id: 'gcloud',
  label: 'Google Cloud SDK (gcloud)',
  description: 'Required for Cloud KMS operations',
  installCommand: 'brew install google-cloud-sdk',
  downloadUrl: 'https://cloud.google.com/sdk/docs/install',
  required: true,
  checkToolLabel: 'gcloud',
  setupInstructions: ['Install gcloud', 'gcloud auth application-default login', 'Create key in Cloud KMS; note project, location, key ring, key name.'],
};

export function getPrerequisitesForCloud(cloud: CloudProvider): PrerequisiteItem[] {
  const cloudTool = cloud === 'aws' ? AWS_CLI_PREREQ : cloud === 'azure' ? AZURE_CLI_PREREQ : GCLOUD_PREREQ;
  return [cloudTool, ...SHARED_PREREQS];
}

/** Tool IDs that are checked for "required" gate (e.g. to enable labs). */
export function getRequiredToolIdsForCloud(cloud: CloudProvider): string[] {
  const prereqs = getPrerequisitesForCloud(cloud);
  return prereqs.filter((p) => p.required).map((p) => p.id);
}
