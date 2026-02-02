
# Plan: Add Missing Hints for Complete Coverage

## Overview
Add the missing `hints[]` arrays to Lab 2 Steps 1 and 3, which have `inlineHints` but lack the traditional progressive hint system. This ensures consistency across all labs and enables the HintSystem component to work properly.

## Changes Required

### 1. Lab 2 Step 1: Create QE DEKs
**File:** `src/components/labs/Lab2QueryableEncryption.tsx`
**Location:** Lines ~39-224 (step `l2s1`)

Add `hints` array after the `codeBlocks` array:
```javascript
hints: [
  'Blank 1: The method to generate a new Data Encryption Key is "createDataKey".',
  'Blank 2: The property for human-readable key identifiers is "keyAltNames".',
  'Blank 3: Same method as above - "createDataKey" for the second DEK.',
  'Blank 4: The keyAltName for the taxId field should be "qe-taxid-dek".'
]
```

### 2. Lab 2 Step 3: Insert Test Data
**File:** `src/components/labs/Lab2QueryableEncryption.tsx`
**Location:** Lines ~430-619 (step `l2s3`)

Add `hints` array after the `codeBlocks` array:
```javascript
hints: [
  'Blank 1: The method to find a single document is "findOne".',
  'Blank 2: The keyAltName for the taxId DEK is "qe-taxid-dek".',
  'Blank 3: The BSON type for integer values is "int".',
  'Blank 4: The field name for tax identification is "taxId".',
  'Blank 5: The config property to enable automatic encryption is "autoEncryption".',
  'Blank 6: The method to insert multiple documents is "insertMany".'
]
```

---

## Summary Table

| Lab | Step | Current Status | Action |
|-----|------|----------------|--------|
| Lab 1 | Steps 1-4 | ✅ Complete | None |
| Lab 1 | Steps 5-7 | Demo/Reference | None (acceptable) |
| Lab 2 | Step 1 | Missing `hints[]` | **Add hints array** |
| Lab 2 | Step 2 | ✅ Complete | None |
| Lab 2 | Step 3 | Missing `hints[]` | **Add hints array** |
| Lab 2 | Step 4 | Demo step | None (acceptable) |
| Lab 3 | Steps 1-2 | ✅ Complete | None |
| Lab 3 | Steps 3-4 | Conceptual | None (acceptable) |

## Files to Modify

1. `src/components/labs/Lab2QueryableEncryption.tsx` - Add 2 `hints[]` arrays

## Technical Notes

- The `HintSystem` component uses the `hints[]` array to show progressive hints before revealing the full solution
- `inlineHints` are used by the `InlineHintEditor` for Monaco-based `?` markers in the code
- Both systems should be in sync for steps with fill-in-the-blank skeletons
- Steps without skeletons (demo/verification steps) don't need hints
