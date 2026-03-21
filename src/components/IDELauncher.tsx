import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

interface IDELauncherProps {
  compact?: boolean;
}

export function IDELauncher({ compact = false }: IDELauncherProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const launch = async () => {
    setIsLaunching(true);
    setMessage(null);
    try {
      const res = await api.ide.createSession();
      setMessage(res.message);
      if (res.workspaceUrl && res.enabled) {
        window.open(res.workspaceUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to launch IDE');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <Button
        onClick={() => void launch()}
        variant="outline"
        size={compact ? 'sm' : 'default'}
        className="font-mono text-xs"
        disabled={isLaunching}
      >
        {isLaunching ? 'OPENING IDE...' : 'OPEN FULL IDE'}
      </Button>
      {message && <p className="font-mono text-[10px] text-muted-foreground">{message}</p>}
    </div>
  );
}
