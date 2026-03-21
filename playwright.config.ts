import { defineConfig, devices } from "@playwright/test";

const ideEmbedE2E = process.env.E2E_IDE_EMBED === "true";

/**
 * E2E tests: UI smoke + critical routes.
 * Run: npx playwright install (once) && npm run test:e2e
 * CI should set CI=true so a fresh dev server is started.
 * Optional: E2E_IDE_EMBED=true enables the IDE panel smoke test (starts Vite with VITE_ENABLE_IDE_LAUNCHER=true).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    // Dedicated port so E2E does not collide with a developer's normal :8080 session
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: ideEmbedE2E
      ? "VITE_ENABLE_IDE_LAUNCHER=true npm run dev -- --port 4173 --strictPort"
      : "npm run dev -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
