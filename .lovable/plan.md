

# Graduated Difficulty Challenge Mode

## Problem Restatement

The current skeleton approach shows ~90% of the code structure with only small blanks to fill in. While better than full copy-paste, users are essentially doing pattern matching rather than understanding:
- They see `aws kms _________` and just need to guess `create-key`
- The entire command structure is visible, reducing cognitive load too much

## Proposed Solution: Three-Tier Skeleton System

Instead of one skeleton per code block, implement **three difficulty levels** that users can choose:

### Tier 1: Guided Mode (Current - For Beginners)
Shows structure with blanks:
```bash
KMS_KEY_ID=$(aws kms _________ \
    --description "Lab 1 MongoDB Encryption Key" \
    --query 'KeyMetadata._______' \
    --output text)
```

### Tier 2: Challenge Mode (New - For Intermediate)
Shows only high-level tasks with minimal code:
```bash
# TASK 1: Create a Customer Master Key (CMK)
# Requirements:
#   - Use AWS KMS CLI
#   - Capture the KeyId in a variable called KMS_KEY_ID
#   - Add a description "Lab 1 MongoDB Encryption Key"

# YOUR CODE HERE:


# TASK 2: Create an alias for your key
# Requirements:
#   - Alias name should be: ${aliasName}
#   - Link it to the CMK you just created

# YOUR CODE HERE:

```

### Tier 3: Expert Mode (New - For Advanced)
Shows only the objective:
```bash
# OBJECTIVE: Set up AWS KMS infrastructure for MongoDB encryption
#
# You need to:
# 1. Create a Customer Master Key in AWS KMS
# 2. Create a human-readable alias for the key
#
# Expected variables after completion:
#   - KMS_KEY_ID should contain your key UUID
#
# Hints available if needed (costs points)

# YOUR SOLUTION:

```

---

## Implementation Plan

### Phase 1: Add Difficulty Selector to Code Blocks

**File**: `src/components/labs/StepView.tsx`

Add a difficulty toggle above each code block:

```tsx
type SkeletonTier = 'guided' | 'challenge' | 'expert';

const [skeletonTier, setSkeletonTier] = useState<Record<string, SkeletonTier>>({});

// In the editor header, add:
<div className="flex gap-1 bg-muted rounded p-0.5">
  <button 
    onClick={() => setTier(blockKey, 'guided')}
    className={tier === 'guided' ? 'bg-primary' : ''}
  >
    Guided
  </button>
  <button 
    onClick={() => setTier(blockKey, 'challenge')}
    className={tier === 'challenge' ? 'bg-primary' : ''}
  >
    Challenge
  </button>
  <button 
    onClick={() => setTier(blockKey, 'expert')}
    className={tier === 'expert' ? 'bg-primary' : ''}
  >
    Expert
  </button>
</div>
```

### Phase 2: Update Code Block Interface

**Files**: `StepView.tsx`, `Lab1CSFLE.tsx`, `Lab2QueryableEncryption.tsx`, `Lab3RightToErasure.tsx`

Extend the CodeBlock interface:
```typescript
interface CodeBlock {
  filename: string;
  language: string;
  code: string;                    // Full solution
  skeleton?: string;               // Tier 1: Guided (blanks)
  challengeSkeleton?: string;      // Tier 2: Challenge (tasks only)
  expertSkeleton?: string;         // Tier 3: Expert (objective only)
}
```

### Phase 3: Tiered Points System

| Difficulty | Completing without hints | Per hint penalty | Solution penalty |
|------------|-------------------------|------------------|------------------|
| Guided     | 10 points               | -1 to -2 pts     | -5 pts           |
| Challenge  | 15 points               | -2 to -3 pts     | -8 pts           |
| Expert     | 25 points               | -3 to -5 pts     | -15 pts          |

### Phase 4: Define Three Skeletons Per Step

**Example for Lab 1 Step 1:**

```javascript
{
  code: `# Full solution
