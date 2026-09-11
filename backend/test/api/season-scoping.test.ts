import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DivisionBetEntity,
  LeagueEntity,
  TeamEntity,
  TeamSeasonEntity,
} from '../../src/database/entity';
import { TestDatabase } from '../support/database';
import { ApiApp, bootApiApp } from './app';
import { freshDatabase } from './database';
import {
  createLeague,
  createUser,
  seedTeams,
  seedWeek,
  SEASON,
  TestUser,
} from './fixtures';

const PAST = SEASON - 1;

let database: TestDatabase;
let api: ApiApp;
let player: TestUser;
let teams: TeamEntity[];
let league: LeagueEntity;

const auth = (user: TestUser) => ({
  Authorization: `Bearer ${api.tokenFor(user)}`,
});

async function setSeeds(year: number, order: string[]): Promise<void> {
  const repo = api.dataSource.getRepository(TeamSeasonEntity);
  await repo.save(
    order.map((abbreviation, index) => {
      const team = teams.find((t) => t.abbreviation === abbreviation)!;
      return {
        teamId: team.id,
        year,
        logo: team.logo,
        abbreviation: team.abbreviation,
        shortName: team.shortName,
        name: team.name,
        divisionName: 'AFC North',
        playoffSeed: index + 1,
      };
    }),
  );
}

async function setCurrentSeeds(order: string[]): Promise<void> {
  const repo = api.dataSource.getRepository(TeamEntity);
  for (const [index, abbreviation] of order.entries()) {
    const team = teams.find((t) => t.abbreviation === abbreviation)!;
    await repo.update({ id: team.id }, { playoffSeed: index + 1 });
  }
}

async function divisionPointsOf(user: TestUser): Promise<number> {
  const response = await request(api.server)
    .get('/leaderboard')
    .query({ league: league.id, season: PAST })
    .set(auth(user));

  expect(response.status).toBe(200);
  const me = response.body.find((entry: any) => entry.user.id === user.id);
  return me.points.divBets;
}

beforeAll(async () => {
  database = await freshDatabase();
  api = await bootApiApp(database.url);
  teams = await seedTeams(api);
  player = await createUser(api, { name: 'player' });

  // A finished season, and a current week inside a later one.
  await seedWeek(api, teams, [{ kickoff: new Date('2025-09-07T17:00:00Z') }], {
    year: PAST,
  });
  await seedWeek(api, teams, [{ kickoff: new Date('2026-09-06T17:00:00Z') }], {
    year: SEASON,
  });

  league = await createLeague(api, player, 'Historische Liga');
  await api.dataSource
    .getRepository(LeagueEntity)
    .update({ id: league.id }, { season: PAST });

  // A perfect bet for that season: BAL, CIN, CLE, PIT in that order.
  const order = ['BAL', 'CIN', 'CLE', 'PIT'];
  const [first, second, third, fourth] = order.map(
    (a) => teams.find((t) => t.abbreviation === a)!,
  );
  await api.dataSource.getRepository(DivisionBetEntity).save({
    user: { id: player.id },
    league: { id: league.id },
    division: { name: 'AFC North' },
    year: PAST,
    first,
    second,
    third,
    fourth,
  });

  await setSeeds(PAST, order);
});

afterAll(async () => {
  await api?.close();
  await database?.stop();
});

describe('a finished season', () => {
  it('scores a perfect division bet against that season', async () => {
    await setCurrentSeeds(['BAL', 'CIN', 'CLE', 'PIT']);

    expect(await divisionPointsOf(player)).toBe(15);
  });

  it('keeps the score when a later import reorders the standings', async () => {
    // Exactly the reproduction in #40: nothing about the league, the bet or the
    // games changes, only the seeds the importer last wrote.
    await setCurrentSeeds(['PIT', 'CLE', 'CIN', 'BAL']);

    expect(await divisionPointsOf(player)).toBe(15);
  });

  it('follows the recorded seeds when they say the bet was wrong', async () => {
    await setSeeds(PAST, ['PIT', 'CLE', 'CIN', 'BAL']);

    expect(await divisionPointsOf(player)).toBe(0);
  });
});
