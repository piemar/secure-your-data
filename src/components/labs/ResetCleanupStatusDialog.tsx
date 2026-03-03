import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CleanupResult } from '@/services/resetCleanup';
import { CheckCircle2, XCircle, SkipForward, Loader2 } from 'lucide-react';

export type ResetCleanupDialogPhase = 'confirm' | 'loading' | 'done';

interface ResetCleanupStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: ResetCleanupDialogPhase;
  results: CleanupResult[];
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
  if (status === 'error') return <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
  return <SkipForward className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
}

export function ResetCleanupStatusDialog({
  open,
  onOpenChange,
  phase,
  results,
  loading = false,
  onConfirm,
  onClose,
}: ResetCleanupStatusDialogProps) {
  const isConfirm = phase === 'confirm';
  const isLoading = phase === 'loading' || loading;
  const isDone = phase === 'done';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isConfirm && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Reset progress</DialogTitle>
          <DialogDescription>
            {isConfirm
              ? 'This will clear completed steps, scores, and clean up KMS and MongoDB lab resources. Do you want to continue?'
              : isLoading
                ? 'Cleaning up KMS and MongoDB resources…'
                : 'The following resources were cleaned up (or skipped if not configured).'}
          </DialogDescription>
        </DialogHeader>
        {isConfirm ? (
          <div className="py-2" />
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cleaning up resources…</span>
          </div>
        ) : (
          <ul className="space-y-2 max-h-[240px] overflow-y-auto rounded-md border bg-muted/30 p-3">
            {results.length === 0 ? (
              <li className="text-sm text-muted-foreground">No cleanup actions run.</li>
            ) : (
              results.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <StatusIcon status={r.status} />
                  <span className="flex-1">
                    <span className="font-medium">{r.item}</span>
                    {r.message && (
                      <span className={r.status === 'error' ? ' text-destructive' : ' text-muted-foreground'}>
                        {' – '}{r.message}
                      </span>
                    )}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
        <DialogFooter>
          {isConfirm ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>
                Reset progress
              </Button>
            </>
          ) : (
            <Button onClick={onClose} disabled={isLoading}>
              OK
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
