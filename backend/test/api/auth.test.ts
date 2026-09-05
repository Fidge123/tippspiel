import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  ResetEntity,
  UserEntity,
  VerifyEntity,
} from '../../src/database/entity';
import { sentEmails } from '../../src/email';
import { TestDatabase } from '../support/database';
import { ApiApp, bootApiApp } from './app';
import { freshDatabase } from './database';
import { ageRow, createUser, PASSWORD, userById } from './fixtures';

const ONE_DAY = 24 * 60 * 60 * 1000;

let database: TestDatabase;
let api: ApiApp;

beforeAll(async () => {
  database = await freshDatabase();
  api = await bootApiApp(database.url);
});

afterAll(async () => {
  await api?.close();
  await database?.stop();
});

beforeEach(() => {
  sentEmails.length = 0;
});

function verificationFrom(email: string): { id: string; token: string } {
  const mail = sentEmails.find((m) => m.To === email);
  const link = /verify\?id=([^&]+)&token=(\w+)/.exec(String(mail?.TextBody));
  if (!link) {
    throw new Error(`No verification link was mailed to ${email}`);
  }
  return { id: link[1], token: link[2] };
}

describe('registration and login', () => {
  it('registers, verifies, logs in, refreshes and logs out', async () => {
    const email = 'flow@example.invalid';
    await request(api.server)
      .post('/user/register')
      .send({ email, name: 'Flow', consent: true, password: PASSWORD })
      .expect(201);

    const { id, token } = verificationFrom(email);
    await request(api.server)
      .post('/user/verify')
      .send({ id, token })
      .expect(201);

    const login = await request(api.server)
      .post('/user/login')
      .send({ email, password: PASSWORD })
      .expect(201);
    const accessToken = login.body;
    expect(typeof accessToken).toBe('string');

    await request(api.server)
      .get('/user/settings')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const cookies = login.headers['set-cookie'];
    const refresh = await request(api.server)
      .post('/user/refresh')
      .set('Cookie', cookies)
      .expect(201);
    expect(typeof refresh.body).toBe('string');

    await request(api.server)
      .post('/user/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('rejects a registration without consent', async () => {
    await request(api.server)
      .post('/user/register')
      .send({
        email: 'noconsent@example.invalid',
        name: 'No Consent',
        consent: false,
        password: PASSWORD,
      })
      .expect(400);
  });

  it('rejects a password shorter than 8 characters', async () => {
    await request(api.server)
      .post('/user/register')
      .send({
        email: 'short@example.invalid',
        name: 'Short',
        consent: true,
        password: 'kurz',
      })
      .expect(400);
  });

  it('rejects a login with an unverified account', async () => {
    const user = await createUser(api, { verified: false });
    await request(api.server)
      .post('/user/login')
      .send({ email: user.email, password: user.password })
      .expect(401);
  });

  it('rejects a wrong password', async () => {
    const user = await createUser(api);
    await request(api.server)
      .post('/user/login')
      .send({ email: user.email, password: 'wrong password' })
      .expect(401);
  });

  it('rejects a verification token that has already been used', async () => {
    const user = await createUser(api, { verified: false });
    await request(api.server)
      .post('/user/verify')
      .send({ id: user.id, token: user.verifyToken })
      .expect(201);
    await request(api.server)
      .post('/user/verify')
      .send({ id: user.id, token: user.verifyToken })
      .expect(400);
  });
});

describe('guarded routes', () => {
  it('rejects a request without a token', async () => {
    await request(api.server).get('/user/settings').expect(401);
  });

  it('rejects a malformed token', async () => {
    await request(api.server)
      .get('/user/settings')
      .set('Authorization', 'Bearer not.a.token')
      .expect(401);
  });

  it('rejects an expired token', async () => {
    const user = await createUser(api);
    await request(api.server)
      .get('/user/settings')
      .set('Authorization', `Bearer ${api.tokenFor(user, '-1s')}`)
      .expect(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const user = await createUser(api);
    const refreshToken = api.tokenFor(user);
    await request(api.server)
      .post('/user/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .expect(401);
  });

  it('rejects a token for a user that no longer exists', async () => {
    const user = await createUser(api);
    const token = api.tokenFor(user);
    await api.dataSource.getRepository(UserEntity).delete(user.id);
    await request(api.server)
      .get('/user/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});

describe('password reset', () => {
  it('mails a reset link and accepts the token once', async () => {
    const user = await createUser(api);
    await request(api.server)
      .post('/user/request-reset')
      .send({ email: user.email })
      .expect(201);

    const mail = sentEmails.find((m) => m.To === user.email);
    const token = /reset\?id=[^&]+&token=(\w+)/.exec(
      String(mail?.TextBody),
    )?.[1];
    expect(token).toBeTruthy();

    await request(api.server)
      .post('/user/reset')
      .send({ id: user.id, token, password: 'ein neues Passwort' })
      .expect(201);

    await request(api.server)
      .post('/user/login')
      .send({ email: user.email, password: 'ein neues Passwort' })
      .expect(201);

    await request(api.server)
      .post('/user/reset')
      .send({ id: user.id, token, password: 'noch ein Passwort' })
      .expect(400);
  });

  it('says nothing about unknown email addresses', async () => {
    await request(api.server)
      .post('/user/request-reset')
      .send({ email: 'unknown@example.invalid' })
      .expect(201);
    expect(sentEmails).toHaveLength(0);
  });
});

describe('clean up', () => {
  it('deletes reset tokens older than a day', async () => {
    const user = await createUser(api);
    const reset = await api.users.sendReset(user.email);
    await ageRow(api, 'reset', reset.id, ONE_DAY + 60_000);

    await api.users.cleanUp();

    const remaining = await api.dataSource
      .getRepository(ResetEntity)
      .findOneBy({ id: reset.id });
    expect(remaining).toBeNull();
  });

  it('keeps reset tokens younger than a day', async () => {
    const user = await createUser(api);
    const reset = await api.users.sendReset(user.email);

    await api.users.cleanUp();

    const remaining = await api.dataSource
      .getRepository(ResetEntity)
      .findOneBy({ id: reset.id });
    expect(remaining).not.toBeNull();
  });

  it('deletes unverified users older than a week', async () => {
    const user = await createUser(api, { verified: false });
    const tokens = await api.dataSource
      .getRepository(VerifyEntity)
      .findBy({ token: user.verifyToken });
    await ageRow(api, 'user', user.id, 8 * ONE_DAY);
    for (const token of tokens) {
      await ageRow(api, 'verify', token.id, 8 * ONE_DAY);
    }

    await api.users.cleanUp();

    expect(await userById(api, user.id)).toBeNull();
  });

  it('keeps verified users of any age', async () => {
    const user = await createUser(api);
    await ageRow(api, 'user', user.id, 8 * ONE_DAY);

    await api.users.cleanUp();

    expect(await userById(api, user.id)).not.toBeNull();
  });
});

describe('rate limits', () => {
  let throttled: ApiApp;

  beforeAll(async () => {
    throttled = await bootApiApp(database.url, { throttle: true });
  });

  afterAll(async () => {
    await throttled?.close();
  });

  // A rejected login never reaches the throttler: AuthGuard runs first.
  it('allows ten logins a minute', async () => {
    const user = await createUser(throttled);
    const attempts = [];
    for (let i = 0; i < 11; i++) {
      attempts.push(
        await request(throttled.server)
          .post('/user/login')
          .send({ email: user.email, password: user.password }),
      );
    }
    expect(attempts.slice(0, 10).map((a) => a.status)).not.toContain(429);
    expect(attempts[10].status).toBe(429);
  });

  it('allows three registrations a minute', async () => {
    const attempts = [];
    for (let i = 0; i < 4; i++) {
      attempts.push(
        await request(throttled.server)
          .post('/user/register')
          .send({
            email: `throttled-${i}@example.invalid`,
            name: `Throttled ${i}`,
            consent: true,
            password: PASSWORD,
          }),
      );
    }
    expect(attempts.slice(0, 3).map((a) => a.status)).not.toContain(429);
    expect(attempts[3].status).toBe(429);
  });

  it('allows one password reset a minute', async () => {
    const first = await request(throttled.server)
      .post('/user/reset')
      .send({ id: 'unknown', token: 'unknown', password: PASSWORD });
    const second = await request(throttled.server)
      .post('/user/reset')
      .send({ id: 'unknown', token: 'unknown', password: PASSWORD });

    expect(first.status).not.toBe(429);
    expect(second.status).toBe(429);
  });
});
