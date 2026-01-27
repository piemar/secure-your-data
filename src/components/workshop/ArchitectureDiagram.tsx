import { motion } from 'framer-motion';
import { Database, Key, Shield, Cloud, Server, Lock, Unlock, ArrowRight } from 'lucide-react';

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
        <h3 className="text-lg font-semibold mb-6 text-center">MongoDB Encryption Architecture</h3>
        
        <div className="flex items-center justify-between gap-4 relative">
          {/* Application Layer */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2 z-10"
          >
            <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Server className="w-10 h-10 text-primary" />
            </div>
            <span className="text-sm font-medium">Application</span>
            <span className="text-xs text-muted-foreground">Node.js / Python</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center text-muted-foreground"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.div>

          {/* Driver Layer */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2 z-10"
          >
            <div className="w-20 h-20 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Shield className="w-10 h-10 text-green-500" />
            </div>
            <span className="text-sm font-medium">MongoDB Driver</span>
            <span className="text-xs text-muted-foreground">Encrypt/Decrypt</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center text-muted-foreground"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.div>

          {/* KMS Layer */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2 z-10"
          >
            <div className="w-20 h-20 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Key className="w-10 h-10 text-amber-500" />
            </div>
            <span className="text-sm font-medium">KMS</span>
            <span className="text-xs text-muted-foreground">AWS / Azure / GCP</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center text-muted-foreground"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.div>

          {/* MongoDB Atlas */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2 z-10"
          >
            <div className="w-20 h-20 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Database className="w-10 h-10 text-blue-500" />
            </div>
            <span className="text-sm font-medium">MongoDB Atlas</span>
            <span className="text-xs text-muted-foreground">Encrypted Data</span>
          </motion.div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-green-500" />
            <span>Data encrypted in transit</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-blue-500" />
            <span>Data encrypted at rest</span>
          </div>
        </div>
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
