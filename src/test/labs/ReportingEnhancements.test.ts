import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Reporting step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('reporting.concepts');
    expect(enh).toBeDefined();
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('BI Connector');
    expect(code).toContain('SQL');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('reporting.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('mongoimport');
    expect(block?.code).toContain('MySQL Workbench');
  });

  it('provides code block for requirements enhancement', async () => {
    const enh = await getStepEnhancement('reporting.requirements');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M20');
    expect(block?.code).toContain('BI Connector');
  });

  it('provides code block for atlas-biconnector enhancement', async () => {
    const enh = await getStepEnhancement('reporting.atlas-biconnector');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Schema Sample Size');
    expect(block?.code).toContain('biuser');
  });

  it('provides code block for load-data enhancement', async () => {
    const enh = await getStepEnhancement('reporting.load-data');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('import_data.sh');
    expect(block?.code).toContain('on_time_perf');
  });

  it('provides code block for odbc-workbench enhancement', async () => {
    const enh = await getStepEnhancement('reporting.odbc-workbench');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('ODBC');
    expect(block?.code).toContain('MySQL Workbench');
  });

  it('provides code block for query-count enhancement', async () => {
    const enh = await getStepEnhancement('reporting.query-count');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('count(*)');
    expect(block?.code).toContain('airlines.on_time_perf');
  });

  it('provides code block for query-carriers enhancement', async () => {
    const enh = await getStepEnhancement('reporting.query-carriers');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Carrier');
    expect(block?.code).toContain('AVG');
  });

  it('provides code block for query-delays enhancement', async () => {
    const enh = await getStepEnhancement('reporting.query-delays');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Origin.State');
    expect(block?.code).toContain('Destination.State');
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('reporting.unknown-id');
    expect(enh).toBeUndefined();
  });
});
