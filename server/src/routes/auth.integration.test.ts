import { env } from 'node:process';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;
env.REFRESH_SECRET = 'refresh-secret-for-tests';
env.COOKIE_SECRET = 'cookie-secret-for-tests';
env.INSECURE_COOKIES = 'true';

const { app } = await import('../app');
const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { resetRateLimits } = await import('../auth/rateLimit');
const { hash, newSalt } = await import('../auth/password');

const BASE = '/tippspiel';
const PASSWORD = 'a-good-enough-password';

async function insertUser(
  email: string,
  { verified } = { verified: true },
): Promise<string> {
  const salt = newSalt();
  const row = await db()
    .insertInto('user')
    .values({
      email,
      name: 'Testnutzer',
      salt: salt.toString('hex'),
      password: (await hash(PASSWORD, salt)).toString('hex'),
      settings: JSON.stringify({}),
      consentedAt: new Date(),
      verified,
    })
    .returning('id')
    .executeTakeFirstOrThrow();

  return row.id;
}

function form(fields: Record<string, string>): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  };
}

function cookiesFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
}

beforeAll(createSchema);
beforeEach(async () => {
  await truncate();
  resetRateLimits();
});
afterAll(closeDatabase);

describe('login', () => {
  it('creates a session row and redirects with 303', async () => {
    await insertUser('player@example.com');

    const response = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/`);

    const sessions = await db().selectFrom('session').selectAll().execute();
    expect(sessions).toHaveLength(1);
  });

  it('sets an HttpOnly session cookie scoped to the base path', async () => {
    await insertUser('player@example.com');

    const response = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );
    const session = response.headers
      .getSetCookie()
      .find((c) => c.startsWith('session='));

    expect(session).toContain('HttpOnly');
    expect(session).toContain('SameSite=Lax');
    expect(session).toContain(`Path=${BASE}`);
  });

  it('rejects a wrong password with 401 and no session', async () => {
    await insertUser('player@example.com');

    const response = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: 'not-the-password' }),
    );

    expect(response.status).toBe(401);
    expect(await db().selectFrom('session').selectAll().execute()).toEqual([]);
  });

  it('refuses a user who has not verified yet', async () => {
    await insertUser('unverified@example.com', { verified: false });

    const response = await app.request(
      `${BASE}/login`,
      form({ email: 'unverified@example.com', password: PASSWORD }),
    );

    expect(response.status).toBe(401);
  });

  it('rate limits after ten attempts in a minute', async () => {
    const attempt = () =>
      app.request(`${BASE}/login`, {
        ...form({ email: 'nobody@example.com', password: PASSWORD }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-forwarded-for': '203.0.113.7',
        },
      });

    for (let i = 0; i < 10; i++) {
      expect((await attempt()).status).toBe(401);
    }
    expect((await attempt()).status).toBe(429);
  });
});

describe('the SPA bridge', () => {
  it('issues a refreshToken the Nest app can verify', async () => {
    const id = await insertUser('player@example.com');

    const response = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );
    const legacy = response.headers
      .getSetCookie()
      .find((c) => c.startsWith('refreshToken='));

    expect(legacy).toBeDefined();
    expect(legacy).toContain('Path=/');
    expect(legacy).toContain('HttpOnly');

    // Verified with jsonwebtoken, the library @nestjs/jwt wraps, rather than
    // with Hono's own verifier: the point is that the other stack accepts it.
    const token = legacy!.slice('refreshToken='.length).split(';')[0];
    const payload = jwt.verify(token, 'refresh-secret-for-tests', {
      algorithms: ['HS256'],
    });

    expect(payload).toMatchObject({
      id,
      name: 'Testnutzer',
      email: 'player@example.com',
    });
  });
});

describe('logout', () => {
  it('deletes the session row rather than only the cookie', async () => {
    await insertUser('player@example.com');
    const login = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );

    const response = await app.request(`${BASE}/logout`, {
      method: 'POST',
      headers: { cookie: cookiesFrom(login) },
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/login`);
    expect(await db().selectFrom('session').selectAll().execute()).toEqual([]);
  });
});

describe('the session-aware header', () => {
  it('shows the logged-in nav once a session exists', async () => {
    await insertUser('player@example.com');
    const login = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );

    const html = await (
      await app.request(`${BASE}/impressum`, {
        headers: { cookie: cookiesFrom(login) },
      })
    ).text();

    expect(html).toContain('Tabelle');
    expect(html).toContain('Ausloggen');
    expect(html).not.toContain('Einloggen');
  });

  it('shows the login button without one', async () => {
    const html = await (await app.request(`${BASE}/impressum`)).text();

    expect(html).toContain('Einloggen');
    expect(html).not.toContain('Ausloggen');
  });
});

