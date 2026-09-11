import { db } from '../db/kysely';

export interface DivisionTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  playoffSeed: number | null;
}

export interface DivisionPick {
  name: string;
  teams: (string | null)[];
}

export async function seasonStart(year: number): Promise<Date | undefined> {
  const row = await db()
    .selectFrom('game')
    .innerJoin('week', 'week.id', 'game.weekId')
    .where('week.year', '=', year)
    .where('week.seasontype', '=', 2)
    .where('week.week', '=', 1)
    .select('game.date as date')
    .orderBy('game.date', 'asc')
    .executeTakeFirst();

  return row?.date;
}

export async function myDivisionBets(
  leagueId: string,
  year: number,
  userId: string,
): Promise<DivisionPick[]> {
  const rows = await db()
    .selectFrom('divisionBet')
    .select(['divisionName', 'firstId', 'secondId', 'thirdId', 'fourthId'])
    .where('leagueId', '=', leagueId)
    .where('year', '=', year)
    .where('userId', '=', userId)
    .execute();

  return rows.map((row) => ({
    name: row.divisionName ?? '',
    teams: [row.firstId, row.secondId, row.thirdId, row.fourthId],
  }));
}

export async function mySuperbowlBet(
  leagueId: string,
  year: number,
  userId: string,
): Promise<string | null> {
  const row = await db()
    .selectFrom('superbowlBet')
    .select('teamId')
    .where('leagueId', '=', leagueId)
    .where('year', '=', year)
    .where('userId', '=', userId)
    .executeTakeFirst();

  return row?.teamId ?? null;
}

/** Season-scoped, so a past season lists the teams and records of that year. */
export async function divisions(
  year: number,
): Promise<{ name: string; teams: DivisionTeam[] }[]> {
  const teams = await db()
    .selectFrom('team')
    .leftJoin('team_season', (join) =>
      join
        .onRef('team_season.teamId', '=', 'team.id')
        .on('team_season.year', '=', year),
    )
    .select((eb) => [
      'team.id as id',
      eb.fn.coalesce('team_season.name', 'team.name').as('name'),
      eb.fn.coalesce('team_season.shortName', 'team.shortName').as('shortName'),
      eb.fn
        .coalesce('team_season.abbreviation', 'team.abbreviation')
        .as('abbreviation'),
      eb.fn.coalesce('team_season.logo', 'team.logo').as('logo'),
      eb.fn.coalesce('team_season.wins', 'team.wins').as('wins'),
      eb.fn.coalesce('team_season.losses', 'team.losses').as('losses'),
      eb.fn.coalesce('team_season.ties', 'team.ties').as('ties'),
      eb.fn
        .coalesce('team_season.playoffSeed', 'team.playoffSeed')
        .as('playoffSeed'),
      eb.fn
        .coalesce('team_season.divisionName', 'team.divisionName')
        .as('divisionName'),
    ])
    .execute();

  const byDivision = new Map<string, DivisionTeam[]>();
  for (const team of teams) {
    if (!team.divisionName) {
      continue;
    }
    const list = byDivision.get(team.divisionName) ?? [];
    list.push(team as DivisionTeam);
    byDivision.set(team.divisionName, list);
  }

  return [...byDivision.entries()]
    .map(([name, list]) => ({
      name,
      teams: list.sort(
        (a, b) =>
          (a.playoffSeed ?? Number.POSITIVE_INFINITY) -
            (b.playoffSeed ?? Number.POSITIVE_INFINITY) ||
          a.name.localeCompare(b.name),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** How many players picked each team first, and for the Super Bowl (#24). */
export async function pickCounts(
  leagueId: string,
  year: number,
): Promise<{ first: Map<string, number>; sb: Map<string, number> }> {
  const [firsts, sbs] = await Promise.all([
    db()
      .selectFrom('divisionBet')
      .select((eb) => ['firstId', eb.fn.countAll<string>().as('n')])
      .where('leagueId', '=', leagueId)
      .where('year', '=', year)
      .groupBy('firstId')
      .execute(),
    db()
      .selectFrom('superbowlBet')
      .select((eb) => ['teamId', eb.fn.countAll<string>().as('n')])
      .where('leagueId', '=', leagueId)
      .where('year', '=', year)
      .groupBy('teamId')
      .execute(),
  ]);

  return {
    first: new Map(
      firsts.filter((r) => r.firstId).map((r) => [r.firstId!, Number(r.n)]),
    ),
    sb: new Map(
      sbs.filter((r) => r.teamId).map((r) => [r.teamId!, Number(r.n)]),
    ),
  };
}
