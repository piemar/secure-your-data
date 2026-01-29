
# Comprehensive UX Audit: Inline Hints & Multi-Persona Flow

## Executive Summary

Testing revealed **critical bugs** in the Inline Hint System and identified several mobile responsiveness issues. The hint markers are **NOT rendering** due to incorrect line number mappings in the Lab data files.

---

## Issue #1: Inline Hint Markers Not Displaying (CRITICAL)

### Root Cause
The `inlineHints` line numbers in Lab data files do **NOT match** the actual line positions within the skeleton code blocks.

### Evidence
In `Lab1CSFLE.tsx` Step 1, the inlineHints are defined as:
```typescript
inlineHints: [
  { line: 7, blankText: '_________', hint: '...', answer: 'create-key' },
  { line: 9, blankText: '_______', hint: '...', answer: 'KeyId' },
  { line: 16, blankText: '_____________', hint: '...', answer: 'create-alias' }
]
```

But the actual skeleton code has blanks at:
- **Line 9**: `KMS_KEY_ID=$(aws kms _________ \` (not line 7)
- **Line 11**: `--query 'KeyMetadata._______' \` (not line 9)  
- **Line 22**: `aws kms _____________ \` (not line 16)

### Technical Explanation
The `InlineHintEditor.tsx` uses `findBlankPositions()` which:
1. Takes the `hint.line` value (e.g., 7)
2. Gets the text at that line index: `lines[hint.line - 1]`
3. Searches for underscore pattern `/_+/` on that line
4. If not found, the blank is NOT added to `blankPositions`

Since the line numbers are wrong, `blankPositions` remains empty, and `showMarkers` evaluates to `false`:
```typescript
const showMarkers = hasSkeleton && !isSolutionRevealed && tier === 'guided' && blankPositions.length > 0;
// blankPositions.length === 0, so showMarkers === false
```

### Fix Required
Update the `inlineHints` line numbers in ALL lab files to match the actual skeleton line positions:

**Lab 1 CSFLE - Step 1:**
| Current | Should Be | Blank Pattern |
|---------|-----------|---------------|
| line: 7 | line: 9   | `_________` (create-key) |
| line: 9 | line: 11  | `_______` (KeyId) |
| line: 16 | line: 22 | `_____________` (create-alias) |

Similar corrections needed for:
- Lab 1 Step 2
- Lab 1 Step 3  
- Lab 2 Step 1
- Lab 3 Step 1

---

## Issue #2: Moderator Lab Access (VERIFIED WORKING)

### Test Results
The Moderator/Presenter persona correctly has access to all labs:
- Logged in with PIN 163500
- "Moderator" badge displayed in top-right corner
- Lab 2 is accessible (not locked)
- Lab 3 is accessible (not locked)
- Sidebar shows all labs without lock indicators

The fix from the previous edit is working correctly.

---

## Issue #3: Mobile Responsiveness Issues

### Problems Observed
1. **Sidebar overlaps content**: Fixed sidebar takes up screen space on mobile (390px width)
2. **Code editor cramped**: Font size and padding need adjustment for small screens
3. **Footer buttons overflow**: Difficulty selector buttons touch edges
4. **Step navigation cramped**: Numbered step circles are too small to tap

### Recommendations

| Component | Issue | Fix |
|-----------|-------|-----|
| `AppSidebar.tsx` | Fixed sidebar on mobile | Convert to hamburger menu overlay for screens < 768px |
| `InlineHintEditor.tsx` | Monaco font too small | Increase mobile fontSize from 11 to 13-14 |
| `StepView.tsx` footer | Buttons cramped | Use horizontal scroll for difficulty buttons on mobile |
| `InlineHintMarker.tsx` | Touch target too small | Increase marker size to 7x7 on mobile |

---

## Issue #4: Incomplete Inline Hints Coverage

### Labs Missing inlineHints
Some lab steps have skeleton code but no corresponding inlineHints defined:

| Lab | Step | Has Skeleton | Has inlineHints |
|-----|------|--------------|-----------------|
| Lab 1 | Step 4 | Yes | No |
| Lab 1 | Step 5 | Yes | No |
| Lab 2 | Step 4 | Yes | No |
| Lab 2 | Step 5 | Yes | No |
| Lab 3 | Step 3 | Yes | No |
| Lab 3 | Step 4 | Yes | No |

---

## Implementation Plan

### Phase 1: Fix Inline Hint Line Numbers (Priority: Critical)

**Files to modify:**
1. `src/components/labs/Lab1CSFLE.tsx`
2. `src/components/labs/Lab2QueryableEncryption.tsx`  
3. `src/components/labs/Lab3RightToErasure.tsx`

**Process for each code block:**
1. Count actual line numbers in the skeleton template literal
2. Find each underscore pattern and note its line number
3. Update the corresponding `inlineHints.line` value

**Lab 1 Step 1 Corrections:**
```typescript
inlineHints: [
  { line: 9, blankText: '_________', hint: 'AWS KMS command to create a new symmetric key', answer: 'create-key' },
  { line: 11, blankText: '_______', hint: 'JMESPath query to extract the key identifier', answer: 'KeyId' },
  { line: 22, blankText: '_____________', hint: 'AWS KMS command to assign a friendly name', answer: 'create-alias' }
]
```

### Phase 2: Mobile Sidebar Fix

**File:** `src/components/layout/MainLayout.tsx` and `AppSidebar.tsx`

**Changes:**
1. Add `useIsMobile()` hook
2. On mobile: render sidebar as Sheet/Drawer overlay instead of fixed sidebar
3. Add hamburger menu button to header
4. Close sidebar on navigation item click

### Phase 3: Add Missing inlineHints

**Files:** Lab1CSFLE.tsx, Lab2QueryableEncryption.tsx, Lab3RightToErasure.tsx

For each step with skeleton code:
1. Identify all underscore blanks
2. Define corresponding inlineHints with correct line numbers
3. Add conceptual hints and exact answers

---

## Testing Checklist After Fixes

| Test Case | Expected Result |
|-----------|-----------------|
| Lab 1 Step 1 skeleton shows `?` markers | 3 markers visible at blanks |
| Click `?` marker opens popover | Popover shows hint/answer buttons |
| Click "Show Hint" deducts points | Score decreases, hint text shown |
| Click "Show Answer" reveals code | Answer displayed, score deducted |
| Mobile sidebar toggle works | Hamburger opens overlay sidebar |
| Lab 2/3 accessible as Moderator | No lock icons, content loads |

---

## Persona-Specific Flow Summary

### Workshop Attendee Flow
1. ✅ Registration form works
2. ✅ Lab 1 accessible
3. ✅ Lab 2/3 locked until Lab 1 complete
4. ⚠️ Inline hints NOT visible (blocked by bug)
5. ⚠️ Mobile layout cramped

### Workshop Moderator Flow  
1. ✅ Presenter login with PIN works
2. ✅ Moderator badge displayed
3. ✅ All labs accessible
4. ⚠️ Inline hints NOT visible (blocked by bug)
5. ✅ Can navigate between all labs freely
