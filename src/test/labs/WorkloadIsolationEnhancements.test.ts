import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Workload Isolation step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Workload Isolation');
    expect(code).toContain('ANALYTICS');
  });

  it('provides code block for atlas-topology enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.atlas-topology');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M30');
    expect(block?.code).toContain('Analytical Nodes');
  });

  it('provides code block for read-preference-tags enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.read-preference-tags');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('readPreference');
    expect(block?.code).toContain('secondaryPreferred');
    expect(block?.code).toContain('nodeType:ANALYTICS');
  });

  it('provides code block for data-load enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.data-load');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mgeneratejs');
    expect(block?.code).toContain('mongoimport');
    expect(block?.code).toContain('acme_inc');
  });

  it('provides code block for print-repset-conf enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.print-repset-conf');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('rs.conf');
    expect(block?.code).toContain('nodeType');
  });

  it('provides code block for inspect-tags enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.inspect-tags');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('rs.conf');
    expect(block?.code).toContain('tags');
  });

  it('provides code block for update-script enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.update-script');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('bulk_write');
    expect(block?.code).toContain('UpdateOne');
  });

  it('provides code block for query-script enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.query-script');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('aggregate');
    expect(block?.code).toContain('readPreferenceTags');
  });

  it('provides code block for metrics-verification enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.metrics-verification');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Metrics');
    expect(block?.code).toContain('Query Targeting');
  });

  it('defines guided skeletons and inline hints for read-preference-tags', async () => {
    const enh = await getStepEnhancement('workload-isolation.read-preference-tags');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines guided skeletons and inline hints for data-load', async () => {
    const enh = await getStepEnhancement('workload-isolation.data-load');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(1);
  });

  it('includes tips for concepts enhancement', async () => {
    const enh = await getStepEnhancement('workload-isolation.concepts');
    expect(enh).toBeDefined();
    expect(enh?.tips).toBeDefined();
    expect(enh!.tips!.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('workload-isolation.unknown-id');
    expect(enh).toBeUndefined();
  });
});
