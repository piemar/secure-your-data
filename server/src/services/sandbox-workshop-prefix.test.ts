import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ObjectId } from 'mongodb';

const findOneMock = vi.fn();

vi.mock('../config/db.js', () => ({
  getDb: () => ({
    collection: () => ({ findOne: findOneMock }),
  }),
}));

const WORKSHOP_ID = '507f1f77bcf86cd799439011';

async function loadResolve() {
  vi.resetModules();
  const mod = await import('./sandbox.js');
  return mod.resolveSandboxCollectionPrefixModeForSession;
}

describe('resolveSandboxCollectionPrefixModeForSession', () => {
  beforeEach(() => {
    findOneMock.mockReset();
    vi.stubEnv('SANDBOX_COLLECTION_PREFIX_MODE', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not query workshops for solo session', async () => {
    const resolve = await loadResolve();
    expect(await resolve('solo', 'tenant-1')).toBe(false);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it('applies workshop sandboxCollectionPrefixMode true over env false', async () => {
    findOneMock.mockResolvedValueOnce({ sandboxCollectionPrefixMode: true });
    const resolve = await loadResolve();
    expect(await resolve(WORKSHOP_ID, 'tenant-1')).toBe(true);
    expect(findOneMock).toHaveBeenCalledWith(
      { _id: new ObjectId(WORKSHOP_ID), tenantId: 'tenant-1' },
      { projection: { sandboxCollectionPrefixMode: 1 } }
    );
  });

  it('applies workshop sandboxCollectionPrefixMode false over env true', async () => {
    vi.stubEnv('SANDBOX_COLLECTION_PREFIX_MODE', 'true');
    findOneMock.mockResolvedValueOnce({ sandboxCollectionPrefixMode: false });
    const resolve = await loadResolve();
    expect(await resolve(WORKSHOP_ID, 'tenant-1')).toBe(false);
  });

  it('falls back to env when workshop doc has no override', async () => {
    findOneMock.mockResolvedValueOnce({});
    vi.stubEnv('SANDBOX_COLLECTION_PREFIX_MODE', 'true');
    const resolve = await loadResolve();
    expect(await resolve(WORKSHOP_ID, 'tenant-1')).toBe(true);
  });
});
