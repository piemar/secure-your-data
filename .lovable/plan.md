

# Workshop UX Enhancement Plan

## Overview

Enhance the existing lab experience for a 90-minute instructor-led workshop targeting Senior MongoDB Solutions Architects. Focus on progressive disclosure, clearer instructions, and an intro tab for each lab.

---

## Problem Analysis

### Current Pain Points

1. **No Lab Context/Introduction**: Labs jump directly into steps without explaining "why" or showing the big picture
2. **All Steps Revealed at Once**: Information overload - attendees see 7-8 steps immediately
3. **Instructions Mixed with Reference**: Not clear what to DO vs what's for CONTEXT
4. **No Difficulty Indicators**: Senior SAs can't easily identify which steps are new to them
5. **PIN Login Issue**: Base64 encoding needs verification

### Time Budget for 90 Minutes

| Section | Time |
|---------|------|
| Lab Setup / Environment Check | 10 min |
| Lab 1: CSFLE Fundamentals | 35 min |
| Lab 2: Queryable Encryption | 30 min |
| Lab 3: Right to Erasure (Optional/Advanced) | 15 min |

---

## Proposed Changes

### 1. Fix Moderator PIN Issue

**File**: `src/contexts/RoleContext.tsx`

The current implementation should work, but we'll add a fallback and debug logging:

```text
// Hardcode a simple check as fallback
const CORRECT_PIN = '163500';

function verifyModeratorPin(pin: string): boolean {
  return pin === CORRECT_PIN;
}
```

Remove the obfuscation for now since it's causing issues. For a workshop setting, simple equality is fine.

---

### 2. Add Lab Introduction Tab

**Files**: Create new components and modify lab structure

Each lab will have a tabbed interface:

```text
┌─────────────────────────────────────────────────────┐
│  [ Overview ]  [ Steps ]                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 Lab 1: CSFLE Fundamentals                      │
│                                                     │
│  What You'll Build:                                │
│  ┌───────────────────────────────────────────────┐ │
│  │  [Architecture Diagram]                       │ │
│  │  App → MongoDB Client → KMS → Atlas           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Key Concepts:                                      │
│  • Envelope Encryption (CMK wraps DEK)             │
│  • Client-side encryption (never on server)        │
│  • Deterministic vs Random algorithms              │
│                                                     │
│  ⏱️ Estimated Time: 35 minutes                     │
│  📊 Difficulty: Intermediate                       │
│                                                     │
│  [ Start Lab → ]                                   │
└─────────────────────────────────────────────────────┘
```

---

### 3. Progressive Step Unlocking

**File**: `src/components/labs/LabStep.tsx`

Add a "locked" state for steps that haven't been unlocked yet:

- Step 1: Always unlocked
- Step 2+: Locked until previous step is completed OR moderator unlocks all

For instructor-led workshops, add a "Show All Steps" toggle in the header.

---

### 4. Clearer Instruction Format

Restructure each step with distinct sections:

```text
┌─────────────────────────────────────────────────────┐
│ Step 3: Generate Data Encryption Keys (DEKs)       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📖 UNDERSTAND                                       │
│ The DEK is what actually encrypts your data.        │
│ The CMK (from Step 1) "wraps" (encrypts) the DEK.  │
│                                                     │
│ ✅ DO THIS                                          │
│ 1. Create a file called `createKey.cjs`            │
│ 2. Copy the template below                          │
│ 3. Fill in the blanks (marked with TODO)           │
│ 4. Run: node createKey.cjs                          │
│                                                     │
│ 📋 TEMPLATE (fill in the blanks)                   │
│ ┌───────────────────────────────────────────────┐  │
│ │ const dekId = await encryption.createDataKey( │  │
│ │   "aws", {                                    │  │
│ │     masterKey: { key: /* TODO */, region: ... │  │
│ │   }                                           │  │
│ │ );                                            │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ 💡 HINTS (click to reveal)                         │
│ [Hint 1] [Hint 2] [Hint 3]                         │
│                                                     │
│ 👀 FULL SOLUTION (-5 pts)                          │
│ [ Reveal Solution ]                                │
│                                                     │
│ [ Check My Progress ]                              │
└─────────────────────────────────────────────────────┘
```

---

### 5. Add Difficulty Badges

Each step gets a difficulty indicator:

- 🟢 **Basic**: Standard MongoDB/AWS operations
- 🟡 **Intermediate**: Encryption-specific concepts  
- 🔴 **Advanced**: Edge cases, optimization, compliance

Senior SAs can skip 🟢 steps if confident.

---

## Implementation Details

### New Components to Create

1. **`LabIntroTab.tsx`**: Overview component with architecture diagram and key concepts
2. **`LabTabs.tsx`**: Wrapper with Overview/Steps tab navigation
3. **`DifficultyBadge.tsx`**: Visual indicator for step complexity
4. **`HintSystem.tsx`**: Progressive hints (3 levels) before full solution

### Files to Modify

