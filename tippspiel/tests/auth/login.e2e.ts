import { expect, test } from "@playwright/test";
import {
  createTestUser,
  fillLoginForm,
  fillRegisterForm,
} from "../helpers/auth";
import { cleanupUser, findUserByEmail, verifyUser } from "../helpers/database";

test.describe("Login Flow", () => {
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

  test("should login with valid credentials", async ({ page }) => {
    await fillRegisterForm(page, testUser);

    await expect(page).toHaveURL("/auth/register/success");

    const createdUser = await findUserByEmail(testUser.email);
    expect(createdUser?.name).toBe(testUser.name);
    expect(createdUser?.verified).toBe(false);

    await verifyUser(testUser.email);

    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Passwort").fill(testUser.password);

    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText(testUser.email)).toBeVisible();
  });

  test("should prevent login for unverified user", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");
    await fillLoginForm(page, testUser);
    await expect(page.getByText("nicht verifiziert")).toBeVisible();
    await expect(
      page.getByText("Neue Bestätigungsmail anfordern"),
    ).toBeVisible();
    await expect(page).toHaveURL("/auth/login");
  });

  test("should show error for nonexistent user", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByLabel("E-Mail-Adresse").fill("nonexistent@example.com");
    await page.getByLabel("Passwort").fill("wrongpassword");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Ungültige Anmeldedaten")).toBeVisible();
    await expect(page).toHaveURL("/auth/login");
  });

  test("should show error with wrong credentials", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");

    await verifyUser(testUser.email);

    await page.goto("/auth/login");
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Passwort").fill("wrongpassword123");

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Ungültige Anmeldedaten")).toBeVisible();
    await expect(page).toHaveURL("/auth/login");
  });
});
