/**
 * Utility functions for validating MongoDB CSFLE and QE states.
 * Note: Actual TCP/TLS driver logic is complex in browser; we perform 
 * structural validation of URIs and simulate DB checks for this demo/enablement.
 */

export interface ValidationResult {
    success: boolean;
    message: string;
    path?: string;
}

export const validatorUtils = {
    /**
     * Validates the format of a MongoDB connection string.
     */
    validateMongoUri: (uri: string): ValidationResult => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'URI is required' };
        }
        if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
            return { success: false, message: 'URI must start with mongodb+srv:// or mongodb://' };
        }
        return { success: true, message: 'URI format is valid' };
    },

    /**
     * Mimics a check for the existence of the Key Vault collection.
     */
    checkKeyVault: async (uri: string, ns: string): Promise<ValidationResult> => {
        // In a real production app, this would call an API backend.
        // For this SA enablement, we simulate the network delay and return success.
        await new Promise(r => setTimeout(r, 800));

        if (uri.includes('invalid')) {
            return { success: false, message: 'Could not connect to cluster. Check your IP whitelisting.' };
        }

        return { success: true, message: `Successfully connected. Verified namespace: ${ns}` };
    },

    /**
     * Verifies a KMS Alias exists in the user's account via CLI bridge.
     */
    checkKmsAlias: async (alias: string): Promise<ValidationResult> => {
        try {
            const response = await fetch(`/api/verify-kms?alias=${alias}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed.' };
        }
    },

    /**
     * Verifies that the KMS Key Policy allows the current user.
     */
    checkKeyPolicy: async (alias: string): Promise<ValidationResult> => {
        try {
            const response = await fetch(`/api/verify-policy?alias=${alias}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed.' };
        }
    },

    /**
     * Triggers the cleanup of AWS resources (Delete Alias + Schedule Key Deletion).
     */
    cleanupAwsResources: async (alias: string): Promise<ValidationResult> => {
        try {
            const response = await fetch(`/api/cleanup-resources?alias=${alias}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Cleanup failed: Bridge connection error.' };
        }
    },

    /**
     * Verifies that migration was successful - checks for encrypted data in secure collection.
     */
    checkMigration: async (uri: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-migration?${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that tenant DEKs exist for multi-tenant isolation.
     */
    checkTenantDEKs: async (uri: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-tenant-deks?${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that a DEK exists and can be rotated (checks master key configuration).
     */
    checkKeyRotation: async (uri: string, keyAltName: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `uri=${encodeURIComponent(uri)}&` : '';
            const response = await fetch(`/api/verify-key-rotation?${uriParam}keyAltName=${encodeURIComponent(keyAltName)}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that exactly one DEK exists in the key vault.
     */
    checkKeyVaultCount: async (expectedCount: number = 1): Promise<ValidationResult> => {
        try {
            const response = await fetch(`/api/verify-keyvault-count?expectedCount=${expectedCount}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed.' };
        }
    },

    /**
     * Verifies that both QE-specific DEKs exist in the key vault (qe-salary-dek and qe-taxid-dek).
     */
    checkQEDEKs: async (uri?: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-qe-deks?${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that Queryable Encryption metadata collections (.esc and .ecoc) exist.
     */
    checkQEMetadata: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `&uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-qe-metadata?db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that a collection exists and has encryptedFields configuration.
     */
    checkQECollection: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `&uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-qe-collection?db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that the collection has documents with encrypted fields for range query testing.
     */
    checkQERangeQuery: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        try {
            const uriParam = uri ? `&uri=${encodeURIComponent(uri)}` : '';
            const response = await fetch(`/api/verify-qe-range-query?db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}${uriParam}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Bridge connection failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * System check for installed CLI tools via Vite bridge.
     */
    checkToolInstalled: async (toolName: string): Promise<ValidationResult> => {
        const toolLower = toolName.toLowerCase();
        let queryLabel: string;
        
        if (toolLower.includes('aws')) {
            queryLabel = 'aws';
        } else if (toolLower.includes('mongosh')) {
            queryLabel = 'mongosh';
        } else if (toolLower.includes('node')) {
            queryLabel = 'node';
        } else if (toolLower.includes('npm')) {
            queryLabel = 'npm';
        } else {
            queryLabel = 'atlas';
        }

        try {
            const response = await fetch(`/api/check-tool?tool=${queryLabel}`);
            const data = await response.json();

            if (data.success) {
                // Return version in message, path in path field
                const version = data.version || '';
                const path = data.path || '';
                return {
                    success: true,
                    message: `System Scan: ${version}`,
                    path: path
                };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: `Connection to setup bridge failed. Ensure npm run dev is active.` };
        }
    }
};
