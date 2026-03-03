import { ReactNode, useContext } from 'react';
import { CodeBlock } from '@/components/ui/code-block';
import {
  Shield, Lock, Database, Key, AlertTriangle, CheckCircle,
  XCircle, Cloud, Server, Users, Building, Gamepad2, Target,
  BarChart3, RefreshCw, FileCheck, HelpCircle, BookOpen,
  Zap, ArrowRight, Layers, FileText, FileLock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RevealStep, RevealStepContext } from './RevealStep';
import { ArchitectureDiagram } from '@/components/workshop/ArchitectureDiagram';
import { CSFLEArchitectureDiagram, QEArchitectureDiagram, CryptoShreddingDiagram, type CSFLEHighlightStep, type QEHighlightStep } from '@/components/labs/LabArchitectureDiagrams';

export interface SlideData {
  id: number;
  title: string;
  section: string;
  sectionNumber: number;
  content: ReactNode;
  /** When set, content can use RevealStep; Next/Previous advance step-by-step within the slide first. */
  stepCount?: number;
  speakerNotes: string;
  // For PPTX export
  exportContent: {
    title: string;
    subtitle?: string;
    bullets?: string[];
    table?: { headers: string[]; rows: string[][] };
    notes: string;
  };
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

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 mb-6">
      <span className="text-primary font-mono font-bold">{number}</span>
      <span className="text-primary font-semibold uppercase tracking-wider text-sm">{title}</span>
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

function UseCaseCard({ icon, title, items, regulation }: { icon: string; title: string; items: string[]; regulation: string }) {
  return (
    <div className="p-6 rounded-lg bg-card border border-border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 mb-4">
        {items.map((item, j) => (
          <li key={j} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>
      <div className="text-xs font-mono text-muted-foreground">{regulation}</div>
    </div>
  );
}

/** Horizontal envelope flow: CMK → Encrypts → DEK → Encrypts → Plain text → Creates → Cipher text. 0 = no highlight, 1 = CMK, 2 = DEK, 3 = Data */
function EnvelopeEncryptionDiagram({ highlightStep = 0 }: { highlightStep?: 0 | 1 | 2 | 3 }) {
  const dim = (step: number) => (highlightStep > 0 && highlightStep !== step ? 0.25 : 1);
  const focused = (step: number) => highlightStep === step;
  const node = (step: number, icon: ReactNode, title: string, subtitle: string) => (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-xl text-center min-w-[120px] max-w-[160px] transition-all duration-300 border-2',
        focused(step) ? 'bg-primary/20 border-primary ring-2 ring-primary/50' : 'bg-card border-border',
        dim(step) < 1 && 'opacity-25'
      )}
      style={highlightStep > 0 ? { opacity: dim(step) } : undefined}
    >
      <div className={cn('mb-2', focused(step) ? 'text-primary' : 'text-foreground')}>{icon}</div>
      <div className={cn('font-bold text-sm', focused(step) ? 'text-primary' : 'text-foreground')}>{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </div>
  );
  const arrow = (label: string, opacity?: number) => (
    <div className="flex flex-col items-center justify-center px-2 shrink-0" style={opacity !== undefined ? { opacity } : undefined}>
      <ArrowRight className="w-8 h-8 text-green-500 shrink-0" />
      <span className="text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">{label}</span>
    </div>
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 my-6 px-2">
      {node(1, <Key className="w-10 h-10" />, 'Customer Master Key (CMK)', 'KMS · never leaves HSM')}
      {arrow('Encrypts', dim(2))}
      {node(2, <Lock className="w-10 h-10" />, 'Data Encryption Key (DEK)', 'Stored encrypted in Key Vault')}
      {arrow('Encrypts', dim(3))}
      {node(3, <FileText className="w-10 h-10 text-green-600 dark:text-green-400" />, 'Plain text', 'Your sensitive data')}
      {arrow('Creates', dim(3))}
      {node(3, <FileLock className="w-10 h-10 text-primary" />, 'Cipher text', 'Encrypted · stored in MongoDB')}
    </div>
  );
}

function EnvelopeSlideWithSteps() {
  const { stepIndex } = useContext(RevealStepContext);
  const highlightStep: 0 | 1 | 2 | 3 = stepIndex >= 1 && stepIndex <= 3 ? (stepIndex as 1 | 2 | 3) : 0;
  const tooltips: Record<number, string> = {
    1: 'The root key. Lives only in your KMS. Used only to wrap and unwrap DEKs.',
    2: 'Each DEK is encrypted by the CMK and stored in MongoDB. The driver unwraps DEKs to encrypt/decrypt your data.',
    3: 'Field values are encrypted in application memory with the DEK; only ciphertext is sent to and stored in MongoDB.',
  };
  return (
    <div>
      <EnvelopeEncryptionDiagram highlightStep={highlightStep} />
      {stepIndex >= 1 && stepIndex <= 3 && (
        <div className="mt-4 p-4 rounded-xl border-2 border-primary bg-primary/10 text-center max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">{tooltips[stepIndex]}</p>
        </div>
      )}
    </div>
  );
}

const CSFLE_STEP_TOOLTIPS: Record<number, { title: string; body: string }> = {
  1: {
    title: '1. Your Application',
    body: 'Plaintext data (e.g. name, SSN) before encryption. The application sends documents to the driver.',
  },
  2: {
    title: '2. MongoDB Driver + libmongocrypt',
    body: 'To encrypt, the driver first needs a DEK. It will fetch the encrypted DEK from the Key Vault and unwrap it using the CMK from KMS, then use the DEK to encrypt fields before data leaves the app. MongoDB never sees plaintext.',
  },
  3: {
    title: '3. AWS KMS – Customer Master Key (CMK)',
    body: 'The driver uses the CMK in KMS to unwrap (decrypt) the DEK. The CMK never leaves KMS. You control access.',
  },
  4: {
    title: '4. Key Vault (encryption.__keyVault)',
    body: 'The driver fetches the encrypted DEK from the Key Vault collection. After unwrapping via KMS, it uses the DEK to encrypt or decrypt field values.',
  },
  5: {
    title: '5. MongoDB Atlas',
    body: 'The driver sends only ciphertext to Atlas. It writes after encrypting with the DEK; on read, it decrypts with the DEK before returning to the application. Database and backups never contain plaintext.',
  },
};

/** Map narrative order (1 App, 2 Driver, 3 KMS, 4 Key Vault, 5 Atlas) to diagram box indices (1 App, 2 Driver, 3 Atlas, 4 KMS, 5 Key Vault). */
function csfleStepToDiagramHighlight(stepIndex: number): CSFLEHighlightStep {
  if (stepIndex < 1 || stepIndex > 5) return 0;
  const map: Record<number, CSFLEHighlightStep> = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 3 };
  return map[stepIndex];
}

function CSFLEDiagramWithTooltips() {
  const { stepIndex } = useContext(RevealStepContext);
  const highlightStep = csfleStepToDiagramHighlight(stepIndex);
  const tooltip = stepIndex >= 1 && stepIndex <= 5 ? CSFLE_STEP_TOOLTIPS[stepIndex] : null;
  return (
    <div className="relative">
      <CSFLEArchitectureDiagram className="max-w-full" highlightStep={highlightStep} />
      {tooltip && (
        <div
          className={cn(
            'mt-4 p-4 rounded-xl border-2 bg-card text-left',
            stepIndex === 1 && 'border-primary bg-primary/10',
            stepIndex === 2 && 'border-border',
            stepIndex === 3 && 'border-amber-500/50 bg-amber-500/10',
            stepIndex === 4 && 'border-violet-500/50 bg-violet-500/10',
            stepIndex === 5 && 'border-border'
          )}
        >
          <h4 className="font-semibold mb-1">{tooltip.title}</h4>
          <p className="text-sm text-muted-foreground">{tooltip.body}</p>
        </div>
      )}
    </div>
  );
}

const QE_STEP_TOOLTIPS: Record<number, { title: string; body: string; takeaway?: string }> = {
  1: {
    title: '1. Query from client',
    body: 'Client sends e.g. find({ ssn: "S1234567C" }). Plaintext never leaves the client.',
    takeaway: 'Plaintext stays in your environment.',
  },
  2: {
    title: '2. Driver + KMS → cryptographic token',
    body: 'Driver gets keys from your KMS, produces a token for the query value. Server can match it without seeing plaintext.',
    takeaway: 'Token = encrypted representation of the search value.',
  },
  3: {
    title: '3. Token to server; 4. Server search',
    body: 'Token goes to MongoDB. Server searches encrypted indexes (equality, range, prefix, suffix). Returns encrypted results.',
    takeaway: 'Server processes ciphertext only.',
  },
  4: {
    title: '5. Results back; 6. Decrypt to client',
    body: 'Encrypted results return; driver decrypts for the app. .esc/.ecoc store encrypted metadata.',
    takeaway: 'Stored, transmitted, processed, and queried as ciphertext. Server never sees plaintext.',
  },
};

function QEPlaintextVsCiphertextStrip() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
      <div className="rounded-lg border border-border bg-card/50 p-3">
        <div className="font-semibold text-primary mb-2">Client view (plaintext)</div>
        <pre className="font-mono text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">{'{ "payer": "Acme", "ssn": "S1234567C", "email": "j@ex.com" }'}</pre>
      </div>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Server view (ciphertext)</div>
        <pre className="font-mono text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">{'{ "payer": "Acme", "ssn": "r6EaUcgZ...", "email": "iu233oh..." }'}</pre>
      </div>
    </div>
  );
}

