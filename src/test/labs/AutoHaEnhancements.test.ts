import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('AUTO-HA step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.concepts');
    expect(enh).toBeDefined();
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Automatic failover');
    expect(code).toContain('RTO');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('RECONNECTED-TO-DB');
    expect(block?.code).toContain('election');
  });

  it('provides code block for requirements enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.requirements');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('M10');
    expect(block?.code).toContain('Replica set');
  });

  it('provides code block for atlas-cluster enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.atlas-cluster');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('main_user');
    expect(block?.code).toContain('M10');
  });

  it('provides code block for connection-string enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.connection-string');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('retryWrites');
    expect(block?.code).toContain('Connection string');
  });

  it('provides code block for python-env enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.python-env');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('pymongo');
    expect(block?.code).toContain('dnspython');
  });

  it('provides code block for run-without-retry enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.run-without-retry');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('continuous-insert');
    expect(block?.code).toContain('retryWrites=false');
  });

  it('provides code block for trigger-failover enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.trigger-failover');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Test Failover');
    expect(block?.code).toContain('DB-CONNECTION-PROBLEM');
  });

  it('provides code block for run-with-retry enhancement', async () => {
    const enh = await getStepEnhancement('auto-ha.run-with-retry');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('retryWrites=true');
    expect(block?.code).toContain('retryReads=true');
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('auto-ha.unknown-id');
    expect(enh).toBeUndefined();
  });
});
