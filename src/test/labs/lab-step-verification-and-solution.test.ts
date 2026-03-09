/**
 * Lab step verification and solution test
 *
 * Ensures:
 * 1. Every step that has a verificationId is handled by VerificationService (no "Unknown verification id").
 * 2. Every step with verificationId and enhancementId has at least one code block with full solution (block.code)
 *    so that "run full solution then verify" is possible.
 *
 * Pattern: For each lab step, the test case should (in integration or E2E): run the step's full solution
 * script (from enhancement code blocks), then call the step's verification; validation should pass.
 * This test only checks that verification IDs are implemented and that solution code exists.
 *
 * Run: npm test -- lab-step-verification-and-solution
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { allLabs } from '@/content/topics';
import { getVerificationService } from '@/services/verificationService';
import { loadEnhancementMetadata } from '@/labs/enhancements/loader';
import type { VerificationId } from '@/services/verificationService';

describe('Lab step verification and solution', () => {
  const verificationService = getVerificationService();

  /** All steps across all labs that have a verificationId */
  const stepsWithVerification: Array<{
    labId: string;
    stepTitle: string;
    stepId: string;
    verificationId: string;
    enhancementId?: string;
  }> = [];

  beforeAll(() => {
    for (const lab of allLabs) {
      for (const step of lab.steps ?? []) {
        const vid = (step as { verificationId?: string }).verificationId;
        if (vid) {
          stepsWithVerification.push({
            labId: lab.id,
            stepTitle: step.title,
            stepId: step.id,
            verificationId: vid,
            enhancementId: (step as { enhancementId?: string }).enhancementId,
          });
        }
      }
    }
  });

  it('every step with verificationId is handled by VerificationService', async () => {
    const unknown: string[] = [];
    for (const { labId, stepId, verificationId } of stepsWithVerification) {
      const result = await verificationService.verify(verificationId as VerificationId, {});
      if (result.message.includes('Unknown verification id') || !result.message) {
        unknown.push(`${labId} / ${stepId}: ${verificationId}`);
      }
    }
    expect(
      unknown,
      `These verification IDs are not implemented: ${unknown.join('; ')}`
    ).toHaveLength(0);
  });

  it('every step with verificationId and enhancementId has solution code in enhancement', async () => {
    const missing: string[] = [];
    for (const { labId, stepId, verificationId, enhancementId } of stepsWithVerification) {
      if (!enhancementId) continue;
      const enhancement = await loadEnhancementMetadata(enhancementId);
      if (!enhancement?.codeBlocks?.length) {
        missing.push(`${labId} / ${stepId}: enhancement ${enhancementId} has no code blocks`);
        continue;
      }
      const hasSolution = enhancement.codeBlocks.some(
        (b) => typeof b.code === 'string' && b.code.trim().length > 0
      );
      if (!hasSolution) {
        missing.push(
          `${labId} / ${stepId}: enhancement ${enhancementId} has no block with non-empty code (full solution)`
        );
      }
    }
    expect(
      missing,
      `Steps with verification but no solution code: ${missing.join('; ')}`
    ).toHaveLength(0);
  });

  it('lists all labs and steps with verification for documentation', () => {
    expect(stepsWithVerification.length).toBeGreaterThan(0);
    const byLab = new Map<string, typeof stepsWithVerification>();
    for (const s of stepsWithVerification) {
      const list = byLab.get(s.labId) ?? [];
      list.push(s);
      byLab.set(s.labId, list);
    }
    expect(byLab.size).toBeGreaterThan(0);
  });

  /** Every step that has an enhancement with code blocks must have at least one block with full solution (block.code) so "run full solution then verify" is possible. */
  it('every step with enhancementId and code blocks has at least one block with non-empty solution code', async () => {
    const missing: string[] = [];
    for (const lab of allLabs) {
      for (const step of lab.steps ?? []) {
        const enhancementId = (step as { enhancementId?: string }).enhancementId;
        if (!enhancementId) continue;
        const enhancement = await loadEnhancementMetadata(enhancementId);
        if (!enhancement?.codeBlocks?.length) continue;
        const hasSolution = enhancement.codeBlocks.some(
          (b) => typeof b.code === 'string' && b.code.trim().length > 0
        );
        if (!hasSolution) {
          missing.push(
            `${lab.id} / ${step.id} (${enhancementId}): no block with non-empty code (full solution)`
          );
        }
      }
    }
    expect(
      missing,
      `Steps with code blocks but no solution code: ${missing.join('; ')}`
    ).toHaveLength(0);
  });
});
