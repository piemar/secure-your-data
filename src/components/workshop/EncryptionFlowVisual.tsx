import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Database, Lock, Server, ArrowRight, Eye, EyeOff, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EncryptionFlowVisualProps {
  type?: 'csfle' | 'qe';
  autoPlay?: boolean;
}

export function EncryptionFlowVisual({ type = 'csfle', autoPlay = false }: EncryptionFlowVisualProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showDecrypted, setShowDecrypted] = useState(true);

  const steps = type === 'csfle' ? [
    { id: 'plaintext', label: 'Application sends plaintext', description: 'Your app prepares data with sensitive fields' },
    { id: 'fetch-dek', label: 'Fetch DEK from KeyVault', description: 'MongoDB driver retrieves wrapped DEK' },
    { id: 'unwrap-dek', label: 'KMS unwraps DEK', description: 'AWS KMS decrypts the DEK using CMK' },
    { id: 'encrypt', label: 'Client encrypts data', description: 'Data encrypted before leaving app' },
    { id: 'store', label: 'Store ciphertext', description: 'MongoDB stores only encrypted data' },
  ] : [
    { id: 'plaintext', label: 'Application sends query', description: 'Encrypted query with QE metadata' },
    { id: 'index', label: 'Encrypted index lookup', description: 'Server searches without decryption' },
    { id: 'return', label: 'Return encrypted results', description: 'Ciphertext sent to client' },
    { id: 'decrypt', label: 'Client decrypts', description: 'Only client can read plaintext' },
  ];

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setStep(s => (s + 1) % steps.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, steps.length]);

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const sampleData = {
    plaintext: `{
  "name": "John Doe",
  "ssn": "123-45-6789",
  "email": "john@example.com"
}`,
    encrypted: `{
  "name": "John Doe",
  "ssn": "BinData(6, 'AiHj...k9M=')",
  "email": "john@example.com"
}`
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">
          {type === 'csfle' ? 'CSFLE Encryption Flow' : 'Queryable Encryption Flow'}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDecrypted(!showDecrypted)}
            className="gap-1"
          >
            {showDecrypted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showDecrypted ? 'Client View' : 'DB View'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="gap-1"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="relative">
        {/* Components */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Application */}
          <motion.div
            className={cn(
              'flex-1 p-4 rounded-lg border-2 transition-colors',
              step === 0 || step === 3 ? 'border-primary bg-primary/10' : 'border-border'
            )}
            animate={{ scale: step === 0 || step === 3 ? 1.02 : 1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-primary" />
              <span className="font-medium">Your Application</span>
            </div>
            <pre className="text-xs font-mono p-2 rounded bg-background/50 overflow-x-auto">
              {showDecrypted ? sampleData.plaintext : sampleData.encrypted}
            </pre>
          </motion.div>

          {/* Arrow */}
          <motion.div
            animate={{ 
              x: step === 1 ? [0, 10, 0] : 0,
              opacity: step >= 1 && step <= 3 ? 1 : 0.3
            }}
            transition={{ duration: 0.5, repeat: step === 1 ? Infinity : 0 }}
          >
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </motion.div>

          {/* MongoDB Driver / Client */}
          <motion.div
            className={cn(
              'flex-1 p-4 rounded-lg border-2 transition-colors',
              step === 1 || step === 2 ? 'border-primary bg-primary/10' : 'border-border'
            )}
            animate={{ scale: step === 1 || step === 2 ? 1.02 : 1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <span className="font-medium">MongoDB Driver</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {step === 1 && 'Fetching DEK from KeyVault...'}
                  {step === 2 && 'Waiting for KMS to unwrap DEK...'}
                  {step === 3 && 'Encrypting sensitive fields...'}
                  {step !== 1 && step !== 2 && step !== 3 && 'libmongocrypt ready'}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            animate={{ 
              x: step === 4 ? [0, 10, 0] : 0,
              opacity: step >= 4 ? 1 : 0.3
            }}
            transition={{ duration: 0.5, repeat: step === 4 ? Infinity : 0 }}
          >
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </motion.div>

          {/* MongoDB */}
          <motion.div
            className={cn(
              'flex-1 p-4 rounded-lg border-2 transition-colors',
              step === 4 ? 'border-primary bg-primary/10' : 'border-border'
            )}
            animate={{ scale: step === 4 ? 1.02 : 1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <span className="font-medium">MongoDB Atlas</span>
            </div>
            <pre className="text-xs font-mono p-2 rounded bg-background/50 overflow-x-auto">
              {sampleData.encrypted}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Only sees ciphertext
            </p>
          </motion.div>
        </div>

        {/* KMS */}
        <motion.div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] p-4 rounded-lg border-2 transition-colors z-10',
            step === 2 ? 'border-yellow-500 bg-yellow-500/10' : 'border-border bg-card'
          )}
          animate={{ 
            scale: step === 2 ? 1.05 : 1,
            y: step === 2 ? -5 : 0
          }}
        >
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">AWS KMS</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {step === 2 ? 'Unwrapping DEK...' : 'Customer Master Key (CMK)'}
          </p>
        </motion.div>

        {/* Connecting lines to KMS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: -60 }}>
          <motion.path
            d="M 50% 80 L 50% 40"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
            className="text-border"
            animate={{ 
              stroke: step === 2 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
            }}
          />
        </svg>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setStep(i);
              setIsPlaying(false);
            }}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              i === step ? 'bg-primary w-8' : 'bg-muted hover:bg-muted-foreground/50'
            )}
          />
        ))}
      </div>

      {/* Current Step Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mt-4"
        >
          <p className="font-medium text-primary">{steps[step].label}</p>
          <p className="text-sm text-muted-foreground">{steps[step].description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Key Insight */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-primary mb-1">🔐 Key Insight</p>
        <p className="text-sm text-muted-foreground">
          {type === 'csfle' 
            ? 'The data is encrypted BEFORE it leaves your application. MongoDB never sees plaintext.'
            : 'Queryable Encryption allows searching on encrypted data without decrypting on the server.'}
        </p>
      </div>
    </div>
  );
}
