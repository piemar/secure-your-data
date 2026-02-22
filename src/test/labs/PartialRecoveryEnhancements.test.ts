import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Partial Recovery step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.concepts');
    expect(enh).toBeDefined();
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Partial Recovery');
    expect(code).toContain('mongoexport');
    expect(code).toContain('mongoimport');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('continuous-insert');
    expect(block?.code).toContain('PITR');
  });

  it('provides code block for requirements enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.requirements');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Main cluster');
    expect(block?.code).toContain('Temp cluster');
  });

  it('provides code block for tools enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.tools');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
    expect(block?.code).toContain('pymongo');
  });

  it('provides code block for atlas-clusters enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.atlas-clusters');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M10');
    expect(block?.code).toContain('Continuous');
  });

  it('provides code block for load-and-snapshot enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.load-and-snapshot');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Customer360Data.json');
    expect(block?.code).toContain('continuous-insert');
  });

  it('provides code block for verify-present enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.verify-present');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('firstname');
    expect(block?.code).toContain('customers');
  });

  it('provides code block for delete-docs enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.delete-docs');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('remove');
    expect(block?.code).toContain('firstname');
  });

  it('provides code block for pitr-export-import enhancement', async () => {
    const enh = await getStepEnhancement('partial-recovery.pitr-export-import');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mongoexport');
    expect(block?.code).toContain('mongoimport');
    expect(block?.code).toContain('lost_records.json');
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('partial-recovery.unknown-id');
    expect(enh).toBeUndefined();
  });
});
