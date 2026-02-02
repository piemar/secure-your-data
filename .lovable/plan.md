
# Workshop Settings and Lab Control System

## Overview

This plan implements three major features:
1. **Clear prerequisites overview** in Lab Setup with a visual checklist
2. **Workshop management settings** for moderators (enable/disable labs, manage workshops)
3. **Workshop session tracking** with customer name, date, and leaderboard reset

---

## Current Architecture

| Component | Storage | Purpose |
|-----------|---------|---------|
| Leaderboard data | `localStorage` (`workshop_leaderboard`) | Participant scores, lab times |
| User role | `localStorage` (`user_role`) | moderator/attendee |
| Lab progress | `localStorage` (multiple keys) | Step completion, start times |

**Key insight:** Data is currently stored in localStorage, which is browser-local. For workshop management (enabling labs globally for all users), we need a shared storage mechanism.

---

## Implementation Plan

### Part 1: Clear Prerequisites Overview

Add a visual "What You'll Need" checklist at the top of the Lab Setup wizard before any interactive elements.

**Location:** `src/components/labs/LabSetupWizard.tsx`

```text
┌──────────────────────────────────────────────────────────────┐
│  📋 Lab Environment Setup                                    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  📦 WHAT YOU'LL NEED                                    │ │
│  │  Before starting, ensure you have:                      │ │
│  │                                                          │ │
│  │  Required:                                               │ │
│  │  ☐ Node.js v18+      - JavaScript runtime               │ │
│  │  ☐ npm               - Package manager                  │ │
│  │  ☐ AWS CLI v2        - For KMS operations               │ │
│  │  ☐ mongosh           - MongoDB Shell                    │ │
│  │  ☐ MongoDB Atlas     - M10+ cluster with connection URI │ │
│  │                                                          │ │
│  │  Optional (Lab 2):                                       │ │
│  │  ☐ mongo_crypt_shared - For Queryable Encryption        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Architecture Diagram]                                      │
│  [Check Prerequisites Button]                                │
└──────────────────────────────────────────────────────────────┘
```

**Changes:**
- Add a new `PrerequisitesChecklist` component at the top of the setup wizard
- Use clear iconography and grouping (Required vs Optional)
- Include brief descriptions of each tool's purpose
- Make this visible BEFORE the interactive check

---

### Part 2: Moderator Settings Page

Add a Settings button (cog icon) in the sidebar above "Reset Progress" for moderators only.

**New Files:**
- `src/components/settings/WorkshopSettings.tsx` - Settings page component
- `src/utils/workshopUtils.ts` - Workshop state management utilities

**Modified Files:**
- `src/components/layout/AppSidebar.tsx` - Add Settings button
- `src/utils/leaderboardUtils.ts` - Add workshop session fields
- `src/pages/Index.tsx` - Add settings route
- `src/contexts/NavigationContext.tsx` - Add 'settings' section
- `src/types/index.ts` - Add Section type

**Settings Page Features:**

```text
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Workshop Settings                     (Moderator Only)   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ CURRENT WORKSHOP SESSION ─────────────────────────────┐ │
│  │  Customer: [Acme Corp]                                  │ │
│  │  Date: [February 2, 2026]                               │ │
│  │  Status: 🟢 Labs Enabled                                │ │
│  │  Participants: 12                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ LAB ACCESS CONTROL ───────────────────────────────────┐ │
│  │                                                          │ │
│  │  Labs Enabled:  [====OFF====]  / [====ON====]           │ │
│  │                                                          │ │
│  │  When disabled, attendees see "Workshop not yet         │ │
│  │  started" message. Moderators always have access.       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ START NEW WORKSHOP ───────────────────────────────────┐ │
│  │                                                          │ │
│  │  Customer Name: [________________]                       │ │
│  │  Workshop Date: [📅 Select Date]                         │ │
│  │                                                          │ │
│  │  [Start New Workshop]                                    │ │
│  │                                                          │ │
│  │  ⚠️ Starting a new workshop will:                       │ │
│  │     • Reset the leaderboard for the new session         │ │
│  │     • Enable labs for all participants                   │ │
│  │     • Archive the previous session data                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ DANGER ZONE ──────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  [🗑️ Reset Leaderboard Only]                             │ │
│  │  Clear all participant scores without starting new      │ │
│  │  workshop session.                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Part 3: Workshop State Storage

Extend localStorage structure to include workshop session information.

**New localStorage key:** `workshop_session`

```typescript
interface WorkshopSession {
  id: string;                    // Unique session ID
  customerName: string;          // e.g., "Acme Corp"
  workshopDate: string;          // ISO date string
  startedAt: number;             // Timestamp when started
  labsEnabled: boolean;          // Whether labs are accessible
  archivedLeaderboards: {        // Previous sessions
    sessionId: string;
    customerName: string;
    workshopDate: string;
    entries: LeaderboardEntry[];
  }[];
}
```

**New utility functions in `src/utils/workshopUtils.ts`:**

```typescript
// Get current workshop session
getWorkshopSession(): WorkshopSession | null

