import { env } from 'node:process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;

const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { buildLeaderboard } = await import('./build');
const { hash, newSalt } = await import('../auth/password');

const SEASON = 2026;
// league, current week, the one member+bets+divBets+sbBet read, finished
// games, and the Super Bowl winner.
const EXPECTED_QUERIES = 5;
const DIVISION = 'AFC North';
const TEAMS = ['BAL', 'CIN', 'CLE', 'PIT'];

let league: string;
let alice: string;
let bob: string;

async function user(name: string): Promise<string> {
  const salt = newSalt();
  const row = await db()
    .insertInto('user')
    .values({
      email: `${name}@example.invalid`,
      name,
      salt: salt.toString('hex'),
      password: (await hash('irrelevant', salt)).toString('hex'),
      settings: JSON.stringify({}),
      consentedAt: new Date(),
      verified: true,
    })
    .returning('id')
    .executeTakeFirstOrThrow();
  return row.id;
}

async function seedWorld(weekEnd: Date, seasontype = 2, week = 1) {
  await db().insertInto('division').values({ name: DIVISION }).execute();
  await db()
    .insertInto('team')
    .values(
      TEAMS.map((abbreviation, index) => ({
        id: abbreviation,
        logo: `${abbreviation}.png`,
        abbreviation,
        shortName: abbreviation,
        name: `${abbreviation} Team`,
        divisionName: DIVISION,
        playoffSeed: index + 1,
      })),
    )
    .execute();
  await db()
    .insertInto('team_season')
    .values(
      TEAMS.map((abbreviation, index) => ({
        teamId: abbreviation,
        year: SEASON,
        logo: `${abbreviation}.png`,
        abbreviation,
        shortName: abbreviation,
        name: `${abbreviation} Team`,
        divisionName: DIVISION,
        playoffSeed: index + 1,
      })),
    )
    .execute();

  const weekId = `${SEASON}-${seasontype}-${week}`;
  await db()
    .insertInto('week')
    .values({
      id: weekId,
      year: SEASON,
      seasontype,
      week,
      start: new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: weekEnd,
      label: `Week ${week}`,
    })
    .execute();

  await db()
    .insertInto('game')
    .values({
      id: `${weekId}-1`,
      date: new Date(weekEnd.getTime() - 24 * 60 * 60 * 1000),
      homeTeamId: 'BAL',
      awayTeamId: 'CIN',
      homeScore: 24,
      awayScore: 17,
      winner: 'home',
      status: 'STATUS_FINAL',
      weekId,
    })
    .execute();

  const row = await db()
    .insertInto('league')
    .values({ name: 'Testliga', season: SEASON })
    .returning('id')
    .executeTakeFirstOrThrow();
  league = row.id;

  alice = await user('alice');
  bob = await user('bob');
  await db()
    .insertInto('member')
    .values([
      { leagueId: league, userId: alice },
      { leagueId: league, userId: bob },
    ])
    .execute();

  return weekId;
}

beforeAll(createSchema);
beforeEach(truncate);
afterAll(closeDatabase);

describe('the leaderboard', () => {
  it('scores a won bet and a lost one from a single read', async () => {
    const weekId = await seedWorld(new Date(Date.now() + 86_400_000));

    await db()
      .insertInto('bet')
      .values([
        {
          gameId: `${weekId}-1`,
          userId: alice,
          leagueId: league,
          winner: 'home',
          pointDiff: 5,
        },
        {
          gameId: `${weekId}-1`,
          userId: bob,
          leagueId: league,
          winner: 'away',
          pointDiff: 3,
        },
      ])
      .execute();

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(board?.entries.map((e) => [e.user.name, e.points.all])).toEqual([
      ['alice', 5],
      ['bob', -3],
    ]);
  });

  it('doubles a won bet and leaves a lost one alone', async () => {
    const weekId = await seedWorld(new Date(Date.now() + 86_400_000));

    await db()
      .insertInto('bet')
      .values([
        {
          gameId: `${weekId}-1`,
          userId: alice,
          leagueId: league,
          winner: 'home',
          pointDiff: 5,
        },
        {
          gameId: `${weekId}-1`,
          userId: bob,
          leagueId: league,
          winner: 'away',
          pointDiff: 3,
        },
      ])
      .execute();
    await db()
      .insertInto('betDoubler')
      .values([
        { gameId: `${weekId}-1`, userId: alice, leagueId: league, weekId },
        { gameId: `${weekId}-1`, userId: bob, leagueId: league, weekId },
      ])
      .execute();

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(board?.entries.map((e) => [e.user.name, e.points.all])).toEqual([
      ['alice', 10],
      ['bob', -3],
    ]);
  });

  it('reports -1 for a member who did not bet', async () => {
    const weekId = await seedWorld(new Date(Date.now() + 86_400_000));

    await db()
      .insertInto('bet')
      .values({
        gameId: `${weekId}-1`,
        userId: alice,
        leagueId: league,
        winner: 'home',
        pointDiff: 5,
      })
      .execute();

    const board = await buildLeaderboard(league, SEASON, alice);
    const missing = board?.entries.find((e) => e.user.name === 'bob');

    expect(missing?.points.all).toBe(-1);
    expect(missing?.bets[0].bet).toBeUndefined();
  });

  it('refuses a season the league was not played in', async () => {
    await seedWorld(new Date(Date.now() + 86_400_000));

    expect(await buildLeaderboard(league, SEASON - 1, alice)).toBeUndefined();
  });
});

