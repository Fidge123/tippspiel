import {
  type APIRequestContext,
  expect,
  type Locator,
  type Page,
  test as base,
} from '@playwright/test';
import { apiPrefix } from '../harness/ports';
import { password } from '../harness/seed';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://nfl-tippspiel.de/**', (route) => route.abort());
    await use(page);
  },
});

export { expect };

// /login belongs to the Hono app from 2/6, so this submits its form and then
// waits for the SPA to trade the refresh cookie for an access token.
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

const tokens = new WeakMap<Page, Promise<string>>();

/**
 * Trades the refresh cookie for an access token, which is what the SPA does and
 * what the bridge in #87 exists for. It replaced reading localStorage, because
 * the pages that used to fill it have moved to the Hono app.
 *
 * Cached per page because the Nest app answers by rewriting the cookie with
 * Secure set, and Playwright's request context will not send that back over
 * plain http, so only the first exchange in a test can succeed.
 */
export function apiToken(page: Page): Promise<string> {
  const cached = tokens.get(page);
  if (cached) {
    return cached;
  }
  const fresh = exchange(page);
  tokens.set(page, fresh);
  return fresh;
}

async function exchange(page: Page): Promise<string> {
  const response = await page.request.post(`${apiPrefix}/user/refresh`);
  if (!response.ok()) {
    throw new Error(
      `POST user/refresh answered ${response.status()}: ${await response.text()}`,
    );
  }
  return response.json();
}

export async function readApi<T>(
  page: Page,
  _request: APIRequestContext,
  path: string,
): Promise<T> {
  const token = await apiToken(page);
  const response = await page.request.get(`${apiPrefix}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBe(true);
  return response.json();
}

export async function activeLeague(
  page: Page,
  request: APIRequestContext,
): Promise<string> {
  const leagues = await readApi<{ id: string }[]>(page, request, 'leagues');
  return leagues[0].id;
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
