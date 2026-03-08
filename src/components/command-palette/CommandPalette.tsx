/**
 * VS Code-style command palette. Phase 5.
 * Open with Cmd+Shift+P (Mac) or Ctrl+Shift+P (Win/Linux).
 * Actions from ActionRegistry; context from IdeContext when in a lab.
 */
import { useEffect, useState, useMemo } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getActions } from '@/services/hints/ActionRegistry';
import { useIdeContextOptional } from '@/context/IdeContext';

export function CommandPalette() {
  const ide = useIdeContextOptional();
  const context = ide?.hintContext ?? {};
  const [open, setOpen] = useState(false);
  const actions = useMemo(() => getActions(context), [context.currentFilePath, context.currentLanguage, context.labStepId]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd+Shift+P / Ctrl+Shift+P (VS Code style)
      if (e.key === 'p' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      // Cmd+K / Ctrl+K (Prompt 2 — Advanced Interactive)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actions.map((action) => (
            <CommandItem
              key={action.id}
              value={action.label}
              onSelect={async () => {
                setOpen(false);
                await Promise.resolve(action.run());
              }}
            >
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
