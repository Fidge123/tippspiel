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
  await expect(page.getByRole('link', { name: 'Tabelle' })).toBeVisible();
}

export function week(page: Page, label: string): Locator {
  return page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: label, exact: true }) });
}

export function matchup(page: Page, weekLabel: string, team: string): Locator {
  return week(page, weekLabel)
    .getByRole('button', { name: team })
    .locator('..');
}
