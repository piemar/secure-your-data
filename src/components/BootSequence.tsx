import { useState, useEffect, useCallback } from 'react';
import heistMascot from '@/assets/heist-mascot.png';

const BOOT_LINES = [
  { text: '> INITIALIZING SECURE CONNECTION...', delay: 0 },
  { text: '> LOADING ENCRYPTION MODULES... OK', delay: 600 },
  { text: '> ESTABLISHING TUNNEL TO ATLAS CLUSTER... OK', delay: 1200 },
  { text: '> AUTHENTICATING AGENT CREDENTIALS... OK', delay: 1800 },
  { text: '> LOADING MISSION DATABASE... OK', delay: 2400 },
  { text: '> MONGODB HEIST v2.0 — SYSTEMS NOMINAL', delay: 3000 },
  { text: '', delay: 3400 },
  { text: '> PRESS ANY KEY TO CONTINUE_', delay: 3600 },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === BOOT_LINES.length - 1) setReady(true);
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (ready) onComplete();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
  }, [ready, onComplete]);

  const isBooting = visibleLines > 0 && visibleLines < BOOT_LINES.length;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Mascot walking across screen while booting */}
      <div className="relative w-full max-w-lg mb-6 h-20 overflow-hidden">
        <img
          src={heistMascot}
          alt="Agent Raccoon hacking in"
          className="absolute w-14 h-14 sm:w-16 sm:h-16 bottom-0 drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
          style={{
            animation: isBooting
              ? 'raccoon-walk 3.6s linear forwards, raccoon-bob 0.4s ease-in-out infinite'
              : ready
              ? 'raccoon-idle 1.5s ease-in-out infinite'
              : undefined,
            left: ready ? '50%' : '0%',
            transform: ready ? 'translateX(-50%)' : undefined,
          }}
        />
      </div>

      <div className="max-w-lg w-full p-8 space-y-1">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <p
            key={i}
            className={`font-mono text-sm ${
              line.text.includes('PRESS ANY KEY')
                ? 'text-primary animate-pulse text-glow mt-4'
                : line.text.includes('OK')
                ? 'text-primary/80'
                : 'text-primary/60'
            }`}
          >
            {line.text}
          </p>
        ))}
        {isBooting && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
