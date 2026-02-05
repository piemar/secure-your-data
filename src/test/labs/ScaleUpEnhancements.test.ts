import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Scale-Up step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Scale-up');
    expect(code).toContain('vertical');
  });

  it('provides code block for rolling-update enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.rolling-update');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Rolling');
    expect(block?.code).toContain('Primary');
  });

  it('provides code block for metrics enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.metrics');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('monitor');
    expect(block?.code).toContain('Records');
  });

  it('provides code block for laptop-setup enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.laptop-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('pip3');
    expect(block?.code).toContain('pymongo');
  });

  it('provides code block for atlas-config enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.atlas-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M20');
    expect(block?.code).toContain('main_user');
  });

  it('provides code block for params-config enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.params-config');
    expect(enh).toBeDefined();
    const blocks = enh!.codeBlocks ?? [];
    expect(blocks.length).toBeGreaterThan(0);
    const hasParams = blocks.some(b => b.code.includes('conn_string') || b.filename.includes('params'));
    expect(hasParams).toBe(true);
  });

  it('provides code block for run-insert enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.run-insert');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('insert');
  });

  it('provides code block for run-scale enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.run-scale');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M20');
    expect(block?.code).toContain('M30');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('val');
    expect(block?.code).toContain('Compass');
  });

  it('defines skeletons and inline hints for params-config', async () => {
    const enh = await getStepEnhancement('scale-up.params-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(1);
  });

  it('defines skeletons and inline hints for verify', async () => {
    const enh = await getStepEnhancement('scale-up.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('includes tips for concepts enhancement', async () => {
    const enh = await getStepEnhancement('scale-up.concepts');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('scale-up.unknown-id');
    expect(enh).toBeUndefined();
  });
});
