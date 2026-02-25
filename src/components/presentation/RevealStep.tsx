import { createContext, useContext, ReactNode } from 'react';

export const RevealStepContext = createContext<{ stepIndex: number }>({ stepIndex: 0 });

/**
 * Renders children only when the current slide step is >= the given step.
 * Use with slides that set stepCount; parent provides stepIndex via RevealStepContext.
 */
export function RevealStep({ step, children }: { step: number; children: ReactNode }) {
  const { stepIndex } = useContext(RevealStepContext);
  if (step > stepIndex) return null;
  return <>{children}</>;
}
