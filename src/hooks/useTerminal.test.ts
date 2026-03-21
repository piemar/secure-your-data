import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTerminal } from './useTerminal';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    execute: {
      repl: vi.fn(),
    },
  },
}));

describe('useTerminal', () => {
  beforeEach(() => {
    vi.mocked(api.execute.repl).mockResolvedValue({
      tier: 'execute',
      success: true,
      output: [{ command: 'db.test.find()', result: [], timeMs: 1 }],
      executionTimeMs: 1,
    });
  });

  it('submits trimmed command and records input + output lines', async () => {
    const { result } = renderHook(() => useTerminal('mission-12', undefined, { enabled: true }));

    act(() => {
      result.current.setInput('  db.test.find()  ');
    });

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => {
      expect(result.current.lines.length).toBe(2);
    });

    expect(result.current.lines[0]).toMatchObject({ kind: 'in', text: 'db.test.find()' });
    expect(result.current.lines[1]).toMatchObject({ kind: 'out' });
    expect(api.execute.repl).toHaveBeenCalledWith('db.test.find()', 'mission-12', undefined);
    expect(result.current.input).toBe('');
  });
});
