import { games, scores, users, weeks } from '../harness/seed';
import { expect, login, test } from './nojs';

const [, homeScore] = scores.finishedFirst;

function week(page: import('@playwright/test').Page, id: string) {
  return page.locator(`[id="week-${id}"]`);
}

test.describe('Spoiler protection, without JavaScript', () => {
  test('is on by default and survives being turned off', async ({ page }) => {
    await login(page, users.alice);

    const finished = week(page, weeks.finished.id);
    const game = page.locator(`[id="game-${games.finishedFirst.id}"]`);

    await expect(
      finished.getByRole('button', { name: /Spoilerschutz/ }),
    ).toHaveText('Spoilerschutz an');
    await expect(game).not.toContainText(String(homeScore));

    await finished.getByRole('button', { name: /Spoilerschutz/ }).click();

    await expect(
      week(page, weeks.finished.id).getByRole('button', {
        name: /Spoilerschutz/,
      }),
    ).toHaveText('Spoilerschutz aus');
    await expect(
      page.locator(`[id="game-${games.finishedFirst.id}"]`),
    ).toContainText(String(homeScore));

    await page.goto('./');

    await expect(
      week(page, weeks.finished.id).getByRole('button', {
        name: /Spoilerschutz/,
      }),
    ).toHaveText('Spoilerschutz aus');
    await expect(
      page.locator(`[id="game-${games.finishedFirst.id}"]`),
    ).toContainText(String(homeScore));
  });

  test('offers no toggle on a week that has not started', async ({ page }) => {
    await login(page, users.alice);

    await expect(
      week(page, weeks.upcoming.id).getByRole('button', {
        name: /Spoilerschutz/,
      }),
    ).toHaveCount(0);
  });
});
