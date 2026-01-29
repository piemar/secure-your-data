import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, Terminal, Copy, Check, Loader2, Info, BookOpen, Clock, Lock, Eye, Unlock } from 'lucide-react';
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
}: StepViewProps) {
  const [activeTab, setActiveTab] = useState<string>('code');
  const [outputOpen, setOutputOpen] = useState(false);
  const [lastOutput, setLastOutput] = useState<string>('');
  const [outputSummary, setOutputSummary] = useState<string>('');
  const [outputSuccess, setOutputSuccess] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState(false);
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
  const [lineHeight, setLineHeight] = useState(19); // Monaco default line height

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

  const handleCheckProgress = async () => {
    setIsRunning(true);
    const code = currentStep.codeBlocks?.[0]?.code || '';
    
    // Simulate execution delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    
    const result = generateSimulatedOutput(code, currentStep.title);
    setLastOutput(result.output);
    setOutputSummary(result.summary);
    setOutputSuccess(result.success);
    setOutputOpen(true);
    setIsRunning(false);
  };

  const handleNextStep = () => {
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
      {/* Header - Sticky - Mobile Optimized */}
      <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground border border-border px-1.5 sm:px-2 py-0.5 rounded">
                Lab {String(labNumber).padStart(2, '0')}
              </span>
              {currentStep.difficulty && (
                <DifficultyBadge level={currentStep.difficulty} />
              )}
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-1.5 sm:px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden xs:inline">Completed</span>
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold truncate">{labTitle}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">{labDescription}</p>
          </div>
          {atlasCapability && (
            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-xs text-muted-foreground">Atlas Capability</span>
              <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded mt-0.5 inline-block sm:block">
                {atlasCapability}
              </div>
            </div>
          )}
        </div>

        {/* Business Value Banner - Mobile Optimized */}
        {businessValue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 sm:mt-3 flex items-start sm:items-center gap-2 text-xs sm:text-sm bg-primary/10 text-primary px-2 sm:px-3 py-1.5 sm:py-2 rounded-md"
          >
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="line-clamp-2 sm:line-clamp-none">
              <strong>Business Value:</strong> {businessValue}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Step Header with Actions - Mobile Optimized */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 border-b border-border bg-muted/30">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStepIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <h2 className="font-semibold truncate text-sm sm:text-base">{currentStep.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">{currentStep.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Step {currentStepIndex + 1}/{steps.length}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                size="sm"
                onClick={handleCheckProgress}
                disabled={isRunning || !currentStep.codeBlocks?.length}
                className="gap-1 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                {isRunning ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden xs:inline">{isRunning ? 'Checking...' : 'Check My Progress'}</span>
                <span className="xs:hidden">{isRunning ? '...' : 'Check'}</span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1 sm:p-1.5 rounded-md bg-amber-500/10 text-amber-600 cursor-help">
                      <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-sm">
                      <strong>Local execution required:</strong> Real environment validation only works when running <code className="bg-muted px-1 rounded">npm run dev</code> locally on your machine with AWS CLI and mongosh installed.
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
              />
            </div>
          </div>
        </div>

        {/* Read-Only Mode Toggle - Mobile Optimized */}
        {hasSkeletons && (
          <div className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-border bg-muted/20">
            <Switch 
              id="read-only-mode"
              checked={alwaysShowSolutions} 
              onCheckedChange={setAlwaysShowSolutions}
            />
            <Label htmlFor="read-only-mode" className="text-xs sm:text-sm text-muted-foreground cursor-pointer">
              <Unlock className="w-3 h-3 inline mr-1" />
              <span className="hidden sm:inline">Read-only mode (show all solutions)</span>
              <span className="sm:hidden">Show solutions</span>
            </Label>
          </div>
        )}

        {/* Code Editor & Output - Resizable Split */}
        <div className="flex-1 overflow-hidden min-h-0">
          {currentStep.codeBlocks && currentStep.codeBlocks.length > 0 ? (
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Code Editor Panel */}
              <ResizablePanel defaultSize={outputOpen ? 50 : 85} minSize={30}>
                <div className="h-full flex flex-col overflow-auto">
                  {currentStep.codeBlocks.map((block, idx) => {
                    const blockKey = `${currentStepIndex}-${idx}`;
                    const hasSkeleton = hasAnySkeleton(block);
                    const tier = skeletonTier[blockKey] || 'guided';
                    const isSolutionRevealed = alwaysShowSolutions || showSolution[blockKey] || !hasSkeleton;
                    const displayCode = getDisplayCode(block, tier, isSolutionRevealed);
                    const maxPoints = getMaxPoints(tier);
                    const solutionPenalty = getSolutionPenalty(tier);
                    
                    return (
                      <div key={idx} className="flex flex-col min-h-[200px] sm:min-h-[250px]">
                        {/* Editor Header - Mobile Optimized */}
                        <div className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 border-b border-border flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate max-w-[100px] sm:max-w-none">{block.filename}</span>
                            {currentStep.estimatedTime && (
                              <span className="hidden sm:inline text-xs text-muted-foreground">
                                ⏱️ {currentStep.estimatedTime}
                              </span>
                            )}
                            {hasSkeleton && !isSolutionRevealed && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs bg-amber-500/10 text-amber-600 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">
                                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden xs:inline">
                                  {tier === 'expert' ? 'Expert' : tier === 'challenge' ? 'Challenge' : 'Guided'}
                                </span>
                                <span className="text-amber-500/70">({maxPoints}pts)</span>
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(idx)}
                            className="gap-1 h-6 text-[10px] sm:text-xs px-1.5 sm:px-2 flex-shrink-0"
                          >
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy'}</span>
                          </Button>
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
                        />

                        {/* Simplified Challenge Mode Footer - Mobile Optimized */}
                        {hasSkeleton && !isSolutionRevealed && (
                          <div className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-muted/50 border-t border-border">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              {/* Left: Difficulty selector & Score */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {/* Compact difficulty selector */}
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
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                  <span className="text-muted-foreground">Score:</span>
                                  <span className={cn(
                                    "font-mono font-medium",
                                    (pointsDeducted[blockKey] || 0) > 0 ? "text-amber-600" : "text-foreground"
                                  )}>
                                    {Math.max(0, maxPoints - (pointsDeducted[blockKey] || 0))}
                                  </span>
                                  <span className="text-muted-foreground">/ {maxPoints}</span>
                                </div>
                                
                                {/* Hints used indicator (for inline hints) - Hidden on mobile */}
                                {tier === 'guided' && block.inlineHints && (
                                  <span className="hidden sm:inline text-xs text-muted-foreground">
                                    {block.inlineHints.length > 0 && (
                                      <>Click <span className="bg-muted px-1 rounded">?</span> markers for hints</>
                                    )}
                                  </span>
                                )}
                              </div>
                              
                              {/* Right: Show full solution button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revealSolution(blockKey, tier)}
                                className="gap-1 h-6 sm:h-7 text-[10px] sm:text-xs text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="hidden xs:inline">Show Full Solution</span>
                                <span className="xs:hidden">Solution</span>
                                <span>(-{solutionPenalty}pts)</span>
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Solution Revealed Banner */}
                        {hasSkeleton && isSolutionRevealed && !alwaysShowSolutions && showSolution[blockKey] && (
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
                      {lastOutput || '// Run "Check My Progress" to see output'}
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
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
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