function QEDiagramWithTooltips() {
  const { stepIndex } = useContext(RevealStepContext);
  const highlightStep: QEHighlightStep = stepIndex >= 1 && stepIndex <= 4 ? (stepIndex as QEHighlightStep) : 0;
  const tooltip = stepIndex >= 1 && stepIndex <= 4 ? QE_STEP_TOOLTIPS[stepIndex] : null;
  return (
    <div className="relative">
      <QEArchitectureDiagram className="max-w-full" highlightStep={highlightStep} />
      {tooltip && (
        <div
          className={cn(
            'mt-4 p-4 rounded-xl border-2 bg-card text-left',
            stepIndex === 1 && 'border-primary bg-primary/10',
            stepIndex === 2 && 'border-border',
            stepIndex === 3 && 'border-border',
            stepIndex === 4 && 'border-amber-500/50 bg-amber-500/10'
          )}
        >
          <h4 className="font-semibold mb-1">{tooltip.title}</h4>
          <p className="text-sm text-muted-foreground">{tooltip.body}</p>
          {tooltip.takeaway && (
            <p className="text-sm font-medium text-primary mt-2 border-t border-border pt-2">{tooltip.takeaway}</p>
          )}
        </div>
      )}
      {stepIndex >= 1 && <QEPlaintextVsCiphertextStrip />}
    </div>
  );
}

