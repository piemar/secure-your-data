/**
 * Simple credential obfuscation utility
 * Note: This is NOT true encryption - it's obfuscation for GitHub visibility
 * In production, use proper encryption with environment variables
 */

const OBFUSCATION_KEY = 'CSFLE_QE_LAB_2024'; // Simple key for obfuscation

/**
 * Obfuscates a credential string (simple XOR-based obfuscation)
 */
export function obfuscateCredential(credential: string): string {
  if (!credential) return '';
  
  const key = OBFUSCATION_KEY;
  let result = '';
  
  for (let i = 0; i < credential.length; i++) {
    const charCode = credential.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  // Base64 encode to make it safe for storage
  return Buffer.from(result).toString('base64');
}

/**
 * Deobfuscates a credential string
 */
export function deobfuscateCredential(obfuscated: string): string {
  if (!obfuscated) return '';
  
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString('utf-8');
    const key = OBFUSCATION_KEY;
    let result = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch {
    return '';
  }
}

/**
 * Obfuscates MongoDB connection string
 */
export function obfuscateMongoUri(uri: string): string {
  return obfuscateCredential(uri);
}

/**
 * Deobfuscates MongoDB connection string
 */
export function deobfuscateMongoUri(obfuscated: string): string {
  return deobfuscateCredential(obfuscated);
}
