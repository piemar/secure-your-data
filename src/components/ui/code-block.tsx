import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export function CodeBlock({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className={cn('code-block', className)}>
      {filename && (
        <div className="code-block-header">
          <span className="text-xs text-muted-foreground font-mono">{filename}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="code-block-content">
        <pre className="text-sm leading-relaxed">
          {lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                'flex',
                highlightLines.includes(index + 1) && 'bg-primary/10 -mx-4 px-4'
              )}
            >
              {showLineNumbers && (
                <span className="select-none w-8 text-muted-foreground text-right mr-4 flex-shrink-0">
                  {index + 1}
                </span>
              )}
              <code className="flex-1">{line || ' '}</code>
            </div>
          ))}
        </pre>
      </div>
      {!filename && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded hover:bg-muted transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}
