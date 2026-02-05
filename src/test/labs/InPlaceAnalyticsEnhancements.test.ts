import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('In-Place Analytics step enhancements', () => {
  it('provides code block for data-setup enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.data-setup');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('mongorestore');
    expect(code).toContain('FAST-ANALYTICS');
  });

  it('provides code block for index-creation enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.index-creation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('createIndex');
    expect(block?.code).toContain('country');
  });

  it('provides code block for basic-aggregation enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.basic-aggregation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('aggregate');
    expect(block?.code).toContain('$match');
    expect(block?.code).toContain('$group');
  });

  it('provides code block for unwind-aggregation enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.unwind-aggregation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$unwind');
    expect(block?.code).toContain('accounts');
  });

  it('provides code block for group-sort enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.group-sort');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$sort');
    expect(block?.code).toContain('avgRank');
  });

  it('provides code block for project-aggregation enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.project-aggregation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$project');
    expect(block?.code).toContain('$size');
  });

  it('defines guided skeletons and inline hints for basic-aggregation', async () => {
    const enh = await getStepEnhancement('in-place-analytics.basic-aggregation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines guided skeletons and inline hints for unwind-aggregation', async () => {
    const enh = await getStepEnhancement('in-place-analytics.unwind-aggregation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(1);
  });

  it('includes tips for performance analysis', async () => {
    const enh = await getStepEnhancement('in-place-analytics.performance-analysis');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('in-place-analytics.unknown-id');
    expect(enh).toBeUndefined();
  });

  it('provides code block for overview-intro enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.overview-intro');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$match');
    expect(block?.code).toContain('$group');
  });

  it('provides code block for overview-report enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.overview-report');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$group');
    expect(block?.code).toContain('totalRevenue');
  });

  it('provides code block for overview-time-series enhancement', async () => {
    const enh = await getStepEnhancement('in-place-analytics.overview-time-series');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('$dateTrunc');
    expect(block?.code).toContain('Atlas Charts');
  });
});
