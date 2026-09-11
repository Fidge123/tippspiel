import { users } from '../harness/seed';
import { expect, expectNoScript, login, test } from './nojs';

test.describe('The rules page, without JavaScript', () => {
  test('renders both sections and opens the examples', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./rules');

    await expect(page.getByRole('heading', { name: 'Regeln' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Reguläre Saison und Playoffs' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Divisions und Superbowl' }),
    ).toBeVisible();
    await expectNoScript(page);

    // The header menu is also a details element, so this stays inside the page.
    const article = page.getByRole('article');
    await article.locator('summary').first().click();
    await expect(article.getByRole('table').first()).toBeVisible();
  });
});
