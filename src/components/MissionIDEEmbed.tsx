import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function resolveWorkspaceEmbedUrl(workspaceUrl: string): string {
  if (workspaceUrl.startsWith('http://') || workspaceUrl.startsWith('https://')) {
    return workspaceUrl;
  }
  // Prefer same-origin URL so embedded IDE can load through Vite proxy in local dev.
  const base =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin.replace(/\/$/, '')
      : API_BASE.replace(/\/$/, '');
  const path = workspaceUrl.startsWith('/') ? workspaceUrl : `/${workspaceUrl}`;
  return `${base}${path}`;
}

type EmbedStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * In-mission embedded IDE: calls `api.ide.createSession` and shows the workspace in an iframe when possible.
 */
export function MissionIDEEmbed({ autoLaunch = false, className }: { autoLaunch?: boolean; className?: string }) {
  const [status, setStatus] = useState<EmbedStatus>('idle');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const autoLaunchTriggeredRef = useRef(false);

  const openExternal = useCallback(() => {
    if (embedUrl) window.open(embedUrl, '_blank', 'noopener,noreferrer');
  }, [embedUrl]);

  const launchEmbed = useCallback(async () => {
    setStatus('loading');
    setMessage(null);
    try {
      const res = await api.ide.createSession();
      setMessage(res.message);

      if (!res.enabled) {
        setEmbedUrl(null);
        setStatus('error');
        return;
      }

      if (!res.workspaceUrl) {
        setEmbedUrl(null);
        setStatus('error');
        setMessage(res.message || 'No workspace URL returned for this session.');
        return;
      }

      const resolved = resolveWorkspaceEmbedUrl(res.workspaceUrl);
      setEmbedUrl(resolved);
      setStatus('ready');
    } catch (e: unknown) {
      setEmbedUrl(null);
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Could not start IDE session');
    }
  }, []);

  /** Same session API, but only opens a new tab (for hosts that block iframes or when embed fails). */
  const launchExternalOnly = useCallback(async () => {
    setStatus('loading');
    setMessage(null);
    try {
      const res = await api.ide.createSession();
      setMessage(res.message);
      if (res.enabled && res.workspaceUrl) {
        const resolved = resolveWorkspaceEmbedUrl(res.workspaceUrl);
        window.open(resolved, '_blank', 'noopener,noreferrer');
        setEmbedUrl(resolved);
        setStatus('idle');
        return;
      }
      setEmbedUrl(null);
      setStatus('error');
    } catch (e: unknown) {
      setEmbedUrl(null);
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Could not start IDE session');
    }
  }, []);

  useEffect(() => {
    if (!autoLaunch || autoLaunchTriggeredRef.current || status !== 'idle') return;
    autoLaunchTriggeredRef.current = true;
    void launchEmbed();
  }, [autoLaunch, launchEmbed, status]);

  if (status === 'loading') {
    return (
      <div
        data-testid="mission-ide-embed"
        className={`flex items-center justify-center min-h-[280px] font-mono text-xs text-muted-foreground ${className || ''}`}
      >
        Preparing IDE session…
      </div>
    );
  }

  if (status === 'ready' && embedUrl) {
    return (
      <div data-testid="mission-ide-embed" className={`flex flex-col flex-1 min-h-[320px] ${className || ''}`}>
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border bg-secondary/20 shrink-0">
          <span className="font-mono text-[10px] text-muted-foreground truncate flex-1 text-left" title={embedUrl}>
            {embedUrl}
          </span>
          <Button
            type="button"
            onClick={openExternal}
            variant="ghost"
            size="sm"
            className="font-mono text-[10px] h-7 shrink-0 gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            OPEN EXTERNALLY
          </Button>
        </div>
        <div className="flex-1 min-h-[280px] relative bg-black/30">
          <iframe
            title="Embedded IDE workspace"
            data-testid="ide-embed-frame"
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads allow-popups allow-popups-to-escape-sandbox"
            allow="clipboard-read; clipboard-write; fullscreen"
          />
        </div>
        {message ? (
          <p className="font-mono text-[10px] text-muted-foreground px-2 py-1 border-t border-border shrink-0">{message}</p>
        ) : null}
        <p className="font-mono text-[9px] text-muted-foreground/80 px-2 pb-2 shrink-0">
          If the workspace stays blank, the IDE host may block embedding—use Open externally.
        </p>
      </div>
    );
  }

  const hint =
    status === 'error' && message
      ? message
      : 'Launch a full IDE session here (embedded). You need to be signed in. If embedding is blocked, open the workspace in a new tab.';

  return (
    <div
      data-testid="mission-ide-embed"
      className={`flex flex-col items-center justify-center gap-4 min-h-[280px] p-4 text-center ${className || ''}`}
    >
      <p className="font-mono text-xs text-muted-foreground max-w-md leading-relaxed">{hint}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button type="button" onClick={() => void launchEmbed()} variant="default" size="sm" className="font-mono text-xs">
          {status === 'error' ? 'RETRY EMBED' : 'LAUNCH IDE (EMBED)'}
        </Button>
        <Button
          type="button"
          onClick={() => void launchExternalOnly()}
          variant="outline"
          size="sm"
          className="font-mono text-xs gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          OPEN IN NEW TAB
        </Button>
        {embedUrl ? (
          <Button type="button" onClick={openExternal} variant="ghost" size="sm" className="font-mono text-xs gap-1">
            <ExternalLink className="w-3 h-3" />
            REOPEN LAST URL
          </Button>
        ) : null}
      </div>
    </div>
  );
}
