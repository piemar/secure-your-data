/**
 * Mongosh-style REPL: xterm output + single-line input.
 */
import { useRef, useEffect, type KeyboardEvent } from 'react';
import { Terminal, Loader2 } from 'lucide-react';
import { Terminal as XtermTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Button } from '@/components/ui/button';
import type { TerminalLine } from '@/hooks/useTerminal';
import type { ExecuteCommandOutput } from '@/services/api';

function isInternalMayhemProtocolLine(line: string): boolean {
  const s = line.toLowerCase();
  return (
    s.includes('__mayhem') ||
    s.includes('__mayhem_result__') ||
    s.includes('__mayhemcaptureb64') ||
    s.includes('__mayhemresults') ||
    s.includes('globalthis.__mayhem')
  );
}

function formatResult(result: unknown): string {
  if (result === null || result === undefined) return 'null';
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

/** Tier-3 simulation payloads use `output`; sandbox uses `result`. */
function displayPayload(item: ExecuteCommandOutput): unknown {
  const row = item as ExecuteCommandOutput & { output?: unknown };
  if (row.output !== undefined) return row.output;
  return item.result;
}

function outputToTerminalLines(item: ExecuteCommandOutput): string[] {
  const out: string[] = [];
  const payload = displayPayload(item);
  const marker = item.simulated ? '⚡' : '▶';
  const timing = item.timeMs != null ? ` (${item.timeMs}ms)` : '';
  out.push(`${marker} ${item.command}${timing}`);
  if (item.simulated) out.push('[simulated]');
  if (item.error) {
    out.push(...item.error.split('\n').map(line => `[error] ${line}`));
  } else {
    out.push(...formatResult(payload).split('\n'));
  }
  if (item.message) out.push(item.message);
  return out;
}

function terminalLineToTextLines(line: TerminalLine): string[] {
  if (line.kind === 'in') return [`> ${line.text}`];
  const out: string[] = [];
  if (line.message && !line.outputs.length && !line.error) out.push(line.message);
  if (line.error && line.outputs.length === 0) {
    out.push(...line.error.split('\n').map(row => `[error] ${row}`));
  }
  for (const item of line.outputs) {
    out.push(...outputToTerminalLines(item));
  }
  if (line.executionTimeMs != null && line.outputs.length > 0) {
    out.push(`[total ${line.executionTimeMs}ms]`);
  }
  return out;
}

export interface TerminalPanelProps {
  lines: TerminalLine[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSubmitCommand?: (command: string) => void;
  isRunning: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onNavigateHistory?: (direction: 'up' | 'down') => void;
  onClear?: () => void;
  /** Min height so the panel feels usable inside the mission layout */
  minHeight?: string;
  /** Optional panel title (shown when header is enabled) */
  title?: string;
  /** Hide built-in header for VSCode-style outer tabs */
  showHeader?: boolean;
  /** VSCode-like direct typing inside terminal canvas */
  interactiveInput?: boolean;
  /** True passthrough mode for PTY shell streams */
  rawMode?: boolean;
  /** Raw stream chunks from PTY backend */
  rawChunks?: Array<{ id: string; data: string }>;
  /** Send one raw key/input chunk to PTY */
  onInputData?: (data: string) => void;
  /** Resize notification for PTY backend */
  onResizeTerminal?: (cols: number, rows: number) => void;
}

export function TerminalPanel({
  lines,
  inputValue,
  onInputChange,
  onSubmit,
  onSubmitCommand,
  isRunning,
  disabled = false,
  disabledHint,
  onNavigateHistory,
  onClear,
  minHeight = 'min-h-[280px]',
  title = 'TERMINAL',
  showHeader = true,
  interactiveInput = false,
  rawMode = false,
  rawChunks = [],
  onInputData,
  onResizeTerminal,
}: TerminalPanelProps) {
  const terminalRootRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XtermTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const renderedLineCountRef = useRef(0);
  const renderedChunkCountRef = useRef(0);
  const prevRunningRef = useRef(false);
  const inlineBufferRef = useRef('');
  const rawModeRef = useRef(rawMode);
  const onInputDataRef = useRef(onInputData);
  const onResizeTerminalRef = useRef(onResizeTerminal);
  const disabledRef = useRef(disabled);
  const isRunningRef = useRef(isRunning);
  const rawMarkerCarryRef = useRef('');

  useEffect(() => {
    rawModeRef.current = rawMode;
    onInputDataRef.current = onInputData;
    onResizeTerminalRef.current = onResizeTerminal;
    disabledRef.current = disabled;
    isRunningRef.current = isRunning;
  }, [rawMode, onInputData, onResizeTerminal, disabled, isRunning]);

  const drawInlinePrompt = (term: XtermTerminal) => {
    term.write(`\r\x1b[2K> ${inlineBufferRef.current}`);
  };

  useEffect(() => {
    if (!terminalRootRef.current || xtermRef.current) return;

    const term = new XtermTerminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 11,
      lineHeight: 1.25,
      scrollback: 5000,
      theme: {
        background: '#0f1318',
        foreground: '#9df4b1',
        cursor: '#22c55e',
        black: '#0f1318',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#a3e635',
        blue: '#16a34a',
        magenta: '#4ade80',
        cyan: '#34d399',
        white: '#d1fae5',
        brightBlack: '#14532d',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#bef264',
        brightBlue: '#22c55e',
        brightMagenta: '#86efac',
        brightCyan: '#6ee7b7',
        brightWhite: '#ecfdf5',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRootRef.current);
    fitAddon.fit();
    // Normalize the first paint so stale glyphs/control artifacts are not shown on initial load.
    term.reset();
    if (!rawModeRef.current) {
      term.writeln('MongoDB Mayhem REPL ready.');
    }
    if (interactiveInput && !rawModeRef.current) {
      term.write('> ');
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const ro = new ResizeObserver(() => {
      fitAddon.fit();
      onResizeTerminalRef.current?.(term.cols, term.rows);
    });
    ro.observe(terminalRootRef.current);

    const keyListener = interactiveInput
      ? term.onData((data) => {
          if (rawModeRef.current) {
            if (disabledRef.current || isRunningRef.current) return;
            onInputDataRef.current?.(data);
            return;
          }
          if (disabledRef.current || isRunningRef.current) return;
          if (data === '\r') {
            const command = inlineBufferRef.current;
            term.write('\r\n');
            inlineBufferRef.current = '';
            if (command.trim()) {
              if (onSubmitCommand) {
                onSubmitCommand(command);
              } else {
                onInputChange(command);
                queueMicrotask(() => onSubmit());
              }
            }
            term.write('> ');
            return;
          }
          if (data === '\u007f') {
            if (inlineBufferRef.current.length > 0) {
              inlineBufferRef.current = inlineBufferRef.current.slice(0, -1);
              term.write('\b \b');
            }
            return;
          }
          if (data === '\u001b[A') {
            onNavigateHistory?.('up');
            return;
          }
          if (data === '\u001b[B') {
            onNavigateHistory?.('down');
            return;
          }
          if (data >= ' ') {
            inlineBufferRef.current += data;
            term.write(data);
          }
        })
      : null;

    return () => {
      keyListener?.dispose();
      ro.disconnect();
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      renderedLineCountRef.current = 0;
      renderedChunkCountRef.current = 0;
      prevRunningRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (rawMode) return;
    const term = xtermRef.current;
    if (!term) return;
    if (lines.length === 0 && renderedLineCountRef.current !== 0) {
      term.clear();
      term.writeln('Terminal cleared.');
      renderedLineCountRef.current = 0;
    }
    for (let i = renderedLineCountRef.current; i < lines.length; i += 1) {
      const textLines = terminalLineToTextLines(lines[i]);
      if (interactiveInput) {
        term.write('\r\n');
      }
      for (const row of textLines) term.writeln(row);
      term.writeln('');
    }
    renderedLineCountRef.current = lines.length;
    if (isRunning && !prevRunningRef.current) {
      term.writeln('Running...');
    }
    prevRunningRef.current = isRunning;
    if (interactiveInput) {
      drawInlinePrompt(term);
    }
  }, [interactiveInput, isRunning, lines, rawMode]);

  useEffect(() => {
    if (!rawMode) return;
    const term = xtermRef.current;
    if (!term) return;
    if (rawChunks.length === 0 && renderedChunkCountRef.current !== 0) {
      term.reset();
      renderedChunkCountRef.current = 0;
      rawMarkerCarryRef.current = '';
      return;
    }
    for (let i = renderedChunkCountRef.current; i < rawChunks.length; i += 1) {
      const combined = rawMarkerCarryRef.current + rawChunks[i].data;
      const lines = combined.split('\n');
      rawMarkerCarryRef.current = lines.pop() ?? '';
      const visible = lines
        .filter((line) => !isInternalMayhemProtocolLine(line))
        .join('\n');
      if (visible) {
        term.write(`${visible}\n`);
      }

      // Prompts often arrive without a trailing newline; flush them so cursor
      // appears on the active prompt line instead of a blank line.
      const carry = rawMarkerCarryRef.current;
      const trimmedCarry = carry.trimStart();
      const isInternalMarkerCarry = isInternalMayhemProtocolLine(trimmedCarry);
      if (
        carry &&
        !isInternalMarkerCarry &&
        (
          /(?:\[[^\]]+\]\s+\S+>\s*$|\b\w+>\s*$)/.test(carry.trimEnd()) ||
          carry.length > 1
        )
      ) {
        term.write(carry);
        rawMarkerCarryRef.current = '';
      }
    }
    renderedChunkCountRef.current = rawChunks.length;
  }, [rawMode, rawChunks]);

  useEffect(() => {
    if (!disabledHint || !xtermRef.current || lines.length > 0) return;
    xtermRef.current.writeln(`[hint] ${disabledHint}`);
  }, [disabledHint, lines.length]);

  useEffect(() => {
    if (rawMode || !interactiveInput || !xtermRef.current) return;
    inlineBufferRef.current = inputValue;
    drawInlinePrompt(xtermRef.current);
  }, [inputValue, interactiveInput, rawMode]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isRunning) onSubmit();
      return;
    }
    if (e.key === 'ArrowUp' && onNavigateHistory) {
      e.preventDefault();
      onNavigateHistory('up');
    }
    if (e.key === 'ArrowDown' && onNavigateHistory) {
      e.preventDefault();
      onNavigateHistory('down');
    }
  };

  return (
    <div className={`border border-border/40 rounded-md bg-[#0f1318] overflow-hidden flex flex-col ${minHeight}`}>
      {showHeader && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#151a21] border-b border-border/40 shrink-0">
          <Terminal className="w-3 h-3 text-primary" />
          <span className="font-mono text-[10px] font-bold text-foreground">{title}</span>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-7 font-mono text-[10px] px-2"
              onClick={onClear}
              disabled={disabled && lines.length === 0}
            >
              CLEAR
            </Button>
          )}
        </div>
      )}

      <div className="relative flex-1 min-h-0 bg-[#0f1318]">
        <div ref={terminalRootRef} className="absolute inset-0 p-2" />
      </div>

      {!interactiveInput && !rawMode && (
        <div className="border-t border-border/40 p-2 bg-[#121a1f] shrink-0 flex items-center gap-2">
          <span className="text-muted-foreground text-[10px] select-none shrink-0">&gt;</span>
          <input
            type="text"
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isRunning}
            placeholder={disabled ? '…' : 'db.collection.find()'}
            className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-primary placeholder:text-muted-foreground/50"
            spellCheck={false}
            autoComplete="off"
            aria-label="REPL command"
          />
          {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
        </div>
      )}
    </div>
  );
}
