import type { Response } from '@playwright/test';
import { apiPrefix } from '../harness/ports';
import { teams, users, weeks } from '../harness/seed';
import { expect, login, matchup, test, week } from './app';

const doubler = '🌟';
const empty = '@';

function doublerCall(method: string) {
  return (response: Response) =>
    response.url().endsWith(`${apiPrefix}/bet/doubler`) &&
    response.request().method() === method;
}

test('a doubler can be set, moved and removed', async ({ page }) => {
  await login(page, users.alice);

  const first = matchup(page, weeks.upcoming.label, teams.ravens.name);
  const second = matchup(page, weeks.upcoming.label, teams.bengals.name);
  await expect(first).toBeVisible();

  const set = page.waitForResponse(doublerCall('POST'));
  await first.getByRole('button', { name: empty }).click();
  expect((await set).ok()).toBe(true);
  await expect(first.getByRole('button', { name: doubler })).toBeVisible();

  const moved = page.waitForResponse(doublerCall('POST'));
  await second.getByRole('button', { name: empty }).click();
  expect((await moved).ok()).toBe(true);
  await expect(second.getByRole('button', { name: doubler })).toBeVisible();
  await expect(first.getByRole('button', { name: empty })).toBeVisible();

  const removed = page.waitForResponse(doublerCall('DELETE'));
  await second.getByRole('button', { name: doubler }).click();
  expect((await removed).ok()).toBe(true);

  await page.reload();

  await expect(
    week(page, weeks.upcoming.label).getByRole('button', { name: doubler }),
  ).toHaveCount(0);
});
