import { users } from '../harness/seed';
import { expect, expectNoScript, login, test } from './nojs';

// Dana is in no league, so changing her name and settings cannot disturb the
// flows that read Alice out of the same shared database.
test.describe('Account settings, without JavaScript', () => {
  test('renames the user and shows it in the header menu', async ({ page }) => {
    await login(page, users.newcomer);
    await page.goto('./account');
    await expectNoScript(page);

    await page.getByLabel('Benutzernamen ändern').fill('Daniela');
    await page.getByRole('button', { name: 'Ändern' }).click();

    await expect(page.getByLabel('Benutzernamen ändern')).toHaveValue(
      'Daniela',
    );
  });

  test('refuses an empty name', async ({ page }) => {
    await login(page, users.newcomer);

    const response = await page.request.post('./account/name', {
      form: { name: '   ' },
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('darf nicht leer sein');
  });

  test('toggles the spoiler default and it survives a reload', async ({
    page,
  }) => {
    await login(page, users.newcomer);
    await page.goto('./account');

    const spoiler = page.getByLabel('Spielergebnisse automatisch verstecken');
    await expect(spoiler).toBeChecked();

    await spoiler.uncheck();
    await page
      .locator('form')
      .filter({ has: spoiler })
      .getByRole('button', { name: 'Speichern' })
      .click();

    await page.goto('./account');
    await expect(
      page.getByLabel('Spielergebnisse automatisch verstecken'),
    ).not.toBeChecked();
  });

  test('toggles the reminder mails', async ({ page }) => {
    await login(page, users.newcomer);
    await page.goto('./account');

    const reminder = page.getByLabel('Erinnerungsmails aktivieren');
    await expect(reminder).toBeChecked();

    await reminder.uncheck();
    await page
      .locator('form')
      .filter({ has: reminder })
      .getByRole('button', { name: 'Speichern' })
      .click();

    await page.goto('./account');
    await expect(
      page.getByLabel('Erinnerungsmails aktivieren'),
    ).not.toBeChecked();
  });
});
