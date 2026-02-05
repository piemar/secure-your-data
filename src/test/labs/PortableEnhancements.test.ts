import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Portable step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('portable.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Cloud-to-Cloud');
    expect(code).toContain('Cutover');
  });

  it('provides code block for cutover enhancement', async () => {
    const enh = await getStepEnhancement('portable.cutover');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Cutover');
    expect(block?.code).toContain('stopwatch');
  });

  it('provides code block for prerequisites enhancement', async () => {
    const enh = await getStepEnhancement('portable.prerequisites');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('CIDR');
    expect(block?.code).toContain('SRV');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('portable.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M30');
    expect(block?.code).toContain('AWSTestCluster');
    expect(block?.code).toContain('AzureTestCluster');
  });

  it('provides code block for connection-strings enhancement', async () => {
    const enh = await getStepEnhancement('portable.connection-strings');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mongodb+srv');
    expect(block?.code).toContain('non-SRV');
  });

  it('provides code block for mgeneratejs-setup enhancement', async () => {
    const enh = await getStepEnhancement('portable.mgeneratejs-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
    expect(block?.code).toContain('npm install');
  });

  it('provides code block for initiate enhancement', async () => {
    const enh = await getStepEnhancement('portable.initiate');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
    expect(block?.code).toContain('mongoimport');
    expect(block?.code).toContain('200000');
  });

  it('provides code block for cutover-execute enhancement', async () => {
    const enh = await getStepEnhancement('portable.cutover-execute');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mongodb+srv');
    expect(block?.code).toContain('Start Cutover');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('portable.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('test.customers');
    expect(block?.code).toContain('Stopwatch');
  });

  it('defines skeletons and inline hints for mgeneratejs-setup', async () => {
    const enh = await getStepEnhancement('portable.mgeneratejs-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines skeletons and inline hints for initiate', async () => {
    const enh = await getStepEnhancement('portable.initiate');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('defines skeletons and inline hints for cutover-execute', async () => {
    const enh = await getStepEnhancement('portable.cutover-execute');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
