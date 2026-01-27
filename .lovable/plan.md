
# Enhanced Challenge Mode: Step-by-Step Skeleton Learning

## Problem Analysis

The current Challenge Mode has three core issues:

1. **Vague Skeletons**: Current skeletons are just 1-2 line comments like "Use aws kms create-key". They don't guide users through the actual command structure.

2. **Disconnected Hints**: Hints are step-level, not skeleton-blank-level. Revealing "Hint 1" gives a generic tip that doesn't map to a specific blank.

3. **Invisible Point Tracking**: The `pointsDeducted` state exists but is never shown to users.

---

## Solution Overview

Transform skeletons from vague comments into **guided templates** with clearly marked blanks. Each blank maps to a specific hint, creating a progressive reveal flow.

### Visual Design

```text
┌─────────────────────────────────────────────────────────────────┐
│ Terminal - AWS CLI                             ⏱️ 10 min │ Copy │
├─────────────────────────────────────────────────────────────────┤
│ # Step 1: Create the Customer Master Key                       │
│ # The CMK is your root of trust - it never leaves AWS KMS      │
│                                                                 │
│ KMS_KEY_ID=$(aws kms _________ \                                │
│     --description "Lab 1 MongoDB Encryption Key" \             │
│     --query 'KeyMetadata._______' \                            │
│     --output text)                                              │
│                                                                 │
│ # Step 2: Create a human-readable alias                        │
│ aws kms _____________ \                                         │
│     --alias-name "alias/mongodb-lab-key-xyz" \                 │
│     --target-key-id $KMS_KEY_ID                                │
│                                                                 │
│ echo "CMK Created: $KMS_KEY_ID"                                 │
├─────────────────────────────────────────────────────────────────┤
│ 🔒 Challenge Mode                                      -2pts   │
│                                                                 │
│ [Hint 1: create-key (-1pt)] [Hint 2: query syntax (-2pt)]      │
│ [Hint 3: alias command (-2pt)] [Show Full Solution (-5pts)]     │
│                                                                 │
│ 💡 Hint 1: The AWS KMS command to create a new symmetric       │
│    key is "create-key". Use --description to label it.         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Enhanced Skeleton Definitions

**Files**: `Lab1CSFLE.tsx`, `Lab2QueryableEncryption.tsx`, `Lab3RightToErasure.tsx`

Transform each skeleton from vague comments into structured templates with:
1. **Context comments** explaining what each section does
2. **Visible blanks** using `_________` syntax
3. **Partial code** showing the structure users need to complete
4. **Inline hints** as comments for complex sections

**Example for Lab 1 Step 1 (Create CMK):**

Current:
```javascript
skeleton: `# Use 'aws kms create-key' to create a new Symmetric key
# Use 'aws kms create-alias' to assign it a friendly name`
```

Enhanced:
```javascript
skeleton: `# STEP 1: Create a Customer Master Key (CMK) in AWS KMS
# The CMK is your root of trust - it wraps all your Data Encryption Keys
#
# TASK: Fill in the AWS KMS command to create a symmetric key
# Hint: The command captures the KeyId in a variable for later use

KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# STEP 2: Create a human-readable alias for easier key reference
# TASK: Fill in the AWS KMS command to create an alias
# Hint: Aliases start with "alias/" and link to a key via --target-key-id

aws kms _____________ \\
    --alias-name "${aliasName}" \\
    --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`
