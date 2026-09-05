import { apiPrefix } from '../harness/ports';
import { scores, teams, users, weeks } from '../harness/seed';
import { expect, login, matchup, test, week } from './app';

const [, homeScore] = scores.finishedFirst;

test('hiding the scores of a week survives a reload', async ({ page }) => {
  await login(page, users.alice);

  const toggle = week(page, weeks.finished.label).getByRole('button', {
    name: 'Spoilerschutz',
  });
  const game = matchup(page, weeks.finished.label, teams.bengals.name);
  await expect(toggle).toHaveText('Spoilerschutz an');
  await expect(game).not.toContainText(String(homeScore));

  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith(`${apiPrefix}/user/hidden`) &&
      response.request().method() === 'POST',
  );
  await toggle.click();
  expect((await saved).ok()).toBe(true);
  await expect(toggle).toHaveText('Spoilerschutz aus');
  await expect(game).toContainText(String(homeScore));

  await page.reload();

  await expect(toggle).toHaveText('Spoilerschutz aus');
  await expect(game).toContainText(String(homeScore));
});
