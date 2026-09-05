import { apiPrefix } from '../harness/ports';
import { season, users } from '../harness/seed';
import { expect, login, test } from './app';

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

  const token = await page.evaluate(() =>
    window.localStorage.getItem('access_token'),
  );
  const auth = { Authorization: `Bearer ${token}` };
  const leagues = await request
    .get(`${apiPrefix}/leagues`, { headers: auth })
    .then((response) => response.json());
  const standings: Standing[] = await request
    .get(`${apiPrefix}/leaderboard?season=${season}&league=${leagues[0].id}`, {
      headers: auth,
    })
    .then((response) => response.json());

  expect(standings.map((standing) => standing.user.name).sort()).toEqual([
    users.alice.name,
    users.bob.name,
  ]);
  for (const standing of standings) {
    const row = table.getByRole('row').filter({ hasText: standing.user.name });
    await expect(row.getByRole('cell').last()).toHaveText(
      String(standing.points.all),
    );
  }
});
