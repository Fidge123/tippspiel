import { env } from 'node:process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;
env.COOKIE_SECRET = 'cookie-secret-for-tests';
env.INSECURE_COOKIES = 'true';
env.RATE_LIMIT_DISABLED = 'true';

const { app } = await import('../app');
const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { hash, newSalt } = await import('../auth/password');

const BASE = '/tippspiel';
const SEASON = 2026;
const WEEK = `${SEASON}-2-1`;
const HOUR = 60 * 60 * 1000;
const PASSWORD = 'a-good-enough-password';

let league: string;
let alice: string;
let cookie: string;
let upcoming: string;
let started: string;

async function seed() {
  await db().insertInto('division').values({ name: 'AFC North' }).execute();
  await db()
    .insertInto('team')
    .values(
      ['BAL', 'CIN'].map((abbreviation) => ({
        id: abbreviation,
        logo: `${abbreviation}.png`,
        abbreviation,
        shortName: abbreviation,
        name: `${abbreviation} Team`,
        divisionName: 'AFC North',
      })),
    )
    .execute();
  await db()
    .insertInto('week')
    .values({
      id: WEEK,
      year: SEASON,
      seasontype: 2,
      week: 1,
      start: new Date(Date.now() - 24 * HOUR),
      end: new Date(Date.now() + 5 * 24 * HOUR),
      label: 'Week 1',
    })
    .execute();

  upcoming = `${WEEK}-upcoming`;
  started = `${WEEK}-started`;
  await db()
    .insertInto('game')
    .values([
      {
        id: upcoming,
        date: new Date(Date.now() + 2 * HOUR),
        homeTeamId: 'BAL',
        awayTeamId: 'CIN',
        homeScore: 0,
        awayScore: 0,
        winner: 'none',
        status: 'STATUS_SCHEDULED',
        weekId: WEEK,
      },
      {
        id: started,
        date: new Date(Date.now() - 2 * HOUR),
        homeTeamId: 'CIN',
        awayTeamId: 'BAL',
        homeScore: 3,
        awayScore: 0,
        winner: 'home',
        status: 'STATUS_FINAL',
        weekId: WEEK,
      },
    ])
    .execute();

  const salt = newSalt();
  const row = await db()
    .insertInto('user')
    .values({
      email: 'alice@example.invalid',
      name: 'alice',
      salt: salt.toString('hex'),
      password: (await hash(PASSWORD, salt)).toString('hex'),
      settings: JSON.stringify({}),
      consentedAt: new Date(),
      verified: true,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  alice = row.id;

  const leagueRow = await db()
    .insertInto('league')
    .values({ name: 'Testliga', season: SEASON })
    .returning('id')
    .executeTakeFirstOrThrow();
  league = leagueRow.id;
  await db()
    .insertInto('member')
    .values({ leagueId: league, userId: alice })
    .execute();

  // Logs in for real rather than forging a cookie, so these tests break if the
  // session format changes.
  const login = await app.request(`${BASE}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: 'alice@example.invalid',
      password: PASSWORD,
    }).toString(),
  });
  cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
}

function form(fields: Record<string, string>): RequestInit {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie,
    },
    body: new URLSearchParams(fields).toString(),
  };
}

beforeAll(createSchema);
beforeEach(async () => {
  await truncate();
  await seed();
});
afterAll(closeDatabase);

describe('a rejected bet', () => {
  it('says so on the page instead of answering 200 with nothing', async () => {
    const response = await app.request(
      `${BASE}/bet`,
      form({
        game: started,
        league,
        week: WEEK,
        winner: 'home',
        pointDiff: '3',
      }),
    );

    expect(response.status).toBe(400);
    const html = await response.text();
    expect(html).toContain('Zu spät');
    expect(await db().selectFrom('bet').selectAll().execute()).toEqual([]);
  });

  it('rejects a stake outside 1 to 5 and says which game', async () => {
    const response = await app.request(
      `${BASE}/bet`,
      form({
        game: upcoming,
        league,
        week: WEEK,
        winner: 'home',
        pointDiff: '9',
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('Einsatz zwischen 1 und 5');
    expect(await db().selectFrom('bet').selectAll().execute()).toEqual([]);
  });

  it('rejects a winner that is neither home nor away', async () => {
    const response = await app.request(
      `${BASE}/bet`,
      form({
        game: upcoming,
        league,
        week: WEEK,
        winner: 'sideways',
        pointDiff: '3',
      }),
    );

    expect(response.status).toBe(400);
    expect(await db().selectFrom('bet').selectAll().execute()).toEqual([]);
  });

  it('redirects on success rather than rendering', async () => {
    const response = await app.request(
      `${BASE}/bet`,
      form({
        game: upcoming,
        league,
        week: WEEK,
        winner: 'home',
        pointDiff: '3',
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(`${BASE}/#game-${upcoming}`);
  });
});

describe('a rejected doubler', () => {
  it('says so when the game has already started', async () => {
    const response = await app.request(
      `${BASE}/doubler`,
      form({ game: started, league, week: WEEK }),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('Zu spät');
  });

  it('says so when there is nothing to remove', async () => {
    const response = await app.request(
      `${BASE}/doubler/remove`,
      form({ league, week: WEEK }),
    );

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('kein Doppler');
  });
});
