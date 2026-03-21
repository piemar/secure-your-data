import { test, expect } from "@playwright/test";
import { E2E_PLAYER_JSON } from "./storage";

test.describe("UI renders (smoke)", () => {
  test("landing shows brand and handle flow after boot skip", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.removeItem("mongodb-heist-player");
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "MongoDB" })).toBeVisible();
    await expect(page.getByPlaceholder("agent_handle")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /CONNECT/i })).toBeVisible();
  });

  test("dashboard renders mission content when player exists", async ({ page }) => {
    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
    }, E2E_PLAYER_JSON);

    await page.goto("/dashboard");

    await expect(page.getByText(/RECON/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/CRUD Boot Camp|The Phantom Index/i).first()).toBeVisible();
  });

  test("quests page renders quest chains heading", async ({ page }) => {
    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
    }, E2E_PLAYER_JSON);

    await page.goto("/quests");

    await expect(page.getByRole("heading", { name: "QUEST CHAINS" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("mission page renders briefing for a known mission", async ({ page }) => {
    await page.addInitScript((playerJson: string) => {
      sessionStorage.setItem("heist-booted", "1");
      localStorage.setItem("mongodb-heist-player", playerJson);
    }, E2E_PLAYER_JSON);

    await page.goto("/mission/mission-12");

    await expect(page.getByText(/CRUD Boot Camp|WELCOME TO THE GRID|Master the fundamentals/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("unknown route shows 404", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-12345");

    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Return to Home/i })).toBeVisible();
  });
});
