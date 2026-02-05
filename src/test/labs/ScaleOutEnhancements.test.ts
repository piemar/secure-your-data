import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Scale-Out step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('shard');
    expect(code).toContain('Balancer');
  });

  it('provides code block for sustained-load enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.sustained-load');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('shard');
  });

  it('provides code block for metrics enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.metrics');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('batch_execution_times');
    expect(block?.code).toContain('chunk_counts');
  });

  it('provides code block for aws-setup enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.aws-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('EC2');
  });

  it('provides code block for atlas-config enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.atlas-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('API');
  });

  it('provides code block for script-config enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.script-config');
    expect(enh).toBeDefined();
    const blocks = enh!.codeBlocks ?? [];
    expect(blocks.length).toBeGreaterThan(0);
    const hasAtlasConfig = blocks.some(b => b.code.includes('api_public_key') || b.filename.includes('atlas'));
    expect(hasAtlasConfig).toBe(true);
  });

  it('provides code block for run-test enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.run-test');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('make automatic');
  });

  it('provides code block for inspect-results enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.inspect-results');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('test_results');
  });

  it('provides code block for atlas-charts enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.atlas-charts');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Charts');
  });

  it('defines skeletons and inline hints for script-config', async () => {
    const enh = await getStepEnhancement('scale-out.script-config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('includes tips for concepts enhancement', async () => {
    const enh = await getStepEnhancement('scale-out.concepts');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('scale-out.unknown-id');
    expect(enh).toBeUndefined();
  });
});
