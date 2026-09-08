import { apiPrefix } from '../harness/ports';
import { games, season, teams, users, weeks } from '../harness/seed';
import { activeLeague, expect, login, matchup, readApi, test } from './app';

interface ApiBet {
  id: string;
  selected?: string;
  points?: number;
}

test('a bet on an upcoming game survives a reload', async ({
  page,
  request,
}) => {
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

  // The markup shows the picked team by colour alone, so the API has the answer.
  const league = await activeLeague(page, request);
  const bets = await readApi<ApiBet[]>(
    page,
    request,
    `bet?season=${season}&league=${league}`,
  );
  expect(bets).toContainEqual(
    expect.objectContaining({
      id: games.upcomingFirst.id,
      selected: 'away',
      points: 3,
    }),
  );
});
