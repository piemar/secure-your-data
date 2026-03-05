import type { Step } from '@/components/labs/LabViewWithTabs';
import type { WorkshopLabDefinition, WorkshopLabStep } from '@/types';
import { loadEnhancementMetadata } from './enhancements/loader';
import { enhancementComponents } from './enhancements/components/registry';

/**
 * Global registry of step enhancement factories (legacy support).
 * 
 * @deprecated Use metadata-based enhancements via loadEnhancementMetadata instead.
 * This is kept for backward compatibility during migration.
 */
import { richQueryEnhancements } from './richQueryEnhancements';
import { flexibleEnhancements } from './flexibleEnhancements';
import { ingestRateEnhancements } from './ingestRateEnhancements';

type StepEnhancementFactory = () => Partial<Step>;

const legacyRegistry: Record<string, StepEnhancementFactory> = {
  ...richQueryEnhancements,
  ...flexibleEnhancements,
  ...ingestRateEnhancements,
};

/**
 * Get step enhancement by ID, loading from metadata first, falling back to legacy factories.
 * 
 * @param enhancementId - The enhancement ID, e.g., "rich-query.compound-query"
 * @returns The enhancement partial step, or undefined if not found
 */
export async function getStepEnhancement(
  enhancementId?: string
): Promise<Partial<Step> | undefined> {
  if (!enhancementId) return undefined;

  // Try loading from metadata first
  try {
    const metadata = await loadEnhancementMetadata(enhancementId);
    if (metadata) {
      return buildEnhancementFromMetadata(metadata);
    }
  } catch (error) {
    console.warn(`Failed to load metadata for ${enhancementId}, falling back to legacy:`, error);
  }

  // Fallback to legacy factory functions during migration
  const factory = legacyRegistry[enhancementId];
  return factory ? factory() : undefined;
}

/**
 * Synchronous version for backward compatibility.
 * Prefers legacy registry for immediate results.
 */
export function getStepEnhancementSync(enhancementId?: string): Partial<Step> | undefined {
  if (!enhancementId) return undefined;
  const factory = legacyRegistry[enhancementId];
  return factory ? factory() : undefined;
}

/**
 * Sanitize suffix for AWS KMS alias and DB names: only [a-zA-Z0-9_-] allowed.
 * Replaces dots and other invalid chars with '-', collapses repeated dashes, trims.
 */
export function sanitizeLabSuffix(s: string): string {
  if (s == null || typeof s !== 'string') return 'default';
  const trimmed = s.trim();
  if (!trimmed) return 'default';
  const replaced = trimmed.replace(/[^a-zA-Z0-9_-]/g, '-');
  const collapsed = replaced.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return collapsed || 'default';
}

/** Get lab user suffix for placeholder substitution (YOUR_SUFFIX → same key as Lab 1). Sanitized for KMS/alias compatibility. */
export function getLabUserSuffix(): string {
  if (typeof window === 'undefined' || !window.localStorage) return 'default';
  const raw = window.localStorage.getItem('lab_user_suffix') || localStorage.getItem('userEmail')?.split('@')[0] || 'default';
  return sanitizeLabSuffix(raw);
}

/** Get collection/database prefix for multi-user same cluster (e.g. encryption_<suffix>). */
export function getLabCollectionPrefix(): string {
  return 'encryption_' + getLabUserSuffix();
}

/** Key vault namespace for current user (e.g. encryption_default.__keyVault). */
export function getKeyVaultNamespace(): string {
  return getLabCollectionPrefix() + '.__keyVault';
}

/** Get lab alias name (alias/mongodb-lab-key-<suffix>) for CSFLE/QE labs. */
function getLabAliasName(): string {
  return `alias/mongodb-lab-key-${getLabUserSuffix()}`;
}

/** Get AWS region for KMS (from localStorage or default). */
function getLabAwsRegion(): string {
  if (typeof window === 'undefined' || !window.localStorage) return 'eu-central-1';
  return localStorage.getItem('aws_region') || localStorage.getItem('lab_aws_region') || 'eu-central-1';
}

/** Get crypt shared library path (optional; empty if not set). */
function getCryptSharedLibPath(): string {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  return localStorage.getItem('crypt_shared_lib_path') || localStorage.getItem('mongo_crypt_shared_path') || '';
}

