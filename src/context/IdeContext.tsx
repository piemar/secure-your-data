/**
 * IDE / lab hint context for command palette and hint orchestrator.
 * StepView sets context when step changes; CommandPalette and SuggestNextStep consume it.
 * See Docs/BROWSER_IDE_REFACTOR_IMPLEMENTATION_STATUS.md.
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { HintContext as IHintContext } from '@/types/ide';
import type { DocumentStore } from '@/services/workspace';

export interface IdeContextValue {
  /** Current lab/step context for palette and hints */
  hintContext: IHintContext;
  /** Update context (e.g. when step changes). Merged with previous. */
  setHintContext: (ctx: Partial<IHintContext>) => void;
  /** Ref set by StepView: run current step (handleRunAll). Palette actions call this. */
  runAllRef: React.MutableRefObject<(() => void) | null>;
  /** Shared document store; StepView syncs step code here for hint providers */
  documentStore: DocumentStore | null;
  /** Set the shared document store (created once in provider). */
  setDocumentStore: (store: DocumentStore | null) => void;
}

const IdeContext = createContext<IdeContextValue | undefined>(undefined);

export function IdeProvider({ children }: { children: React.ReactNode }) {
  const [hintContext, setHintContextState] = useState<IHintContext>({});
  const [documentStore, setDocumentStore] = useState<DocumentStore | null>(null);
  const runAllRef = useRef<(() => void) | null>(null);

  const setHintContext = useCallback((ctx: Partial<IHintContext>) => {
    setHintContextState((prev) => ({ ...prev, ...ctx }));
  }, []);

  const value: IdeContextValue = {
    hintContext,
    setHintContext,
    runAllRef,
    documentStore,
    setDocumentStore,
  };

  return <IdeContext.Provider value={value}>{children}</IdeContext.Provider>;
}

export function useIdeContext(): IdeContextValue {
  const ctx = useContext(IdeContext);
  if (ctx === undefined) {
    throw new Error('useIdeContext must be used within IdeProvider');
  }
  return ctx;
}

/** Optional hook: returns undefined if outside IdeProvider (e.g. on non-lab pages). */
export function useIdeContextOptional(): IdeContextValue | undefined {
  return useContext(IdeContext);
}
