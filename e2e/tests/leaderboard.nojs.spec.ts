import { users } from '../harness/seed';
import { expect, expectNoScript, login, test } from './nojs';

test.describe('The leaderboard, without JavaScript', () => {
  test('renders the standings table', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leaderboard');

    await expect(
      page.getByRole('heading', { name: 'Punktetabelle' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: users.alice.name }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: users.bob.name }),
    ).toBeVisible();
    await expectNoScript(page);
  });

  test('opens the statistics sections without script', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leaderboard');

    // details/summary, so the content is in the document and the browser
    // toggles it natively.
    const stake = page.locator('summary').filter({ hasText: 'Einsatz' });
    await expect(stake).toBeVisible();

    await stake.click();
    const section = page.getByRole('group').filter({ hasText: 'Einsatz' });
    await expect(section.getByRole('table')).toBeVisible();
    await expect(section.getByText('Bonus', { exact: true })).toBeVisible();
  });

  test('shows the division section', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leaderboard');

    await expect(
      page.getByRole('heading', { name: 'Pre-Season Tipps' }),
    ).toBeVisible();
    await page.locator('summary').filter({ hasText: 'Divisions' }).click();
    const section = page.getByRole('group').filter({ hasText: 'Divisions' });
    await expect(section.getByRole('table')).toBeVisible();
    await expect(section.getByText('AFC North', { exact: true })).toBeVisible();
  });
});