KMS_KEY_ID=$(aws kms create-key --description "Lab 1 MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID`,

  // Tier 1: Guided - Shows structure, hide commands
  skeleton: `# ══════════════════════════════════════════════════════════════
# STEP 1: Create a Customer Master Key (CMK)
# ══════════════════════════════════════════════════════════════
KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# ══════════════════════════════════════════════════════════════
# STEP 2: Create a Human-Readable Alias
# ══════════════════════════════════════════════════════════════
aws kms _____________ \\
    --alias-name "${aliasName}" \\
    --target-key-id $KMS_KEY_ID`,

  // Tier 2: Challenge - Task-based, minimal scaffolding
  challengeSkeleton: `# ══════════════════════════════════════════════════════════════
# CHALLENGE MODE - MongoDB Encryption Setup
# ══════════════════════════════════════════════════════════════

# TASK 1: Create a Customer Master Key (CMK)
# ──────────────────────────────────────────
# Requirements:
#   • Use the AWS KMS CLI (aws kms <command>)
#   • Store the KeyId in a variable called KMS_KEY_ID
#   • Add description: "Lab 1 MongoDB Encryption Key"
#   • Use --query to extract only the KeyId
#
# Documentation: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-key.html

# Write your command:


# TASK 2: Create an Alias for Easy Reference
# ──────────────────────────────────────────
# Requirements:
#   • Create alias named: ${aliasName}
#   • Link it to your CMK using its KeyId
#
# Documentation: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-alias.html

# Write your command:


# Verification (run after completing above):
echo "CMK Created: $KMS_KEY_ID"
echo "Alias: ${aliasName}"`,

  // Tier 3: Expert - Objective only
  expertSkeleton: `# ══════════════════════════════════════════════════════════════
# EXPERT MODE - AWS KMS Infrastructure
# ══════════════════════════════════════════════════════════════
#
# OBJECTIVE: Prepare AWS KMS for MongoDB Client-Side Field Level Encryption
#
# Your solution must:
#   1. Create a symmetric Customer Master Key (CMK) in AWS KMS
#   2. Store its KeyId in variable: KMS_KEY_ID
#   3. Create an alias pointing to this key: ${aliasName}
#
# Reference: AWS KMS CLI documentation
# Points available: 25 (if no hints used)
#
# ══════════════════════════════════════════════════════════════

# YOUR SOLUTION:


`
}
```

---

## Visual Mockup

```text
┌─────────────────────────────────────────────────────────────────┐
│ Terminal - AWS CLI                                       │ Copy │
├─────────────────────────────────────────────────────────────────┤
│ Difficulty: [Guided] [Challenge ✓] [Expert]     Max: 15pts     │
├─────────────────────────────────────────────────────────────────┤
│ # ══════════════════════════════════════════════════════        │
│ # CHALLENGE MODE - MongoDB Encryption Setup                     │
│ # ══════════════════════════════════════════════════════        │
│                                                                 │
│ # TASK 1: Create a Customer Master Key (CMK)                   │
│ # ──────────────────────────────────────────                   │
│ # Requirements:                                                 │
│ #   • Use the AWS KMS CLI (aws kms <command>)                  │
│ #   • Store the KeyId in a variable called KMS_KEY_ID          │
│ #   • Add description: "Lab 1 MongoDB Encryption Key"          │
│ #                                                               │
│ # Write your command:                                           │
│                                                                 │
│ █                                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 🔒 Challenge Mode                        Current: 0pts / 15pts  │
│                                                                 │
│ [Hint: KMS commands (-2pt)]  [Hint: Query syntax (-3pt)]       │
│ [Show Full Solution (-8pts)]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/labs/StepView.tsx` | Add difficulty selector, tier-based code display, update point calculations |
| `src/components/labs/Lab1CSFLE.tsx` | Add `challengeSkeleton` and `expertSkeleton` to all steps |
| `src/components/labs/Lab2QueryableEncryption.tsx` | Add `challengeSkeleton` and `expertSkeleton` to all steps |
| `src/components/labs/Lab3RightToErasure.tsx` | Add `challengeSkeleton` and `expertSkeleton` to all steps |
| `src/utils/leaderboardUtils.ts` | Track difficulty tier chosen per step |

---

## User Experience Flow

1. User enters a step and sees **difficulty selector** (defaults to "Guided")
2. Advanced users can switch to "Challenge" or "Expert" for more points
3. In Challenge/Expert mode:
   - Less scaffolding means more thinking required
   - Documentation links provided for self-research
   - Higher point rewards for completion without hints
4. Hints are tiered: more expensive in harder modes
5. "Show Solution" penalty scales with difficulty
6. Leaderboard shows both **total points** and **difficulty breakdown**

---

## Why This Works Better

| Current Approach | New Tiered Approach |
|-----------------|---------------------|
| One skeleton fits all | Users choose their challenge level |
| Shows 90% of structure | Expert mode shows 0% of structure |
| 10 points max per step | Up to 25 points for expert mode |
| Pattern matching | Actual problem-solving |
| Same hints for everyone | Difficulty-appropriate hints |

This creates genuine **learning differentiation** - beginners get scaffolding, experts get real challenges, and the leaderboard reflects actual skill level.

---

## Technical Details

### Difficulty State Management
```typescript
// State for tracking chosen difficulty per block
const [skeletonTier, setSkeletonTier] = useState<Record<string, 'guided' | 'challenge' | 'expert'>>({});

// Get display code based on tier
const getDisplayCode = (block: CodeBlock, tier: SkeletonTier, solutionRevealed: boolean): string => {
  if (solutionRevealed || alwaysShowSolutions) return block.code;
  
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
```

### Point Calculation
```typescript
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
```

