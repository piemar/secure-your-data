/**
 * Modal that opens when mongosh (or shell) invokes the lab editor wrapper.
 * Uses the inline Monaco editor so users can edit in the browser instead of vi/nano in the terminal.
 * Polls /api/lab-editor-pending; on Save writes back via /api/lab-editor-save.
 */
import { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getLabEditorTheme } from '@/lib/monacoLabEditorOptions';
import { useTheme } from 'next-themes';

const POLL_MS = 2000;

interface PendingEditor {
  requestId: string;
  path: string;
  content: string;
}

export function LabEditorModal() {
  const { resolvedTheme } = useTheme();
  const [pending, setPending] = useState<PendingEditor | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const poll = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const res = await fetch('/api/lab-editor-pending');
      if (!res.ok) return;
      const data = await res.json();
      if (data.requestId && data.path != null && data.content != null && !pending) {
        setPending({ requestId: data.requestId, path: data.path, content: data.content });
        setContent(data.content);
      }
    } catch {
      /* ignore */
    }
  }, [pending]);

  useEffect(() => {
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  const sendSave = async (payloadContent: string) => {
    if (!pending) return;
    setSaving(true);
    try {
      const res = await fetch('/api/lab-editor-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: pending.requestId, content: payloadContent }),
      });
      if (res.ok) {
        setPending(null);
        setContent('');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => sendSave(content);

  const handleCancel = () => sendSave(pending?.content ?? '');

  const handleOpenChange = (open: boolean) => {
    if (!open && pending) {
      handleCancel();
    }
  };

  const open = !!pending;
  const theme = getLabEditorTheme(resolvedTheme ?? 'dark');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-2">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono truncate" title={pending?.path}>
            Edit in browser — {pending?.path?.split('/').pop() ?? 'file'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-[300px] border rounded-md overflow-hidden">
          <Editor
            height="320px"
            language="javascript"
            theme={theme}
            value={content}
            onChange={(v) => setContent(v ?? '')}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel (keep original)
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save (and close in terminal)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
