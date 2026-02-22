/**
 * Cloud provider and workshop config types.
 * Used to switch UI, prerequisites, code snippets, and verification by provider.
 */

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export type DeploymentMode = 'local' | 'central';

export interface WorkshopConfigResponse {
  cloud: CloudProvider;
  /** When 'central', server cannot verify attendee's machine; show checklist and message. */
  deploymentMode?: DeploymentMode;
  runningInContainer?: boolean;
  awsDefaultRegion?: string;
  azureKeyVaultSuffix?: string;
  gcpDefaultLocation?: string;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  awsKeyArn: string;
  awsRegion: string;
}

export interface AzureCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  keyVaultEndpoint: string;
  keyName: string;
}

export interface GcpCredentials {
  email: string;
  privateKey: string;
  projectId: string;
  location: string;
  keyRing: string;
  keyName: string;
}

export type KmsCredentials = AwsCredentials | AzureCredentials | GcpCredentials;
