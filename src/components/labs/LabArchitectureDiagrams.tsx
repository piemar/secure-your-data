import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiagramProps {
  className?: string;
}

// Lab 1: CSFLE Architecture - shows CMK → DEK → Encrypted Fields flow
export function CSFLEArchitectureDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 700 280" className="w-full h-auto">
        {/* Your Application */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <rect x="20" y="80" width="140" height="120" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="90" y="105" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="11" fontWeight="600">Your Application</text>
          <rect x="30" y="115" width="120" height="75" rx="4" fill="hsl(220, 15%, 8%)" />
          <text x="45" y="135" fill="hsl(200, 100%, 70%)" fontSize="9" fontFamily="monospace">{"{"}</text>
          <text x="50" y="150" fill="hsl(200, 100%, 70%)" fontSize="8" fontFamily="monospace">name: "John",</text>
          <text x="50" y="165" fill="hsl(145, 100%, 50%)" fontSize="8" fontFamily="monospace">ssn: "123-45-6789"</text>
          <text x="45" y="180" fill="hsl(200, 100%, 70%)" fontSize="9" fontFamily="monospace">{"}"}</text>
        </motion.g>

        {/* Arrow to Driver */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <path d="M 160 140 L 200 140" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#csfle-arrow)" />
        </motion.g>

        {/* MongoDB Driver with libmongocrypt */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <rect x="200" y="80" width="140" height="120" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="270" y="105" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="11" fontWeight="600">MongoDB Driver</text>
          <text x="270" y="120" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">libmongocrypt</text>
          <rect x="210" y="130" width="120" height="60" rx="4" fill="hsl(280, 80%, 20%)" fillOpacity="0.3" stroke="hsl(280, 80%, 50%)" strokeDasharray="3" />
          <text x="270" y="150" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="8">Encrypts before</text>
          <text x="270" y="165" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="8">data leaves app</text>
          <text x="270" y="180" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8" fontWeight="600">✓ Client-side</text>
        </motion.g>

        {/* Arrow to Atlas */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <path d="M 340 140 L 380 140" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#csfle-arrow)" />
        </motion.g>

        {/* MongoDB Atlas */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <rect x="380" y="80" width="140" height="120" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="450" y="105" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="11" fontWeight="600">MongoDB Atlas</text>
          <rect x="390" y="115" width="120" height="75" rx="4" fill="hsl(220, 15%, 8%)" />
          <text x="405" y="135" fill="hsl(200, 100%, 70%)" fontSize="9" fontFamily="monospace">{"{"}</text>
          <text x="410" y="150" fill="hsl(200, 100%, 70%)" fontSize="8" fontFamily="monospace">name: "John",</text>
          <text x="410" y="165" fill="hsl(0, 84%, 60%)" fontSize="8" fontFamily="monospace">ssn: BinData(6...)</text>
          <text x="405" y="180" fill="hsl(200, 100%, 70%)" fontSize="9" fontFamily="monospace">{"}"}</text>
        </motion.g>

        {/* AWS KMS */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <rect x="540" y="30" width="140" height="70" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(45, 100%, 50%)" strokeWidth="2" />
          <text x="610" y="55" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="11" fontWeight="600">AWS KMS</text>
          <text x="610" y="75" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Customer Master Key</text>
          <text x="610" y="90" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">(CMK)</text>
        </motion.g>

        {/* Key Vault */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <rect x="540" y="180" width="140" height="70" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="610" y="205" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="11" fontWeight="600">Key Vault</text>
          <text x="610" y="225" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Data Encryption Keys</text>
          <text x="610" y="240" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">(DEKs - encrypted)</text>
        </motion.g>

        {/* Connection lines */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <path d="M 540 65 L 520 65 L 520 140 L 340 140" stroke="hsl(45, 100%, 50%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <path d="M 540 215 L 520 215 L 520 150 L 340 150" stroke="hsl(200, 100%, 70%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <path d="M 610 100 L 610 180" stroke="hsl(215, 15%, 45%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <text x="625" y="145" fill="hsl(215, 15%, 55%)" fontSize="7">wraps</text>
        </motion.g>

        <defs>
          <marker id="csfle-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Lab 2: Queryable Encryption Architecture - shows QE flow with metadata collections
export function QEArchitectureDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 700 300" className="w-full h-auto">
        {/* Query Path */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <rect x="20" y="40" width="120" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="80" y="65" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">Application</text>
          <text x="80" y="80" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Query: salary {'>'} 50k</text>
          <text x="80" y="95" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="8">→ Encrypted query</text>
          <text x="80" y="110" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">with QE tokens</text>
        </motion.g>

        {/* Arrow */}
        <motion.path d="M 140 80 L 180 80" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#qe-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />

        {/* MongoDB Driver */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <rect x="180" y="40" width="100" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="230" y="65" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="10" fontWeight="600">Driver</text>
          <text x="230" y="82" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Generates</text>
          <text x="230" y="95" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">query tokens</text>
          <text x="230" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">for server</text>
        </motion.g>

        {/* Arrow */}
        <motion.path d="M 280 80 L 310 80" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#qe-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* MongoDB Atlas with Collections */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <rect x="310" y="20" width="240" height="260" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="430" y="45" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="11" fontWeight="600">MongoDB Atlas</text>
          
          {/* Main Collection */}
          <rect x="325" y="60" width="100" height="55" rx="4" fill="hsl(220, 15%, 8%)" stroke="hsl(145, 100%, 46%)" />
          <text x="375" y="78" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">employees</text>
          <text x="375" y="93" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">salary: BinData</text>
          <text x="375" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">(encrypted)</text>

          {/* ESC Collection */}
          <rect x="325" y="130" width="100" height="55" rx="4" fill="hsl(220, 15%, 8%)" stroke="hsl(280, 80%, 70%)" />
          <text x="375" y="148" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">.esc</text>
          <text x="375" y="163" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">System Catalog</text>
          <text x="375" y="175" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">(metadata)</text>

          {/* ECOC Collection */}
          <rect x="325" y="200" width="100" height="55" rx="4" fill="hsl(220, 15%, 8%)" stroke="hsl(200, 100%, 70%)" />
          <text x="375" y="218" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="9" fontWeight="600">.ecoc</text>
          <text x="375" y="233" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">Context Cache</text>
          <text x="375" y="245" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">(range tokens)</text>

          {/* Query execution note */}
          <rect x="440" y="110" width="100" height="80" rx="4" fill="hsl(145, 100%, 20%)" fillOpacity="0.2" stroke="hsl(145, 100%, 46%)" strokeDasharray="3" />
          <text x="490" y="135" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8" fontWeight="600">Server Search</text>
          <text x="490" y="150" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">Uses tokens to</text>
          <text x="490" y="163" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">find matches</text>
          <text x="490" y="180" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7" fontWeight="600">WITHOUT decrypt</text>
        </motion.g>

        {/* Key difference callout */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <rect x="570" y="80" width="110" height="120" rx="6" fill="hsl(220, 13%, 15%)" stroke="hsl(45, 100%, 50%)" strokeWidth="1.5" />
          <text x="625" y="105" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="9" fontWeight="600">QE Difference</text>
          <text x="625" y="125" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">• Range queries ✓</text>
          <text x="625" y="140" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">• 1 DEK per field</text>
          <text x="625" y="155" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">• 2-3x storage</text>
          <text x="625" y="175" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7" fontWeight="600">Server never</text>
          <text x="625" y="188" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7" fontWeight="600">sees plaintext</text>
        </motion.g>

        <defs>
          <marker id="qe-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Lab 3: Crypto-Shredding Architecture - shows 1 DEK per user pattern
export function CryptoShreddingDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 700 260" className="w-full h-auto">
        {/* Users and their DEKs */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="30" y="30" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">1 DEK per User Pattern</text>
        </motion.g>

        {/* User A */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <rect x="30" y="50" width="100" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="80" y="70" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">User A Data</text>
          <text x="80" y="85" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Encrypted records</text>
        </motion.g>

        <motion.path d="M 130 72 L 180 72" stroke="hsl(145, 100%, 46%)" strokeWidth="2" markerEnd="url(#crypto-arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
        <text x="155" y="65" fill="hsl(215, 15%, 55%)" fontSize="7">encrypted with</text>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x="180" y="50" width="80" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="220" y="70" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="10" fontWeight="600">DEK-A</text>
          <text x="220" y="85" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">User A's key</text>
        </motion.g>

        {/* User B */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <rect x="30" y="110" width="100" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="80" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="10" fontWeight="600">User B Data</text>
          <text x="80" y="145" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Encrypted records</text>
        </motion.g>

        <motion.path d="M 130 132 L 180 132" stroke="hsl(200, 100%, 70%)" strokeWidth="2" markerEnd="url(#crypto-arrow-blue)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="180" y="110" width="80" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="220" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="10" fontWeight="600">DEK-B</text>
          <text x="220" y="145" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">User B's key</text>
        </motion.g>

        {/* User C */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <rect x="30" y="170" width="100" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="80" y="190" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="10" fontWeight="600">User C Data</text>
          <text x="80" y="205" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Encrypted records</text>
        </motion.g>

        <motion.path d="M 130 192 L 180 192" stroke="hsl(30, 100%, 65%)" strokeWidth="2" markerEnd="url(#crypto-arrow-orange)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <rect x="180" y="170" width="80" height="45" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="220" y="190" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="10" fontWeight="600">DEK-C</text>
          <text x="220" y="205" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">User C's key</text>
        </motion.g>

        {/* All DEKs wrapped by CMK */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <path d="M 260 72 L 300 72 L 300 132 L 340 132" stroke="hsl(215, 15%, 45%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <path d="M 260 132 L 340 132" stroke="hsl(215, 15%, 45%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <path d="M 260 192 L 300 192 L 300 132 L 340 132" stroke="hsl(215, 15%, 45%)" strokeWidth="1.5" strokeDasharray="4" fill="none" />
          <text x="305" y="100" fill="hsl(215, 15%, 55%)" fontSize="7">wrapped by</text>
        </motion.g>

        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <rect x="340" y="100" width="80" height="65" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(45, 100%, 50%)" strokeWidth="2" />
          <text x="380" y="125" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="11" fontWeight="600">CMK</text>
          <text x="380" y="145" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">AWS KMS</text>
          <text x="380" y="158" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">(shared)</text>
        </motion.g>

        {/* Erasure Action */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <rect x="460" y="40" width="220" height="180" rx="8" fill="hsl(0, 84%, 15%)" fillOpacity="0.2" stroke="hsl(0, 84%, 60%)" strokeWidth="2" />
          <text x="570" y="65" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="11" fontWeight="600">GDPR Erasure Request</text>
          
          <text x="570" y="90" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">User A requests deletion</text>
          
          <rect x="480" y="105" width="180" height="35" rx="4" fill="hsl(0, 84%, 20%)" stroke="hsl(0, 84%, 60%)" />
          <text x="570" y="127" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="9" fontWeight="600">DELETE DEK-A</text>
          
          <text x="570" y="160" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">Result: Crypto-Shredded ✓</text>
          <text x="570" y="178" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">• User A data = unreadable</text>
          <text x="570" y="193" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">• Backups also affected</text>
          <text x="570" y="208" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">• Users B, C unaffected</text>
        </motion.g>

        <defs>
          <marker id="crypto-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(145, 100%, 46%)" />
          </marker>
          <marker id="crypto-arrow-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(200, 100%, 70%)" />
          </marker>
          <marker id="crypto-arrow-orange" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(30, 100%, 65%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Full Recovery RPO: Point-in-Time Recovery flow
export function PITRFlowDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 720 200" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="360" y="20" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Point-in-Time Recovery Flow (RPO=0)</text>
        </motion.g>

        {/* Step 1: Good data */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <rect x="20" y="50" width="120" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="80" y="75" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">1. Good Data</text>
          <text x="80" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">1000 docs</text>
          <text x="80" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Note timestamp</text>
          <text x="80" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Live cluster</text>
        </motion.g>

        <motion.path d="M 140 95 L 175 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#pitr-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Step 2: Corruption */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <rect x="175" y="50" width="120" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(0, 84%, 60%)" strokeWidth="2" />
          <text x="235" y="75" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="10" fontWeight="600">2. Corruption</text>
          <text x="235" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Bad docs added</text>
          <text x="235" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">(accidental/ransomware)</text>
          <text x="235" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">1100 docs total</text>
        </motion.g>

        <motion.path d="M 295 95 L 330 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#pitr-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />

        {/* Step 3: PITR to temp */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <rect x="330" y="50" width="130" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="395" y="75" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="10" fontWeight="600">3. PITR Restore</text>
          <text x="395" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Pick point before corruption</text>
          <text x="395" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Restore to temp cluster</text>
          <text x="395" y="130" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">Oplog + snapshot</text>
        </motion.g>

        <motion.path d="M 460 95 L 495 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#pitr-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />

        {/* Step 4: Verify */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <rect x="495" y="50" width="120" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="555" y="75" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">4. Verify</text>
          <text x="555" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Only good data</text>
          <text x="555" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">1000 docs restored</text>
          <text x="555" y="130" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">RPO=0 achieved</text>
        </motion.g>

        {/* Continuous Backup callout */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <rect x="250" y="155" width="220" height="35" rx="6" fill="hsl(30, 100%, 20%)" fillOpacity="0.3" stroke="hsl(30, 100%, 65%)" strokeWidth="1.5" />
          <text x="360" y="177" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="9">Continuous Backup streams oplog for point-in-time restore</text>
        </motion.g>

        <defs>
          <marker id="pitr-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Live Migration: Source → Initial Sync → Oplog Tail → Cutover → Atlas
export function LiveMigrationFlowDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 720 220" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="360" y="20" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Live Migration Flow (less than 1 min downtime)</text>
        </motion.g>

        {/* Source */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <rect x="15" y="50" width="100" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="65" y="75" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">Source</text>
          <text x="65" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">On-prem or</text>
          <text x="65" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">self-managed</text>
          <text x="65" y="125" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Replica set</text>
        </motion.g>

        <motion.path d="M 115 90 L 155 90" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#migration-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />

        {/* Initial Sync */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <rect x="155" y="50" width="100" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="205" y="75" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">Initial Sync</text>
          <text x="205" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Full copy</text>
          <text x="205" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">of data</text>
          <text x="205" y="125" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">One-time</text>
        </motion.g>

        <motion.path d="M 255 90 L 295 90" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#migration-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Oplog Tail */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <rect x="295" y="50" width="100" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="345" y="75" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="9" fontWeight="600">Oplog Tail</text>
          <text x="345" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Continuous</text>
          <text x="345" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">replication</text>
          <text x="345" y="125" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Stays in sync</text>
        </motion.g>

        <motion.path d="M 395 90 L 435 90" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#migration-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} />

        {/* Cutover */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <rect x="435" y="50" width="90" height="80" rx="8" fill="hsl(0, 84%, 20%)" fillOpacity="0.3" stroke="hsl(0, 84%, 60%)" strokeWidth="2" />
          <text x="480" y="75" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="9" fontWeight="600">Cutover</text>
          <text x="480" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Stop writes</text>
          <text x="480" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Finalize sync</text>
          <text x="480" y="125" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">~1 min</text>
        </motion.g>

        <motion.path d="M 525 90 L 565 90" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#migration-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />

        {/* Atlas Target */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <rect x="565" y="50" width="100" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="615" y="75" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="10" fontWeight="600">Atlas</text>
          <text x="615" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Target cluster</text>
          <text x="615" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">App points here</text>
          <text x="615" y="125" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">Zero data loss</text>
        </motion.g>

        {/* App switchover note */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="260" y="155" width="200" height="50" rx="6" fill="hsl(145, 100%, 20%)" fillOpacity="0.2" stroke="hsl(145, 100%, 46%)" strokeWidth="1.5" />
          <text x="360" y="175" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">Application: update connection string at cutover</text>
          <text x="360" y="192" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Brief downtime only during switchover</text>
        </motion.g>

        <defs>
          <marker id="migration-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Rolling Updates: Primary stepdown → Secondary upgraded → New primary → repeat
export function RollingUpgradeDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 680 240" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="340" y="25" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Rolling Upgrade: One Member at a Time (Zero Downtime)</text>
        </motion.g>

        {/* Before: Primary (old) + 2 Secondaries (old) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <text x="30" y="55" fill="hsl(215, 15%, 55%)" fontSize="9" fontWeight="600">Before</text>
          <rect x="30" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="75" y="88" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="9" fontWeight="600">Primary</text>
          <text x="75" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">v4.4 (old)</text>
          <text x="75" y="118" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">Serves traffic</text>

          <rect x="140" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="185" y="88" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Secondary 1</text>
          <text x="185" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">v4.4 (old)</text>

          <rect x="250" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="295" y="88" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Secondary 2</text>
          <text x="295" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">v4.4 (old)</text>
        </motion.g>

        <motion.path d="M 340 92 L 380 92" stroke="hsl(215, 15%, 55%)" strokeWidth="2" strokeDasharray="4" markerEnd="url(#rolling-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
        <text x="360" y="85" fill="hsl(215, 15%, 55%)" fontSize="7">step 1</text>

        {/* Step 1: Primary steps down, Sec1 upgraded */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <text x="390" y="55" fill="hsl(215, 15%, 55%)" fontSize="9" fontWeight="600">Step 1</text>
          <rect x="390" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="435" y="88" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Primary</text>
          <text x="435" y="105" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="7">steps down</text>

          <rect x="500" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="545" y="88" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">Sec 1</text>
          <text x="545" y="105" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">upgraded v5.0</text>
          <text x="545" y="118" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="7">new Primary</text>

          <rect x="610" y="65" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="655" y="88" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Sec 2</text>
          <text x="655" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">v4.4 (old)</text>
        </motion.g>

        <motion.path d="M 340 152 L 380 152" stroke="hsl(215, 15%, 55%)" strokeWidth="2" strokeDasharray="4" markerEnd="url(#rolling-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
        <text x="360" y="145" fill="hsl(215, 15%, 55%)" fontSize="7">step 2</text>

        {/* Step 2: Sec2 upgraded */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <text x="390" y="135" fill="hsl(215, 15%, 55%)" fontSize="9" fontWeight="600">Step 2</text>
          <rect x="390" y="145" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="1.5" />
          <text x="435" y="168" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9">Primary</text>
          <text x="435" y="185" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">v5.0</text>

          <rect x="500" y="145" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="1.5" />
          <text x="545" y="168" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9">Sec 1</text>
          <text x="545" y="185" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">v5.0</text>

          <rect x="610" y="145" width="90" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="655" y="168" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">Sec 2</text>
          <text x="655" y="185" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="7">upgrading...</text>
        </motion.g>

        {/* After: All v5.0 */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <text x="30" y="225" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">After: All members v5.0. App never stopped.</text>
        </motion.g>

        <defs>
          <marker id="rolling-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Full Recovery RTO: Load → Backup → Disaster → Restore → Measure
export function RTOFlowDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 720 200" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="360" y="20" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Full Recovery RTO Flow (Restore Time Objective)</text>
        </motion.g>

        {/* Step 1: Load data */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <rect x="15" y="50" width="100" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="65" y="75" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">1. Load Data</text>
          <text x="65" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">10 GB into cluster</text>
          <text x="65" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">(e.g. 8.37M docs)</text>
          <text x="65" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">test.customers</text>
        </motion.g>

        <motion.path d="M 115 95 L 155 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#rto-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />

        {/* Step 2: Enable backup */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <rect x="155" y="50" width="100" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="205" y="75" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">2. Enable Backup</text>
          <text x="205" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Continuous Backup</text>
          <text x="205" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Wait for snapshot</text>
          <text x="205" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Snapshot ready</text>
        </motion.g>

        <motion.path d="M 255 95 L 295 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#rto-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Step 3: Disaster */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <rect x="295" y="50" width="100" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(0, 84%, 60%)" strokeWidth="2" />
          <text x="345" y="75" textAnchor="middle" fill="hsl(0, 84%, 60%)" fontSize="10" fontWeight="600">3. Disaster</text>
          <text x="345" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Delete database</text>
          <text x="345" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">(simulate)</text>
          <text x="345" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Start stopwatch</text>
        </motion.g>

        <motion.path d="M 395 95 L 435 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#rto-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} />

        {/* Step 4: Restore */}
        <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <rect x="435" y="50" width="100" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="485" y="75" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">4. Restore</text>
          <text x="485" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Snapshot to cluster</text>
          <text x="485" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Replaces data</text>
          <text x="485" y="130" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">DirectAttach fast</text>
        </motion.g>

        <motion.path d="M 535 95 L 575 95" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#rto-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />

        {/* Step 5: RTO achieved */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <rect x="575" y="50" width="110" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="630" y="75" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="9" fontWeight="600">5. RTO</text>
          <text x="630" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Stop stopwatch</text>
          <text x="630" y="110" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">10 GB / M40</text>
          <text x="630" y="130" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">~5 min</text>
        </motion.g>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="250" y="155" width="220" height="35" rx="6" fill="hsl(30, 100%, 20%)" fillOpacity="0.3" stroke="hsl(30, 100%, 65%)" strokeWidth="1.5" />
          <text x="360" y="177" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="9">RTO varies by tier and data size (M30/17GB ~16 min, M40/10GB ~5 min)</text>
        </motion.g>

        <defs>
          <marker id="rto-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Scale-out: 2 shards → Add shard → Balancer migrates chunks → Latency constant
export function ScaleOutDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 720 220" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="360" y="20" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Scale-Out: Add Shards Under Load (Zero Downtime)</text>
        </motion.g>

        {/* Before: 2 shards */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <text x="30" y="55" fill="hsl(215, 15%, 55%)" fontSize="9" fontWeight="600">Before</text>
          <rect x="30" y="65" width="120" height="70" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="90" y="90" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">Shard 1</text>
          <text x="90" y="108" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Replica set</text>
          <text x="90" y="125" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Chunks A-M</text>

          <rect x="170" y="65" width="120" height="70" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="230" y="90" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10" fontWeight="600">Shard 2</text>
          <text x="230" y="108" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Replica set</text>
          <text x="230" y="125" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="7">Chunks N-Z</text>
        </motion.g>

        <motion.path d="M 290 100 L 330 100" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#scaleout-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />
        <text x="310" y="92" fill="hsl(215, 15%, 55%)" fontSize="7">add shard</text>

        {/* Add 3rd shard */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x="330" y="50" width="120" height="100" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="390" y="75" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">Add Shard 3</text>
          <text x="390" y="95" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Atlas API or UI</text>
          <text x="390" y="112" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Under insert load</text>
          <text x="390" y="132" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">No downtime</text>
        </motion.g>

        <motion.path d="M 450 100 L 490 100" stroke="hsl(215, 15%, 55%)" strokeWidth="2" markerEnd="url(#scaleout-arrow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} />
        <text x="470" y="92" fill="hsl(215, 15%, 55%)" fontSize="7">balancer</text>

        {/* After: 3 shards, balancer */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <text x="500" y="55" fill="hsl(215, 15%, 55%)" fontSize="9" fontWeight="600">After</text>
          <rect x="490" y="65" width="80" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="1.5" />
          <text x="530" y="88" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">Shard 1</text>
          <text x="530" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">fewer chunks</text>

          <rect x="580" y="65" width="80" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="1.5" />
          <text x="620" y="88" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">Shard 2</text>
          <text x="620" y="105" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">fewer chunks</text>

          <rect x="490" y="130" width="80" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="530" y="153" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="8" fontWeight="600">Shard 3</text>
          <text x="530" y="170" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">new chunks</text>

          <rect x="580" y="130" width="80" height="55" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="1.5" />
          <text x="620" y="148" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="8">Balancer</text>
          <text x="620" y="163" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">migrates</text>
          <text x="620" y="178" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">chunks</text>
        </motion.g>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="200" y="200" width="320" height="18" rx="4" fill="hsl(145, 100%, 20%)" fillOpacity="0.2" stroke="hsl(145, 100%, 46%)" strokeWidth="1" />
          <text x="360" y="212" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">Batch execution times stay constant; capacity grows without latency increase</text>
        </motion.g>

        <defs>
          <marker id="scaleout-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Workload Isolation: 3 electable + 2 analytics nodes, query routing
export function WorkloadIsolationDiagram({ className }: DiagramProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <svg viewBox="0 0 680 300" className="w-full h-auto">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <text x="340" y="20" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10" fontWeight="600">Workload Isolation: OLTP vs Analytics on Same Cluster</text>
        </motion.g>

        {/* Application layer */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <rect x="50" y="40" width="150" height="50" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="125" y="58" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9" fontWeight="600">CRUD / Writes</text>
          <text x="125" y="72" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">primary (default)</text>

          <rect x="220" y="40" width="150" height="50" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="295" y="58" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="9" fontWeight="600">Aggregations</text>
          <text x="295" y="72" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">secondaryPreferred +</text>
          <text x="295" y="82" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">nodeType:ANALYTICS</text>
        </motion.g>

        <motion.path d="M 125 90 L 125 115" stroke="hsl(145, 100%, 46%)" strokeWidth="2" markerEnd="url(#workload-arrow-green)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
        <motion.path d="M 295 90 L 340 115" stroke="hsl(280, 80%, 70%)" strokeWidth="2" markerEnd="url(#workload-arrow-purple)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Cluster topology */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <rect x="30" y="120" width="280" height="130" rx="8" fill="hsl(220, 13%, 10%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="170" y="140" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="10" fontWeight="600">MongoDB Atlas Cluster (M30+)</text>

          {/* Electable nodes */}
          <text x="50" y="165" fill="hsl(215, 15%, 55%)" fontSize="8" fontWeight="600">Electable (3 nodes)</text>
          <rect x="50" y="172" width="70" height="65" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="85" y="195" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="9" fontWeight="600">Primary</text>
          <text x="85" y="210" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">CRUD traffic</text>
          <text x="85" y="225" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">Writes here</text>

          <rect x="135" y="172" width="70" height="65" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="170" y="195" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Secondary 1</text>
          <text x="170" y="210" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">Electable</text>

          <rect x="220" y="172" width="70" height="65" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(215, 15%, 55%)" strokeWidth="1.5" />
          <text x="255" y="195" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="8">Secondary 2</text>
          <text x="255" y="210" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">Electable</text>

          {/* Analytics nodes */}
          <text x="310" y="165" fill="hsl(280, 80%, 70%)" fontSize="8" fontWeight="600">Analytics (2 nodes)</text>
          <rect x="310" y="172" width="85" height="65" rx="6" fill="hsl(280, 80%, 15%)" fillOpacity="0.4" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="352" y="195" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="8" fontWeight="600">Analytics 1</text>
          <text x="352" y="210" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">nodeType:ANALYTICS</text>
          <text x="352" y="225" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="7">Heavy aggregations</text>

          <rect x="405" y="172" width="85" height="65" rx="6" fill="hsl(280, 80%, 15%)" fillOpacity="0.4" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="447" y="195" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="8" fontWeight="600">Analytics 2</text>
          <text x="447" y="210" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">Read-only</text>
          <text x="447" y="225" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="7">No elections</text>
        </motion.g>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="50" y="260" width="440" height="30" rx="6" fill="hsl(145, 100%, 20%)" fillOpacity="0.2" stroke="hsl(145, 100%, 46%)" strokeWidth="1" />
          <text x="270" y="278" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="8">Result: OLTP and analytics run on different nodes with no interference</text>
        </motion.g>

        <defs>
          <marker id="workload-arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(145, 100%, 46%)" />
          </marker>
          <marker id="workload-arrow-purple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(280, 80%, 70%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
