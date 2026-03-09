import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Terminal, Copy, Check, Loader2, BookOpen, Clock, Lock, Eye, Unlock, GitCompare, Play, RotateCcw, FileCode, PlayCircle, Layout, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DifficultyBadge, DifficultyLevel } from './DifficultyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { StepContextDrawer } from './StepContextDrawer';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackHintUsage } from '@/utils/leaderboardUtils';
import { type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { InlineHintEditor } from './InlineHintEditor';
import { getCompetitorProductLabel } from '@/content/competitor-products';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GenericLabPreview } from './GenericLabPreview';
import { getReadOnlyLabOptions, defineLabDarkTheme, getLabEditorTheme } from '@/lib/monacoLabEditorOptions';
import { useTheme } from 'next-themes';
import type { LabStepPreviewConfig, LabPreviewData } from '@/types';
import { useLab } from '@/context/LabContext';
import {
  loadLabWorkspace,
  saveLabWorkspace,
  logEntriesToStored,
  storedToLogEntries,
} from '@/services/labWorkspaceStorage';
import { getVerificationService, type VerificationId } from '@/services/verificationService';
import { executionService, formatForConsole, formatBashRunOutput, prepareCSharpProject } from '@/services/execution';
import { getWorkshopSession } from '@/utils/workshopUtils';
import { getLabUserSuffix } from '@/labs/stepEnhancementRegistry';
import { toast } from 'sonner';
import { useIdeContextOptional } from '@/context/IdeContext';
import { createOutputSurface } from '@/services/execution/outputSurface';
import { createDocumentStore } from '@/services/workspace';
import type { TerminalSession } from '@/types/ide';
import { XtermTerminal } from '@/components/terminal/XtermTerminal';

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  skeleton?: string;           // Tier 1: Guided (blanks with structure)
  challengeSkeleton?: string;  // Tier 2: Challenge (tasks only)
  expertSkeleton?: string;     // Tier 3: Expert (objective only)
  inlineHints?: InlineHint[];  // Line-specific hints for skeleton blanks
  competitorEquivalents?: Record<
    string,
    {
      language: string;
      code: string;
      workaroundNote?: string;
      /** Short bullets on challenges doing it the competitor way */
      challenges?: string[];
      /** Optional comparison text or capability matrix (markdown or plain text) */
      comparisonSummary?: string;
    }
  >;
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
  /** Optional elevated experience: app-like preview (search, table, chart, etc.) */
  preview?: LabStepPreviewConfig;
  /** When set, real validation runs (validatorUtils/API) before allowing Next */
  onVerify?: () => Promise<{ success: boolean; message: string }>;
  /** Alternative: verification ID for content-driven labs (VerificationService) */
  verificationId?: string;
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
  /** When true and step has competitorEquivalents, show side-by-side competitor panel (demo + moderator only) */
  currentMode?: 'demo' | 'lab' | 'challenge';
  isModerator?: boolean;
  defaultCompetitorId?: string;
  competitorIds?: string[];
  /** MongoDB URI for lab Run (run-node / run-mongosh). When set, Run button calls real APIs when possible. */
  labMongoUri?: string;
  /** When set, StepView assigns reset/check/openHelp/reportIssue so parent can render toolbar on same line as Overview/Steps */
  stepToolbarRef?: React.MutableRefObject<{ reset: () => void; openHelp: () => void; reportIssue?: () => void } | null>;
  /** Called when report issue sending state changes so parent can show loading on Report issue button */
  onReportSendingChange?: (sending: boolean) => void;
  /** Increments when user resets progress; StepView clears hints and reloads workspace when this changes */
  resetProgressCount?: number;
  /** Called when user resets the current step so parent can uncomplete it (e.g. remove from completedSteps) */
  onResetStep?: (stepIndex: number) => void;
  /** When Run is used, called with the editor content so the lab can echo it to the Terminal (or switch to Terminal tab if no session). */
  onRunEchoToTerminal?: (payload: { code: string; language: string; filename?: string }) => void;
  /** When set, the bottom panel shows the terminal (xterm) instead of the log; run output is written here and status stays in the terminal header. */
  terminalSession?: TerminalSession | null;
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
  
  // Atlas Search / text-search: index creation, $search, autocomplete, facets, highlight
  if (lowerCode.includes('mappings') && (lowerCode.includes('"fields"') || lowerCode.includes("'fields'"))) {
    return {
      success: true,
      summary: 'Atlas Search index created',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Index created successfully. Index is building in the background.
   Use the Atlas UI or getSearchIndexes() to confirm when ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    };
  }
  if (lowerCode.includes('$search') && lowerCode.includes('text')) {
    return {
      success: true,
      summary: 'Text search query executed',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Sample results (top 3):
[
  { "_id": 1, "name": "Wireless Headphones", "score": 2.84 },
  { "_id": 2, "name": "Wire Charger", "score": 2.12 },
  { "_id": 3, "name": "USB Cable", "score": 1.45 }
]

💡 Use $meta: "searchScore" to project the relevance score.`
    };
  }
  if (lowerCode.includes('$search') && lowerCode.includes('autocomplete')) {
    return {
      success: true,
      summary: 'Autocomplete suggestions returned',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Suggestions:
[
  { "_id": "prod1", "name": "Wireless Headphones" },
  { "_id": "prod2", "name": "Wire Charger" }
]

💡 Use the autocomplete operator with edgeGram tokenization for typeahead.`
    };
  }
  if (lowerCode.includes('searchscore') || lowerCode.includes('searchScore')) {
    return {
      success: true,
      summary: 'Results with score projected and sorted',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Results sorted by relevance:
[
  { "name": "Wireless Headphones", "description": "...", "score": 2.84 },
  { "name": "Wire Charger", "description": "...", "score": 2.12 }
]

💡 Sort by score descending to show most relevant first.`
    };
  }
  if (lowerCode.includes('$facet') && lowerCode.includes('$search')) {
    return {
      success: true,
      summary: 'Faceted search returned hits and counts',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 hits: [ ... 20 documents ... ]
   categoryCounts: [
     { "_id": "Electronics", "count": 12 },
     { "_id": "Accessories", "count": 8 }
   ]

💡 Use $facet to return both search hits and aggregate facet counts in one request.`
    };
  }
  if (lowerCode.includes('highlight') || lowerCode.includes('searchhighlights')) {
    return {
      success: true,
      summary: 'Highlight snippets returned',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 highlights: [
  { "path": "description", "score": 2.1, "texts": [{ "value": "..." }, { "value": "<em>wireless</em>", "type": "hit" }] }
]

💡 Project $meta: "searchHighlights" to show why a document matched.`
    };
  }
  if (lowerCode.includes('compound') && lowerCode.includes('boost')) {
    return {
      success: true,
      summary: 'Relevance-tuned query executed',
      output: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Results with name matches boosted. Compare order before/after tuning.

💡 Use compound.should with score.boost to emphasize certain fields.`
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
  currentMode,
  isModerator,
  defaultCompetitorId,
  competitorIds,
  labMongoUri,
  stepToolbarRef,
  onReportSendingChange,
  resetProgressCount = 0,
  onResetStep,
  onRunEchoToTerminal,
  terminalSession: terminalSessionProp,
}: StepViewProps) {
  const { userEmail, userSuffix, subtractPoints } = useLab();
  const ide = useIdeContextOptional();
  const { resolvedTheme } = useTheme();
  const currentStep = steps[currentStepIndex];
  const [helpOpen, setHelpOpen] = useState(false);
  const showCompetitorComparisons = getWorkshopSession()?.showCompetitorComparisons === true;
  const [previewPanelTab, setPreviewPanelTab] = useState<'preview' | 'compete'>(() =>
    getWorkshopSession()?.showCompetitorComparisons ? 'compete' : 'preview'
  );
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('code');
  const [editorPanelCollapsed, setEditorPanelCollapsed] = useState(false);
  const [consolePanelCollapsed, setConsolePanelCollapsed] = useState(true); // default collapsed, aligned to bottom
  const editorConsoleGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const [competitorPanelCollapsed, setCompetitorPanelCollapsed] = useState(false);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [lastOutput, setLastOutput] = useState<string>('');
  const [lastOutputTime, setLastOutputTime] = useState<Date | null>(null);
  /** Log entries for console: each run appends one entry so we can show timestamped lines and click-for-detail */
  const [logEntries, setLogEntries] = useState<Array<{ time: Date; output: string }>>([]);
  const [outputSummary, setOutputSummary] = useState<string>('');
  const [outputSuccess, setOutputSuccess] = useState<boolean>(true);
  /** Per-step: true if validation (Verify/Next) failed for that step index; used to show step indicator red. */
  const [validationFailedByStep, setValidationFailedByStep] = useState<Record<number, boolean>>({});
  /** Per-step: true only after Run completed and validation passed for that step; gates Next button and step-dot navigation. */
  const [stepValidatedSuccessByIndex, setStepValidatedSuccessByIndex] = useState<Record<number, boolean>>({});
  /** Console header: 'running' | 'validating' for UX (Running script / Validation started). */
  const [runPhase, setRunPhase] = useState<'idle' | 'running' | 'validating'>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [expandedLogIndex, setExpandedLogIndex] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(0);
  
  // Challenge Mode State
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, number[]>>({});
  const [alwaysShowSolutions, setAlwaysShowSolutions] = useState<boolean>(() => {
    const saved = localStorage.getItem('workshop_always_show_solutions');
    return saved === 'true';
  });
  const [pointsDeducted, setPointsDeducted] = useState<Record<string, number>>({});
  const [skeletonTier, setSkeletonTier] = useState<Record<string, SkeletonTier>>({});
  const [lineHeight, setLineHeight] = useState(16); // Compact line height for editors
  /** Per-block editable code (key = `${currentStepIndex}-${blockIdx}`). Run uses this when present. Persisted centrally. */
  const [editableCodeByBlock, setEditableCodeByBlock] = useState<Record<string, string>>(() => {
    try {
      const email = typeof localStorage !== 'undefined' ? localStorage.getItem('userEmail') : null;
      const w = loadLabWorkspace(labNumber, email);
      return w.editors && Object.keys(w.editors).length ? w.editors : {};
    } catch {
      return {};
    }
  });

  // Output surface abstraction (Phase 1). Do NOT write append() content to the terminal:
  // the terminal is a live PTY; writing there sends input to the shell/mongosh and causes
  // "Running: command not found" and "SyntaxError: Missing semicolon" when status/metadata
  // (e.g. "[lab] Command: ...") are written. Only the echoed script is sent via onRunEchoToTerminal.
  const outputSurface = useMemo(() => {
    const base = createOutputSurface({
      setLastOutput,
      setLastOutputTime,
      setLogEntries: (updater) => setLogEntries(updater),
      setOutputSummary,
      setOutputSuccess,
    });
    return {
      append(output: string, options?: { success?: boolean; summary?: string }) {
        base.append(output, options);
      },
      clear() {
        base.clear();
      },
    };
  }, []);

  // Shared document store: create once per StepView mount and sync current step code for hint providers
  const documentStoreRef = useRef<ReturnType<typeof createDocumentStore> | null>(null);

  useEffect(() => {
    if (!ide) return;
    const primaryLang = currentStep?.codeBlocks?.[0]?.language ?? 'javascript';
    ide.setHintContext({
      labStepId: currentStep?.id,
      labNumber,
      labTitle,
      stepIndex: currentStepIndex,
      currentLanguage: primaryLang,
      documentStore: documentStoreRef.current ?? ide.documentStore ?? undefined,
    });
  }, [ide, currentStep?.id, labNumber, labTitle, currentStepIndex, currentStep?.codeBlocks]);

  useEffect(() => {
    if (!ide) return;
    if (!documentStoreRef.current) documentStoreRef.current = createDocumentStore();
    ide.setDocumentStore(documentStoreRef.current);
    return () => {
      ide.setDocumentStore(null);
    };
  }, [ide]);

  useEffect(() => {
    const store = documentStoreRef.current;
    if (!store) return;
    const blocks = currentStep?.codeBlocks ?? [];
    blocks.forEach((block, idx) => {
      const key = `${currentStepIndex}-${idx}`;
      const content = editableCodeByBlock[key] ?? block.code ?? '';
      store.set(`lab/${labNumber}/step/${currentStepIndex}/${idx}`, content);
    });
  }, [currentStep?.codeBlocks, currentStepIndex, labNumber, editableCodeByBlock]);

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

  /** Fill all blanks in skeleton with answers from inlineHints. Use this for "Solution" so the displayed solution is exactly the skeleton with no placeholders (same lines as skeleton).
   * Replaces in hint order with per-line search-from so the result matches applyRevealedAnswersToCode(skeleton, hints, allRevealed, skeleton). */
  const fillAllBlanksInSkeleton = useCallback((skeleton: string, inlineHints: InlineHint[] | undefined): string => {
    if (!inlineHints?.length) return skeleton;
    const lines = skeleton.split('\n');
    const searchFromByLine = new Map<number, number>();
    inlineHints.forEach((hint) => {
      const lineIndex = hint.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) return;
      const lineText = lines[lineIndex];
      const fromIndex = searchFromByLine.get(hint.line) ?? 0;
      const idx = lineText.indexOf(hint.blankText, fromIndex);
      if (idx !== -1) {
        lines[lineIndex] = lineText.slice(0, idx) + hint.answer + lineText.slice(idx + hint.blankText.length);
        searchFromByLine.set(hint.line, idx + hint.answer.length);
      }
    });
    return lines.join('\n');
  }, []);

  // Get display code based on tier. When solution is revealed, show full block.code (already substituted) so all placeholders and blanks are replaced.
  const getDisplayCode = (block: CodeBlock, tier: SkeletonTier, solutionRevealed: boolean): string => {
    const base = (() => {
      switch (tier) {
        case 'expert':
          return block.expertSkeleton || block.challengeSkeleton || block.skeleton || block.code;
        case 'challenge':
          return block.challengeSkeleton || block.skeleton || block.code;
        case 'guided':
        default:
          return block.skeleton || block.code;
      }
    })();
    if (solutionRevealed && block.code) return block.code;
    return base;
  };

  /** For mongosh/node blocks when solution is revealed: prepend shell line so "revealed solution" shows interpreter first then script. Run still sends script-only (strip before execution). */
  const getDisplayCodeWithShellIfRevealed = (block: CodeBlock, tier: SkeletonTier, solutionRevealed: boolean, language: string | undefined, labMongoUri: string | undefined): string => {
    const base = getDisplayCode(block, tier, solutionRevealed) || block?.code || '';
    if ((language || '').toLowerCase() === 'mongosh' && solutionRevealed && labMongoUri?.trim()) {
      return `mongosh "${labMongoUri}"\n${base}`;
    }
    if ((language || '').toLowerCase() === 'javascript' && solutionRevealed) {
      return `node\n${base}`;
    }
    return base;
  };

  /** Strip leading "node" line so we send only the script to runNode (editor may show shell line when solution revealed). */
  const stripNodeConnectionLine = (code: string): string => {
    const firstLine = code.trimStart().split('\n')[0]?.trim() ?? '';
    if (firstLine === 'node') {
      const firstNewline = code.indexOf('\n');
      if (firstNewline >= 0) return code.slice(firstNewline + 1).trimStart();
      return '';
    }
    return code;
  };

  /** Strip leading "mongosh \"...\"" line so we send only the script to runMongosh (editor may show shell line when solution revealed). */
  const stripMongoshConnectionLine = (code: string): string => {
    const trimmed = code.trimStart();
    if (/^mongosh\s+["']/.test(trimmed)) {
      const firstNewline = code.indexOf('\n');
      if (firstNewline >= 0) return code.slice(firstNewline + 1).trimStart();
      return '';
    }
    return code;
  };

  /** Ensure code ends with a single newline when sending to run (backend/PTY expect it). */
  const ensureTrailingNewline = (code: string): string => (code.trimEnd().length === 0 ? '' : code.trimEnd() + '\n');

  // Check if block has any skeleton tier
  const hasAnySkeleton = (block: CodeBlock): boolean => {
    return !!(block.skeleton || block.challengeSkeleton || block.expertSkeleton);
  };

  /** Apply revealed answers into code (replace blanks with hint.answer) so editor shows correct values.
   * Tries in order: (1) exact blankText match, (2) N-th run of 2+ underscores on line, (3) skeleton position if skeleton provided. */
  const applyRevealedAnswersToCode = useCallback((code: string, inlineHints: InlineHint[] | undefined, revealed: number[], skeleton?: string): string => {
    if (!inlineHints?.length || revealed.length === 0) return code;
    const lines = code.split('\n');
    const searchFromByLine = new Map<number, number>();
    const searchFromSkeletonByLine = new Map<number, number>();
    const skeletonLines = skeleton ? skeleton.split('\n') : [];

    inlineHints.forEach((hint, hintIdx) => {
      if (!revealed.includes(hintIdx)) return;
      const lineIndex = hint.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      let lineText = lines[lineIndex];
      const positionOnLine = inlineHints
        .map((_, i) => i)
        .filter((i) => inlineHints[i].line === hint.line)
        .indexOf(hintIdx);

      // Skeleton start column for this hint (so we can match the correct run when multiple blanks on same line)
      let skeletonStartCol: number | undefined;
      if (skeleton && lineIndex < skeletonLines.length) {
        const skeletonLine = skeletonLines[lineIndex];
        const skFrom = searchFromSkeletonByLine.get(hint.line) ?? 0;
        const skIdx = skeletonLine.indexOf(hint.blankText, skFrom);
        if (skIdx !== -1) skeletonStartCol = skIdx;
      }

      // Try 1: exact blankText match (respect search from for multiple blanks per line)
      const fromIndex = searchFromByLine.get(hint.line) ?? 0;
      const exactIdx = lineText.indexOf(hint.blankText, fromIndex);
      if (exactIdx !== -1) {
        lines[lineIndex] = lineText.slice(0, exactIdx) + hint.answer + lineText.slice(exactIdx + hint.blankText.length);
        searchFromByLine.set(hint.line, exactIdx + hint.answer.length);
        if (skeletonStartCol !== undefined) searchFromSkeletonByLine.set(hint.line, skeletonStartCol + hint.blankText.length);
        return;
      }

      // Try 2: replace the run of 2+ underscores that belongs to this hint (by skeleton position, not run index)
      const underscoreRuns: { index: number; length: number }[] = [];
      const re = /_{2,}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(lineText)) !== null) {
        underscoreRuns.push({ index: m.index, length: m[0].length });
      }
      const overlappingRuns = skeletonStartCol !== undefined
        ? underscoreRuns.filter((r) => r.index <= skeletonStartCol + 2 && r.index + r.length >= skeletonStartCol - 2)
        : [];
      const runBySkeleton = overlappingRuns.length > 0
        ? overlappingRuns.reduce((best, r) => (Math.abs(r.index - skeletonStartCol!) < Math.abs(best.index - skeletonStartCol!) ? r : best))
        : undefined;
      // When we have skeleton, only replace a run that actually overlaps this hint's position; never use positionOnLine
      // fallback or we can replace the wrong blank (e.g. only run left is the second blank, we'd replace it with the first hint's answer).
      const run = runBySkeleton ?? (skeletonStartCol === undefined && positionOnLine >= 0 && positionOnLine < underscoreRuns.length ? underscoreRuns[positionOnLine] : undefined);
      if (run !== undefined) {
        const alreadyHasAnswerBeforeRun = run.index >= hint.answer.length && lineText.slice(run.index - hint.answer.length, run.index) === hint.answer;
        lines[lineIndex] = lineText.slice(0, run.index) + (alreadyHasAnswerBeforeRun ? '' : hint.answer) + lineText.slice(run.index + run.length);
        searchFromByLine.set(hint.line, run.index + (alreadyHasAnswerBeforeRun ? 0 : hint.answer.length));
        if (skeletonStartCol !== undefined) searchFromSkeletonByLine.set(hint.line, skeletonStartCol + hint.blankText.length);
        return;
      }

      // Try 3: position from skeleton (when placeholder fully deleted)
      // Only replace the underscore run at startCol (or insert if none), so we never eat surrounding chars like ' or \.
      // If there are no underscores and the answer is already at this position, skip to avoid duplicating on every apply.
      // If the user typed a suffix of the answer (e.g. "keyVault" when answer is "__keyVault"), replace that segment with the full answer to avoid "__keyVaultkeyVault".
      if (skeleton && lineIndex < skeletonLines.length) {
        const skeletonLine = skeletonLines[lineIndex];
        const skFrom = searchFromSkeletonByLine.get(hint.line) ?? 0;
        const skIdx = skeletonLine.indexOf(hint.blankText, skFrom);
        if (skIdx !== -1) {
          const startCol = skIdx;
          const maxLength = hint.blankText.length;
          let runEnd = startCol;
          while (runEnd < lineText.length && runEnd < startCol + maxLength && lineText[runEnd] === '_') {
            runEnd++;
          }
          const exactMatch = lineText.slice(startCol, startCol + hint.answer.length) === hint.answer;
          const afterAnswer = lineText[startCol + hint.answer.length];
          const answerNotFollowedByDuplicate = startCol + hint.answer.length >= lineText.length || !/[_a-zA-Z0-9]/.test(afterAnswer);
          // Skip if answer is already correct here (e.g. keyDoc._id). Otherwise we'd treat the "_" in "_id" as a 1-char run and replace it -> _idid.
          const alreadyHasAnswer = exactMatch && answerNotFollowedByDuplicate;
          if (!alreadyHasAnswer) {
            if (runEnd > startCol) {
              lines[lineIndex] = lineText.slice(0, startCol) + hint.answer + lineText.slice(runEnd);
            } else {
              const s = lineText.slice(startCol);
              let replaceLen = 0;
              // Explicit fix: "_idid" (answer "_id" + duplicate "id") must become "_id" so Show Answer matches Solution.
              const isIdIdTypo = hint.answer === '_id' && (s === '_idid' || (s.startsWith('_id') && s.length > 3 && /^_id[id]+$/.test(s)));
              if (isIdIdTypo) {
                replaceLen = s.length;
              } else if (exactMatch && !answerNotFollowedByDuplicate) {
                let endCorrupt = startCol;
                while (endCorrupt < lineText.length && /[_a-zA-Z0-9]/.test(lineText[endCorrupt])) endCorrupt++;
                replaceLen = endCorrupt - startCol;
              } else {
                for (let len = 1; len <= Math.min(s.length, hint.answer.length); len++) {
                  if (s.slice(0, len) === hint.answer.slice(-len)) replaceLen = len;
                }
                const remainder = replaceLen > 0 ? s.slice(replaceLen) : '';
                const remainderIsDuplicate = remainder.length > 0 && (
                  remainder === hint.answer ||
                  remainder === hint.answer.replace(/^_+/, '') ||
                  hint.answer.endsWith(remainder)
                );
                if (remainderIsDuplicate) {
                  let endCorrupt = startCol;
                  while (endCorrupt < lineText.length && /[_a-zA-Z0-9]/.test(lineText[endCorrupt])) endCorrupt++;
                  replaceLen = endCorrupt - startCol;
                } else if (replaceLen === 0 && s.length > 0) {
                  let endCorrupt = startCol;
                  while (endCorrupt < lineText.length && /[_a-zA-Z0-9]/.test(lineText[endCorrupt])) endCorrupt++;
                  replaceLen = endCorrupt - startCol;
                }
              }
              lines[lineIndex] = lineText.slice(0, startCol) + hint.answer + lineText.slice(startCol + replaceLen);
            }
          }
          searchFromByLine.set(hint.line, startCol + hint.answer.length);
          searchFromSkeletonByLine.set(hint.line, skIdx + hint.blankText.length);
        }
      }
    });
    return lines.join('\n');
  }, []);

  const isCompleted = completedSteps.includes(currentStepIndex);
  /** Current step has verification (verificationId or onVerify); Next is gated on validation-after-run. */
  const currentStepNeedsVerification = Boolean(
    currentStep?.codeBlocks?.length && (currentStep.verificationId || currentStep.onVerify)
  );
  /** Max step index user can navigate to: current or current+1 only if current step validated. */
  const maxReachableStepIndex = currentStepNeedsVerification && !stepValidatedSuccessByIndex[currentStepIndex]
    ? currentStepIndex
    : currentStepIndex + 1;

  // Order code blocks: .cjs first so .cjs file appears in top editor when available
  const sortedCodeBlocksWithIndex = useMemo(() => {
    const blocks = currentStep?.codeBlocks ?? [];
    return blocks
      .map((block, originalIndex) => ({ block, originalIndex }))
      .sort((a, b) => {
        const aCjs = a.block.filename.toLowerCase().endsWith('.cjs');
        const bCjs = b.block.filename.toLowerCase().endsWith('.cjs');
        if (aCjs && !bCjs) return -1;
        if (!aCjs && bCjs) return 1;
        return 0;
      });
  }, [currentStep?.codeBlocks]);

  // Pairs: node (.cjs/.js) + Mongosh block → one slot with "mongosh ! node" toggle; optional third C# block → "mongosh ! node ! C#" (Run uses editor content: node → run-node, mongosh → run-mongosh, csharp → run-csharp)
  const nodeMongoshPairs = useMemo(() => {
    const blocks = currentStep?.codeBlocks ?? [];
    const map = new Map<number, number>();
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const isMongosh = (b.filename === 'Mongosh' || b.filename === 'mongosh') && (b.language || '').toLowerCase() === 'mongosh';
      if (!isMongosh) continue;
      for (let j = i - 1; j >= 0; j--) {
        const prev = blocks[j];
        const isNode = (prev.filename.toLowerCase().endsWith('.cjs') || prev.filename.toLowerCase().endsWith('.js')) && ['javascript', 'typescript'].includes((prev.language || '').toLowerCase());
        if (isNode) {
          map.set(j, i);
          break;
        }
      }
    }
    return map;
  }, [currentStep?.codeBlocks]);

  // Triples: node + mongosh + C# (.cs, language csharp) in that order → one slot with three tabs
  const nodeMongoshCsharpTriples = useMemo(() => {
    const blocks = currentStep?.codeBlocks ?? [];
    const triples: Array<{ nodeIndex: number; mongoshIndex: number; csharpIndex: number }> = [];
    for (const [nodeIdx, mongoshIdx] of nodeMongoshPairs) {
      const csharpIdx = mongoshIdx + 1;
      if (csharpIdx < blocks.length) {
        const c = blocks[csharpIdx];
        const isCSharp = (c.filename?.toLowerCase().endsWith('.cs')) && (c.language || '').toLowerCase() === 'csharp';
        if (isCSharp) triples.push({ nodeIndex: nodeIdx, mongoshIndex: mongoshIdx, csharpIndex: csharpIdx });
      }
    }
    return triples;
  }, [currentStep?.codeBlocks, nodeMongoshPairs]);

  const nodeMongoshCsharpByNode = useMemo(() => {
    const map = new Map<number, { mongoshIndex: number; csharpIndex: number }>();
    for (const t of nodeMongoshCsharpTriples) {
      map.set(t.nodeIndex, { mongoshIndex: t.mongoshIndex, csharpIndex: t.csharpIndex });
    }
    return map;
  }, [nodeMongoshCsharpTriples]);

  type DisplaySlot = { type: 'single'; block: CodeBlock; originalIndex: number } | {
    type: 'node-mongosh';
    nodeBlock: CodeBlock;
    nodeIndex: number;
    mongoshBlock: CodeBlock;
    mongoshIndex: number;
  } | {
    type: 'node-mongosh-csharp';
    nodeBlock: CodeBlock;
    nodeIndex: number;
    mongoshBlock: CodeBlock;
    mongoshIndex: number;
    csharpBlock: CodeBlock;
    csharpIndex: number;
  } | {
    type: 'twin';
    blockA: CodeBlock;
    indexA: number;
    blockB: CodeBlock;
    indexB: number;
  };

  const displaySlots = useMemo((): DisplaySlot[] => {
    const blocks = currentStep?.codeBlocks ?? [];
    const csharpIndices = new Set(nodeMongoshCsharpTriples.map(t => t.csharpIndex));
    const mongoshIndices = new Set(nodeMongoshPairs.values());
    const raw = sortedCodeBlocksWithIndex
      .filter(({ originalIndex }) => !mongoshIndices.has(originalIndex) && !csharpIndices.has(originalIndex))
      .map(({ block, originalIndex }) => {
        const triple = nodeMongoshCsharpByNode.get(originalIndex);
        if (triple != null) {
          const mongoshBlock = blocks[triple.mongoshIndex];
          const csharpBlock = blocks[triple.csharpIndex];
          return { type: 'node-mongosh-csharp' as const, nodeBlock: block, nodeIndex: originalIndex, mongoshBlock, mongoshIndex: triple.mongoshIndex, csharpBlock, csharpIndex: triple.csharpIndex };
        }
        const mongoshIdx = nodeMongoshPairs.get(originalIndex);
        if (mongoshIdx != null) {
          const mongoshBlock = blocks[mongoshIdx];
          return { type: 'node-mongosh' as const, nodeBlock: block, nodeIndex: originalIndex, mongoshBlock, mongoshIndex: mongoshIdx };
        }
        return { type: 'single' as const, block, originalIndex };
      });
    // When a step has exactly two single-block slots, show one tabbed editor instead of two stacked editors
    if (raw.length === 2 && raw[0].type === 'single' && raw[1].type === 'single') {
      return [{
        type: 'twin',
        blockA: raw[0].block,
        indexA: raw[0].originalIndex,
        blockB: raw[1].block,
        indexB: raw[1].originalIndex,
      }];
    }
    return raw;
  }, [currentStep?.codeBlocks, sortedCodeBlocksWithIndex, nodeMongoshPairs, nodeMongoshCsharpTriples, nodeMongoshCsharpByNode]);

  const [nodeMongoshViewByKey, setNodeMongoshViewByKey] = useState<Record<string, 'node' | 'mongosh' | 'csharp'>>({});
  const [twinViewByKey, setTwinViewByKey] = useState<Record<string, 'A' | 'B'>>({});

  // Default active tab for node/mongosh/csharp slots: use session's target programming language when that tab exists, else mongosh.
  const session = getWorkshopSession();
  const sessionProgrammingLanguage = session?.programmingLanguage;
  const getDefaultViewForSlot = useCallback((slotType: 'node-mongosh' | 'node-mongosh-csharp'): 'node' | 'mongosh' | 'csharp' => {
    if (slotType === 'node-mongosh-csharp') {
      if (sessionProgrammingLanguage === 'csharp') return 'csharp';
      if (sessionProgrammingLanguage === 'node') return 'node';
      return 'mongosh';
    }
    if (sessionProgrammingLanguage === 'node') return 'node';
    return 'mongosh';
  }, [sessionProgrammingLanguage]);

  // Sync editable code from display code when step/tier/reveal changes.
  // For blocks with a skeleton in guided mode: always show skeleton with only currently revealed answers
  // (so we never show persisted content that had answers filled in from a previous session).
  // Exception: if saved content contains old hardcoded URI, overwrite so we use process.env.MONGODB_URI.
  useEffect(() => {
    if (!currentStep?.codeBlocks) return;
    setEditableCodeByBlock((prev) => {
      const next = { ...prev };
      const hasOldHardcodedUri = (code: string) =>
        /const\s+uri\s*=\s*["']mongodb:\/\//.test(code) || /const\s+uri\s*=\s*["']\$\{/.test(code);
      currentStep.codeBlocks.forEach((block, idx) => {
        const blockKey = `${currentStepIndex}-${idx}`;
        const tier = skeletonTier[blockKey] || 'guided';
        const isSolutionRevealed = alwaysShowSolutions || !!showSolution[blockKey] || !hasAnySkeleton(block);
        const baseSkeleton = getDisplayCode(block, tier, false);
        const revealed = revealedAnswers[blockKey] || [];
        const saved = next[blockKey];
        if (isSolutionRevealed) {
          next[blockKey] = block.code ?? '';
        } else if (hasAnySkeleton(block) && block.inlineHints?.length) {
          // Use saved content as base when it exists and is not corrupted, so edits persist when navigating between steps.
          const looksCorrupted = (code: string) =>
            /keyVaultkeyVault/.test(code) || /getCollection\s*\(\s*["'][^"']*_keyVault[keyVault]+/.test(code) || /\._idid\b/.test(code);
          const useSaved = saved != null && saved !== '' && !hasOldHardcodedUri(saved) && !looksCorrupted(saved);
          const base = useSaved ? saved : baseSkeleton;
          next[blockKey] = applyRevealedAnswersToCode(base, block.inlineHints, revealed, baseSkeleton);
        } else if (saved != null && saved !== '' && hasOldHardcodedUri(saved)) {
          next[blockKey] = baseSkeleton;
        } else if (saved == null || saved === '') {
          next[blockKey] = baseSkeleton;
        }
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when display source changes
  }, [currentStepIndex, currentStep?.codeBlocks, currentStep?.id, skeletonTier, revealedAnswers, showSolution, alwaysShowSolutions]);

  // When user clicks Solution or reveals an answer, push the correct content into the editor so placeholders show the right values
  useEffect(() => {
    if (!currentStep?.codeBlocks) return;
    setEditableCodeByBlock((prev) => {
      const next = { ...prev };
      currentStep.codeBlocks.forEach((block, idx) => {
        const blockKey = `${currentStepIndex}-${idx}`;
        const tier = skeletonTier[blockKey] || 'guided';
        const isSolutionRevealed = alwaysShowSolutions || !!showSolution[blockKey] || !hasAnySkeleton(block);
        const revealed = revealedAnswers[blockKey] || [];
        if (isSolutionRevealed) {
          next[blockKey] = block.code ?? '';
        } else if (revealed.length > 0 && block.inlineHints?.length) {
          const skeleton = getDisplayCode(block, tier, false);
          const prevCode = prev[blockKey];
          const looksCorrupted = (code: string) =>
            /keyVaultkeyVault/.test(code) || /getCollection\s*\(\s*["'][^"']*_keyVault[keyVault]+/.test(code) || /\._idid\b/.test(code);
          const baseCode = (prevCode != null && prevCode !== '' && !looksCorrupted(prevCode))
            ? prevCode
            : skeleton;
          next[blockKey] = applyRevealedAnswersToCode(baseCode, block.inlineHints, revealed, skeleton);
        }
      });
      return next;
    });
  }, [currentStep?.codeBlocks, currentStepIndex, showSolution, revealedAnswers, alwaysShowSolutions, skeletonTier, applyRevealedAnswersToCode]);

  // When lab or user changes (not initial mount), load that lab's editors so switching labs or return visit restores state
  const prevLabUserRef = useRef({ labNumber, userEmail });
  const editorsPersistRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (prevLabUserRef.current.labNumber !== labNumber || prevLabUserRef.current.userEmail !== userEmail) {
      const labChanged = prevLabUserRef.current.labNumber !== labNumber;
      prevLabUserRef.current = { labNumber, userEmail };
      const w = loadLabWorkspace(labNumber, userEmail);
      const loadedEditors = w.editors || {};
      setEditableCodeByBlock((prev) => {
        if (labChanged || Object.keys(loadedEditors).length > 0) return loadedEditors;
        return prev;
      });
      if (w.revealedAnswersByBlock && Object.keys(w.revealedAnswersByBlock).length > 0) {
        setRevealedAnswers(w.revealedAnswersByBlock);
      }
      if (w.revealedHintsByBlock && Object.keys(w.revealedHintsByBlock).length > 0) {
        setRevealedHints(w.revealedHintsByBlock);
      }
    }
  }, [labNumber, userEmail]);

  // When user resets progress, clear hints and reload workspace (so labs start fresh without reload)
  useEffect(() => {
    if (resetProgressCount <= 0) return;
    setRevealedAnswers({});
    setRevealedHints({});
    setShowSolution({});
    setValidationFailedByStep({});
    const w = loadLabWorkspace(labNumber, userEmail);
    setEditableCodeByBlock(w.editors || {});
    const entries = w.logEntriesByStep[currentStepIndex] || [];
    setLogEntries(storedToLogEntries(entries));
    setLastOutput('');
    setOutputSummary('');
    setOutputSuccess(true);
  }, [resetProgressCount, labNumber, userEmail, currentStepIndex]);

  // Load console logs and last output for current step so each step shows only its own output
  useEffect(() => {
    const w = loadLabWorkspace(labNumber, userEmail);
    const entries = w.logEntriesByStep[currentStepIndex] || [];
    const entriesWithDates = storedToLogEntries(entries);
    setLogEntries(entriesWithDates);
    const last = entriesWithDates[entriesWithDates.length - 1];
    if (last && last.output) {
      setLastOutput(last.output);
      const lines = last.output.trim().split(/\r?\n/).filter(Boolean);
      const firstLine = lines[0]?.slice(0, 80) || '';
      // If first line is [lab] context (Key vault / KMS alias), use the result line for summary so badge shows pass/fail message not context
      const summaryLine = lines.length > 1 && /^\[lab\]\s+(Key vault|KMS alias):/.test(firstLine) ? lines[1]?.slice(0, 120) || firstLine : firstLine;
      setOutputSummary(summaryLine || 'Step output');
      setOutputSuccess(last.success !== undefined ? last.success : !/\b(not found|failed|Error:)\b/i.test(last.output));
    } else {
      setLastOutput('');
      setOutputSummary('');
      setOutputSuccess(true);
    }
  }, [labNumber, currentStepIndex, userEmail]);

  // Persist all editor content for this lab to central storage (autosave for all editors)
  useEffect(() => {
    editorsPersistRef.current = editableCodeByBlock;
    saveLabWorkspace(labNumber, { editors: editableCodeByBlock }, userEmail);
    return () => {
      saveLabWorkspace(labNumber, { editors: editorsPersistRef.current }, userEmail);
    };
  }, [labNumber, editableCodeByBlock, userEmail]);

  // Persist revealed answers and hints so they survive next/previous step and reload
  useEffect(() => {
    saveLabWorkspace(labNumber, { revealedAnswersByBlock: revealedAnswers, revealedHintsByBlock: revealedHints }, userEmail);
  }, [labNumber, revealedAnswers, revealedHints, userEmail]);

  // Persist console logs for current step to central storage
  useEffect(() => {
    const w = loadLabWorkspace(labNumber, userEmail);
    const updated = { ...w.logEntriesByStep, [currentStepIndex]: logEntriesToStored(logEntries) };
    saveLabWorkspace(labNumber, { logEntriesByStep: updated }, userEmail);
  }, [labNumber, currentStepIndex, logEntries, userEmail]);

  // Whether any block in this step still has unresolved hint markers (blanks not filled or revealed).
  // When user clicks "Solution", that block is considered resolved so Run is enabled.
  const hasUnresolvedHints = useMemo(() => {
    const blocks = currentStep.codeBlocks ?? [];
    return blocks.some((block, idx) => {
      const key = `${currentStepIndex}-${idx}`;
      const solutionRevealed = alwaysShowSolutions || !!showSolution[key] || !hasAnySkeleton(block);
      if (solutionRevealed) return false;
      const hintCount = block.inlineHints?.length ?? 0;
      if (hintCount === 0) return false;
      const revealedCount = (revealedAnswers[key] ?? []).length;
      return revealedCount < hintCount;
    });
  }, [currentStep.codeBlocks, currentStepIndex, revealedAnswers, showSolution, alwaysShowSolutions]);

  const runAllDisabled = false;
  const runAllTooltip = hasUnresolvedHints
    ? 'Fill in or reveal all blanks in the code before running.'
    : 'Run all';

  // Competitor side-by-side: only in demo mode for moderator when step has competitor equivalents
  const stepCompetitorIds = useMemo(() => {
    const ids = new Set<string>();
    currentStep.codeBlocks?.forEach((block) => {
      Object.keys(block.competitorEquivalents || {}).forEach((id) => ids.add(id));
    });
    return Array.from(ids);
  }, [currentStep.codeBlocks]);
  const showCompetitorPanel =
    showCompetitorComparisons &&
    currentMode === 'demo' &&
    !!isModerator &&
    stepCompetitorIds.length > 0;
  const effectiveCompetitorId =
    selectedCompetitorId && stepCompetitorIds.includes(selectedCompetitorId)
      ? selectedCompetitorId
      : defaultCompetitorId && stepCompetitorIds.includes(defaultCompetitorId)
        ? defaultCompetitorId
        : stepCompetitorIds[0] ?? null;
  useEffect(() => {
    if (!showCompetitorPanel || stepCompetitorIds.length === 0) return;
    const defaultId = defaultCompetitorId && stepCompetitorIds.includes(defaultCompetitorId)
      ? defaultCompetitorId
      : stepCompetitorIds[0];
    setSelectedCompetitorId((prev) =>
      prev && stepCompetitorIds.includes(prev) ? prev : defaultId
    );
  }, [currentStepIndex, showCompetitorPanel, stepCompetitorIds, defaultCompetitorId]);

  // Competitor code for first block that has equivalent for effectiveCompetitorId (blockIndex for our-code lookup)
  const competitorBlockForSelected = useMemo(() => {
    if (!effectiveCompetitorId || !currentStep.codeBlocks) return null;
    for (let i = 0; i < currentStep.codeBlocks.length; i++) {
      const block = currentStep.codeBlocks[i];
      const equiv = block.competitorEquivalents?.[effectiveCompetitorId];
      if (equiv) return { block, blockIndex: i, equiv };
    }
    return null;
  }, [currentStep.codeBlocks, effectiveCompetitorId]);

  // Check if any code block has a skeleton
  const hasSkeletons = useMemo(() => {
    return currentStep.codeBlocks?.some(block => hasAnySkeleton(block)) ?? false;
  }, [currentStep.codeBlocks]);

  // Persist read-only mode preference
  useEffect(() => {
    localStorage.setItem('workshop_always_show_solutions', String(alwaysShowSolutions));
  }, [alwaysShowSolutions]);

  // When editor or console is collapsed/expanded, resize panes (editor % / console %)
  useEffect(() => {
    const group = editorConsoleGroupRef.current;
    if (!group) return;
    if (consolePanelCollapsed && editorPanelCollapsed) {
      group.setLayout([94, 6]); // editor strip + thin console bar
    } else if (consolePanelCollapsed) {
      group.setLayout([94, 6]); // editor full, console collapsed to thin bar at bottom
    } else if (editorPanelCollapsed) {
      group.setLayout([12, 88]); // editor strip ~12%, console ~88%
    } else {
      group.setLayout([65, 35]); // editor 65%, console 35%
    }
  }, [editorPanelCollapsed, consolePanelCollapsed]);

  // Auto-expand console when output is printed
  const prevLogCountRef = useRef(0);
  useEffect(() => {
    if (logEntries.length > prevLogCountRef.current && logEntries.length > 0) {
      setConsolePanelCollapsed(false);
    }
    prevLogCountRef.current = logEntries.length;
  }, [logEntries.length]);

  // Helper to reveal an inline hint (conceptual)
  const revealInlineHint = useCallback((blockKey: string, hintIdx: number, tier: SkeletonTier) => {
    const alreadyRevealed = (revealedHints[blockKey] || []).includes(hintIdx);
    setRevealedHints(prev => {
      const existing = prev[blockKey] || [];
      if (existing.includes(hintIdx)) return prev;
      return { ...prev, [blockKey]: [...existing, hintIdx] };
    });
    if (alreadyRevealed) return;
    // Deduct points for hint based on tier and update displayed score
    const hintPenalty = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + hintPenalty
    }));
    subtractPoints(hintPenalty);
    // Track in leaderboard
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      trackHintUsage(email, hintPenalty);
    }
  }, [subtractPoints, revealedHints]);

  // Helper to reveal an inline answer (direct answer)
  const revealInlineAnswer = useCallback((blockKey: string, hintIdx: number, tier: SkeletonTier) => {
    const alreadyRevealed = (revealedAnswers[blockKey] || []).includes(hintIdx);
    setRevealedAnswers(prev => {
      const existing = prev[blockKey] || [];
      if (existing.includes(hintIdx)) return prev;
      return { ...prev, [blockKey]: [...existing, hintIdx] };
    });
    if (alreadyRevealed) return;
    // Deduct points for answer based on tier and update displayed score
    const answerPenalty = tier === 'expert' ? 5 : tier === 'challenge' ? 3 : 2;
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + answerPenalty
    }));
    subtractPoints(answerPenalty);
    // Track in leaderboard
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      trackHintUsage(email, answerPenalty);
    }
  }, [subtractPoints, revealedAnswers]);


  // Helper to reveal full solution (single block or all blocks in a node-mongosh slot so Run enables and no hint markers)
  const revealSolution = useCallback((blockKeyOrKeys: string | string[], tier: SkeletonTier) => {
    const keys = Array.isArray(blockKeyOrKeys) ? blockKeyOrKeys : [blockKeyOrKeys];
    setShowSolution(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = true; });
      return next;
    });
    const penalty = getSolutionPenalty(tier);
    setPointsDeducted(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = (next[k] || 0) + penalty; });
      return next;
    });
    subtractPoints(penalty);
  }, [subtractPoints]);

  // Copy button should always copy full solution (even if skeleton shown). For mongosh when solution revealed, include shell line first.
  const handleCopyCode = useCallback(async (blockIdx: number = 0) => {
    const block = currentStep.codeBlocks?.[blockIdx];
    const blockKey = `${currentStepIndex}-${blockIdx}`;
    const hasSkeleton = block ? hasAnySkeleton(block) : false;
    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
    const tier = skeletonTier[blockKey] || 'guided';
    const code = getDisplayCodeWithShellIfRevealed(block!, tier, isSolutionRevealed, block?.language, labMongoUri);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentStep.codeBlocks, currentStepIndex, alwaysShowSolutions, showSolution, skeletonTier, labMongoUri]);

  /** Real validation before Next: use step's onVerify or verificationId, else allow advance (no simulation). */
  const handleCheckProgress = useCallback(async (): Promise<boolean> => {
    setIsRunning(true);
    const now = new Date();
    let success = false;
    let output = '';
    let summary = '';

    try {
      if (currentStep.onVerify) {
        const result = await currentStep.onVerify();
        success = result.success;
        summary = result.message;
        output = result.message;
      } else if (currentStep.verificationId) {
        const verificationService = getVerificationService();
        const suffix = getLabUserSuffix();
        const storedAlias = typeof localStorage !== 'undefined' ? localStorage.getItem('lab_kms_alias') || undefined : undefined;
        const awsProfile = typeof localStorage !== 'undefined' ? localStorage.getItem('lab_aws_profile') || undefined : undefined;
        const awsRegion = typeof localStorage !== 'undefined' ? localStorage.getItem('lab_aws_region') || undefined : undefined;
        const keyVaultDb = suffix ? `encryption_${suffix}` : undefined;
        const ctx = {
          mongoUri: labMongoUri || (typeof localStorage !== 'undefined' ? localStorage.getItem('lab_mongo_uri') || undefined : undefined),
          alias: storedAlias || (suffix ? `alias/mongodb-lab-key-${suffix}` : undefined),
          profile: awsProfile,
          region: awsRegion,
          keyAltName: `user-${suffix}-ssn-key`,
          keyVaultDb,
          db: suffix ? `hr_${suffix}` : undefined,
          coll: 'employees',
          medicalDb: suffix ? `medical_${suffix}` : undefined,
          expectedCount: 1,
        };
        const result = await verificationService.verify(currentStep.verificationId as VerificationId, ctx);
        success = result.success;
        summary = result.message;
        // Only show encryption-related context (key vault, KMS, AWS) for steps that actually use it
        const vid = currentStep.verificationId || '';
        const isEncryptionVerification = vid.startsWith('csfle.') || vid.startsWith('qe.') || vid.startsWith('verify-encrypted') || vid.startsWith('verify-no-plaintext') || vid.startsWith('verify-queryable') || vid.startsWith('verify-indexes') || vid.startsWith('verify-access') || vid.startsWith('verify-query-performance');
        let contextLine = '';
        if (isEncryptionVerification) {
          const isKmsOnlyStep = vid === 'csfle.verifyCmkExists' || vid === 'csfle.verifyKeyPolicy';
          const contextParts = isKmsOnlyStep
            ? [ctx.alias ? `KMS alias: ${ctx.alias}` : null, awsProfile ? `AWS profile: ${awsProfile}` : null, awsRegion ? `region: ${awsRegion}` : null]
            : [keyVaultDb ? `Key vault: ${keyVaultDb}` : null, awsProfile ? `AWS profile: ${awsProfile}` : null, awsRegion ? `region: ${awsRegion}` : null];
          contextLine = contextParts.filter(Boolean).join(' | ');
        }
        output = contextLine ? `[lab] ${contextLine}\n${result.message}` : result.message;
      } else {
        success = true;
        summary = 'No verification configured for this step.';
        output = summary;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      success = false;
      summary = 'Validation failed';
      output = `Validation error: ${msg}`;
    }

    outputSurface.append(output, { success, summary });
    setValidationFailedByStep(prev => ({ ...prev, [currentStepIndex]: !success })); // red when failed, cleared when passed
    setConsolePanelCollapsed(false);
    // Persist validation result to this step's console log so it's kept when advancing and when returning to this step
    const w = loadLabWorkspace(labNumber, userEmail);
    const existing = w.logEntriesByStep[currentStepIndex] || [];
    const newStored = logEntriesToStored([{ time: now, output, success }]);
    saveLabWorkspace(labNumber, { logEntriesByStep: { ...w.logEntriesByStep, [currentStepIndex]: [...existing, ...newStored] } }, userEmail);
    setIsRunning(false);
    return success;
  }, [currentStep.onVerify, currentStep.verificationId, labMongoUri, userSuffix, currentStepIndex, labNumber, userEmail]);

  /** Run a single code block: uses current editor content (editable code). Tries real /api/run-* when URI and language match, else simulated output. */
  const handleRunBlock = useCallback(async (blockIdx: number) => {
    const block = currentStep.codeBlocks?.[blockIdx];
    const blockKey = `${currentStepIndex}-${blockIdx}`;
    const tier = skeletonTier[blockKey] || 'guided';
    const isSolutionRevealed = alwaysShowSolutions || !!showSolution[blockKey] || !hasAnySkeleton(block);
    let code = (editableCodeByBlock[blockKey] ?? getDisplayCode(block!, tier, isSolutionRevealed)) || (block?.code ?? '');
    const language = (block?.language || 'javascript').toLowerCase();
    // Bash/shell: if editor still has skeleton placeholders (e.g. _________), run the full solution so the command does not fail (e.g. aws kms create-key)
    if ((language === 'bash' || language === 'shell') && block?.code && /_{5,}/.test(code)) {
      code = block.code;
    }
    // C#: skeleton blanks (e.g. .Include("_________") or .Sort.___________()) are invalid or fail at build; run full solution so dotnet run succeeds
    const isCSharp = language === 'csharp' || language === 'c#';
    if (isCSharp && block?.code && /_{4,}/.test(code)) {
      code = block.code;
    }
    if (language === 'mongosh') code = stripMongoshConnectionLine(code);
    if (language === 'javascript' || language === 'typescript') code = stripNodeConnectionLine(code);
    code = ensureTrailingNewline(code);

    // C# with terminal: prepare project, send only "export MONGODB_URI" + "dotnet run --project <path>" so real output appears in terminal.
    if ((language === 'csharp' || language === 'c#') && code.trim().length > 0 && onRunEchoToTerminal) {
      setIsRunning(true);
      let runResult: { output: string; success: boolean; summary: string };
      try {
        const prep = await prepareCSharpProject({ code, uri: labMongoUri || '', filename: block?.filename, userSuffix: getLabUserSuffix() });
        if (!prep.success || !prep.projectPath) {
          runResult = { output: 'Failed to prepare C# project.', success: false, summary: 'Prepare failed' };
        } else {
          const escapeShell = (s: string) => s.replace(/'/g, "'\\''");
          const parts: string[] = [];
          if (labMongoUri?.trim()) {
            parts.push(`export MONGODB_URI='${escapeShell(labMongoUri.trim())}'`);
          }
          parts.push(`dotnet run --project "${prep.projectPath}"`);
          const codeToWrite = parts.join('\n') + '\n';
          onRunEchoToTerminal({ code: codeToWrite, language: 'csharp', filename: block?.filename });
          runResult = { output: 'Output in terminal.', success: true, summary: 'Running in terminal' };
        }
      } catch (e) {
        runResult = {
          output: (e instanceof Error ? e.message : String(e)) + '\n\nRun without terminal to see output in panel.',
          success: false,
          summary: 'Error',
        };
      }
      setLastOutput(runResult.output);
      setLastOutputTime(new Date());
      outputSurface.append(runResult.output, { summary: runResult.summary, success: runResult.success });
      setConsolePanelCollapsed(false);
      setIsRunning(false);
      return;
    }

    // Same pattern as mongosh: start shell (node or mongosh), echo editor content, then exit (Ctrl+D for node, "exit" for mongosh).
    const codeForEcho =
      language === 'mongosh' && labMongoUri?.trim()
        ? `mongosh "${labMongoUri}"\n${code.trimEnd()}\nexit\n`
        : (language === 'javascript' || language === 'typescript')
          ? `node\n${code.trimEnd()}\n\x04`
          : (language === 'csharp' || language === 'c#')
            ? `echo 'Running C# code (dotnet run in project directory)'\n`
            : code;
    onRunEchoToTerminal?.({ code: codeForEcho, language, filename: block?.filename });
    setIsRunning(true);
    let result: { output: string; success: boolean; summary: string };
    const labAwsRegion = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_region') || '') : '';

    try {
      // 1) Explicit mongosh block → run-mongosh (requires URI)
      if (language === 'mongosh') {
        if (!labMongoUri?.trim()) {
          result = {
            output: 'MongoDB URI required to run mongosh. Set it in Workshop Settings.',
            success: false,
            summary: 'URI required',
          };
        } else {
          const mongoshPath = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_mongosh_path') : null;
          const runResult = await executionService.runMongosh({ code: ensureTrailingNewline(code), uri: labMongoUri, mongoshPath: mongoshPath ?? undefined });
          result = { ...formatForConsole(runResult, 'mongosh') };
        }
      }
      // 2) Bash/shell → run-bash, or run "node <file>" via matching editor block (and any preceding commands via run-bash)
      else if (language === 'bash' || language === 'shell') {
        const commands = code.split(/\r?\n/).map(s => s.trim()).filter(line => line && !line.startsWith('#'));
        if (commands.length > 0) {
          const nodeCmdIndex = commands.findIndex(cmd => /^node\s+(\S+\.(cjs|js))$/.test(cmd));
          const nodeFileMatch = nodeCmdIndex >= 0 ? commands[nodeCmdIndex].match(/^node\s+(\S+\.(cjs|js))$/) : null;
          const wantedFilename = nodeFileMatch?.[1];
          const editorBlockIndex = wantedFilename != null
            ? currentStep.codeBlocks?.findIndex(
                (b, i) => i !== blockIdx && (b.filename != null && (b.filename === wantedFilename || b.filename.endsWith(wantedFilename) || b.filename.startsWith(wantedFilename + ' ')))
              )
            : -1;
          const hasNodeSubstitution = editorBlockIndex !== undefined && editorBlockIndex >= 0 && (currentStep.codeBlocks?.[editorBlockIndex]?.code ?? (editableCodeByBlock[`${currentStepIndex}-${editorBlockIndex}`] ?? '')).trim().length > 0;

          if (hasNodeSubstitution) {
            const editorBlock = currentStep.codeBlocks?.[editorBlockIndex];
            const editorKey = `${currentStepIndex}-${editorBlockIndex}`;
            const editorTier = skeletonTier[editorKey] || 'guided';
            const editorSolutionRevealed = alwaysShowSolutions || !!showSolution[editorKey] || !hasAnySkeleton(editorBlock);
            const editorCode = (editableCodeByBlock[editorKey] ?? getDisplayCode(editorBlock!, editorTier, editorSolutionRevealed)) || (editorBlock?.code ?? '');
            const outputs: string[] = [];
            let lastSuccess = true;
            const beforeNode = commands.slice(0, nodeCmdIndex);
            if (beforeNode.length > 0) {
              const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
              const bashResult = await executionService.runBash({ commands: beforeNode, profile: awsProfile || 'default', ...(labAwsRegion && { region: labAwsRegion }) });
              outputs.push(formatBashRunOutput({ stdout: bashResult.stdout, stderr: bashResult.stderr, success: bashResult.success, exitCode: bashResult.exitCode }));
            }
            const labAwsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
            const nodeResult = await executionService.runNode({ code: ensureTrailingNewline(stripNodeConnectionLine(editorCode)), uri: labMongoUri || '', ...(labAwsRegion && { region: labAwsRegion }), profile: labAwsProfile || 'default', filename: editorBlock?.filename, userSuffix: getLabUserSuffix() });
            const nodeFormatted = formatForConsole(nodeResult, 'node');
            outputs.push(nodeFormatted.output);
            lastSuccess = nodeResult.success;
            result = {
              output: outputs.join('\n\n'),
              success: lastSuccess,
              summary: lastSuccess ? 'Node completed' : (nodeResult.message?.split('\n')[0] || 'Node failed'),
            };
          } else {
            const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
            const bashResult = await executionService.runBash({ commands, profile: awsProfile || 'default', ...(labAwsRegion && { region: labAwsRegion }) });
            const out = formatBashRunOutput({ stdout: bashResult.stdout, stderr: bashResult.stderr, success: bashResult.success, exitCode: bashResult.exitCode });
            result = {
              output: out,
              success: bashResult.success,
              summary: bashResult.success ? 'Command completed' : 'Command failed',
            };
          }
        } else {
          result = generateSimulatedOutput(code, currentStep.title);
        }
      }
      // 3) JavaScript that looks like mongosh (db., .aggregate, $search) → run-mongosh (requires URI)
      else if (
        language === 'javascript' &&
        labMongoUri &&
        (code.includes('db.') || code.includes('.aggregate') || code.includes('$search') || code.includes('$find'))
      ) {
        const scriptCode = ensureTrailingNewline(stripMongoshConnectionLine(code));
        const mongoshPath = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_mongosh_path') : null;
        const runResult = await executionService.runMongosh({ code: scriptCode, uri: labMongoUri, mongoshPath: mongoshPath ?? undefined });
        result = { ...formatForConsole(runResult, 'mongosh') };
      }
      // 4) Node-like JavaScript → run-node (optional URI for MONGODB_URI env)
      else if ((language === 'javascript' || language === 'typescript') && code.trim().length > 0) {
        const labAwsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
        const runResult = await executionService.runNode({ code: ensureTrailingNewline(code), uri: labMongoUri || '', ...(labAwsRegion && { region: labAwsRegion }), profile: labAwsProfile || 'default', filename: block?.filename, userSuffix: getLabUserSuffix() });
        result = { ...formatForConsole(runResult, 'node') };
      }
      // 5) C# → run-csharp (optional URI for MONGODB_URI env)
      else if (language === 'csharp' && code.trim().length > 0) {
        const runResult = await executionService.runCSharp({ code: ensureTrailingNewline(code), uri: labMongoUri || '', filename: block?.filename, userSuffix: getLabUserSuffix() });
        result = { ...formatForConsole(runResult, 'csharp') };
      }
      // 6) Fallback: simulated output (e.g. no URI, or JSON index definitions)
      else {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        result = generateSimulatedOutput(code, currentStep.title);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result = {
        output: `Error: ${msg}\n\nFalling back to simulated output.`,
        success: false,
        summary: 'Request failed',
      };
      // Optionally still show simulated output below the error
      const sim = generateSimulatedOutput(code, currentStep.title);
      result.output += '\n\n' + sim.output;
      result.success = sim.success;
      result.summary = sim.summary;
    }

    const now = new Date();
    setLastOutput(result.output);
    setLastOutputTime(now);
    outputSurface.append(result.output, { summary: result.summary, success: result.success });
    setConsolePanelCollapsed(false);
    setIsRunning(false);
  }, [currentStep?.codeBlocks, currentStep?.title, currentStepIndex, labMongoUri, editableCodeByBlock, skeletonTier, showSolution, alwaysShowSolutions, outputSurface, onRunEchoToTerminal]);

  /** Run all code blocks in order: for composite (node+mongosh) slots runs only the active tab; for single slots runs that block. Skips terminal-only blocks. After execution, runs validation when step has verificationId/onVerify; Next enabled only after validation passes. */
  const handleRunAll = useCallback(async () => {
    const blocks = currentStep?.codeBlocks ?? [];
    if (blocks.length === 0) return;
    // Build list of block indices to run from display slots (one per slot; for node-mongosh / node-mongosh-csharp use active view)
    const indicesToRun: number[] = [];
    for (const slot of displaySlots) {
      if (slot.type === 'node-mongosh-csharp') {
        const slotKey = `${currentStepIndex}-${slot.nodeIndex}`;
        const view = nodeMongoshViewByKey[slotKey] ?? getDefaultViewForSlot('node-mongosh-csharp');
        indicesToRun.push(view === 'mongosh' ? slot.mongoshIndex : view === 'csharp' ? slot.csharpIndex : slot.nodeIndex);
      } else if (slot.type === 'node-mongosh') {
        const slotKey = `${currentStepIndex}-${slot.nodeIndex}`;
        const view = nodeMongoshViewByKey[slotKey] ?? getDefaultViewForSlot('node-mongosh');
        indicesToRun.push(view === 'mongosh' ? slot.mongoshIndex : slot.nodeIndex);
      } else if (slot.type === 'twin') {
        const twinKey = `${currentStepIndex}-twin`;
        const view = twinViewByKey[twinKey] ?? 'A';
        indicesToRun.push(view === 'A' ? slot.indexA : slot.indexB);
      } else {
        indicesToRun.push(slot.originalIndex);
      }
    }
    setIsRunning(true);
    setRunPhase('running');
    outputSurface.append('Running script...');
    setConsolePanelCollapsed(false);
    const outputs: string[] = [];
    let lastSuccess = true;
    let lastSummary = '';
    const labAwsRegion = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_region') || '') : '';
    for (const i of indicesToRun) {
      const block = blocks[i];
      const blockKey = `${currentStepIndex}-${i}`;
      const tier = skeletonTier[blockKey] || 'guided';
      const isSolutionRevealed = alwaysShowSolutions || !!showSolution[blockKey] || !hasAnySkeleton(block);
      let code = (editableCodeByBlock[blockKey] ?? getDisplayCode(block, tier, isSolutionRevealed)) || block.code || '';
      const language = (block.language || 'javascript').toLowerCase();
      const isCSharp = language === 'csharp' || language === 'c#';
      if (isCSharp && block.code && /_{4,}/.test(code)) code = block.code;
      if (language === 'mongosh') code = stripMongoshConnectionLine(code);
      if (language === 'javascript' || language === 'typescript') code = stripNodeConnectionLine(code);
      code = ensureTrailingNewline(code);
      const codeForEcho =
        language === 'mongosh' && labMongoUri?.trim()
          ? `mongosh "${labMongoUri}"\n${code.trimEnd()}\nexit\n`
          : (language === 'javascript' || language === 'typescript')
            ? `node\n${code.trimEnd()}\n\x04`
            : isCSharp
              ? `echo 'Running C# code (dotnet run in project directory)'\n`
              : code;
      if (!(isCSharp && code.trim().length > 0 && onRunEchoToTerminal)) {
        onRunEchoToTerminal?.({ code: codeForEcho, language, filename: block.filename });
      }
      try {
        if (language === 'mongosh' && code.trim().length > 0) {
          if (labMongoUri?.trim()) {
            const mongoshPath = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_mongosh_path') : null;
            const runResult = await executionService.runMongosh({ code, uri: labMongoUri, mongoshPath: mongoshPath ?? undefined });
            const formatted = formatForConsole(runResult, 'mongosh');
            outputs.push(formatted.output);
            lastSuccess = runResult.success;
            lastSummary = formatted.summary;
          } else {
            outputs.push('MongoDB URI required to run mongosh. Set it in Workshop Settings.');
            lastSuccess = false;
            lastSummary = 'URI required';
          }
        } else if (language === 'bash' || language === 'shell') {
          const commands = code.split(/\r?\n/).map((s: string) => s.trim()).filter((line: string) => line && !line.startsWith('#'));
          if (commands.length > 0) {
            const nodeCmdIndex = commands.findIndex((cmd: string) => /^node\s+(\S+\.(cjs|js))$/.test(cmd));
            const nodeFileMatch = nodeCmdIndex >= 0 ? commands[nodeCmdIndex].match(/^node\s+(\S+\.(cjs|js))$/) : null;
            const wantedFilename = nodeFileMatch?.[1];
            const editorBlockIndex = wantedFilename != null
              ? blocks.findIndex(
                  (b, j) => j !== i && (b.filename != null && (b.filename === wantedFilename || b.filename.endsWith(wantedFilename) || b.filename.startsWith(wantedFilename + ' ')))
                )
              : -1;
            const editorBlock = editorBlockIndex >= 0 ? blocks[editorBlockIndex] : null;
            const editorCode = editorBlock
              ? (editableCodeByBlock[`${currentStepIndex}-${editorBlockIndex}`] ?? getDisplayCode(editorBlock, skeletonTier[`${currentStepIndex}-${editorBlockIndex}`] || 'guided', alwaysShowSolutions || !!showSolution[`${currentStepIndex}-${editorBlockIndex}`] || !hasAnySkeleton(editorBlock))) || editorBlock.code || ''
              : '';
            const hasNodeSubstitution = editorBlockIndex >= 0 && editorCode.trim().length > 0;

            if (hasNodeSubstitution) {
              const beforeNode = commands.slice(0, nodeCmdIndex);
              if (beforeNode.length > 0) {
                const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
                const bashResult = await executionService.runBash({ commands: beforeNode, profile: awsProfile || 'default', ...(labAwsRegion && { region: labAwsRegion }) });
                outputs.push(formatBashRunOutput({ stdout: bashResult.stdout, stderr: bashResult.stderr, success: bashResult.success, exitCode: bashResult.exitCode }));
              }
              const labAwsProfileRun = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
              const nodeResult = await executionService.runNode({ code: ensureTrailingNewline(stripNodeConnectionLine(editorCode)), uri: labMongoUri || '', ...(labAwsRegion && { region: labAwsRegion }), profile: labAwsProfileRun || 'default', filename: editorBlock?.filename, userSuffix: getLabUserSuffix() });
              const nodeFormatted = formatForConsole(nodeResult, 'node');
              outputs.push(nodeFormatted.output);
              lastSuccess = nodeResult.success;
              lastSummary = nodeFormatted.summary;
            } else {
              const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
              const bashResult = await executionService.runBash({ commands, profile: awsProfile || 'default', ...(labAwsRegion && { region: labAwsRegion }) });
              outputs.push(formatBashRunOutput({ stdout: bashResult.stdout, stderr: bashResult.stderr, success: bashResult.success, exitCode: bashResult.exitCode }));
              lastSuccess = bashResult.success;
              lastSummary = bashResult.success ? 'Command completed' : 'Command failed';
            }
          }
        } else if ((language === 'javascript' || language === 'typescript') && code.trim().length > 0) {
          const labAwsProfileRun = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
          const nodeResult = await executionService.runNode({ code, uri: labMongoUri || '', ...(labAwsRegion && { region: labAwsRegion }), profile: labAwsProfileRun || 'default', filename: block.filename, userSuffix: getLabUserSuffix() });
          const nodeFormatted = formatForConsole(nodeResult, 'node');
          outputs.push(nodeFormatted.output);
          lastSuccess = nodeResult.success;
          lastSummary = nodeFormatted.summary;
        } else if ((language === 'python' || language === 'py') && code.trim().length > 0) {
          const runResult = await executionService.runPython({ code, filename: block.filename, userSuffix: getLabUserSuffix() });
          const formatted = formatForConsole(runResult, 'python');
          outputs.push(formatted.output);
          lastSuccess = runResult.success;
          lastSummary = formatted.summary;
        } else if ((language === 'csharp' || language === 'c#') && code.trim().length > 0) {
          if (onRunEchoToTerminal) {
            try {
              const prep = await prepareCSharpProject({ code, uri: labMongoUri || '', filename: block.filename, userSuffix: getLabUserSuffix() });
              if (prep.success && prep.projectPath) {
                const escapeShell = (s: string) => s.replace(/'/g, "'\\''");
                const parts: string[] = [];
                if (labMongoUri?.trim()) {
                  parts.push(`export MONGODB_URI='${escapeShell(labMongoUri.trim())}'`);
                }
                parts.push(`dotnet run --project "${prep.projectPath}"`);
                onRunEchoToTerminal({ code: parts.join('\n') + '\n', language: 'csharp', filename: block.filename });
                outputs.push('Output in terminal.');
                lastSuccess = true;
                lastSummary = 'Running in terminal';
              } else {
                outputs.push('Failed to prepare C# project.');
                lastSuccess = false;
                lastSummary = 'Prepare failed';
              }
            } catch (e) {
              outputs.push((e instanceof Error ? e.message : String(e)) + '\n\nRun without terminal to see output in panel.');
              lastSuccess = false;
              lastSummary = 'Error';
            }
          } else {
            const runResult = await executionService.runCSharp({ code, uri: labMongoUri || '', filename: block.filename, userSuffix: getLabUserSuffix() });
            const formatted = formatForConsole(runResult, 'csharp');
            outputs.push(formatted.output);
            lastSuccess = runResult.success;
            lastSummary = formatted.summary;
          }
        } else {
          const sim = generateSimulatedOutput(code, currentStep.title);
          outputs.push(sim.output);
          lastSuccess = sim.success;
          lastSummary = sim.summary;
        }
      } catch {
        const sim = generateSimulatedOutput(code, currentStep.title);
        outputs.push(sim.output);
        lastSuccess = sim.success;
        lastSummary = sim.summary;
      }
    }
    const combined = outputs.join('\n\n');
    outputSurface.append(combined, { summary: lastSummary, success: lastSuccess });
    setConsolePanelCollapsed(false);

    const needsVerification = Boolean(currentStep?.codeBlocks?.length && (currentStep.verificationId || currentStep.onVerify));
    if (needsVerification) {
      setRunPhase('validating');
      outputSurface.append('Validation started.');
      const passed = await handleCheckProgress();
      setStepValidatedSuccessByIndex(prev => ({ ...prev, [currentStepIndex]: passed }));
    } else {
      setStepValidatedSuccessByIndex(prev => ({ ...prev, [currentStepIndex]: true }));
    }
    setRunPhase('idle');
    setIsRunning(false);
  }, [currentStep?.codeBlocks, currentStep?.title, currentStep?.verificationId, currentStep?.onVerify, currentStepIndex, labMongoUri, editableCodeByBlock, skeletonTier, showSolution, alwaysShowSolutions, displaySlots, nodeMongoshViewByKey, twinViewByKey, getDefaultViewForSlot, handleCheckProgress, onRunEchoToTerminal]);

  // IDE context: wire runAll to palette (must run after handleRunAll is defined)
  useEffect(() => {
    if (!ide) return;
    ide.runAllRef.current = handleRunAll;
    return () => {
      ide.runAllRef.current = null;
    };
  }, [ide, handleRunAll]);

  /** Reset current step: clear console, reset inline editors to original skeleton (as on first load), clear persisted logs and solution state */
  const handleResetStep = useCallback(() => {
    // Uncomplete the step in parent first so the step indicator updates immediately
    onResetStep?.(currentStepIndex);
    outputSurface.clear();
    setConsolePanelCollapsed(true);
    setExpandedLogIndex(null);
    const w = loadLabWorkspace(labNumber, userEmail);
    const updated = { ...w.logEntriesByStep, [currentStepIndex]: [] };
    saveLabWorkspace(labNumber, { logEntriesByStep: updated }, userEmail);
    // Reset inline editors to original skeleton and clear solution/revealed state so sync effects don't overwrite
    if (currentStep?.codeBlocks?.length) {
      const newEditors: Record<string, string> = { ...w.editors };
      currentStep.codeBlocks!.forEach((block, idx) => {
        const blockKey = `${currentStepIndex}-${idx}`;
        const tier = skeletonTier[blockKey] || 'guided';
        const skeletonCode = getDisplayCode(block, tier, false);
        newEditors[blockKey] = skeletonCode;
      });
      saveLabWorkspace(labNumber, { editors: newEditors }, userEmail);
      setEditableCodeByBlock((prev) => {
        const next = { ...prev };
        currentStep.codeBlocks!.forEach((block, idx) => {
          const blockKey = `${currentStepIndex}-${idx}`;
          const tier = skeletonTier[blockKey] || 'guided';
          next[blockKey] = getDisplayCode(block, tier, false);
        });
        return next;
      });
      setShowSolution((prev) => {
        const next = { ...prev };
        currentStep.codeBlocks!.forEach((_, idx) => {
          next[`${currentStepIndex}-${idx}`] = false;
        });
        return next;
      });
      setRevealedAnswers((prev) => {
        const next = { ...prev };
        currentStep.codeBlocks!.forEach((_, idx) => {
          next[`${currentStepIndex}-${idx}`] = [];
        });
        return next;
      });
      setRevealedHints((prev) => {
        const next = { ...prev };
        currentStep.codeBlocks!.forEach((_, idx) => {
          next[`${currentStepIndex}-${idx}`] = [];
        });
        return next;
      });
    }
    setValidationFailedByStep((prev) => ({ ...prev, [currentStepIndex]: false }));
    setStepValidatedSuccessByIndex((prev) => ({ ...prev, [currentStepIndex]: false }));
  }, [labNumber, currentStepIndex, userEmail, currentStep?.codeBlocks, skeletonTier, onResetStep]);

  /** Report issue: send logs and context to central DB for workshop maintainers */
  const [reportSending, setReportSending] = useState(false);
  useEffect(() => {
    onReportSendingChange?.(reportSending);
  }, [reportSending, onReportSendingChange]);
  const handleReportIssue = useCallback(async () => {
    setReportSending(true);
    try {
      const payload = {
        labNumber,
        labTitle,
        labId: currentStep?.id?.replace(/-step-.*$/, '') ?? undefined,
        stepId: currentStep?.id,
        stepTitle: currentStep?.title,
        stepIndex: currentStepIndex,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
        consoleLogEntries: logEntries.slice(-30).map((e) => ({
          time: e.time.toISOString(),
          output: e.output.slice(0, 8000),
        })),
        lastRunOutput: lastOutput ? lastOutput.slice(0, 50000) : null,
        lastRunSuccess: outputSuccess,
        userEmail: userEmail ?? undefined,
      };
      const res = await fetch('/api/report-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(data.message ?? 'Report sent. Maintainers can review the logs and context.');
      } else {
        toast.error(data.message ?? 'Failed to send report. Try again or copy the console output.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send report.');
    } finally {
      setReportSending(false);
    }
  }, [labNumber, labTitle, currentStep, currentStepIndex, logEntries, lastOutput, outputSuccess, userEmail]);

  useEffect(() => {
    if (!stepToolbarRef) return;
    stepToolbarRef.current = {
      reset: handleResetStep,
      openHelp: () => setHelpOpen(true),
      reportIssue: handleReportIssue,
    };
    return () => { stepToolbarRef.current = null; };
  }, [stepToolbarRef, handleResetStep, handleReportIssue]);

  /** Next Step: Advance only if current step is validated (validation runs after Run, not on Next). No code execution here. */
  const handleNextStep = async () => {
    if (currentStepNeedsVerification && !stepValidatedSuccessByIndex[currentStepIndex]) return;
    if (!isCompleted) {
      onComplete(currentStepIndex);
    }
    if (currentStepIndex < steps.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
      setDirection(1);
      onStepChange(currentStepIndex + 1);
    }
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
      <StepContextDrawer
        understandSection={currentStep.understandSection}
        doThisSection={currentStep.doThisSection}
        hints={currentStep.hints}
        tips={currentStep.tips}
        troubleshooting={currentStep.troubleshooting}
        businessValue={businessValue}
        atlasCapability={atlasCapability}
        open={helpOpen}
        onOpenChange={setHelpOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Read-only mode toggle removed - difficulty/solution controls are now per-block in header */}

        {/* Layout: Editor + Console (left); right area reserved for Compete & Preview tabs when enabled; step buttons in footer */}
        <div className="flex-1 overflow-hidden min-h-0">
          {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Left column: Editor (cjs/shell etc.) and Console stacked — vertical resizer between them */}
              <ResizablePanel defaultSize={80} minSize={30} className="min-h-0">
                <ResizablePanelGroup ref={editorConsoleGroupRef} direction="vertical" className="h-full min-h-0" id="step-editor-console">
                  {/* Editor panel: collapsible; code blocks; shell blocks show "Terminal" header + Run all/Run selection; content always scrollable */}
                  <ResizablePanel defaultSize={94} minSize={25} className="min-h-0">
                    <div className="h-full min-h-0 flex flex-col border-r border-border overflow-hidden">
                      {editorPanelCollapsed && displaySlots.length > 0 ? (() => {
                        const firstSlot = displaySlots[0];
                        const firstIsNodeMongoshCsharp = firstSlot.type === 'node-mongosh-csharp';
                        const firstIsNodeMongosh = firstSlot.type === 'node-mongosh' || firstIsNodeMongoshCsharp;
                        const firstSlotKey = firstSlot.type === 'node-mongosh' || firstSlot.type === 'node-mongosh-csharp' ? `${currentStepIndex}-${firstSlot.nodeIndex}` : '';
                        const firstView = firstIsNodeMongosh ? (nodeMongoshViewByKey[firstSlotKey] ?? getDefaultViewForSlot(firstSlot.type === 'node-mongosh-csharp' ? 'node-mongosh-csharp' : 'node-mongosh')) : undefined;
                        const firstBlock = firstSlot.type === 'node-mongosh-csharp'
                          ? (firstView === 'csharp' ? firstSlot.csharpBlock : firstView === 'node' ? firstSlot.nodeBlock : firstSlot.mongoshBlock)
                          : firstSlot.type === 'node-mongosh'
                            ? (firstView === 'node' ? firstSlot.nodeBlock : firstSlot.mongoshBlock)
                            : firstSlot.type === 'twin'
                              ? (twinViewByKey[`${currentStepIndex}-twin`] ?? 'A') === 'A' ? firstSlot.blockA : firstSlot.blockB
                              : firstSlot.block;
                        const firstIdx = firstSlot.type === 'node-mongosh-csharp'
                          ? (firstView === 'csharp' ? firstSlot.csharpIndex : firstView === 'node' ? firstSlot.nodeIndex : firstSlot.mongoshIndex)
                          : firstSlot.type === 'node-mongosh'
                            ? (firstView === 'node' ? firstSlot.nodeIndex : firstSlot.mongoshIndex)
                            : firstSlot.type === 'twin'
                              ? (twinViewByKey[`${currentStepIndex}-twin`] ?? 'A') === 'A' ? firstSlot.indexA : firstSlot.indexB
                              : firstSlot.originalIndex;
                        const firstKey = `${currentStepIndex}-${firstIdx}`;
                        const firstDisplayFilename = (() => {
                          const base = firstBlock.filename.includes(' (') ? firstBlock.filename.split(' (')[0].trim() : firstBlock.filename;
                          return base.replace(/^\d+\.\s*/, '').trim() || base;
                        })();
                        const firstIsTwin = firstSlot.type === 'twin';
                        const firstIsDriverOnly = firstSlot.type === 'single' && (
                          (firstBlock.filename?.toLowerCase().endsWith('.cjs') || firstBlock.filename?.toLowerCase().endsWith('.js')) && ['javascript', 'typescript'].includes((firstBlock.language || '').toLowerCase())
                          || ['python', 'py'].includes((firstBlock.language || '').toLowerCase())
                          || firstBlock.filename?.toLowerCase().endsWith('.py')
                        );
                        const firstIsShell = ['shell', 'bash', 'sh'].includes((firstBlock.language || '').toLowerCase());
                        const firstTier = skeletonTier[firstKey] || 'guided';
                        const firstHasSkeleton = hasAnySkeleton(firstBlock);
                        const firstSolutionRevealed = alwaysShowSolutions || !!showSolution[firstKey] || !firstHasSkeleton;
                        const firstPenalty = getSolutionPenalty(firstTier);
                        const firstDisplayCode = getDisplayCode(firstBlock, firstTier, firstSolutionRevealed);
                        return (
                          <div className="flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <button type="button" onClick={() => setEditorPanelCollapsed(false)} className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors" title="Expand editor">
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                              </button>
                              {firstIsShell ? (
                                <>
                                  <Terminal className="w-3 h-3 flex-shrink-0 text-green-500" aria-hidden />
                                  <span className="text-[8px] font-medium text-white truncate">Terminal</span>
                                </>
                              ) : firstIsNodeMongosh ? (
                                <>
                                  <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                                  <span className="font-mono text-[8px] text-white flex items-center gap-1 truncate">
                                    <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [firstSlotKey]: 'mongosh' }))} className={cn("truncate", (nodeMongoshViewByKey[firstSlotKey] ?? getDefaultViewForSlot(firstSlot.type === 'node-mongosh-csharp' ? 'node-mongosh-csharp' : 'node-mongosh')) === 'mongosh' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Mongosh script">mongosh</button>
                                    <span className="text-muted-foreground flex-shrink-0">!</span>
                                    <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [firstSlotKey]: 'node' }))} className={cn("truncate", (nodeMongoshViewByKey[firstSlotKey] ?? getDefaultViewForSlot(firstSlot.type === 'node-mongosh-csharp' ? 'node-mongosh-csharp' : 'node-mongosh')) === 'node' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Node script">node</button>
                                    {firstIsNodeMongoshCsharp && (
                                      <>
                                        <span className="text-muted-foreground flex-shrink-0">!</span>
                                        <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [firstSlotKey]: 'csharp' }))} className={cn("truncate", (nodeMongoshViewByKey[firstSlotKey] ?? getDefaultViewForSlot('node-mongosh-csharp')) === 'csharp' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show C# script">C#</button>
                                      </>
                                    )}
                                  </span>
                                </>
                              ) : firstIsTwin ? (
                                <>
                                  <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                                  <span className="font-mono text-[8px] text-white flex items-center gap-1 truncate">
                                    <button type="button" onClick={() => setTwinViewByKey((prev) => ({ ...prev, [`${currentStepIndex}-twin`]: 'A' }))} className={cn("truncate", (twinViewByKey[`${currentStepIndex}-twin`] ?? 'A') === 'A' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title={firstSlot.blockA.filename}>{(firstSlot.blockA.filename.includes(' (') ? firstSlot.blockA.filename.split(' (')[0].trim() : firstSlot.blockA.filename).replace(/^\d+\.\s*/, '').trim() || firstSlot.blockA.filename}</button>
                                    <span className="text-muted-foreground flex-shrink-0">|</span>
                                    <button type="button" onClick={() => setTwinViewByKey((prev) => ({ ...prev, [`${currentStepIndex}-twin`]: 'B' }))} className={cn("truncate", (twinViewByKey[`${currentStepIndex}-twin`] ?? 'A') === 'B' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title={firstSlot.blockB.filename}>{(firstSlot.blockB.filename.includes(' (') ? firstSlot.blockB.filename.split(' (')[0].trim() : firstSlot.blockB.filename).replace(/^\d+\.\s*/, '').trim() || firstSlot.blockB.filename}</button>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                                  <span className="font-mono text-[8px] text-white truncate" title={firstBlock.filename}>{firstIsDriverOnly && (firstBlock.filename?.toLowerCase().endsWith('.cjs') || firstBlock.filename?.toLowerCase().endsWith('.js')) ? 'node' : firstDisplayFilename}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {(firstIsShell || firstIsNodeMongosh || firstIsDriverOnly || firstIsTwin) && (
                                <>
                                  {firstIsShell && <span className="text-[7px] text-muted-foreground/70 mr-0.5">—</span>}
                                  <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                      {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                    </Button>
                                  </TooltipTrigger><TooltipContent side="bottom">{runAllTooltip}</TooltipContent></Tooltip></TooltipProvider>
                                </>
                              )}
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step">
                                  <RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span>
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {firstHasSkeleton && !firstSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution(firstIsNodeMongoshCsharp ? [`${currentStepIndex}-${firstSlot.nodeIndex}`, `${currentStepIndex}-${firstSlot.mongoshIndex}`, `${currentStepIndex}-${firstSlot.csharpIndex}`] : firstIsNodeMongosh ? [`${currentStepIndex}-${firstSlot.nodeIndex}`, `${currentStepIndex}-${firstSlot.mongoshIndex}`] : firstIsTwin ? [`${currentStepIndex}-${firstSlot.indexA}`, `${currentStepIndex}-${firstSlot.indexB}`] : firstKey, firstTier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Eye className="w-2 h-2" /><span className="hidden sm:inline">Solution</span><span>(-{firstPenalty})</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(firstIdx)} className="gap-0.5 h-3.5 text-[8px] px-1" title="Copy">
                                {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })() : editorPanelCollapsed ? null : (
                      <div className={cn(
                        "flex-1 flex min-h-0 overflow-auto",
                        showCompetitorPanel && "flex-row"
                      )}>
                        <div className={cn(
                          "flex flex-col overflow-auto justify-start min-h-0 flex-1 min-w-0",
                          showCompetitorPanel && "min-w-0 basis-0",
                          sortedCodeBlocksWithIndex.length === 2 && !showCompetitorPanel && "gap-1"
                        )}>
                  {displaySlots.map((slot, slotIndex) => {
                    if (slot.type === 'node-mongosh') {
                      const { nodeBlock, nodeIndex, mongoshBlock, mongoshIndex } = slot;
                      const slotKey = `${currentStepIndex}-${nodeIndex}`;
                      const view = nodeMongoshViewByKey[slotKey] ?? getDefaultViewForSlot('node-mongosh');
                      const activeBlock = view === 'mongosh' ? mongoshBlock : nodeBlock;
                      const activeIndex = view === 'mongosh' ? mongoshIndex : nodeIndex;
                      const activeKey = `${currentStepIndex}-${activeIndex}`;
                      const nodeKey = `${currentStepIndex}-${nodeIndex}`;
                      const mongoshKey = `${currentStepIndex}-${mongoshIndex}`;
                      const hasSkeleton = hasAnySkeleton(activeBlock);
                      const tier = skeletonTier[activeKey] || 'guided';
                      const isSolutionRevealed = alwaysShowSolutions || showSolution[activeKey] || !hasSkeleton;
                      const displayCode = getDisplayCodeWithShellIfRevealed(activeBlock, tier, isSolutionRevealed, activeBlock.language, labMongoUri);
                      const solutionPenalty = getSolutionPenalty(tier);
                      const handleBlockCodeChange = (v: string | undefined) => {
                        const value = v ?? '';
                        setEditableCodeByBlock((prev) => ({ ...prev, [activeKey]: value }));
                      };
                      return (
                        <div key={`node-mongosh-${nodeIndex}`} className={cn("flex flex-col flex-1 min-h-0", slotIndex > 0 && "border-t border-border")}>
                          <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              {slotIndex === 0 && (
                                <button type="button" onClick={() => setEditorPanelCollapsed(true)} className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors" title="Collapse editor">
                                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                              <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                              <span className="font-mono text-[8px] text-white flex items-center gap-1 truncate">
                                <button
                                  type="button"
                                  onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [slotKey]: 'mongosh' }))}
                                  className={cn("truncate", view === 'mongosh' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')}
                                  title="Show Mongosh script"
                                >
                                  mongosh
                                </button>
                                <span className="text-muted-foreground flex-shrink-0">!</span>
                                <button
                                  type="button"
                                  onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [slotKey]: 'node' }))}
                                  className={cn("truncate", view === 'node' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')}
                                  title="Show Node script"
                                >
                                  node
                                </button>
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">{runAllTooltip}</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step"><RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span></Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution([nodeKey, mongoshKey], tier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Eye className="w-2 h-2" /><span className="hidden sm:inline">Solution</span><span>(-{solutionPenalty})</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(activeIndex)} className="gap-0.5 h-3.5 text-[8px] px-1" title="Copy">
                                {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                          <InlineHintEditor
                            key={`editor-${activeKey}-${isSolutionRevealed}`}
                            code={displayCode}
                            controlledValue={editableCodeByBlock[activeKey]}
                            onCodeChange={handleBlockCodeChange}
                            language={activeBlock.language}
                            lineHeight={lineHeight}
                            setLineHeight={setLineHeight}
                            hasSkeleton={hasSkeleton}
                            isSolutionRevealed={isSolutionRevealed}
                            inlineHints={activeBlock.inlineHints}
                            tier={tier}
                            revealedHints={revealedHints[activeKey] || []}
                            revealedAnswers={revealedAnswers[activeKey] || []}
                            onRevealHint={(hintIdx) => revealInlineHint(activeKey, hintIdx, tier)}
                            onRevealAnswer={(hintIdx) => revealInlineAnswer(activeKey, hintIdx, tier)}
                            documentPath={`lab/${labNumber}/step/${activeKey.replace('-', '/')}`}
                            equalHeightSplit={false}
                            fillContainer={true}
                          />
                        </div>
                      );
                    }

                    if (slot.type === 'node-mongosh-csharp') {
                      const { nodeBlock, nodeIndex, mongoshBlock, mongoshIndex, csharpBlock, csharpIndex } = slot;
                      const slotKey = `${currentStepIndex}-${nodeIndex}`;
                      const view = nodeMongoshViewByKey[slotKey] ?? getDefaultViewForSlot('node-mongosh-csharp');
                      const activeBlock = view === 'csharp' ? csharpBlock : view === 'mongosh' ? mongoshBlock : nodeBlock;
                      const activeIndex = view === 'csharp' ? csharpIndex : view === 'mongosh' ? mongoshIndex : nodeIndex;
                      const activeKey = `${currentStepIndex}-${activeIndex}`;
                      const nodeKey = `${currentStepIndex}-${nodeIndex}`;
                      const mongoshKey = `${currentStepIndex}-${mongoshIndex}`;
                      const csharpKey = `${currentStepIndex}-${csharpIndex}`;
                      const hasSkeleton = hasAnySkeleton(activeBlock);
                      const tier = skeletonTier[activeKey] || 'guided';
                      const isSolutionRevealed = alwaysShowSolutions || showSolution[activeKey] || !hasSkeleton;
                      const displayCode = getDisplayCodeWithShellIfRevealed(activeBlock, tier, isSolutionRevealed, activeBlock.language, labMongoUri);
                      const solutionPenalty = getSolutionPenalty(tier);
                      const handleBlockCodeChange = (v: string | undefined) => {
                        const value = v ?? '';
                        setEditableCodeByBlock((prev) => ({ ...prev, [activeKey]: value }));
                      };
                      return (
                        <div key={`node-mongosh-csharp-${nodeIndex}`} className={cn("flex flex-col flex-1 min-h-0", slotIndex > 0 && "border-t border-border")}>
                          <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              {slotIndex === 0 && (
                                <button type="button" onClick={() => setEditorPanelCollapsed(true)} className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors" title="Collapse editor">
                                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                              <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                              <span className="font-mono text-[8px] text-white flex items-center gap-1 truncate">
                                <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [slotKey]: 'mongosh' }))} className={cn("truncate", view === 'mongosh' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Mongosh script">mongosh</button>
                                <span className="text-muted-foreground flex-shrink-0">!</span>
                                <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [slotKey]: 'node' }))} className={cn("truncate", view === 'node' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Node script">node</button>
                                <span className="text-muted-foreground flex-shrink-0">!</span>
                                <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [slotKey]: 'csharp' }))} className={cn("truncate", view === 'csharp' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show C# script">C#</button>
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">{runAllTooltip}</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step"><RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span></Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution([nodeKey, mongoshKey, csharpKey], tier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Eye className="w-2 h-2" /><span className="hidden sm:inline">Solution</span><span>(-{solutionPenalty})</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(activeIndex)} className="gap-0.5 h-3.5 text-[8px] px-1" title="Copy">
                                {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                          <InlineHintEditor
                            key={`editor-${activeKey}-${isSolutionRevealed}`}
                            code={displayCode}
                            controlledValue={editableCodeByBlock[activeKey]}
                            onCodeChange={handleBlockCodeChange}
                            language={activeBlock.language}
                            lineHeight={lineHeight}
                            setLineHeight={setLineHeight}
                            hasSkeleton={hasSkeleton}
                            isSolutionRevealed={isSolutionRevealed}
                            inlineHints={activeBlock.inlineHints}
                            tier={tier}
                            revealedHints={revealedHints[activeKey] || []}
                            revealedAnswers={revealedAnswers[activeKey] || []}
                            onRevealHint={(hintIdx) => revealInlineHint(activeKey, hintIdx, tier)}
                            onRevealAnswer={(hintIdx) => revealInlineAnswer(activeKey, hintIdx, tier)}
                            documentPath={`lab/${labNumber}/step/${activeKey.replace('-', '/')}`}
                            equalHeightSplit={false}
                            fillContainer={true}
                          />
                        </div>
                      );
                    }

                    if (slot.type === 'twin') {
                      const { blockA, indexA, blockB, indexB } = slot;
                      const twinKey = `${currentStepIndex}-twin`;
                      const view = twinViewByKey[twinKey] ?? 'A';
                      const activeBlock = view === 'A' ? blockA : blockB;
                      const activeIndex = view === 'A' ? indexA : indexB;
                      const activeKey = `${currentStepIndex}-${activeIndex}`;
                      const hasSkeleton = hasAnySkeleton(activeBlock);
                      const tier = skeletonTier[activeKey] || 'guided';
                      const isSolutionRevealed = alwaysShowSolutions || showSolution[activeKey] || !hasSkeleton;
                      const displayCode = getDisplayCodeWithShellIfRevealed(activeBlock, tier, isSolutionRevealed, activeBlock.language, labMongoUri);
                      const solutionPenalty = getSolutionPenalty(tier);
                      const handleBlockCodeChange = (v: string | undefined) => {
                        setEditableCodeByBlock((prev) => ({ ...prev, [activeKey]: v ?? '' }));
                      };
                      const nameA = (blockA.filename.includes(' (') ? blockA.filename.split(' (')[0].trim() : blockA.filename).replace(/^\d+\.\s*/, '').trim() || blockA.filename;
                      const nameB = (blockB.filename.includes(' (') ? blockB.filename.split(' (')[0].trim() : blockB.filename).replace(/^\d+\.\s*/, '').trim() || blockB.filename;
                      return (
                        <div key={`twin-${indexA}-${indexB}`} className={cn("flex flex-col flex-1 min-h-0", slotIndex > 0 && "border-t border-border")}>
                          <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              {slotIndex === 0 && (
                                <button type="button" onClick={() => setEditorPanelCollapsed(true)} className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors" title="Collapse editor">
                                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                              <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                              <span className="font-mono text-[8px] text-white flex items-center gap-1 truncate">
                                <button type="button" onClick={() => setTwinViewByKey((prev) => ({ ...prev, [twinKey]: 'A' }))} className={cn("truncate", view === 'A' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title={blockA.filename}>{nameA}</button>
                                <span className="text-muted-foreground flex-shrink-0">|</span>
                                <button type="button" onClick={() => setTwinViewByKey((prev) => ({ ...prev, [twinKey]: 'B' }))} className={cn("truncate", view === 'B' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title={blockB.filename}>{nameB}</button>
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">{runAllTooltip}</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step"><RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span></Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution([`${currentStepIndex}-${indexA}`, `${currentStepIndex}-${indexB}`], tier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Eye className="w-2 h-2" /><span className="hidden sm:inline">Solution</span><span>(-{solutionPenalty})</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(activeIndex)} className="gap-0.5 h-3.5 text-[8px] px-1" title="Copy">
                                {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                          <InlineHintEditor
                            key={`editor-${activeKey}-${isSolutionRevealed}`}
                            code={displayCode}
                            controlledValue={editableCodeByBlock[activeKey]}
                            onCodeChange={handleBlockCodeChange}
                            language={activeBlock.language}
                            lineHeight={lineHeight}
                            setLineHeight={setLineHeight}
                            hasSkeleton={hasSkeleton}
                            isSolutionRevealed={isSolutionRevealed}
                            inlineHints={activeBlock.inlineHints}
                            tier={tier}
                            revealedHints={revealedHints[activeKey] || []}
                            revealedAnswers={revealedAnswers[activeKey] || []}
                            onRevealHint={(hintIdx) => revealInlineHint(activeKey, hintIdx, tier)}
                            onRevealAnswer={(hintIdx) => revealInlineAnswer(activeKey, hintIdx, tier)}
                            documentPath={`lab/${labNumber}/step/${activeKey.replace('-', '/')}`}
                            equalHeightSplit={false}
                            fillContainer={true}
                          />
                        </div>
                      );
                    }

                    const { block, originalIndex } = slot;
                    const blockKey = `${currentStepIndex}-${originalIndex}`;
                    const hasSkeleton = hasAnySkeleton(block);
                    const tier = skeletonTier[blockKey] || 'guided';
                    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
                    const displayCode = getDisplayCodeWithShellIfRevealed(block, tier, isSolutionRevealed, block.language, labMongoUri);
                    const solutionPenalty = getSolutionPenalty(tier);
                    const isTwoBlockPattern = displaySlots.length === 2;
                    const displayFilename = (() => {
                      const base = block.filename.includes(' (') ? block.filename.split(' (')[0].trim() : block.filename;
                      return base.replace(/^\d+\.\s*/, '').trim() || base;
                    })();
                    const isShellBlock = ['shell', 'bash', 'sh'].includes((block.language || '').toLowerCase());
                    const isNodeBlock = (block.filename?.toLowerCase().endsWith('.cjs') || block.filename?.toLowerCase().endsWith('.js')) && ['javascript', 'typescript'].includes((block.language || '').toLowerCase());
                    const isDriverOnlyBlock = isNodeBlock || ['python', 'py'].includes((block.language || '').toLowerCase()) || (block.filename?.toLowerCase().endsWith('.py'));

                    // Single driver-only block (Node, Python, etc.): no mongosh tab — show filename only and editor (driver must run the code)
                    if (slot.type === 'single' && isDriverOnlyBlock) {
                      const handleBlockCodeChange = (v: string | undefined) => {
                        const value = v ?? '';
                        setEditableCodeByBlock((prev) => ({ ...prev, [blockKey]: value }));
                      };
                      return (
                        <div key={`driver-only-${originalIndex}`} className={cn("flex flex-col flex-1 min-h-0", slotIndex > 0 && "border-t border-border")}>
                          <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              {slotIndex === 0 && (
                                <button type="button" onClick={() => setEditorPanelCollapsed(true)} className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors" title="Collapse editor">
                                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                              <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                              <span className="font-mono text-[8px] text-white truncate" title={block.filename}>{isNodeBlock ? 'node' : displayFilename}</span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">{runAllTooltip}</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step"><RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span></Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution(blockKey, tier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Eye className="w-2 h-2" /><span className="hidden sm:inline">Solution</span><span>(-{solutionPenalty})</span>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleCopyCode(originalIndex)} className="gap-0.5 h-3.5 text-[8px] px-1" title="Copy">
                                {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                                <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                              </Button>
                            </div>
                          </div>
                          <InlineHintEditor
                            key={`editor-${blockKey}-${isSolutionRevealed}`}
                            code={displayCode}
                            controlledValue={editableCodeByBlock[blockKey]}
                            onCodeChange={handleBlockCodeChange}
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
                            documentPath={`lab/${labNumber}/step/${blockKey.replace('-', '/')}`}
                            equalHeightSplit={false}
                            fillContainer={true}
                          />
                        </div>
                      );
                    }

                    const handleBlockCodeChange = (v: string | undefined) => {
                      const value = v ?? '';
                      setEditableCodeByBlock((prev) => ({ ...prev, [blockKey]: value }));
                      // all editors persisted via central labWorkspaceStorage
                    };

                    return (
                      <div 
                        key={originalIndex} 
                        className={cn(
                          "flex flex-col flex-shrink-0",
                          isTwoBlockPattern && "flex-1 min-h-0",
                          slotIndex > 0 && "border-t border-border"
                        )}
                      >
                                        {/* Block header: collapse toggle on same row as filename/Terminal (first block only); sticky when scrolling */}
                        <div className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between gap-1.5 border border-border border-b bg-muted px-2 py-1 min-w-0 shadow-[0_1px_0_0_var(--border)]">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            {slotIndex === 0 && (
                              <button
                                type="button"
                                onClick={() => setEditorPanelCollapsed(true)}
                                className="flex-shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors"
                                title="Collapse editor"
                              >
                                <ChevronUp className="w-3 h-3 text-muted-foreground" />
                              </button>
                            )}
                            {isShellBlock ? (
                              <>
                                <Terminal className="w-3 h-3 flex-shrink-0 text-green-500" aria-hidden />
                                <span className="text-[8px] font-medium text-white truncate">Terminal</span>
                              </>
                            ) : (
                              <>
                                <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                                <span className="font-mono text-[8px] text-white truncate" title={block.filename}>{isNodeBlock ? 'node' : displayFilename}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {isShellBlock && (
                              <>
                                <span className="text-[7px] text-muted-foreground/70 mr-0.5">—</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={runAllDisabled} className="h-3.5 w-3.5 text-primary" title={runAllTooltip}>
                                        {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">{runAllTooltip}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step">
                                    <RotateCcw className="w-2 h-2" />
                                    <span className="hidden sm:inline">Reset</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Reset step (clear output)</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {hasSkeleton && !isSolutionRevealed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revealSolution(blockKey, tier)}
                                className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Eye className="w-2 h-2" />
                                <span className="hidden sm:inline">Solution</span>
                                <span>(-{solutionPenalty})</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(originalIndex)}
                              className="gap-0.5 h-3.5 text-[8px] px-1"
                              title="Copy"
                            >
                              {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-2 h-2" />}
                              <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                            </Button>
                          </div>
                        </div>

                        <InlineHintEditor
                          key={`editor-${currentStepIndex}-${originalIndex}-${isSolutionRevealed}`}
                          code={displayCode}
                          controlledValue={editableCodeByBlock[blockKey]}
                          onCodeChange={handleBlockCodeChange}
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
                          documentPath={`lab/${labNumber}/step/${blockKey.replace('-', '/')}`}
                          equalHeightSplit={isTwoBlockPattern}
                        />

                      </div>
                    );
                  })}
                  </div>
                  {/* Competitor side-by-side panel (demo + moderator only): 50% width when expanded */}
                  {showCompetitorPanel && effectiveCompetitorId && (
                    <div className={cn(
                      "flex flex-col border-l border-border bg-muted/30 min-h-0",
                      competitorPanelCollapsed ? "w-10 shrink-0" : "flex-1 min-w-0 basis-0"
                    )}>
                      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-2 py-1.5 border-b border-border bg-muted/50">
                        <div className="flex items-center gap-2 min-w-0">
                          <GitCompare className="w-4 h-4 text-amber-500 shrink-0" />
                          <Select
                            value={effectiveCompetitorId}
                            onValueChange={(v) => setSelectedCompetitorId(v)}
                          >
                            <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none focus:ring-0 w-auto min-w-[120px]">
                              <SelectValue placeholder="Compare with…" />
                            </SelectTrigger>
                            <SelectContent>
                              {stepCompetitorIds.map((id) => (
                                <SelectItem key={id} value={id}>
                                  {getCompetitorProductLabel(id)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setCompetitorPanelCollapsed(!competitorPanelCollapsed)}
                        >
                          {competitorPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </div>
                      {!competitorPanelCollapsed && competitorBlockForSelected && (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                          {competitorBlockForSelected.equiv.workaroundNote && (
                            <div className="flex-shrink-0 px-2 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                              {competitorBlockForSelected.equiv.workaroundNote}
                            </div>
                          )}
                          <div className="flex-1 min-h-0 overflow-auto">
                            <Editor
                              height="100%"
                              theme={getLabEditorTheme(resolvedTheme)}
                              beforeMount={defineLabDarkTheme}
                              language={competitorBlockForSelected.equiv.language}
                              value={competitorBlockForSelected.equiv.code}
                              options={getReadOnlyLabOptions()}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                        </div>
                      )}
                    </div>
                  </ResizablePanel>

                  {/* Divider splitter between Editor and Terminal */}
                  <ResizableHandle
                    withHandle
                    className="bg-border hover:bg-primary/50 transition-colors data-[panel-group-direction=vertical]:cursor-ns-resize shrink-0"
                  />

              {/* Terminal panel: run output (replaces Console); collapsible; status in header; body = xterm when session provided */}
              <ResizablePanel defaultSize={6} minSize={15} collapsible collapsedSize={6} className="min-h-0">
                <div className="h-full min-h-0 flex flex-col bg-background/95">
                  <button
                    type="button"
                    onClick={() => setConsolePanelCollapsed((c) => !c)}
                    className="flex-shrink-0 flex items-center gap-2 px-2 py-1 border border-border border-b bg-muted/40 hover:bg-muted transition-colors text-left w-full"
                    title={consolePanelCollapsed ? 'Expand terminal' : 'Collapse terminal'}
                  >
                    {consolePanelCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <Terminal className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[8px] font-medium text-white">Terminal</span>
                    {runPhase === 'running' && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400 animate-pulse">
                        Running script…
                      </span>
                    )}
                    {runPhase === 'validating' && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400 animate-pulse">
                        Validation started…
                      </span>
                    )}
                    {runPhase === 'idle' && outputSummary && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                        outputSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {outputSuccess ? '✓' : '✗'} {outputSummary}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {terminalSessionProp ? (
                      <XtermTerminal
                        session={terminalSessionProp}
                        welcome="Lab terminal. Run the step to see output."
                        className="flex-1 min-h-0"
                      />
                    ) : (
                      <div className="flex-1 min-h-0 overflow-auto px-2 py-1.5 bg-[hsl(220,20%,6%)] font-mono text-xs text-white flex items-center justify-center">
                        <span className="text-white/50">Connecting to terminal…</span>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              {showCompetitorComparisons && (
                <>
                  <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />
                  {/* Preview panel: right column — only when moderator enables competitor comparisons */}
                  <ResizablePanel defaultSize={20} minSize={15}>
                    <div className="h-full flex flex-col bg-background/95 border-l border-border">
                      <div className="flex-shrink-0 flex items-center gap-1.5 px-1.5 py-0.5 border border-border border-b bg-muted/40">
                        <Tabs value={previewPanelTab} onValueChange={(v) => setPreviewPanelTab(v as 'preview' | 'compete')} className="flex-shrink-0">
                          <TabsList className="bg-transparent h-5 p-0 gap-0">
                            <TabsTrigger value="compete" className="text-[9px] h-4 px-1.5 data-[state=active]:bg-muted">Compete</TabsTrigger>
                            <TabsTrigger value="preview" className="text-[9px] h-4 px-1.5 data-[state=active]:bg-muted">Preview</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        {atlasCapability && (
                          <div className="flex-1 flex justify-center min-w-0">
                            <span className="text-[9px] font-medium text-primary truncate" title={atlasCapability}>{atlasCapability}</span>
                          </div>
                        )}
                        {previewPanelTab === 'preview' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setPreviewRefreshKey((k) => k + 1)} className="h-4 w-4">
                                  <RefreshCw className="w-2.5 h-2.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Refresh preview</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex-1 overflow-auto min-h-0 px-2 py-2">
                        {previewPanelTab === 'compete' ? (
                          stepCompetitorIds.length > 0 ? (
                            <div className="flex flex-col h-full min-h-0 gap-2 overflow-auto">
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] text-muted-foreground">Competitor:</span>
                                <Select value={effectiveCompetitorId ?? ''} onValueChange={(v) => setSelectedCompetitorId(v)}>
                                  <SelectTrigger className="h-6 text-[10px] w-[140px]">
                                    <SelectValue placeholder="Select…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stepCompetitorIds.map((id) => (
                                      <SelectItem key={id} value={id}>
                                        {getCompetitorProductLabel(id)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {competitorBlockForSelected && (
                                <>
                                  <div className="flex-shrink-0">
                                    <p className="text-[10px] font-medium text-muted-foreground mb-1">How {getCompetitorProductLabel(effectiveCompetitorId ?? '')} does it (prefer code)</p>
                                    <div className="rounded border border-border overflow-hidden min-h-[120px] flex-1">
                                      <Editor
                                        height="180"
                                        theme={getLabEditorTheme(resolvedTheme)}
                                        beforeMount={defineLabDarkTheme}
                                        language={competitorBlockForSelected.equiv.language}
                                        value={competitorBlockForSelected.equiv.code}
                                        options={getReadOnlyLabOptions()}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 rounded border border-amber-500/20 bg-amber-500/5 p-2 space-y-2">
                                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Challenges vs MongoDB</p>
                                    {competitorBlockForSelected.equiv.workaroundNote && (
                                      <p className="text-[10px] text-muted-foreground leading-snug">{competitorBlockForSelected.equiv.workaroundNote}</p>
                                    )}
                                    {competitorBlockForSelected.equiv.challenges && competitorBlockForSelected.equiv.challenges.length > 0 && (
                                      <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-0.5">
                                        {competitorBlockForSelected.equiv.challenges.map((c, i) => (
                                          <li key={i}>{c}</li>
                                        ))}
                                      </ul>
                                    )}
                                    {competitorBlockForSelected.equiv.comparisonSummary && (
                                      <div className="text-[10px] text-muted-foreground leading-snug whitespace-pre-wrap border-t border-amber-500/20 pt-1.5 mt-1.5">
                                        {competitorBlockForSelected.equiv.comparisonSummary}
                                      </div>
                                    )}
                                    {!competitorBlockForSelected.equiv.workaroundNote &&
                                      (!competitorBlockForSelected.equiv.challenges || competitorBlockForSelected.equiv.challenges.length === 0) &&
                                      !competitorBlockForSelected.equiv.comparisonSummary && (
                                        <p className="text-[10px] text-muted-foreground italic">Compare with the MongoDB approach in the editor — native driver support, no workarounds.</p>
                                      )}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="h-full min-h-[80px] flex items-center justify-center text-center text-muted-foreground text-[10px]">No competitor comparison for this step.</div>
                          )
                        ) : currentStep.preview ? (
                          <div key={previewRefreshKey} className="h-full min-h-0">
                            <GenericLabPreview
                              preview={currentStep.preview}
                              data={{ rawOutput: lastOutput } as LabPreviewData}
                              isRunning={isRunning}
                              hasRun={!!lastOutput}
                            />
                          </div>
                        ) : (
                          <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center rounded border border-dashed border-border p-4 text-muted-foreground">
                            <Layout className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs font-medium mb-0.5">Preview: frontend demo</p>
                            <p className="text-[10px]">When configured, this tab shows a visual frontend that demonstrates how this capability can be used (e.g. search, table, chart, encryption demo). Run the step code to see results here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
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

      {/* Footer navigation: step dots + Previous / Run / Next — right area reserved for Compete & Preview tabs */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-border bg-card">
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1.5">
              {steps.map((step, index) => {
                const canNavigateToStep = index <= maxReachableStepIndex || completedSteps.includes(index);
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => {
                          if (!canNavigateToStep) return;
                          setDirection(index > currentStepIndex ? 1 : -1);
                          onStepChange(index);
                        }}
                        whileHover={canNavigateToStep ? { scale: 1.1 } : undefined}
                        whileTap={canNavigateToStep ? { scale: 0.95 } : undefined}
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                          !canNavigateToStep && 'cursor-not-allowed opacity-60',
                          index === currentStepIndex
                            ? validationFailedByStep[index]
                              ? 'bg-destructive text-destructive-foreground ring-2 ring-destructive/50'
                              : 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                            : completedSteps.includes(index)
                            ? 'bg-primary/20 text-primary'
                            : canNavigateToStep
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {completedSteps.includes(index) ? (
                          <CheckCircle2 className="w-4 h-4" />
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
                          {index === currentStepIndex && validationFailedByStep[index] && (
                            <span className="text-destructive flex items-center gap-1">
                              Validation failed
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevStep} disabled={currentStepIndex === 0} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleRunAll} disabled={runAllDisabled} className="gap-1">
                    {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{runAllTooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    size="sm"
                    onClick={handleNextStep}
                    disabled={isRunning || (currentStepNeedsVerification && !stepValidatedSuccessByIndex[currentStepIndex])}
                    className="gap-1"
                  >
                    {currentStepIndex === steps.length - 1 ? (
                      <><CheckCircle2 className="w-4 h-4" /> Complete Lab</>
                    ) : (
                      <>Next Step <ChevronRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {currentStepNeedsVerification && !stepValidatedSuccessByIndex[currentStepIndex]
                  ? 'Run the step and pass validation to enable Next.'
                  : 'Go to next step'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
    </div>
  );
}
