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
import { getReadOnlyLabOptions, defineLabDarkTheme, LAB_EDITOR_THEME } from '@/lib/monacoLabEditorOptions';
import type { LabStepPreviewConfig, LabPreviewData } from '@/types';
import { useLab } from '@/context/LabContext';
import {
  loadLabWorkspace,
  saveLabWorkspace,
  logEntriesToStored,
  storedToLogEntries,
} from '@/services/labWorkspaceStorage';
import { getVerificationService, type VerificationId } from '@/services/verificationService';

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
  /** When set, StepView assigns reset/check/openHelp so parent can render toolbar on same line as Overview/Steps */
  stepToolbarRef?: React.MutableRefObject<{ reset: () => void; openHelp: () => void } | null>;
  /** Increments when user resets progress; StepView clears hints and reloads workspace when this changes */
  resetProgressCount?: number;
  /** Called when user resets the current step so parent can uncomplete it (e.g. remove from completedSteps) */
  onResetStep?: (stepIndex: number) => void;
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
  resetProgressCount = 0,
  onResetStep,
}: StepViewProps) {
  const { userEmail, userSuffix, subtractPoints } = useLab();
  const [helpOpen, setHelpOpen] = useState(false);
  const [previewPanelTab, setPreviewPanelTab] = useState<'preview' | 'compete'>('compete');
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

  /** Fill all blanks in skeleton with answers from inlineHints. Use this for "Solution" so the displayed solution is exactly the skeleton with no placeholders (same lines as skeleton). */
  const fillAllBlanksInSkeleton = useCallback((skeleton: string, inlineHints: InlineHint[] | undefined): string => {
    if (!inlineHints?.length) return skeleton;
    const lines = skeleton.split('\n');
    inlineHints.forEach((hint) => {
      const lineIndex = hint.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length && lines[lineIndex].includes(hint.blankText)) {
        lines[lineIndex] = lines[lineIndex].replace(hint.blankText, hint.answer);
      }
    });
    return lines.join('\n');
  }, []);

  // Get display code based on tier. When solution is revealed and block has skeleton + inlineHints, show skeleton with all blanks filled (so solution is same structure as skeleton).
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
    if (solutionRevealed && block.skeleton && block.inlineHints?.length) {
      return fillAllBlanksInSkeleton(block.skeleton, block.inlineHints);
    }
    if (solutionRevealed) return block.code;
    return base;
  };

  // Check if block has any skeleton tier
  const hasAnySkeleton = (block: CodeBlock): boolean => {
    return !!(block.skeleton || block.challengeSkeleton || block.expertSkeleton);
  };

  /** Apply revealed answers into code (replace blanks with hint.answer) so editor shows correct values */
  const applyRevealedAnswersToCode = useCallback((code: string, inlineHints: InlineHint[] | undefined, revealed: number[]): string => {
    if (!inlineHints?.length || revealed.length === 0) return code;
    const lines = code.split('\n');
    inlineHints.forEach((hint, hintIdx) => {
      if (revealed.includes(hintIdx)) {
        const lineIndex = hint.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const lineText = lines[lineIndex];
          // Replace the specific blankText so multiple blanks per line work correctly
          lines[lineIndex] = lineText.includes(hint.blankText)
            ? lineText.replace(hint.blankText, hint.answer)
            : lineText.replace(/_{5,}/, hint.answer);
        }
      }
    });
    return lines.join('\n');
  }, []);

  const currentStep = steps[currentStepIndex];
  const isCompleted = completedSteps.includes(currentStepIndex);

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

  // Pairs: node (.cjs/.js) + Mongosh block → one slot with "mongosh ! node" toggle (Run uses editor content: node → run-node, mongosh → run-mongosh)
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

  type DisplaySlot = { type: 'single'; block: CodeBlock; originalIndex: number } | {
    type: 'node-mongosh';
    nodeBlock: CodeBlock;
    nodeIndex: number;
    mongoshBlock: CodeBlock;
    mongoshIndex: number;
  };

  const displaySlots = useMemo((): DisplaySlot[] => {
    const blocks = currentStep?.codeBlocks ?? [];
    const mongoshIndices = new Set(nodeMongoshPairs.values());
    const nodeIndices = new Set(nodeMongoshPairs.keys());
    return sortedCodeBlocksWithIndex
      .filter(({ originalIndex }) => !mongoshIndices.has(originalIndex))
      .map(({ block, originalIndex }) => {
        const mongoshIdx = nodeMongoshPairs.get(originalIndex);
        if (mongoshIdx != null) {
          const mongoshBlock = blocks[mongoshIdx];
          return { type: 'node-mongosh' as const, nodeBlock: block, nodeIndex: originalIndex, mongoshBlock, mongoshIndex: mongoshIdx };
        }
        return { type: 'single' as const, block, originalIndex };
      });
  }, [currentStep?.codeBlocks, sortedCodeBlocksWithIndex, nodeMongoshPairs]);

  const [nodeMongoshViewByKey, setNodeMongoshViewByKey] = useState<Record<string, 'node' | 'mongosh'>>({});

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
          next[blockKey] =
            block.skeleton && block.inlineHints?.length
              ? fillAllBlanksInSkeleton(block.skeleton, block.inlineHints)
              : (block.code ?? '');
        } else if (hasAnySkeleton(block) && block.inlineHints?.length) {
          // Use current editor content as base when present so manual input in non-revealed blanks is preserved
          const base = (saved != null && saved !== '' && !hasOldHardcodedUri(saved)) ? saved : baseSkeleton;
          next[blockKey] = applyRevealedAnswersToCode(base, block.inlineHints, revealed);
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
          next[blockKey] =
            block.skeleton && block.inlineHints?.length
              ? fillAllBlanksInSkeleton(block.skeleton, block.inlineHints)
              : (block.code ?? '');
        } else if (revealed.length > 0 && block.inlineHints?.length) {
          const baseCode = (prev[blockKey] != null && prev[blockKey] !== '') ? prev[blockKey] : getDisplayCode(block, tier, false);
          next[blockKey] = applyRevealedAnswersToCode(baseCode, block.inlineHints, revealed);
        }
      });
      return next;
    });
  }, [currentStep?.codeBlocks, currentStepIndex, showSolution, revealedAnswers, alwaysShowSolutions, skeletonTier, applyRevealedAnswersToCode]);

  // When lab or user changes (not initial mount), load that lab's editors so switching labs or return visit restores state
  const prevLabUserRef = useRef({ labNumber, userEmail });
  useEffect(() => {
    if (prevLabUserRef.current.labNumber !== labNumber || prevLabUserRef.current.userEmail !== userEmail) {
      prevLabUserRef.current = { labNumber, userEmail };
      const w = loadLabWorkspace(labNumber, userEmail);
      setEditableCodeByBlock(w.editors || {});
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
    setLogEntries(storedToLogEntries(entries));
    const last = entries[entries.length - 1];
    if (last && last.output) {
      setLastOutput(last.output);
      setOutputSummary(last.output.trim().split('\n')[0].slice(0, 80) || 'Step output');
      setOutputSuccess(true); // success not stored per entry; neutral when switching
    } else {
      setLastOutput('');
      setOutputSummary('');
      setOutputSuccess(true);
    }
  }, [labNumber, currentStepIndex, userEmail]);

  // Persist all editor content for this lab to central storage (autosave for all editors)
  useEffect(() => {
    saveLabWorkspace(labNumber, { editors: editableCodeByBlock }, userEmail);
  }, [labNumber, editableCodeByBlock, userEmail]);

  // Persist console logs for current step to central storage
  useEffect(() => {
    const w = loadLabWorkspace(labNumber, userEmail);
    const updated = { ...w.logEntriesByStep, [currentStepIndex]: logEntriesToStored(logEntries) };
    saveLabWorkspace(labNumber, { logEntriesByStep: updated }, userEmail);
  }, [labNumber, currentStepIndex, logEntries, userEmail]);

  // Competitor side-by-side: only in demo mode for moderator when step has competitor equivalents
  const stepCompetitorIds = useMemo(() => {
    const ids = new Set<string>();
    currentStep.codeBlocks?.forEach((block) => {
      Object.keys(block.competitorEquivalents || {}).forEach((id) => ids.add(id));
    });
    return Array.from(ids);
  }, [currentStep.codeBlocks]);
  const showCompetitorPanel =
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


  // Helper to reveal full solution
  const revealSolution = useCallback((blockKey: string, tier: SkeletonTier) => {
    setShowSolution(prev => ({ ...prev, [blockKey]: true }));
    const penalty = getSolutionPenalty(tier);
    setPointsDeducted(prev => ({
      ...prev,
      [blockKey]: (prev[blockKey] || 0) + penalty
    }));
    subtractPoints(penalty);
  }, [subtractPoints]);

  // Copy button should always copy full solution (even if skeleton shown)
  const handleCopyCode = useCallback(async (blockIdx: number = 0) => {
    const block = currentStep.codeBlocks?.[blockIdx];
    const blockKey = `${currentStepIndex}-${blockIdx}`;
    const hasSkeleton = block ? hasAnySkeleton(block) : false;
    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
    const tier = skeletonTier[blockKey] || 'guided';
    
    // Copy what's displayed: filled skeleton when solution revealed (skeleton + inlineHints), else tier skeleton
    const code = getDisplayCode(block!, tier, isSolutionRevealed) || block?.code || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentStep.codeBlocks, currentStepIndex, alwaysShowSolutions, showSolution, skeletonTier]);

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
        const suffix = userSuffix || (typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_user_suffix') || '') : '') || 'default';
        const storedAlias = typeof localStorage !== 'undefined' ? localStorage.getItem('lab_kms_alias') || undefined : undefined;
        const ctx = {
          mongoUri: labMongoUri || (typeof localStorage !== 'undefined' ? localStorage.getItem('lab_mongo_uri') || undefined : undefined),
          alias: storedAlias || (suffix ? `alias/mongodb-lab-key-${suffix}` : undefined),
          profile: typeof localStorage !== 'undefined' ? localStorage.getItem('lab_aws_profile') || undefined : undefined,
          keyAltName: `user-${suffix}-ssn-key`,
          expectedCount: 1,
        };
        const result = await verificationService.verify(currentStep.verificationId as VerificationId, ctx);
        success = result.success;
        summary = result.message;
        output = result.message;
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

    setLastOutput(output);
    setLastOutputTime(now);
    setLogEntries(prev => [...prev, { time: now, output }]);
    setOutputSummary(summary);
    setOutputSuccess(success);
    setValidationFailedByStep(prev => ({ ...prev, [currentStepIndex]: !success })); // red when failed, cleared when passed
    setConsolePanelCollapsed(false);
    // Persist validation result to this step's console log so it's kept when advancing and when returning to this step
    const w = loadLabWorkspace(labNumber, userEmail);
    const existing = w.logEntriesByStep[currentStepIndex] || [];
    const newStored = logEntriesToStored([{ time: now, output }]);
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
    const code = (editableCodeByBlock[blockKey] ?? getDisplayCode(block!, tier, isSolutionRevealed)) || (block?.code ?? '');
    const language = (block?.language || 'javascript').toLowerCase();
    setIsRunning(true);
    let result: { output: string; success: boolean; summary: string };

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
          const res = await fetch('/api/run-mongosh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, uri: labMongoUri, ...(mongoshPath && { mongoshPath }) }),
          });
          const data = await res.json();
          const out = [data.stdout, data.stderr].filter(Boolean).join('\n') || data.message || '(no output)';
          result = {
            output: out,
            success: data.success === true,
            summary: data.success ? 'mongosh completed' : (data.message || 'mongosh failed'),
          };
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
              const res = await fetch('/api/run-bash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commands: beforeNode, ...(awsProfile && { profile: awsProfile }) }),
              });
              const data = await res.json();
              outputs.push([data.stdout, data.stderr].filter(Boolean).join('\n') || '(no output)');
            }
            const res = await fetch('/api/run-node', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: editorCode, uri: labMongoUri || '' }),
            });
            const data = await res.json();
            const stderr = (data.stderr || '').trim();
            const stdout = (data.stdout || '').trim();
            let out = [stderr, stdout].filter(Boolean).join('\n') || data.message || '(no output)';
            if (data.success !== true && data.exitCode != null && data.exitCode !== 0 && !out.includes('exit code')) {
              out += `\nExit code: ${data.exitCode}`;
            }
            outputs.push(out);
            lastSuccess = data.success === true;
            result = {
              output: outputs.join('\n\n'),
              success: lastSuccess,
              summary: lastSuccess ? 'Node completed' : (data.message?.split('\n')[0] || 'Node failed'),
            };
          } else {
            const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
            const res = await fetch('/api/run-bash', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ commands, ...(awsProfile && { profile: awsProfile }) }),
            });
            const data = await res.json();
            const out = [data.stdout, data.stderr].filter(Boolean).join('\n') || '(no output)';
            result = {
              output: out,
              success: data.success === true,
              summary: data.exitCode === 0 ? 'Command completed' : 'Command failed',
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
        const mongoshPath = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_mongosh_path') : null;
        const res = await fetch('/api/run-mongosh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, uri: labMongoUri, ...(mongoshPath && { mongoshPath }) }),
        });
        const data = await res.json();
        const out = [data.stdout, data.stderr].filter(Boolean).join('\n') || data.message || '(no output)';
        result = {
          output: out,
          success: data.success === true,
          summary: data.success ? 'mongosh completed' : (data.message || 'mongosh failed'),
        };
      }
      // 4) Node-like JavaScript → run-node (optional URI for MONGODB_URI env)
      else if ((language === 'javascript' || language === 'typescript') && code.trim().length > 0) {
        const res = await fetch('/api/run-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, uri: labMongoUri || '' }),
        });
        const data = await res.json();
        const stderr = (data.stderr || '').trim();
        const stdout = (data.stdout || '').trim();
        let out = [stderr, stdout].filter(Boolean).join('\n') || data.message || '(no output)';
        if (data.success !== true && data.exitCode != null && data.exitCode !== 0 && !out.includes('exit code')) {
          out += `\nExit code: ${data.exitCode}`;
        }
        result = {
          output: out,
          success: data.success === true,
          summary: data.success ? 'Node completed' : (data.message?.split('\n')[0] || 'Node failed'),
        };
      }
      // 5) Fallback: simulated output (e.g. no URI, or JSON index definitions)
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
    setLogEntries(prev => [...prev, { time: now, output: result.output }]);
    setOutputSummary(result.summary);
    setOutputSuccess(result.success);
    setConsolePanelCollapsed(false);
    setIsRunning(false);
  }, [currentStep?.codeBlocks, currentStep?.title, currentStepIndex, labMongoUri, editableCodeByBlock, skeletonTier, showSolution, alwaysShowSolutions]);

  /** Run all code blocks in order: for composite (node+mongosh) slots runs only the active tab; for single slots runs that block. Skips terminal-only blocks. */
  const handleRunAll = useCallback(async () => {
    const blocks = currentStep?.codeBlocks ?? [];
    if (blocks.length === 0) return;
    // Build list of block indices to run from display slots (one per slot; for node-mongosh use active view)
    const indicesToRun: number[] = [];
    for (const slot of displaySlots) {
      if (slot.type === 'node-mongosh') {
        const slotKey = `${currentStepIndex}-${slot.nodeIndex}`;
        const view = nodeMongoshViewByKey[slotKey] ?? 'mongosh';
        indicesToRun.push(view === 'mongosh' ? slot.mongoshIndex : slot.nodeIndex);
      } else {
        indicesToRun.push(slot.originalIndex);
      }
    }
    setIsRunning(true);
    const outputs: string[] = [];
    let lastSuccess = true;
    let lastSummary = '';
    for (const i of indicesToRun) {
      const block = blocks[i];
      const blockKey = `${currentStepIndex}-${i}`;
      const tier = skeletonTier[blockKey] || 'guided';
      const isSolutionRevealed = alwaysShowSolutions || !!showSolution[blockKey] || !hasAnySkeleton(block);
      const code = (editableCodeByBlock[blockKey] ?? getDisplayCode(block, tier, isSolutionRevealed)) || block.code || '';
      const language = (block.language || 'javascript').toLowerCase();
      try {
        if (language === 'mongosh' && code.trim().length > 0) {
          if (labMongoUri?.trim()) {
            const mongoshPath = typeof localStorage !== 'undefined' ? localStorage.getItem('workshop_mongosh_path') : null;
            const res = await fetch('/api/run-mongosh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, uri: labMongoUri, ...(mongoshPath && { mongoshPath }) }) });
            const data = await res.json();
            const out = [data.stdout, data.stderr].filter(Boolean).join('\n') || data.message || '(no output)';
            outputs.push(out);
            lastSuccess = data.success === true;
            lastSummary = data.success ? 'mongosh completed' : (data.message || 'mongosh failed');
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
                const res = await fetch('/api/run-bash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands: beforeNode, ...(awsProfile && { profile: awsProfile }) }) });
                const data = await res.json();
                outputs.push([data.stdout, data.stderr].filter(Boolean).join('\n') || '(no output)');
              }
              const res = await fetch('/api/run-node', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: editorCode, uri: labMongoUri || '' }) });
              const data = await res.json();
              const out = [(data.stderr || '').trim(), (data.stdout || '').trim()].filter(Boolean).join('\n') || data.message || '(no output)';
              outputs.push(out);
              lastSuccess = data.success === true;
              lastSummary = data.success ? 'Node completed' : (data.message?.split('\n')[0] || 'Node failed');
            } else {
              const awsProfile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') || '') : '';
              const res = await fetch('/api/run-bash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands, ...(awsProfile && { profile: awsProfile }) }) });
              const data = await res.json();
              outputs.push([data.stdout, data.stderr].filter(Boolean).join('\n') || '(no output)');
            }
          }
        } else if ((language === 'javascript' || language === 'typescript') && code.trim().length > 0) {
          const res = await fetch('/api/run-node', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, uri: labMongoUri || '' }) });
          const data = await res.json();
          const out = [(data.stderr || '').trim(), (data.stdout || '').trim()].filter(Boolean).join('\n') || data.message || '(no output)';
          outputs.push(out);
          lastSuccess = data.success === true;
          lastSummary = data.success ? 'Node completed' : (data.message?.split('\n')[0] || 'Node failed');
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
    const now = new Date();
    setLastOutput(combined);
    setLastOutputTime(now);
    setLogEntries(prev => [...prev, { time: now, output: combined }]);
    setOutputSummary(lastSummary);
    setOutputSuccess(lastSuccess);
    setConsolePanelCollapsed(false);
    setIsRunning(false);
  }, [currentStep?.codeBlocks, currentStep?.title, currentStepIndex, labMongoUri, editableCodeByBlock, skeletonTier, showSolution, alwaysShowSolutions, displaySlots, nodeMongoshViewByKey]);

  /** Reset current step: clear console, reset inline editors to original skeleton (as on first load), clear persisted logs and solution state */
  const handleResetStep = useCallback(() => {
    // Uncomplete the step in parent first so the step indicator updates immediately
    onResetStep?.(currentStepIndex);
    setLastOutput('');
    setLastOutputTime(null);
    setLogEntries([]);
    setOutputSummary('');
    setOutputSuccess(true);
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
  }, [labNumber, currentStepIndex, userEmail, currentStep?.codeBlocks, skeletonTier, onResetStep]);

  useEffect(() => {
    if (!stepToolbarRef) return;
    stepToolbarRef.current = {
      reset: handleResetStep,
      openHelp: () => setHelpOpen(true),
    };
    return () => { stepToolbarRef.current = null; };
  }, [stepToolbarRef, handleResetStep]);

  /** Next Step: ONLY runs validation (handleCheckProgress). Does NOT execute any code; user must use Run/Run all to run code. */
  const handleNextStep = async () => {
    if (currentStepIndex < steps.length - 1 && currentStep.codeBlocks?.length) {
      const passed = await handleCheckProgress();
      if (!passed) return; // Stay on step until validation passes
      // Brief delay so the user sees the validation output in the console for this step before advancing
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!isCompleted) {
      onComplete(currentStepIndex);
    }
    if (currentStepIndex < steps.length - 1) {
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

        {/* Layout: Left = Editor + Console (vertical split, resizable); Right = Preview */}
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
                        const firstBlock = firstSlot.type === 'node-mongosh' ? firstSlot.nodeBlock : firstSlot.block;
                        const firstIdx = firstSlot.type === 'node-mongosh' ? firstSlot.nodeIndex : firstSlot.originalIndex;
                        const firstKey = `${currentStepIndex}-${firstIdx}`;
                        const firstDisplayFilename = (() => {
                          const base = firstBlock.filename.includes(' (') ? firstBlock.filename.split(' (')[0].trim() : firstBlock.filename;
                          return base.replace(/^\d+\.\s*/, '').trim() || base;
                        })();
                        const firstIsNodeMongosh = firstSlot.type === 'node-mongosh';
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
                                    <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [firstKey]: 'mongosh' }))} className={cn("truncate", (nodeMongoshViewByKey[firstKey] ?? 'mongosh') === 'mongosh' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Mongosh script">mongosh</button>
                                    <span className="text-muted-foreground flex-shrink-0">!</span>
                                    <button type="button" onClick={() => setNodeMongoshViewByKey((prev) => ({ ...prev, [firstKey]: 'node' }))} className={cn("truncate", (nodeMongoshViewByKey[firstKey] ?? 'mongosh') === 'node' ? 'underline font-semibold' : 'opacity-80 hover:opacity-100')} title="Show Node script">node</button>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FileCode className="w-3 h-3 flex-shrink-0 text-green-500" />
                                  <span className="font-mono text-[8px] text-white truncate" title={firstBlock.filename}>{firstDisplayFilename}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {(firstIsShell || firstIsNodeMongosh || firstIsDriverOnly) && (
                                <>
                                  {firstIsShell && <span className="text-[7px] text-muted-foreground/70 mr-0.5">—</span>}
                                  <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run all">
                                      {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                    </Button>
                                  </TooltipTrigger><TooltipContent side="bottom">Run all</TooltipContent></Tooltip></TooltipProvider>
                                  <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => {
                                      const runIdx = firstIsNodeMongosh && firstSlot.type === 'node-mongosh' ? ((nodeMongoshViewByKey[firstKey] ?? 'mongosh') === 'mongosh' ? firstSlot.mongoshIndex : firstSlot.nodeIndex) : firstIdx;
                                      handleRunBlock(runIdx);
                                    }} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run selection">
                                      <Play className="w-2 h-2" />
                                    </Button>
                                  </TooltipTrigger><TooltipContent side="bottom">Run selection</TooltipContent></Tooltip></TooltipProvider>
                                </>
                              )}
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step">
                                  <RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span>
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {firstHasSkeleton && !firstSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution(firstKey, firstTier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                      const view = nodeMongoshViewByKey[slotKey] ?? 'mongosh';
                      const activeBlock = view === 'mongosh' ? mongoshBlock : nodeBlock;
                      const activeIndex = view === 'mongosh' ? mongoshIndex : nodeIndex;
                      const activeKey = `${currentStepIndex}-${activeIndex}`;
                      const nodeKey = `${currentStepIndex}-${nodeIndex}`;
                      const mongoshKey = `${currentStepIndex}-${mongoshIndex}`;
                      const hasSkeleton = hasAnySkeleton(activeBlock);
                      const tier = skeletonTier[activeKey] || 'guided';
                      const isSolutionRevealed = alwaysShowSolutions || showSolution[activeKey] || !hasSkeleton;
                      const displayCode = getDisplayCode(activeBlock, tier, isSolutionRevealed);
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
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run all">
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Run all</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleRunBlock(activeIndex)} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run selection">
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <Play className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Run selection</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => stepToolbarRef?.current?.reset()} className="h-3.5 gap-0.5 px-1 text-[8px]" title="Reset step"><RotateCcw className="w-2 h-2" /><span className="hidden sm:inline">Reset</span></Button>
                              </TooltipTrigger><TooltipContent side="bottom">Reset step</TooltipContent></Tooltip></TooltipProvider>
                              {hasSkeleton && !isSolutionRevealed && (
                                <Button variant="ghost" size="sm" onClick={() => revealSolution(activeKey, tier)} className="gap-0.5 h-3.5 text-[8px] px-1 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                    const displayCode = getDisplayCode(block, tier, isSolutionRevealed);
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
                              <span className="font-mono text-[8px] text-white truncate" title={block.filename}>{displayFilename}</span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run all">
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Run all</TooltipContent></Tooltip></TooltipProvider>
                              <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleRunBlock(originalIndex)} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run selection">
                                  {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <Play className="w-2 h-2" />}
                                </Button>
                              </TooltipTrigger><TooltipContent side="bottom">Run selection</TooltipContent></Tooltip></TooltipProvider>
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
                                <span className="font-mono text-[8px] text-white truncate" title={block.filename}>{displayFilename}</span>
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
                                      <Button variant="ghost" size="icon" onClick={handleRunAll} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run all">
                                        {isRunning ? <Loader2 className="w-2 h-2 animate-spin" /> : <PlayCircle className="w-2 h-2" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Run all</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => handleRunBlock(originalIndex)} disabled={isRunning || !currentStep.codeBlocks?.length} className="h-3.5 w-3.5 text-primary" title="Run selection">
                                        <Play className="w-2 h-2" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Run selection</TooltipContent>
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
                              theme={LAB_EDITOR_THEME}
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

                  {/* Divider splitter between Editor and Console — same visual weight as vertical splitter (thin draggable bar) */}
                  <ResizableHandle
                    withHandle
                    className="bg-border hover:bg-primary/50 transition-colors data-[panel-group-direction=vertical]:cursor-ns-resize shrink-0"
                  />

              {/* Console panel: run output; collapsible, default collapsed; vertically resizable with editor above */}
              <ResizablePanel defaultSize={6} minSize={15} collapsible collapsedSize={6} className="min-h-0">
                <div className="h-full min-h-0 flex flex-col bg-background/95">
                  <button
                    type="button"
                    onClick={() => setConsolePanelCollapsed((c) => !c)}
                    className="flex-shrink-0 flex items-center gap-2 px-2 py-1 border border-border border-b bg-muted/40 hover:bg-muted transition-colors text-left w-full"
                    title={consolePanelCollapsed ? 'Expand console' : 'Collapse console'}
                  >
                    {consolePanelCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <Terminal className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[8px] font-medium text-white">Console</span>
                    {outputSummary && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                        outputSuccess ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {outputSuccess ? '✓' : '✗'} {outputSummary}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-h-0 overflow-auto px-2 py-1.5 bg-[hsl(220,20%,6%)] font-mono text-xs text-white">
                    {logEntries.length > 0 ? (
                      <div className="space-y-0.5">
                        {logEntries.flatMap((entry, entryIndex) => {
                          const timeStr = entry.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
                          const lines = entry.output.split(/\r?\n/);
                          return lines.map((line, lineIndex) => {
                            const key = `${entryIndex}-${lineIndex}`;
                            const isExpanded = expandedLogIndex === key;
                            return (
                              <div key={key} className="rounded">
                                <button
                                  type="button"
                                  onClick={() => setExpandedLogIndex(isExpanded ? null : key)}
                                  className="w-full text-left px-1.5 py-0.5 hover:bg-white/5 rounded text-xs text-white leading-snug font-mono"
                                >
                                  <span className="text-muted-foreground">{timeStr}</span>
                                  <span className="mx-1 text-muted-foreground">[lab]</span>
                                  <span className="break-all">{line || ' '}</span>
                                </button>
                                {isExpanded && (
                                  <div className="px-2 py-1.5 mt-0.5 mb-1 rounded bg-black/30 text-[11px] text-white/90 whitespace-pre-wrap break-all border border-white/10">
                                    <div className="text-muted-foreground text-[10px] mb-0.5">Detail</div>
                                    {line}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap leading-snug text-white/80 text-xs">
                        {lastOutput || ''}
                      </pre>
                    )}
                    {!outputSuccess && lastOutput && (
                      <>
                        {lastOutput.includes('MODULE_NOT_FOUND') && (
                          <p className="mt-1.5 text-[10px] text-amber-400/90">
                            {(lastOutput.includes('mongocrypt.node') || lastOutput.includes('mongodb-client-encryption')) ? (
                              <>Tip: <code className="bg-white/10 px-0.5 rounded">mongodb-client-encryption</code> needs its native addon built. In Docker: rebuild the app image (Dockerfile has build deps), then <code className="bg-white/10 px-0.5 rounded">docker compose up -d --build app</code>. The container runs <code className="bg-white/10 px-0.5 rounded">npm rebuild mongodb-client-encryption</code> on startup to compile it.</>
                            ) : (
                              <>Tip: The run environment uses this app’s node_modules. If you see this in Docker, ensure the image has run <code className="bg-white/10 px-0.5 rounded">npm ci</code> so <code className="bg-white/10 px-0.5 rounded">mongodb</code> and <code className="bg-white/10 px-0.5 rounded">mongodb-client-encryption</code> are present.</>
                            )}
                          </p>
                        )}
                        {(lastOutput.includes('Whitelist') || lastOutput.includes('Connection Failed')) && (
                          <p className="mt-1.5 text-[10px] text-amber-400/90">
                            Tip: Using <strong>Atlas</strong>? Add your IP in Atlas → Network Access (or 0.0.0.0/0 for testing). Using <strong>Local Docker</strong>? In Workshop Settings choose “Local Docker”, then run <code className="bg-white/10 px-0.5 rounded">docker compose up -d mongo app</code> so MongoDB is running and the app uses the correct URI.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />

              {/* Preview panel: right column — starts narrow so editor/console get most space */}
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
                                    theme={LAB_EDITOR_THEME}
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
                    ) : previewPanelTab === 'preview' && currentStep.preview ? (
                      <div key={previewRefreshKey} className="h-full min-h-0">
                        <GenericLabPreview
                          preview={currentStep.preview}
                          data={{ rawOutput: lastOutput } as LabPreviewData}
                          isRunning={isRunning}
                          hasRun={!!lastOutput}
                        />
                      </div>
                    ) : previewPanelTab === 'preview' ? (
                      <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center rounded border border-dashed border-border p-4 text-muted-foreground">
                        <Layout className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-medium mb-0.5">Preview: frontend demo</p>
                        <p className="text-[10px]">When configured, this tab shows a visual frontend that demonstrates how this capability can be used (e.g. search, table, chart, encryption demo). Run the step code to see results here.</p>
                      </div>
                    ) : null}
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
                        ? validationFailedByStep[index]
                          ? 'bg-destructive text-destructive-foreground ring-2 ring-destructive/50'
                          : 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : completedSteps.includes(index)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            size="sm"
            onClick={handleNextStep}
            className="gap-1"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Lab
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
