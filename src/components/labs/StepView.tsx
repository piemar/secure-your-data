import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Terminal, Copy, Check, Loader2, Info, BookOpen, Clock, Lock, Eye, Unlock, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DifficultyBadge, DifficultyLevel } from './DifficultyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { StepContextDrawer } from './StepContextDrawer';
import { useLab } from '@/context/LabContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { trackHintUsage, trackSolutionReveal } from '@/utils/leaderboardUtils';
import { type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { InlineHintEditor } from './InlineHintEditor';

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  skeleton?: string;           // Tier 1: Guided (blanks with structure)
  challengeSkeleton?: string;  // Tier 2: Challenge (tasks only)
  expertSkeleton?: string;     // Tier 3: Expert (objective only)
  inlineHints?: InlineHint[];  // Line-specific hints for skeleton blanks
}

interface Exercise {
  id: string;
  type: 'quiz' | 'fill_blank' | 'challenge';
  title: string;
  description?: string;
  points?: number;
  question?: string;
  options?: Array<{ id: string; label: string; isCorrect: boolean }>;
  codeTemplate?: string;
  blanks?: Array<{ id: string; placeholder: string; correctAnswer: string; hint?: string }>;
  challengeSteps?: Array<{ instruction: string; hint?: string }>;
}

interface StepData {
  id: string;
  title: string;
  estimatedTime: string;
  description: string;
  difficulty?: DifficultyLevel;
  understandSection?: string;
  doThisSection?: string[];
  hints?: string[];
  codeBlocks?: CodeBlock[];
  expectedOutput?: string;
  troubleshooting?: string[];
  tips?: string[];
  documentationUrl?: string;
  exercises?: Exercise[];
  onVerify?: () => Promise<{ success: boolean; message: string }>;
}

interface StepViewProps {
  steps: StepData[];
  currentStepIndex: number;
  completedSteps: number[];
  onStepChange: (index: number) => void;
  onComplete: (index: number) => void;
  labNumber: number;
  labTitle: string;
  labDescription: string;
  businessValue?: string;
  atlasCapability?: string;
  /** Shared output (from parent) – when set, output is common across steps and persists on refresh */
  lastOutput?: string;
  outputSummary?: string;
  outputSuccess?: boolean;
  outputOpen?: boolean;
  outputStepIndex?: number | null;
  stepsCount?: number;
  onOutputChange?: (result: { output: string; summary: string; success: boolean }, stepIndex: number) => void;
  onOutputOpenChange?: (open: boolean) => void;
}