// Check if labs are enabled
areLabsEnabled(): boolean

// Enable/disable labs
setLabsEnabled(enabled: boolean): void

// Start new workshop (with confirmation)
startNewWorkshop(customerName: string, workshopDate: string): void

// Reset leaderboard only
resetLeaderboard(): void

// Get workshop history
getWorkshopHistory(): WorkshopSession['archivedLeaderboards']
```

---

### Part 4: Lab Access Control

Modify lab access logic to check workshop state.

**Modified Files:**
- `src/context/LabContext.tsx` - Add workshop state check
- `src/pages/Index.tsx` - Show "Workshop not started" message
- `src/components/layout/AppSidebar.tsx` - Show locked state

**Logic Flow:**

```text
User tries to access Lab 1/2/3
        │
        ▼
┌───────────────────┐
│  Is Moderator?    │──Yes──▶ Allow access
└───────────────────┘
        │ No
        ▼
┌───────────────────┐
│  Labs enabled?    │──No──▶ Show "Workshop not started"
└───────────────────┘
        │ Yes
        ▼
┌───────────────────┐
│  Lab accessible?  │──No──▶ Show "Complete Lab 1 first"
│  (progression)    │
└───────────────────┘
        │ Yes
        ▼
    Allow access
```

**"Workshop Not Started" Screen:**

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│           🔒 Workshop Not Yet Started                        │
│                                                              │
│           The workshop moderator has not enabled             │
│           the labs yet. Please wait for the                  │
│           presentation to begin.                             │
│                                                              │
│           In the meantime, you can review the                │
│           Lab Setup requirements.                            │
│                                                              │
│           [Go to Lab Setup]                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/labs/LabSetupWizard.tsx` | Modify | Add prerequisites checklist |
| `src/components/settings/WorkshopSettings.tsx` | Create | New settings page |
| `src/utils/workshopUtils.ts` | Create | Workshop state management |
| `src/utils/leaderboardUtils.ts` | Modify | Add reset function |
| `src/components/layout/AppSidebar.tsx` | Modify | Add Settings button |
| `src/contexts/NavigationContext.tsx` | Modify | Add 'settings' section |
| `src/context/LabContext.tsx` | Modify | Add workshop state check |
| `src/pages/Index.tsx` | Modify | Add settings route, workshop check |
| `src/types/index.ts` | Modify | Add Section type |
| `src/components/labs/WorkshopNotStarted.tsx` | Create | Placeholder screen |

---

## Implementation Order

1. **Prerequisites Checklist** - Improve Lab Setup UX
2. **Workshop Utilities** - Create state management layer
3. **Settings Page** - Build moderator controls
4. **Sidebar Integration** - Add Settings button
5. **Lab Access Control** - Implement global enable/disable
6. **Workshop Not Started Screen** - User-facing message
7. **Leaderboard Reset** - Add reset functionality

---

## Technical Notes

### Storage Considerations

Since this is a localStorage-based system (no Supabase backend per project architecture), the "global" lab enable/disable works as follows:

- Each browser has its own localStorage
- The workshop state is stored per browser
- **For true multi-user sync**, the moderator would need to tell attendees when to refresh

**Alternative approach (if needed later):** 
- Use a simple polling mechanism to check a shared JSON file
- Or implement Supabase later for real-time sync

### Default State

- Labs are **disabled by default** (no active workshop)
- When moderator starts a new workshop, labs become enabled
- Workshop state persists until explicitly reset

### Moderator Always Has Access

Regardless of `labsEnabled` state, moderators can:
- Access all labs
- View the settings page
- Manage workshop state

