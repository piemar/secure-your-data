import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Full Recovery RTO step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.concepts');
    expect(enh).toBeDefined();
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('RTO');
    expect(code).toContain('Restore Time Objective');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('10 GB');
    expect(block?.code).toContain('8.37M');
  });

  it('provides code block for requirements enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.requirements');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M40');
  });

  it('provides code block for mgeneratejs enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.mgeneratejs');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M40');
  });

  it('provides code block for load-data enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.load-data');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Customer360Data');
    expect(block?.code).toContain('8370000');
  });

  it('provides code block for enable-backup enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.enable-backup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Continuous Backup');
  });

  it('provides code block for simulate-disaster enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.simulate-disaster');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Delete');
  });

  it('provides code block for restore enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.restore');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Restore');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('8,370,000');
  });

  it('defines skeletons for load-data', async () => {
    const enh = await getStepEnhancement('full-recovery-rto.load-data');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
