import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Rolling Updates step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Rolling');
    expect(code).toContain('retryWrites');
  });

  it('provides code block for verification enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.verification');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('write.py');
    expect(block?.code).toContain('read.py');
    expect(block?.code).toContain('MD5');
  });

  it('provides code block for trigger enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.trigger');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Edit Configuration');
    expect(block?.code).toContain('Apply Changes');
  });

  it('provides code block for python-setup enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.python-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('srvlookup');
    expect(block?.code).toContain('pymongo');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M10');
    expect(block?.code).toContain('4.4');
  });

  it('provides code block for scripts enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.scripts');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('read.py');
    expect(block?.code).toContain('write.py');
  });

  it('provides code block for start-scripts enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.start-scripts');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('read.py');
    expect(block?.code).toContain('write.py');
  });

  it('provides code block for upgrade enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.upgrade');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Edit Configuration');
    expect(block?.code).toContain('retryWrites');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('rolling-updates.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('MD5');
    expect(block?.code).toContain('seq');
  });

  it('defines skeletons and inline hints for python-setup', async () => {
    const enh = await getStepEnhancement('rolling-updates.python-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('defines skeletons and inline hints for scripts', async () => {
    const enh = await getStepEnhancement('rolling-updates.scripts');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
