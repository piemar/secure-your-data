import { VerificationContext } from './types.js';

function traceCommands(context?: VerificationContext): string[] {
  return (context?.commandTrace || [])
    .map((row) => (typeof row.command === 'string' ? row.command.toLowerCase() : ''))
    .filter(Boolean);
}

export function hasTraceCommand(context: VerificationContext | undefined, regex: RegExp): boolean {
  return traceCommands(context).some((cmd) => regex.test(cmd));
}

export function traceContains(context: VerificationContext | undefined, needle: string): boolean {
  const lowered = needle.toLowerCase();
  return (context?.commandTrace || []).some((row) => {
    const command = typeof row.command === 'string' ? row.command.toLowerCase() : '';
    const resultText = JSON.stringify(row.result || '').toLowerCase();
    return command.includes(lowered) || resultText.includes(lowered);
  });
}
