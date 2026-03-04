/**
 * Reset progress cleanup: KMS (via existing API) and MongoDB lab collections (via /api/cleanup-lab-collections).
 * Run before clearing localStorage so we still have lab_mongo_uri and lab_kms_alias.
 * Returns a list of results for the status dialog.
 */

export type CleanupStatus = 'success' | 'skipped' | 'error';

export interface CleanupResult {
  item: string;
  status: CleanupStatus;
  message?: string;
}

/**
 * Call server to drop lab-created MongoDB databases: encryption, medical, hr.
 */
async function cleanupMongoDBCollections(uri: string): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  if (!uri || !uri.trim()) {
    results.push({ item: 'MongoDB', status: 'skipped', message: 'No URI configured' });
    return results;
  }
  try {
    const res = await fetch('/api/cleanup-lab-collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri: uri.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      results.push({
        item: 'MongoDB',
        status: 'error',
        message: data.message || `Request failed: ${res.status}`,
      });
      return results;
    }
    if (Array.isArray(data.results)) {
      data.results.forEach((r: { db?: string; status: string; message?: string }) => {
        results.push({
          item: r.db ? `MongoDB: ${r.db}` : 'MongoDB',
          status: r.status === 'success' || r.status === 'skipped' ? r.status : 'error',
          message: r.message,
        });
      });
    } else if (data.success && data.message) {
      results.push({ item: 'MongoDB', status: 'success', message: data.message });
    } else {
      results.push({
        item: 'MongoDB',
        status: data.success ? 'success' : 'error',
        message: data.message || 'Unknown response',
      });
    }
  } catch (e: any) {
    results.push({
      item: 'MongoDB',
      status: 'error',
      message: e?.message || 'Connection failed',
    });
  }
  return results;
}

/**
 * Call existing /api/cleanup-resources to delete KMS alias and schedule key deletion.
 */
async function cleanupKMS(alias: string, profile?: string): Promise<CleanupResult> {
  if (!alias || !alias.trim()) {
    return { item: 'KMS', status: 'skipped', message: 'No alias configured' };
  }
  const safeAlias = alias.startsWith('alias/') ? alias : `alias/${alias.replace(/^alias\/?/, '')}`;
  try {
    const q = new URLSearchParams({ alias: safeAlias, profile: profile || '' });
    const res = await fetch(`/api/cleanup-resources?${q.toString()}`);
    const data = await res.json().catch(() => ({}));
    const success = data.success === true;
    return {
      item: 'KMS',
      status: success ? 'success' : 'error',
      message: data.message || (success ? 'Alias deleted, key scheduled for deletion' : 'Cleanup failed'),
    };
  } catch (e: any) {
    return { item: 'KMS', status: 'error', message: e?.message || 'Request failed' };
  }
}

/**
 * Resolve MongoDB URI from localStorage using same per-user key as LabContext.
 * Lab setup stores URI under lab_mongo_uri_${email}; fallback to lab_mongo_uri for legacy.
 */
function getStoredMongoUri(): string {
  if (typeof localStorage === 'undefined') return '';
  const email = localStorage.getItem('userEmail') || '';
  const key = email.trim()
    ? `lab_mongo_uri_${email.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    : 'lab_mongo_uri';
  return localStorage.getItem(key) || localStorage.getItem('lab_mongo_uri') || '';
}

/**
 * Run full cleanup: KMS (alias/key) and MongoDB (encryption, medical, hr).
 * Read URI via getStoredMongoUri (per-user key), lab_kms_alias, lab_aws_profile from localStorage (call before clearing storage).
 */
export async function runResetCleanup(): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  const uri = getStoredMongoUri();
  const alias =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('lab_kms_alias') || ''
      : '';
  const profile =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('lab_aws_profile') || ''
      : '';

  // If no alias stored but we have suffix, use default lab alias name
  const aliasToUse =
    alias.trim() ||
    (typeof localStorage !== 'undefined'
      ? (() => {
          const suffix = localStorage.getItem('lab_user_suffix') || '';
          return suffix ? `alias/mongodb-lab-key-${suffix}` : '';
        })()
      : '');

  // 1) KMS cleanup
  const kmsResult = await cleanupKMS(aliasToUse, profile || undefined);
  results.push(kmsResult);

  // 2) MongoDB cleanup (use env MONGODB_URI for local/docker when URI is localhost)
  const mongoResults = await cleanupMongoDBCollections(uri);
  results.push(...mongoResults);

  return results;
}
