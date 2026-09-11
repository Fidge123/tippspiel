import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { db } from '../db/kysely';

export interface LeaderboardTeam {
  id: string;
  abbreviation: string;
  name: string;
  shortName: string;
  logo: string;
  playoffSeed: number | null;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  bets: {
    gameId: string;
    betId: string | null;
    winner: string | null;
    pointDiff: number | null;
    doubled: boolean;
  }[];
  divBets: {
    name: string | null;
    first: LeaderboardTeam | null;
    second: LeaderboardTeam | null;
    third: LeaderboardTeam | null;
    fourth: LeaderboardTeam | null;
  }[];
  sbBet: { team: LeaderboardTeam | null } | null;
}

export interface LeaderboardGame {
  id: string;
  homeScore: number;
  awayScore: number;
  allBets: { winner: string; userId: string | null }[];
}

const teamColumns = [
  'team.id as id',
  'team.abbreviation as abbreviation',
  'team.name as name',
  'team.shortName as shortName',
  'team.logo as logo',
] as const;

/**
 * Seeds come from team_season for the bet's year, not from the team row, so a
 * finished season is not rescored by the next import (#40).
 */
function pick(
  column: 'firstId' | 'secondId' | 'thirdId' | 'fourthId',
  year: number,
) {
  return (eb: any) =>
    jsonObjectFrom(
      eb
        .selectFrom('team')
        .leftJoin('team_season', (join: any) =>
          join
            .onRef('team_season.teamId', '=', 'team.id')
            .on('team_season.year', '=', year),
        )
        .select([
          ...teamColumns,
          eb.fn
            .coalesce('team_season.playoffSeed', 'team.playoffSeed')
            .as('playoffSeed'),
        ])
        .whereRef('team.id', '=', `divisionBet.${column}`),
    );
}

/**
 * One query for the whole table. The Nest controller issued two per league
 * member on top of three collection queries, which is 43 round trips for a
 * twenty-person league.
 */
export async function leaderboardRows(
  leagueId: string,
  year: number,
  reveal: { divBets: boolean; sbBet: boolean; viewerId: string },
): Promise<LeaderboardRow[]> {
  const rows = await db()
    .selectFrom('member')
    .innerJoin('user', 'user.id', 'member.userId')
    .where('member.leagueId', '=', leagueId)
    .select((eb) => [
      'user.id as id',
      'user.name as name',
      jsonArrayFrom(
        eb
          .selectFrom('game')
          .innerJoin('week', 'week.id', 'game.weekId')
          .where('week.year', '=', year)
          .where('game.status', '=', 'STATUS_FINAL')
          .where((inner) =>
            inner.exists(
              inner
                .selectFrom('bet')
                .whereRef('bet.gameId', '=', 'game.id')
                .where('bet.leagueId', '=', leagueId),
            ),
          )
          .select((game) => [
            'game.id as gameId',
            game
              .selectFrom('bet')
              .select('bet.id')
              .whereRef('bet.gameId', '=', 'game.id')
              .whereRef('bet.userId', '=', 'user.id')
              .where('bet.leagueId', '=', leagueId)
              .as('betId'),
            game
              .selectFrom('bet')
              .select('bet.winner')
              .whereRef('bet.gameId', '=', 'game.id')
              .whereRef('bet.userId', '=', 'user.id')
              .where('bet.leagueId', '=', leagueId)
              .as('winner'),
            game
              .selectFrom('bet')
              .select('bet.pointDiff')
              .whereRef('bet.gameId', '=', 'game.id')
              .whereRef('bet.userId', '=', 'user.id')
              .where('bet.leagueId', '=', leagueId)
              .as('pointDiff'),
            game
              .exists(
                game
                  .selectFrom('betDoubler')
                  .whereRef('betDoubler.gameId', '=', 'game.id')
                  .whereRef('betDoubler.userId', '=', 'user.id')
                  .where('betDoubler.leagueId', '=', leagueId),
              )
              .as('doubled'),
          ]),
      ).as('bets'),
      jsonArrayFrom(
        eb
          .selectFrom('divisionBet')
          .where('divisionBet.leagueId', '=', leagueId)
          .where('divisionBet.year', '=', year)
          .whereRef('divisionBet.userId', '=', 'user.id')
          .select((bet) => [
            'divisionBet.divisionName as name',
            pick('firstId', year)(bet).as('first'),
            pick('secondId', year)(bet).as('second'),
            pick('thirdId', year)(bet).as('third'),
            pick('fourthId', year)(bet).as('fourth'),
          ]),
      ).as('divBets'),
      jsonObjectFrom(
        eb
          .selectFrom('superbowlBet')
          .where('superbowlBet.leagueId', '=', leagueId)
          .where('superbowlBet.year', '=', year)
          .whereRef('superbowlBet.userId', '=', 'user.id')
          .select((bet) => [
            jsonObjectFrom(
              bet
                .selectFrom('team')
                .select([...teamColumns, 'team.playoffSeed as playoffSeed'])
                .whereRef('team.id', '=', 'superbowlBet.teamId'),
            ).as('team'),
          ]),
      ).as('sbBet'),
    ])
    .execute();

  // The reveal rules are per viewer, so they are applied after the read rather
  // than folded into it: hiding is about who is asking, not about the data.
  return rows.map((row) => ({
    ...row,
    divBets:
      reveal.divBets || row.id === reveal.viewerId ? row.divBets : ([] as any),
    sbBet: reveal.sbBet || row.id === reveal.viewerId ? row.sbBet : null,
  })) as LeaderboardRow[];
}

