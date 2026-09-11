import { users } from '../harness/seed';
import { expect, expectNoScript, login, test } from './nojs';

test.describe('Auth, without JavaScript', () => {
  test('logs in through a real form and lands on the app', async ({ page }) => {
    await login(page, users.alice);

    // The SPA takes over after the redirect, which is the strangler window
    // working as intended: the session cookie is what carries across.
    await expect(page).toHaveURL(/\/tippspiel\/$/);
  });

  test('sets a session cookie the browser keeps', async ({ page, context }) => {
    await login(page, users.alice);

    const session = (await context.cookies()).find((c) => c.name === 'session');
    expect(session).toBeDefined();
    expect(session?.httpOnly).toBe(true);
    expect(session?.path).toBe('/tippspiel');
  });

  test('issues the legacy refresh cookie that keeps the SPA alive', async ({
    page,
    context,
  }) => {
    await login(page, users.alice);

    const legacy = (await context.cookies()).find(
      (c) => c.name === 'refreshToken',
    );
    expect(legacy).toBeDefined();
    expect(legacy?.httpOnly).toBe(true);
    expect(legacy?.path).toBe('/');
  });

  test('rejects a wrong password on the page, not in a console', async ({
    page,
  }) => {
    await page.goto('./login');
    await page.getByLabel('E-Mail').fill(users.alice.email);
    await page.getByLabel('Passwort').fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Einloggen' }).click();

    await expect(page.getByText('Ein Fehler ist aufgetreten')).toBeVisible();
    await expectNoScript(page);
  });

  test('logs out through the details menu and revokes the session', async ({
    page,
    context,
  }) => {
    await login(page, users.alice);
    await page.goto('./impressum');

    // details/summary opens natively, which is the whole reason it replaced
    // the SPA's useState dropdown.
    await page.locator('summary').click();
    await page.getByRole('button', { name: 'Ausloggen' }).click();

    await expect(page).toHaveURL(/\/tippspiel\/login$/);
    expect(
      (await context.cookies()).find((c) => c.name === 'session'),
    ).toBeUndefined();
  });

  test('offers the reset request from the login form', async ({ page }) => {
    await page.goto('./login');
    await page.getByLabel('E-Mail').fill(users.alice.email);
    await page.getByRole('button', { name: 'Passwort vergessen?' }).click();

    await expect(
      page.getByText('Link zum Zurücksetzen verschickt'),
    ).toBeVisible();
  });

  test('registers a new account through a real form', async ({ page }) => {
    await page.goto('./register');
    await page.getByLabel('Name').fill('No Script');
    await page.getByLabel('E-Mail').fill('noscript@example.invalid');
    await page.getByLabel('Passwort').fill('tippspiel1234');
    await page.getByRole('button', { name: 'Registrieren' }).click();

    await expect(page.getByText('Erfolgreich registriert')).toBeVisible();
    await expectNoScript(page);
  });

  test('shows the login button when there is no session', async ({ page }) => {
    await page.goto('./impressum');

    await expect(page.getByRole('button', { name: 'Einloggen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ausloggen' })).toHaveCount(
      0,
    );
  });
});