1. **`src/contexts/RoleContext.tsx`**: Fix PIN verification
2. **`src/components/labs/LabView.tsx`**: Add tabs, progressive unlocking
3. **`src/components/labs/LabStep.tsx`**: Add UNDERSTAND/DO sections, hints, difficulty
4. **`src/components/labs/Lab1CSFLE.tsx`**: Add intro content, difficulty levels
5. **`src/components/labs/Lab2QueryableEncryption.tsx`**: Add intro content
6. **`src/components/labs/Lab3RightToErasure.tsx`**: Add intro content

---

## Lab Introduction Content

### Lab 1: CSFLE Fundamentals (Overview Tab)

**What You'll Build:**
- Create a Customer Master Key (CMK) in AWS KMS
- Generate Data Encryption Keys (DEKs) stored in MongoDB
- Implement automatic field-level encryption
- Demonstrate the "proof": DBAs only see ciphertext

**Architecture Diagram:**
```text
┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Your App    │────▶│   MongoDB   │     │   AWS KMS   │
│  (Node.js)   │     │   Atlas     │     │   (CMK)     │
│              │     │             │     │             │
│ ┌──────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │libmongoc │◀┼─────┼─│ DEK     │◀┼─────┼─│ CMK     │ │
│ │rypt      │ │     │ │(wrapped)│ │     │ │         │ │
│ └──────────┘ │     │ └─────────┘ │     │ └─────────┘ │
└──────────────┘     └─────────────┘     └─────────────┘
        │                   │
        ▼                   ▼
   Data encrypted      Only ciphertext
   BEFORE leaving      stored in DB
   your app
```

**Key Insight for SAs:**
> "The breakthrough: MongoDB never sees plaintext. Ever. The client library encrypts BEFORE the data leaves your application. This is fundamentally different from TDE."

---

### Lab 2: Queryable Encryption (Overview Tab)

**What's Different from CSFLE:**
- Can query encrypted data without decrypting
- Supports equality AND range queries (8.0+)
- Uses metadata collections (.esc, .ecoc)
- Higher storage overhead (2-3x)

**Query Capability Matrix:**

| Query Type | CSFLE | QE |
|------------|-------|------|
| Equality | ✅ (Deterministic only) | ✅ |
| Range | ❌ | ✅ (8.0+) |
| Prefix | ❌ | ✅ (8.0+) |
| Regex | ❌ | ❌ |

---

### Lab 3: Right to Erasure (Overview Tab)

**GDPR Article 17 Pattern:**
> "When a user requests deletion, instead of finding and deleting all their data across collections, simply delete their DEK. All their data becomes cryptographically unreadable."

**Pattern: 1 DEK per User**
```text
User A Data ──encrypted with──▶ DEK-A ──wrapped by──▶ CMK
User B Data ──encrypted with──▶ DEK-B ──wrapped by──▶ CMK
User C Data ──encrypted with──▶ DEK-C ──wrapped by──▶ CMK

DELETE DEK-A ═══▶ User A's data is now unreadable garbage
```

---

## Step Difficulty Assignments

### Lab 1 Steps

| Step | Title | Difficulty | Skip if... |
|------|-------|------------|------------|
| 1 | Create CMK | 🟢 Basic | You've used AWS KMS before |
| 2 | Apply Key Policy | 🟡 Intermediate | - |
| 3 | Initialize Key Vault | 🟢 Basic | - |
| 4 | Generate DEKs | 🟡 Intermediate | - |
| 5 | Verify DEK Creation | 🟢 Basic | - |
| 6 | Test CSFLE Insert/Query | 🔴 Advanced | - |
| 7 | Complete Application | 🟡 Intermediate | - |

### Lab 2 Steps

| Step | Title | Difficulty |
|------|-------|------------|
| 1 | Create QE DEKs | 🟡 Intermediate |
| 2 | Create QE Collection | 🟡 Intermediate |
| 3 | Insert Test Data | 🟢 Basic |
| 4 | Query Comparison | 🔴 Advanced |
| 5 | Inspect Internal Collections | 🔴 Advanced |
| 6 | Compact Metadata | 🟡 Intermediate |

---

## Summary of Changes

| Change | Benefit |
|--------|---------|
| Fix PIN verification | Moderators can login |
| Add Overview tab | Context before diving into steps |
| Progressive hints (3 levels) | Learn without full solution reveal |
| Difficulty badges | Senior SAs skip known content |
| UNDERSTAND/DO sections | Clear what's context vs action |
| Progressive unlocking (optional) | Focus on current step |

---

## Implementation Order

1. **Fix PIN** (5 min) - Critical blocker
2. **Add Lab Tabs with Overview** (30 min) - Major UX improvement  
3. **Improve Step Layout** (20 min) - Clearer instructions
4. **Add Hints System** (20 min) - Progressive disclosure
5. **Add Difficulty Badges** (10 min) - Polish

Total estimated implementation: ~1.5 hours

