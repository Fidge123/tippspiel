import { expect, test } from "@playwright/test";
import { createTestUser, fillLoginForm, type TestUser } from "../helpers/auth";
import {
  cleanupUser,
  createUser,
  findUserByEmail,
  verifyUser,
} from "../helpers/database";

test.describe("Account Page", () => {
  let testUser: TestUser;

  test.beforeEach(async () => {
    testUser = createTestUser();
    await createUser(testUser);
    await verifyUser(testUser.email);
  });

  test.afterEach(async () => {
    await cleanupUser(testUser.email);
  });

  test("Show account info", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");
    await expect(page.getByText(testUser.email)).toBeVisible();
    await expect(page.getByText(testUser.name)).toBeVisible();
    await expect(page.getByText(testUser.password)).not.toBeVisible();
  });

  test("Change email", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    const newMail = `new-${testUser.email}`;

    await expect(page.getByTitle("E-Mail-Adresse ändern")).toBeVisible();
    await page.getByTitle("E-Mail-Adresse ändern").click();
    await page.getByLabel("E-Mail-Adresse", { exact: true }).fill(newMail);
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("erfolgreich")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    await expect(page.getByText(newMail)).toBeVisible();
    expect((await findUserByEmail(newMail)).email).toBe(newMail);
    await expect(
      page.locator('tr:has(th:text("Verifiziert:")) > td:text("Nein")'),
    ).toBeVisible();

    await page.getByTitle("E-Mail-Adresse ändern").click();
    await expect(
      page.getByLabel("E-Mail-Adresse", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("E-Mail-Adresse", { exact: true })
      .fill(testUser.email);
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("erfolgreich")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    await expect(page.getByText(testUser.email)).toBeVisible();
    await verifyUser(testUser.email);
    await page.reload();
    await expect(
      page.locator('tr:has(th:text("Verifiziert:")) > td:text("Ja")'),
    ).toBeVisible();
  });

  test("Change name", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    const newName = `new-${testUser.name}`;

    await expect(page.getByTitle("Nutzername ändern")).toBeVisible();
    await page.getByTitle("Nutzername ändern").click();
    await page.getByLabel("Nutzername", { exact: true }).fill(newName);
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("erfolgreich")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    await expect(page.getByText(newName)).toBeVisible();
    expect((await findUserByEmail(testUser.email)).name).toBe(newName);
  });

  test("Change password", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    const pw = "blablabla";

    await expect(page.getByTitle("Passwort ändern")).toBeVisible();
    await page.getByTitle("Passwort ändern").click();
    await page
      .getByLabel("Altes Passwort", { exact: true })
      .fill(testUser.password);
    await page.getByLabel("Neues Passwort", { exact: true }).fill(pw);
    await page
      .getByLabel("Neues Passwort bestätigen", { exact: true })
      .fill(pw);
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("erfolgreich")).toBeVisible();
    await expect(page).toHaveURL("/auth/login");

    await fillLoginForm(page, { ...testUser, password: pw });
    await expect(page).toHaveURL("/leagues");
    await page.goto("/account");
    await expect(page).toHaveURL("/account");
  });

  test("Change password with wrong old pw", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    const pw = "blablabla";

    await expect(page.getByTitle("Passwort ändern")).toBeVisible();
    await page.getByTitle("Passwort ändern").click();
    await page.getByLabel("Altes Passwort", { exact: true }).fill(pw);
    await page.getByLabel("Neues Passwort", { exact: true }).fill(pw);
    await page
      .getByLabel("Neues Passwort bestätigen", { exact: true })
      .fill(pw);
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("altes Passwort ist falsch")).toBeVisible();
    await expect(
      page.getByLabel("Altes Passwort", { exact: true }),
    ).toHaveAttribute("data-invalid");
  });

  test("Change password without matching pws", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    await expect(page.getByTitle("Passwort ändern")).toBeVisible();
    await page.getByTitle("Passwort ändern").click();
    await page
      .getByLabel("Altes Passwort", { exact: true })
      .fill(testUser.password);
    await page.getByLabel("Neues Passwort", { exact: true }).fill("blablabla");
    await page.getByLabel("Neues Passwort bestätigen").fill("blabliblub");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("übereinstimmen")).toBeVisible();
    await expect(page.getByLabel("Neues Passwort bestätigen")).toHaveAttribute(
      "data-invalid",
    );
  });

  test("Set spoiler mode", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    await page.getByLabel("Spoilermodus").click();
    await expect(page.getByLabel("Spoilermodus")).toBeChecked();
    let settings = (await findUserByEmail(testUser.email)).settings as {
      hideScore: boolean;
    };
    expect(settings).toHaveProperty("hideScore");
    expect(settings.hideScore).toBe(true);

    await page.getByLabel("Spoilermodus").click();
    await expect(page.getByLabel("Spoilermodus")).not.toBeChecked();
    settings = (await findUserByEmail(testUser.email)).settings as {
      hideScore: boolean;
    };
    expect(settings).toHaveProperty("hideScore");
    expect(settings.hideScore).toBe(false);
  });

  test("Set reminders", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    await page.getByLabel("Erinnerung").click();
    await expect(page.getByLabel("Erinnerung")).toBeChecked();
    let settings = (await findUserByEmail(testUser.email)).settings as {
      reminders: boolean;
    };
    expect(settings).toHaveProperty("reminders");
    expect(settings.reminders).toBe(true);

    await page.getByLabel("Erinnerung").click();
    await expect(page.getByLabel("Erinnerung")).not.toBeChecked();
    settings = (await findUserByEmail(testUser.email)).settings as {
      reminders: boolean;
    };
    expect(settings).toHaveProperty("reminders");
    expect(settings.reminders).toBe(false);
  });
});
