import {
  expect,
  type Locator,
  type Page,
  test as base,
} from '@playwright/test';
import { password } from '../harness/seed';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://nfl-tippspiel.de/**', (route) => route.abort());
    await use(page);
  },
});

export { expect };

export async function login(
  page: Page,
  user: { email: string },
): Promise<void> {
  await page.goto('./login');
  await page.getByLabel('E-Mail').fill(user.email);
  await page.getByLabel('Passwort').fill(password);
  await page.getByRole('button', { name: 'Einloggen' }).click();
}

/** The radios are sr-only, so the label is the clickable target. */
export function pick(scope: Locator, name: string | RegExp): Locator {
  return scope.locator('label').filter({ hasText: name });
}

/** The doubler label shows only a symbol, so it is found by its title. */
export function doublerToggle(scope: Locator): Locator {
  return scope.locator('label[title="Doppler"]');
}

export async function openMenu(page: Page): Promise<void> {
  await page.locator('summary').click();
}

export async function expectNoScript(page: Page): Promise<void> {
  expect(await page.locator('script').count()).toBe(0);
}
