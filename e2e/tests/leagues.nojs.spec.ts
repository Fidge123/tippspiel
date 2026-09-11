import { league, users } from '../harness/seed';
import { expect, expectNoScript, login, test } from './nojs';

function row(page: import('@playwright/test').Page, name: string) {
  return page.getByRole('row').filter({ hasText: name });
}

test.describe('League administration, without JavaScript', () => {
  test('lists the league and its members', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leagues');

    const liga = row(page, league);
    await expect(liga).toContainText(users.alice.name);
    await expect(liga).toContainText(users.bob.name);
    await expectNoScript(page);
  });

  test('creates a league and shows it', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leagues');

    await page.getByLabel('Name der Liga').fill('Zweite Liga');
    await page.getByRole('button', { name: 'Erstellen' }).click();

    await expect(row(page, 'Zweite Liga')).toBeVisible();
    await expect(row(page, 'Zweite Liga')).toContainText(
      `${users.alice.name} (Admin)`,
    );
  });

  test('refuses a name under three characters', async ({ page }) => {
    await login(page, users.alice);

    const response = await page.request.post('./leagues/create', {
      form: { name: 'ab' },
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('mindestens 3 Zeichen');
  });

  test('promotes and demotes a member', async ({ page }) => {
    await login(page, users.alice);
    await page.goto('./leagues');

    const liga = row(page, league);
    await liga
      .locator('form')
      .filter({ hasText: 'Promote' })
      .getByRole('button', { name: 'Promote' })
      .click();

    await expect(row(page, league)).toContainText(`${users.bob.name} (Admin)`);

    await row(page, league)
      .locator('form')
      .filter({ hasText: 'Demote' })
      .last()
      .getByRole('button', { name: 'Demote' })
      .click();

    await expect(row(page, league)).not.toContainText(
      `${users.bob.name} (Admin)`,
    );
  });

  test('refuses to delete a league when the name does not match', async ({
    page,
  }) => {
    await login(page, users.alice);
    await page.goto('./leagues');

    // Other specs create leagues in the same shared database, so everything
    // here is scoped to the seeded one.
    const liga = row(page, league);
    await liga.locator('summary').filter({ hasText: 'Anpassen' }).click();
    await liga.getByLabel('Zum Löschen den Namen eingeben').fill('falsch');
    await liga.getByRole('button', { name: 'Löschen' }).click();

    await expect(page.getByText('Der Name stimmt nicht')).toBeVisible();
    await expect(row(page, league)).toBeVisible();
  });

  test('offers a plain member no administration controls', async ({ page }) => {
    await login(page, users.bob);
    await page.goto('./leagues');

    const liga = row(page, league);
    await expect(liga).toContainText(users.alice.name);
    await expect(liga.getByRole('button', { name: 'Promote' })).toHaveCount(0);
    await expect(liga.getByRole('button', { name: 'Kick' })).toHaveCount(0);
    await expect(liga.locator('summary')).toHaveCount(0);
  });
});
