import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ArchitectureDiagramProps {
  className?: string;
}

export function EnvelopeEncryptionDiagram({ className }: ArchitectureDiagramProps) {
  return (
    <div className={cn('w-full max-w-4xl mx-auto py-8', className)}>
      <svg viewBox="0 0 800 400" className="w-full h-auto">
        {/* KMS Provider */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <rect x="50" y="30" width="180" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="140" y="65" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="14" fontWeight="600">KMS Provider</text>
          <text x="140" y="85" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11">AWS / Azure / GCP / KMIP</text>
        </motion.g>

        {/* CMK */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <rect x="310" y="30" width="180" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="400" y="65" textAnchor="middle" fill="hsl(200, 100%, 70%)" fontSize="14" fontWeight="600">Customer Master Key</text>
          <text x="400" y="85" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11">CMK (never leaves KMS)</text>
        </motion.g>

        {/* Arrow CMK to DEK */}
        <motion.path
          d="M 400 110 L 400 150"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <text x="420" y="135" fill="hsl(215, 15%, 55%)" fontSize="10">encrypts</text>

        {/* DEK */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <rect x="310" y="160" width="180" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="400" y="195" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="14" fontWeight="600">Data Encryption Key</text>
          <text x="400" y="215" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11">DEK (stored encrypted)</text>
        </motion.g>

        {/* Arrow DEK to Data */}
        <motion.path
          d="M 400 240 L 400 280"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
        <text x="420" y="265" fill="hsl(215, 15%, 55%)" fontSize="10">encrypts</text>

        {/* Data Fields */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <rect x="250" y="290" width="300" height="90" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="400" y="320" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="14" fontWeight="600">Encrypted Document Fields</text>
          <text x="400" y="345" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11" fontFamily="monospace">{"{ ssn: BinData(6, ...), salary: BinData(6, ...) }"}</text>
          <text x="400" y="365" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="10">BSON Subtype 6</text>
        </motion.g>

        {/* Key Vault */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <rect x="570" y="160" width="180" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(45, 100%, 50%)" strokeWidth="2" />
          <text x="660" y="195" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="14" fontWeight="600">Key Vault Collection</text>
          <text x="660" y="215" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11">__keyVault.dataKeys</text>
        </motion.g>

        {/* Arrow from DEK to Key Vault */}
        <motion.path
          d="M 490 200 L 570 200"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        />
        <text x="530" y="190" fill="hsl(215, 15%, 55%)" fontSize="9">stored in</text>

        {/* Arrow definitions */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export function EscEcocDiagram({ className }: ArchitectureDiagramProps) {
  return (
    <div className={cn('w-full max-w-4xl mx-auto py-6', className)}>
      <svg viewBox="0 0 800 350" className="w-full h-auto">
        {/* Main Collection */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <rect x="300" y="20" width="200" height="70" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="400" y="50" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="14" fontWeight="600">Encrypted Collection</text>
          <text x="400" y="70" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="11" fontFamily="monospace">employees</text>
        </motion.g>

        {/* Arrows down */}
        <motion.path
          d="M 350 90 L 200 130"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead2)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
        <motion.path
          d="M 400 90 L 400 130"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead2)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />
        <motion.path
          d="M 450 90 L 600 130"
          stroke="hsl(215, 15%, 55%)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead2)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />

        {/* ESC Collection */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <rect x="80" y="140" width="240" height="190" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(280, 80%, 70%)" strokeWidth="2" />
          <text x="200" y="165" textAnchor="middle" fill="hsl(280, 80%, 70%)" fontSize="13" fontWeight="600">.esc (System Catalog)</text>
          <text x="200" y="185" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">enxcol_.employees.esc</text>
          <rect x="100" y="200" width="200" height="110" rx="4" fill="hsl(220, 15%, 8%)" />
          <text x="115" y="220" fill="hsl(145, 100%, 50%)" fontSize="10" fontFamily="monospace">{"{"}</text>
          <text x="125" y="238" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">_id: ObjectId(...),</text>
          <text x="125" y="256" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">fieldPath: "salary",</text>
          <text x="125" y="274" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">count: 1234,</text>
          <text x="125" y="292" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">ecocID: ObjectId(...)</text>
          <text x="115" y="305" fill="hsl(145, 100%, 50%)" fontSize="10" fontFamily="monospace">{"}"}</text>
        </motion.g>

        {/* ECOC Collection */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <rect x="480" y="140" width="240" height="190" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(30, 100%, 65%)" strokeWidth="2" />
          <text x="600" y="165" textAnchor="middle" fill="hsl(30, 100%, 65%)" fontSize="13" fontWeight="600">.ecoc (Context Cache)</text>
          <text x="600" y="185" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">enxcol_.employees.ecoc</text>
          <rect x="500" y="200" width="200" height="110" rx="4" fill="hsl(220, 15%, 8%)" />
          <text x="515" y="220" fill="hsl(145, 100%, 50%)" fontSize="10" fontFamily="monospace">{"{"}</text>
          <text x="525" y="238" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">_id: ObjectId(...),</text>
          <text x="525" y="256" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">tokens: [BinData...],</text>
          <text x="525" y="274" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">// Query tokens for</text>
          <text x="525" y="292" fill="hsl(200, 100%, 70%)" fontSize="10" fontFamily="monospace">// server-side ops</text>
          <text x="515" y="305" fill="hsl(145, 100%, 50%)" fontSize="10" fontFamily="monospace">{"}"}</text>
        </motion.g>

        {/* Key Vault in middle */}
        <motion.g
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <rect x="325" y="200" width="150" height="80" rx="8" fill="hsl(220, 13%, 12%)" stroke="hsl(45, 100%, 50%)" strokeWidth="2" />
          <text x="400" y="230" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="12" fontWeight="600">Key Vault</text>
          <text x="400" y="250" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">DEK per field</text>
          <text x="400" y="268" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="9">(QE requirement)</text>
        </motion.g>

        <defs>
          <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export function RightToErasureFlowchart({ className }: ArchitectureDiagramProps) {
  return (
    <div className={cn('w-full max-w-3xl mx-auto py-6', className)}>
      <svg viewBox="0 0 700 400" className="w-full h-auto">
        {/* Start */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <ellipse cx="350" cy="30" rx="80" ry="25" fill="hsl(145, 100%, 46%)" />
          <text x="350" y="35" textAnchor="middle" fill="hsl(220, 13%, 5%)" fontSize="12" fontWeight="600">Erasure Request</text>
        </motion.g>

        {/* Arrow */}
        <motion.path d="M 350 55 L 350 80" stroke="hsl(215, 15%, 55%)" strokeWidth="2" fill="none" markerEnd="url(#arrow3)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }} />

        {/* Lookup User DEK */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x="260" y="90" width="180" height="50" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(200, 100%, 70%)" strokeWidth="2" />
          <text x="350" y="120" textAnchor="middle" fill="hsl(210, 20%, 85%)" fontSize="11">Lookup User's DEK ID</text>
        </motion.g>

        <motion.path d="M 350 140 L 350 170" stroke="hsl(215, 15%, 55%)" strokeWidth="2" fill="none" markerEnd="url(#arrow3)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />

        {/* Delete DEK */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <rect x="260" y="180" width="180" height="50" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(0, 84%, 60%)" strokeWidth="2" />
          <text x="350" y="210" textAnchor="middle" fill="hsl(210, 20%, 85%)" fontSize="11">Delete DEK from Key Vault</text>
        </motion.g>

        <motion.path d="M 350 230 L 350 260" stroke="hsl(215, 15%, 55%)" strokeWidth="2" fill="none" markerEnd="url(#arrow3)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} />

        {/* Result Box */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <rect x="220" y="270" width="260" height="80" rx="6" fill="hsl(220, 13%, 12%)" stroke="hsl(145, 100%, 46%)" strokeWidth="2" />
          <text x="350" y="295" textAnchor="middle" fill="hsl(145, 100%, 46%)" fontSize="12" fontWeight="600">Crypto-Shredded ✓</text>
          <text x="350" y="315" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">• Data becomes undecryptable</text>
          <text x="350" y="330" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">• Backups remain encrypted (safe)</text>
          <text x="350" y="345" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="10">• Other users unaffected</text>
        </motion.g>

        {/* Side note - One DEK per user */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <rect x="500" y="130" width="170" height="70" rx="6" fill="hsl(220, 13%, 15%)" stroke="hsl(45, 100%, 50%)" strokeWidth="1" strokeDasharray="4" />
          <text x="585" y="155" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="10" fontWeight="600">Key Pattern</text>
          <text x="585" y="175" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">1 User = 1 DEK</text>
          <text x="585" y="190" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="9">Stored in user record</text>
        </motion.g>

        <motion.path d="M 440 180 L 500 170" stroke="hsl(45, 100%, 50%)" strokeWidth="1" strokeDasharray="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.85 }} />

        <defs>
          <marker id="arrow3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(215, 15%, 55%)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
