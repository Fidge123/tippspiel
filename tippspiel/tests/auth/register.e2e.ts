import { expect, test } from "@playwright/test";
import { createTestUser, fillRegisterForm } from "../helpers/auth";
import { cleanupUser } from "../helpers/database";

test.describe("Registration Flow", () => {
  let testUser: {
    email: string;
    name: string;
    password: string;
  };

  test.beforeEach(async () => {
    testUser = createTestUser();
  });

  test.afterEach(async () => {
    await cleanupUser(testUser.email);
  });

  test("should require consent checkbox", async ({ page }) => {
    await fillRegisterForm(page, testUser, false);
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .uncheck();
    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await page.waitForTimeout(500);

    await expect(page).toHaveURL("/auth/register");
  });

  test("should validate form fields with HTML5 validation", async ({
    page,
  }) => {
    await page.goto("/auth/register");

    const emailField = page.locator("[name='email']");
    await expect(emailField).toHaveAttribute("type", "email");

    const passwordField = page.locator("[name='password']");
    await expect(passwordField).toHaveAttribute("minLength", "8");
  });

  test("should navigate between register and login pages", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(
      page.getByRole("heading", { name: "Erstelle ein Konto" }),
    ).toBeVisible();

    await page.locator("main a", { hasText: "Anmelden" }).click();

    await expect(page).toHaveURL("/auth/login");
    await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();

    await page.getByRole("link", { name: "Registrieren" }).click();

    await expect(page).toHaveURL("/auth/register");
    await expect(
      page.getByRole("heading", { name: "Erstelle ein Konto" }),
    ).toBeVisible();
  });

  test("should show error for duplicate email", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");

    await fillRegisterForm(page, testUser);
    await expect(
      page.getByText(/Diese E-Mail-Adresse wurde bereits registriert/),
    ).toBeVisible();
    await expect(page).toHaveURL("/auth/register");
  });

  test("should validate password confirmation", async ({ page }) => {
    await fillRegisterForm(page, testUser, false);
    await page.getByLabel("Passwort bestätigen").fill("differentpassword123");
    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await expect(
      page.getByText(/Die Passwörter stimmen nicht überein/),
    ).toBeVisible();
    await expect(page).toHaveURL("/auth/register");
  });
});
