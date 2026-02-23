import { useMemo, useState } from 'react';
import { Search, Table2, BarChart3, Shield, GitBranch, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  LabStepPreviewConfig,
  LabPreviewData,
  SearchPreviewConfig,
  TablePreviewConfig,
  ChartPreviewConfig,
  EncryptionDemoPreviewConfig,
  DiagramPreviewConfig,
} from '@/types';

export interface GenericLabPreviewProps {
  /** Schema-driven config from the lab step (prompt can generate for any POV). */
  preview: LabStepPreviewConfig;
  /** Data from the last Run (raw output and/or parsed documents/facets). */
  data?: LabPreviewData;
  /** Optional: run is in progress */
  isRunning?: boolean;
  /** Optional: no run yet – show placeholder */
  hasRun?: boolean;
  className?: string;
}

/**
 * Parses raw terminal output for a trailing JSON array (e.g. aggregation result).
 * Returns documents array if found, else undefined.
 */
function parseDocumentsFromOutput(rawOutput?: string): Record<string, unknown>[] | undefined {
  if (!rawOutput?.trim()) return undefined;
  const trimmed = rawOutput.trim();
  // Match [...], possibly with leading stdout
  const arrayMatch = trimmed.match(/\[[\s\S]*\]\s*$/);
  if (!arrayMatch) return undefined;
  try {
    const parsed = JSON.parse(arrayMatch[0]) as unknown;
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : undefined;
  } catch {
    return undefined;
  }
}

