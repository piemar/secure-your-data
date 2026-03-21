import { test, expect } from "@playwright/test";
import { E2E_PLAYER_JSON } from "./storage";

test.describe("IDE embed visibility (gated)", () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(
      process.env.E2E_IDE_EMBED !== "true",
      "Set E2E_IDE_EMBED=true (Playwright starts Vite with VITE_ENABLE_IDE_LAUNCHER=true)",
    );
  });

  test("mission workspace shows code-server embed as primary pane", async ({ page }) => {
    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
    }, E2E_PLAYER_JSON);

    await page.goto("/mission/mission-12");

    await expect(page.getByRole("button", { name: /BEGIN MISSION/i })).toBeVisible({ timeout: 25_000 });
    await page.getByRole("button", { name: /BEGIN MISSION/i }).click();

    const panel = page.getByTestId("mission-ide-embed");
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(async () => {
      const hasIframe = await page.getByTestId("ide-embed-frame").isVisible().catch(() => false);
      const hasLaunch = await page.getByRole("button", { name: /LAUNCH IDE \(EMBED\)/i }).isVisible().catch(() => false);
      const hasExternalAction = await page
        .getByRole("button", { name: /OPEN EXTERNALLY|OPEN IN NEW TAB|REOPEN LAST URL/i })
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasIframe || hasLaunch || hasExternalAction).toBeTruthy();
    }).toPass({ timeout: 60_000 });
  });
});
