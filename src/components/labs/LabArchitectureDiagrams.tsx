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