function SearchPreviewRenderer({
  config,
  data,
  hasRun,
}: {
  config: SearchPreviewConfig;
  data?: LabPreviewData;
  hasRun?: boolean;
}) {
  const [query, setQuery] = useState('');
  const docs = data?.documents ?? parseDocumentsFromOutput(data?.rawOutput);
  const facets = data?.facets;
  const fields = config.resultFields ?? ['name', 'description', 'title'];
  const showScore = config.showScore !== false;
  const facetFields = config.facetFields ?? [];

  if (!hasRun) {
    return (
      <div className="rounded border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <Search className="mx-auto h-8 w-8 opacity-50 mb-2" />
        <p>Run the code to see search results here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {config.searchField !== false && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.searchPlaceholder ?? 'Search…'}
            className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      )}
      {facetFields.length > 0 && facets && (
        <div className="flex flex-wrap gap-2">
          {facetFields.map((field) => {
            const counts = facets[field];
            if (!counts?.length) return null;
            return (
              <div key={field} className="rounded border border-border bg-muted/30 px-2 py-1 text-xs">
                <span className="font-medium text-muted-foreground">{field}:</span>{' '}
                {counts.slice(0, 5).map((c, i) => (
                  <span key={i}>{String(c._id)} ({c.count}) </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <div className="space-y-2">
        {docs && docs.length > 0 ? (
          docs.slice(0, 10).map((doc, i) => (
            <div
              key={i}
              className="rounded border border-border bg-card p-2 text-xs space-y-0.5"
            >
              {fields.map((f) => {
                const v = doc[f];
                if (v === undefined) return null;
                return (
                  <div key={f} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">{f}:</span>
                    <span className="truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                );
              })}
              {showScore && doc.score != null && (
                <div className="flex gap-2 text-muted-foreground">
                  <span>score:</span>
                  <span>{Number(doc.score).toFixed(2)}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No documents in result. Check the Console for raw output.</p>
        )}
      </div>
    </div>
  );
}

function TablePreviewRenderer({
  config,
  data,
  hasRun,
}: {
  config: TablePreviewConfig;
  data?: LabPreviewData;
  hasRun?: boolean;
}) {
  const docs = data?.documents ?? parseDocumentsFromOutput(data?.rawOutput);
  const columns = config.columns ?? (docs?.[0] ? Object.keys(docs[0]) : []);
  const maxRows = config.maxRows ?? 20;

  if (!hasRun) {
    return (
      <div className="rounded border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <Table2 className="mx-auto h-8 w-8 opacity-50 mb-2" />
        <p>Run the code to see the table.</p>
      </div>
    );
  }

  if (!docs?.length) {
    return <p className="text-sm text-muted-foreground">No rows. Check the Console for output.</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col} className="text-left p-2 font-medium text-muted-foreground">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.slice(0, maxRows).map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              {columns.map((col) => (
                <td key={col} className="p-2 truncate max-w-[200px]" title={String((row as Record<string, unknown>)[col] ?? '')}>
                  {String((row as Record<string, unknown>)[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {docs.length > maxRows && (
        <p className="text-xs text-muted-foreground p-2">Showing first {maxRows} of {docs.length} rows.</p>
      )}
    </div>
  );
}

function ChartPreviewRenderer({
  config,
  data,
  hasRun,
}: {
  config: ChartPreviewConfig;
  data?: LabPreviewData;
  hasRun?: boolean;
}) {
  const docs = data?.documents ?? parseDocumentsFromOutput(data?.rawOutput);
  const xField = config.xField ?? '_id';
  const yField = config.yField ?? 'count';
  const chartType = config.chartType ?? 'bar';

  if (!hasRun) {
    return (
      <div className="rounded border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <BarChart3 className="mx-auto h-8 w-8 opacity-50 mb-2" />
        <p>Run the code to see the chart.</p>
      </div>
    );
  }

  if (!docs?.length) {
    return <p className="text-sm text-muted-foreground">No data for chart. Check the Console.</p>;
  }

  const maxVal = Math.max(...docs.map((d) => Number((d as Record<string, unknown>)[yField]) || 0), 1);

  return (
    <div className="space-y-2">
      {config.title && <p className="text-sm font-medium">{config.title}</p>}
      <div className="flex items-end gap-1 h-32">
        {docs.slice(0, 15).map((d, i) => {
          const x = (d as Record<string, unknown>)[xField];
          const y = Number((d as Record<string, unknown>)[yField]) || 0;
          const pct = (y / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${String(x)}: ${y}`}>
              <div
                className="w-full bg-primary/70 rounded-t min-h-[4px] transition-all"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {String(x)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EncryptionDemoPreviewRenderer({
  config,
  data,
  hasRun,
}: {
  config: EncryptionDemoPreviewConfig;
  data?: LabPreviewData;
  hasRun?: boolean;
}) {
  const [csfleEnabled, setCsfleEnabled] = useState(true);
  const [cryptoShredPhase, setCryptoShredPhase] = useState<'before' | 'after'>('before');
  const [rotationPhase, setRotationPhase] = useState<'before' | 'after'>('before');
  const mode = config.mode ?? 'both';
  const fields = config.fields ?? ['ssn', 'email'];
  const variant = config.variant ?? 'default';

  // CSFLE toggle: app-style form with toggle; show query result as decrypted vs ciphertext
  if (variant === 'csfle-toggle') {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Encryption demo</span>
          {!hasRun && (
            <span className="ml-auto text-[10px] text-amber-600 dark:text-amber-400">Run step for live data</span>
          )}
        </div>
        <div className="p-3 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 p-2">
            <span className="text-muted-foreground">Client-side field encryption</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-muted-foreground">CSFLE enabled</span>
              <input
                type="checkbox"
                checked={csfleEnabled}
                onChange={(e) => setCsfleEnabled(e.target.checked)}
                className="rounded border-border h-4 w-4 accent-primary"
              />
            </label>
          </div>
          <div className="rounded-md border border-border p-2 space-y-1">
            <p className="text-muted-foreground font-medium">Query result ({fields.slice(0, 2).join(', ')})</p>
            <div className="font-mono text-[11px] rounded bg-background/80 p-2 min-h-[2.5rem]">
              {csfleEnabled ? (
                <>
                  <span className="text-green-600 dark:text-green-400">{fields[0] ?? 'ssn'}:</span> &quot;123-45-6789&quot;
                  <span className="text-muted-foreground ml-1">(decrypted by driver)</span>
                </>
              ) : (
                <>
                  <span className="text-amber-600 dark:text-amber-400">{fields[0] ?? 'ssn'}:</span> Binary(&quot;…&quot;)
                  <span className="text-muted-foreground ml-1">(ciphertext — no key in this client)</span>
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground leading-snug">
            With CSFLE on, the driver decrypts automatically. With CSFLE off (e.g. DBA view), you only see ciphertext.
          </p>
        </div>
      </div>
    );
  }

  // Crypto-shredding: before/after UI showing DEK delete → data unreadable
  if (variant === 'crypto-shredding') {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
          <Shield className="h-4 w-4 text-destructive/80" />
          <span className="font-medium text-sm">Crypto-shredding (Right to Erasure)</span>
        </div>
        <div className="p-3 space-y-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCryptoShredPhase('before')}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                cryptoShredPhase === 'before'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              )}
            >
              Before (DEK exists)
            </button>
            <button
              type="button"
              onClick={() => setCryptoShredPhase('after')}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                cryptoShredPhase === 'after'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              )}
            >
              After (DEK deleted)
            </button>
          </div>
          <div className="rounded-md border border-border p-2 space-y-1">
            {cryptoShredPhase === 'before' ? (
              <>
                <p className="text-muted-foreground font-medium">Document (readable)</p>
                <div className="font-mono text-[11px] text-green-600 dark:text-green-400">
                  ssn: &quot;123-45-6789&quot; — key in vault
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground font-medium">Same document (unrecoverable)</p>
                <div className="font-mono text-[11px] text-destructive">
                  ssn: &lt;unreadable — DEK deleted, ciphertext permanent&gt;
                </div>
              </>
            )}
          </div>
          <p className="text-muted-foreground leading-snug">
            Deleting the DEK from the key vault makes all ciphertext encrypted with that DEK permanently unreadable (GDPR right to erasure).
          </p>
        </div>
      </div>
    );
  }

  // Key rotation: before/after showing ciphertext unchanged, only DEK metadata updated
  if (variant === 'key-rotation') {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Key rotation (rewrapManyDataKey)</span>
        </div>
        <div className="p-3 space-y-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRotationPhase('before')}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                rotationPhase === 'before'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              )}
            >
              Before rewrap
            </button>
            <button
              type="button"
              onClick={() => setRotationPhase('after')}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                rotationPhase === 'after'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
              )}
            >
              After rewrap
            </button>
          </div>
          <div className="rounded-md border border-border p-2 space-y-1">
            <p className="text-muted-foreground font-medium">Data on disk (collection)</p>
            <div className="font-mono text-[11px] text-muted-foreground">
              Ciphertext: <span className="text-foreground">unchanged</span> — same bytes before and after rotation
            </div>
            <p className="text-muted-foreground font-medium mt-2">Key vault (DEK document)</p>
            <div className="font-mono text-[11px]">
              {rotationPhase === 'before' ? (
                <span className="text-amber-600 dark:text-amber-400">Wrapped by old CMK</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">Rewrapped by new CMK (metadata only)</span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground leading-snug">
            rewrapManyDataKey updates only the DEK metadata (new CMK); the actual ciphertext in the collection is not re-encrypted.
          </p>
        </div>
      </div>
    );
  }

  // Default: generic encryption demo
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium">Encryption</span>
      </div>
      <p className="text-muted-foreground">Mode: {mode}. Fields: {fields.join(', ')}.</p>
      <p className="text-muted-foreground">Use the Console output to compare encrypted storage vs decrypted read.</p>
    </div>
  );
}

function DiagramPreviewRenderer({
  config,
  hasRun,
}: {
  config: DiagramPreviewConfig;
  hasRun?: boolean;
}) {
  const variant = config.variant ?? 'flow';

  if (!hasRun) {
    return (
      <div className="rounded border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <GitBranch className="mx-auto h-8 w-8 opacity-50 mb-2" />
        <p>Run the code to see the diagram.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-border bg-card p-3 text-xs text-muted-foreground">
      {config.title && <p className="font-medium text-foreground mb-1">{config.title}</p>}
      <p>Diagram type: {variant}. Use Console output and architecture diagrams for details.</p>
    </div>
  );
}

/**
 * Generic lab preview: renders an elevated experience (search UI, table, chart, etc.)
 * based on step.preview (type + config). Prompt-generated content can set preview
 * for any POV so the same component powers search, encryption, analytics, etc.
 */
export function GenericLabPreview({
  preview,
  data,
  isRunning,
  hasRun = false,
  className,
}: GenericLabPreviewProps) {
  const content = useMemo(() => {
    if (preview.type === 'terminal') {
      return (
        <div className="rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span>Output is shown in the Console below.</span>
        </div>
      );
    }
    if (preview.type === 'search') {
      return <SearchPreviewRenderer config={preview.config} data={data} hasRun={hasRun} />;
    }
    if (preview.type === 'table') {
      return <TablePreviewRenderer config={preview.config} data={data} hasRun={hasRun} />;
    }
    if (preview.type === 'chart') {
      return <ChartPreviewRenderer config={preview.config} data={data} hasRun={hasRun} />;
    }
    if (preview.type === 'encryption-demo') {
      return <EncryptionDemoPreviewRenderer config={preview.config} data={data} hasRun={hasRun} />;
    }
    if (preview.type === 'diagram') {
      return <DiagramPreviewRenderer config={preview.config} hasRun={hasRun} />;
    }
    return (
      <div className="rounded border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        Unknown preview type: {(preview as { type: string }).type}
      </div>
    );
  }, [preview, data, hasRun]);

  return (
    <div className={cn('generic-lab-preview', className)}>
      {isRunning && (
        <div className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Running…
        </div>
      )}
      {content}
    </div>
  );
}
