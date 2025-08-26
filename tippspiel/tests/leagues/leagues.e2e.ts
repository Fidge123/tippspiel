import { expect, test } from "@playwright/test";
import { createTestUser, fillLoginForm, type TestUser } from "../helpers/auth";
import {
  cleanupLeague,
  cleanupUser,
  createUser,
  verifyUser,
} from "../helpers/database";

test.describe("Leagues Page", () => {
  let testUser: TestUser;

  test.beforeEach(async () => {
    testUser = createTestUser();
    await createUser(testUser);
    await verifyUser(testUser.email);
  });

  test.afterEach(async () => {
    await cleanupLeague(testUser.email);
    await cleanupUser(testUser.email);
  });

  test("Show leagues", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await expect(
      page.getByText("Du bist aktuell in keiner Liga."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Neue Liga erstellen" }),
    ).toBeVisible();
  });

  test("Create league", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const leagueName = `Test Liga von ${testUser.email}`;

    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();
    await expect(page.locator(`li p:text("${leagueName}")`)).toBeVisible();
    await expect(page.locator(`li p:text("${testUser.name}")`)).toBeVisible();
  });

  test("Rename league", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const leagueName = `Test Liga von ${testUser.email}`;
    const newLeagueName = `Neue Liga von ${testUser.email}`;

    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();
    await page.locator(`li p:text("${leagueName}")`).click();
    await expect(page).toHaveURL(/.*\/leagues\/[a-z0-9-]{8,}/);

    await page.getByLabel("Liga-Name").fill(newLeagueName);
    await page.getByRole("button", { name: "Umbenennen" }).click();
    await page.getByText("Zurück zur Übersicht").click();
    await expect(page.getByText(newLeagueName)).toBeVisible();
  });

  test("Delete league", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const leagueName = `Test Liga von ${testUser.email}`;

    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();
    await page.locator(`li p:text("${leagueName}")`).click();
    await expect(page).toHaveURL(/.*\/leagues\/[a-z0-9-]{8,}/);

    await page.getByRole("button", { name: "Löschen" }).click();

    await expect(
      page.getByText("Du bist aktuell in keiner Liga."),
    ).toBeVisible();
    await expect(page).toHaveURL(/.*\/leagues$/);
  });

  test("Handle members of a league", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const user2 = createTestUser();
    user2.name = "Test User 2";
    await createUser(user2);

    const leagueName = `Test Liga von ${testUser.email}`;

    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();
    await page.locator(`li p:text("${leagueName}")`).click();
    await expect(page).toHaveURL(/.*\/leagues\/[a-z0-9-]{8,}/);

    await page.getByLabel("Mitglied hinzufügen").fill(user2.email);
    await page.getByTitle("Hinzufügen").click();

    await expect(page.getByText(user2.name)).toBeVisible();
    await expect(page.getByText("Verlassen")).toBeDisabled();
    await page.getByText("Zum Admin machen").click();
    await expect(page.getByText(`${user2.name} (Admin)`)).toBeVisible();
    await expect(page.getByText("Verlassen")).not.toBeDisabled();
    await page.getByText("Admin-Rechte entziehen").click();
    await expect(page.getByText("Zum Admin machen")).toBeVisible();
    await expect(page.getByText("Verlassen")).toBeDisabled();
    await page.getByText("Entfernen").click();
    await expect(page.getByText("Verlassen")).not.toBeVisible();
    await expect(page.getByText("Löschen")).toBeVisible();
    await cleanupUser(user2.email);
  });
});
