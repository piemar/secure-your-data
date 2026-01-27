import { ReactNode } from 'react';
import { InteractivePoll } from './InteractivePoll';
import { StorageChallenge } from './StorageChallenge';
import { KnowledgeCheck } from './KnowledgeCheck';
import {
  EnvelopeEncryptionDiagram,
  EscEcocDiagram,
  RightToErasureFlowchart
} from './ArchitectureDiagrams';
import { CodeBlock } from '@/components/ui/code-block';
import { Shield, Lock, Database, Key, AlertTriangle, CheckCircle, XCircle, Cloud, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideData {
  id: number;
  title: string;
  section: string;
  content: ReactNode;
  speakerNotes: string;
}

// Helper components for slides
function SlideTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gradient-green mb-2">{children}</h1>
      {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function BulletList({ items, icon: Icon }: { items: string[]; icon?: React.ElementType }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-lg">
          {Icon ? (
            <Icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ComparisonTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="border border-border bg-muted/30 px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-border px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutBox({ type, title, children }: { type: 'warning' | 'info' | 'success'; title: string; children: ReactNode }) {
  const styles = {
    warning: 'border-warning bg-warning/10 text-warning',
    info: 'border-info bg-info/10 text-info',
    success: 'border-primary bg-primary/10 text-primary',
  };
  const icons = {
    warning: AlertTriangle,
    info: Shield,
    success: CheckCircle,
  };
  const Icon = icons[type];

  return (
    <div className={cn('border rounded-lg p-4', styles[type])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gradient-green">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// Poll state manager
let pollVotes = {
  security: 12,
  performance: 8,
  cost: 5,
  compliance: 7,
};

export const slides: SlideData[] = [
  // SECTION 1: The "Why" & Compliance Hook (Slides 1-4)
  {
    id: 1,
    title: 'MongoDB CSFLE & Queryable Encryption',
    section: 'Introduction',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto glow-green">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gradient-green">
            Client-Side Field-Level Encryption
          </h1>
          <h2 className="text-3xl font-semibold mb-2">& Queryable Encryption</h2>
          <p className="text-xl text-muted-foreground">SA Technical Enablement Deep-Dive</p>
        </div>
        <div className="flex gap-6 mt-8">
          <StatCard value="45 min" label="Presentation" icon={Database} />
          <StatCard value="3 Labs" label="Hands-On" icon={Key} />
          <StatCard value="Day 2" label="Architecture Focus" icon={Server} />
        </div>
      </div>
    ),
    speakerNotes: `Welcome to the CSFLE & Queryable Encryption deep-dive session.

This is designed for senior SAs who need to handle complex "Day 2" architectural discussions with customers.

By the end of this session, you'll be able to:
- Explain HOW QE works under the hood (not just what it does)
- Design multi-cloud security architectures
- Handle GDPR/HIPAA compliance questions with confidence
- Differentiate our solution from competitors like Oracle TDE and Cosmos DB

We have 45 minutes of presentation followed by three hands-on labs (Lab 1: 15 min, Lab 2: 15 min, Lab 3: 15 min - total 45 min).`,
  },
  {
    id: 2,
    title: 'Session Agenda',
    section: 'Introduction',
    content: (
      <div className="max-w-3xl mx-auto">
        <SlideTitle>Today's Journey</SlideTitle>
        <div className="space-y-4">
          {[
            { time: '0-5 min', topic: 'The "Why" & Compliance Hook', icon: Shield },
            { time: '5-15 min', topic: 'Cryptographic Fundamentals & Internals', icon: Key },
            { time: '15-25 min', topic: 'GDPR & Multi-Cloud Patterns', icon: Cloud },
            { time: '25-35 min', topic: 'CSFLE vs QE Architecture Differences', icon: Database },
            { time: '35-45 min', topic: 'Competitive "Kill" Tracks', icon: Lock },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-20 text-sm font-mono text-primary">{item.time}</div>
              <div className="p-2 rounded bg-primary/10">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-lg font-medium">{item.topic}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Here's our agenda for the next 45 minutes.

We'll start with the business case - why customers need this.

Then we go deep into the cryptographic internals - this is the "how it works" content that will set you apart in technical discussions.

GDPR patterns are critical for European customers - we'll cover the "Right to Erasure" implementation.

The CSFLE vs QE comparison is where customers often get confused - we'll clarify the key differences.

Finally, competitive positioning so you can handle objections about Oracle, AWS, and Azure alternatives.`,
  },
  {
    id: 3,
    title: 'Cloud Migration Blockers',
    section: 'The Why',
    content: (
      <div className="max-w-2xl mx-auto">
        <SlideTitle subtitle="What's holding your customers back?">
          Interactive Poll
        </SlideTitle>
        <InteractivePoll
          question="What's the #1 blocker for cloud migration in your territory?"
          options={[
            { id: 'security', label: '🔐 Security & Data Protection', votes: pollVotes.security },
            { id: 'performance', label: '⚡ Performance Concerns', votes: pollVotes.performance },
            { id: 'cost', label: '💰 Cost & TCO', votes: pollVotes.cost },
            { id: 'compliance', label: '📋 Regulatory Compliance', votes: pollVotes.compliance },
          ]}
          onVote={(id) => {
            pollVotes[id as keyof typeof pollVotes]++;
          }}
        />
      </div>
    ),
    speakerNotes: `Let's start with an interactive poll.

Click on what you see most in your territory.

[Wait for responses]

Typically, Security and Compliance dominate. This is exactly why CSFLE and QE matter.

Key insight: Security and Compliance are often the same concern from different angles.
- Security = Technical controls
- Compliance = Proving those controls work

CSFLE/QE addresses both simultaneously.`,
  },
  {
    id: 4,
    title: 'The Compliance Landscape',
    section: 'The Why',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="The stakes are real">The Cost of Getting It Wrong</SlideTitle>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard value="€4.4B" label="GDPR fines to date" icon={AlertTriangle} />
          <StatCard value="$1.3M" label="Avg HIPAA penalty" icon={Shield} />
          <StatCard value="100%" label="Encryption required" icon={Lock} />
        </div>
        <ComparisonTable
          headers={['Regulation', 'Encryption Requirement', 'MongoDB Solution']}
          rows={[
            ['GDPR (EU)', 'Art. 32: "Encryption of personal data"', 'CSFLE/QE + Right to Erasure'],
            ['HIPAA (US)', 'ePHI must be encrypted at rest AND in transit', 'CSFLE for PHI fields'],
            ['PCI-DSS', 'Encrypt cardholder data, manage crypto keys', 'QE for searchable PAN'],
            ['SOX', 'Audit trail + access controls', 'Field-level encryption + logging'],
          ]}
        />
      </div>
    ),
    speakerNotes: `Let's talk about the compliance landscape.

€4.4 billion in GDPR fines have been issued to date. This is not theoretical risk.

Key regulations and how we address them:

GDPR Article 32 specifically calls out encryption. But more importantly, Article 17 - the "Right to be Forgotten" - requires you to be able to delete all user data. We'll show how CSFLE enables "crypto-shredding" to address this.

HIPAA requires encryption of electronic Protected Health Information (ePHI). CSFLE is perfect for encrypting specific PHI fields while leaving non-sensitive data queryable.

PCI-DSS is interesting because you need to encrypt cardholder data BUT also need to search it (for fraud detection, etc.). This is where Queryable Encryption shines.

The key message: Encryption is no longer optional. The question is HOW to do it without breaking application functionality.`,
  },

  // SECTION 2: Cryptographic Fundamentals (Slides 5-8)
  {
    id: 5,
    title: 'Use Cases by Industry',
    section: 'Use Cases',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Where CSFLE & QE Shine</SlideTitle>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: 'Healthcare',
              icon: '🏥',
              items: ['Patient records (ePHI)', 'Insurance IDs', 'Prescription data'],
              regulation: 'HIPAA',
            },
            {
              title: 'Financial Services',
              icon: '🏦',
              items: ['Account numbers', 'SSN/Tax IDs', 'Transaction amounts'],
              regulation: 'PCI-DSS, SOX',
            },
            {
              title: 'Gaming & Social',
              icon: '🎮',
              items: ['Payment details', 'Chat logs (minors)', 'Location data'],
              regulation: 'COPPA, GDPR',
            },
          ].map((industry, i) => (
            <div key={i} className="p-6 rounded-lg bg-card border border-border">
              <div className="text-4xl mb-4">{industry.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{industry.title}</h3>
              <ul className="space-y-2 mb-4">
                {industry.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="text-xs font-mono text-muted-foreground">
                {industry.regulation}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Let's look at specific use cases by industry.

Healthcare: HIPAA requires encryption of ePHI. With CSFLE, you encrypt patient_name, SSN, diagnosis codes - but leave timestamps and department codes queryable for analytics.

Financial Services: PCI-DSS requires encryption of cardholder data. QE is perfect here because you can do range queries on encrypted transaction amounts for fraud detection.

Gaming: Often overlooked, but gaming companies handle massive amounts of payment data and, importantly, data from minors. COPPA (Children's Online Privacy Protection Act) has strict requirements.

The pattern: Selective encryption of sensitive fields while maintaining application functionality on non-sensitive data.`,
  },
  {
    id: 6,
    title: 'CSFLE vs Queryable Encryption',
    section: 'Overview',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Choosing the right approach">Two Solutions, Different Trade-offs</SlideTitle>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              CSFLE
            </h3>
            <BulletList
              items={[
                'Deterministic OR Random encryption',
                'Equality queries on deterministic fields',
                'Mature, battle-tested (MongoDB 4.2+)',
                'Lower overhead',
                'Can share DEK across multiple fields',
              ]}
              icon={CheckCircle}
            />
          </div>
          <div className="p-6 rounded-lg bg-card border border-primary">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Queryable Encryption
            </h3>
            <BulletList
              items={[
                'Always random encryption',
                'Equality AND Range queries',
                'Latest innovation (MongoDB 7.0+)',
                '2-3x storage overhead',
                'Requires separate DEK per field',
              ]}
              icon={CheckCircle}
            />
          </div>
        </div>
        <CalloutBox type="warning" title="Key Architecture Difference">
          <p>QE <strong>requires a separate DEK for each encrypted field</strong> due to metadata binding. This is different from CSFLE where one DEK can encrypt multiple fields.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `Here's the fundamental choice customers face: CSFLE or Queryable Encryption.

CSFLE:
- More mature, available since 4.2
- Supports deterministic encryption (same input = same output) which enables equality queries
- Lower overhead, simpler architecture
- One DEK CAN be used for multiple fields

Queryable Encryption:
- Always uses randomized encryption (more secure - same input = different output each time)
- Supports RANGE queries on encrypted data - this is the breakthrough
- Available in MongoDB 7.0+
- Higher storage overhead (2-3x)
- CRITICAL: Requires a SEPARATE DEK for EACH encrypted field

That last point is often missed and causes confusion. In CSFLE, you might use one DEK for all sensitive fields. In QE, each field needs its own DEK because of how the metadata collections work.`,
  },
  {
    id: 7,
    title: 'Envelope Encryption Architecture',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="How keys protect keys">The Envelope Encryption Model</SlideTitle>
        <EnvelopeEncryptionDiagram />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <div className="text-primary font-semibold mb-1">CMK</div>
            <div className="text-sm text-muted-foreground">Never leaves KMS</div>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <div className="text-primary font-semibold mb-1">DEK</div>
            <div className="text-sm text-muted-foreground">Stored encrypted in Key Vault</div>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <div className="text-primary font-semibold mb-1">Data</div>
            <div className="text-sm text-muted-foreground">BSON Subtype 6</div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `This is the envelope encryption model - fundamental to understanding CSFLE and QE.

Three layers:
1. Customer Master Key (CMK) - Lives in KMS (AWS, Azure, GCP, KMIP). NEVER leaves the KMS. This is your "key to all keys."

2. Data Encryption Key (DEK) - The actual key that encrypts your data. Stored in the MongoDB Key Vault collection, BUT it's stored encrypted (by the CMK). Client must call KMS to decrypt it before use.

3. Encrypted Data - Stored as BSON Subtype 6 in your documents.

The flow:
1. Client needs to encrypt data
2. Client retrieves encrypted DEK from Key Vault
3. Client sends encrypted DEK to KMS
4. KMS decrypts DEK using CMK, returns plaintext DEK
5. Client uses plaintext DEK to encrypt data
6. Encrypted data stored in MongoDB

Why envelope encryption? 
- CMK rotation only requires re-encrypting DEKs, not all data
- CMK never touches your infrastructure
- Defense in depth`,
  },
  {
    id: 8,
    title: 'Structured Encryption & EMMs',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="The magic behind searchable encryption">How QE Enables Range Queries on Ciphertext</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Encrypted Multi-Maps (EMMs)</h3>
            <p className="text-muted-foreground mb-4">
              QE uses a data structure called an Encrypted Multi-Map that allows the server to
              compute comparisons without seeing plaintext.
            </p>
            <CodeBlock
              code={`// Client generates encrypted tokens
token_gt_50000 = encrypt(range_token(50000, GT))
token_lt_100000 = encrypt(range_token(100000, LT))

// Server can compute intersection
// without knowing actual values`}
              language="javascript"
              filename="range-query-concept.js"
            />
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Structured Encryption</h3>
            <p className="text-muted-foreground mb-4">
              The server stores encrypted "tokens" that encode order relationships.
              It can test {">"} and {"<"} without decrypting.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">$eq - Equality matches</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">$gt, $gte - Greater than</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">$lt, $lte - Less than</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">$in - Set membership</span>
              </div>
            </div>
          </div>
        </div>
        <CalloutBox type="info" title="Private Querying">
          QE also implements "private querying" - query patterns are redacted from logs,
          hiding even the <em>existence</em> of queries from database operators.
        </CalloutBox>
      </div>
    ),
    speakerNotes: `This is the deep technical content that sets you apart.

How can a server compute $gt on encrypted data? The answer is Structured Encryption using Encrypted Multi-Maps (EMMs).

Conceptually:
1. Client generates special "range tokens" at encryption time
2. These tokens encode order relationships mathematically
3. Server can test token relationships without knowing values
4. Result: Server finds "salary > 50000" without ever seeing "50000" or actual salaries

Technical details (for deep conversations):
- Uses Order-Preserving Encryption (OPE) principles
- Tokens are stored in .esc and .ecoc collections
- Each insert generates multiple tokens for range capability

Private Querying is a bonus:
- Query patterns are redacted from server logs
- A DBA can't even tell WHICH field you're querying
- Provides protection against insider threats

This is why storage overhead is 2-3x - those tokens take space.`,
  },
  {
    id: 9,
    title: '.esc and .ecoc Collections',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="The hidden metadata that makes QE work">QE Internal Collections</SlideTitle>
        <EscEcocDiagram />
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <h4 className="font-semibold text-purple-400 mb-2">.esc (System Catalog)</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Tracks encrypted field metadata</li>
              <li>• Maps fields to their DEKs</li>
              <li>• Stores token counts for compaction</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h4 className="font-semibold text-orange-400 mb-2">.ecoc (Context Cache)</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Stores query tokens</li>
              <li>• Enables server-side operations</li>
              <li>• Requires periodic compaction</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `When you enable Queryable Encryption, MongoDB automatically creates these metadata collections:

.esc (Encrypted State Collection / System Catalog):
- Named: enxcol_.<collectionName>.esc
- Stores metadata about encrypted fields
- Maps each field to its DEK
- Tracks counts for compaction decisions

.ecoc (Encrypted Compaction Collection / Context Cache):
- Named: enxcol_.<collectionName>.ecoc
- Stores the query tokens generated during inserts
- These tokens enable the server to compute range comparisons
- Grows with each insert - needs periodic compaction

Why this matters for customers:
1. Storage planning - these collections add overhead
2. Operational procedures - compaction should be scheduled
3. Backup considerations - these collections must be backed up too

In Lab 2, you'll actually explore these collections in MongoDB Compass to see the structure.`,
  },
  {
    id: 10,
    title: 'Storage Factor Challenge',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-3xl mx-auto">
        <SlideTitle>Quick Challenge</SlideTitle>
        <StorageChallenge />
      </div>
    ),
    speakerNotes: `Interactive challenge time!

Let participants guess before revealing.

The answer is 2-3x for Range-indexed fields.

Why?
- Each value generates multiple tokens for range capability
- Tokens stored in .esc and .ecoc collections
- More granular ranges = more tokens

Factors affecting overhead:
- Number of encrypted fields
- Range index sparsity setting
- Cardinality of values
- Query precision requirements

This is important for capacity planning discussions. Always factor in this overhead when sizing clusters.`,
  },
  {
    id: 11,
    title: 'Key Hierarchy Visualization',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Defense in depth">The Key Protection Stack</SlideTitle>
        <div className="flex justify-center items-center gap-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 p-6 rounded-lg bg-primary/10 border-2 border-primary text-center">
              <Cloud className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-semibold">KMS Provider</div>
              <div className="text-xs text-muted-foreground mt-1">AWS / Azure / GCP</div>
            </div>
            <div className="text-sm text-muted-foreground">↓ protects</div>
            <div className="w-48 p-6 rounded-lg bg-blue-500/10 border-2 border-blue-500 text-center">
              <Key className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold">CMK</div>
              <div className="text-xs text-muted-foreground mt-1">Customer Master Key</div>
            </div>
            <div className="text-sm text-muted-foreground">↓ encrypts</div>
            <div className="w-48 p-6 rounded-lg bg-purple-500/10 border-2 border-purple-500 text-center">
              <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold">DEK(s)</div>
              <div className="text-xs text-muted-foreground mt-1">Data Encryption Keys</div>
            </div>
            <div className="text-sm text-muted-foreground">↓ encrypts</div>
            <div className="w-48 p-6 rounded-lg bg-orange-500/10 border-2 border-orange-500 text-center">
              <Database className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="font-semibold">Field Data</div>
              <div className="text-xs text-muted-foreground mt-1">BSON Subtype 6</div>
            </div>
          </div>
          <div className="max-w-xs space-y-4 text-sm">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="font-semibold text-primary mb-2">Why this matters:</div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• CMK rotation = only re-encrypt DEKs</li>
                <li>• CMK never touches your infra</li>
                <li>• Each layer adds protection</li>
                <li>• Audit trail at KMS layer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `The key hierarchy provides defense in depth.

Top to bottom:
1. KMS Provider - Enterprise-grade key management (AWS KMS, Azure Key Vault, GCP KMS, KMIP)
2. CMK - Your master key, never leaves the KMS
3. DEKs - Encrypted by CMK, stored in Key Vault collection
4. Data - Encrypted by DEKs, stored as BSON Subtype 6

Benefits of this architecture:
- CMK rotation is cheap (only re-encrypt DEKs, not all data)
- Separation of concerns (KMS team manages CMK, app team uses DEKs)
- Audit trail at every layer
- Cloud-agnostic (can switch KMS providers)

Key rotation workflow (using rewrapManyDataKey):
1. Create new CMK in KMS
2. Use rewrapManyDataKey() to re-encrypt all DEKs
3. Retire old CMK
4. No data re-encryption needed!`,
  },
  // Knowledge Check - Cryptographic Fundamentals
  {
    id: 12,
    title: 'Knowledge Check: Encryption Fundamentals',
    section: 'Cryptographic Fundamentals',
    content: (
      <div className="max-w-3xl mx-auto">
        <SlideTitle>Knowledge Check</SlideTitle>
        <KnowledgeCheck
          question="In MongoDB's envelope encryption model, which key directly encrypts your application data?"
          options={[
            { id: 'cmk', label: 'Customer Master Key (CMK)', isCorrect: false },
            { id: 'dek', label: 'Data Encryption Key (DEK)', isCorrect: true },
            { id: 'kms', label: 'KMS Provider Key', isCorrect: false },
            { id: 'tls', label: 'TLS Certificate Key', isCorrect: false },
          ]}
          explanation="The DEK directly encrypts your data. The CMK never touches your data - it only encrypts/decrypts the DEKs. This separation enables efficient key rotation (only re-encrypt DEKs, not all data)."
          points={10}
        />
      </div>
    ),
    speakerNotes: `Knowledge Check time! Ask the audience before revealing the answer.

Correct answer: DEK (Data Encryption Key)

The key insight here is the separation of concerns:
- CMK: Protects DEKs, lives in KMS
- DEK: Protects data, stored encrypted in Key Vault

This is what makes key rotation efficient - you only need to re-encrypt the DEKs, not all the data.

Common misconception: People think the CMK encrypts data directly. It doesn't - it's "key to the keys."`,
  },

  // SECTION 3: GDPR & Multi-Cloud Patterns (Slides 12-14)
  {
    id: 12,
    title: 'Right to Erasure Pattern',
    section: 'GDPR Patterns',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="GDPR Article 17 compliance">Crypto-Shredding at Scale</SlideTitle>
        <RightToErasureFlowchart />
        <CalloutBox type="success" title="One DEK Per User Pattern">
          <p>Assign each user their own DEK. When erasure is requested, simply delete their DEK from the Key Vault.
            All their data becomes cryptographically indecipherable - including in backups.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `GDPR Article 17 - the "Right to be Forgotten" - is a major challenge for customers.

The problem:
- User requests deletion of all their data
- But their data is in backups, logs, analytics, everywhere
- Traditional deletion doesn't touch backups

The solution: Crypto-shredding with One DEK Per User

Pattern:
1. When user signs up, generate a unique DEK for them
2. Store DEK ID in their user record
3. All their sensitive data encrypted with THEIR DEK
4. When they request erasure: delete their DEK

Result:
- All their data becomes undecryptable garbage
- Including data in backups (backups have encrypted data)
- Other users completely unaffected (different DEKs)

This is Lab 3 - you'll implement this pattern hands-on.

Limitation to discuss: Cross-user queries become complex. If you need to query across users (analytics), you may need a separate aggregation approach.`,
  },
  {
    id: 13,
    title: 'Multi-Cloud KMS Architecture',
    section: 'GDPR Patterns',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Flexibility and failover">Managing CMKs Across Providers</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">BYOK (Bring Your Own Key)</h3>
            <BulletList
              items={[
                'Customer owns and manages CMK',
                'Import existing keys to cloud KMS',
                'Full control over key lifecycle',
                'Required for some regulations',
              ]}
            />
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Managed Identity</h3>
            <BulletList
              items={[
                'Cloud provider generates CMK',
                'Automatic rotation available',
                'Simpler operational model',
                'Sufficient for most use cases',
              ]}
            />
          </div>
        </div>
        <ComparisonTable
          headers={['Provider', 'Service', 'Auth Method', 'BYOK']}
          rows={[
            ['AWS', 'AWS KMS', 'IAM Role / Access Key', <CheckCircle key="aws" className="w-5 h-5 text-primary" />],
            ['Azure', 'Key Vault', 'Managed Identity / SPN', <CheckCircle key="azure" className="w-5 h-5 text-primary" />],
            ['GCP', 'Cloud KMS', 'Service Account', <CheckCircle key="gcp" className="w-5 h-5 text-primary" />],
            ['On-Prem', 'KMIP (Thales, etc)', 'Certificate', <CheckCircle key="kmip" className="w-5 h-5 text-primary" />],
          ]}
        />
      </div>
    ),
    speakerNotes: `Multi-cloud and hybrid scenarios are common. Here's how to handle KMS across providers.

BYOK (Bring Your Own Key):
- Customer generates key material externally
- Imports into cloud KMS
- Maintains control even if they leave the cloud
- Required by some financial regulations (custody requirements)

Managed Identity:
- Let the cloud provider generate and manage keys
- Automatic rotation, simpler ops
- Sufficient for most compliance requirements

Provider options:
- AWS KMS: Most common, IAM-based auth
- Azure Key Vault: Good for Microsoft shops, Managed Identity is slick
- GCP Cloud KMS: Similar to AWS, service account auth
- KMIP: For on-prem or specialized HSMs (Thales, Gemalto, etc)

Architecture tip: You can use DIFFERENT KMS providers for different DEKs.
- Production data with AWS KMS
- DR data with Azure Key Vault
- Provides true multi-cloud resilience`,
  },
  {
    id: 14,
    title: 'Automatic vs Explicit Encryption',
    section: 'Architecture',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Developer experience options">Choose Your Integration Path</SlideTitle>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Automatic
            </h3>
            <p className="text-muted-foreground mb-4">
              Best for Queryable Encryption (MongoDB 7.0+). Define fields on the collection.
            </p>
            <CodeBlock
              code={`// Queryable Encryption (MongoDB 7.0+)
const encryptedFields = {
  fields: [
    {
      path: "ssn",
      bsonType: "string",
      queries: { queryType: "equality" }
    },
    {
      path: "salary",
      bsonType: "int",
      queries: { 
        queryType: "range",
        min: 0, max: 1000000 
      }
    }
  ]
};

await db.createCollection("employees", { encryptedFields });`}
              language="javascript"
              filename="qe-auto-encryption.js"
            />
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">👩‍💻</span> Manual/Explicit
            </h3>
            <p className="text-muted-foreground mb-4">
              Full control in application code. Call encrypt/decrypt methods directly.
            </p>
            <CodeBlock
              code={`// Manual/Explicit encryption
const encryptedSSN = await clientEncryption.encrypt(
  "123-45-6789",
  {
    keyId: dekId,
    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
  }
);

await collection.insertOne({ ssn: encryptedSSN });`}
              language="javascript"
              filename="explicit-encrypt.js"
            />
            <div className="mt-4 text-sm text-primary">Best for: Conditional logic or legacy apps</div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `Two ways to integrate CSFLE/QE: Automatic and Explicit.

Automatic Encryption:
- Define a JSON schema specifying which fields to encrypt
- Driver intercepts all operations and handles crypto
- App code doesn't change - encryption is invisible
- Best for new applications or major refactors

Explicit Encryption:
- Call clientEncryption.encrypt() and decrypt() manually
- Full control over when/what gets encrypted
- Can encrypt only in specific code paths
- Best for retrofitting existing applications

In practice, many customers use both:
- Automatic for the main path
- Explicit for edge cases or conditional encryption

Both use the same underlying crypto - it's just about developer experience.`,
  },

  // SECTION 4: CSFLE vs QE Deep Comparison (Slides 15-18)
  {
    id: 15,
    title: 'Supported Query Types',
    section: 'CSFLE vs QE',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="What you can (and can't) do">Query Operator Support</SlideTitle>
        <ComparisonTable
          headers={['Operation', 'CSFLE Deterministic', 'CSFLE Random', 'QE Equality', 'QE Range']}
          rows={[
            ['$eq', <CheckCircle key="1" className="w-5 h-5 text-primary" />, <XCircle key="2" className="w-5 h-5 text-destructive" />, <CheckCircle key="3" className="w-5 h-5 text-primary" />, <CheckCircle key="4" className="w-5 h-5 text-primary" />],
            ['$ne', <CheckCircle key="5" className="w-5 h-5 text-primary" />, <XCircle key="6" className="w-5 h-5 text-destructive" />, <CheckCircle key="7" className="w-5 h-5 text-primary" />, <CheckCircle key="8" className="w-5 h-5 text-primary" />],
            ['$gt, $gte, $lt, $lte', <XCircle key="9" className="w-5 h-5 text-destructive" />, <XCircle key="10" className="w-5 h-5 text-destructive" />, <XCircle key="11" className="w-5 h-5 text-destructive" />, <CheckCircle key="12" className="w-5 h-5 text-primary" />],
            ['$in', <CheckCircle key="13" className="w-5 h-5 text-primary" />, <XCircle key="14" className="w-5 h-5 text-destructive" />, <CheckCircle key="15" className="w-5 h-5 text-primary" />, <CheckCircle key="16" className="w-5 h-5 text-primary" />],
            ['$regex', <XCircle key="17" className="w-5 h-5 text-destructive" />, <XCircle key="18" className="w-5 h-5 text-destructive" />, <XCircle key="19" className="w-5 h-5 text-destructive" />, <XCircle key="20" className="w-5 h-5 text-destructive" />],
            ['$text search', <XCircle key="21" className="w-5 h-5 text-destructive" />, <XCircle key="22" className="w-5 h-5 text-destructive" />, <XCircle key="23" className="w-5 h-5 text-destructive" />, <XCircle key="24" className="w-5 h-5 text-destructive" />],
            ['Sorting', <XCircle key="25" className="w-5 h-5 text-destructive" />, <XCircle key="26" className="w-5 h-5 text-destructive" />, <XCircle key="27" className="w-5 h-5 text-destructive" />, <XCircle key="28" className="w-5 h-5 text-destructive" />],
            ['$group/$sum', <XCircle key="29" className="w-5 h-5 text-destructive" />, <XCircle key="30" className="w-5 h-5 text-destructive" />, <XCircle key="31" className="w-5 h-5 text-destructive" />, <XCircle key="32" className="w-5 h-5 text-destructive" />],
          ]}
        />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <CalloutBox type="warning" title="Current Limitations">
            <p className="text-sm">Sorting and aggregations ($group, $sum) are NOT supported on encrypted fields. Design your schema accordingly.</p>
          </CalloutBox>
          <CalloutBox type="info" title="Contention Factor">
            <p className="text-sm">QE <code>contention</code> (0-16) balances write throughput vs query security. Higher values add "noise" to prevent frequency analysis but increase internal write ops.</p>
          </CalloutBox>
        </div>
      </div>
    ),
    speakerNotes: `This is the practical "what works" slide. Print this for customer conversations.

Key points:
- CSFLE Deterministic: Equality only, but simpler
- CSFLE Random: Maximum security, zero queryability
- QE Equality: Secure equality queries
- QE Range: The breakthrough - range queries on encrypted data

What you CANNOT do on encrypted fields:
- Text search ($text, $regex)
- Sorting (would leak order information)
- Aggregations ($group, $sum, $avg)

Schema design implication:
- Keep sortable/aggregatable fields unencrypted
- Or aggregate on the client side after decryption
- Consider separate analytics store for reporting

Example: salary field
- Encrypt with QE Range for individual lookups
- For "average salary by department" reporting, either:
  - Decrypt and compute client-side, or
  - Maintain a separate, anonymized analytics collection`,
  },
  {
    id: 16,
    title: 'What You Can\'t Do',
    section: 'CSFLE vs QE',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Be upfront with customers">Honest Limitations</SlideTitle>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive">
            <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Not Supported
            </h3>
            <ul className="space-y-3">
              {[
                'Sorting on encrypted fields',
                'Full-text search ($text)',
                'Regex matching ($regex)',
                'Aggregation operators ($group, $sum, $avg)',
                'Array operations on encrypted arrays',
                'Computed fields using encrypted values',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-primary/10 border border-primary">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Workarounds
            </h3>
            <ul className="space-y-3">
              {[
                'Client-side sorting after decryption',
                'Tokenized search on separate field',
                'Pre-computed aggregates (anonymized)',
                'Separate analytics collection',
                'Encrypt array as whole document',
                'Application-layer computed values',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Best Practice:</strong> Design your schema so that sorting, searching, and aggregation
            operations target non-sensitive fields. Encrypt only what needs protection.
          </p>
        </div>
      </div>
    ),
    speakerNotes: `Be honest with customers about limitations. Better they hear it from you than discover it in production.

Not supported:
- Sorting: Would leak order information. If salary is encrypted, you can't "ORDER BY salary"
- Text search: Can't search inside encrypted strings
- Aggregations: Can't compute SUM(salary) when salary is encrypted
- Array ops: Can't $push to encrypted arrays (encrypt whole array instead)

Workarounds:
1. Client-side processing: Fetch encrypted data, decrypt, sort/aggregate in app
2. Tokenization: Store searchable tokens in a separate (hashed) field
3. Pre-computed aggregates: Maintain anonymized summary statistics
4. Hybrid approach: Keep some data unencrypted for analytics

Schema design is key:
- Encrypt sensitive fields only
- Keep operational fields (status, timestamps) unencrypted
- Consider separate read models for analytics

This is where "Day 2" architecture discussions happen.`,
  },
  {
    id: 17,
    title: 'Performance Considerations',
    section: 'CSFLE vs QE',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="What to expect">Performance & Operational Impact</SlideTitle>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <StatCard value="2-3x" label="Storage overhead (Range)" icon={Database} />
          <StatCard value="~10%" label="Write latency increase" icon={Lock} />
          <StatCard value="Monthly" label="Compaction recommended" icon={Server} />
        </div>
        <div className="p-6 rounded-lg bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4">Write Path Overhead</h3>
          <p className="text-muted-foreground mb-4">
            Each insert to an encrypted collection triggers multiple internal writes:
          </p>
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground">User Insert</div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">3+</div>
              <div className="text-sm text-muted-foreground">Internal Writes</div>
            </div>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 mt-4">
            <li>• Main document insert</li>
            <li>• .esc collection update (metadata)</li>
            <li>• .ecoc collection insert (tokens)</li>
            <li>• Additional tokens for Range indexes</li>
          </ul>
        </div>
      </div>
    ),
    speakerNotes: `Performance is always a customer concern. Here are the facts:

Storage:
- QE Range fields: 2-3x overhead (those tokens add up)
- QE Equality: ~1.5x overhead
- CSFLE: Minimal overhead (just encrypted payload)

Write Latency:
- Expect ~10% increase for encrypted inserts
- More fields encrypted = more overhead
- Range indexes add more than equality

Why the overhead?
- Each insert generates multiple internal writes
- Main doc + .esc update + .ecoc insert + range tokens
- This is atomic (transactional) so adds latency

Compaction:
- .ecoc collection grows with each insert
- Periodic compaction reclaims space and improves query perf
- Recommend monthly for active collections
- Can be done online (no downtime)

Sizing guidance:
- Start with 2.5x storage factor for Range fields
- Monitor and adjust based on actual usage
- Consider separate storage tier for encrypted collections`,
  },
  {
    id: 18,
    title: 'KMS Providers & Key Rotation',
    section: 'Operations',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Enterprise key management">Key Rotation with rewrapManyDataKey</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Supported KMS Providers</h3>
            <div className="space-y-3">
              {[
                { name: 'AWS KMS', color: 'text-orange-400' },
                { name: 'Azure Key Vault', color: 'text-blue-400' },
                { name: 'GCP Cloud KMS', color: 'text-green-400' },
                { name: 'KMIP (Thales, etc)', color: 'text-purple-400' },
                { name: 'Local Key (Dev only)', color: 'text-muted-foreground' },
              ].map((kms, i) => (
                <div key={i} className={cn('flex items-center gap-2 p-3 rounded-lg bg-muted/30', kms.color)}>
                  <Key className="w-5 h-5" />
                  <span>{kms.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Key Rotation Flow</h3>
            <CodeBlock
              code={`// 1. Create new CMK in KMS (AWS console/CLI)

// 2. Rewrap all DEKs with new CMK
await clientEncryption.rewrapManyDataKey(
      {}, // filter - empty = all keys
      {
        provider: "aws",
        masterKey: {
          key: "arn:aws:kms:...:key/NEW-KEY-ID",
          region: "us-east-1"
        }
      }
    );

// 3. Retire old CMK after confirmation
// No data re-encryption needed!`}
              language="javascript"
              filename="key-rotation.js"
            />
          </div >
        </div >
        <CalloutBox type="success" title="Zero-Downtime Rotation">
          <p>Key rotation only re-encrypts DEKs, not your actual data.
            A collection with millions of documents can be rotated in seconds.</p>
        </CalloutBox>
      </div >
    ),
    speakerNotes: `Key rotation is a compliance requirement for many customers. Here's how it works.

Supported KMS providers:
- AWS KMS: Most common in production
- Azure Key Vault: Good for Azure-first shops
- GCP Cloud KMS: For Google Cloud customers
- KMIP: For on-prem HSMs or specialized requirements
- Local Key: DEVELOPMENT ONLY - never in production

Key rotation with rewrapManyDataKey():
1. Create new CMK in your KMS (normal KMS operation)
2. Call rewrapManyDataKey() - this re-encrypts all DEKs
3. Retire old CMK after verification

Why it's fast:
- Only re-encrypts DEKs (small documents in Key Vault)
- Actual data remains unchanged
- 1 million documents? Still just re-encrypting a few DEKs

Best practices:
- Rotate CMK annually (or per your compliance requirements)
- Test rotation in staging first
- Keep old CMK around briefly for rollback
- Automate rotation in your CI/CD pipeline`,
  },

  // SECTION 5: Competitive & Sales (Slides 19-23)
  {
    id: 19,
    title: 'Regulatory Alignment',
    section: 'Compliance',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Mapping features to requirements">Compliance Coverage</SlideTitle>
        <ComparisonTable
          headers={['Requirement', 'Regulation', 'MongoDB Feature', 'Evidence']}
          rows={[
            ['Encrypt personal data', 'GDPR Art. 32', 'CSFLE/QE', 'Field-level encryption'],
            ['Right to erasure', 'GDPR Art. 17', '1 DEK per user', 'Crypto-shredding'],
            ['Encrypt ePHI', 'HIPAA', 'CSFLE on PHI fields', 'BSON Subtype 6'],
            ['Encrypt cardholder data', 'PCI-DSS Req 3', 'QE for PAN', 'Searchable encryption'],
            ['Audit trail', 'SOX', 'KMS audit logs', 'CloudTrail, Azure logs'],
            ['Access controls', 'All', 'RBAC + encryption', 'Defense in depth'],
          ]}
        />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <CalloutBox type="info" title="Compliance != Security">
            <p className="text-sm">Encryption helps with compliance audits, but real security requires a holistic approach: network, access controls, and monitoring.</p>
          </CalloutBox>
          <CalloutBox type="success" title="Audit-Ready">
            <p className="text-sm">KMS providers offer comprehensive audit logs. Every key access is logged with timestamp, identity, and operation.</p>
          </CalloutBox>
        </div>
      </div>
    ),
    speakerNotes: `This slide maps CSFLE/QE features to specific regulatory requirements.

For GDPR:
- Article 32: Encrypt personal data → CSFLE/QE
- Article 17: Right to erasure → 1 DEK per user pattern

For HIPAA:
- ePHI must be encrypted → CSFLE on patient name, SSN, diagnosis
- Access controls → RBAC + field-level encryption

For PCI-DSS:
- Encrypt cardholder data → QE enables searchable encrypted PANs
- Key management → KMS integration

For SOX:
- Audit trail → KMS providers log every key operation
- CloudTrail (AWS), Azure Monitor, GCP Audit Logs

Key message: Encryption is one layer of defense. Customers still need network security, access controls, monitoring, etc.

Auditor conversations:
- "Show me the encryption" → BSON Subtype 6 in documents
- "Show me key management" → KMS audit logs
- "Show me access controls" → RBAC + field-level separation`,
  },
  {
    id: 20,
    title: 'Competitive Landscape',
    section: 'Competition',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Know your competition">How We Differentiate</SlideTitle>
        <ComparisonTable
          headers={['Feature', 'MongoDB QE', 'Oracle TDE', 'Cosmos DB', 'PostgreSQL']}
          rows={[
            [
              'Encryption Level',
              <span key="1" className="text-primary font-semibold">Field-level</span>,
              'Column/Tablespace',
              'Property-level',
              'Column',
            ],
            [
              'Client-Side',
              <CheckCircle key="2" className="w-5 h-5 text-primary" />,
              <XCircle key="3" className="w-5 h-5 text-destructive" />,
              <CheckCircle key="4" className="w-5 h-5 text-primary" />,
              <XCircle key="5" className="w-5 h-5 text-destructive" />,
            ],
            [
              'Range Queries',
              <CheckCircle key="6" className="w-5 h-5 text-primary" />,
              <span key="7" className="text-muted-foreground">N/A (unencrypted)</span>,
              <XCircle key="8" className="w-5 h-5 text-destructive" />,
              <XCircle key="9" className="w-5 h-5 text-destructive" />,
            ],
            [
              'Random Encryption',
              <CheckCircle key="10" className="w-5 h-5 text-primary" />,
              <span key="11" className="text-muted-foreground">N/A</span>,
              <span key="12" className="text-muted-foreground">Deterministic only</span>,
              <span key="13" className="text-muted-foreground">N/A</span>,
            ],
            [
              'Server Sees Plaintext',
              <span key="14" className="text-primary font-semibold">Never</span>,
              <span key="15" className="text-destructive">Yes (decrypts in memory)</span>,
              <span key="16" className="text-primary font-semibold">Never</span>,
              <span key="17" className="text-destructive">Yes</span>,
            ],
          ]}
        />
        <div className="mt-6 p-4 rounded-lg bg-card border border-primary">
          <h4 className="font-semibold text-primary mb-2">Key Differentiators:</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>vs TDE:</strong> Server never sees plaintext - true zero-trust</li>
            <li>• <strong>vs Cosmos DB:</strong> Range queries + random encryption (Cosmos is deterministic-only)</li>
            <li>• <strong>vs PostgreSQL:</strong> Client-side encryption with searchability</li>
          </ul>
        </div>
      </div>
    ),
    speakerNotes: `Competitive positioning - know this for customer conversations.

vs Oracle TDE (Transparent Data Encryption):
- TDE encrypts at rest, but DECRYPTS IN MEMORY for queries
- Database admins can see plaintext
- "Encryption at rest" ≠ protection from insider threats
- MongoDB: Server NEVER sees plaintext - true zero-trust

vs Azure Cosmos DB:
- Cosmos has "Always Encrypted" but deterministic only
- Same input = same ciphertext (pattern leakage)
- No range queries on encrypted data
- MongoDB QE: Random encryption + range queries

vs PostgreSQL (column encryption):
- Server-side encryption - decrypts for processing
- No built-in KMS integration
- Limited query capability on encrypted data

Key message: MongoDB is the only document database with client-side searchable encryption that supports range queries while maintaining true zero-trust (server never sees plaintext).`,
  },
  {
    id: 21,
    title: 'Discovery Questions',
    section: 'Sales',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Uncover requirements">Customer Discovery</SlideTitle>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Security Questions</h3>
            {[
              'What data classifications do you have? (PII, PHI, PCI)',
              'Who should NOT be able to see sensitive data?',
              'Do you have insider threat concerns?',
              'What\'s your key management strategy today?',
            ].map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border text-sm">
                {q}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Compliance Questions</h3>
            {[
              'Which regulations apply? (GDPR, HIPAA, PCI, SOX)',
              'Have you had any audit findings on encryption?',
              'Do you need to support "Right to be Forgotten"?',
              'What are your data residency requirements?',
            ].map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border text-sm">
                {q}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary">
          <h4 className="font-semibold mb-2">Pro Tip: The "DBA Admin" Question</h4>
          <p className="text-sm">
            Ask: "Should your database administrators be able to see customer SSNs or credit card numbers?"
            The answer is almost always "No" - which immediately positions client-side encryption.
          </p>
        </div>
      </div>
    ),
    speakerNotes: `Discovery questions to uncover encryption requirements.

Security questions:
- Data classification helps identify what needs encryption
- "Who should NOT see data" identifies insider threat concerns
- Key management questions reveal maturity level

Compliance questions:
- Regulations drive requirements
- Audit findings indicate urgency
- Right to be Forgotten = crypto-shredding opportunity
- Data residency may require regional KMS

The killer question:
"Should your database administrators be able to see customer SSNs?"

The answer is almost always "No" - and that's where client-side encryption becomes essential. TDE doesn't help because DBAs can still see decrypted data.

This question separates "encryption at rest" conversations from true data protection.`,
  },
  {
    id: 22,
    title: 'Objection Handling',
    section: 'Sales',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Prepare for pushback">Common Objections</SlideTitle>
        <div className="space-y-4">
          {[
            {
              objection: '"We already have encryption at rest"',
              response: 'TDE encrypts on disk but decrypts in memory. Your DBAs can still see plaintext. CSFLE ensures the server NEVER sees plaintext.',
            },
            {
              objection: '"This will slow down our queries"',
              response: 'QE adds ~10% latency for encrypted operations. But you\'re trading that for zero-trust security. Also, you only encrypt sensitive fields - not everything.',
            },
            {
              objection: '"We can\'t search encrypted data"',
              response: 'That was true until QE. Now you can do equality AND range queries on encrypted fields. What specific search patterns do you need?',
            },
            {
              objection: '"It\'s too complex to implement"',
              response: 'Automatic encryption uses a schema definition - your app code doesn\'t change. We have working labs that take 15 minutes each (Lab 1, Lab 2, and Lab 3).',
            },
            {
              objection: '"Our compliance team is fine with TDE"',
              response: 'Ask them about insider threats. GDPR specifically mentions protection against unauthorized access - including internal users.',
            },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <div className="font-semibold text-destructive mb-2">"{item.objection}"</div>
              <div className="text-sm text-primary">→ {item.response}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Know these objections and responses.

"We have TDE already"
- TDE is encryption at rest, not in use
- DBAs see plaintext during query processing
- Doesn't protect against insider threats

"Too slow"
- Yes, there's overhead (~10%)
- But you're protecting against data breaches
- Only encrypt sensitive fields
- Security vs. speed is a business decision

"Can't search"
- This WAS true for random encryption
- QE changes the game with searchable encryption
- Equality + Range queries now possible

"Too complex"
- Automatic encryption: define schema, done
- Labs take 45-45-30 minutes (120 min total)
- We have reference architectures

"Compliance is OK with TDE"
- Involve their security team
- Ask about insider threat scenarios
- GDPR mentions unauthorized access (internal too)

The key: Don't argue features. Understand their specific concerns and address those.`,
  },
  {
    id: 23,
    title: 'When NOT to Use',
    section: 'Sales',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Be honest about fit">Anti-Patterns & Bad Fits</SlideTitle>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive">
            <h3 className="text-lg font-semibold text-destructive mb-4">Don't Use When...</h3>
            <ul className="space-y-3">
              {[
                'Heavy aggregations on encrypted fields',
                'Full-text search requirements on sensitive data',
                'Sorting is critical on encrypted fields',
                'Sub-millisecond latency requirements',
                'Legacy apps that can\'t be modified',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-primary/10 border border-primary">
            <h3 className="text-lg font-semibold text-primary mb-4">Consider Instead...</h3>
            <ul className="space-y-3">
              {[
                'Client-side aggregation for analytics',
                'Tokenized search with separate index',
                'Application-layer sorting after decrypt',
                'Accept latency for security trade-off',
                'Incremental migration path',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <CalloutBox type="warning" title="Honest Qualification">
          <p>If a customer needs real-time aggregations or full-text search on the encrypted fields themselves,
            CSFLE/QE may not be the right fit. Better to be honest than have a failed implementation.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `Be honest about when NOT to use CSFLE/QE. This builds trust.

Bad fits:
- Heavy aggregations: SUM, AVG, GROUP BY on encrypted fields won't work
- Full-text search: Can't search inside encrypted strings
- Critical sorting: Can't ORDER BY encrypted fields
- Ultra-low latency: The 10% overhead may be unacceptable
- Immutable legacy apps: If code can't change, automatic encryption won't help

Workarounds to discuss:
- Aggregation: Client-side compute after decryption, or separate analytics store
- Search: Tokenized/hashed search field alongside encrypted field
- Sorting: Application-layer sort, or keep sort key unencrypted
- Latency: Usually acceptable trade-off when you frame as security vs speed
- Legacy: Incremental migration, proxy layer, or accept TDE

The key: Qualify early. A failed POC is worse than a declined engagement.`,
  },
  {
    id: 24,
    title: 'Labs Overview',
    section: 'Labs',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Hands-on time">Three Labs (120 min total)</SlideTitle>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              title: 'Lab 1: CSFLE Fundamentals',
              time: '45 min',
              topics: ['AWS KMS setup', 'Automatic encryption', 'crypt_shared debugging', 'BSON Subtype 6 verification'],
              difficulty: 'Intermediate',
            },
            {
              title: 'Lab 2: Queryable Encryption',
              time: '45 min',
              topics: ['Range query on salary', 'Inspect .esc/.ecoc', 'Profiler analysis', 'DEK per field verification'],
              difficulty: 'Advanced',
            },
            {
              title: 'Lab 3: Migration & Multi-Tenant',
              time: '30 min',
              topics: ['Data migration patterns', 'Per-tenant key isolation', 'Key rotation procedures', 'Multi-tenant verification'],
              difficulty: 'Advanced',
            },
          ].map((lab, i) => (
            <div key={i} className="p-6 rounded-lg bg-card border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-2">{lab.time}</div>
              <h3 className="text-lg font-semibold mb-3">{lab.title}</h3>
              <ul className="space-y-2 mb-4">
                {lab.topics.map((topic, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    {topic}
                  </li>
                ))}
              </ul>
              <div className="text-xs font-medium text-primary">{lab.difficulty}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Here are the three hands-on labs you'll complete after this presentation.

Lab 1: CSFLE Fundamentals (15 min)
- Set up AWS KMS integration
- Implement automatic encryption
- Intentionally break crypt_shared to learn debugging
- Verify encrypted data in Atlas

Lab 2: Queryable Encryption (15 min)
- Implement equality queries on encrypted fields
- Actually explore the .esc and .ecoc collections
- Understand how QE stores metadata
- Verify DEK-per-field requirement

Lab 3: Migration & Multi-Tenant Patterns (15 min)
- Migrate plaintext data to encrypted format
- Implement per-tenant key isolation using KeyAltNames
- Perform key rotation procedures
- Verify multi-tenant data isolation

Total hands-on time: 120 minutes (2 hours)
Each lab is self-paced with step-by-step instructions and checkpoints.`,
  },
  {
    id: 25,
    title: 'Wrap-Up & Resources',
    section: 'Conclusion',
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Key Takeaways</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Remember These Points:</h3>
            <BulletList
              items={[
                'CSFLE = deterministic + equality queries',
                'QE = randomized + range queries',
                'QE requires separate DEK per field',
                '2-3x storage for Range indexes',
                '.esc and .ecoc need periodic compaction',
                '1 DEK per user = crypto-shredding',
              ]}
              icon={CheckCircle}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Resources:</h3>
            <div className="space-y-2">
              {[
                { label: 'CSFLE Docs', url: 'docs.mongodb.com/csfle' },
                { label: 'QE Docs', url: 'docs.mongodb.com/qe' },
                { label: 'MongoDB University', url: 'university.mongodb.com' },
                { label: 'Security Whitepaper', url: 'mongodb.com/security' },
              ].map((resource, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between">
                  <span>{resource.label}</span>
                  <span className="text-xs font-mono text-muted-foreground">{resource.url}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center p-8 rounded-lg bg-primary/10 border border-primary">
          <h3 className="text-2xl font-bold text-primary mb-2">Questions?</h3>
          <p className="text-muted-foreground">Let's discuss before moving to the hands-on labs!</p>
        </div>
      </div>
    ),
    speakerNotes: `Final slide - summarize and open for questions.

Key takeaways to reinforce:
1. CSFLE vs QE choice depends on query requirements
2. QE is more secure (randomized) but has overhead
3. The DEK-per-field requirement for QE is critical
4. Storage planning must account for 2-3x overhead
5. Compaction is an operational requirement
6. Crypto-shredding enables GDPR compliance

Resources:
- Official docs are the source of truth
- MongoDB University has free courses
- Security whitepaper for auditor conversations

Before labs:
- Any questions on the architecture?
- Any specific customer scenarios to discuss?
- Clarifications on CSFLE vs QE choice?

Then transition to Lab 1.`,
  },
];
