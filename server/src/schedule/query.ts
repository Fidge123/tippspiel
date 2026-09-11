import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '../db/kysely';

export interface TeamView {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  color1: string | null;
  color2: string | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
}

export interface StatLine {
  name: string;
  winner: string;
  bet: number;
  doubler: boolean;
}

export interface ScheduleGame {
  id: string;
  date: Date;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  myWinner: string | null;
  myPointDiff: number | null;
  homeVotes: number;
  awayVotes: number;
  stats: StatLine[];
}

export interface ScheduleWeekView {
  id: string;
  label: string;
  start: Date;
  end: Date;
  year: number;
  seasontype: number;
  week: number;
  byes: string[];
  games: ScheduleGame[];
  doublerGameId: string | null;
}

/**
 * Records come from team_season for the year on screen, so a 2022 week shows
 * the 2022 records rather than today's (#40).
 */
export async function teamsForSeason(
  year: number,
): Promise<Map<string, TeamView>> {
  const rows = await db()
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
      eb.fn.coalesce('team_season.color1', 'team.color1').as('color1'),
      eb.fn.coalesce('team_season.color2', 'team.color2').as('color2'),
      eb.fn.coalesce('team_season.wins', 'team.wins').as('wins'),
      eb.fn.coalesce('team_season.losses', 'team.losses').as('losses'),
      eb.fn.coalesce('team_season.ties', 'team.ties').as('ties'),
    ])
    .execute();

  return new Map(rows.map((row) => [row.id, row as TeamView]));
}

/** The whole schedule, the viewer's bets and the votes, in one read. */
export async function scheduleFor(
  leagueId: string,
  year: number,
  userId: string,
): Promise<ScheduleWeekView[]> {
  const rows = await db()
    .selectFrom('week')
    .where('week.year', '=', year)
    .orderBy('week.seasontype', 'asc')
    .orderBy('week.week', 'asc')
    .select((eb) => [
      'week.id as id',
      'week.label as label',
      'week.start as start',
      'week.end as end',
      'week.year as year',
      'week.seasontype as seasontype',
      'week.week as week',
      eb
        .selectFrom('betDoubler')
        .select('betDoubler.gameId')
        .whereRef('betDoubler.weekId', '=', 'week.id')
        .where('betDoubler.userId', '=', userId)
        .where('betDoubler.leagueId', '=', leagueId)
        .as('doublerGameId'),
      jsonArrayFrom(
        eb
          .selectFrom('bye')
          .innerJoin('team', 'team.id', 'bye.teamId')
          .whereRef('bye.weekId', '=', 'week.id')
          .select(['team.shortName as shortName'])
          .orderBy('team.shortName', 'asc'),
      ).as('byeRows'),
      jsonArrayFrom(
        eb
          .selectFrom('game')
          .whereRef('game.weekId', '=', 'week.id')
          .orderBy('game.date', 'asc')
          .orderBy('game.id', 'asc')
          .select((game) => [
            'game.id as id',
            'game.date as date',
            'game.status as status',
            'game.homeScore as homeScore',
            'game.awayScore as awayScore',
            'game.homeTeamId as homeTeamId',
            'game.awayTeamId as awayTeamId',
            game
              .selectFrom('bet')
              .select('bet.winner')
              .whereRef('bet.gameId', '=', 'game.id')
              .where('bet.userId', '=', userId)
              .where('bet.leagueId', '=', leagueId)
              .as('myWinner'),
            game
              .selectFrom('bet')
              .select('bet.pointDiff')
              .whereRef('bet.gameId', '=', 'game.id')
              .where('bet.userId', '=', userId)
              .where('bet.leagueId', '=', leagueId)
              .as('myPointDiff'),
            game
              .selectFrom('bet')
              .select((b) => b.fn.countAll<number>().as('n'))
              .whereRef('bet.gameId', '=', 'game.id')
              .where('bet.leagueId', '=', leagueId)
              .where('bet.winner', '=', 'home')
              .as('homeVotes'),
            game
              .selectFrom('bet')
              .select((b) => b.fn.countAll<number>().as('n'))
              .whereRef('bet.gameId', '=', 'game.id')
              .where('bet.leagueId', '=', leagueId)
              .where('bet.winner', '=', 'away')
              .as('awayVotes'),
            jsonArrayFrom(
              game
                .selectFrom('bet')
                .innerJoin('user', 'user.id', 'bet.userId')
                .whereRef('bet.gameId', '=', 'game.id')
                .where('bet.leagueId', '=', leagueId)
                .select((b) => [
                  'user.name as name',
                  'bet.winner as winner',
                  'bet.pointDiff as bet',
                  b
                    .exists(
                      b
                        .selectFrom('betDoubler')
                        .whereRef('betDoubler.gameId', '=', 'bet.gameId')
                        .whereRef('betDoubler.userId', '=', 'bet.userId')
                        .where('betDoubler.leagueId', '=', leagueId),
                    )
                    .as('doubler'),
                ]),
            ).as('stats'),
          ]),
      ).as('games'),
    ])
    .execute();

  return rows.map((row) => ({
    ...row,
    byes: (row.byeRows as { shortName: string }[]).map((b) => b.shortName),
    games: (row.games as unknown as ScheduleGame[]).map((game) => ({
      ...game,
      date: new Date(game.date),
      homeVotes: Number(game.homeVotes ?? 0),
      awayVotes: Number(game.awayVotes ?? 0),
    })),
  })) as ScheduleWeekView[];
}
