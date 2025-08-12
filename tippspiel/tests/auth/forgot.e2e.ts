import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { reset } from "../../src/server/db/schema";
import { createTestUser, fillRegisterForm } from "../helpers/auth";
import { cleanupUser, findUserByEmail, verifyUser } from "../helpers/database";

test.describe("Forgot Password Flow", () => {
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

  test("should show forgot password form", async ({ page }) => {
    await page.goto("/auth/forgot");

    await expect(
      page.getByRole("heading", { name: "Passwort zurücksetzen" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Gib deine E-Mail ein, um einen Link zum Zurücksetzen zu erhalten.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("E-Mail-Adresse")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Zurücksetzen" }),
    ).toBeVisible();
    await expect(page.getByText("Zurück zur Anmeldung")).toBeVisible();
  });

  test("should show success message for existing user", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");
    await verifyUser(testUser.email);

    await page.goto("/auth/forgot");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByRole("button", { name: "Zurücksetzen" }).click();

    await expect(
      page.getByText("Link zum Zurücksetzen deines Passworts wurde gesendet."),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Zurücksetzen" }),
    ).toBeDisabled();

    const user = await findUserByEmail(testUser.email);
    expect(user).toBeTruthy();

    if (user) {
      const resetToken = await db.query.reset.findFirst({
        where: eq(reset.userId, user.id),
      });
      expect(resetToken).toBeTruthy();
      expect(resetToken?.token).toBeTruthy();
    }
  });

  test("should show error for unverified user", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");

    await page.goto("/auth/forgot");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByRole("button", { name: "Zurücksetzen" }).click();

    await expect(
      page.getByText(
        "Bitte bestätige zuerst deine E-Mail-Adresse, bevor du dein Passwort zurücksetzt.",
      ),
    ).toBeVisible();
  });

  test("should validate email field", async ({ page }) => {
    await page.goto("/auth/forgot");

    await page.getByLabel("E-Mail-Adresse").fill("invalid-email");
    await page.getByRole("button", { name: "Zurücksetzen" }).click();

    const emailInput = page.getByLabel("E-Mail-Adresse");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("should handle rate limiting", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");
    await verifyUser(testUser.email);

    await page.goto("/auth/forgot");

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByRole("button", { name: "Zurücksetzen" }).click();

    await expect(
      page.getByText("Link zum Zurücksetzen deines Passworts wurde gesendet."),
    ).toBeVisible();

    await page.reload();
    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByRole("button", { name: "Zurücksetzen" }).click();

    await expect(
      page.getByText(
        "Bitte warte 5 Minuten, bevor du eine neue Passwort-Zurücksetzung anforderst.",
      ),
    ).toBeVisible();
  });

  test("should successfully reset password", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");
    await verifyUser(testUser.email);

    const user = await findUserByEmail(testUser.email);
    const resetToken = `test-reset-token-${Date.now()}`;

    const token = await db
      .insert(reset)
      .values({
        token: resetToken,
        userId: user.id,
      })
      .returning();

    if (!token[0]) {
      throw new Error("Failed to create reset token in database");
    }

    await page.goto(`/auth/reset?token=${resetToken}`);

    const newPassword = "newpassword456";
    await page.getByLabel("Neues Passwort").fill(newPassword);
    await page.getByLabel("Passwort bestätigen").fill(newPassword);
    await page.getByRole("button", { name: "Passwort setzen" }).click();

    await expect(page).toHaveURL("/auth/login?message=password-reset-success");
    await expect(
      page.getByText(
        "Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt mit deinem neuen Passwort anmelden.",
      ),
    ).toBeVisible();

    const deletedToken = await db.query.reset.findFirst({
      where: eq(reset.token, resetToken),
    });
    expect(deletedToken).toBeUndefined();

    await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
    await page.getByLabel("Passwort").fill(newPassword);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(testUser.email)).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    await fillRegisterForm(page, testUser);
    await expect(page).toHaveURL("/auth/register/success");
    await verifyUser(testUser.email);

    const user = await findUserByEmail(testUser.email);
    const resetToken = `test-reset-token-${Date.now()}`;

    if (user) {
      await db.insert(reset).values({
        token: resetToken,
        userId: user.id,
      });
    }

    await page.goto(`/auth/reset?token=${resetToken}`);

    await page.getByLabel("Neues Passwort").fill("password123");
    await page.getByLabel("Passwort bestätigen").fill("different123");
    await page.getByRole("button", { name: "Passwort setzen" }).click();
    await expect(
      page.getByText("Die Passwörter stimmen nicht überein."),
    ).toBeVisible();
  });

  test("should access forgot page from login page", async ({ page }) => {
    await page.goto("/auth/login");

    await page.getByText("Passwort vergessen?").click();
    await expect(page).toHaveURL("/auth/forgot");
  });
});
