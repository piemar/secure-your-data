import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Consistency step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('consistency.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('majority');
    expect(code).toContain('Causal Consistency');
  });

  it('provides code block for driver-settings enhancement', async () => {
    const enh = await getStepEnhancement('consistency.driver-settings');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('MongoClient');
    expect(block?.code).toContain('causal_consistency');
  });

  it('provides code block for failover enhancement', async () => {
    const enh = await getStepEnhancement('consistency.failover');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Failover');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('consistency.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M30');
    expect(block?.code).toContain('Sharded');
  });

  it('provides code block for shard-config enhancement', async () => {
    const enh = await getStepEnhancement('consistency.shard-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('sh.enableSharding');
    expect(block?.code).toContain('sh.shardCollection');
  });

  it('provides code block for data-load enhancement', async () => {
    const enh = await getStepEnhancement('consistency.data-load');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('generate1Mpeople');
    expect(block?.code).toContain('faker');
  });

  it('provides code block for run-script enhancement', async () => {
    const enh = await getStepEnhancement('consistency.run-script');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('updateAndCheckPeople');
  });

  it('provides code block for verify-log enhancement', async () => {
    const enh = await getStepEnhancement('consistency.verify-log');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('grep');
    expect(block?.code).toContain('consistency.log');
  });

  it('defines skeletons and inline hints for driver-settings', async () => {
    const enh = await getStepEnhancement('consistency.driver-settings');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines skeletons and inline hints for shard-config', async () => {
    const enh = await getStepEnhancement('consistency.shard-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('includes tips for concepts enhancement', async () => {
    const enh = await getStepEnhancement('consistency.concepts');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('consistency.unknown-id');
    expect(enh).toBeUndefined();
  });
});
