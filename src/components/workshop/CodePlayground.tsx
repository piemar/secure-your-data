import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, Terminal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodePlaygroundProps {
  initialCode: string;
  language?: string;
  filename?: string;
  expectedOutput?: string;
  simulatedOutput?: string | ((code: string) => string);
  onRunComplete?: (success: boolean) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodePlayground({
  initialCode,
  language = 'javascript',
  filename,
  expectedOutput,
  simulatedOutput,
  onRunComplete,
  readOnly = false,
  height = '300px',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsModified(value !== initialCode);
    }
  }, [initialCode]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setIsModified(false);
    setOutput('');
    setHasError(false);
  }, [initialCode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setHasError(false);
    
    // Simulate execution delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    
    try {
      let result: string;
      
      if (typeof simulatedOutput === 'function') {
        result = simulatedOutput(code);
      } else if (simulatedOutput) {
        result = simulatedOutput;
      } else {
        // Default simulated response for MongoDB operations
        result = generateSimulatedOutput(code);
      }
      
      setOutput(result);
      
      // Check if output matches expected
      const success = !expectedOutput || result.includes('success') || result.includes('acknowledged');
      onRunComplete?.(success);
      
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setHasError(true);
      onRunComplete?.(false);
    }
    
    setIsRunning(false);
  }, [code, simulatedOutput, expectedOutput, onRunComplete]);

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs font-mono text-muted-foreground">{filename}</span>
          )}
          {isModified && (
            <span className="text-xs text-primary">(modified)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 gap-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">Reset</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="h-7 px-3 gap-1"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">{isRunning ? 'Running...' : 'Run'}</span>
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="border-b border-border">
        <Editor
          height={height}
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            readOnly,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Output Terminal */}
      {output && (
        <div className={cn(
          'p-4 font-mono text-sm',
          hasError ? 'bg-destructive/10' : 'bg-terminal-bg'
        )}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Output</span>
          </div>
          <pre className={cn(
            'whitespace-pre-wrap',
            hasError ? 'text-destructive' : 'text-primary'
          )}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

// Generate simulated MongoDB output based on code patterns
function generateSimulatedOutput(code: string): string {
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('createdatakey')) {
    return `{
  "acknowledged": true,
  "insertedId": "UUID(\"4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a\")"
}

✓ Data Encryption Key created successfully
✓ Key stored in __keyVault collection`;
  }
  
  if (lowerCode.includes('insertone') || lowerCode.includes('insert')) {
    return `{
  "acknowledged": true,
  "insertedId": "ObjectId(\"65f1a2b3c4d5e6f7a8b9c0d1\")"
}

✓ Document inserted with client-side encryption`;
  }
  
  if (lowerCode.includes('findone') || lowerCode.includes('find')) {
    return `{
  "_id": "ObjectId(\"65f1a2b3c4d5e6f7a8b9c0d1\")",
  "name": "John Doe",
  "ssn": "***-**-1234",
  "email": "john.doe@example.com",
  "creditCard": {
    "number": "****-****-****-4242",
    "expiry": "12/25"
  }
}

✓ Document retrieved and decrypted automatically`;
  }
  
  if (lowerCode.includes('createcollection') || lowerCode.includes('createencryptedcollection')) {
    return `{
  "ok": 1,
  "encryptedFieldsMap": {
    "medicalRecords.patients": {
      "fields": [
        { "path": "ssn", "queryType": "equality" },
        { "path": "medicalRecordNumber", "queryType": "equality" }
      ]
    }
  }
}

✓ Encrypted collection created with Queryable Encryption
✓ Internal metadata collections (.esc, .ecoc, .ecc) initialized`;
  }
  
  if (lowerCode.includes('kms') || lowerCode.includes('aws')) {
    return `{
  "KeyId": "arn:aws:kms:eu-central-1:123456789:key/mrk-abc123",
  "KeyState": "Enabled",
  "KeyUsage": "ENCRYPT_DECRYPT",
  "Description": "MongoDB CSFLE Customer Master Key"
}

✓ AWS KMS connection verified
✓ Key policy allows MongoDB Atlas access`;
  }

  if (lowerCode.includes('compact') || lowerCode.includes('compactstructuredencryptiondata')) {
    return `{
  "ok": 1,
  "stats": {
    "deletedCount": 127,
    "reclaimedBytes": 8432
  }
}

✓ Metadata compaction complete
✓ 127 obsolete entries removed`;
  }
  
  return `> Command executed successfully
{
  "ok": 1
}`;
}