describe('register', () => {
  it('stores an unverified user with a verify token', async () => {
    const response = await app.request(
      `${BASE}/register`,
      form({
        name: 'Neuer Nutzer',
        email: 'new@example.com',
        password: PASSWORD,
      }),
    );

    expect(response.status).toBe(200);

    const user = await db()
      .selectFrom('user')
      .select(['id', 'verified'])
      .executeTakeFirstOrThrow();
    expect(user.verified).toBe(false);

    const tokens = await db().selectFrom('verify').selectAll().execute();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].userId).toBe(user.id);
  });

  it('refuses a duplicate email with 409 and writes nothing', async () => {
    await insertUser('taken@example.com');

    const response = await app.request(
      `${BASE}/register`,
      form({ name: 'Zweiter', email: 'taken@example.com', password: PASSWORD }),
    );

    expect(response.status).toBe(409);
    expect(await db().selectFrom('verify').selectAll().execute()).toEqual([]);
  });

  it('refuses a password under eight characters', async () => {
    const response = await app.request(
      `${BASE}/register`,
      form({ name: 'Kurz', email: 'short@example.com', password: 'seven77' }),
    );

    expect(response.status).toBe(400);
    expect(await db().selectFrom('user').selectAll().execute()).toEqual([]);
  });
});

describe('verify', () => {
  it('marks the user verified and consumes the token', async () => {
    await app.request(
      `${BASE}/register`,
      form({ name: 'Neu', email: 'new@example.com', password: PASSWORD }),
    );
    const { userId, token } = await db()
      .selectFrom('verify')
      .select(['userId', 'token'])
      .executeTakeFirstOrThrow();

    const response = await app.request(
      `${BASE}/verify`,
      form({ id: userId!, token }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('erfolgreich bestätigt');

    const user = await db()
      .selectFrom('user')
      .select('verified')
      .executeTakeFirstOrThrow();
    expect(user.verified).toBe(true);
    expect(await db().selectFrom('verify').selectAll().execute()).toEqual([]);
  });

  it('rejects a token that does not belong to the user', async () => {
    const id = await insertUser('player@example.com', { verified: false });

    const response = await app.request(
      `${BASE}/verify`,
      form({ id, token: 'made-up' }),
    );

    expect(response.status).toBe(400);
    const user = await db()
      .selectFrom('user')
      .select('verified')
      .executeTakeFirstOrThrow();
    expect(user.verified).toBe(false);
  });
});

describe('reset', () => {
  it('answers the request form identically for unknown addresses', async () => {
    await insertUser('known@example.com');

    const known = await app.request(
      `${BASE}/reset/request`,
      form({ email: 'known@example.com' }),
    );
    resetRateLimits();
    const unknown = await app.request(
      `${BASE}/reset/request`,
      form({ email: 'nobody@example.com' }),
    );

    expect(known.status).toBe(unknown.status);
    expect(await known.text()).toBe(await unknown.text());
    expect(await db().selectFrom('reset').selectAll().execute()).toHaveLength(
      1,
    );
  });

  it('changes the password and ends every existing session', async () => {
    const id = await insertUser('player@example.com');
    await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: PASSWORD }),
    );
    await app.request(
      `${BASE}/reset/request`,
      form({ email: 'player@example.com' }),
    );
    const { token } = await db()
      .selectFrom('reset')
      .select('token')
      .executeTakeFirstOrThrow();

    resetRateLimits();
    const response = await app.request(
      `${BASE}/reset`,
      form({ id, token, password: 'a-brand-new-password' }),
    );

    expect(response.status).toBe(200);
    expect(await db().selectFrom('session').selectAll().execute()).toEqual([]);
    expect(await db().selectFrom('reset').selectAll().execute()).toEqual([]);

    resetRateLimits();
    const relogin = await app.request(
      `${BASE}/login`,
      form({ email: 'player@example.com', password: 'a-brand-new-password' }),
    );
    expect(relogin.status).toBe(303);
  });

  it('rate limits the reset form to one attempt a minute', async () => {
    const id = await insertUser('player@example.com');
    const attempt = () =>
      app.request(
        `${BASE}/reset`,
        form({ id, token: 'x', password: PASSWORD }),
      );

    expect((await attempt()).status).toBe(400);
    expect((await attempt()).status).toBe(429);
  });
});
