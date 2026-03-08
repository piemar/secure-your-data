# Lab UI Layout – Target

**Status:** Target layout for future implementation. Right area is reserved for Compete & Preview tabs; step buttons (Previous, Run, Next, step dots) stay in the footer.

---

## Target layout (goal)

- **Sidebar (dashboard menu)** – Existing app sidebar (Presentation, Lab Setup, Labs, Leaderboard, etc.).
- **Database Navigator** – Optional second column (tree of databases/collections) when the lab has `dataRequirements` with collections and the user has a MongoDB URI. Allows users to see which collections exist and inspect document shape (e.g. for CRUD labs).
- **Vertical splitter** – Between navigator and editor.
- **Inline Editor** – Step code blocks (Run all / Run selection), optional "Collections" or "Data" tab to show collection contents.
- **Vertical splitter** – Between editor and Compete.
- **Compete** – Verification / Check progress, next step, etc. (in step toolbar).
- **Preview** – Generic lab preview (table, chart, search, encryption demo) when the step has a `preview` config.

In short: **Sidebar | Database Navigator (tree) | Splitter | Inline Editor | Splitter | Compete | Preview.**

---

## Current state

- **MainLayout:** App sidebar + main content area.
- **StepView:** Resizable horizontal panels: **Editor + Console** (left) | **Preview panel** (right, when moderator enables competitor comparisons) with **Compete** and **Preview** tabs. Step navigation (dots, Previous, Run, Next) lives in the **footer**. Database Navigator and "Collections" tab in the editor are not yet implemented.

---

## Implementation notes (future)

1. **Database Navigator:** Add an optional collapsible column in the lab step view that lists databases/collections (from an API using the lab’s `dataRequirements` and the user’s URI). Selecting a collection could show a read-only document preview (or feed the "Collections" tab).
2. **Collections tab:** In the step view, add a tab (e.g. "Data" or "Collections") next to the code/console when the lab has `dataRequirements` with `type: 'collection'`, showing namespace(s) and sample documents so users understand the data shape.
3. **MongoDB Compass:** Full Compass embedding is a larger feature. Prefer the lightweight collection viewer + tree first; optionally add "Open in Compass" (connection string) or embedded Compass later.

See **README.md** (§ Adding a new lab) and **LAB_SAMPLE_DATA_PLAN.md** for data requirements and Load Sample Data UX.
