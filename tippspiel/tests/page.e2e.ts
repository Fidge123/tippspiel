import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tippspiel");
});

test("has login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Anmelden")).toBeVisible();
});

test("impressum", async ({ page }) => {
  await page.goto("/impressum");
  await expect(page.getByText("Impressum")).toBeVisible();
  await expect(page.getByText("Seitenbetreiber")).toBeVisible();
});

test("terms", async ({ page }) => {
  await page.goto("/terms");
  await expect(
    page.getByText("Nutzungs- und Datenschutzbestimmungen"),
  ).toBeVisible();
  await page.getByText("For the English version").click();
  await expect(
    page.getByText("Terms of Service and Privacy Policy"),
  ).toBeVisible();
});
