/**
 * xterm.js terminal surface. Phase 6.
 * When session is provided (e.g. from SessionManager), connects to live PTY over WebSocket.
 * Without a session, acts as a local echo / placeholder.
 */
import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { cn } from '@/lib/utils';
import type { TerminalSession } from '@/types/ide';

interface XtermTerminalProps {
  className?: string;
  /** When set, input is sent here (e.g. WebSocket or ExecutionService). */
  onData?: (data: string) => void;
  /** Live PTY session (Phase 6). When set, input goes to session.write and output comes from session.onData. */
  session?: TerminalSession | null;
  /** Initial welcome line when no session. */
  welcome?: string;
}

export function XtermTerminal({ className, onData, session, welcome = 'Terminal (connect a session for live shell).' }: XtermTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      theme: { background: '#0c0e12', foreground: '#e0e0e0' },
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    terminalRef.current = term;
    fitRef.current = fitAddon;

    const sendInput = session?.write ?? onData;
    if (!sendInput && welcome) {
      term.writeln(welcome);
    }
    term.onData((data) => {
      if (sendInput) sendInput(data);
      else term.write(data);
    });

    let unsubData: (() => void) | undefined;
    let unsubClose: (() => void) | undefined;
    if (session) {
      unsubData = session.onData((data) => {
        try { term.write(data); } catch { /* ignore */ }
      });
      unsubClose = session.onClose(() => {
        term.writeln('\r\n\r\n[Session closed]');
      });
    }

    const resize = () => {
      fitAddon.fit();
      if (session && term.rows != null && term.cols != null) session.resize(term.cols, term.rows);
    };
    window.addEventListener('resize', resize);
    // Adapt rows/cols when the container is resized (e.g. vertical slider in lab step view)
    const container = containerRef.current;
    const resizeObserver = container ? new ResizeObserver(() => resize()) : undefined;
    if (resizeObserver && container) resizeObserver.observe(container);
    if (session && term.rows != null && term.cols != null) session.resize(term.cols, term.rows);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      unsubData?.();
      unsubClose?.();
      term.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [onData, session, welcome]);

  return <div ref={containerRef} className={cn('h-full w-full p-2', className)} />;
}
