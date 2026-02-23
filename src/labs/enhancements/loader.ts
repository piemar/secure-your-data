import type { EnhancementMetadata } from './schema';

/**
 * Enhancement Metadata Loader
 * 
 * Loads enhancement metadata from various sources (TypeScript modules, YAML, JSON).
 * Currently supports TypeScript modules, with YAML/JSON support planned.
 */

// Type for enhancement metadata modules
type EnhancementModule = {
  enhancements: Record<string, EnhancementMetadata>;
};

/**
 * Cache for loaded enhancement metadata
 */
const metadataCache = new Map<string, EnhancementMetadata>();

/**
 * Load enhancement metadata by ID
 * 
 * @param enhancementId - The enhancement ID, e.g., "rich-query.compound-query"
 * @returns The enhancement metadata, or undefined if not found
 */
export async function loadEnhancementMetadata(
  enhancementId: string
): Promise<EnhancementMetadata | undefined> {
  // In development, skip cache so file changes (e.g. new code blocks) are picked up without full reload
  const useCache = typeof import.meta.env !== 'undefined' && !import.meta.env.DEV;
  if (useCache && metadataCache.has(enhancementId)) {
    return metadataCache.get(enhancementId);
  }

  // Extract prefix (e.g., "rich-query" from "rich-query.compound-query")
  const prefix = enhancementId.split('.')[0];
  
  // Try to load from TypeScript module
  try {
    // Dynamic import based on prefix
    // This will be replaced with actual imports once metadata files are created
    const module = await loadEnhancementModule(prefix);
    
    if (module && module.enhancements[enhancementId]) {
      const metadata = module.enhancements[enhancementId];
      if (useCache) metadataCache.set(enhancementId, metadata);
      return metadata;
    }
  } catch (error) {
    console.warn(`Failed to load enhancement metadata for ${enhancementId}:`, error);
  }

  return undefined;
}

/**
 * Load enhancement module by prefix
 * 
 * @param prefix - The prefix (e.g., "rich-query", "flexible")
 */
async function loadEnhancementModule(
  prefix: string
): Promise<EnhancementModule | null> {
  // Map prefixes to module paths
  // This will be populated as we migrate enhancements
  const moduleMap: Record<string, () => Promise<EnhancementModule>> = {
    'rich-query': () => import('@/content/topics/query/rich-query/enhancements'),
    'text-search': () => import('@/content/topics/query/text-search/enhancements'),
    'flexible': () => import('@/content/topics/data-management/flexible/enhancements'),
    'ingest-rate': () => import('@/content/topics/scalability/ingest-rate/enhancements'),
    'in-place-analytics': () => import('@/content/topics/analytics/in-place-analytics/enhancements'),
    'workload-isolation': () => import('@/content/topics/analytics/workload-isolation/enhancements'),
    'consistency': () => import('@/content/topics/scalability/consistency/enhancements'),
    'scale-out': () => import('@/content/topics/scalability/scale-out/enhancements'),
    'scale-up': () => import('@/content/topics/scalability/scale-up/enhancements'),
    'right-to-erasure': () => import('@/content/topics/encryption/right-to-erasure/enhancements'),
    'csfle': () => import('@/content/topics/encryption/csfle/enhancements'),
    'queryable-encryption': () => import('@/content/topics/encryption/queryable-encryption/enhancements'),
    'migratable': () => import('@/content/topics/deployment/migratable/enhancements'),
    'portable': () => import('@/content/topics/deployment/portable/enhancements'),
    'auto-deploy': () => import('@/content/topics/deployment/auto-deploy/enhancements'),
    'rolling-updates': () => import('@/content/topics/operations/rolling-updates/enhancements'),
    'full-recovery-rpo': () => import('@/content/topics/operations/full-recovery-rpo/enhancements'),
    'full-recovery-rto': () => import('@/content/topics/operations/full-recovery-rto/enhancements'),
    'partial-recovery-rpo': () => import('@/content/topics/operations/partial-recovery-rpo/enhancements'),
    'partial-recovery': () => import('@/content/topics/operations/partial-recovery/enhancements'),
    'reporting': () => import('@/content/topics/integration/reporting/enhancements'),
    'auto-ha': () => import('@/content/topics/operations/auto-ha/enhancements'),
  };

  const loader = moduleMap[prefix];
  if (!loader) {
    return null;
  }

  try {
    return await loader();
  } catch (error: any) {
    // Silently handle missing files (they'll be created during migration)
    if (error?.code === 'ERR_MODULE_NOT_FOUND' || error?.message?.includes('Cannot find module')) {
      return null;
    }
    console.warn(`Failed to load enhancement module for prefix ${prefix}:`, error);
    return null;
  }
}

/**
 * Preload all enhancement metadata
 * Useful for initializing the cache
 */
export async function preloadAllEnhancements(): Promise<void> {
  const prefixes = ['rich-query', 'text-search', 'flexible', 'ingest-rate', 'in-place-analytics', 'workload-isolation', 'consistency', 'scale-out', 'scale-up', 'right-to-erasure', 'csfle', 'queryable-encryption', 'migratable', 'portable', 'auto-deploy', 'rolling-updates', 'full-recovery-rpo', 'full-recovery-rto', 'partial-recovery-rpo', 'partial-recovery', 'reporting', 'auto-ha'];
  
  for (const prefix of prefixes) {
    try {
      const module = await loadEnhancementModule(prefix);
      if (module) {
        Object.entries(module.enhancements).forEach(([id, metadata]) => {
          metadataCache.set(id, metadata);
        });
      }
    } catch (error) {
      // Silently skip modules that don't exist yet
    }
  }
}

/**
 * Clear the metadata cache
 * Useful for testing or hot-reloading
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}
