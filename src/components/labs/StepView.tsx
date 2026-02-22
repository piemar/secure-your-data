import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Terminal, Copy, Check, Loader2, BookOpen, Clock, Lock, Eye, Unlock, XCircle, Play, Square, FileCode } from 'lucide-react';
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
import { validatorUtils } from '@/utils/validatorUtils';
import { toast } from 'sonner';
import { type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { InlineHintEditor } from './InlineHintEditor';

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  /** editor-window = edit code/commands only (no Run); terminal-window = shell, supports Run line/selection/all + terminal input */
  blockType?: 'editor-window' | 'terminal-window';
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
  /** Verification result (Verify button) – shown in "Verify result" tab */
  lastVerifyOutput?: string;
  outputSummary?: string;
  outputSuccess?: boolean;
  outputOpen?: boolean;
  outputStepIndex?: number | null;
  stepsCount?: number;
  onOutputChange?: (result: { output: string; summary?: string; success?: boolean; source?: 'console' | 'verify' }, stepIndex: number) => void;
  onOutputOpenChange?: (open: boolean) => void;
  /** Called when user resets the current step; parent should clear step output and completion */
  onResetStep?: (stepIndex: number) => void;
  /** Controlled help drawer (opened from top bar) */
  helpDrawerOpen?: boolean;
  onHelpDrawerOpenChange?: (open: boolean) => void;
  /** When this changes, clear verification state for current step (after top bar Reset step) */
  resetStepTrigger?: number;
  /** Register a function to clear step state (hints/solutions) for a given step index. Parent calls this when Reset step is clicked so UI updates in the same tick. */
  registerResetStepClearer?: (clear: (stepIndex: number) => void) => void;
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
  lastVerifyOutput: parentLastVerifyOutput,
  outputSummary: parentOutputSummary,
  outputSuccess: parentOutputSuccess,
  outputOpen: parentOutputOpen,
  outputStepIndex: parentOutputStepIndex,
  stepsCount = 0,
  onOutputChange,
  onOutputOpenChange,
  onResetStep,
  helpDrawerOpen,
  onHelpDrawerOpenChange,
  resetStepTrigger = 0,
  registerResetStepClearer,
}: StepViewProps) {
  const { completeStep, mongoUri: labMongoUri } = useLab();
  const [activeTab, setActiveTab] = useState<string>('code');
  const [localOutputOpen, setLocalOutputOpen] = useState(false);
  const [localLastOutput, setLocalLastOutput] = useState<string>('');
  const [localVerifyOutput, setLocalVerifyOutput] = useState<string>('');
  const [localOutputSummary, setLocalOutputSummary] = useState<string>('');
  const [localOutputSuccess, setLocalOutputSuccess] = useState<boolean>(true);
  const [outputPanelTab, setOutputPanelTab] = useState<'verify' | 'console'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(0);

  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, steps.length - 1));
  const useSharedOutput = onOutputChange != null && onOutputOpenChange != null;
  const lastOutput = useSharedOutput ? (parentLastOutput ?? '') : localLastOutput;
  const lastVerifyOutput = useSharedOutput ? (parentLastVerifyOutput ?? '') : localVerifyOutput;
  const outputSummary = useSharedOutput ? (parentOutputSummary ?? '') : localOutputSummary;
  const outputSuccess = useSharedOutput ? (parentOutputSuccess !== false) : localOutputSuccess;
  const outputOpen = useSharedOutput ? (parentOutputOpen ?? false) : localOutputOpen;
  const outputStepIndex = useSharedOutput ? (parentOutputStepIndex ?? null) : null;
  const setOutputOpen = useSharedOutput ? (v: boolean) => onOutputOpenChange?.(v) : setLocalOutputOpen;
  const setOutput = useSharedOutput
    ? (result: { output: string; summary?: string; success?: boolean }) => { /* parent handles via onOutputChange */ }
    : (result: { output: string; summary?: string; success?: boolean }) => {
        setLocalLastOutput(result.output);
        if (result.summary != null) setLocalOutputSummary(result.summary);
        if (result.success !== undefined) setLocalOutputSuccess(result.success);
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
  const editorRefsByBlock = useRef<Record<string, any>>({});
  const outputScrollRef = useRef<HTMLDivElement>(null);
  const [isRunBashLoading, setIsRunBashLoading] = useState(false);

  // Keep output panel scrolled to bottom when new run/verify output is appended
  useEffect(() => {
    const el = outputScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastOutput, lastVerifyOutput]);

  // When parent triggers reset from top bar, clear verification and step state (hints/solutions) for current step
  useEffect(() => {
    const safeIdx = Math.min(currentStepIndex, Math.max(0, steps.length - 1));
    if (resetStepTrigger > 0 && steps[safeIdx]) {
      const step = steps[safeIdx];
      const blockKeys = (step.codeBlocks ?? []).map((_, i) => `${safeIdx}-${i}`);
      setVerificationResultByStep(prev => {
        const next = { ...prev };
        delete next[safeIdx];
        return next;
      });
      setShowSolution(prev => {
        const next = { ...prev };
        blockKeys.forEach(k => { delete next[k]; });
        return next;
      });
      setRevealedHints(prev => {
        const next = { ...prev };
        blockKeys.forEach(k => { delete next[k]; });
        return next;
      });
      setRevealedAnswers(prev => {
        const next = { ...prev };
        blockKeys.forEach(k => { delete next[k]; });
        return next;
      });
      setPointsDeducted(prev => {
        const next = { ...prev };
        blockKeys.forEach(k => { delete next[k]; });
        return next;
      });
      setSkeletonTier(prev => {
        const next = { ...prev };
        blockKeys.forEach(k => { delete next[k]; });
        return next;
      });
    }
  }, [resetStepTrigger, currentStepIndex, steps.length, steps]);

  // Register clearer so parent can clear step state synchronously when Reset step is clicked (so editor remounts with skeleton in same tick)
  useEffect(() => {
    if (!registerResetStepClearer) return;
    registerResetStepClearer((stepIndex: number) => {
      const step = steps[stepIndex];
      if (!step?.codeBlocks?.length) return;
      const blockKeys = step.codeBlocks.map((_, i) => `${stepIndex}-${i}`);
      setVerificationResultByStep(prev => { const n = { ...prev }; delete n[stepIndex]; return n; });
      setShowSolution(prev => { const n = { ...prev }; blockKeys.forEach(k => { delete n[k]; }); return n; });
      setRevealedHints(prev => { const n = { ...prev }; blockKeys.forEach(k => { delete n[k]; }); return n; });
      setRevealedAnswers(prev => { const n = { ...prev }; blockKeys.forEach(k => { delete n[k]; }); return n; });
      setPointsDeducted(prev => { const n = { ...prev }; blockKeys.forEach(k => { delete n[k]; }); return n; });
      setSkeletonTier(prev => { const n = { ...prev }; blockKeys.forEach(k => { delete n[k]; }); return n; });
    });
  }, [registerResetStepClearer, steps]);

  // Compact run log: timestamp, single $ for the command block, then output. One $ only (not per line).
  const appendRunLog = useCallback((
    commands: string[],
    stdout: string,
    stderr: string,
    success: boolean,
    errorMsg?: string
  ) => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const compact = (s: string) => s.replace(/\n{3,}/g, '\n\n').trim();
    const out = compact(stdout || '');
    const err = compact(stderr || '');
    const cmdBlock = commands.length === 0
      ? ''
      : commands.length === 1
        ? `$ ${commands[0]}`
        : `$ ${commands[0]}\n${commands.slice(1).join('\n')}`;
    const lines = [
      `[${ts}]`,
      ...(cmdBlock ? [cmdBlock] : []),
      ...(errorMsg ? [errorMsg] : []),
      ...(out ? [out] : []),
      ...(err ? [err] : []),
    ].filter(Boolean);
    const snippet = '\n' + lines.join('\n') + '\n—\n';
    const newOutput = (lastOutput || '').trimEnd() + snippet;
    if (useSharedOutput && onOutputChange) {
      onOutputChange({ output: newOutput, summary: success ? 'OK' : 'Failed', success, source: 'console' }, safeStepIndex);
    } else {
      setLocalLastOutput(newOutput);
      setLocalOutputOpen(true);
    }
    setOutputOpen(true);
    setOutputPanelTab('console');
  }, [safeStepIndex, useSharedOutput, onOutputChange, lastOutput]);

  // Run in browser: shell, node, or mongosh. Only for terminal-window blocks. Optional: resolve node <file> from editor-window content.
  const runInBrowser = useCallback(async (
    block: CodeBlock,
    commands: string[],
    options?: { getEditorWindowContent?: (filename: string) => string | undefined }
  ) => {
    if (commands.length === 0) return;
    setIsRunBashLoading(true);
    try {
      const filename = (block.filename || '').toLowerCase();
      const isMongosh = filename.includes('mongosh');
      const isNode = block.language === 'javascript' && (filename.includes('.cjs') || filename.includes('node'));
      const isBash = block.language === 'bash' || block.language === 'shell';

      // When running from terminal: "node createKey.cjs" → run editor-window content as Node
      const nodeFileMatch = commands.length === 1 && commands[0].trim().match(/^node\s+(\S+)/);
      const nodeFileContent = nodeFileMatch && options?.getEditorWindowContent
        ? options.getEditorWindowContent(nodeFileMatch[1].trim())
        : undefined;
      if (nodeFileContent !== undefined && nodeFileContent !== '') {
        const res = await fetch('/api/run-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: nodeFileContent, uri: labMongoUri || '' }),
        });
        const data = await res.json();
        appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true, data.error ? data.message : undefined);
        return;
      }
      if (nodeFileMatch) {
        appendRunLog(commands, '', '', false, 'No matching editor-window file. Edit the file in the first pane and ensure its name matches.');
        return;
      }

      // When "Run all" has multiple lines and one is "node <file>", run that via run-node with editor content and the rest via run-bash
      if (isBash && commands.length > 1 && options?.getEditorWindowContent) {
        const bashCommands: string[] = [];
        const nodeRuns: { cmd: string; filename: string }[] = [];
        for (const line of commands) {
          const t = line.trim();
          if (!t || t.startsWith('#')) continue;
          const m = t.match(/^node\s+(\S+)/);
          if (m && options.getEditorWindowContent(m[1].trim())) {
            nodeRuns.push({ cmd: t, filename: m[1].trim() });
          } else {
            bashCommands.push(line);
          }
        }
        if (bashCommands.length > 0) {
          const resBash = await fetch('/api/run-bash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands: bashCommands }),
          });
          const dataBash = await resBash.json();
          appendRunLog(bashCommands, dataBash.stdout || '', dataBash.stderr || '', dataBash.exitCode === 0);
        }
        for (const { cmd, filename } of nodeRuns) {
          const code = options.getEditorWindowContent(filename);
          if (!code) continue;
          const resNode = await fetch('/api/run-node', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, uri: labMongoUri || '' }),
          });
          const dataNode = await resNode.json();
          appendRunLog([cmd], dataNode.stdout || '', dataNode.stderr || '', dataNode.success === true, dataNode.message);
        }
        if (bashCommands.length > 0 || nodeRuns.length > 0) {
          return;
        }
      }

      // When running from terminal: "bash script.sh" or "sh script.sh" → run editor-window file content via run-bash
      const bashShMatch = commands.length === 1 && commands[0].trim().match(/^(?:bash|sh)\s+(\S+)/);
      const bashShFilename = bashShMatch?.[1]?.trim();
      const bashShContent = bashShFilename && options?.getEditorWindowContent
        ? options.getEditorWindowContent(bashShFilename)
        : undefined;
      if (bashShContent !== undefined && bashShContent !== '') {
        const scriptLines = bashShContent.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (scriptLines.length > 0) {
          const res = await fetch('/api/run-bash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands: scriptLines }),
          });
          const data = await res.json();
          appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true);
          return;
        }
      }
      if (bashShMatch) {
        appendRunLog(commands, '', '', false, 'No matching file. Edit the file in the first pane and ensure its name matches.');
        return;
      }

      // When running from terminal: "mongosh keyvault-setup.js" → run editor-window file content via run-mongosh
      const mongoshFileMatch = commands.length === 1 && commands[0].trim().match(/^mongosh\s+(\S+)/);
      const mongoshFile = mongoshFileMatch?.[1]?.trim();
      const mongoshFileContent = mongoshFile && options?.getEditorWindowContent
        ? options.getEditorWindowContent(mongoshFile)
        : undefined;
      if (mongoshFileContent !== undefined && mongoshFileContent !== '' && labMongoUri) {
        const scriptLines = mongoshFileContent.split(/\r?\n/).filter(c => !/^\s*mongosh\s+['"]/.test(c));
        const scriptCode = scriptLines.join('\n').trim();
        if (scriptCode) {
          const res = await fetch('/api/run-mongosh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: scriptCode, uri: labMongoUri }),
          });
          const data = await res.json();
          appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true, data.error ? data.message : undefined);
          return;
        }
      }
      if (mongoshFileMatch) {
        if (!labMongoUri) {
          appendRunLog(commands, '', '', false, 'Error: No MongoDB URI. Set it in Lab Setup.');
        } else {
          appendRunLog(commands, '', '', false, 'No matching file. Edit the file in the first pane and ensure its name matches.');
        }
        return;
      }

      // mongosh "uri" starts an interactive shell and never returns — don't run it in-browser
      const looksLikeShellMongosh = commands.length > 0 && commands.every(c => /^\s*mongosh\s+['"]/.test(c));
      if (isMongosh && looksLikeShellMongosh) {
        appendRunLog(commands, '', '', false, 'This starts an interactive mongosh session. Run it in your terminal, or use Run all to execute the script part in-browser.');
        return;
      }
      if (isBash) {
        const res = await fetch('/api/run-bash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commands }),
        });
        const data = await res.json();
        appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true);
        return;
      }
      if (isMongosh) {
        if (!labMongoUri) {
          appendRunLog(commands, '', '', false, 'Error: No MongoDB URI. Set it in Lab Setup.');
          return;
        }
        // Strip connection lines (mongosh "uri") so we only run the script via --eval; connection uses lab URI
        const scriptLines = commands.filter(c => !/^\s*mongosh\s+['"]/.test(c));
        const scriptCode = scriptLines.join('\n').trim();
        if (!scriptCode) {
          appendRunLog(commands, '', '', false, 'No script to run. Run all to execute the full block (script runs in-browser); run the connection command in your terminal for interactive mode.');
          return;
        }
        const res = await fetch('/api/run-mongosh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: scriptCode, uri: labMongoUri }),
        });
        const data = await res.json();
        appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true, data.error ? data.message : undefined);
        return;
      }
      if (isNode) {
        const res = await fetch('/api/run-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: commands.join('\n'), uri: labMongoUri || '' }),
        });
        const data = await res.json();
        appendRunLog(commands, data.stdout || '', data.stderr || '', data.success === true, data.error ? data.message : undefined);
        return;
      }
      appendRunLog(commands, '', '', false, 'Run in terminal for this block type.');
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      appendRunLog(commands, '', '', false, errMsg);
    } finally {
      setIsRunBashLoading(false);
    }
  }, [appendRunLog, labMongoUri]);

  // Resolve block type: explicit blockType, or first block = editor-window, second = terminal-window, else terminal-window
  const getBlockType = useCallback((block: CodeBlock, blockIdx: number, codeBlocks: CodeBlock[]): 'editor-window' | 'terminal-window' => {
    if (block.blockType) return block.blockType;
    if (codeBlocks.length === 2) return blockIdx === 0 ? 'editor-window' : 'terminal-window';
    return 'terminal-window';
  }, []);

  // Resolve "node createKey.cjs" from terminal: return content of editor-window block whose filename matches
  const getEditorWindowContent = useCallback((filenameHint: string): string | undefined => {
    const safeIdx = Math.min(currentStepIndex, Math.max(0, steps.length - 1));
    const blocks = steps[safeIdx]?.codeBlocks ?? [];
    const hint = filenameHint.toLowerCase().trim();
    for (let i = 0; i < blocks.length; i++) {
      if (getBlockType(blocks[i], i, blocks) !== 'editor-window') continue;
      const f = (blocks[i].filename || '').toLowerCase();
      if (!f.includes(hint)) continue;
      const key = `${safeIdx}-${i}`;
      return editorRefsByBlock.current[key]?.getModel()?.getValue() ?? undefined;
    }
    return undefined;
  }, [steps, currentStepIndex, steps.length, getBlockType]);

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

  const currentStep = steps[safeStepIndex];
  const isCompleted = completedSteps.includes(safeStepIndex);

  // Check if any code block has a skeleton
  const hasSkeletons = useMemo(() => {
    return currentStep?.codeBlocks?.some(block => hasAnySkeleton(block)) ?? false;
  }, [currentStep?.codeBlocks]);

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
    const blockKey = `${safeStepIndex}-${blockIdx}`;
    const hasSkeleton = block ? hasAnySkeleton(block) : false;
    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
    const tier = skeletonTier[blockKey] || 'guided';

    // Copy the solution if revealed, otherwise copy current tier skeleton
    const code = isSolutionRevealed ? (block?.code || '') : getDisplayCode(block!, tier, false);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentStep?.codeBlocks, safeStepIndex, alwaysShowSolutions, showSolution, skeletonTier]);

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
      onOutputChange({ output: result.output, summary: result.summary, success: result.success, source: 'verify' }, safeStepIndex);
    } else {
      setLocalVerifyOutput(result.output);
      setLocalOutputSummary(result.summary ?? '');
      setLocalOutputSuccess(result.success ?? false);
      setLocalOutputOpen(true);
    }
    setOutputOpen(true);
    setOutputPanelTab('verify');
    setIsRunning(false);

    if (result.success) {
      const blockKey = `${safeStepIndex}-0`;
      const hasSkeleton = currentStep.codeBlocks?.[0] ? hasAnySkeleton(currentStep.codeBlocks[0]) : false;
      const assisted = hasSkeleton && (showSolution[blockKey] || revealedHints[blockKey]?.length > 0 || revealedAnswers[blockKey]?.length > 0);
      completeStep(currentStep.id, !!assisted);
    }
    setVerificationResultByStep(prev => ({ ...prev, [safeStepIndex]: result.success }));
    return { success: result.success };
  };

  const canContinue = !currentStep?.codeBlocks?.length || verificationResultByStep[safeStepIndex] === true;
  const isLastStep = safeStepIndex === steps.length - 1;

  const handleNextStep = () => {
    const isLastStep = safeStepIndex === steps.length - 1;
    if (!isCompleted) {
      const blockKey = `${safeStepIndex}-0`;
      const hasSkeleton = currentStep.codeBlocks?.[0] ? hasAnySkeleton(currentStep.codeBlocks[0]) : false;
      const assisted = hasSkeleton && (showSolution[blockKey] || revealedHints[blockKey]?.length > 0 || revealedAnswers[blockKey]?.length > 0);
      completeStep(currentStep.id, !!assisted);
      onComplete(safeStepIndex);
    }
    if (safeStepIndex < steps.length - 1) {
      setDirection(1);
      onStepChange(safeStepIndex + 1);
    }
    if (isLastStep) onComplete(safeStepIndex);
  };

  const handlePrevStep = () => {
    if (safeStepIndex > 0) {
      setDirection(-1);
      onStepChange(safeStepIndex - 1);
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
            <span className="flex-shrink-0 text-xs font-medium text-primary border border-primary/30 bg-primary/5 px-2 py-1 rounded">
              Lab {String(labNumber).padStart(2, '0')}
            </span>
            <span className="text-muted-foreground/80 text-xs flex-shrink-0">
              {safeStepIndex + 1}/{steps.length}
            </span>
            {currentStep.difficulty && (
              <DifficultyBadge level={currentStep.difficulty} size="sm" className="hidden xs:flex" />
            )}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={safeStepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium truncate cursor-help">
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

          {/* Right: Verify only (Reset step + Help are in top bar) */}
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
              <span className="hidden xs:inline">{isRunning ? 'Verifying...' : 'Verify'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Help drawer (controlled from top bar) */}
      {helpDrawerOpen !== undefined && onHelpDrawerOpenChange && (
        <StepContextDrawer
          understandSection={currentStep.understandSection}
          doThisSection={currentStep.doThisSection}
          hints={currentStep.hints}
          tips={currentStep.tips}
          troubleshooting={currentStep.troubleshooting}
          businessValue={businessValue}
          atlasCapability={atlasCapability}
          open={helpDrawerOpen}
          onOpenChange={onHelpDrawerOpenChange}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Read-only mode toggle removed - difficulty/solution controls are now per-block in header */}

        {/* Code Editor & Output - Resizable Split */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
            <>
              <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0">
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={outputOpen ? 50 : 85} minSize={30} className="min-h-0">
                <div className={cn(
                  "h-full min-h-0 flex flex-col overflow-auto justify-start",
                  currentStep.codeBlocks.length === 2 && "gap-1"
                )}>
                  {currentStep.codeBlocks.map((block, idx) => {
                    const blockKey = `${safeStepIndex}-${idx}`;
                    const hasSkeleton = hasAnySkeleton(block);
                    const tier = skeletonTier[blockKey] || 'guided';
                    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
                    const displayCode = getDisplayCode(block, tier, isSolutionRevealed);
                    const maxPoints = getMaxPoints(tier);
                    const solutionPenalty = getSolutionPenalty(tier);
                    const isTwoBlockPattern = currentStep.codeBlocks.length === 2;
                    const isTerminalWindow = getBlockType(block, idx, currentStep.codeBlocks) === 'terminal-window';
                    const runOptions = isTerminalWindow ? { getEditorWindowContent } : undefined;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex flex-col min-h-0",
                          (currentStep.codeBlocks.length === 1 || currentStep.codeBlocks.length === 2)
                            ? "flex-1 overflow-hidden"
                            : "flex-shrink-0"
                        )}
                      >
                        {/* Editor Header - GitHub-style path for file; Terminal with clear height */}
                        <div className={cn(
                          "flex-shrink-0 min-h-[36px] px-3 sm:px-4 py-2 border-b flex items-center",
                          isTerminalWindow
                            ? "bg-[hsl(220,18%,7%)] border-[hsl(142,70%,25%)] border-l-4 border-l-green-600/80"
                            : "bg-muted/50 border-border"
                        )}>
                          <div className="flex items-center justify-between gap-2 w-full">
                            {/* Left: path/file like GitHub (lab / filename) or Terminal */}
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 flex-wrap">
                              {isTerminalWindow ? (
                                <>
                                  <Terminal className="w-4 h-4 text-green-500/90 shrink-0" aria-hidden />
                                  <span className="text-sm font-medium text-green-400/95 truncate">
                                    Terminal Pane
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FileCode className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                                    {(() => {
                                      const raw = (block.filename || '').trim();
                                      const beforeParen = raw.split(/\s+\(/)[0].trim();
                                      const short = beforeParen.replace(/^\d+\.\s*/, '').trim() || beforeParen || raw || 'file';
                                      return short;
                                    })()}
                                  </span>
                                  {/* Points for skeleton blocks */}
                                  {hasSkeleton && !isSolutionRevealed && (
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                      <span className={cn(
                                        "font-mono font-medium",
                                        (pointsDeducted[blockKey] || 0) > 0 ? "text-amber-600" : "text-foreground"
                                      )}>
                                        {Math.max(0, maxPoints - (pointsDeducted[blockKey] || 0))}
                                      </span>
                                      <span>/ {maxPoints}pts</span>
                                    </div>
                                  )}
                                </>
                              )}

                            </div>

                            {/* Right: Terminal = Run selection/all; then Solution + Copy */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isTerminalWindow && (block.language === 'bash' || block.language === 'shell' || block.language === 'javascript') && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRunBashLoading}
                                    onClick={() => {
                                      const editor = editorRefsByBlock.current[blockKey];
                                      if (!editor) return;
                                      const model = editor.getModel();
                                      const sel = editor.getSelection();
                                      if (!model || !sel) return;
                                      const text = model.getValueInRange(sel).trim();
                                      if (!text) return;
                                      const lines = text.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
                                      if (lines.length) runInBrowser(block, lines, runOptions);
                                    }}
                                    className="gap-1 h-6 text-[10px] px-1.5 sm:px-2"
                                    title="Run selection"
                                  >
                                    <Square className="w-3 h-3" />
                                    <span className="hidden sm:inline">Run selection</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRunBashLoading}
                                    onClick={() => {
                                      const editor = editorRefsByBlock.current[blockKey];
                                      if (!editor) return;
                                      const model = editor.getModel();
                                      if (!model) return;
                                      const full = model.getValue();
                                      const lines = full.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
                                      if (lines.length) runInBrowser(block, lines, runOptions);
                                    }}
                                    className="gap-1 h-6 text-[10px] px-1.5 sm:px-2"
                                    title="Run all"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span className="hidden sm:inline">Run all</span>
                                  </Button>
                                </>
                              )}
                              {(hasSkeleton || block.code) && !(alwaysShowSolutions || showSolution[blockKey]) && (
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
                        <div className={cn(
                          "min-h-0 flex-1 flex flex-col overflow-auto",
                          isTerminalWindow && "bg-[hsl(220,18%,6%)] rounded-b border border-t-0 border-green-900/50 ring-inset"
                        )}>
                          <InlineHintEditor
                            key={`editor-${safeStepIndex}-${idx}-${isSolutionRevealed}-${resetStepTrigger}`}
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
                            equalHeightSplit={currentStep.codeBlocks.length === 1 || isTwoBlockPattern}
                            onEditorMount={(editor) => { editorRefsByBlock.current[blockKey] = editor; }}
                            editable={block.language === 'bash' || block.language === 'shell' || block.language === 'javascript'}
                            showLineNumbers={!isTerminalWindow}
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>
              </ResizablePanel>

              {/* Resizable Handle */}
              <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />

              {/* Log panes: Output (verify) | Terminal (console) - tabs only */}
              <ResizablePanel defaultSize={outputOpen ? 50 : 15} minSize={10} collapsible className="min-h-0 flex flex-col">
                <div className="h-full min-h-0 flex flex-col bg-background/95">
                  <div className="flex-shrink-0 flex items-center border-t border-border bg-muted/40">
                    <button
                      onClick={() => setOutputOpen(!outputOpen)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      title={outputOpen ? 'Collapse' : 'Expand'}
                    >
                      {outputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <div className="flex flex-1">
                      <button
                        onClick={() => setOutputPanelTab('verify')}
                        className={cn(
                          "px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                          outputPanelTab === 'verify'
                            ? "text-primary border-primary bg-background/80"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Output
                      </button>
                      <button
                        onClick={() => setOutputPanelTab('console')}
                        className={cn(
                          "px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                          outputPanelTab === 'console'
                            ? "text-primary border-primary bg-background/80"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Terminal
                      </button>
                    </div>
                    {outputStepIndex != null && stepsCount > 0 && (
                      <span className="text-[10px] text-muted-foreground px-2">Step {outputStepIndex + 1}</span>
                    )}
                    {outputSummary && (
                      <span className={cn(
                        "mr-2 px-2 py-0.5 rounded text-[10px] font-medium",
                        outputSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {outputSuccess ? '✓' : '✗'} {outputSummary}
                      </span>
                    )}
                  </div>
                  <div ref={outputScrollRef} className="flex-1 min-h-0 overflow-auto px-4 py-3 bg-[hsl(220,20%,6%)]">
                    {outputPanelTab === 'verify' ? (
                      <>
                        {/* Show "Clear key vault" when verification failed due to too many DEKs */}
                        {lastVerifyOutput && (lastVerifyOutput.includes('Found') && lastVerifyOutput.includes('DEK') && lastVerifyOutput.includes('expected 1')) && (
                          <div className="mb-3 p-3 rounded-md border border-amber-500/30 bg-amber-500/5 flex flex-col gap-2">
                            <p className="text-xs text-foreground font-medium">Too many DEKs in key vault — clear them to pass this step:</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-amber-500/50 hover:bg-amber-500/10"
                                onClick={async () => {
                                  if (!labMongoUri?.trim()) {
                                    toast.error('MongoDB URI is required. Set it in Lab Setup.');
                                    return;
                                  }
                                  const result = await validatorUtils.cleanupKeyVault(labMongoUri);
                                  if (result.success) {
                                    toast.success(result.message);
                                    toast.info('Go to Step 4, run createKey.cjs once, then return here and click Verify.');
                                  } else {
                                    toast.error(result.message);
                                  }
                                }}
                              >
                                Clear key vault (remove all DEKs)
                              </Button>
                              <span className="text-[11px] text-muted-foreground">Then run createKey.cjs once in Step 4 and verify again.</span>
                            </div>
                          </div>
                        )}
                        <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-snug">
                          {lastVerifyOutput || 'Click Verify to run the step check. Result appears here.'}
                        </pre>
                      </>
                    ) : (
                      <pre className="font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-snug">
                        {lastOutput || 'Run a command to see output here.'}
                      </pre>
                    )}
                  </div>
                </div>
              </ResizablePanel>
              </ResizablePanelGroup>
            </>
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
                      setDirection(index > safeStepIndex ? 1 : -1);
                      onStepChange(index);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      index === safeStepIndex
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
            disabled={safeStepIndex === 0}
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
