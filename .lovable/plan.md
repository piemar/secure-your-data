

# Inline Hint System with Cleaner UI

## Problem Analysis

The current hint system has these issues:

1. **Disconnected hints**: Hint buttons are at the bottom of the code block, separated from the blanks they explain
2. **Crowded UI**: Difficulty selector, hint buttons, point tracker, and instructions all compete for space
3. **No line-level context**: Users can't see which hint corresponds to which line/blank in the code
4. **Overwhelming for beginners**: Too many options visible at once

## Proposed Solution: Line-Level Inline Hints

Transform hints from bottom-of-block buttons to inline indicators next to specific lines in the code editor.

### Visual Design

```text
┌─────────────────────────────────────────────────────────────────┐
│ Terminal - AWS CLI                  ⏱️ 10 min  │ 8/10 pts │ Copy │
├─────────────────────────────────────────────────────────────────┤
│ 1  # STEP 1: Create a Customer Master Key                      │
│ 2  KMS_KEY_ID=$(aws kms _________ \                       [?]  │
│ 3      --description "Lab 1 MongoDB Encryption Key" \          │
│ 4      --query 'KeyMetadata._______' \                    [?]  │
│ 5      --output text)                                          │
│ 6                                                               │
│ 7  # STEP 2: Create a Human-Readable Alias                     │
│ 8  aws kms _____________ \                                [?]  │
│ 9      --alias-name "alias/mongodb-lab-key-xyz" \              │
│10      --target-key-id $KMS_KEY_ID                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Click [?] ↓
┌─────────────────────────────────────────────────────────────────┐
│ 💡 Line 2: aws kms _________                           [-1pt]  │
├─────────────────────────────────────────────────────────────────┤
│ [Show Hint]     [Show Answer: create-key]                       │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Blank Detection**: Parse the skeleton code to find lines containing `_________`
2. **Hint Markers**: Display a subtle `[?]` icon in the right margin next to each blank line
3. **Click to Reveal**: Clicking `[?]` opens a popover with two options:
   - **Show Hint** (-1pt): Explains what goes in the blank conceptually
   - **Show Answer** (-2pt): Reveals the exact text to fill in
4. **Visual Feedback**: Revealed answers highlight the line in green

---

## Implementation Plan

### Phase 1: Create Inline Hint Data Structure

Update the skeleton/hint system to use line-based hints:

```typescript
interface InlineHint {
  line: number;           // Line number in the skeleton (1-indexed)
  blankText: string;      // The blank pattern (e.g., "_________")
  hint: string;           // Conceptual explanation
  answer: string;         // Exact text to fill in
}

interface CodeBlock {
  filename: string;
  language: string;
  code: string;
  skeleton?: string;
  inlineHints?: InlineHint[];  // NEW: Line-specific hints
}
```

Example for Lab 1 Step 1:
```typescript
inlineHints: [
  {
    line: 2,
    blankText: '_________',
    hint: 'The AWS KMS command to create a new symmetric key',
    answer: 'create-key'
  },
  {
    line: 4,
    blankText: '_______',
    hint: 'JMESPath query to extract the key identifier',
    answer: 'KeyId'
  },
  {
    line: 8,
    blankText: '_____________',
    hint: 'The AWS KMS command to assign a friendly name',
    answer: 'create-alias'
  }
]
```

### Phase 2: Create InlineHintMarker Component

New component that renders hint indicators in the editor margin:

```tsx
// src/components/labs/InlineHintMarker.tsx

interface InlineHintMarkerProps {
  hint: InlineHint;
  isRevealed: boolean;
  answerRevealed: boolean;
  onRevealHint: () => void;
  onRevealAnswer: () => void;
  tier: SkeletonTier;
}