export async function finishedGames(
  leagueId: string,
  year: number,
): Promise<LeaderboardGame[]> {
  return db()
    .selectFrom('game')
    .innerJoin('week', 'week.id', 'game.weekId')
    .where('week.year', '=', year)
    .where('game.status', '=', 'STATUS_FINAL')
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom('bet')
          .whereRef('bet.gameId', '=', 'game.id')
          .where('bet.leagueId', '=', leagueId),
      ),
    )
    .select((eb) => [
      'game.id as id',
      'game.homeScore as homeScore',
      'game.awayScore as awayScore',
      jsonArrayFrom(
        eb
          .selectFrom('bet')
          .select(['bet.winner as winner', 'bet.userId as userId'])
          .whereRef('bet.gameId', '=', 'game.id')
          .where('bet.leagueId', '=', leagueId),
      ).as('allBets'),
    ])
    .execute() as Promise<LeaderboardGame[]>;
}

export async function currentWeek(): Promise<{
  year: number;
  seasontype: number;
  week: number;
}> {
  const week = await db()
    .selectFrom('week')
    .select(['year', 'seasontype', 'week'])
    .where('end', '>', new Date())
    .orderBy('end', 'asc')
    .executeTakeFirst();

  if (week) {
    return week;
  }

  const last = await db()
    .selectFrom('week')
    .select(['year', 'seasontype', 'week'])
    .orderBy('end', 'desc')
    .executeTakeFirstOrThrow();

  return last;
}

export async function superbowlWinner(
  year: number,
): Promise<LeaderboardTeam | null> {
  const game = await db()
    .selectFrom('game')
    .innerJoin('week', 'week.id', 'game.weekId')
    .where('week.year', '=', year)
    .where('week.seasontype', '=', 3)
    .where('week.week', '=', 5)
    .where('game.status', '=', 'STATUS_FINAL')
    .select(['game.winner as winner', 'game.homeTeamId', 'game.awayTeamId'])
    .executeTakeFirst();

  if (!game || game.winner === 'none') {
    return null;
  }

  const teamId = game.winner === 'home' ? game.homeTeamId : game.awayTeamId;
  if (!teamId) {
    return null;
  }

  return (
    (await db()
      .selectFrom('team')
      .select([
        'id',
        'abbreviation',
        'name',
        'shortName',
        'logo',
        'playoffSeed',
      ])
      .where('id', '=', teamId)
      .executeTakeFirst()) ?? null
  );
}

export async function leagueOf(
  leagueId: string,
): Promise<{ id: string; name: string; season: number } | undefined> {
  return db()
    .selectFrom('league')
    .select(['id', 'name', 'season'])
    .where('id', '=', leagueId)
    .executeTakeFirst();
}

export async function leaguesOf(
  userId: string,
): Promise<{ id: string; name: string; season: number }[]> {
  return db()
    .selectFrom('league')
    .innerJoin('member', 'member.leagueId', 'league.id')
    .where('member.userId', '=', userId)
    .select([
      'league.id as id',
      'league.name as name',
      'league.season as season',
    ])
    .orderBy('league.season', 'desc')
    .orderBy('league.name', 'asc')
    .execute();
}

