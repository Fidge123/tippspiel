import { expect, type Page, test as base } from '@playwright/test';
import { password } from '../harness/seed';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://nfl-tippspiel.de/**', (route) => route.abort());
    await use(page);
  },
});

export { expect };

/**
 * The JavaScript-free counterpart of tests/app.ts. There is no access token to
 * read out of localStorage here, and no page.evaluate to read it with, so these
 * helpers drive forms and assert against rendered HTML.
 */
export async function login(
  page: Page,
  user: { email: string },
): Promise<void> {
  await page.goto('./login');
  await page.getByLabel('E-Mail').fill(user.email);
  await page.getByLabel('Passwort').fill(password);
  await page.getByRole('button', { name: 'Einloggen' }).click();
}

/** Opens the header menu, which is a details element rather than a dropdown. */
export async function openMenu(page: Page): Promise<void> {
  await page.locator('summary').click();
}

/** Fails loudly if a page under test ever starts shipping script. */
export async function expectNoScript(page: Page): Promise<void> {
  expect(await page.locator('script').count()).toBe(0);
}
