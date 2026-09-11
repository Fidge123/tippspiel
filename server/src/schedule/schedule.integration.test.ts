import { env } from 'node:process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;

const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { hash, newSalt } = await import('../auth/password');
const writes = await import('./writes');
const { scheduleFor } = await import('./query');

const SEASON = 2026;
const WEEK = `${SEASON}-2-1`;
const HOUR = 60 * 60 * 1000;

let league: string;
let otherLeague: string;
let alice: string;
let outsider: string;
let upcoming: string;
let started: string;

async function user(name: string): Promise<string> {
  const salt = newSalt();
  const row = await db()
    .insertInto('user')
    .values({
      email: `${name}@example.invalid`,
      name,
      salt: salt.toString('hex'),
      password: (await hash('x', salt)).toString('hex'),
      settings: JSON.stringify({}),
      consentedAt: new Date(),
      verified: true,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  return row.id;
}

async function seed() {
  await db().insertInto('division').values({ name: 'AFC North' }).execute();
  await db()
    .insertInto('team')
    .values(
      ['BAL', 'CIN', 'CLE', 'PIT'].map((abbreviation) => ({
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

  await db()
    .insertInto('game')
    .values([
      {
        id: `${WEEK}-upcoming`,
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
        id: `${WEEK}-started`,
        date: new Date(Date.now() - 2 * HOUR),
        homeTeamId: 'CLE',
        awayTeamId: 'PIT',
        homeScore: 10,
        awayScore: 7,
        winner: 'home',
        status: 'STATUS_FINAL',
        weekId: WEEK,
      },
    ])
    .execute();

  upcoming = `${WEEK}-upcoming`;
  started = `${WEEK}-started`;

  const rows = await db()
    .insertInto('league')
    .values([
      { name: 'Testliga', season: SEASON },
      { name: 'Andere', season: SEASON },
    ])
    .returning('id')
    .execute();
  league = rows[0].id;
  otherLeague = rows[1].id;

  alice = await user('alice');
  outsider = await user('outsider');
  await db()
    .insertInto('member')
    .values({ leagueId: league, userId: alice })
    .execute();
}

beforeAll(createSchema);
beforeEach(async () => {
  await truncate();
  await seed();
});
afterAll(closeDatabase);

describe('placing a bet', () => {
  it('stores it and reads it back on the schedule', async () => {
    expect(await writes.setGameBet(alice, league, upcoming, 'home', 3)).toEqual(
      { ok: true },
    );

    const weeks = await scheduleFor(league, SEASON, alice);
    const game = weeks[0].games.find((g) => g.id === upcoming);

    expect(game?.myWinner).toBe('home');
    expect(game?.myPointDiff).toBe(3);
    expect(game?.homeVotes).toBe(1);
    expect(game?.awayVotes).toBe(0);
  });

  it('replaces an existing bet rather than adding a second', async () => {
    await writes.setGameBet(alice, league, upcoming, 'home', 3);
    await writes.setGameBet(alice, league, upcoming, 'away', 5);

    const rows = await db().selectFrom('bet').selectAll().execute();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ winner: 'away', pointDiff: 5 });
  });

  it('refuses a game that has already kicked off', async () => {
    expect(await writes.setGameBet(alice, league, started, 'home', 3)).toEqual({
      ok: false,
      reason: 'late',
    });
    expect(await db().selectFrom('bet').selectAll().execute()).toEqual([]);
  });

  it('refuses a league the player is not a member of', async () => {
    expect(
      await writes.setGameBet(alice, otherLeague, upcoming, 'home', 3),
    ).toEqual({ ok: false, reason: 'not-a-member' });
  });

  it('refuses a player who is in no league at all', async () => {
    expect(
      await writes.setGameBet(outsider, league, upcoming, 'home', 3),
    ).toEqual({ ok: false, reason: 'not-a-member' });
  });

  it('refuses a game that does not exist', async () => {
    expect(
      await writes.setGameBet(alice, league, 'made-up', 'home', 3),
    ).toEqual({ ok: false, reason: 'invalid' });
  });
});

describe('the doubler', () => {
  it('sets one and reads it back on the week', async () => {
    expect(await writes.setDoubler(alice, league, WEEK, upcoming)).toEqual({
      ok: true,
    });

    const weeks = await scheduleFor(league, SEASON, alice);
    expect(weeks[0].doublerGameId).toBe(upcoming);
  });

  it('refuses a game that has already kicked off', async () => {
    expect(await writes.setDoubler(alice, league, WEEK, started)).toEqual({
      ok: false,
      reason: 'late',
    });
  });

  it('refuses to move one off a game that has started', async () => {
    await db()
      .insertInto('betDoubler')
      .values({
        gameId: started,
        userId: alice,
        leagueId: league,
        weekId: WEEK,
      })
      .execute();

    expect(await writes.setDoubler(alice, league, WEEK, upcoming)).toEqual({
      ok: false,
      reason: 'late',
    });
  });

  it('moves one while its game has not started', async () => {
    await writes.setDoubler(alice, league, WEEK, upcoming);
    const second = `${WEEK}-second`;
    await db()
      .insertInto('game')
      .values({
        id: second,
        date: new Date(Date.now() + 3 * HOUR),
        homeTeamId: 'BAL',
        awayTeamId: 'PIT',
        homeScore: 0,
        awayScore: 0,
        winner: 'none',
        status: 'STATUS_SCHEDULED',
        weekId: WEEK,
      })
      .execute();

    expect(await writes.setDoubler(alice, league, WEEK, second)).toEqual({
      ok: true,
    });
    expect(
      await db().selectFrom('betDoubler').selectAll().execute(),
    ).toHaveLength(1);
  });

  it('removes one, and actually deletes the row', async () => {
    await writes.setDoubler(alice, league, WEEK, upcoming);

    expect(await writes.removeDoubler(alice, league, WEEK)).toEqual({
      ok: true,
    });
    expect(await db().selectFrom('betDoubler').selectAll().execute()).toEqual(
      [],
    );
  });

  it('refuses to remove one whose game has started', async () => {
    await db()
      .insertInto('betDoubler')
      .values({
        gameId: started,
        userId: alice,
        leagueId: league,
        weekId: WEEK,
      })
      .execute();

    expect(await writes.removeDoubler(alice, league, WEEK)).toEqual({
      ok: false,
      reason: 'late',
    });
    expect(
      await db().selectFrom('betDoubler').selectAll().execute(),
    ).toHaveLength(1);
  });

  it('reports when there is nothing to remove', async () => {
    expect(await writes.removeDoubler(alice, league, WEEK)).toEqual({
      ok: false,
      reason: 'no-doubler',
    });
  });
});

describe('the spoiler toggle', () => {
  it('stores the setting per week and leaves the others alone', async () => {
    await writes.setHidden(alice, WEEK, true);
    await writes.setHidden(alice, `${SEASON}-2-2`, false);

    expect(await writes.hiddenSettings(alice)).toEqual({
      hidden: { [WEEK]: true, [`${SEASON}-2-2`]: false },
      hideByDefault: true,
    });
  });

  it('protects a week the user has never touched', async () => {
    const settings = await writes.hiddenSettings(alice);

    expect(settings.hideByDefault).toBe(true);
    expect(settings.hidden[WEEK]).toBeUndefined();
  });

  it('toggles back off', async () => {
    await writes.setHidden(alice, WEEK, true);
    await writes.setHidden(alice, WEEK, false);

    expect((await writes.hiddenSettings(alice)).hidden[WEEK]).toBe(false);
  });
});

describe('the schedule read', () => {
  it('reports the votes of the league and nobody else', async () => {
    const bob = await user('bob');
    await db()
      .insertInto('member')
      .values([
        { leagueId: league, userId: bob },
        { leagueId: otherLeague, userId: outsider },
      ])
      .execute();

    await writes.setGameBet(alice, league, upcoming, 'home', 3);
    await writes.setGameBet(bob, league, upcoming, 'away', 2);
    await writes.setGameBet(outsider, otherLeague, upcoming, 'home', 5);

    const weeks = await scheduleFor(league, SEASON, alice);
    const game = weeks[0].games.find((g) => g.id === upcoming);

    expect(game?.homeVotes).toBe(1);
    expect(game?.awayVotes).toBe(1);
    expect(game?.stats.map((s) => s.name).sort()).toEqual(['alice', 'bob']);
  });

  it('orders games by kickoff', async () => {
    const weeks = await scheduleFor(league, SEASON, alice);

    expect(weeks[0].games.map((g) => g.id)).toEqual([started, upcoming]);
  });
});
