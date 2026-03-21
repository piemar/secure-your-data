import { describe, it, expect, vi } from 'vitest';
import { executeCode } from './code-executor.js';

describe('executeCode prefix mode', () => {
  it('maps collection names with provided prefix', async () => {
    const called: string[] = [];
    const cursor = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      explain: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    };
    const collection = {
      find: vi.fn().mockReturnValue(cursor),
    };
    const db = {
      collection: vi.fn((name: string) => {
        called.push(name);
        return collection;
      }),
    } as any;

    const result = await executeCode(db, 'db.agents.find({})', { collectionPrefix: 'sbx_demo_' });
    expect(result.success).toBe(true);
    expect(called[0]).toBe('sbx_demo_agents');
  });
});
