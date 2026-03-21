import { describe, it, expect, vi } from 'vitest';
import { destroySandboxSessionsList } from './sandbox.js';

describe('destroySandboxSessionsList', () => {
  it('invokes destroy for each expired row in order', async () => {
    const calls: string[] = [];
    const destroy = vi.fn(async (sessionId: string, userId: string) => {
      calls.push(`${sessionId}:${userId}`);
    });

    const n = await destroySandboxSessionsList(
      [
        { sessionId: 's1', userId: 'u1' },
        { sessionId: 's2', userId: 'u2' },
      ],
      destroy
    );

    expect(n).toBe(2);
    expect(destroy).toHaveBeenCalledTimes(2);
    expect(calls).toEqual(['s1:u1', 's2:u2']);
  });

  it('returns zero when list is empty', async () => {
    const destroy = vi.fn();
    const n = await destroySandboxSessionsList([], destroy);
    expect(n).toBe(0);
    expect(destroy).not.toHaveBeenCalled();
  });
});
