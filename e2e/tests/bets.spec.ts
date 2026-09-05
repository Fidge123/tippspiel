import { apiPrefix } from '../harness/ports';
import { teams, users, weeks } from '../harness/seed';
import { expect, login, matchup, test } from './app';

test('a bet on an upcoming game survives a reload', async ({ page }) => {
  await login(page, users.alice);

  const game = matchup(page, weeks.upcoming.label, teams.ravens.name);
  const points = game.getByRole('textbox');
  await expect(game).toBeVisible();

  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith(`${apiPrefix}/bet`) &&
      response.request().method() === 'POST',
  );
  await game.getByRole('button', { name: teams.ravens.name }).click();
  await points.fill('3');
  await points.blur();
  expect((await saved).ok()).toBe(true);

  await page.reload();

  await expect(points).toHaveValue('3');
  await expect(points).toBeEnabled();
});