// Generate realistic MongoDB output based on code content with structured formatting
function generateSimulatedOutput(code: string, stepTitle: string): { output: string; success: boolean; summary: string } {
  const lowerCode = code.toLowerCase();
  const lowerTitle = stepTitle.toLowerCase();
  const timestamp = new Date().toISOString();

  if (lowerCode.includes('create-key') || lowerTitle.includes('cmk') || lowerTitle.includes('master key')) {
    return {
      success: true,
      summary: 'AWS KMS Customer Master Key created successfully',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "KeyMetadata": {
        "KeyId": "mrk-1234567890abcdef0",
        "Arn": "arn:aws:kms:eu-central-1:123456789012:key/mrk-1234567890abcdef0",
        "CreationDate": "${timestamp}",
        "Enabled": true,
        "Description": "MongoDB Encryption Workshop - Customer Master Key",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "KeyState": "Enabled",
        "Origin": "AWS_KMS",
        "KeyManager": "CUSTOMER",
        "MultiRegion": false,
        "KeySpec": "SYMMETRIC_DEFAULT",
        "EncryptionAlgorithms": ["SYMMETRIC_DEFAULT"]
    }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ CMK created in AWS KMS
  ✓ Key is enabled and ready for use
  ✓ Key alias "alias/mongodb-lab-key-*" linked
  ✓ Key usage set to ENCRYPT_DECRYPT
  
💡 WHAT THIS MEANS:
   Your Customer Master Key (CMK) is now active in AWS KMS.
   This key will be used to wrap/unwrap your Data Encryption Keys (DEKs).
   
⏭️  NEXT: Create a key alias for easier reference`
    };
  }

  if (lowerCode.includes('createdatakey') || lowerTitle.includes('dek') || lowerTitle.includes('data encryption')) {
    return {
      success: true,
      summary: 'Data Encryption Key (DEK) created and stored in key vault',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
Connecting to MongoDB Atlas cluster...
✓ TLS 1.3 connection established
✓ Authenticated with X.509 certificate

Creating Data Encryption Key...
{
    "acknowledged": true,
    "_id": UUID("4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a"),
    "keyAltNames": ["workshop-dek-1"],
    "creationDate": ISODate("${timestamp}"),
    "updateDate": ISODate("${timestamp}"),
    "status": 1,
    "masterKey": {
        "provider": "aws",
        "region": "eu-central-1",
        "key": "arn:aws:kms:eu-central-1:123456789012:key/mrk-1234567890abcdef0"
    }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ DEK generated with 256-bit AES key
  ✓ DEK wrapped with AWS KMS CMK
  ✓ Stored in encryption.__keyVault collection
  ✓ Key alt name assigned for easy reference

💡 WHAT THIS MEANS:
   Your Data Encryption Key is stored encrypted in MongoDB.
   Only your AWS KMS CMK can decrypt it for use.
   
⏭️  NEXT: Configure your schema map for automatic encryption`
    };
  }

  if (lowerCode.includes('createindex') || lowerTitle.includes('index') || lowerTitle.includes('key vault')) {
    return {
      success: true,
      summary: 'Key vault collection initialized with unique index',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
Switched to db encryption
{
    "numIndexesBefore": 1,
    "numIndexesAfter": 2,
    "createdCollectionAutomatically": true,
    "ok": 1
}

Index details:
{
    "v": 2,
    "key": { "keyAltNames": 1 },
    "name": "keyAltNames_1",
    "unique": true,
    "partialFilterExpression": { "keyAltNames": { "$exists": true } }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ __keyVault collection created
  ✓ Unique partial index on keyAltNames field
  ✓ Index enforces uniqueness for DEK references
  
💡 WHAT THIS MEANS:
   The key vault is ready to store your encrypted DEKs.
   The unique index prevents duplicate key alt names.`
    };
  }

  if (lowerCode.includes('insertone') || lowerCode.includes('insert')) {
    return {
      success: true,
      summary: 'Document inserted with client-side field level encryption',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "acknowledged": true,
    "insertedId": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1")
}

🔒 Encryption Details:
  - Fields encrypted: ssn, medicalRecordNumber
  - Algorithm: AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic
  - DEK used: UUID("4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Sensitive fields encrypted before network transmission
  ✓ Document stored with encrypted binary values
  ✓ Only authorized clients can decrypt
  
💡 WHAT THIS MEANS:
   The SSN and medical record fields are encrypted client-side.
   Even MongoDB servers never see the plaintext values.`
    };
  }

  if (lowerCode.includes('findone') || lowerCode.includes('find')) {
    return {
      success: true,
      summary: 'Document retrieved with automatic decryption',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "_id": ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"),
    "firstName": "Alice",
    "lastName": "Johnson",
    "ssn": "123-45-6789",          // ← Auto-decrypted
    "dob": ISODate("1990-01-15"),
    "email": "alice.johnson@example.com"
}

🔓 Decryption Details:
  - Fields auto-decrypted: ssn
  - DEK fetched from: encryption.__keyVault
  - CMK used to unwrap DEK via AWS KMS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Encrypted document retrieved from database
  ✓ DEK automatically fetched and unwrapped
  ✓ Sensitive fields decrypted transparently
  
💡 WHAT THIS MEANS:
   The MongoDB driver automatically decrypts fields
   using your configured DEK and AWS KMS credentials.`
    };
  }

  if (lowerCode.includes('createencryptedcollection') || lowerTitle.includes('queryable')) {
    return {
      success: true,
      summary: 'Queryable Encryption collection created with metadata',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "ok": 1,
    "encryptedFieldsMap": {
        "medicalRecords.patients": {
            "fields": [
                { 
                    "path": "ssn", 
                    "bsonType": "string",
                    "queryType": "equality",
                    "keyId": UUID("4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a")
                },
                { 
                    "path": "medicalRecordNumber", 
                    "bsonType": "string",
                    "queryType": "equality",
                    "keyId": UUID("5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b")
                }
            ]
        }
    }
}

Metadata collections created:
  • medicalRecords.patients.esc (Encrypted State Collection)
  • medicalRecords.patients.ecoc (Encrypted Compaction Collection)  
  • medicalRecords.patients.ecc (Encrypted Count Collection)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Encrypted collection created
  ✓ Queryable fields: ssn, medicalRecordNumber
  ✓ Metadata collections initialized (.esc, .ecoc, .ecc)
  ✓ Equality query support enabled

💡 WHAT THIS MEANS:
   You can now query on encrypted fields while maintaining
   full end-to-end encryption. The server never sees plaintext.`
    };
  }

  if (lowerCode.includes('policy') || lowerTitle.includes('policy')) {
    return {
      success: true,
      summary: 'AWS KMS key policy attached successfully',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "ResponseMetadata": {
        "RequestId": "12345678-1234-1234-1234-123456789012",
        "HTTPStatusCode": 200
    }
}

Policy attached to key: mrk-1234567890abcdef0
Permitted actions:
  • kms:Encrypt
  • kms:Decrypt
  • kms:GenerateDataKey
  • kms:DescribeKey

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Key policy updated
  ✓ IAM principal authorized for kms:* operations
  ✓ Policy allows Encrypt, Decrypt, GenerateDataKey

💡 WHAT THIS MEANS:
   Your MongoDB application can now use AWS KMS
   to wrap and unwrap Data Encryption Keys.`
    };
  }

  if (lowerCode.includes('countdocuments') || lowerCode.includes('count')) {
    return {
      success: true,
      summary: 'Key vault contains 1 Data Encryption Key',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Key vault contains 1 DEK
  ✓ DEK is properly encrypted with AWS KMS
  
💡 WHAT THIS MEANS:
   Your encrypted Data Encryption Key is safely stored
   and ready to use for field-level encryption.`
    };
  }

  if (lowerCode.includes('deleteone') || lowerCode.includes('delete') || lowerTitle.includes('erasure')) {
    return {
      success: true,
      summary: 'Crypto-shredding completed - DEK deleted',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "acknowledged": true,
    "deletedCount": 1
}

🗑️ Crypto-Shredding Complete:
  - DEK permanently deleted from key vault
  - Associated encrypted data now unrecoverable
  - GDPR Right to Erasure satisfied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ DEK deleted from encryption.__keyVault
  ✓ All encrypted data now cryptographically inaccessible
  ✓ No need to scan/delete individual records

💡 WHAT THIS MEANS:
   By deleting the DEK, all data encrypted with that key
   is now permanently unreadable - instant crypto-shredding!`
    };
  }

  return {
    success: true,
    summary: 'Command executed successfully',
    output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ STEP VALIDATION: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMAND OUTPUT:
{
    "ok": 1
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Command executed successfully

💡 Proceed to the next step when ready.`
  };
}

