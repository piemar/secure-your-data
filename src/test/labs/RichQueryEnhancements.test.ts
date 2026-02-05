import { describe, it, expect } from 'vitest';
import { getStepEnhancement, getStepEnhancementSync } from '@/labs/stepEnhancementRegistry';

describe('Rich Query step enhancements', () => {
  it('provides code block for compound query enhancement', () => {
    const enh = getStepEnhancementSync('rich-query.compound-query');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('db.customers.find');
    expect(code).toContain('policies');
  });

  it('provides code block for index + explain enhancement', () => {
    const enh = getStepEnhancementSync('rich-query.index-explain');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(1);
    const createIndex = enh!.codeBlocks![0].code;
    const explain = enh!.codeBlocks![1].code;
    expect(createIndex).toContain('createIndex');
    expect(explain).toContain('.explain');
  });

  it('returns undefined for unknown enhancement id', () => {
    const enh = getStepEnhancementSync('rich-query.unknown-id');
    expect(enh).toBeUndefined();
  });

  it('provides code block for encrypted-vs-plain-setup enhancement', async () => {
    const enh = await getStepEnhancement('rich-query.encrypted-vs-plain-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('db.customers.find');
  });

  it('provides code block for encrypted-vs-plain-queries enhancement', async () => {
    const enh = await getStepEnhancement('rich-query.encrypted-vs-plain-queries');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('CSFLE');
    expect(block?.code).toContain('QE');
  });

  it('provides code block for encrypted-vs-plain-design enhancement', async () => {
    const enh = await getStepEnhancement('rich-query.encrypted-vs-plain-design');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('region');
    expect(block?.code).toContain('encrypted');
  });
});

