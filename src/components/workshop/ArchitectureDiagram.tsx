import { motion } from 'framer-motion';
import { Database, Key, Shield, Cloud, Server, Lock, Unlock, ArrowRight, Layers, Search } from 'lucide-react';

interface ArchitectureDiagramProps {
  variant?: 'csfle' | 'qe' | 'overview';
}

export function ArchitectureDiagram({ variant = 'overview' }: ArchitectureDiagramProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const arrowVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8 } }
  };

  if (variant === 'overview') {
    return (
      <motion.div
        className="p-6 rounded-xl bg-card/50 border border-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">MongoDB Encryption Architecture</h3>

        {/* Two-zone: Your environment | Cloud services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Your environment */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Your environment</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Server className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium">Application</div>
                  <div className="text-xs text-muted-foreground">Node.js / Python</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Shield className="w-8 h-8 text-green-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">MongoDB Driver</div>
                  <div className="text-xs text-muted-foreground">Encrypt / Decrypt</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <Lock className="w-8 h-8 text-green-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">libmongocrypt</div>
                  <div className="text-xs text-muted-foreground">C library used by the driver for all crypto: key management, encrypt/decrypt, QE metadata. Required for both explicit and automatic encryption.</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Search className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">crypt_shared / mongocryptd</div>
                  <div className="text-xs text-muted-foreground">Automatic encryption only: query analysis (crypt_shared recommended; mongocryptd legacy)</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Cloud services */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border-2 border-blue-500/30 bg-blue-500/5 p-4"
          >
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">Cloud services</div>
            <p className="text-xs text-muted-foreground mb-3">Driver uses KMS + Key Vault first to get DEKs, then encrypts and stores ciphertext in Atlas.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Key className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">KMS</div>
                  <div className="text-xs text-muted-foreground">AWS / Azure / GCP • Customer Master Key (CMK)</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Layers className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium">Envelope encryption</div>
                  <div className="text-xs text-muted-foreground">CMK wraps DEKs; DEKs encrypt your data</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                <Lock className="w-8 h-8 text-violet-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Key Vault collection</div>
                  <div className="text-xs text-muted-foreground">Encrypted DEKs stored here. Driver fetches DEKs, unwraps via KMS, then encrypts/decrypts.</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Database className="w-8 h-8 text-blue-500 shrink-0" />
                <div>
                  <div className="text-sm font-medium">MongoDB Atlas</div>
                  <div className="text-xs text-muted-foreground">Encrypted data storage. Ciphertext only; driver writes after encrypting, reads then decrypts.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Connection + legend */}
        <motion.div
          variants={itemVariants}
          className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            <span>TLS 1.3 – encrypted connection</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            <span>Data encrypted in transit</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Data encrypted at rest</span>
          </div>
        </motion.div>

        {/* Customer-controlled keys callout */}
        <motion.div
          variants={itemVariants}
          className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary text-center"
        >
          <p className="text-sm font-medium text-primary">
            You keep the master keys. Even MongoDB/Atlas can never see your plaintext data.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // CSFLE specific diagram
  if (variant === 'csfle') {
    return (
      <motion.div
        className="p-6 rounded-xl bg-card/50 border border-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">CSFLE Data Flow</h3>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Write Path */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-sm font-medium text-center text-green-500">Write Path</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-background border border-border text-center">
                <Unlock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs">Plaintext</span>
              </div>
              <div className="text-center text-muted-foreground">↓</div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <span className="text-xs">Driver Encrypts</span>
              </div>
              <div className="text-center text-muted-foreground">↓</div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                <Lock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <span className="text-xs">Ciphertext in DB</span>
              </div>
            </div>
          </motion.div>

          {/* Key Management */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-sm font-medium text-center text-amber-500">Key Hierarchy</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <Key className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <span className="text-xs">CMK (in KMS)</span>
              </div>
              <div className="text-center text-muted-foreground">↓ encrypts</div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <Key className="w-5 h-5 mx-auto mb-1 text-primary" />
                <span className="text-xs">DEK (in MongoDB)</span>
              </div>
              <div className="text-center text-muted-foreground">↓ encrypts</div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <Database className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs">Your Data</span>
              </div>
            </div>
          </motion.div>

          {/* Read Path */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-sm font-medium text-center text-blue-500">Read Path</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                <Lock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <span className="text-xs">Ciphertext from DB</span>
              </div>
              <div className="text-center text-muted-foreground">↓</div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <span className="text-xs">Driver Decrypts</span>
              </div>
              <div className="text-center text-muted-foreground">↓</div>
              <div className="p-3 rounded-lg bg-background border border-border text-center">
                <Unlock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs">Plaintext</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Queryable Encryption diagram
  return (
    <motion.div
      className="p-6 rounded-xl bg-card/50 border border-border"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-lg font-semibold mb-4 text-center">Queryable Encryption Flow</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Query Processing */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="text-sm font-medium text-center text-primary">Query on Encrypted Data</h4>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-background border border-border text-center">
              <span className="text-xs font-mono">{"{ salary: { $gt: 50000 } }"}</span>
            </div>
            <div className="text-center text-muted-foreground">↓ tokenize</div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <span className="text-xs">Generate Query Tokens</span>
            </div>
            <div className="text-center text-muted-foreground">↓</div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <Database className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <span className="text-xs">Search Encrypted Index</span>
            </div>
          </div>
        </motion.div>

        {/* Metadata Collections */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="text-sm font-medium text-center text-amber-500">Internal Collections</h4>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-mono block">.esc</span>
              <span className="text-xs text-muted-foreground">Encrypted State Collection</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-mono block">.ecoc</span>
              <span className="text-xs text-muted-foreground">Encrypted Compaction Collection</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-mono block">.ecc</span>
              <span className="text-xs text-muted-foreground">Encrypted Counter Collection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
