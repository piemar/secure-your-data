/**
 * Listens for ide:run custom events and calls runAllRef.current (set by StepView).
 * Enables command palette "Run Node/Mongosh/Bash" to trigger run current step.
 */
import { useEffect } from 'react';
import { useIdeContext } from '@/context/IdeContext';

export function IdeRunListener() {
  const { runAllRef } = useIdeContext();

  useEffect(() => {
    const handler = () => {
      runAllRef.current?.();
    };
    document.addEventListener('ide:run', handler);
    return () => document.removeEventListener('ide:run', handler);
  }, [runAllRef]);

  return null;
}
