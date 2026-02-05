import { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { fromSSO } from "@aws-sdk/credential-providers";

export type KmsProviderType = "aws";

export interface KmsProviderConfigBase {
  type: KmsProviderType;
}

export interface AwsKmsProviderConfig extends KmsProviderConfigBase {
  type: "aws";
  region: string;
  keyArn?: string;
  profile?: string;
}

export type KmsProviderConfig = AwsKmsProviderConfig;

/**
 * KmsProvider is an abstraction over cloud KMS services (AWS, Azure, GCP, etc.).
 * For now we only support AWS KMS and use it to obtain credentials suitable
 * for use with mongodb-client-encryption.
 */
export interface KmsProvider {
  /**
   * Returns the credentials required for the MongoDB client encryption
   * `kmsProviders` configuration.
   */
  getMongoKmsProviders(): Promise<Record<string, any>>;

  /**
   * Returns the masterKey object to use when creating DEKs.
   */
  getMasterKey(): Promise<Record<string, any>>;
}

export class AwsKmsProvider implements KmsProvider {
  private config: AwsKmsProviderConfig;
  private credentialsProvider: Provider<AwsCredentialIdentity>;

  constructor(config: AwsKmsProviderConfig) {
    this.config = config;
    // For the workshop we explicitly use SSO-based credentials by default
    this.credentialsProvider = fromSSO({
      profile: config.profile,
    });
  }

  async getMongoKmsProviders(): Promise<Record<string, any>> {
    const credentials = await this.credentialsProvider();

    return {
      aws: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    };
  }

  async getMasterKey(): Promise<Record<string, any>> {
    return {
      key: this.config.keyArn,
      region: this.config.region,
    };
  }
}

export function createKmsProvider(config: KmsProviderConfig): KmsProvider {
  switch (config.type) {
    case "aws":
      return new AwsKmsProvider(config);
    default:
      throw new Error(`Unsupported KMS provider type: ${config.type}`);
  }
}

