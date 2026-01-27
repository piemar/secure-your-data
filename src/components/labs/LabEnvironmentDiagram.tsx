import { motion } from 'framer-motion';
import { Shield, Key, Database, Lock, Terminal, Laptop } from 'lucide-react';

export function LabEnvironmentDiagram() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="p-6 rounded-lg bg-card/50 border border-border"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Diagram Container */}
      <div className="relative">
        {/* Section Labels */}
        <div className="flex justify-between mb-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-primary/80">
            <div className="w-2 h-2 rounded-full bg-primary" />
            YOUR LOCAL ENVIRONMENT
          </div>
          <div className="flex items-center gap-2 text-blue-400/80">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            CLOUD SERVICES
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Local Stack */}
          <motion.div 
            variants={itemVariants}
            className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Laptop className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Your Machine</div>
                <div className="text-xs text-muted-foreground">Development environment</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center text-muted-foreground">
              <svg width="2" height="24" className="text-primary/50">
                <line x1="1" y1="0" x2="1" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Node.js + MongoDB Driver</div>
                <div className="text-xs text-muted-foreground">Application layer</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-muted-foreground">
              <svg width="2" height="24" className="text-primary/50">
                <line x1="1" y1="0" x2="1" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">libmongocrypt</div>
                <div className="text-xs text-muted-foreground">Client-side encryption library</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Cloud Services */}
          <motion.div 
            variants={itemVariants}
            className="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center relative">
                <Key className="w-6 h-6 text-orange-500" />
                <span className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold">AWS</span>
              </div>
              <div>
                <div className="font-semibold text-sm">AWS KMS</div>
                <div className="text-xs text-muted-foreground">Customer Master Key (CMK)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-400">Envelope Encryption</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center relative">
                <Database className="w-6 h-6 text-blue-500" />
                <span className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded bg-green-600 text-white font-bold">Atlas</span>
              </div>
              <div>
                <div className="font-semibold text-sm">MongoDB Atlas</div>
                <div className="text-xs text-muted-foreground">Encrypted data storage</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-muted-foreground">
              <svg width="2" height="24" className="text-blue-500/50">
                <line x1="1" y1="0" x2="1" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Key Vault Collection</div>
                <div className="text-xs text-muted-foreground">Encrypted DEKs stored here</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Connection Arrow between columns */}
        <motion.div 
          variants={itemVariants}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-background border border-border shadow-lg">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium">TLS 1.3</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Encrypted Connection</div>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 pt-4 border-t border-border"
        >
          <div className="text-xs text-muted-foreground mb-2 font-medium">How it works:</div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-[10px] font-bold">1</span>
              </div>
              <span className="text-muted-foreground">Driver encrypts data locally before sending</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-[10px] font-bold">2</span>
              </div>
              <span className="text-muted-foreground">KMS protects your Data Encryption Keys</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-[10px] font-bold">3</span>
              </div>
              <span className="text-muted-foreground">Atlas stores only encrypted ciphertext</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
