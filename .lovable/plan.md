
# Plan: Align Lab 1 Structure with Lab 2

## Problem Analysis

After comparing Lab 1 and Lab 2 step structures, I found:

### Current State

| Lab 1 Step | Current Blocks | Issue |
|------------|---------------|-------|
| 1 (Create CMK) | 1 block: Terminal - AWS CLI | Single block - OK for CLI-only step |
| 2 (Apply Policy) | 1 block: AWS CLI | Single block - OK for CLI-only step |
| 3 (Configure mongosh) | 1 block: Terminal | Single block - OK |
| 4 (Init Key Vault) | 1 block: mongosh | Single block - OK |
| 5 (Generate DEKs) | 3 blocks: deps + code + terminal | **Already matches Lab 2 pattern** |
| 6 (Test CSFLE) | 2 blocks: code + terminal | **Already matches Lab 2 pattern** |
| 7 (Complete App) | 1 block: code | Missing "Terminal - Run" section |

### Lab 2 Pattern (Reference)

| Lab 2 Step | Blocks |
|------------|--------|
| 1 (Create DEKs) | 2 blocks: code file + terminal |
| 2 (Create Collection) | 3 blocks: Node.js + mongosh + terminal |
| 3 (Insert Data) | 2 blocks: code file + terminal |
| 4 (Query Data) | 2 blocks: code file + terminal |

### Key Structural Difference

Lab 2 consistently separates:
1. **Code file creation** (interactive, with skeleton) - for files the user creates
2. **Terminal instructions** (read-only, no skeleton) - how to run the file

Lab 1 Steps 1-4 are **pure CLI commands** (AWS CLI or mongosh) - they don't create files, so a single terminal block is appropriate.

Lab 1 Steps 5-7 involve **Node.js scripts** - should follow the Lab 2 pattern (and Steps 5-6 already do!).

---

## Solution

### Part 1: Add "Terminal - Run" Section to Lab 1 Step 7

Step 7 (Complete Application) currently only shows the code file without instructions on how to run it.

**Current:** 1 code block (`app.js`)

**After:** 2 code blocks:
1. `app.js (Node.js - Create this file)` - the application code
2. `Terminal - Run the application` - instructions to run it

```javascript
// Add this as second code block
{
  filename: 'Terminal - Run the application',
  language: 'bash',
  code: `# Run the complete CSFLE application:
node app.js

# Expected Output:
# ✓ Connected to MongoDB
# ✓ Inserted patient with encrypted SSN
# ✓ Retrieved patient (SSN decrypted automatically)
# 
# Patient: { name: "Alice Johnson", ssn: "123-45-6789" }`
}
```

### Part 2: Verify No "Empty Editor" Issues

The earlier fix (checking `hasAnySkeleton(block)` per-block instead of step-level) should have resolved empty editor issues. However, I'll verify:

**Confirmed Working:**
- Footer with Challenge Mode controls only appears for blocks WITH skeletons
- Terminal blocks without skeletons show cleanly without footer controls
- Output panel is separate from code blocks

### Part 3: Add Terminal Sections to Relevant Steps (Optional Enhancement)

For better consistency with Lab 2, consider adding terminal sections to:

**Step 1 (Create CMK):** Already self-contained - commands run directly
**Step 2 (Apply Policy):** Already self-contained  
**Step 3 (Configure mongosh):** Could add verification commands
**Step 4 (Init Key Vault):** Could add verification commands
**Step 5 (Generate DEKs):** Already has terminal section
**Step 6 (Test CSFLE):** Already has terminal section
**Step 7 (Complete App):** **Needs terminal section** (this plan)

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/labs/Lab1CSFLE.tsx` | Modify | Add "Terminal - Run" block to Step 7 |

---

## Implementation Details

### Lab1CSFLE.tsx - Step 7 Update

Add a second code block after the existing `app.js` code block:

```javascript
// In step l1s7, add after the first code block:
{
  filename: 'Terminal - Run the application',
  language: 'bash',
  code: `# Run the complete CSFLE application:
node app.js

# Expected Output:
# ✓ Connected to MongoDB with CSFLE enabled
# ✓ Inserted encrypted patient record
# ✓ Query result (automatically decrypted):
#   { name: "Alice Johnson", ssn: "123-45-6789", dateOfBirth: "1990-01-15" }
#
# Verify encryption in mongosh:
# mongosh "${mongoUri}"
# use medical
# db.patients.findOne()
# // SSN will appear as Binary (Subtype 6) - encrypted!`
}
```

---

## Verification Steps

After implementation:
1. Navigate to Lab 1 → Steps → Step 7
2. Verify two code blocks appear:
   - `app.js` with full application code
   - `Terminal - Run the application` with execution instructions
3. Verify no empty sections below either block
4. Compare with Lab 2 Step 1 - structure should be similar

---

## Technical Note

The "empty editor" issue the user mentioned was likely:
1. **Resolved** by the previous fix (per-block skeleton check)
2. **Or** a visual perception issue where the Output panel at the bottom was mistaken for an empty editor

The current implementation correctly:
- Only shows Challenge Mode footer for blocks WITH skeletons
- Displays terminal/instruction blocks cleanly without extra UI
- Keeps the Output panel separate at the very bottom
