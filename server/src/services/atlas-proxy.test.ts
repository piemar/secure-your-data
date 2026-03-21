import { describe, it, expect } from 'vitest';
import { runAtlasProxy } from './atlas-proxy.js';

describe('runAtlasProxy', () => {
  it('falls back to simulation when proxy is disabled', async () => {
    delete process.env.ATLAS_PROXY_ENABLED;
    delete process.env.ATLAS_PROXY_URI;

    const res = await runAtlasProxy('sh.status()');
    expect(res.tier).toBe('simulate');
    expect(res.success).toBe(true);
    expect(res.output.length).toBeGreaterThan(0);
  });
});