function InlineHintMarker({ 
  hint, 
  isRevealed, 
  answerRevealed,
  onRevealHint,
  onRevealAnswer,
  tier 
}: InlineHintMarkerProps) {
  const hintPenalty = tier === 'expert' ? 3 : tier === 'challenge' ? 2 : 1;
  const answerPenalty = tier === 'expert' ? 5 : tier === 'challenge' ? 3 : 2;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-xs",
          answerRevealed 
            ? "bg-green-500/20 text-green-500" 
            : isRevealed 
            ? "bg-amber-500/20 text-amber-500"
            : "bg-muted hover:bg-primary/20 text-muted-foreground"
        )}>
          {answerRevealed ? '✓' : isRevealed ? '!' : '?'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Line {hint.line}: <code className="bg-muted px-1">{hint.blankText}</code>
          </div>
          
          {isRevealed && (
            <div className="p-2 bg-amber-500/10 rounded text-sm">
              💡 {hint.hint}
            </div>
          )}
          
          {answerRevealed && (
            <div className="p-2 bg-green-500/10 rounded text-sm font-mono">
              ✓ Answer: <strong>{hint.answer}</strong>
            </div>
          )}
          
          <div className="flex gap-2">
            {!isRevealed && !answerRevealed && (
              <Button size="sm" variant="outline" onClick={onRevealHint}>
                <Lightbulb className="w-3 h-3 mr-1" />
                Show Hint (-{hintPenalty}pt)
              </Button>
            )}
            {!answerRevealed && (
              <Button size="sm" variant="secondary" onClick={onRevealAnswer}>
                <Eye className="w-3 h-3 mr-1" />
                Show Answer (-{answerPenalty}pt)
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Phase 3: Custom Monaco Editor Overlay

Add a right-margin overlay to Monaco Editor that displays hint markers:

```tsx
// In StepView.tsx, alongside the Monaco Editor

<div className="relative">
  <Editor
    height="100%"
    value={displayCode}
    // ... options
  />
  
  {/* Hint Markers Overlay - Right Margin */}
  {hasSkeleton && !isSolutionRevealed && block.inlineHints && (
    <div className="absolute top-0 right-8 pt-3 space-y-0">
      {block.inlineHints.map((hint, idx) => (
        <div 
          key={idx}
          style={{ 
            position: 'absolute',
            top: `${(hint.line - 1) * 20 + 12}px` // Line height ~20px
          }}
        >
          <InlineHintMarker
            hint={hint}
            isRevealed={revealedHints[blockKey]?.includes(idx)}
            answerRevealed={revealedAnswers[blockKey]?.includes(idx)}
            onRevealHint={() => revealHint(blockKey, idx, tier)}
            onRevealAnswer={() => revealAnswer(blockKey, idx, tier)}
            tier={tier}
          />
        </div>
      ))}
    </div>
  )}
</div>
```

### Phase 4: Simplify the Bottom Controls

Remove cluttered buttons from bottom panel, keep only essentials:

**Current (crowded):**
```text
┌──────────────────────────────────────────────────────────────────┐
│ Difficulty: [Guided] [Challenge] [Expert]   -2pts used           │
├──────────────────────────────────────────────────────────────────┤
│ 🔒 Fill in the blanks                                            │
│ [Blank 1 (-1pt)] [Blank 2 (-2pt)] [Blank 3 (-2pt)] [Solution -5] │
│ 💡 Hint text displayed here...                                   │
│ Step score: 8/10 points                                          │
└──────────────────────────────────────────────────────────────────┘
```

**New (clean):**
```text
┌──────────────────────────────────────────────────────────────────┐
│ 📊 Score: 8/10 pts  │  Guided Mode  │  [Show Full Solution (-5)] │
└──────────────────────────────────────────────────────────────────┘
```

- Move difficulty selector to header (next to filename)
- Hint buttons removed (now inline with code)
- Only show full solution button and score in footer

### Phase 5: Update Lab Data with InlineHints

Add `inlineHints` to all lab steps. Example for Lab 1 Step 1:

```typescript
{
  filename: 'Terminal - AWS CLI',
  language: 'bash',
  code: `KMS_KEY_ID=$(aws kms create-key --description "Lab 1 MongoDB Encryption Key" --query 'KeyMetadata.KeyId' --output text)
aws kms create-alias --alias-name "${aliasName}" --target-key-id $KMS_KEY_ID`,
  
  skeleton: `# STEP 1: Create a Customer Master Key (CMK)
KMS_KEY_ID=$(aws kms _________ \\
    --description "Lab 1 MongoDB Encryption Key" \\
    --query 'KeyMetadata._______' \\
    --output text)

# STEP 2: Create a Human-Readable Alias  
aws kms _____________ \\
    --alias-name "${aliasName}" \\
    --target-key-id $KMS_KEY_ID`,
  
  inlineHints: [
    { line: 2, blankText: '_________', hint: 'AWS KMS command to create a new symmetric key', answer: 'create-key' },
    { line: 4, blankText: '_______', hint: 'JMESPath path to extract the key identifier', answer: 'KeyId' },
    { line: 8, blankText: '_____________', hint: 'AWS KMS command to assign a friendly name to a key', answer: 'create-alias' }
  ]
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/labs/StepView.tsx` | Add InlineHintMarker, simplify bottom controls, add right-margin overlay |
| `src/components/labs/Lab1CSFLE.tsx` | Add `inlineHints` to all code blocks |
| `src/components/labs/Lab2QueryableEncryption.tsx` | Add `inlineHints` to all code blocks |
| `src/components/labs/Lab3RightToErasure.tsx` | Add `inlineHints` to all code blocks |

---

## UX Benefits

| Before | After |
|--------|-------|
| Hints at bottom, disconnected from code | Hints inline next to each blank |
| 5-6 buttons in control bar | 1 button (full solution) |
| Generic "Hint 1, Hint 2" labels | Visual marker on exact line |
| Answer reveals all at once | Per-blank reveal with granular penalties |
| Crowded interface | Clean, focused code editor |

---

## Scoring Adjustments

Granular per-blank scoring:

| Action | Guided | Challenge | Expert |
|--------|--------|-----------|--------|
| Reveal hint for 1 blank | -1pt | -2pt | -3pt |
| Reveal answer for 1 blank | -2pt | -3pt | -5pt |
| Reveal full solution | -5pt | -8pt | -15pt |
| Complete without help | 10pts | 15pts | 25pts |

---

## Technical Considerations

### Monaco Editor Line Height
The overlay positioning uses Monaco's default line height (~20px). We'll need to calculate this dynamically:
```typescript
const lineHeight = 20; // Can be read from Monaco's options
const topOffset = (hint.line - 1) * lineHeight + padding;
```

### State Management
New state for tracking revealed answers separately from hints:
```typescript
const [revealedAnswers, setRevealedAnswers] = useState<Record<string, number[]>>({});
```

### Responsive Design
On narrow screens, the hint markers will stack or show as a floating panel rather than fixed margin.