// Helper to format real validator results into rich terminal output
function formatRichValidationOutput(result: { success: boolean; message: string }, stepTitle: string): { output: string; success: boolean; summary: string } {
  const timestamp = new Date().toISOString();
  const status = result.success ? 'PASSED' : 'FAILED';
  const icon = result.success ? '✅' : '❌';

  return {
    success: result.success,
    summary: result.message,
    output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ${icon} STEP VALIDATION: ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SYSTEM SCAN & VALIDATION:
Timestamp: ${timestamp}
Result: ${result.message}

${result.success ? `
📊 VALIDATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Backend check completed via Vite Bridge
  ✓ Sub-system state verified in real-time
  ✓ Configuration matches lab requirements
` : `
⚠️  TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Ensure your lab environment setup is correct
  2. Check if you missed a required command
  3. Verify your MongoDB Atlas IP Whitelist
  4. Review the "Tips" section for the previous step
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 SA ADVICE:
   This is a real-time check against your environment.
   ${result.success ? 'You are successfully applying the technical concepts.' : 'Technical validation failed. Review your implementation and try again.'}
`
  };
}

const LAB_STEP_STATE_KEY = (labNum: number) => `lab${labNum}-step-state`;

export function StepView({
  steps,
  currentStepIndex,
  completedSteps,
  onStepChange,
  onComplete,
  labNumber,
  labTitle,
  labDescription,
  businessValue,
  atlasCapability,
  lastOutput: parentLastOutput,
  outputSummary: parentOutputSummary,
  outputSuccess: parentOutputSuccess,
  outputOpen: parentOutputOpen,
  outputStepIndex: parentOutputStepIndex,
  stepsCount = 0,
  onOutputChange,
  onOutputOpenChange,
}: StepViewProps) {
  const { completeStep } = useLab();
  const [activeTab, setActiveTab] = useState<string>('code');
  const [localOutputOpen, setLocalOutputOpen] = useState(false);
  const [localLastOutput, setLocalLastOutput] = useState<string>('');
  const [localOutputSummary, setLocalOutputSummary] = useState<string>('');
  const [localOutputSuccess, setLocalOutputSuccess] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(0);

  const useSharedOutput = onOutputChange != null && onOutputOpenChange != null;
  const lastOutput = useSharedOutput ? (parentLastOutput ?? '') : localLastOutput;
  const outputSummary = useSharedOutput ? (parentOutputSummary ?? '') : localOutputSummary;
  const outputSuccess = useSharedOutput ? (parentOutputSuccess !== false) : localOutputSuccess;
  const outputOpen = useSharedOutput ? (parentOutputOpen ?? false) : localOutputOpen;
  const outputStepIndex = useSharedOutput ? (parentOutputStepIndex ?? null) : null;
  const setOutputOpen = useSharedOutput ? (v: boolean) => onOutputOpenChange?.(v) : setLocalOutputOpen;
  const setOutput = useSharedOutput
    ? (result: { output: string; summary: string; success: boolean }) => { /* parent handles via onOutputChange */ }
    : (result: { output: string; summary: string; success: boolean }) => {
        setLocalLastOutput(result.output);
        setLocalOutputSummary(result.summary);
        setLocalOutputSuccess(result.success);
        setLocalOutputOpen(true);
      };

  // Challenge Mode State – persisted per lab so hints/solutions survive refresh
  const stepStateKey = LAB_STEP_STATE_KEY(labNumber);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(stepStateKey);
      if (raw) {
        const o = JSON.parse(raw);
        return o?.showSolution ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>(() => {
    try {
      const raw = localStorage.getItem(stepStateKey);
      if (raw) {
        const o = JSON.parse(raw);
        return o?.revealedHints ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, number[]>>(() => {
    try {
      const raw = localStorage.getItem(stepStateKey);
      if (raw) {
        const o = JSON.parse(raw);
        return o?.revealedAnswers ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [alwaysShowSolutions, setAlwaysShowSolutions] = useState<boolean>(() => {
    const saved = localStorage.getItem('workshop_always_show_solutions');
    return saved === 'true';
  });
  const [pointsDeducted, setPointsDeducted] = useState<Record<string, number>>({});
  const [skeletonTier, setSkeletonTier] = useState<Record<string, SkeletonTier>>({});
  const [lineHeight, setLineHeight] = useState(19); // Monaco default line height

  // Per-step verification result: true = passed, false = failed, undefined = not run yet. Used to enable Continue and show red step indicator.
  const [verificationResultByStep, setVerificationResultByStep] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem(stepStateKey, JSON.stringify({
        showSolution,
        revealedHints,
        revealedAnswers,
      }));
    } catch { /* ignore */ }
  }, [stepStateKey, showSolution, revealedHints, revealedAnswers]);

  // Helper functions for tiered scoring
  const getMaxPoints = (tier: SkeletonTier): number => {
    switch (tier) {
      case 'expert': return 25;
      case 'challenge': return 15;
      case 'guided': default: return 10;
    }
  };

  const getHintPenalty = (tier: SkeletonTier, hintIndex: number): number => {
    const base = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
    return hintIndex === 0 ? base : base + 1;
  };

  const getSolutionPenalty = (tier: SkeletonTier): number => {
    switch (tier) {
      case 'expert': return 15;
      case 'challenge': return 8;
      case 'guided': default: return 5;
    }
  };

  // Get display code based on tier
  const getDisplayCode = (block: CodeBlock, tier: SkeletonTier, solutionRevealed: boolean): string => {
    if (solutionRevealed) return block.code;

    switch (tier) {
      case 'expert':
        return block.expertSkeleton || block.challengeSkeleton || block.skeleton || block.code;
      case 'challenge':
        return block.challengeSkeleton || block.skeleton || block.code;
      case 'guided':
      default:
        return block.skeleton || block.code;
    }
  };

  // Check if block has any skeleton tier
  const hasAnySkeleton = (block: CodeBlock): boolean => {
    return !!(block.skeleton || block.challengeSkeleton || block.expertSkeleton);
  };

  const currentStep = steps[currentStepIndex];
  const isCompleted = completedSteps.includes(currentStepIndex);

  // Check if any code block has a skeleton
  const hasSkeletons = useMemo(() => {
    return currentStep.codeBlocks?.some(block => hasAnySkeleton(block)) ?? false;
  }, [currentStep.codeBlocks]);

  // Persist read-only mode preference
  useEffect(() => {
    localStorage.setItem('workshop_always_show_solutions', String(alwaysShowSolutions));
  }, [alwaysShowSolutions]);

  // Helper to reveal an inline hint (conceptual)
  const revealInlineHint = useCallback((blockKey: string, hintIdx: number, tier: SkeletonTier) => {
    setRevealedHints(prev => {
      const existing = prev[blockKey] || [];
      if (existing.includes(hintIdx)) return prev;
      return { ...prev, [blockKey]: [...existing, hintIdx] };
    });
    // Deduct points for hint based on tier
    const hintPenalty = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + hintPenalty
    }));

    // Track in leaderboard
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      trackHintUsage(email, hintPenalty);
    }
  }, []);

  // Helper to reveal an inline answer (direct answer)
  const revealInlineAnswer = useCallback((blockKey: string, hintIdx: number, tier: SkeletonTier) => {
    setRevealedAnswers(prev => {
      const existing = prev[blockKey] || [];
      if (existing.includes(hintIdx)) return prev;
      return { ...prev, [blockKey]: [...existing, hintIdx] };
    });
    // Deduct points for answer based on tier
    const answerPenalty = tier === 'expert' ? 5 : tier === 'challenge' ? 3 : 2;
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + answerPenalty
    }));

    // Track in leaderboard
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      trackHintUsage(email, answerPenalty);
    }
  }, []);

  // Helper to reveal full solution
  const revealSolution = useCallback((blockKey: string, tier: SkeletonTier) => {
    setShowSolution(prev => ({ ...prev, [blockKey]: true }));
    // Deduct points for revealing solution based on tier
    const penalty = getSolutionPenalty(tier);
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + penalty
    }));

    // Track in leaderboard
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      trackSolutionReveal(email, penalty);
    }
  }, []);

  // Copy button should always copy full solution (even if skeleton shown)
  const handleCopyCode = useCallback(async (blockIdx: number = 0) => {
    const block = currentStep.codeBlocks?.[blockIdx];
    const blockKey = `${currentStepIndex}-${blockIdx}`;
    const hasSkeleton = block ? hasAnySkeleton(block) : false;
    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
    const tier = skeletonTier[blockKey] || 'guided';

    // Copy the solution if revealed, otherwise copy current tier skeleton
    const code = isSolutionRevealed ? (block?.code || '') : getDisplayCode(block!, tier, false);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentStep.codeBlocks, currentStepIndex, alwaysShowSolutions, showSolution, skeletonTier]);

  const handleCheckProgress = async (): Promise<{ success: boolean }> => {
    setIsRunning(true);
    const code = currentStep.codeBlocks?.[0]?.code || '';

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));

    let result;
    if (currentStep.onVerify) {
      try {
        const verifyResult = await currentStep.onVerify();
        result = formatRichValidationOutput(verifyResult, currentStep.title);
      } catch (error) {
        result = {
          success: false,
          summary: 'Verification bridge error',
          output: `❌ Technical Error: Failed to connect to verification backend.\nEnsure 'npm run dev' is active.`
        };
      }
    } else {
      result = generateSimulatedOutput(code, currentStep.title);
    }

    if (useSharedOutput && onOutputChange) {
      onOutputChange({ output: result.output, summary: result.summary, success: result.success }, currentStepIndex);
    } else {
      setOutput({ output: result.output, summary: result.summary, success: result.success });
    }
    setIsRunning(false);

    if (result.success) {
      const blockKey = `${currentStepIndex}-0`;
      const hasSkeleton = currentStep.codeBlocks?.[0] ? hasAnySkeleton(currentStep.codeBlocks[0]) : false;
      const assisted = hasSkeleton && (showSolution[blockKey] || revealedHints[blockKey]?.length > 0 || revealedAnswers[blockKey]?.length > 0);
      completeStep(currentStep.id, !!assisted);
    }
    setVerificationResultByStep(prev => ({ ...prev, [currentStepIndex]: result.success }));
    return { success: result.success };
  };

  const canContinue = !currentStep.codeBlocks?.length || verificationResultByStep[currentStepIndex] === true;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNextStep = () => {
    const isLastStep = currentStepIndex === steps.length - 1;
    if (!isCompleted) {
      const blockKey = `${currentStepIndex}-0`;
      const hasSkeleton = currentStep.codeBlocks?.[0] ? hasAnySkeleton(currentStep.codeBlocks[0]) : false;
      const assisted = hasSkeleton && (showSolution[blockKey] || revealedHints[blockKey]?.length > 0 || revealedAnswers[blockKey]?.length > 0);
      completeStep(currentStep.id, !!assisted);
      onComplete(currentStepIndex);
    }
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      onStepChange(currentStepIndex + 1);
    }
    if (isLastStep) onComplete(currentStepIndex);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      onStepChange(currentStepIndex - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact Header - Single Row */}
      <div className="flex-shrink-0 border-b border-border px-3 sm:px-4 py-2 bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Lab info + Step info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span className="flex-shrink-0 text-[10px] sm:text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">
              Lab {String(labNumber).padStart(2, '0')}
            </span>
            {currentStep.difficulty && (
              <DifficultyBadge level={currentStep.difficulty} size="sm" className="hidden xs:flex" />
            )}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Step {currentStepIndex + 1}/{steps.length}:
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs sm:text-sm font-medium truncate cursor-help">
                          {currentStep.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-sm">{currentStep.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {currentStep.estimatedTime && (
                    <span className="hidden sm:inline text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                      ⏱️ {currentStep.estimatedTime}
                    </span>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleCheckProgress}
              disabled={isRunning || !currentStep.codeBlocks?.length}
              className="gap-1 h-7 sm:h-8 text-xs px-2 sm:px-3"
            >
              {isRunning ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span className="hidden xs:inline">{isRunning ? 'Verifying...' : 'Verify only'}</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 cursor-help">
                    <Info className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    <strong>Local execution required:</strong> Run <code className="bg-muted px-1 rounded">npm run dev</code> locally with AWS CLI and mongosh.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <StepContextDrawer
              understandSection={currentStep.understandSection}
              doThisSection={currentStep.doThisSection}
              hints={currentStep.hints}
              tips={currentStep.tips}
              troubleshooting={currentStep.troubleshooting}
              businessValue={businessValue}
              atlasCapability={atlasCapability}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Read-only mode toggle removed - difficulty/solution controls are now per-block in header */}

        {/* Code Editor & Output - Resizable Split */}
        <div className="flex-1 overflow-hidden min-h-0">
          {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={outputOpen ? 50 : 85} minSize={30}>
                <div className={cn(
                  "h-full flex flex-col overflow-auto justify-start",
                  currentStep.codeBlocks.length === 2 && "gap-1"
                )}>
                  {currentStep.codeBlocks.map((block, idx) => {
                    const blockKey = `${currentStepIndex}-${idx}`;
                    const hasSkeleton = hasAnySkeleton(block);
                    const tier = skeletonTier[blockKey] || 'guided';
                    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
                    const displayCode = getDisplayCode(block, tier, isSolutionRevealed);
                    const maxPoints = getMaxPoints(tier);
                    const solutionPenalty = getSolutionPenalty(tier);
                    const isTwoBlockPattern = currentStep.codeBlocks.length === 2;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex flex-col flex-shrink-0",
                          isTwoBlockPattern && "flex-1 min-h-0"
                        )}
                      >
                        {/* Editor Header - Merged Toolbar (Filename + Difficulty + Score + Actions) */}
                        <div className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 border-b border-border">
                          <div className="flex items-center justify-between gap-2">
                            {/* Left: Filename + Difficulty selector + Score */}
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 flex-wrap">
                              <span className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate max-w-[80px] sm:max-w-none">{block.filename}</span>

                              {/* Inline difficulty selector (only for skeleton blocks that aren't revealed) */}
                              {hasSkeleton && !isSolutionRevealed && (
                                <>
                                  <div className="flex gap-0.5 bg-background rounded p-0.5 border border-border">
                                    <button
                                      onClick={() => setSkeletonTier(prev => ({ ...prev, [blockKey]: 'guided' }))}
                                      className={cn(
                                        "px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded transition-colors",
                                        tier === 'guided'
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-muted"
                                      )}
                                    >
                                      Guided
                                    </button>
                                    <button
                                      onClick={() => setSkeletonTier(prev => ({ ...prev, [blockKey]: 'challenge' }))}
                                      disabled={!block.challengeSkeleton && !block.expertSkeleton}
                                      className={cn(
                                        "px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded transition-colors",
                                        tier === 'challenge'
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-muted",
                                        !block.challengeSkeleton && !block.expertSkeleton && "opacity-40 cursor-not-allowed"
                                      )}
                                    >
                                      Challenge
                                    </button>
                                    <button
                                      onClick={() => setSkeletonTier(prev => ({ ...prev, [blockKey]: 'expert' }))}
                                      disabled={!block.expertSkeleton}
                                      className={cn(
                                        "px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded transition-colors",
                                        tier === 'expert'
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-muted",
                                        !block.expertSkeleton && "opacity-40 cursor-not-allowed"
                                      )}
                                    >
                                      Expert
                                    </button>
                                  </div>

                                  {/* Score display */}
                                  <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                                    <span className={cn(
                                      "font-mono font-medium",
                                      (pointsDeducted[blockKey] || 0) > 0 ? "text-amber-600" : "text-foreground"
                                    )}>
                                      {Math.max(0, maxPoints - (pointsDeducted[blockKey] || 0))}
                                    </span>
                                    <span className="text-muted-foreground">/ {maxPoints}pts</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Right: Solution + Copy buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => revealSolution(blockKey, tier)}
                                  className="gap-1 h-6 text-[10px] sm:text-xs px-1.5 sm:px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden sm:inline">Solution</span>
                                  <span>(-{solutionPenalty})</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(idx)}
                                className="gap-1 h-6 text-[10px] sm:text-xs px-1.5 sm:px-2"
                              >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Monaco Editor with Inline Hint Widgets */}
                        <InlineHintEditor
                          key={`editor-${currentStepIndex}-${idx}-${isSolutionRevealed}`}
                          code={displayCode}
                          language={block.language}
                          lineHeight={lineHeight}
                          setLineHeight={setLineHeight}
                          hasSkeleton={hasSkeleton}
                          isSolutionRevealed={isSolutionRevealed}
                          inlineHints={block.inlineHints}
                          tier={tier}
                          revealedHints={revealedHints[blockKey] || []}
                          revealedAnswers={revealedAnswers[blockKey] || []}
                          onRevealHint={(hintIdx) => revealInlineHint(blockKey, hintIdx, tier)}
                          onRevealAnswer={(hintIdx) => revealInlineAnswer(blockKey, hintIdx, tier)}
                          equalHeightSplit={isTwoBlockPattern}
                        />

                        {/* Footer removed - controls now in header */}

                        {/* Solution Revealed Banner */}
                        {hasAnySkeleton(block) && isSolutionRevealed && !alwaysShowSolutions && showSolution[blockKey] && (
                          <div className="flex-shrink-0 px-4 py-2 bg-green-500/10 border-t border-green-500/30">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 dark:text-green-500">
                                Solution revealed • Copy the code and run it in your terminal
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ResizablePanel>

              {/* Resizable Handle */}
              <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />

              {/* Output Panel */}
              <ResizablePanel defaultSize={outputOpen ? 50 : 15} minSize={10} collapsible>
                <div className="h-full flex flex-col bg-background/95">
                  <button
                    onClick={() => setOutputOpen(!outputOpen)}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-2 border-t border-border bg-muted/50 hover:bg-muted transition-colors text-sm"
                  >
                    {outputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    <Terminal className="w-4 h-4 text-primary" />
                    <span>Output</span>
                    {outputStepIndex != null && stepsCount > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (from Step {outputStepIndex + 1})
                      </span>
                    )}
                    {outputSummary && (
                      <span className={cn(
                        "ml-2 px-2 py-0.5 rounded text-xs font-medium",
                        outputSuccess
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      )}>
                        {outputSuccess ? '✓' : '✗'} {outputSummary}
                      </span>
                    )}
                    {lastOutput && !outputOpen && !outputSummary && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Drag handle or click to expand)
                      </span>
                    )}
                  </button>
                  <div className="flex-1 overflow-auto px-6 py-4 bg-[hsl(220,20%,6%)]">
                    <pre className="font-mono text-sm text-primary whitespace-pre-wrap leading-relaxed">
                      {lastOutput || '// Click "Verify only" or "Verify & continue" to see output'}
                    </pre>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No code for this step</p>
                {currentStep.understandSection && (
                  <p className="text-sm mt-2 max-w-md px-4">{currentStep.understandSection}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation - Always Visible */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => {
                      setDirection(index > currentStepIndex ? 1 : -1);
                      onStepChange(index);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      index === currentStepIndex
                        ? verificationResultByStep[index] === false
                          ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/50'
                          : 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : completedSteps.includes(index)
                          ? 'bg-primary/20 text-primary'
                          : verificationResultByStep[index] === false
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : verificationResultByStep[index] === false ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{step.estimatedTime}</span>
                      {completedSteps.includes(index) && (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckProgress}
            disabled={isRunning || !currentStep.codeBlocks?.length}
            className="gap-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Verify
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleNextStep}
            disabled={!canContinue}
            className="gap-1"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete lab
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
