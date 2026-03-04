/**
 * Utility functions for validating MongoDB CSFLE and QE states.
 * These functions call real API endpoints in the Vite dev server 
 * that execute mongosh and AWS CLI commands to validate user's environment.
 */

export interface ValidationResult {
    success: boolean;
    message: string;
    path?: string;
    /** Human-readable location e.g. "project folder (lib/mongo_crypt_v1.dylib)" */
    detectedLocation?: string;
    /** Detected AWS region from `aws configure get region` (when checking aws tool). */
    detectedRegion?: string;
    /** Detected AWS profile e.g. from env AWS_PROFILE or "default". */
    detectedProfile?: string;
}

/** Same per-user key as LabContext; use when no URI is passed to validation. */
function getStoredMongoUri(): string {
    if (typeof localStorage === 'undefined') return '';
    const email = localStorage.getItem('userEmail') || '';
    const key = email.trim()
        ? `lab_mongo_uri_${email.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
        : 'lab_mongo_uri';
    return localStorage.getItem(key) || localStorage.getItem('lab_mongo_uri') || '';
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
     * Checks for the existence and configuration of the Key Vault collection.
     * Uses the real /api/verify-index endpoint to check via mongosh.
     */
    checkKeyVault: async (uri: string, ns: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const params = new URLSearchParams({ uri });
            if (ns) params.set('keyVaultNamespace', ns);
            const response = await fetch(`/api/verify-index?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies a KMS Alias exists in the user's AWS account.
     * Uses the real /api/verify-kms endpoint to check via AWS CLI.
     * @param profile Optional. If omitted or empty, server uses AWS_PROFILE env or "default".
     * @param region Optional. If provided, server uses this region for the AWS CLI call (must match where the key was created).
     */
    checkKmsAlias: async (alias: string, profile?: string, region?: string): Promise<ValidationResult> => {
        if (!alias || alias.trim() === '') {
            return { success: false, message: 'KMS alias is required.' };
        }
        
        if (!alias.startsWith('alias/')) {
            return { success: false, message: 'KMS alias must start with "alias/".' };
        }

        try {
            const params = new URLSearchParams({ alias, profile: profile ?? '' });
            if (region?.trim()) params.set('region', region.trim());
            const response = await fetch(`/api/verify-kms?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active and AWS CLI is configured.' };
        }
    },

    /**
     * Verifies that the KMS Key Policy allows the current user.
     * Uses the real /api/verify-policy endpoint to check via AWS CLI.
     * @param profile Optional. If omitted or empty, server uses AWS_PROFILE env or "default".
     * @param region Optional. If provided, server uses this region for the AWS CLI call.
     */
    checkKeyPolicy: async (alias: string, profile?: string, region?: string): Promise<ValidationResult> => {
        if (!alias || alias.trim() === '') {
            return { success: false, message: 'KMS alias is required.' };
        }

        try {
            const params = new URLSearchParams({ alias, profile: profile ?? '' });
            if (region?.trim()) params.set('region', region.trim());
            const response = await fetch(`/api/verify-policy?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Triggers the cleanup of AWS resources (Delete Alias + Schedule Key Deletion).
     * Uses the real /api/cleanup-resources endpoint.
     * @param profile Optional. If omitted or empty, server uses AWS_PROFILE env or "default".
     */
    cleanupAwsResources: async (alias: string, profile?: string): Promise<ValidationResult> => {
        try {
            const response = await fetch(`/api/cleanup-resources?alias=${encodeURIComponent(alias)}&profile=${encodeURIComponent(profile ?? '')}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Cleanup failed: Bridge connection error.' };
        }
    },

    /**
     * Lists AWS CLI profile names from ~/.aws/config (runs aws configure list-profiles on server).
     */
    listAwsProfiles: async (): Promise<{ success: boolean; profiles: string[]; message?: string }> => {
        try {
            const response = await fetch('/api/aws-list-profiles');
            const data = await response.json();
            return {
                success: data.success === true,
                profiles: Array.isArray(data.profiles) ? data.profiles : [],
                message: data.message,
            };
        } catch (error) {
            return { success: false, profiles: [], message: 'Connection to server failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Tests AWS authentication for the given profile (runs aws sts get-caller-identity on server).
     * @param profile Optional. If omitted or empty, server uses AWS_PROFILE env or "default".
     */
    testAwsAuth: async (profile?: string): Promise<ValidationResult> => {
        try {
            const q = profile != null && profile.trim() !== '' ? `?profile=${encodeURIComponent(profile.trim())}` : '';
            const response = await fetch(`/api/aws-test-auth${q}`);
            const data = await response.json();
            return { success: data.success === true, message: data.message || (data.success ? 'OK' : 'Failed') };
        } catch (error) {
            return { success: false, message: 'Connection to server failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that migration was successful - checks for encrypted data in secure collection.
     * Uses the real /api/verify-migration endpoint to check via mongosh.
     * @param medicalDb Optional. Per-user DB (e.g. medical_user-test10). Omit for "medical".
     */
    checkMigration: async (uri: string, medicalDb?: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'MongoDB URI is required.' };
        }

        try {
            const params = new URLSearchParams({ uri });
            if (medicalDb?.trim()) params.set('db', medicalDb.trim());
            const response = await fetch(`/api/verify-migration?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that tenant DEKs exist for multi-tenant isolation.
     * Uses the real /api/verify-tenant-deks endpoint to check via mongosh.
     * @param keyVaultDb Optional. Per-user key vault DB (e.g. encryption_user-test10). Omit for "encryption".
     */
    checkTenantDEKs: async (uri: string, keyVaultDb?: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'MongoDB URI is required.' };
        }

        try {
            const params = new URLSearchParams({ uri });
            if (keyVaultDb?.trim()) params.set('keyVaultDb', keyVaultDb.trim());
            const response = await fetch(`/api/verify-tenant-deks?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that a DEK exists and can be rotated (checks master key configuration).
     * Uses the real /api/verify-key-rotation endpoint to check via mongosh.
     * @param keyVaultDb Optional. Key vault DB (e.g. encryption_user-test10). Omit for "encryption".
     */
    checkKeyRotation: async (uri: string, keyAltName: string, keyVaultDb?: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'MongoDB URI is required.' };
        }
        
        if (!keyAltName || keyAltName.trim() === '') {
            return { success: false, message: 'Key Alt Name is required.' };
        }

        try {
            const params = new URLSearchParams({ uri, keyAltName });
            if (keyVaultDb?.trim()) params.set('keyVaultDb', keyVaultDb.trim());
            const response = await fetch(`/api/verify-key-rotation?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies the expected DEK count in the key vault.
     * Uses the real /api/verify-keyvault-count endpoint to check via mongosh.
     * @param keyVaultDb Optional. Per-user key vault DB (e.g. encryption_test-user27). Omit for "encryption".
     */
    checkKeyVaultCount: async (expectedCount: number = 1, uri?: string, keyVaultDb?: string): Promise<ValidationResult> => {
        // Get URI from parameter or try localStorage
        const mongoUri = uri || getStoredMongoUri();
        
        if (!mongoUri) {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const params = new URLSearchParams({ uri: mongoUri, expectedCount: String(expectedCount) });
            if (keyVaultDb?.trim()) params.set('keyVaultDb', keyVaultDb.trim());
            const response = await fetch(`/api/verify-keyvault-count?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that both QE-specific DEKs exist in the key vault (qe-salary-dek and qe-taxid-dek).
     * Uses the real /api/verify-qe-deks endpoint to check via mongosh.
     */
    checkQEDEKs: async (uri?: string): Promise<ValidationResult> => {
        // Get URI from parameter or try localStorage
        const mongoUri = uri || getStoredMongoUri();
        
        if (!mongoUri) {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const response = await fetch(`/api/verify-qe-deks?uri=${encodeURIComponent(mongoUri)}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that Queryable Encryption metadata collections (.esc and .ecoc) exist.
     * Uses the real /api/verify-qe-metadata endpoint to check via mongosh.
     */
    checkQEMetadata: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        if (!db || !coll) {
            return { success: false, message: 'Database and collection names are required.' };
        }

        // Get URI from parameter or try localStorage
        const mongoUri = uri || getStoredMongoUri();
        
        if (!mongoUri) {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const response = await fetch(`/api/verify-qe-metadata?uri=${encodeURIComponent(mongoUri)}&db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that a collection exists and has encryptedFields configuration.
     * Uses the real /api/verify-qe-collection endpoint to check via mongosh.
     */
    checkQECollection: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        if (!db || !coll) {
            return { success: false, message: 'Database and collection names are required.' };
        }

        // Get URI from parameter or try localStorage
        const mongoUri = uri || getStoredMongoUri();
        
        if (!mongoUri) {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const response = await fetch(`/api/verify-qe-collection?uri=${encodeURIComponent(mongoUri)}&db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that the collection has documents with encrypted fields for range query testing.
     * Uses the real /api/verify-qe-range-query endpoint to check via mongosh.
     */
    checkQERangeQuery: async (db: string, coll: string, uri?: string): Promise<ValidationResult> => {
        if (!db || !coll) {
            return { success: false, message: 'Database and collection names are required.' };
        }

        // Get URI from parameter or try localStorage
        const mongoUri = uri || getStoredMongoUri();
        
        if (!mongoUri) {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }

        try {
            const response = await fetch(`/api/verify-qe-range-query?uri=${encodeURIComponent(mongoUri)}&db=${encodeURIComponent(db)}&coll=${encodeURIComponent(coll)}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that a specific DEK exists in the key vault by keyAltName.
     * Uses the real /api/verify-datakey endpoint to check via mongosh.
     * @param keyVaultDb Optional. Key vault DB (e.g. encryption_user-test10). Omit for "encryption".
     */
    checkDataKey: async (uri: string, keyAltName: string, keyVaultDb?: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { 
                success: false, 
                message: 'MongoDB URI is required. Please configure it in Lab Setup.' 
            };
        }
        
        if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
            return { 
                success: false, 
                message: 'Invalid MongoDB URI format. Must start with mongodb+srv:// or mongodb://' 
            };
        }
        
        if (!keyAltName || keyAltName.trim() === '') {
            return { 
                success: false, 
                message: 'Key Alt Name is required. Check your createKey.cjs script.' 
            };
        }

        try {
            const params = new URLSearchParams({ uri, keyAltName });
            if (keyVaultDb?.trim()) params.set('keyVaultDb', keyVaultDb.trim());
            const response = await fetch(`/api/verify-datakey?${params.toString()}`);
            const data = await response.json();
            return { success: data.success, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verifies that at least one document in the given collection has the given field stored as encrypted (Binary).
     * Uses /api/verify-field-encrypted (mongosh countDocuments with $type: "binData").
     */
    checkFieldEncrypted: async (uri: string, db: string, collection: string, field: string): Promise<ValidationResult> => {
        if (!uri || uri.trim() === '') {
            return { success: false, message: 'MongoDB URI is required. Please configure it in Lab Setup.' };
        }
        if (!db || !collection || !field) {
            return { success: false, message: 'db, collection, and field are required for field encryption check.' };
        }
        try {
            const params = new URLSearchParams({
                uri,
                db,
                collection,
                field,
            });
            const response = await fetch(`/api/verify-field-encrypted?${params.toString()}`);
            const data = await response.json();
            return { success: data.success === true, message: data.message || (data.success ? 'Field is encrypted.' : 'Field not encrypted.') };
        } catch (error) {
            return { success: false, message: 'Connection to validation bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * System check for installed CLI tools via Vite bridge.
     * Uses the real /api/check-tool endpoint.
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
        } else if (toolLower.includes('mongo_crypt') || toolLower.includes('crypt_shared')) {
            queryLabel = 'mongo_crypt_shared';
        } else {
            queryLabel = 'atlas';
        }

        try {
            const response = await fetch(`/api/check-tool?tool=${queryLabel}`);
            const data = await response.json();

            if (data.success) {
                const version = data.version || '';
                const pathVal = data.path || '';
                return {
                    success: true,
                    message: data.message || `System Scan: ${version}`,
                    path: pathVal,
                    detectedLocation: data.detectedLocation,
                    detectedRegion: data.detectedRegion,
                    detectedProfile: data.detectedProfile,
                };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: `Connection to setup bridge failed. Ensure npm run dev is active.` };
        }
    },

    /**
     * Check mongo_crypt_shared with optional user path (highest priority), then auto-detect.
     */
    checkMongoCryptShared: async (userPath?: string): Promise<ValidationResult> => {
        try {
            const url = new URL('/api/check-tool', window.location.origin);
            url.searchParams.set('tool', 'mongo_crypt_shared');
            if (userPath?.trim()) url.searchParams.set('userPath', userPath.trim());
            const response = await fetch(url.toString());
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    message: data.message || `✓ Found in ${data.detectedLocation || data.path}`,
                    path: data.path,
                    detectedLocation: data.detectedLocation,
                };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Connection to setup bridge failed. Ensure npm run dev is active.' };
        }
    },

    /**
     * Verify a file path (e.g. mongo_crypt_shared); returns detectedLocation when type is mongoCryptShared.
     */
    checkFilePath: async (filePath: string, fileType: 'mongoCryptShared' | 'general' = 'general'): Promise<ValidationResult> => {
        try {
            const url = new URL('/api/check-file', window.location.origin);
            url.searchParams.set('path', filePath);
            if (fileType) url.searchParams.set('type', fileType);
            const response = await fetch(url.toString());
            const data = await response.json();
            if (data.exists) {
                return {
                    success: true,
                    message: data.message || 'File found',
                    path: filePath,
                    detectedLocation: data.detectedLocation,
                };
            }
            return { success: false, message: data.message || 'File not found' };
        } catch (error) {
            return { success: false, message: 'Failed to verify file path.' };
        }
    },
};
