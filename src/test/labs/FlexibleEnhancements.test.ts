import { describe, it, expect } from 'vitest';
import { getStepEnhancementSync } from '@/labs/stepEnhancementRegistry';

describe('Flexible Schema step enhancements', () => {
  it('provides code block for initial collection enhancement', () => {
    const enh = getStepEnhancementSync('flexible.initial-collection');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('MongoClient');
    expect(code).toContain('employees');
  });

  it('provides code block for add-fields enhancement', () => {
    const enh = getStepEnhancementSync('flexible.add-fields');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('update_many');
    expect(block?.code).toContain('$set');
  });

  it('provides code block for microservice-one enhancement', () => {
    const enh = getStepEnhancementSync('flexible.microservice-one');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('microservice');
    expect(block?.code).toContain('find');
  });

  it('defines guided skeletons and inline hints for initial-collection', () => {
    const enh = getStepEnhancementSync('flexible.initial-collection');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(3);

    for (const hint of block!.inlineHints!) {
      expect(hint.blankText).toMatch(/_+/);
      expect(typeof hint.hint).toBe('string');
      expect(typeof hint.answer).toBe('string');
    }
  });

  it('defines guided skeletons and inline hints for nested-subdoc', () => {
    const enh = getStepEnhancementSync('flexible.nested-subdoc');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(1);
  });

  it('returns undefined for unknown enhancement id', () => {
    const enh = getStepEnhancementSync('flexible.unknown-id');
    expect(enh).toBeUndefined();
  });
});
