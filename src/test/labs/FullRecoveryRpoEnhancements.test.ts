import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Full Recovery RPO step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.concepts');
    expect(enh).toBeDefined();
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('RPO');
    expect(code).toContain('point in time');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('BEFORE_CORRUPTION');
    expect(block?.code).toContain('AFTER_CORRUPTION');
  });

  it('provides code block for requirements enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.requirements');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Continuous Backup');
  });

  it('provides code block for mgeneratejs enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.mgeneratejs');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M10');
  });

  it('provides code block for load-good enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.load-good');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgenerateBefore');
    expect(block?.code).toContain('1000');
  });

  it('provides code block for corrupt enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.corrupt');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgenerateAfter');
  });

  it('provides code block for restore enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.restore');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Point in Time Restore');
  });

  it('defines skeletons for load-good', async () => {
    const enh = await getStepEnhancement('full-recovery-rpo.load-good');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
