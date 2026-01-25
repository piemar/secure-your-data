import { useState, useEffect, useCallback } from 'react';
import type { Progress } from '@/types';

const STORAGE_KEY = 'mongodb-sa-enablement-progress';

const initialProgress: Progress = {
  currentSlide: 1,
  completedSlides: [],
  labProgress: {},
  timerState: {
    isRunning: false,
    elapsed: 0,
    mode: 'presentation',
  },
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProgress;
    } catch {
      return initialProgress;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const setCurrentSlide = useCallback((slideId: number) => {
    setProgress(prev => ({
      ...prev,
      currentSlide: slideId,
      completedSlides: prev.completedSlides.includes(slideId - 1)
        ? prev.completedSlides
        : [...prev.completedSlides, slideId - 1].filter(s => s > 0),
    }));
  }, []);

  const markSlideComplete = useCallback((slideId: number) => {
    setProgress(prev => ({
      ...prev,
      completedSlides: prev.completedSlides.includes(slideId)
        ? prev.completedSlides
        : [...prev.completedSlides, slideId],
    }));
  }, []);

  const markLabStepComplete = useCallback((labId: number, stepId: number) => {
    setProgress(prev => ({
      ...prev,
      labProgress: {
        ...prev.labProgress,
        [labId]: {
          ...prev.labProgress[labId],
          completedSteps: [
            ...(prev.labProgress[labId]?.completedSteps || []),
            stepId,
          ].filter((v, i, a) => a.indexOf(v) === i),
        },
      },
    }));
  }, []);

  const resetLabProgress = useCallback((labId: number) => {
    setProgress(prev => ({
      ...prev,
      labProgress: {
        ...prev.labProgress,
        [labId]: {
          completedSteps: [],
          startedAt: undefined,
          completedAt: undefined,
        },
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setProgress(initialProgress);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateTimerState = useCallback((timerState: Partial<Progress['timerState']>) => {
    setProgress(prev => ({
      ...prev,
      timerState: {
        ...prev.timerState,
        ...timerState,
      },
    }));
  }, []);

  return {
    progress,
    setCurrentSlide,
    markSlideComplete,
    markLabStepComplete,
    resetLabProgress,
    resetAll,
    updateTimerState,
  };
}
