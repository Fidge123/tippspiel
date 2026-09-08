import { season, users } from '../harness/seed';
import { activeLeague, expect, login, readApi, test } from './app';

interface Standing {
  user: { name: string };
  points: { all: number };
}

test('the leaderboard shows the totals the API reports', async ({
  page,
  request,
}) => {
  await login(page, users.alice);
  await page.getByRole('link', { name: 'Tabelle' }).click();

  const table = page.getByRole('table').first();
  await expect(table).toBeVisible();

  const league = await activeLeague(page, request);
  const standings = await readApi<Standing[]>(
    page,
    request,
    `leaderboard?season=${season}&league=${league}`,
  );

  expect(standings.map((standing) => standing.user.name).sort()).toEqual([
    users.alice.name,
    users.bob.name,
  ]);
  expect(standings.some((standing) => standing.points.all > 0)).toBe(true);
  for (const standing of standings) {
    const row = table.getByRole('row').filter({ hasText: standing.user.name });
    await expect(row.getByRole('cell').last()).toHaveText(
      String(standing.points.all),
    );
  }
});
