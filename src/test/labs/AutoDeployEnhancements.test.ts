import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Auto-Deploy step enhancements', () => {
  it('provides code block for concepts enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.concepts');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks && enh.codeBlocks.length).toBeGreaterThan(0);
    const code = enh!.codeBlocks![0].code;
    expect(code).toContain('Atlas Admin API');
    expect(code).toContain('CREATING');
    expect(code).toContain('IDLE');
  });

  it('provides code block for flow enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.flow');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('POST');
    expect(block?.code).toContain('Poll');
  });

  it('provides code block for config enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('REPLICASET');
    expect(block?.code).toContain('M30');
  });

  it('provides code block for python-setup enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.python-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('pip3');
    expect(block?.code).toContain('requests');
  });

  it('provides code block for atlas-setup enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.atlas-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Project ID');
    expect(block?.code).toContain('Organization');
  });

  it('provides code block for api-keys enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.api-keys');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('Programmatic');
    expect(block?.code).toContain('Project Owner');
  });

  it('provides code block for configure enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.configure');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('apiPublicKey');
    expect(block?.code).toContain('projectId');
  });

  it('provides code block for execute enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.execute');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('chmod');
    expect(block?.code).toContain('auto_deploy_atlas.py');
  });

  it('provides code block for verify enhancement', async () => {
    const enh = await getStepEnhancement('auto-deploy.verify');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.code).toContain('IDLE');
    expect(block?.code).toContain('5–10 minutes');
  });

  it('defines skeletons and inline hints for config', async () => {
    const enh = await getStepEnhancement('auto-deploy.config');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
    expect(block!.inlineHints!.length).toBeGreaterThanOrEqual(2);
  });

  it('defines skeletons and inline hints for python-setup', async () => {
    const enh = await getStepEnhancement('auto-deploy.python-setup');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });

  it('defines skeletons and inline hints for configure', async () => {
    const enh = await getStepEnhancement('auto-deploy.configure');
    expect(enh).toBeDefined();
    const block = enh!.codeBlocks?.[0];
    expect(block?.skeleton).toBeDefined();
    expect(block?.inlineHints).toBeDefined();
  });
});
