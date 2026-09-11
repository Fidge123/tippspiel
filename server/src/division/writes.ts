import { db } from '../db/kysely';
import { seasonStart } from './query';

export type DivisionResult =
  | { ok: true }
  | { ok: false; reason: 'late' | 'duplicate' | 'not-a-member' | 'invalid' };

async function isMember(leagueId: string, userId: string): Promise<boolean> {
  const row = await db()
    .selectFrom('member')
    .select('userId')
    .where('leagueId', '=', leagueId)
    .where('userId', '=', userId)
    .executeTakeFirst();
  return !!row;
}

async function closed(year: number): Promise<boolean> {
  const start = await seasonStart(year);
  return !start || new Date() >= start;
}

export async function setDivisionBet(
  userId: string,
  leagueId: string,
  year: number,
  division: string,
  teams: string[],
): Promise<DivisionResult> {
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }
  if (teams.length !== 4 || teams.some((team) => !team)) {
    return { ok: false, reason: 'invalid' };
  }
  // The Nest service wrote whatever four ids it was given, so a bet could name
  // the same team twice and be scored against itself.
  if (new Set(teams).size !== teams.length) {
    return { ok: false, reason: 'duplicate' };
  }
  if (await closed(year)) {
    return { ok: false, reason: 'late' };
  }

  const belong = await db()
    .selectFrom('team')
    .leftJoin('team_season', (join) =>
      join
        .onRef('team_season.teamId', '=', 'team.id')
        .on('team_season.year', '=', year),
    )
    .select('team.id as id')
    .where('team.id', 'in', teams)
    .where((eb) =>
      eb.or([
        eb('team_season.divisionName', '=', division),
        eb.and([
          eb('team_season.divisionName', 'is', null),
          eb('team.divisionName', '=', division),
        ]),
      ]),
    )
    .execute();

  if (belong.length !== 4) {
    return { ok: false, reason: 'invalid' };
  }

  const [first, second, third, fourth] = teams;
  const existing = await db()
    .selectFrom('divisionBet')
    .select('id')
    .where('leagueId', '=', leagueId)
    .where('year', '=', year)
    .where('userId', '=', userId)
    .where('divisionName', '=', division)
    .executeTakeFirst();

  if (existing) {
    await db()
      .updateTable('divisionBet')
      .set({
        firstId: first,
        secondId: second,
        thirdId: third,
        fourthId: fourth,
      })
      .where('id', '=', existing.id)
      .execute();
  } else {
    await db()
      .insertInto('divisionBet')
      .values({
        year,
        divisionName: division,
        userId,
        leagueId,
        firstId: first,
        secondId: second,
        thirdId: third,
        fourthId: fourth,
      })
      .execute();
  }

  return { ok: true };
}

export async function setSuperbowlBet(
  userId: string,
  leagueId: string,
  year: number,
  teamId: string,
): Promise<DivisionResult> {
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }
  if (await closed(year)) {
    return { ok: false, reason: 'late' };
  }

  const team = await db()
    .selectFrom('team')
    .select('id')
    .where('id', '=', teamId)
    .executeTakeFirst();

  if (!team) {
    return { ok: false, reason: 'invalid' };
  }

  const existing = await db()
    .selectFrom('superbowlBet')
    .select('id')
    .where('leagueId', '=', leagueId)
    .where('year', '=', year)
    .where('userId', '=', userId)
    .executeTakeFirst();

  if (existing) {
    await db()
      .updateTable('superbowlBet')
      .set({ teamId })
      .where('id', '=', existing.id)
      .execute();
  } else {
    await db()
      .insertInto('superbowlBet')
      .values({ year, teamId, userId, leagueId })
      .execute();
  }

  return { ok: true };
}
