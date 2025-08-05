import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tippspiel");
});

test("has login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Anmelden")).toBeVisible();
});