// 24 slides: CSFLE and QE on separate pages with step reveal; Envelope one container at a time
export const pptxSlides: SlideData[] = [
  // Slide 1: Title
  {
    id: 1,
    title: 'Client-Side Field Level Encryption & Queryable Encryption',
    section: 'Title',
    sectionNumber: 0,
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto glow-green">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gradient-green">
            Client-Side Field Level Encryption
          </h1>
          <h2 className="text-3xl font-semibold mb-2">& Queryable Encryption</h2>
          <p className="text-xl text-muted-foreground mt-6">Protecting Sensitive Data at the Application Layer</p>
          <p className="text-lg text-primary mt-4">SA Enablement Session</p>
        </div>
      </div>
    ),
    speakerNotes: `Welcome to the CSFLE & Queryable Encryption SA Enablement Session.

By the end of this session, you'll be able to:
- Confidently discuss encryption solutions with customers
- Identify encryption opportunities during discovery
- Demo the technology and handle objections
- Guide implementations for CSFLE and QE`,
    exportContent: {
      title: 'Client-Side Field Level Encryption & Queryable Encryption',
      subtitle: 'Protecting Sensitive Data at the Application Layer\nSA Enablement Session',
      notes: 'Welcome to the CSFLE & Queryable Encryption SA Enablement Session.',
    },
  },

  // Slide 2: Agenda
  {
    id: 2,
    title: "Today's Session",
    section: 'Agenda',
    sectionNumber: 0,
    stepCount: 5,
    content: (
      <div className="max-w-3xl mx-auto">
        <RevealStep step={0}>
          <SlideTitle>Today's Session</SlideTitle>
        </RevealStep>
        <div className="grid grid-cols-2 gap-4">
          {[
            { num: '01', title: 'The Challenge', desc: 'Why customers need this' },
            { num: '02', title: 'Use Cases', desc: 'Where this wins deals' },
          ].map((item, i) => (
            <RevealStep key={i} step={1}>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold text-primary">{item.num}</div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </RevealStep>
          ))}
          {[
            { num: '03', title: 'Architecture Deep Dive', desc: 'How it works under the hood' },
            { num: '04', title: 'CSFLE vs Queryable Encryption', desc: 'When to use which' },
          ].map((item, i) => (
            <RevealStep key={i} step={2}>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold text-primary">{item.num}</div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </RevealStep>
          ))}
          {[
            { num: '05', title: 'Key Management & KMS', desc: 'Envelope encryption, rotation' },
            { num: '06', title: 'Competitive Positioning', desc: 'vs Oracle, PostgreSQL, cloud DBs' },
          ].map((item, i) => (
            <RevealStep key={i} step={3}>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold text-primary">{item.num}</div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </RevealStep>
          ))}
          {[
            { num: '07', title: 'Discovery & Objection Handling', desc: 'Questions to ask, FAQs' },
            { num: '08', title: 'Hands-On Lab', desc: '3 Labs with AWS KMS' },
          ].map((item, i) => (
            <RevealStep key={i} step={4}>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="text-2xl font-bold text-primary">{item.num}</div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </RevealStep>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Here's our agenda for this session. We'll cover the business case, technical architecture, hands-on labs, and sales enablement.`,
    exportContent: {
      title: "Today's Session",
      bullets: [
        '01 The Challenge - Why customers need this',
        '02 Use Cases - Where this wins deals',
        '03 Architecture Deep Dive - How it works',
        '04 CSFLE vs Queryable Encryption - When to use which',
        '05 Key Management & KMS - Envelope encryption, rotation',
        '06 Competitive Positioning - vs Oracle, PostgreSQL, cloud DBs',
        '07 Discovery & Objection Handling - Questions to ask, FAQs',
        '08 Hands-On Lab - 3 Labs with AWS KMS',
      ],
      notes: "Here's our agenda for this session.",
    },
  },

  // Slide 3: The Challenge
  {
    id: 3,
    title: 'The Challenge',
    section: 'The Challenge',
    sectionNumber: 1,
    stepCount: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SectionHeader number="01" title="The Challenge" />
          <SlideTitle subtitle="Why customers need this">Why Should You Care?</SlideTitle>
        </RevealStep>
        <RevealStep step={1}>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <StatCard value="$4.88M" label="Average breach cost" icon={AlertTriangle} />
            <StatCard value="277 days" label="To identify & contain" icon={BarChart3} />
          </div>
        </RevealStep>
        <RevealStep step={2}>
          <div className="p-6 rounded-lg bg-card border border-border mb-6">
            <h3 className="font-semibold text-lg mb-3">The Encryption Gap</h3>
            <p className="text-muted-foreground">
              Traditional encryption protects data at rest and in transit. But DBAs, cloud admins,
              and backup systems still see plaintext. When the database is compromised, so is your data.
            </p>
          </div>
        </RevealStep>
        <RevealStep step={3}>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Customer triggers to listen for:
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                "We're moving to cloud but security won't approve"
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                "Our DBAs shouldn't see PII"
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                "We need to meet GDPR / HIPAA / PCI-DSS"
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                "Insider threat is a board-level concern"
              </li>
            </ul>
          </div>
        </RevealStep>
      </div>
    ),
    speakerNotes: `The average data breach costs $4.88M and takes 277 days to identify and contain.

The key insight is the "encryption gap" - traditional encryption (TDE) still exposes data to anyone with database access.

Listen for these customer triggers:
- Cloud migration blockers
- DBA access concerns
- Compliance requirements
- Insider threat discussions`,
    exportContent: {
      title: 'The Challenge - Why Should You Care?',
      bullets: [
        '$4.88M average breach cost',
        '277 days to identify & contain',
        'The encryption gap: Traditional encryption still exposes data to DBAs, cloud admins, backup systems',
        'Customer triggers: Cloud migration blockers, DBA access concerns, Compliance, Insider threats',
      ],
      notes: 'The average data breach costs $4.88M and takes 277 days to identify and contain.',
    },
  },

  // Slide 4: Use Cases
  {
    id: 4,
    title: 'Use Cases',
    section: 'Use Cases',
    sectionNumber: 2,
    stepCount: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SectionHeader number="02" title="Use Cases" />
          <SlideTitle>Where This Wins Deals</SlideTitle>
        </RevealStep>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <RevealStep step={1}>
            <UseCaseCard
              icon="🏥"
              title="Healthcare"
              items={['PHI protection, HIPAA compliance', 'Patient records encryption', 'SSN, DOB, diagnosis codes']}
              regulation="HIPAA"
            />
          </RevealStep>
          <RevealStep step={2}>
            <UseCaseCard
              icon="💳"
              title="Financial Services"
              items={['PCI-DSS compliance', 'Account numbers, balances', 'Trading data privacy']}
              regulation="PCI-DSS, SOX"
            />
          </RevealStep>
          <RevealStep step={3}>
            <UseCaseCard
              icon="🎰"
              title="Gaming & Gambling"
              items={['Regulatory compliance', 'Fraud detection', 'Player privacy, betting patterns']}
              regulation="Gaming Regulations"
            />
          </RevealStep>
        </div>
        <RevealStep step={4}>
          <CalloutBox type="info" title="Common Thread">
            <p>Separation of duties between app owners and infrastructure operators</p>
          </CalloutBox>
        </RevealStep>
      </div>
    ),
    speakerNotes: `These are the industries where CSFLE/QE wins deals.

Healthcare: HIPAA requires encryption of ePHI. Perfect for patient records.

Financial Services: PCI-DSS requires encryption of cardholder data.

Gaming: Often overlooked but handles massive payment data and regulatory requirements.

The common thread is separation of duties - the infrastructure team shouldn't see the data.`,
    exportContent: {
      title: 'Use Cases - Where This Wins Deals',
      bullets: [
        'Healthcare: PHI, HIPAA, patient records, SSN/DOB',
        'Financial Services: PCI-DSS, account numbers, trading data',
        'Gaming & Gambling: Regulatory compliance, player privacy',
        'Common thread: Separation of duties between app owners and infrastructure operators',
      ],
      notes: 'These are the industries where CSFLE/QE wins deals.',
    },
  },

  // Slide 5: The Solution
  {
    id: 5,
    title: 'The Solution',
    section: 'Architecture',
    sectionNumber: 3,
    stepCount: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SectionHeader number="03" title="Architecture" />
          <SlideTitle>Client-Side Encryption</SlideTitle>
        </RevealStep>
        <RevealStep step={1}>
          <div className="p-6 rounded-lg bg-primary/10 border border-primary mb-6">
            <h3 className="font-bold text-xl mb-2">The Core Principle</h3>
            <p className="text-lg">Data is encrypted by the application <strong>BEFORE</strong> it reaches MongoDB. The database never sees plaintext for protected fields.</p>
          </div>
        </RevealStep>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <RevealStep step={2}>
            <div className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Who can't see the data:
              </h4>
              <ul className="space-y-2">
                {['Database Admins', 'Cloud Operators', 'Backup Systems', 'Network Sniffers'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </RevealStep>
          <RevealStep step={3}>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  CSFLE
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Deterministic or random encryption. Equality queries only. Available since MongoDB 4.2.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-primary">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Queryable Encryption
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Equality, range, prefix, suffix queries. Stronger security. GA in MongoDB 8.0.
                </p>
              </div>
            </div>
          </RevealStep>
        </div>
      </div>
    ),
    speakerNotes: `The core principle: data is encrypted BEFORE reaching MongoDB.

Who can't see the data: DBAs, cloud operators, backup systems, network sniffers.

Two approaches:
- CSFLE: Mature, since 4.2, deterministic or random encryption
- Queryable Encryption: New in 8.0, supports range queries, always randomized`,
    exportContent: {
      title: 'The Solution - Client-Side Encryption',
      bullets: [
        'Core Principle: Data encrypted by application BEFORE reaching MongoDB',
        "Who can't see data: DBAs, Cloud Operators, Backup Systems, Network Sniffers",
        'CSFLE: Deterministic/random encryption, equality queries, MongoDB 4.2+',
        'Queryable Encryption: Range queries, stronger security, MongoDB 8.0 GA',
      ],
      notes: 'The core principle: data is encrypted BEFORE reaching MongoDB.',
    },
  },

  // Slide 6: Architecture
  {
    id: 6,
    title: 'Architecture',
    section: 'Architecture',
    sectionNumber: 3,
    stepCount: 3,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SlideTitle subtitle="How encryption flows through the system">MongoDB Encryption Architecture</SlideTitle>
          <ArchitectureDiagram variant="overview" />
        </RevealStep>
        <RevealStep step={1}>
          <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/30 mt-4">
            <h4 className="font-semibold mb-1">Key Vault collection</h4>
            <p className="text-sm text-muted-foreground">
              Encrypted DEKs are stored in a MongoDB collection. The driver fetches and unwraps them via KMS to encrypt/decrypt your data.
            </p>
          </div>
        </RevealStep>
        <RevealStep step={2}>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary mt-4">
            <h4 className="font-semibold mb-1">Customer-controlled keys</h4>
            <p className="text-sm text-muted-foreground">
              You keep the master keys. Even MongoDB/Atlas can never see your plaintext data.
            </p>
          </div>
        </RevealStep>
      </div>
    ),
    speakerNotes: `MongoDB Encryption Architecture:
1. Your environment: Application → MongoDB Driver → libmongocrypt (all crypto). For automatic encryption, crypt_shared (recommended) or mongocryptd does query analysis.
2. Cloud: KMS holds CMK; Key Vault collection stores encrypted DEKs; MongoDB Atlas stores ciphertext only.
3. Key talking point: "You keep the master keys. Even MongoDB/Atlas can never see your plaintext data."`,
    exportContent: {
      title: 'MongoDB Encryption Architecture',
      bullets: [
        'Your environment: Application, Driver, libmongocrypt (crypto), crypt_shared/mongocryptd (automatic encryption: query analysis only)',
        'MongoDB: Stores ciphertext only, never sees plaintext',
        'KMS Provider: AWS/Azure/GCP/KMIP stores master key',
        'Key Vault: Stores encrypted DEKs',
        'Customer-controlled keys: Even MongoDB/Atlas never sees plaintext',
      ],
      notes: 'Architecture shows encryption at the application layer; crypt_shared or mongocryptd for automatic encryption query analysis.',
    },
  },

  // Slide 13: Envelope Encryption – after Architecture, before How CSFLE (key concept first)
  {
    id: 13,
    title: 'Envelope Encryption',
    section: 'Architecture',
    sectionNumber: 3,
    stepCount: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SectionHeader number="03" title="Architecture" />
        <RevealStep step={0}>
          <SlideTitle subtitle="Keys are layered: CMK wraps DEKs; DEKs encrypt your data">Envelope Encryption</SlideTitle>
          <p className="text-sm text-muted-foreground text-center mb-4">Click Next to highlight each layer. All three are always visible.</p>
        </RevealStep>
        <RevealStep step={1}>
          <div className="mt-2">
            <EnvelopeSlideWithSteps />
          </div>
        </RevealStep>
        <RevealStep step={4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-semibold text-sm mb-2">Why Envelope Encryption?</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• CMK rotation only re-wraps DEKs; no need to re-encrypt data</li>
                <li>• Different DEKs for different classifications or tenants</li>
                <li>• Full audit trail in KMS for key access</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary md:col-span-2">
              <h4 className="font-semibold text-sm mb-2 text-primary">Customer Talking Point</h4>
              <p className="text-sm">"You keep the master keys. Even MongoDB/Atlas can never see your plaintext data."</p>
            </div>
          </div>
        </RevealStep>
      </div>
    ),
    speakerNotes: `Envelope encryption – show one container at a time:
1. CMK – never leaves KMS, wraps DEKs
2. DEK – stored encrypted in Key Vault, encrypts data
3. Data – ciphertext in MongoDB
4. Why envelope + talking point: You keep the master keys.`,
    exportContent: {
      title: 'Envelope Encryption',
      bullets: [
        'CMK: Never leaves KMS, customer controlled; wraps DEKs only',
        'DEK: Stored encrypted in Key Vault; encrypts field values',
        'Data: Ciphertext in MongoDB; plaintext never in DB or backups',
        'Benefits: CMK rotation without re-encrypting data; audit trail in KMS',
      ],
      notes: 'Customer talking point: You keep the master keys.',
    },
  },

  // Slide 7: How CSFLE works – diagram with step-highlight and tooltips on Next
  {
    id: 7,
    title: 'How CSFLE Works',
    section: 'Architecture',
    sectionNumber: 3,
    stepCount: 7,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SlideTitle subtitle="Click Next to highlight each part and see its description">How CSFLE Works</SlideTitle>
          <p className="text-sm text-muted-foreground text-center mb-6">Application → Driver. Driver uses KMS + Key Vault to get DEK, then encrypts and sends ciphertext to Atlas.</p>
        </RevealStep>
        <RevealStep step={1}>
          <div className="mt-4">
            <CSFLEDiagramWithTooltips />
          </div>
        </RevealStep>
      </div>
    ),
    speakerNotes: `How CSFLE works – walk through in logical order:
1. Your Application – plaintext data to the driver
2. MongoDB Driver + libmongocrypt – needs a DEK to encrypt; will fetch from Key Vault and unwrap via KMS
3. AWS KMS – driver uses CMK to unwrap the DEK (CMK never leaves KMS)
4. Key Vault – driver fetches encrypted DEK from here
5. MongoDB Atlas – driver sends ciphertext only; on read, decrypts with DEK then returns to app`,
    exportContent: {
      title: 'How CSFLE Works',
      bullets: [
        'Application: plaintext data',
        'Driver: gets DEK from Key Vault, unwraps via KMS, then encrypts/decrypts',
        'KMS: CMK unwraps DEKs; never leaves KMS',
        'Key Vault: stores encrypted DEKs; driver fetches here',
        'Atlas: ciphertext only',
      ],
      notes: 'Flow: driver uses KMS + Key Vault to get DEK, then encrypts and sends to Atlas.',
    },
  },

  // Slide 8: How Queryable Encryption works – 1–6 flow, cryptographic token, plaintext vs ciphertext (MongoDB-style)
  {
    id: 8,
    title: 'How Queryable Encryption Works',
    section: 'Architecture',
    sectionNumber: 3,
    stepCount: 6,
    content: (
      <div className="max-w-4xl mx-auto">
        <RevealStep step={0}>
          <SlideTitle subtitle="Find all bills tied to this person's ID – server never sees plaintext">How Queryable Encryption Works</SlideTitle>
          <ul className="text-sm text-muted-foreground text-center mb-4 space-y-1 list-none">
            <li>• Fast searchable encryption scheme</li>
            <li>• Server-side processing of encrypted data</li>
            <li>• Server knows nothing about the data</li>
          </ul>
          <p className="text-sm text-muted-foreground text-center mb-6">Click Next to follow the flow: client query → cryptographic token → server search → encrypted results back.</p>
        </RevealStep>
        <RevealStep step={1}>
          <div className="mt-4">
            <QEDiagramWithTooltips />
          </div>
        </RevealStep>
      </div>
    ),
    speakerNotes: `How Queryable Encryption works (1–6 flow):
1. Query from client – e.g. find({ ssn: "S1234567C" })
2. Driver + KMS – produces cryptographic token
3. Token to server; server searches encrypted indexes
4. Encrypted results back; driver decrypts for client
5. .esc/.ecoc store encrypted metadata. Encrypted fields are stored, transmitted, processed, and retrieved as ciphertext – including queries. Server never sees plaintext.`,
    exportContent: {
      title: 'How Queryable Encryption Works',
      bullets: [
        'Query from client; Driver + KMS produce cryptographic token',
        'Token sent to server; server searches without decrypting',
        'Encrypted results back; driver decrypts for client',
        'Server knows nothing about the data',
      ],
      notes: '1–6 flow with cryptographic token; plaintext vs ciphertext strip.',
    },
  },

  // Slide 9: CSFLE vs QE Comparison
  {
    id: 9,
    title: 'CSFLE vs Queryable Encryption',
    section: 'Comparison',
    sectionNumber: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <SectionHeader number="04" title="Comparison" />
        <SlideTitle>CSFLE vs Queryable Encryption</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-4">CSFLE</h3>
            <p className="text-sm text-muted-foreground mb-4">Available since MongoDB 4.2</p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-primary">Encryption Type</h4>
                <p className="text-sm">Deterministic: Same plaintext → same ciphertext<br />Random: Different ciphertext each time</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">Query Support</h4>
                <p className="text-sm">Equality only (deterministic fields)<br />No range, prefix, or suffix queries</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">Security</h4>
                <p className="text-sm">Deterministic encryption reveals patterns</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-primary">
            <h3 className="text-xl font-bold mb-4">Queryable Encryption</h3>
            <p className="text-sm text-muted-foreground mb-4">GA in MongoDB 8.0</p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-primary">Encryption Type</h4>
                <p className="text-sm">Always randomized encryption<br />Same plaintext → different ciphertext</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">Query Support</h4>
                <p className="text-sm">Equality, Range, Prefix, Suffix<br />Rich query capabilities on encrypted data</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">Key per field</h4>
                <p className="text-sm">One DEK per encrypted field (CSFLE can reuse one DEK for multiple fields)</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-primary">Security</h4>
                <p className="text-sm">No frequency analysis vulnerability</p>
              </div>
            </div>
          </div>
        </div>
        <CalloutBox type="success" title="Recommendation">
          <p>Use QE for new implementations on MongoDB 8.0+. CSFLE for older versions or when storage overhead is a concern.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `Key differences:

CSFLE (4.2+):
- Deterministic OR random encryption
- Only equality queries on deterministic fields
- Can reuse one DEK for multiple fields
- Lower overhead - deterministic reveals frequency patterns

Queryable Encryption (8.0 GA):
- Always randomized - more secure
- Requires a separate DEK per encrypted field (CSFLE can reuse one DEK for multiple fields)
- Supports range, prefix, suffix queries
- Higher storage overhead (2-3x)
- No frequency analysis vulnerability

Recommendation: QE for new projects on 8.0+, CSFLE for older versions.`,
    exportContent: {
      title: 'CSFLE vs Queryable Encryption',
      table: {
        headers: ['Aspect', 'CSFLE', 'Queryable Encryption'],
        rows: [
          ['Availability', 'MongoDB 4.2+', 'MongoDB 8.0 GA'],
          ['Encryption', 'Deterministic or Random', 'Always Randomized'],
          ['DEK usage', 'One DEK can cover multiple fields', 'One DEK per encrypted field'],
          ['Query Support', 'Equality only', 'Equality, Range, Prefix, Suffix'],
          ['Security', 'Reveals patterns (deterministic)', 'No frequency analysis'],
        ],
      },
      notes: 'Recommendation: Use QE for new implementations on MongoDB 8.0+.',
    },
  },

  // Slide 10: Automatic vs Explicit
  {
    id: 10,
    title: 'Automatic vs Explicit Encryption',
    section: 'Implementation',
    sectionNumber: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Implementation Modes</SlideTitle>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">Automatic Encryption</h3>
            <p className="text-sm text-primary mb-4">Enterprise Advanced / Atlas required</p>
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">How it works</h4>
              <p className="text-sm text-muted-foreground">Schema defines which fields to encrypt. Driver handles encryption/decryption transparently. Uses libmongocrypt (crypto) plus query analysis: Automatic Encryption Shared Library (crypt_shared, recommended) or legacy mongocryptd.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pros</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Minimal code changes</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Schema enforcement</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Reduced developer error</li>
              </ul>
              <h4 className="font-semibold text-sm mt-3">Cons</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />Requires Enterprise/Atlas</li>
                <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />Less granular control</li>
              </ul>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">Explicit Encryption</h3>
            <p className="text-sm text-muted-foreground mb-4">Community Edition compatible</p>
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">How it works</h4>
              <p className="text-sm text-muted-foreground">Application code explicitly calls encrypt/decrypt methods on specific fields. Uses libmongocrypt + ClientEncryption API only; no crypt_shared or mongocryptd.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pros</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Works with Community</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Full control</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Flexible implementation</li>
              </ul>
              <h4 className="font-semibold text-sm mt-3">Cons</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />More code changes</li>
                <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />Developer must remember</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `Two implementation approaches:

Automatic Encryption:
- Requires Enterprise/Atlas
- Driver uses libmongocrypt for crypto and crypt_shared (recommended) or mongocryptd for query analysis
- Schema defines fields, driver handles transparently; minimal code changes

Explicit Encryption:
- libmongocrypt + ClientEncryption API only; no query-analysis helper (no crypt_shared or mongocryptd)
- Works with Community Edition; application code calls encrypt/decrypt
- Required when migrating existing plaintext data (read plaintext, encrypt with ClientEncryption, write to new collection)`,
    exportContent: {
      title: 'Automatic vs Explicit Encryption',
      table: {
        headers: ['Aspect', 'Automatic', 'Explicit'],
        rows: [
          ['Requirements', 'Enterprise/Atlas', 'Community Edition OK'],
          ['Components', 'libmongocrypt + crypt_shared or mongocryptd (query analysis)', 'libmongocrypt + ClientEncryption API only'],
          ['Code Changes', 'Minimal', 'More required'],
          ['Control', 'Schema-driven', 'Full control'],
          ['Error Risk', 'Lower', 'Higher'],
        ],
      },
      notes: 'Automatic: libmongocrypt + crypt_shared or mongocryptd. Explicit: libmongocrypt + ClientEncryption API only; no crypt_shared/mongocryptd.',
    },
  },

  // Slide 11: Supported Query Types
  {
    id: 11,
    title: 'Supported Query Types',
    section: 'Query Capabilities',
    sectionNumber: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Queryable Encryption capabilities">Query Capabilities</SlideTitle>
        <ComparisonTable
          headers={['Equality', 'Range', 'Prefix / Suffix / Substring']}
          rows={[
            ['$eq, $ne, $in, $nin', '$gt, $gte, $lt, $lte (and $eq, $ne)', 'Preview only (8.2): $encStrStartsWith, $encStrEndsWith, $encStrContains – not for production'],
            ['queryType: "equality" or use range index', 'queryType: "range" – int32, int64, double, decimal128, date', 'GA behavior will be incompatible with preview'],
          ]}
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Equality index</h3>
            <p className="text-xs text-muted-foreground mb-2">Supports all BSON types except: array, object, double (Binary64), decimal128. Double/decimal128 can use equality when field has a range index.</p>
            <div className="flex flex-wrap gap-1">
              {['String', 'Int32/64', 'Date', 'ObjectId', 'UUID', 'BinData', 'Bool'].map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Range index</h3>
            <p className="text-xs text-muted-foreground mb-2">Supports: int32, int64, double, decimal128, date. Supports both range operators ($lt, $lte, $gt, $gte) and equality ($eq, $ne).</p>
            <div className="flex flex-wrap gap-1">
              {['int32', 'int64', 'double', 'decimal128', 'date'].map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
          <strong>Encryptable:</strong> Most BSON types. Automatic QE does not support encrypting MaxKey, MinKey, null, undefined as fields.
        </div>
        <CalloutBox type="warning" title="Atlas Search + QE">
          <p className="text-sm">Atlas Search cannot run over QE-encrypted fields. For QE + Search: use a separate non-encrypted (or differently protected) field for Search, or derived/tokenized data that is safe to index.</p>
        </CalloutBox>
        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary text-xs">
          <strong>CSFLE:</strong> Only equality on deterministic fields. Range, prefix, and suffix require Queryable Encryption.
        </div>
      </div>
    ),
    speakerNotes: `Queryable Encryption query capabilities:

Equality index: All BSON types except array, object, double, decimal128. Double/decimal128 can still use equality when field has range index.
Range index: int32, int64, double, decimal128, date – supports both range ($lt, $gte, etc.) and equality ($eq, $ne).
Prefix/suffix/substring: Preview in MongoDB 8.2 ($encStrStartsWith, etc.) – not for production; GA will be incompatible with preview.

Atlas Search: Not compatible with QE-encrypted fields. Use separate field for Search or derived/tokenized data.
Encryptable: Most BSON types; automatic QE does not support MaxKey, MinKey, null, undefined as encrypted fields.

CSFLE only supports equality on deterministic fields.`,
    exportContent: {
      title: 'Supported Query Types',
      table: {
        headers: ['Equality', 'Range', 'Prefix/Suffix/Substring'],
        rows: [
          ['$eq, $ne, $in, $nin; all types except array, object, double, decimal128', '$gt, $gte, $lt, $lte + $eq, $ne; int32, int64, double, decimal128, date', 'Preview 8.2 only; not for production'],
        ],
      },
      bullets: [
        'Equality index: excludes array, object, double, decimal128 (double/decimal128 can use equality via range index)',
        'Range index: int32, int64, double, decimal128, date; supports equality and range',
        'Prefix/suffix/substring: preview in 8.2, not production',
        'Atlas Search: not compatible with QE-encrypted fields',
        'CSFLE: equality only on deterministic fields',
      ],
      notes: 'QE query types and supported BSON types per MongoDB docs; Atlas Search not compatible with QE.',
    },
  },

  // Slide 12: Limitations
  {
    id: 12,
    title: "What You CAN'T Do",
    section: 'Limitations',
    sectionNumber: 4,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Set proper expectations early">Critical Knowledge</SlideTitle>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Query Restrictions
            </h3>
            <div className="space-y-3">
              {[
                { title: 'No regex', desc: 'Except prefix/suffix patterns' },
                { title: 'No aggregation operators', desc: '$sum, $avg, $group not supported' },
                { title: 'No sorting on encrypted fields', desc: 'Order not preserved in ciphertext' },
                { title: 'No text search / Atlas Search', desc: 'Full-text indexing not possible' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Operational Considerations
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Field-level, not document-level', desc: 'Must specify each field' },
                { title: 'Schema changes require re-encryption', desc: 'Changing encryption needs migration' },
                { title: 'Index limitations', desc: 'Only specific index types per query type' },
                { title: 'Driver support varies', desc: 'Check version compatibility for QE' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CalloutBox type="warning" title="Key Message">
          <p>Know limitations before customer discovers them. Set proper expectations early in discussions.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `Critical limitations to know:

Query Restrictions:
- No regex (except prefix/suffix)
- No $sum, $avg, $group on encrypted
- No sorting on encrypted fields
- No text search / Atlas Search

Operational:
- Field-level only, not document-level
- Schema changes require re-encryption
- Index limitations
- Driver version compatibility

Key message: Know these before the customer discovers them!`,
    exportContent: {
      title: "What You CAN'T Do - Critical Knowledge",
      bullets: [
        'No regex (except prefix/suffix)',
        'No aggregation operators ($sum, $avg, $group)',
        'No sorting on encrypted fields',
        'No text search / Atlas Search',
        'Field-level only, schema changes require re-encryption',
        'Index and driver version limitations',
      ],
      notes: 'Know limitations before customer discovers them.',
    },
  },

  // Slide 14: KMS Providers
  {
    id: 14,
    title: 'KMS Providers',
    section: 'Key Management',
    sectionNumber: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Supported KMS Providers</SlideTitle>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: 'AWS KMS', auth: 'IAM-based', features: ['Regional key management', 'CloudTrail audit'], config: 'accessKeyId, secretAccessKey, region, key' },
            { name: 'Azure Key Vault', auth: 'Azure AD', features: ['RBAC, HSM-backed', 'Managed identity'], config: 'tenantId, clientId, clientSecret, keyVaultEndpoint' },
            { name: 'GCP Cloud KMS', auth: 'Service account', features: ['Key rings, crypto keys', 'Cloud Audit Logs'], config: 'projectId, location, keyRing, keyName' },
            { name: 'KMIP', auth: 'Certificate', features: ['Thales, HashiCorp', 'Any KMIP 1.2+'], config: 'endpoint, tlsCertificate, tlsKey' },
          ].map((kms, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-bold mb-2">{kms.name}</h4>
              <p className="text-xs text-primary mb-2">{kms.auth} auth</p>
              <ul className="text-xs space-y-1 text-muted-foreground mb-3">
                {kms.features.map((f, j) => (
                  <li key={j}>• {f}</li>
                ))}
              </ul>
              <code className="text-xs break-all text-muted-foreground">{kms.config}</code>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning">
          <p className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span><strong>Local key provider</strong> available for dev/test only. Never use in production.</span>
          </p>
        </div>
      </div>
    ),
    speakerNotes: `Four supported KMS providers:

AWS KMS: IAM auth, regional, CloudTrail audit
Azure Key Vault: Azure AD, RBAC, HSM option, managed identity
GCP Cloud KMS: Service account, key rings, Cloud Audit Logs
KMIP: Thales, HashiCorp Vault Enterprise, any KMIP 1.2+

Local key provider is for dev/test ONLY - keys in memory.`,
    exportContent: {
      title: 'Supported KMS Providers',
      table: {
        headers: ['AWS KMS', 'Azure Key Vault', 'GCP Cloud KMS', 'KMIP'],
        rows: [
          ['IAM auth', 'Azure AD auth', 'Service account', 'Certificate auth'],
          ['CloudTrail audit', 'RBAC, HSM', 'Cloud Audit Logs', 'Any KMIP 1.2+'],
        ],
      },
      notes: 'Local key provider for dev/test only - never in production.',
    },
  },

  // Slide 15: Key Rotation
  {
    id: 15,
    title: 'Key Rotation Strategies',
    section: 'Key Management',
    sectionNumber: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Key Rotation</SlideTitle>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 rounded-lg bg-card border border-primary">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">CMK Rotation</h3>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">Low Impact</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              CMK rotation only requires re-wrapping DEKs in the key vault. The encrypted data itself doesn't change.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Process:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Create new CMK in KMS</li>
                <li>Re-wrap each DEK with new CMK</li>
                <li>Update key vault collection</li>
                <li>Optionally decommission old CMK</li>
              </ol>
            </div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-warning">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h3 className="text-xl font-bold">DEK Rotation</h3>
              <span className="px-2 py-1 rounded bg-warning/10 text-warning text-xs">Higher Impact</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              DEK rotation requires re-encrypting all data protected by that DEK. Plan for downtime or rolling updates.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">When Required:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Suspected key compromise</li>
                <li>• Compliance mandates (some require annual)</li>
                <li>• Employee departure with key access</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm">
            <strong>Tip:</strong> Many KMS providers support automatic CMK rotation. Use MongoDB's <code className="text-primary">rewrapManyDataKey()</code> for bulk DEK updates.
          </p>
        </div>
      </div>
    ),
    speakerNotes: `Key rotation strategies:

CMK Rotation (Low Impact):
- Only re-wraps DEKs
- Data doesn't change
- Many KMS providers do this automatically

DEK Rotation (Higher Impact):
- Requires re-encrypting all data
- When: suspected compromise, compliance mandates, employee departure
- Use rewrapManyDataKey() for bulk updates

Best practice: Prefer keyAltNames over raw keyId for rotation and readability.`,
    exportContent: {
      title: 'Key Rotation Strategies',
      bullets: [
        'CMK Rotation (Low Impact): Re-wrap DEKs, data unchanged, often automatic',
        'DEK Rotation (Higher Impact): Re-encrypt all data, plan for downtime',
        'DEK rotation triggers: Compromise, compliance, employee departure',
        'Use rewrapManyDataKey() for bulk DEK updates',
      ],
      notes: 'CMK rotation is low impact; DEK rotation requires re-encrypting data.',
    },
  },

  // Slide 16: Right to Erasure / Crypto-Shredding
  {
    id: 16,
    title: 'Right to Erasure / Crypto-Shredding',
    section: 'Key Management',
    sectionNumber: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="One DEK per user or tenant → delete DEK to make data unrecoverable everywhere">Right to Erasure (GDPR Art. 17) & Crypto-Shredding</SlideTitle>
        <div className="rounded-xl bg-card/50 border border-border p-4 mb-4">
          <CryptoShreddingDiagram className="max-w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalloutBox type="warning" title="The problem">
            <p className="text-sm">Deleting rows does not remove data from backups, replicas, or logs. True erasure = make data unrecoverable everywhere.</p>
          </CalloutBox>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary">
            <h3 className="font-bold mb-2 text-sm">Solution: One DEK per user or tenant</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Delete the DEK from the key vault → all ciphertext protected by that DEK becomes permanently unreadable (crypto-shredding). No need to overwrite every backup.
            </p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />Multi-tenant: one DEK per tenant → per-tenant erasure</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />Lab 3: migration, per-tenant DEKs, crypto-shredding</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `Right to Erasure (GDPR Art. 17): Users can request deletion of their data. The challenge is that deleting rows doesn't remove data from backups or replicas.

Crypto-shredding: Use one DEK per user or tenant. To erase, delete the DEK from the key vault. All ciphertext protected by that DEK becomes permanently unrecoverable - no need to hunt through backups.

Multi-tenant isolation: One DEK per tenant gives you per-tenant erasure and isolation. Lab 3 covers migration, per-tenant DEKs, CMK rotation with rewrapManyDataKey, and right to erasure.`,
    exportContent: {
      title: 'Right to Erasure / Crypto-Shredding',
      bullets: [
        'Problem: Deleting data does not remove it from backups or replicas',
        'Solution: One DEK per user/tenant - delete DEK to make ciphertext unrecoverable',
        'Multi-tenant: Per-tenant DEK enables per-tenant erasure and isolation',
        'Lab 3: Migration, per-tenant DEKs, CMK rotation, GDPR right to erasure',
      ],
      notes: 'Crypto-shredding: delete the DEK to make all associated ciphertext permanently unrecoverable.',
    },
  },

  // Slide 17: Performance Considerations (was 14)
  {
    id: 17,
    title: 'Performance Considerations',
    section: 'Operations',
    sectionNumber: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Operational Performance</SlideTitle>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { title: 'Encryption/Decryption', desc: 'CPU cycles in app layer. Modern CPUs with AES-NI make this minimal.' },
            { title: 'KMS Calls', desc: 'DEK unwrapping requires KMS round-trip. Cached after first call per session.' },
            { title: 'Storage', desc: 'Ciphertext is larger than plaintext. QE metadata adds additional overhead.' },
            { title: 'Query Processing', desc: 'QE maintains encrypted indexes. Range queries touch more index entries.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <Zap className="w-5 h-5 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-lg bg-card border border-border mb-6">
          <h3 className="font-semibold mb-4">Ballpark Numbers (varies by workload)</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatCard value="5-15%" label="CSFLE latency increase" icon={BarChart3} />
            <StatCard value="2-3x" label="QE Range storage" icon={Database} />
            <StatCard value="50-100ms" label="First query (KMS)" icon={Zap} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary">
            <h4 className="font-semibold text-sm">DEK Caching</h4>
            <p className="text-xs text-muted-foreground">Use connection pooling to reuse DEKs across requests.</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary">
            <h4 className="font-semibold text-sm">KMS Proximity</h4>
            <p className="text-xs text-muted-foreground">Place KMS in same region as application for lower latency.</p>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `Performance overhead areas:

Encryption/Decryption: Minimal with modern AES-NI CPUs
KMS Calls: Cached after first call per session
Storage: Ciphertext larger, QE metadata adds overhead
Query Processing: QE encrypted indexes

Ballpark numbers:
- CSFLE: 5-15% latency increase
- QE Range: 2-3x storage for encrypted fields
- First query: 50-100ms additional (KMS), subsequent minimal

Optimization: DEK caching, contention factor tuning, KMS proximity`,
    exportContent: {
      title: 'Performance Considerations',
      bullets: [
        'CSFLE: 5-15% latency increase for encrypted field operations',
        'QE Range: 2-3x storage for encrypted fields with range indexes',
        'First query: 50-100ms additional (KMS call), subsequent minimal',
        'Optimization: DEK caching, connection pooling, KMS in same region',
      ],
      notes: 'Ballpark numbers vary by workload. Optimize with DEK caching and KMS proximity.',
    },
  },

  // Slide 18: Compliance Mapping
  {
    id: 18,
    title: 'Regulatory Alignment',
    section: 'Compliance',
    sectionNumber: 5,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Compliance Mapping</SlideTitle>
        <ComparisonTable
          headers={['GDPR', 'HIPAA', 'PCI-DSS', 'SOX / SOC2']}
          rows={[
            ['EU Data Protection', 'Healthcare Data', 'Payment Card Data', 'Financial Controls'],
            [
              '✓ Art. 32 - Data encryption\n✓ Art. 25 - Privacy by design\n✓ Pseudonymization',
              '✓ PHI encryption at rest\n✓ Access controls via key mgmt\n✓ Audit trail through KMS',
              '✓ Req 3.4 - Render PAN unreadable\n✓ Req 3.5 - Key management\n✓ Separation of duties',
              '✓ Data integrity controls\n✓ Access segregation\n✓ Encryption key controls',
            ],
          ]}
        />
        <CalloutBox type="success" title="Key Message">
          <p>Client-side encryption addresses the "zero trust" requirement - even infrastructure operators can't access plaintext data.</p>
        </CalloutBox>
      </div>
    ),
    speakerNotes: `Compliance alignment:

GDPR: Art. 32 encryption, Art. 25 privacy by design, pseudonymization
HIPAA: PHI encryption, access controls, audit trail
PCI-DSS: Render PAN unreadable, key management, separation of duties
SOX/SOC2: Data integrity, access segregation, encryption key controls

Key message: CSFLE/QE addresses "zero trust" - even infrastructure operators can't access plaintext.`,
    exportContent: {
      title: 'Regulatory Alignment',
      table: {
        headers: ['Regulation', 'Requirements', 'MongoDB Solution'],
        rows: [
          ['GDPR', 'Art. 32 encryption, Art. 25 privacy by design', 'CSFLE/QE + Right to Erasure'],
          ['HIPAA', 'PHI encryption, access controls, audit', 'Field-level encryption + KMS audit'],
          ['PCI-DSS', 'Render PAN unreadable, key management', 'QE for searchable PAN'],
          ['SOX/SOC2', 'Data integrity, access segregation', 'Encryption + key controls'],
        ],
      },
      notes: 'Key message: Zero trust - even infrastructure operators cannot access plaintext.',
    },
  },

  // Slide 19: Competitive Positioning
  {
    id: 19,
    title: 'Competitive Positioning',
    section: 'Competitive',
    sectionNumber: 6,
    content: (
      <div className="max-w-4xl mx-auto">
        <SectionHeader number="06" title="Competitive Intel" />
        <SlideTitle>How We Compare</SlideTitle>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              name: 'Oracle TDE',
              approach: 'Server-side TDE. DBAs see plaintext. Encryption at tablespace level.',
              advantages: ['DBAs never see plaintext', 'Field-level granularity', 'Query on encrypted data (QE)'],
            },
            {
              name: 'PostgreSQL pgcrypto',
              approach: 'Manual encrypt/decrypt in SQL. No automatic handling.',
              advantages: ['Automatic encryption mode', 'Built-in KMS integration', 'Rich query support (QE)'],
            },
            {
              name: 'Azure Cosmos DB',
              approach: 'Always Encrypted (preview). Limited data types. Deterministic only.',
              advantages: ['GA, production-ready', 'Randomized encryption (QE)', 'Range, prefix, suffix queries'],
            },
          ].map((comp, i) => (
            <div key={i} className="p-5 rounded-lg bg-card border border-border">
              <h3 className="font-bold text-lg mb-3">{comp.name}</h3>
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Their approach</h4>
                <p className="text-sm">{comp.approach}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-primary uppercase mb-2">Our advantage</h4>
                <ul className="space-y-1">
                  {comp.advantages.map((adv, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary text-center">
          <p className="font-semibold">Key differentiator: We're the only document database with production-ready searchable encryption.</p>
        </div>
      </div>
    ),
    speakerNotes: `Competitive positioning:

Oracle TDE:
- Server-side, DBAs see plaintext, tablespace level
- Our advantage: DBAs never see plaintext, field-level, query on encrypted

PostgreSQL pgcrypto:
- Manual SQL encrypt/decrypt, no search
- Our advantage: Automatic mode, built-in KMS, rich queries

Cosmos DB:
- Always Encrypted preview, limited types, deterministic only
- Our advantage: GA/production-ready, randomized (QE), range/prefix/suffix

Key differentiator: Only document DB with production-ready searchable encryption.`,
    exportContent: {
      title: 'Competitive Positioning',
      table: {
        headers: ['Competitor', 'Their Approach', 'Our Advantage'],
        rows: [
          ['Oracle TDE', 'Server-side, DBAs see plaintext', 'Field-level, query on encrypted'],
          ['PostgreSQL pgcrypto', 'Manual SQL, no search', 'Automatic mode, rich queries'],
          ['Cosmos DB', 'Preview, deterministic only', 'GA, randomized, range queries'],
        ],
      },
      notes: 'Key differentiator: Only document DB with production-ready searchable encryption.',
    },
  },

  // Slide 20: Discovery Questions
  {
    id: 20,
    title: 'Discovery Questions',
    section: 'Sales Enablement',
    sectionNumber: 7,
    content: (
      <div className="max-w-4xl mx-auto">
        <SectionHeader number="07" title="Sales Enablement" />
        <SlideTitle>Discovery Questions</SlideTitle>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Questions to Uncover Need
            </h3>
            <div className="space-y-3">
              {[
                { num: '1', q: 'Data Classification', desc: 'What types of sensitive data? PII, PHI, financial, classified?' },
                { num: '2', q: 'Regulatory Landscape', desc: 'Which frameworks apply? GDPR, HIPAA, PCI-DSS, SOX?' },
                { num: '3', q: 'Insider Threat Concern', desc: 'Who has DB access? Concerns about privileged users?' },
                { num: '4', q: 'Cloud Migration Blockers', desc: "What's preventing cloud move for sensitive workloads?" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{item.num}</span>
                    <span className="font-semibold text-sm">{item.q}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Technical Qualification
            </h3>
            <div className="space-y-3">
              {[
                { num: '5', q: 'Query Requirements', desc: 'Need to search/filter encrypted fields? What types - exact, range, pattern?' },
                { num: '6', q: 'Key Management', desc: 'Existing KMS infrastructure? AWS, Azure, GCP, on-prem HSM?' },
                { num: '7', q: 'Performance Tolerance', desc: 'Latency budget for sensitive data operations? SLA requirements?' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{item.num}</span>
                    <span className="font-semibold text-sm">{item.q}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary">
              <p className="text-sm">
                <strong>Pro tip:</strong> Listen for "zero trust", "data sovereignty", "separation of duties" - strong QE/CSFLE indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `Discovery questions:

Business Questions:
1. Data Classification - What sensitive data? PII, PHI, financial?
2. Regulatory Landscape - GDPR, HIPAA, PCI-DSS, SOX?
3. Insider Threat - Who has DB access? Privileged user concerns?
4. Cloud Migration Blockers - What's preventing cloud move?

Technical Qualification:
5. Query Requirements - Need to search/filter on encrypted?
6. Key Management - Existing KMS infrastructure?
7. Performance Tolerance - Latency budget? SLAs?

Pro tip: Listen for "zero trust", "data sovereignty", "separation of duties"`,
    exportContent: {
      title: 'Discovery Questions',
      bullets: [
        '1. Data Classification: PII, PHI, financial, classified?',
        '2. Regulatory Landscape: GDPR, HIPAA, PCI-DSS, SOX?',
        '3. Insider Threat: Who has DB access?',
        '4. Cloud Migration Blockers: What prevents cloud move?',
        '5. Query Requirements: Search/filter encrypted fields?',
        '6. Key Management: Existing KMS infrastructure?',
        '7. Performance Tolerance: Latency budget, SLAs?',
      ],
      notes: 'Pro tip: Listen for "zero trust", "data sovereignty", "separation of duties".',
    },
  },

  // Slide 21: Objection Handling
  {
    id: 21,
    title: 'Objection Handling',
    section: 'Sales Enablement',
    sectionNumber: 7,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Common Questions & Responses</SlideTitle>
        <div className="grid grid-cols-2 gap-4">
          {[
            { q: '"Why not just encryption at rest?"', a: "Encryption at rest protects against disk theft but not against anyone with database access - DBAs, support engineers, compromised accounts. CSFLE/QE ensures only your application sees plaintext." },
            { q: '"Can we search encrypted data?"', a: 'Yes! Queryable Encryption (MongoDB 8.0+) supports equality, range, prefix, and suffix queries on encrypted fields. CSFLE supports equality on deterministic fields.' },
            { q: '"This seems complex to implement"', a: "Automatic encryption requires minimal code changes - define a schema map and the driver handles the rest. We have quickstart guides and sample apps for every major language." },
            { q: '"We already have TDE enabled"', a: 'TDE and CSFLE/QE complement each other. TDE protects at storage layer. CSFLE/QE adds field-level protection that persists even in memory or in transit within MongoDB.' },
            { q: '"What about performance impact?"', a: 'Modern AES-NI CPUs handle encryption with minimal overhead. The bigger factor is KMS latency for DEK retrieval, which is cached. Most customers see 5-15% impact.' },
            { q: '"How do we migrate existing data?"', a: 'Use a migration script that reads plaintext, encrypts designated fields client-side, and writes back. We have documented migration patterns and can assist with planning.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-semibold text-sm text-primary mb-2">{item.q}</h4>
              <p className="text-xs text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    speakerNotes: `Common objections and responses:

"Why not just encryption at rest?"
→ Doesn't protect against DB access, only disk theft

"Can we search encrypted data?"
→ Yes! QE supports equality, range, prefix, suffix

"Seems complex"
→ Automatic encryption = minimal code changes

"We have TDE enabled"
→ TDE + CSFLE/QE complement each other

"Performance impact?"
→ 5-15% typical, KMS latency cached

"How to migrate?"
→ Migration script pattern, documented, we can assist`,
    exportContent: {
      title: 'Common Questions & Responses',
      bullets: [
        '"Why not encryption at rest?" → Doesnt protect against DB access',
        '"Can we search encrypted?" → Yes! QE supports range queries',
        '"Seems complex" → Automatic mode = minimal code changes',
        '"We have TDE" → TDE + CSFLE/QE complement each other',
        '"Performance?" → 5-15% typical, KMS cached',
        '"Migration?" → Script pattern, documented process',
      ],
      notes: 'Handle these objections confidently with specific responses.',
    },
  },

  // Slide 22: When NOT to Use
  {
    id: 22,
    title: 'When NOT to Use',
    section: 'Guidance',
    sectionNumber: 7,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle subtitle="Avoid over-engineering">When NOT to Use CSFLE/QE</SlideTitle>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Skip encryption if:
            </h3>
            <div className="space-y-3">
              {[
                { title: 'No regulatory/business requirement', desc: "Don't add complexity if encryption isn't mandated" },
                { title: 'Heavy aggregation on sensitive fields', desc: 'Need $sum, $avg, $group? Consider alternatives' },
                { title: 'Full-text search on sensitive content', desc: "Atlas Search doesn't work on encrypted fields" },
                { title: 'Extreme latency sensitivity', desc: 'Sub-millisecond requirements may not tolerate overhead' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Consider alternatives:
            </h3>
            <div className="space-y-3">
              {[
                { title: 'TDE only', desc: 'If disk-level protection is sufficient and you trust DBAs' },
                { title: 'Data masking / Redaction', desc: 'If you need partial data display (last 4 of SSN)' },
                { title: 'Tokenization', desc: 'Replace sensitive values with tokens in separate vault' },
                { title: 'Application-layer access control', desc: 'If threat model is app users, not infrastructure' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    speakerNotes: `When NOT to use CSFLE/QE:

Skip if:
- No regulatory/business requirement
- Heavy aggregation on sensitive fields
- Full-text search on sensitive content
- Extreme latency sensitivity

Alternatives:
- TDE only (if you trust DBAs)
- Data masking/redaction (partial display)
- Tokenization (separate vault)
- Application-layer access control (if threat is app users)`,
    exportContent: {
      title: 'When NOT to Use CSFLE/QE',
      bullets: [
        'Skip if: No requirement, heavy aggregation, text search needed, extreme latency',
        'Alternative: TDE only (if you trust DBAs)',
        'Alternative: Data masking/redaction (partial display)',
        'Alternative: Tokenization (separate vault)',
        'Alternative: App-layer access control (if threat is app users)',
      ],
      notes: 'Avoid over-engineering. Know when alternatives are better.',
    },
  },

  // Slide 23: Lab Overview
  {
    id: 23,
    title: 'Hands-On Lab',
    section: 'Labs',
    sectionNumber: 8,
    content: (
      <div className="max-w-4xl mx-auto">
        <SectionHeader number="08" title="Hands-On Lab" />
        <SlideTitle>Lab Overview</SlideTitle>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Lab 1: CSFLE with AWS KMS</h3>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">15 min</span>
            </div>
            <ul className="space-y-2">
              {[
                'Configure AWS KMS and create CMK',
                'Set up key vault collection',
                'Implement automatic encryption with schema map',
                'Query encrypted fields and verify encryption',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Lab 2: Queryable Encryption with AWS KMS</h3>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">15 min</span>
            </div>
            <ul className="space-y-2">
              {[
                'Create DEKs for QE fields',
                'Set up encrypted collection with QE schema',
                'Execute equality queries on encrypted fields',
                'Compare CSFLE vs QE behavior',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Lab 3: Migration & Multi-Tenant Patterns</h3>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">15 min</span>
            </div>
            <ul className="space-y-2">
              {[
                'Migrate plaintext data to CSFLE',
                'Implement multi-tenant isolation with KeyAltNames',
                'Rotate CMK using rewrapManyDataKey',
                'GDPR right to erasure with crypto shredding',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <h4 className="font-semibold mb-2">Prerequisites</h4>
          <div className="flex flex-wrap gap-2">
            {['MongoDB Atlas M10+', 'AWS account with KMS', 'Node.js 18+', 'mongosh 2.0+'].map((item, i) => (
              <span key={i} className="px-3 py-1 rounded bg-card border border-border text-sm">
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    speakerNotes: `We've covered architecture and compliance; next you'll do three hands-on labs that implement what we just described.

Lab overview:

Lab 1: CSFLE with AWS KMS (15 min)
- Configure AWS KMS, create CMK
- Set up key vault collection
- Implement automatic encryption
- Query and verify

Lab 2: Queryable Encryption with AWS KMS (15 min)
- Create DEKs for QE fields
- Set up encrypted collection with QE schema
- Execute equality queries on encrypted fields
- Compare CSFLE vs QE behavior

Lab 3: Migration & Multi-Tenant Patterns (15 min)
- Migrate plaintext data to CSFLE
- Implement multi-tenant isolation with KeyAltNames
- Rotate CMK using rewrapManyDataKey
- GDPR right to erasure with crypto shredding

Prerequisites: Atlas M10+, AWS account with KMS, Node.js 18+, mongosh 2.0+`,
    exportContent: {
      title: 'Hands-On Lab Overview',
      bullets: [
        'Lab 1: CSFLE with AWS KMS (15 min) - KMS setup, key vault, automatic encryption',
        'Lab 2: Queryable Encryption with AWS KMS (15 min) - Equality queries, CSFLE vs QE comparison',
        'Lab 3: Migration & Multi-Tenant Patterns (15 min) - Data migration, multi-tenant isolation, CMK rotation, GDPR right to erasure',
        'Prerequisites: Atlas M10+, AWS account with KMS, Node.js 18+, mongosh 2.0+',
      ],
      notes: 'Three labs covering CSFLE, Queryable Encryption, and advanced patterns - all using AWS KMS.',
    },
  },

  // Slide 24: Resources & Next Steps
  {
    id: 24,
    title: 'Resources & Next Steps',
    section: 'Wrap Up',
    sectionNumber: 8,
    content: (
      <div className="max-w-4xl mx-auto">
        <SlideTitle>Resources & Next Steps</SlideTitle>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Documentation & Guides
            </h3>
            <div className="space-y-2">
              {[
                { name: 'CSFLE Documentation', url: 'mongodb.com/docs/manual/core/csfle' },
                { name: 'Queryable Encryption Docs', url: 'mongodb.com/docs/manual/core/queryable-encryption' },
                { name: 'GitHub Sample Apps', url: 'github.com/mongodb-university/csfle-guides' },
                { name: 'SA Encryption Playbook', url: 'Confluence → SA Resources → Security' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{item.url}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Action Items
            </h3>
            <div className="space-y-3">
              {[
                { num: '1', title: 'Complete both labs', desc: 'Hands-on experience is essential for demos' },
                { num: '2', title: 'Review territory accounts', desc: 'Identify 2-3 customers who might benefit' },
                { num: '3', title: 'Schedule practice demo', desc: 'Implement crypto shredding to showcase GDPR right for erasure' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-primary/10 border border-primary">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-primary text-background text-sm flex items-center justify-center font-bold">{item.num}</span>
                    <span className="font-semibold">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-card border border-border text-center">
          <h3 className="text-2xl font-bold mb-2">Questions?</h3>
        </div>
      </div>
    ),
    speakerNotes: `Resources:
- CSFLE Documentation
- Queryable Encryption Documentation
- GitHub Sample Applications
- Internal SA Encryption Playbook

Action items:
1. Complete both labs - hands-on experience is essential
2. Review territory accounts - identify 2-3 opportunities
3. Schedule practice demo - implement crypto shredding to showcase GDPR right for erasure`,
    exportContent: {
      title: 'Resources & Next Steps',
      bullets: [
        'CSFLE Docs: mongodb.com/docs/manual/core/csfle',
        'QE Docs: mongodb.com/docs/manual/core/queryable-encryption',
        'GitHub Samples: github.com/mongodb-university/csfle-guides',
        'Action 1: Complete both labs',
        'Action 2: Review territory accounts for 2-3 opportunities',
        'Action 3: Schedule practice demo - implement crypto shredding to showcase GDPR right for erasure',
      ],
      notes: 'Resources and action items for continued learning.',
    },
  },
];

export const sections = [
  { number: 1, title: 'The Challenge', slides: [3] },
  { number: 2, title: 'Use Cases', slides: [4] },
  { number: 3, title: 'Architecture', slides: [5, 6, 13, 7, 8] },
  { number: 4, title: 'Comparison', slides: [9, 10] },
  { number: 5, title: 'Key Management', slides: [11, 12, 14, 15, 16] },
  { number: 6, title: 'Competitive', slides: [17] },
  { number: 7, title: 'Sales Enablement', slides: [18, 19, 20] },
  { number: 8, title: 'Labs', slides: [21, 22] },
];