export interface ScheduleWeek {
  id: string;
  label: string;
  seasontype: number;
  week: number;
  games: {
    id: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeScore: number;
    awayScore: number;
    winner: string;
    status: string;
  }[];
}

/** Feeds the statistics tables, which group bets by week and by team. */
export async function seasonSchedule(year: number): Promise<ScheduleWeek[]> {
  return db()
    .selectFrom('week')
    .where('week.year', '=', year)
    .orderBy('week.seasontype', 'asc')
    .orderBy('week.week', 'asc')
    .select((eb) => [
      'week.id as id',
      'week.label as label',
      'week.seasontype as seasontype',
      'week.week as week',
      jsonArrayFrom(
        eb
          .selectFrom('game')
          .whereRef('game.weekId', '=', 'week.id')
          .orderBy('game.date', 'asc')
          .select([
            'game.id as id',
            'game.homeTeamId as homeTeamId',
            'game.awayTeamId as awayTeamId',
            'game.homeScore as homeScore',
            'game.awayScore as awayScore',
            'game.winner as winner',
            'game.status as status',
          ]),
      ).as('games'),
    ])
    .execute() as Promise<ScheduleWeek[]>;
}

export async function seasonTeams(year: number): Promise<LeaderboardTeam[]> {
  return db()
    .selectFrom('team')
    .leftJoin('team_season', (join) =>
      join
        .onRef('team_season.teamId', '=', 'team.id')
        .on('team_season.year', '=', year),
    )
    .select((eb) => [
      'team.id as id',
      'team.abbreviation as abbreviation',
      'team.name as name',
      'team.shortName as shortName',
      'team.logo as logo',
      eb.fn
        .coalesce('team_season.playoffSeed', 'team.playoffSeed')
        .as('playoffSeed'),
    ])
    .orderBy('team.abbreviation', 'asc')
    .execute() as Promise<LeaderboardTeam[]>;
}

/**
 * Counts only, never attributed, which is why this is not behind the reveal
 * rules: it is the same data the Nest app served from /leaderboard/divisions.
 */
export async function anonymousBets(
  leagueId: string,
  year: number,
): Promise<{
  division: {
    firstId: string | null;
    secondId: string | null;
    thirdId: string | null;
    fourthId: string | null;
  }[];
  sb: { teamId: string | null }[];
}> {
  const [division, sb] = await Promise.all([
    db()
      .selectFrom('divisionBet')
      .select(['firstId', 'secondId', 'thirdId', 'fourthId'])
      .where('leagueId', '=', leagueId)
      .where('year', '=', year)
      .execute(),
    db()
      .selectFrom('superbowlBet')
      .select(['teamId'])
      .where('leagueId', '=', leagueId)
      .where('year', '=', year)
      .execute(),
  ]);

  return { division, sb };
}

export async function divisionsWithTeams(
  year: number,
): Promise<{ name: string; teams: LeaderboardTeam[] }[]> {
  const teams = await db()
    .selectFrom('team')
    .leftJoin('team_season', (join) =>
      join
        .onRef('team_season.teamId', '=', 'team.id')
        .on('team_season.year', '=', year),
    )
    .select((eb) => [
      'team.id as id',
      'team.abbreviation as abbreviation',
      'team.name as name',
      'team.shortName as shortName',
      'team.logo as logo',
      eb.fn
        .coalesce('team_season.divisionName', 'team.divisionName')
        .as('divisionName'),
      eb.fn
        .coalesce('team_season.playoffSeed', 'team.playoffSeed')
        .as('playoffSeed'),
    ])
    .execute();

  const byDivision = new Map<string, LeaderboardTeam[]>();
  for (const team of teams) {
    if (!team.divisionName) {
      continue;
    }
    const list = byDivision.get(team.divisionName) ?? [];
    list.push(team as LeaderboardTeam);
    byDivision.set(team.divisionName, list);
  }

  return [...byDivision.entries()]
    .map(([name, list]) => ({
      name,
      teams: list.sort(
        (a, b) =>
          (a.playoffSeed ?? Number.POSITIVE_INFINITY) -
          (b.playoffSeed ?? Number.POSITIVE_INFINITY),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
