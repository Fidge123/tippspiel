import { db } from '../db/kysely';
import { season } from '../config';
import {
  BASE_URL,
  findStat,
  getWinner,
  loadGroups,
  loadScoreboard,
  notify,
  type WeekKey,
} from './espn';
import type { NFLEvent, Team } from './espn.types';
import { recordToFile } from './record';

export const regularSeason = { seasonType: 2, weeks: 18 };
export const postSeason = { seasonType: 3, weeks: [1, 2, 3, 5] };

async function upsertDivision(name: string): Promise<void> {
  await db()
    .insertInto('division')
    .values({ name })
    .onConflict((c) => c.column('name').doNothing())
    .execute();
}

async function upsertTeam(
  team: Team,
  divisionName: string,
  year: number,
): Promise<void> {
  const state = {
    logo: team.logos![0].href.split('/').reverse()[0],
    abbreviation: team.abbreviation,
    shortName: team.shortDisplayName,
    name: team.displayName,
    playoffSeed: findStat(team, 'playoffSeed'),
    wins: findStat(team, 'wins'),
    losses: findStat(team, 'losses'),
    ties: findStat(team, 'ties'),
    pointsFor: findStat(team, 'pointsFor'),
    pointsAgainst: findStat(team, 'pointsAgainst'),
    streak: findStat(team, 'streak'),
    color1: team.color,
    color2: team.alternateColor,
  };

  await db()
    .insertInto('team')
    .values({ id: team.uid, divisionName, ...state })
    .onConflict((c) => c.column('id').doUpdateSet({ divisionName, ...state }))
    .execute();

  await db()
    .insertInto('team_season')
    .values({ teamId: team.uid, year, divisionName, ...state })
    .onConflict((c) =>
      c.columns(['teamId', 'year']).doUpdateSet({ divisionName, ...state }),
    )
    .execute();
}

export async function importMasterData(year: number = season): Promise<void> {
  const data = await loadGroups();

  await recordToFile('groups', data);

  for (const conference of data.groups as { children: unknown[] }[]) {
    for (const division of conference.children as {
      name: string;
      teams: { id: string }[];
    }[]) {
      await importTeamsOfDivision(division, year);
    }
  }
}

export async function importTeamsOfDivision(
  division: { name: string; teams: { id: string }[] },
  year: number,
): Promise<void> {
  await upsertDivision(division.name);

  try {
    const responses = await Promise.all(
      division.teams.map((team) =>
        fetch(`${BASE_URL}teams/${team.id}`).then((r) => r.json()),
      ),
    );

    await recordToFile(`teams-${division.name}`, responses);

    for (const { team } of responses as { team: Team }[]) {
      await upsertTeam(team, division.name, year);
    }
  } catch (error) {
    await notify(`${BASE_URL}teams/<team.id>`);
    console.error('Error during import of divisions', (error as Error)?.stack);
  }
}

export async function importWeek(key: WeekKey): Promise<void> {
  let response: Awaited<ReturnType<typeof loadScoreboard>>;
  try {
    response = await loadScoreboard(key);
  } catch (error) {
    console.error((error as Error)?.message ?? error);
    return;
  }

  await recordToFile(
    `scoreboard-${key.year}-${key.seasontype}-${key.week}`,
    response,
  );

  const calendar =
    response.leagues[0].calendar[key.seasontype - 1].entries[key.week - 1];
  const weekId = `${key.year}-${key.seasontype}-${key.week}`;

  const week = {
    id: weekId,
    year: key.year,
    seasontype: key.seasontype,
    week: key.week,
    start: new Date(calendar.startDate),
    end: new Date(calendar.endDate),
    label: calendar.label,
  };

  await db()
    .insertInto('week')
    .values(week)
    .onConflict((c) => c.column('id').doUpdateSet(week))
    .execute();

  for (const event of response.events) {
    await upsertGame(event, weekId);
  }

  for (const team of response.week.teamsOnBye ?? []) {
    await upsertBye(team.uid, weekId);
  }
}

async function upsertGame(event: NFLEvent, weekId: string): Promise<void> {
  const competition = event.competitions[0];
  const home = competition.competitors.find((c) => c.homeAway === 'home')!;
  const away = competition.competitors.find((c) => c.homeAway === 'away')!;

  // The Pro Bowl fields teams that are in no division and therefore in no team
  // row, so the reference has to drop rather than fail the import.
  const known = new Set(
    (
      await db()
        .selectFrom('team')
        .select('id')
        .where('id', 'in', [home.uid, away.uid])
        .execute()
    ).map((row) => row.id),
  );

  const game = {
    date: new Date(event.date),
    weekId,
    homeTeamId: known.has(home.uid) ? home.uid : null,
    awayTeamId: known.has(away.uid) ? away.uid : null,
    homeScore: Number.parseInt(home.score, 10),
    awayScore: Number.parseInt(away.score, 10),
    winner: getWinner(home, away),
    status: competition.status.type.name,
  };

  await db()
    .insertInto('game')
    .values({ id: event.uid, ...game })
    .onConflict((c) => c.column('id').doUpdateSet(game))
    .execute();
}

async function upsertBye(teamId: string, weekId: string): Promise<void> {
  const existing = await db()
    .selectFrom('bye')
    .select('id')
    .where('weekId', '=', weekId)
    .where('teamId', '=', teamId)
    .executeTakeFirst();

  if (!existing) {
    await db().insertInto('bye').values({ teamId, weekId }).execute();
  }
}

export async function importSchedule(year: number = season): Promise<void> {
  for (let week = 1; week <= regularSeason.weeks; week++) {
    await importWeek({ year, seasontype: regularSeason.seasonType, week });
  }
  for (const week of postSeason.weeks) {
    await importWeek({ year, seasontype: postSeason.seasonType, week });
  }
}

/** Re-imports the weeks of every game that started in the last four hours. */
export async function updateGames(): Promise<void> {
  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  const rows = await db()
    .selectFrom('game')
    .innerJoin('week', 'week.id', 'game.weekId')
    .select([
      'week.year as year',
      'week.seasontype as seasontype',
      'week.week as week',
    ])
    .where((eb) =>
      eb.or([
        eb.and([
          eb('game.date', '>=', fourHoursAgo),
          eb('game.date', '<=', now),
        ]),
        eb('game.status', '=', 'STATUS_IN_PROGRESS'),
      ]),
    )
    .execute();

  const seen = new Set<string>();
  for (const row of rows) {
    const id = `${row.year}-${row.seasontype}-${row.week}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    await importWeek(row);
  }
}