/** Replace placeholders in code/skeleton strings for content-driven labs (Lab 1, 2, 3). */
function substitutePlaceholders(text: string | undefined): string | undefined {
  if (text == null || typeof text !== 'string') return text;
  const suffix = getLabUserSuffix();
  const aliasName = getLabAliasName();
  const awsRegion = getLabAwsRegion();
  const cryptPath = getCryptSharedLibPath();
  const prefix = getLabCollectionPrefix();
  const medicalDb = 'medical_' + suffix;
  const hrDb = 'hr_' + suffix;
  return text
    .replace(/\bYOUR_SUFFIX\b/g, suffix)
    .replace(/\bALIAS_NAME\b/g, aliasName)
    .replace(/(?<!process\.env\.)\bAWS_REGION\b/g, awsRegion)
    .replace(/\bCRYPT_SHARED_LIB_PATH\b/g, cryptPath)
    .replace(/encryption\.__keyVault/g, prefix + '.__keyVault')
    .replace(/\.db\("encryption"\)/g, '.db("' + prefix + '")')
    .replace(/getSiblingDB\("encryption"\)/g, 'getSiblingDB("' + prefix + '")')
    .replace(/getSiblingDB\('encryption'\)/g, "getSiblingDB('" + prefix + "')")
    .replace(/\.db\("medical"\)/g, '.db("' + medicalDb + '")')
    .replace(/\.db\('medical'\)/g, ".db('" + medicalDb + "')")
    .replace(/"medical\./g, '"' + medicalDb + '.')
    .replace(/'medical\./g, "'" + medicalDb + '.')
    .replace(/\.db\("hr"\)/g, '.db("' + hrDb + '")')
    .replace(/\.db\('hr'\)/g, ".db('" + hrDb + "')")
    .replace(/"hr\./g, '"' + hrDb + '.')
    .replace(/'hr\./g, "'" + hrDb + '.');
}

/** Map hint answers that are lab DB names to per-user substituted values (so skeleton + solution show correct namespace). */
function substituteHintAnswer(answer: string | undefined): string | undefined {
  if (answer == null) return answer;
  const suffix = getLabUserSuffix();
  const prefix = getLabCollectionPrefix();
  if (answer === 'encryption') return prefix;
  if (answer === 'medical') return 'medical_' + suffix;
  if (answer === 'hr') return 'hr_' + suffix;
  return answer;
}

/**
 * Build a Partial<Step> from enhancement metadata.
 */
function buildEnhancementFromMetadata(metadata: any): Partial<Step> {
  const enhancement: Partial<Step> = {
    codeBlocks: metadata.codeBlocks?.map((block: any) => ({
      filename: block.filename,
      language: block.language,
      code: substitutePlaceholders(block.code),
      skeleton: substitutePlaceholders(block.skeleton),
      challengeSkeleton: substitutePlaceholders(block.challengeSkeleton),
      expertSkeleton: substitutePlaceholders(block.expertSkeleton),
      inlineHints: block.inlineHints?.map((h: { line?: number; blankText?: string; hint?: string; answer?: string }) => ({
        ...h,
        answer: substituteHintAnswer(h.answer) ?? h.answer,
      })),
      competitorEquivalents: block.competitorEquivalents,
    })),
    tips: metadata.tips,
    troubleshooting: metadata.troubleshooting,
    exercises: metadata.exercises,
  };

  // Apply component if specified
  if (metadata.componentId && enhancementComponents[metadata.componentId]) {
    const componentEnhancement = enhancementComponents[metadata.componentId](
      metadata.componentProps || {}
    );
    Object.assign(enhancement, componentEnhancement);
  }

  return enhancement;
}

/**
 * Build a Map of stepId → Partial<Step> by combining:
 * - Enhancements discovered from WorkshopLabStep.enhancementId
 * - Any additional enhancements passed in (e.g. from specialized TSX components)
 * 
 * @deprecated Use buildStepEnhancementsAsync for metadata-based enhancements.
 * This version uses sync legacy registry for backward compatibility.
 */
export function buildStepEnhancements(
  labDef: WorkshopLabDefinition,
  extraEnhancements?: Map<string, Partial<Step>>
): Map<string, Partial<Step>> {
  const map = new Map<string, Partial<Step>>();

  // From metadata on steps (using sync version for backward compatibility)
  labDef.steps.forEach((step: WorkshopLabStep) => {
    const enh = getStepEnhancementSync(step.enhancementId);
    if (enh) {
      map.set(step.id, enh);
    }
  });

  // Merge in extras, allowing callers to override defaults if desired
  if (extraEnhancements) {
    extraEnhancements.forEach((value, key) => {
      map.set(key, { ...(map.get(key) || {}), ...value });
    });
  }

  return map;
}

/**
 * Async version that loads enhancements from metadata.
 */
export async function buildStepEnhancementsAsync(
  labDef: WorkshopLabDefinition,
  extraEnhancements?: Map<string, Partial<Step>>
): Promise<Map<string, Partial<Step>>> {
  const map = new Map<string, Partial<Step>>();

  // Load enhancements from metadata
  for (const step of labDef.steps) {
    if (step.enhancementId) {
      const enh = await getStepEnhancement(step.enhancementId);
      if (enh) {
        map.set(step.id, enh);
      }
    }
  }

  // Merge in extras, allowing callers to override defaults if desired
  if (extraEnhancements) {
    extraEnhancements.forEach((value, key) => {
      map.set(key, { ...(map.get(key) || {}), ...value });
    });
  }

  return map;
}

