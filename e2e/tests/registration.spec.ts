import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { password } from '../harness/seed';
import { expect, test } from './app';

// Registration is throttled and emails are unique, so a rerun needs its own account.
const newUser = {
  name: 'Carla',
  email: `carla-${randomUUID().slice(0, 8)}@example.invalid`,
};

async function verification(
  email: string,
): Promise<{ id: string; token: string }> {
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT "user".id, verify.token FROM "user"
       JOIN verify ON verify."userId" = "user".id WHERE "user".email = $1`,
      [email],
    );
    return rows[0];
  } finally {
    await client.end();
  }
}

test('a new account is registered, verified and logs in', async ({ page }) => {
  await page.goto('./register');
  await page.getByLabel('Name').fill(newUser.name);
  await page.getByLabel('E-Mail').fill(newUser.email);
  await page.getByLabel('Passwort').fill(password);
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await expect(page.getByText('Erfolgreich registriert!')).toBeVisible();

  // The Hono verify page confirms on submit rather than on load: an emailed
  // link cannot run a useEffect when there is no JavaScript.
  const { id, token } = await verification(newUser.email);
  await page.goto(`./verify?id=${id}&token=${token}`);
  await page.getByRole('button', { name: 'Account bestätigen' }).click();
  await expect(page.getByText('erfolgreich bestätigt')).toBeVisible();

  await page.goto('./login');
  await page.getByLabel('E-Mail').fill(newUser.email);
  await page.getByLabel('Passwort').fill(password);
  await page.getByRole('button', { name: 'Einloggen' }).click();

  await expect(page.getByRole('link', { name: 'Tabelle' })).toBeVisible();
});
