import { motion } from 'framer-motion';
import { Server, Shield, Key, Database, Cloud, Lock, Terminal, Laptop, ArrowRight, ArrowDown } from 'lucide-react';

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

  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, delay: 0.3 } }
  };

  return (
    <motion.div
      className="p-4 rounded-lg bg-card/50 border border-border"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-2">
        <Server className="w-4 h-4 text-primary" />
        Lab Environment Architecture
      </h3>

      {/* Main Architecture Flow */}
      <div className="relative">
        {/* Top Row: Local Environment */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Laptop className="w-7 h-7 text-primary" />
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">Your Machine</span>
          </motion.div>

          <motion.div variants={itemVariants} className="text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Terminal className="w-7 h-7 text-amber-500" />
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">Node.js + Driver</span>
          </motion.div>

          <motion.div variants={itemVariants} className="text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-green-500" />
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">libmongocrypt</span>
          </motion.div>
        </div>

        {/* Connection Arrow Down */}
        <div className="flex justify-center mb-3">
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">TLS 1.3</span>
          </motion.div>
        </div>

        {/* Bottom Row: Cloud Services */}
        <div className="flex items-center justify-center gap-4">
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center relative">
              <Key className="w-7 h-7 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded bg-orange-500 flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">AWS</span>
              </div>
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">KMS (CMK)</span>
          </motion.div>

          <motion.div variants={itemVariants} className="text-muted-foreground text-[10px] flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-500" />
              <span>Envelope</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative">
              <Database className="w-7 h-7 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-5 h-4 rounded bg-green-600 flex items-center justify-center">
                <span className="text-[7px] text-white font-bold">Atlas</span>
              </div>
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">MongoDB</span>
          </motion.div>

          <motion.div variants={itemVariants} className="text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Key className="w-7 h-7 text-purple-500" />
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">Key Vault</span>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-4 text-[10px] text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Local Tools</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>AWS KMS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>MongoDB Atlas</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-green-500" />
            <span>Encrypted</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
