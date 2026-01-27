
# Progressive Code Disclosure: Skeleton-First Learning

## Current Problem

The workshop currently shows **complete, copy-paste-ready code** for every step. This removes the learning challenge - Solution Architects just copy text without understanding what each command does or why.

**Evidence from codebase:**
- `Lab1CSFLE.tsx` line 73-74: Steps have `skeleton` property defined but never rendered
- `StepView.tsx` line 649: Always renders `block.code` (full solution)
- `HintSystem.tsx`: Exists but not integrated into code blocks

---

## Proposed Solution: Challenge Mode

Default to showing a **code skeleton** with key parts hidden. Users must either:
1. Try to fill in the blanks themselves
2. Reveal hints progressively (costs points)
3. Reveal full solution as last resort (costs more points)

### Visual Design

```text
┌─────────────────────────────────────────────────────────┐
│ Terminal - AWS CLI                    ⏱️ 10 min │ Copy │
├─────────────────────────────────────────────────────────┤
│ # 1. Create the CMK                                     │
│ KMS_KEY_ID=$(aws kms _______ --description "Lab 1...")  │
│                      ↑                                  │
│               Fill in the command                       │
│                                                         │
│ # 2. Create a human-readable alias                      │
│ aws kms _______ --alias-name "alias/mongodb-lab-key-*"  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 🔒 Challenge Mode     [Show Hint 1 (-1pt)] [Show Full Solution (-5pts)]  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Add Challenge Mode State

**File**: `src/components/labs/StepView.tsx`

Add state management for skeleton vs. solution display:

```typescript
const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
```

### Phase 2: Update Code Block Rendering

**File**: `src/components/labs/StepView.tsx`

Modify the Monaco Editor section to conditionally show skeleton vs. full code:

```tsx
const blockKey = `${currentStepIndex}-${idx}`;
const isSolutionRevealed = showSolution[blockKey] || !block.skeleton;
const displayCode = isSolutionRevealed ? block.code : block.skeleton;

<Editor
  value={displayCode}
  // ... other props
/>
```

### Phase 3: Add Reveal Controls Below Editor

**File**: `src/components/labs/StepView.tsx`

Add hint/solution buttons below each code block:

```tsx
{block.skeleton && !showSolution[blockKey] && (
  <div className="px-4 py-3 bg-amber-500/10 border-t border-amber-500/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-600">
          Challenge Mode Active
        </span>
      </div>
      <div className="flex items-center gap-2">
        {currentStep.hints?.map((hint, hintIdx) => (
          <Button
            key={hintIdx}
            variant="outline"
            size="sm"
            onClick={() => revealHint(blockKey, hintIdx)}
            disabled={hintIdx > 0 && !revealedHints[blockKey]?.includes(hintIdx - 1)}
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Hint {hintIdx + 1} (-{hintIdx === 0 ? 1 : 2}pt)
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => revealSolution(blockKey)}
          className="text-destructive"
        >
          <Eye className="w-3 h-3 mr-1" />
          Show Solution (-5pts)
        </Button>
      </div>
    </div>
    
    {/* Display revealed hints */}
    {revealedHints[blockKey]?.length > 0 && (
      <div className="mt-3 space-y-2">
        {revealedHints[blockKey].map(hintIdx => (
          <div key={hintIdx} className="text-sm bg-primary/5 p-2 rounded">
            💡 {currentStep.hints[hintIdx]}
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

### Phase 4: Add Toggle for Full Reveal

For users who just want to learn by reading (not hands-on), add a master toggle:

```tsx
<div className="flex items-center gap-2 px-6 py-2 border-b">
  <Switch 
    checked={alwaysShowSolutions} 
    onCheckedChange={setAlwaysShowSolutions}
  />
  <Label>Show all solutions (read-only mode)</Label>
</div>
```

### Phase 5: Enhance Skeleton Data

**File**: `src/components/labs/Lab1CSFLE.tsx` (and Lab2, Lab3)

Review and enhance skeleton definitions to be more instructive:

```javascript
{
  code: `KMS_KEY_ID=$(aws kms create-key --description "..." --query 'KeyMetadata.KeyId' --output text)`,
  
  skeleton: `# Task: Create a symmetric CMK in AWS KMS
# 
# Commands you'll need:
#   - aws kms create-key (with --description flag)
#   - aws kms create-alias (to give it a friendly name)
#
# Fill in the blanks:
KMS_KEY_ID=$(aws kms _______ --description "Lab 1 MongoDB Encryption Key" --query '________' --output text)
aws kms _______ --alias-name "alias/mongodb-lab-key-*" --target-key-id $KMS_KEY_ID`
}
```

---

## Points System Integration

Track points per step:

| Action | Points |
|--------|--------|
| Complete without hints | Full points (10) |
| Use Hint 1 | -1 point |
| Use Hint 2/3 | -2 points each |
| Reveal full solution | -5 points |

Points stored in localStorage and displayed on leaderboard.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/labs/StepView.tsx` | Add challenge mode state, conditional rendering, hint/solution buttons |
| `src/components/labs/Lab1CSFLE.tsx` | Enhance skeleton definitions |
| `src/components/labs/Lab2QueryableEncryption.tsx` | Add skeleton definitions |
| `src/components/labs/Lab3RightToErasure.tsx` | Add skeleton definitions |
| `src/utils/leaderboardUtils.ts` | Add point tracking for hints/solutions |

---

## User Experience Flow

1. User sees **skeleton code** with blanks to fill
2. User attempts to complete the command themselves
3. If stuck, reveals **Hint 1** (small penalty)
4. If still stuck, reveals **Hint 2** (larger penalty)
5. As last resort, reveals **Full Solution** (largest penalty)
6. User copies completed code and runs it
7. Points earned reflect how much help was used

This balances:
- **Learning**: Users must think before seeing answers
- **Progress**: No one gets permanently stuck
- **Gamification**: Point penalties encourage trying first
- **Flexibility**: "Read-only mode" toggle for observers

---

## Summary

The key insight is that **the `skeleton` property already exists** in the data model but was never implemented. This plan activates that existing design intent and integrates it with the existing hint system and leaderboard.
