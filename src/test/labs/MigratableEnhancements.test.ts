import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Migratable step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('migratable.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Live Migration');
    expect(code).toContain('Cutover');
  });

  it('provides code block for cutover enhancement', async () => {
    const enh = await getStepEnhancement('migratable.cutover');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Cutover');
    expect(block?.code).toContain('stopwatch');
  });

  it('provides code block for prerequisites enhancement', async () => {
    const enh = await getStepEnhancement('migratable.prerequisites');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('CIDR');
    expect(block?.code).toContain('27017');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('migratable.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M30');
    expect(block?.code).toContain('main_user');
  });

  it('provides code block for source-setup enhancement', async () => {
    const enh = await getStepEnhancement('migratable.source-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('rsMigration');
    expect(block?.code).toContain('bindIp');
  });

  it('provides code block for pocdriver-setup enhancement', async () => {
    const enh = await getStepEnhancement('migratable.pocdriver-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('POCDriver');
    expect(block?.code).toContain('mvn');
  });

  it('provides code block for initiate enhancement', async () => {
    const enh = await getStepEnhancement('migratable.initiate');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('POCDriver.jar');
    expect(block?.code).toContain('-q 100');
  });

  it('provides code block for cutover-execute enhancement', async () => {
    const enh = await getStepEnhancement('migratable.cutover-execute');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mongodb+srv');
    expect(block?.code).toContain('Start Cutover');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('migratable.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('POCDB.POCCOLL');
    expect(block?.code).toContain('Stopwatch');
  });

  it('defines skeletons and inline hints for source-setup', async () => {
    const enh = await getStepEnhancement('migratable.source-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines skeletons and inline hints for pocdriver-setup', async () => {
    const enh = await getStepEnhancement('migratable.pocdriver-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines skeletons and inline hints for initiate', async () => {
    const enh = await getStepEnhancement('migratable.initiate');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
