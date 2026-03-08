# Workshop Template Storage and Custom Templates

This doc describes where workshop templates live, how custom templates work, and how to choose between **Predefined** and **Custom** when creating a session. It also outlines the path to storing custom templates in a central database and promoting them to defaults.

---

## 1. Where are default (predefined) templates stored?

**Answer: in the repo, on disk.**

- **Location:** `src/content/workshop-templates/*.ts` (e.g. `default-encryption-workshop.ts`, `retail-encryption-quickstart.ts`, `query-capabilities-workshop.ts`).
- **Loading:** The app’s `ContentService` imports these modules and exposes them via `getTemplates()`. No database is required for predefined templates.

**Why repo is the best option for defaults**

- Version-controlled and reviewed with code.
- No runtime dependency on a central DB for core content.
- New defaults are added via PR (review, CI).
- Easy to keep in sync with lab IDs and topic structure.

**Optional future:** Predefined templates could be mirrored to Atlas (e.g. by a sync job) for caching or multi-region serving. The **source of truth** remains the repo.

---

## 2. Custom workshop templates: workflow and storage

**Workflow**

1. An SA has an upcoming workshop and the **predefined templates are not a good fit**.
2. The SA uses **Build custom template** (Topics → Labs → Modes → Review) to define a custom workshop template.
3. The custom template is **saved** (see storage below) and tagged as **custom** (`isCustom: true`).
4. When **creating a workshop session**, the SA can filter:
   - **Predefined templates** – from the repo (defaults).
   - **Custom workshop templates** – saved custom templates (from local storage today; from central DB in a later phase).
5. The SA selects either a predefined or a custom template and starts the session. The session stores `templateId` and `labIds`; attendees get the same template when they join.

**Where to store custom templates**

- **Current (phase 1):** **Local storage** in the browser (`workshop_custom_templates`). Custom templates are listed under “Custom” in the template picker and can be used when creating a session. They are **not** shared across devices or with attendees until a session is created (the session itself can be synced to Atlas).
- **Next phase (recommended):** **Central database (Atlas).**  
  - Persist custom templates in a collection (e.g. `workshop_templates` or `custom_templates`) with a field like `source: 'custom'` or `isCustom: true`.  
  - When an SA creates a session and selects a custom template, the session references that template (by id). Attendees loading the app can then receive the session (and thus the template’s labs/config) from the central API.  
  - This gives: one place to store custom templates, reuse across sessions, and a clear path for “promotion to default” (see below).

**Tagging: Predefined vs Custom**

- Every template has an explicit **source** in the UI and in data:
  - **Predefined** – from repo; `isCustom: false` or omitted (or `source: 'repo'`).
  - **Custom** – built by the SA and saved; `isCustom: true` (or `source: 'custom'`).
- When **creating a session**, the template picker offers:
  - **Predefined templates** – from `ContentService.getTemplates()` (repo).
  - **Custom workshop templates** – from local storage (now) or from API (later).
- Filtering by these two categories keeps the flow clear and avoids mixing defaults with one-off or experimental custom templates.

---

## 3. Promotion to default template (future)

- **Who decides:** The **team that manages the workshop** (e.g. content/workshop owners), not the SA who created the custom template.
- **How it could work:**
  - Custom templates live in the central DB with `isCustom: true`.
  - A workflow (admin UI or internal process) allows an admin to “promote” a custom template to a **predefined** template.
  - Promotion could mean: (a) adding it to the repo (new file under `src/content/workshop-templates/`) and deploying, and/or (b) marking it in the DB as `isCustom: false` / `source: 'predefined'` if predefined templates are also served from Atlas.
- **Result:** The template shows up under “Predefined templates” and is available to everyone without needing to save a custom copy.

---

## 4. Summary

| Aspect | Predefined (default) templates | Custom templates |
|--------|--------------------------------|-------------------|
| **Storage** | Repo (`src/content/workshop-templates/`) | Local storage (current) → Central Atlas (recommended next) |
| **Who creates** | Content/workshop team (code/PR) | SA (Build custom template UI) |
| **Tag** | Not custom (default) | `isCustom: true` |
| **When creating session** | Choose from “Predefined templates” | Choose from “Custom workshop templates” |
| **Promotion to default** | N/A | Team decision; add to repo and/or mark as predefined in DB |

---

## 5. Implementation notes (code)

- **WorkshopTemplate type:** Optional `isCustom?: boolean` (and, if needed, `source?: 'repo' | 'custom'`).
- **ContentService:** `getTemplates()` returns only **predefined** templates (from repo). Do not merge custom into this method; keep predefined and custom clearly separated.
- **Custom templates:** A small service or module (e.g. `customTemplatesService`) with `getCustomTemplates()`, `saveCustomTemplate(template)`, `deleteCustomTemplate(id)`. Today: localStorage; later: API that reads/writes Atlas.
- **Template picker (TemplateBrowser / wizard step 3):** Tabs or filter: **Predefined templates** | **Custom workshop templates**. Predefined = ContentService; Custom = customTemplatesService (or API).
- **DynamicTemplateBuilder:** On “Generate” / “Save”, set `isCustom: true` and a stable `id` (e.g. `custom-<slug>-<timestamp>`), then call `saveCustomTemplate(template)` and set it as the active template so it can be used immediately for the session and appears under Custom next time.

See **`src/components/settings/DynamicTemplateBuilder.tsx`**, **`TemplateBrowser.tsx`**, **`WorkshopSessionWizard.tsx`** (step 3), and **`src/services/contentService.ts`** for the current wiring.
