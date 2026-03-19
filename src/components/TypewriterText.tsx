import { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/sound-engine';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  sound?: boolean;
}

export function TypewriterText({ text, speed = 40, delay = 0, onComplete, className = '', sound = true }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
        if (sound && text[displayed.length] !== ' ') {
          soundEngine.play('datatype');
        }
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [displayed, started, text, speed, onComplete, sound]);

  return (
    <span className={`font-mono ${className}`}>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
