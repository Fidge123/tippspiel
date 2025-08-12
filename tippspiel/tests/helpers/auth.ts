import type { Page } from "@playwright/test";

export interface TestUser {
  email: string;
  name: string;
  password: string;
}

export function createTestUser(domain = "example.com"): TestUser {
  return {
    email: `test-user-${Date.now() % 10000}-${Math.random().toString(36).slice(2, 6)}@${domain}`,
    name: "Test User",
    password: "testpassword123",
  };
}

export async function fillRegisterForm(
  page: Page,
  testUser: TestUser,
  submit = true,
) {
  await page.goto("/auth/register");

  await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
  await page.getByLabel("Nutzername").fill(testUser.name);
  await page.getByLabel("Passwort", { exact: true }).fill(testUser.password);
  await page.getByLabel("Passwort bestätigen").fill(testUser.password);
  await page
    .getByRole("checkbox", { name: /Nutzungs- und Datenschutzbestimmungen/ })
    .check();

  if (submit) {
    await page.getByRole("button", { name: "Konto erstellen" }).click();
  }
}

export async function fillLoginForm(page: Page, testUser: TestUser) {
  await page.goto("/auth/login");
  await page.getByLabel("E-Mail-Adresse").fill(testUser.email);
  await page.getByLabel("Passwort").fill(testUser.password);

  await page.locator('form button[type="submit"]').click();
}