describe('the query count', () => {
  it('renders the whole table without a query per member', async () => {
    const weekId = await seedWorld(new Date(Date.now() + 86_400_000));
    await db()
      .insertInto('bet')
      .values([
        {
          gameId: `${weekId}-1`,
          userId: alice,
          leagueId: league,
          winner: 'home',
          pointDiff: 5,
        },
        {
          gameId: `${weekId}-1`,
          userId: bob,
          leagueId: league,
          winner: 'away',
          pointDiff: 3,
        },
      ])
      .execute();

    const { queries } = await import('../db/kysely');
    queries.length = 0;
    await buildLeaderboard(league, SEASON, alice);

    // The Nest controller issued two per member on top of three collection
    // reads. This is one per concern, and none per member.
    expect(queries.length).toBe(EXPECTED_QUERIES);
  });
});

describe('the reveal rules', () => {
  async function divisionBetFor(userId: string, order: string[]) {
    await db()
      .insertInto('divisionBet')
      .values({
        year: SEASON,
        divisionName: DIVISION,
        userId,
        leagueId: league,
        firstId: order[0],
        secondId: order[1],
        thirdId: order[2],
        fourthId: order[3],
      })
      .execute();
  }

  it('hides another player division bets during the regular season', async () => {
    await seedWorld(new Date(Date.now() + 86_400_000));
    await divisionBetFor(alice, TEAMS);
    await divisionBetFor(bob, TEAMS);

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(board?.revealed.divBets).toBe(false);
    expect(
      board?.entries.find((e) => e.user.name === 'alice')?.divBets,
    ).toHaveLength(1);
    expect(
      board?.entries.find((e) => e.user.name === 'bob')?.divBets,
    ).toHaveLength(0);
  });

  it('scores no division points before the playoffs, even your own', async () => {
    await seedWorld(new Date(Date.now() + 86_400_000));
    await divisionBetFor(alice, TEAMS);

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(
      board?.entries.find((e) => e.user.name === 'alice')?.points.divBets,
    ).toBe(0);
  });

  it('reveals and scores division bets once the playoffs start', async () => {
    await seedWorld(new Date(Date.now() + 86_400_000), 3, 1);
    await divisionBetFor(alice, TEAMS);
    await divisionBetFor(bob, TEAMS);

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(board?.revealed.divBets).toBe(true);
    // A perfect order is 7 + 1 + 1 + 1 and then the 5 point bonus.
    expect(
      board?.entries.find((e) => e.user.name === 'bob')?.points.divBets,
    ).toBe(15);
  });

  it('hides another player Super Bowl bet until the final game', async () => {
    await seedWorld(new Date(Date.now() + 86_400_000), 3, 1);
    await db()
      .insertInto('superbowlBet')
      .values([
        { year: SEASON, teamId: 'BAL', userId: alice, leagueId: league },
        { year: SEASON, teamId: 'CIN', userId: bob, leagueId: league },
      ])
      .execute();

    const board = await buildLeaderboard(league, SEASON, alice);

    expect(board?.revealed.sbBet).toBe(false);
    expect(
      board?.entries.find((e) => e.user.name === 'alice')?.sbBet.team,
    ).toMatchObject({ id: 'BAL' });
    expect(
      board?.entries.find((e) => e.user.name === 'bob')?.sbBet.team,
    ).toEqual({});
  });
});
