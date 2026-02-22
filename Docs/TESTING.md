# Frontend Testing Guide

This project uses **Vitest** with **React Testing Library** and **jsdom** to test the frontend. Tests run in Node (no real browser by default). Use this guide to run tests and to add or extend tests so that UI elements and features stay correct.

---

## Quick start

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch
```

Tests are under `src/**/*.test.{ts,tsx}` and `src/**/*.spec.{ts,tsx}`. Setup: `src/test/setup.ts` (localStorage and matchMedia mocks).

---

## What is tested

| Category | Location | What it covers |
|----------|----------|----------------|
| **App flows** | `src/test/app-flows.test.tsx` | High-level flows: attendee registration, moderator layout (sidebar, Moderator Mode badge). |
| **Components** | `src/test/components/` | LabHubView (labs by topic, mode filter), DemoScriptView (side-by-side layout, beats), QuestMapView. |
| **Labs (legacy)** | `src/test/labs/Lab1CSFLE.test.tsx`, `Lab2QueryableEncryption.test.tsx`, `Lab3RightToErasure.test.tsx` | Lab tabs, steps, code blocks, verification buttons for the legacy lab components. |
| **Content-driven labs** | `src/test/labs/ContentDrivenLabRendersCode.test.tsx` | LabRunner with `labId`: lab loads, Steps tab, code blocks visible (for selected lab IDs). |
| **Enhancements** | `src/test/labs/*Enhancements.test.ts` | Each enhancement ID returns metadata with code blocks (e.g. `getStepEnhancement('auto-ha.concepts')`). |
| **Settings** | `src/test/settings/DynamicTemplateBuilder.test.tsx` | Template builder UI. |
| **E2E-style flow** | `src/test/e2e/full-workshop-flow.test.tsx` | Workshop flow in jsdom (moderator login, settings, navigation). Known limitations: uses mocks; real navigation/reload can hit "Not implemented: navigation". |

---

## How to run specific tests

```bash
# Single file
npx vitest run src/test/app-flows.test.tsx

# Single file (watch)
npx vitest src/test/components/LabHubView.test.tsx

# All lab enhancement tests
npx vitest run src/test/labs --run

# All component tests
npx vitest run src/test/components --run
```

---

## Ensuring elements and features are correct

1. **Run the full suite before/after changes**  
   `npm test` (or `npx vitest run`). Fix any failing tests so existing behaviour stays correct.

2. **Add component tests for new UI**  
   - Render the component with the same providers as the app (e.g. `RoleProvider`, `WorkshopSessionProvider`, `QueryClientProvider`).  
   - Mock external deps: `getContentService()`, `workshopUtils`, `LabContext` (see `LabHubView.test.tsx`, `ContentDrivenLabRendersCode.test.tsx`).  
   - Use `@testing-library/react`: `render()`, `screen.getByRole()`, `getByText()`, `fireEvent`, `waitFor()` to assert that key elements and labels are present and that critical interactions work.

3. **Add enhancement tests for new labs**  
   When adding a new POV or lab, add a `src/test/labs/<PovPascal>Enhancements.test.ts` file that calls `getStepEnhancement('<prefix>.<suffix>')` for each enhancement ID and asserts that code blocks (and optionally tips) are present. See `AutoHaEnhancements.test.ts` or `ReportingEnhancements.test.ts`.

4. **Content validation**  
   Run `node scripts/validate-content.js` to validate lab/topic/content schema and references. Use this to catch missing or invalid content that could break the UI.

5. **Manual smoke test in browser**  
   Run `npm run dev`, then in the browser: switch moderator/attendee, switch Lab/Demo/Challenge mode, open a few labs (including content-driven and legacy), go through steps and check code blocks, hints, and competitor panel (in Demo Mode as moderator for labs with competitor code). This complements the automated tests.

---

## Test patterns and mocks

- **workshopUtils**  
  Often mocked so tests don’t call Atlas (e.g. `getWorkshopSession: vi.fn().mockReturnValue(null)` or a localStorage-based implementation). See `app-flows.test.tsx` and `full-workshop-flow.test.tsx`.

- **ContentService**  
  Mock `getContentService()` and its methods (`getLabs`, `getTopics`, `getLabById`, etc.) when testing components that depend on lab/topic data. See `LabHubView.test.tsx`.

- **LabContext / useLab**  
  Mock `useLab()` (e.g. in `LabContext` mock) to provide `startLab`, `completeLab`, `userEmail`, etc., when testing lab views. See `ContentDrivenLabRendersCode.test.tsx`.

- **Async and loading**  
  Use `waitFor()` from React Testing Library when asserting on content that appears after async load (e.g. lab steps or code blocks).

---

## Optional: real-browser E2E

The current “e2e” test runs in jsdom. For real-browser E2E (clicking in Chrome/Firefox, testing navigation and full flows), you can add **Playwright** or **Cypress** and run those tests in CI or locally. That would give additional confidence for “all elements and features are correct” in a real browser. The existing Vitest + RTL suite remains the main way to test behaviour and elements in this repo.
