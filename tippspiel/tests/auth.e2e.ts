import { expect, test } from "@playwright/test";
import { cleanupUser, findUserByEmail, verifyUser } from "./helpers/database";

test.describe("Authentication Flow", () => {
  let testUser: {
    email: string;
    name: string;
    password: string;
  };

  test.beforeEach(async () => {
    testUser = {
      email: `test-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`,
      name: "Test User",
      password: "testpassword123",
    };
  });

  test.afterEach(async () => {
    await cleanupUser(testUser.email);
  });

  test("should require consent checkbox", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill(testUser.name);
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill(testUser.password);

    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await page.waitForTimeout(500);

    await expect(page).toHaveURL("/auth/register");
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill(testUser.name);
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill(testUser.password);
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();
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

    await page.getByRole("link", { name: "Anmelden" }).click();

    await expect(page).toHaveURL("/auth/login");
    await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();

    await page.getByRole("link", { name: "Registrieren" }).click();

    await expect(page).toHaveURL("/auth/register");
    await expect(
      page.getByRole("heading", { name: "Erstelle ein Konto" }),
    ).toBeVisible();
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Test with non-existent email
    await page.getByLabel("E-Mail-Adresse").fill("nonexistent@example.com");
    await page.getByLabel("Passwort").fill("wrongpassword");

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Ungültige Anmeldedaten/)).toBeVisible();
    await expect(page).toHaveURL("/auth/login");

    // Test with existing user but wrong password
    // First create a user
    await page.goto("/auth/register");
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill(testUser.name);
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill(testUser.password);
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page).toHaveURL("/auth/register/success");

    // Verify the user
    await verifyUser(testUser.email);

    // Now try to login with wrong password
    await page.goto("/auth/login");
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Passwort").fill("wrongpassword123");

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Ungültige Anmeldedaten/)).toBeVisible();
    await expect(page).toHaveURL("/auth/login");
  });

  // test("should prevent login for unverified user", async ({ page }) => {
  //
  // });

  test("should show error for duplicate email", async ({ page }) => {
    // First register a user
    await page.goto("/auth/register");
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill(testUser.name);
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill(testUser.password);
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page).toHaveURL("/auth/register/success");

    // Now try to register with the same email
    await page.goto("/auth/register");
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill("Another User");
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill(testUser.password);
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await expect(
      page.getByText(/Diese E-Mail-Adresse wurde bereits registriert/),
    ).toBeVisible();
    await expect(page).toHaveURL("/auth/register");
  });

  test("should validate password confirmation", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Nutzername").fill(testUser.name);
    await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
    await page.getByLabel("Passwort bestätigen").fill("differentpassword123");
    await page
      .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
      .check();

    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await expect(
      page.getByText(/Die Passwörter stimmen nicht überein/),
    ).toBeVisible();
    await expect(page).toHaveURL("/auth/register");
  });
});