```

### Phase 2: Per-Blank Hints Structure

**Files**: `Lab1CSFLE.tsx`, `Lab2QueryableEncryption.tsx`, `Lab3RightToErasure.tsx`

Change the `hints` array to be more specific and map to skeleton blanks:

Current:
```javascript
hints: [
  'The aws kms create-key command creates a symmetric key by default',
  'Store the KeyId using --query "KeyMetadata.KeyId" --output text',
  'Use aws kms create-alias to link the alias to your key'
]
```

Enhanced:
```javascript
hints: [
  { 
    blank: 1, 
    label: "Command name",
    text: 'The AWS KMS command to create a new key is "create-key". It creates a symmetric key by default.'
  },
  { 
    blank: 2, 
    label: "Query path",
    text: 'To extract just the KeyId, use --query \'KeyMetadata.KeyId\'. This uses JMESPath syntax.'
  },
  { 
    blank: 3, 
    label: "Alias command",
    text: 'The command to create an alias is "create-alias". It links a friendly name to your key.'
  }
]
```

Note: This requires updating the StepData interface in StepView.tsx to support the new hint structure, but we can maintain backward compatibility by supporting both formats.

### Phase 3: Point Tracker UI

**File**: `StepView.tsx`

Add a visual point tracker in the Challenge Mode controls area:

```tsx
{/* Point Tracker */}
{pointsDeducted[blockKey] > 0 && (
  <div className="flex items-center gap-1 text-xs text-amber-600">
    <TrendingDown className="w-3 h-3" />
    <span>-{pointsDeducted[blockKey]}pts this step</span>
  </div>
)}
```

Also add a per-step summary in the footer showing total points spent vs potential:
- Base points per step: 10
- Points after deductions: 10 - deducted

### Phase 4: Skeleton Definitions for All Labs

**Lab 1 Steps to Enhance:**
1. Create CMK - add structured AWS CLI skeleton with blanks
2. Apply Key Policy - add policy JSON structure with blanks
3. Initialize Key Vault - add mongosh skeleton with index syntax blanks
4. Generate DEKs - add Node.js skeleton with ClientEncryption blanks
5. Verify DEK - add mongosh query skeleton
6. Test CSFLE - add connection config skeleton

**Lab 2 Steps to Enhance:**
1. Create QE DEKs - add Node.js skeleton with dual DEK creation
2. Create QE Collection - add encryptedFields structure skeleton
3. Insert Test Data - add QE client connection skeleton
4. Query Encrypted Data - add comparison skeleton (QE vs standard)
5. Inspect Metadata - add collection inspection skeleton

**Lab 3 Steps to Enhance:**
1. Explicit Encryption - add migration skeleton with encrypt() calls
2. Multi-Tenant Isolation - add tenant DEK creation skeleton
3. Key Rotation - add rewrapManyDataKey skeleton
4. Crypto-Shredding - add DEK deletion skeleton with verification

---

## Skeleton Design Principles

Each skeleton should follow these rules:

1. **Show the structure, hide the specifics**
   - Include all boilerplate code visible
   - Use `_________` for key commands/values users need to know
   - Never hide more than 30% of the code

2. **Progressive difficulty within a skeleton**
   - First blank: Basic command name
   - Second blank: Important flag or parameter
   - Third blank: Advanced option or syntax

3. **Inline context as comments**
   - Add `# TASK:` comments before each blank section
   - Add `# Hint:` comments for complex syntax

4. **Realistic output**
   - Include `echo` statements so users know what to expect
   - Include expected output format in comments

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/labs/Lab1CSFLE.tsx` | Rewrite all skeleton definitions with guided blanks |
| `src/components/labs/Lab2QueryableEncryption.tsx` | Add skeleton definitions for all steps |
| `src/components/labs/Lab3RightToErasure.tsx` | Add skeleton definitions for all steps |
| `src/components/labs/StepView.tsx` | Add point tracker UI, update hint display logic |

---

## Example: Full Lab 1 Step 1 Skeleton

```javascript
{
  id: 'l1s1',
  title: 'Create Customer Master Key (CMK)',
  estimatedTime: '10 min',
  codeBlocks: [{
    filename: 'Terminal - AWS CLI',
    language: 'bash',
    code: `# 1. Create the CMK
KMS_KEY_ID=$(aws kms create-key --description "Lab 1 MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)

# 2. Create a human-readable alias
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`,

    skeleton: `# ══════════════════════════════════════════════════════════════
# STEP 1: Create a Customer Master Key (CMK)
# ══════════════════════════════════════════════════════════════
# The CMK is your "root of trust" - it wraps all your Data Encryption Keys.
# It NEVER leaves AWS KMS (protected by hardware security modules).
#
# TASK: Complete the AWS KMS command below to create a new symmetric key.

KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# ══════════════════════════════════════════════════════════════
# STEP 2: Create a Human-Readable Alias
# ══════════════════════════════════════════════════════════════
# Aliases make keys easier to reference and enable key rotation without
# changing your application code.
#
# TASK: Complete the AWS KMS command to link an alias to your key.

aws kms _____________ \\
    --alias-name "${aliasName}" \\
    --target-key-id $KMS_KEY_ID

echo "CMK Created: $KMS_KEY_ID"
echo "Alias Created: ${aliasName}"`
  }],
  
  hints: [
    'Blank 1: The AWS KMS command to create a new key is "create-key" (no space). It creates a symmetric key by default.',
    'Blank 2: The JMESPath query to extract just the KeyId is "KeyMetadata.KeyId" - this returns only the UUID.',
    'Blank 3: The command to create an alias is "create-alias" (no space). It links a friendly name to your target key.'
  ]
}
```

---

## User Experience Flow (Improved)

1. User sees **structured skeleton** with clear blanks and context comments
2. User reads the `# TASK:` comments to understand what to fill in
3. User attempts to complete the blanks based on context
4. If stuck, reveals **Hint 1** which explains the first blank specifically
5. Continues revealing hints for each subsequent blank
6. As last resort, reveals **Full Solution**
7. Point tracker shows running deductions for transparency
8. User copies completed code and runs it locally

---

## Summary

This enhancement transforms Challenge Mode from a "hide and seek" experience into a **guided learning journey**:

- **Before**: Vague 2-line skeleton, generic hints, invisible scoring
- **After**: Structured template with blanks, blank-specific hints, visible point tracker

The key insight is that good skeletons should teach the structure while hiding only the specific commands/values the user needs to learn.
