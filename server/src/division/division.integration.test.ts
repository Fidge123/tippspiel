import { env } from 'node:process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;

const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { hash, newSalt } = await import('../auth/password');
const w = await import('./writes');
const q = await import('./query');

const SEASON = 2026;
const DIVISION = 'AFC North';
const TEAMS = ['BAL', 'CIN', 'CLE', 'PIT'];
const DAY = 24 * 60 * 60 * 1000;

let league: string;
let alice: string;
let outsider: string;

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

async function seed(firstKickoff: Date) {
  await db()
    .insertInto('division')
    .values([{ name: DIVISION }, { name: 'NFC East' }])
    .execute();
  await db()
    .insertInto('team')
    .values([
      ...TEAMS.map((abbreviation, index) => ({
        id: abbreviation,
        logo: `${abbreviation}.png`,
        abbreviation,
        shortName: abbreviation,
        name: `${abbreviation} Team`,
        divisionName: DIVISION,
        playoffSeed: index + 1,
      })),
      {
        id: 'DAL',
        logo: 'DAL.png',
        abbreviation: 'DAL',
        shortName: 'DAL',
        name: 'DAL Team',
        divisionName: 'NFC East',
        playoffSeed: 1,
      },
    ])
    .execute();

  const weekId = `${SEASON}-2-1`;
  await db()
    .insertInto('week')
    .values({
      id: weekId,
      year: SEASON,
      seasontype: 2,
      week: 1,
      start: new Date(firstKickoff.getTime() - 3 * DAY),
      end: new Date(firstKickoff.getTime() + 4 * DAY),
      label: 'Week 1',
    })
    .execute();
  await db()
    .insertInto('game')
    .values({
      id: `${weekId}-1`,
      date: firstKickoff,
      homeTeamId: 'BAL',
      awayTeamId: 'CIN',
      homeScore: 0,
      awayScore: 0,
      winner: 'none',
      status: 'STATUS_SCHEDULED',
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
  outsider = await user('outsider');
  await db()
    .insertInto('member')
    .values({ leagueId: league, userId: alice })
    .execute();
}

beforeAll(createSchema);
beforeEach(truncate);
afterAll(closeDatabase);

describe('before the season starts', () => {
  beforeEach(() => seed(new Date(Date.now() + DAY)));

  it('stores an order and reads it back', async () => {
    expect(
      await w.setDivisionBet(alice, league, SEASON, DIVISION, TEAMS),
    ).toEqual({ ok: true });

    expect(await q.myDivisionBets(league, SEASON, alice)).toEqual([
      { name: DIVISION, teams: TEAMS },
    ]);
  });

  it('replaces the order rather than adding a second bet', async () => {
    await w.setDivisionBet(alice, league, SEASON, DIVISION, TEAMS);
    await w.setDivisionBet(
      alice,
      league,
      SEASON,
      DIVISION,
      [...TEAMS].reverse(),
    );

    const rows = await db().selectFrom('divisionBet').selectAll().execute();
    expect(rows).toHaveLength(1);
    expect(rows[0].firstId).toBe('PIT');
  });

  it('refuses the same team twice', async () => {
    expect(
      await w.setDivisionBet(alice, league, SEASON, DIVISION, [
        'BAL',
        'BAL',
        'CLE',
        'PIT',
      ]),
    ).toEqual({ ok: false, reason: 'duplicate' });
    expect(await db().selectFrom('divisionBet').selectAll().execute()).toEqual(
      [],
    );
  });

  it('refuses a team from another division', async () => {
    expect(
      await w.setDivisionBet(alice, league, SEASON, DIVISION, [
        'BAL',
        'CIN',
        'CLE',
        'DAL',
      ]),
    ).toEqual({ ok: false, reason: 'invalid' });
  });

  it('refuses fewer than four teams', async () => {
    expect(
      await w.setDivisionBet(alice, league, SEASON, DIVISION, ['BAL', 'CIN']),
    ).toEqual({ ok: false, reason: 'invalid' });
  });

  it('refuses a league the player is not in', async () => {
    expect(
      await w.setDivisionBet(outsider, league, SEASON, DIVISION, TEAMS),
    ).toEqual({ ok: false, reason: 'not-a-member' });
  });

  it('stores a Super Bowl pick', async () => {
    expect(await w.setSuperbowlBet(alice, league, SEASON, 'BAL')).toEqual({
      ok: true,
    });
    expect(await q.mySuperbowlBet(league, SEASON, alice)).toBe('BAL');
  });

  it('counts how many players picked each team', async () => {
    const bob = await user('bob');
    await db()
      .insertInto('member')
      .values({ leagueId: league, userId: bob })
      .execute();

    await w.setDivisionBet(alice, league, SEASON, DIVISION, TEAMS);
    await w.setDivisionBet(bob, league, SEASON, DIVISION, TEAMS);
    await w.setSuperbowlBet(alice, league, SEASON, 'BAL');
    await w.setSuperbowlBet(bob, league, SEASON, 'CIN');

    const counts = await q.pickCounts(league, SEASON);
    expect(counts.first.get('BAL')).toBe(2);
    expect(counts.sb.get('BAL')).toBe(1);
    expect(counts.sb.get('CIN')).toBe(1);
  });
});

describe('once the season has started', () => {
  beforeEach(() => seed(new Date(Date.now() - DAY)));

  it('refuses a division bet and says so', async () => {
    expect(
      await w.setDivisionBet(alice, league, SEASON, DIVISION, TEAMS),
    ).toEqual({ ok: false, reason: 'late' });
  });

  it('refuses a Super Bowl bet and says so', async () => {
    expect(await w.setSuperbowlBet(alice, league, SEASON, 'BAL')).toEqual({
      ok: false,
      reason: 'late',
    });
  });
});
