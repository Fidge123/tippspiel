import { users } from '../harness/seed';
import { expect, login, test } from './app';

test('the leaderboard lists every member of the league with a total', async ({
  page,
}) => {
  await login(page, users.alice);
  await page.getByRole('link', { name: 'Tabelle' }).click();

  const table = page.getByRole('table').first();
  await expect(table).toBeVisible();

  for (const user of [users.alice, users.bob]) {
    const row = table.getByRole('row').filter({ hasText: user.name });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').last()).toHaveText(/^-?\d+$/);
  }
});
