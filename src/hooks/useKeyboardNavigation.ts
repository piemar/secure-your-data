import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleNotes?: () => void;
  onToggleFullscreen?: () => void;
  onToggleTimer?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    onNext,
    onPrevious,
    onToggleNotes,
    onToggleFullscreen,
    onToggleTimer,
    onEscape,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        event.preventDefault();
        onNext?.();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        onPrevious?.();
        break;
      case 'n':
      case 'N':
        event.preventDefault();
        onToggleNotes?.();
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        onToggleFullscreen?.();
        break;
      case 't':
      case 'T':
        event.preventDefault();
        onToggleTimer?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [enabled, onNext, onPrevious, onToggleNotes, onToggleFullscreen, onToggleTimer, onEscape]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
