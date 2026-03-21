import { test, expect } from "@playwright/test";
import { E2E_PLAYER_JSON } from "./storage";

/** Satisfies mission-4 pattern-tier objective regexes (Tier 1 — no sandbox API). */
const MISSION_4_PATTERN_PASSCODE = `// e2e pattern bundle
db.serverStatus().connections;
const uri = "mongodb://x?maxPoolSize=50&minPoolSize=5&maxIdleTimeMS=60000";
async function withRetry() { /* exponential backoff retry */ }
const opts = { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 30000, connectTimeoutMS: 10000 };
`;

function basePlayerMeBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: "e2e-test-agent",
    handle: "e2e_agent",
    xp: 0,
    rank: "Script Kiddie",
    level: 1,
    achievements: [] as string[],
    completedMissions: [] as string[],
    totalScore: 0,
    chaosEventsSurvived: 0,
    hintsUsed: 0,
    hintXpPenalty: 0,
    avatarId: "ghost",
    ...overrides,
  };
}

test.describe("Mission REPL tab", () => {
  test("mounts REPL and shows mocked command output", async ({ page }) => {
    await page.route("**/api/execute/repl", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tier: "pattern",
          success: true,
          output: [{ command: "db.test.find()", result: [{ _id: 1 }], timeMs: 2 }],
          executionTimeMs: 2,
        }),
      });
    });

    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
      localStorage.removeItem("mayhem-token");
    }, E2E_PLAYER_JSON);

    await page.goto("/mission/mission-4");

    await expect(page.getByText(/Connection Storm|SURGE DETECTED/i).first()).toBeVisible({
      timeout: 45_000,
    });

    await page.getByRole("button", { name: /CHALLENGE/i }).click();
    await page.getByRole("button", { name: /BEGIN MISSION/i }).click();

    await page.getByRole("tab", { name: "REPL" }).click();
    await expect(page.getByText("SANDBOX REPL")).toBeVisible();

    const replInput = page.getByLabel("REPL command");
    await replInput.fill("db.test.find()");
    await replInput.press("Enter");

    await expect(page.locator(".font-mono").filter({ hasText: "db.test.find()" }).first()).toBeVisible();
    await expect(page.getByText(/"_id"\s*:\s*1/)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Authenticated mission completion (mocked API)", () => {
  test("posts mission complete then fetches player profile", async ({ page }) => {
    const seen = { completePost: false };
    let playersMeGetCount = 0;

    await page.route("**/api/players/sync", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(basePlayerMeBody()),
      });
    });

    await page.route("**/api/players/me", async (route) => {
      if (route.request().method() === "GET") playersMeGetCount += 1;
      const body = basePlayerMeBody(
        seen.completePost
          ? {
              xp: 500,
              rank: "Query Cadet",
              level: 3,
              totalScore: 500,
              completedMissions: ["mission-4"],
            }
          : {}
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });

    await page.route("**/api/missions/mission-4/complete", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      seen.completePost = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          userId: "e2e-test-agent",
          completedMissions: ["mission-4"],
          xp: 500,
          totalScore: 500,
          rank: "Query Cadet",
          level: 3,
        }),
      });
    });

    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
      localStorage.setItem("mayhem-token", "e2e-mock-jwt");
    }, E2E_PLAYER_JSON);

    await page.goto("/mission/mission-4");

    await expect(page.getByText(/Connection Storm|SURGE DETECTED/i).first()).toBeVisible({
      timeout: 45_000,
    });

    await page.getByRole("button", { name: /CHALLENGE/i }).click();
    await page.getByRole("button", { name: /BEGIN MISSION/i }).click();

    // Monaco: avoid clicking the hidden readonly textarea (overlay intercepts); focus surface + replace.
    const editorSurface = page.locator(".monaco-editor");
    await editorSurface.waitFor({ state: "visible", timeout: 20_000 });
    await editorSurface.click({ position: { x: 120, y: 120 } });
    await page.keyboard.press(process.platform === "darwin" ? "Meta+a" : "Control+a");
    await page.keyboard.insertText(MISSION_4_PATTERN_PASSCODE);

    await page.getByRole("button", { name: /VALIDATE CODE/i }).click();

    await expect(page.getByRole("button", { name: /COMPLETE MISSION/i })).toBeEnabled({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: /COMPLETE MISSION/i }).click();

    await expect(page.getByRole("heading", { name: "MISSION COMPLETE" })).toBeVisible({
      timeout: 20_000,
    });

    expect(seen.completePost).toBe(true);
    expect(playersMeGetCount).toBeGreaterThanOrEqual(1);
  });
});
