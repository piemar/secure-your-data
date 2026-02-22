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
 * Build a Partial<Step> from enhancement metadata.
 */
function buildEnhancementFromMetadata(metadata: any): Partial<Step> {
  const enhancement: Partial<Step> = {
    codeBlocks: metadata.codeBlocks?.map((block: any) => ({
      filename: block.filename,
      language: block.language,
      code: block.code,
      skeleton: block.skeleton,
      challengeSkeleton: block.challengeSkeleton,
      expertSkeleton: block.expertSkeleton,
      inlineHints: block.inlineHints,
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

