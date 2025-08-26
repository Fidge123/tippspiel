import { expect, test } from "@playwright/test";
import { createTestUser, fillLoginForm, type TestUser } from "../helpers/auth";
import {
  cleanupLeague,
  cleanupUser,
  createUser,
  findUserByEmail,
  verifyUser,
} from "../helpers/database";

test.describe("Default League Functionality", () => {
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

  test("Set default league from league detail page", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const leagueName = `Test League ${testUser.email}`;
    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();
    await page.locator(`li p:text("${leagueName}")`).click();
    await expect(page).toHaveURL(/.*\/leagues\/[a-z0-9-]{8,}/);

    await page
      .getByRole("button", { name: "Als Standard-Liga festlegen" })
      .click();

    await expect(
      page.getByText(`${leagueName} ist deine Standard-Liga`),
    ).toBeVisible();

    const settings = (await findUserByEmail(testUser.email)).settings as {
      defaultLeague: string;
    };
    expect(settings).toHaveProperty("defaultLeague");
    expect(settings.defaultLeague).toBeDefined();
    expect(page.url()).toContain(settings.defaultLeague);

    await page.getByRole("link", { name: "Zurück zur Übersicht" }).click();
    await expect(
      page.getByText(`${leagueName} ist deine Standard-Liga`),
    ).toBeVisible();

    await page.goto("/account");
    await expect(page.getByText(leagueName)).toBeVisible();
    await expect(page.getByTitle("Standard-Liga ändern")).toBeVisible();
  });

  test("No default league shown when none is set", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    await expect(
      page.getByText("Keine Standard-Liga ausgewählt"),
    ).toBeVisible();
    await expect(page.getByTitle("Standard-Liga ändern")).toBeVisible();
  });

  test("Leagues page shows no default when none is set", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const leagueName = `Test League ${testUser.email}`;
    await page.getByLabel("Neue Liga erstellen").fill(leagueName);
    await page.getByRole("button", { name: "Erstellen" }).click();

    await expect(
      page.getByText("Keine Standard-Liga ausgewählt"),
    ).toBeVisible();
  });

  test("Link from account page to leagues page works", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    await page.goto("/account");

    await page.getByTitle("Standard-Liga ändern").click();
    await expect(page).toHaveURL("/leagues");
  });

  test("Multiple leagues - set different as default", async ({ page }) => {
    await fillLoginForm(page, testUser);
    await expect(page).toHaveURL("/leagues");

    const testLeagueName1 = `Test League 1 ${testUser.email}`;
    await page.getByLabel("Neue Liga erstellen").fill(testLeagueName1);
    await page.getByRole("button", { name: "Erstellen" }).click();

    const testLeagueName2 = `Test League 2 ${testUser.email}`;
    await page.getByLabel("Neue Liga erstellen").fill(testLeagueName2);
    await page.getByRole("button", { name: "Erstellen" }).click();

    await page
      .getByRole("link", { name: `Zur Liga ${testLeagueName1}` })
      .click();
    await page
      .getByRole("button", { name: "Als Standard-Liga festlegen" })
      .click();

    await page.getByRole("link", { name: "Zurück zur Übersicht" }).click();
    await expect(page.locator(`span:text("${testLeagueName1}")`)).toBeVisible();

    await page
      .getByRole("link", { name: `Zur Liga ${testLeagueName2}` })
      .click();
    await page
      .getByRole("button", { name: "Als Standard-Liga festlegen" })
      .click();

    await page.getByRole("link", { name: "Zurück zur Übersicht" }).click();
    await expect(page.locator(`span:text("${testLeagueName2}")`)).toBeVisible();

    await page
      .getByRole("link", { name: `Zur Liga ${testLeagueName1}` })
      .click();
    await expect(
      page.getByRole("button", { name: "Als Standard-Liga festlegen" }),
    ).toBeVisible();
  });
});
