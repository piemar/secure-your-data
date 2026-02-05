import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Right to Erasure step enhancements', () => {
  it('provides code block for explicit-encryption enhancement', async () => {
    const enh = await getStepEnhancement('right-to-erasure.explicit-encryption');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('ClientEncryption');
    expect(code).toContain('encrypt');
  });

  it('provides code block for multi-tenant-keys enhancement', async () => {
    const enh = await getStepEnhancement('right-to-erasure.multi-tenant-keys');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('createDataKey');
    expect(block?.code).toContain('keyAltNames');
  });

  it('provides code block for key-rotation enhancement', async () => {
    const enh = await getStepEnhancement('right-to-erasure.key-rotation');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('rewrapManyDataKey');
  });

  it('provides code block for rotation-readiness enhancement', async () => {
    const enh = await getStepEnhancement('right-to-erasure.rotation-readiness');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('list-aliases');
    expect(block?.code).toContain('describe-key');
  });

  it('defines skeletons and inline hints for explicit-encryption', async () => {
    const enh = await getStepEnhancement('right-to-erasure.explicit-encryption');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('includes tips for all enhancements', async () => {
    const enh = await getStepEnhancement('right-to-erasure.explicit-encryption');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('right-to-erasure.unknown-id');
    expect(enh).toBeUndefined();
  });
});
