import { describe, it, expect } from 'vitest';
import { getContentService } from '@/services/contentService';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

/**
 * Audit: Every content-driven lab step with enhancementId must have
 * enhancement metadata with at least one codeBlock containing code or skeleton.
 *
 * Labs using custom components (Lab1CSFLE, Lab2QueryableEncryption) are excluded
 * as they provide their own step content.
 *
 * Phase labs (1-14): rich-query, flexible, ingest-rate, in-place-analytics,
 * workload-isolation, consistency, scale-out, scale-up, migratable, portable,
 * auto-deploy, rolling-updates, full-recovery-rpo, full-recovery-rto, right-to-erasure.
 * Additional labs (text-search, geospatial, graph, monitoring, change-capture)
 * are excluded until they have enhancement metadata.
 */
const LABS_WITH_CUSTOM_COMPONENTS = ['lab-csfle-fundamentals', 'lab-queryable-encryption'];

const PHASE_LAB_IDS = new Set([
  'lab-rich-query-basics',
  'lab-rich-query-aggregations',
  'lab-rich-query-encrypted-vs-plain',
  'lab-flexible-basic-evolution',
  'lab-flexible-nested-documents',
  'lab-flexible-microservice-compat',
  'lab-ingest-rate-basics',
  'lab-ingest-rate-bulk-operations',
  'lab-ingest-rate-replication-verify',
  'lab-analytics-overview',
  'lab-in-place-analytics-basics',
  'lab-in-place-analytics-advanced',
  'lab-workload-isolation-overview',
  'lab-workload-isolation-replica-tags',
  'lab-workload-isolation-read-preference',
  'lab-consistency-overview',
  'lab-consistency-sharded-setup',
  'lab-consistency-verify',
  'lab-scale-out-overview',
  'lab-scale-out-setup',
  'lab-scale-out-execute',
  'lab-scale-up-overview',
  'lab-scale-up-setup',
  'lab-scale-up-execute',
  'lab-migratable-overview',
  'lab-migratable-setup',
  'lab-migratable-execute',
  'lab-portable-overview',
  'lab-portable-setup',
  'lab-portable-execute',
  'lab-auto-deploy-overview',
  'lab-auto-deploy-setup',
  'lab-auto-deploy-execute',
  'lab-rolling-updates-overview',
  'lab-rolling-updates-setup',
  'lab-rolling-updates-execute',
  'lab-full-recovery-rpo-overview',
  'lab-full-recovery-rpo-setup',
  'lab-full-recovery-rpo-execute',
  'lab-full-recovery-rto-overview',
  'lab-full-recovery-rto-setup',
  'lab-full-recovery-rto-execute',
  'lab-right-to-erasure',
]);

describe('Lab step content audit', () => {
  it('all phase lab steps with enhancementId have code blocks', async () => {
    const service = getContentService();
    const labs = await service.getLabs();

    const failures: string[] = [];

    for (const lab of labs) {
      if (LABS_WITH_CUSTOM_COMPONENTS.includes(lab.id)) continue;
      if (!PHASE_LAB_IDS.has(lab.id)) continue;

      for (const step of lab.steps) {
        if (!step.enhancementId) {
          failures.push(`${lab.id} / ${step.id}: step has no enhancementId`);
          continue;
        }

        const enh = await getStepEnhancement(step.enhancementId);
        if (!enh) {
          failures.push(`${lab.id} / ${step.id}: enhancement "${step.enhancementId}" not found`);
          continue;
        }

        const blocks = enh.codeBlocks;
        if (!blocks || blocks.length === 0) {
          failures.push(`${lab.id} / ${step.id}: enhancement "${step.enhancementId}" has no codeBlocks`);
          continue;
        }

        const hasContent = blocks.some(
          (b) =>
            (b.code && b.code.trim().length > 0) || (b.skeleton && b.skeleton.trim().length > 0)
        );
        if (!hasContent) {
          failures.push(
            `${lab.id} / ${step.id}: enhancement "${step.enhancementId}" has codeBlocks but all are empty`
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('all phase labs have at least one step with enhancementId', async () => {
    const service = getContentService();
    const labs = await service.getLabs();

    const labsWithoutEnhancements: string[] = [];

    for (const lab of labs) {
      if (LABS_WITH_CUSTOM_COMPONENTS.includes(lab.id)) continue;
      if (!PHASE_LAB_IDS.has(lab.id)) continue;

      const stepsWithEnhancement = lab.steps.filter((s) => s.enhancementId);
      if (stepsWithEnhancement.length === 0) {
        labsWithoutEnhancements.push(lab.id);
      }
    }

    expect(labsWithoutEnhancements).toEqual([]);
  });
});
