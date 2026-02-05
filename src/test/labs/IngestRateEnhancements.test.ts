import { describe, it, expect } from 'vitest';
import { getStepEnhancementSync } from '@/labs/stepEnhancementRegistry';

describe('Ingest Rate step enhancements', () => {
  it('provides code block for cluster-setup enhancement', () => {
    const enh = getStepEnhancementSync('ingest-rate.cluster-setup');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('mongosh');
    expect(code).toContain('rs.status');
  });

  it('provides code block for small-records enhancement', () => {
    const enh = getStepEnhancementSync('ingest-rate.small-records');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('insertMany');
    expect(block?.code).toContain('ordered');
  });

  it('provides code block for measure-rate enhancement', () => {
    const enh = getStepEnhancementSync('ingest-rate.measure-rate');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('countDocuments');
    expect(block?.code).toContain('readPreference');
  });

  it('defines guided skeletons and inline hints for cluster-setup', () => {
    const enh = getStepEnhancementSync('ingest-rate.cluster-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines guided skeletons and inline hints for small-records', () => {
    const enh = getStepEnhancementSync('ingest-rate.small-records');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(1);
  });

  it('returns undefined for unknown enhancement id', () => {
    const enh = getStepEnhancementSync('ingest-rate.unknown-id');
    expect(enh).toBeUndefined();
  });
});
