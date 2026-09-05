import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  BetDoublerEntity,
  GameEntity,
  TeamEntity,
  UserEntity,
  WeekEntity,
} from '../../src/database/entity';
import { TestDatabase } from '../support/database';
import { ApiApp, bootApiApp } from './app';
import { freshDatabase } from './database';
import {
  addMember,
  createLeague,
  createUser,
  SEASON,
  seedTeams,
  seedWeek,
  TestUser,
} from './fixtures';

let database: TestDatabase;
let api: ApiApp;
let admin: TestUser;
let member: TestUser;
let teams: TeamEntity[];
let league: { id: string };
let week: WeekEntity;
let games: GameEntity[];

const auth = (user: TestUser) => ({
  Authorization: `Bearer ${api.tokenFor(user)}`,
});
const inAnHour = () => new Date(Date.now() + 60 * 60 * 1000);
const anHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

async function setKickoff(game: GameEntity, at: Date): Promise<void> {
  await api.dataSource
    .getRepository(GameEntity)
    .update({ id: game.id }, { date: at });
}

async function doublersOf(user: TestUser): Promise<{ game: string }[]> {
  const response = await request(api.server)
    .get('/bet/doubler')
    .query({ league: league.id, season: SEASON })
    .set(auth(user))
    .expect(200);
  return response.body;
}

beforeAll(async () => {
  database = await freshDatabase();
  api = await bootApiApp(database.url);
  teams = await seedTeams(api);
  admin = await createUser(api, { name: 'admin' });
  member = await createUser(api, { name: 'member' });
  league = await createLeague(api, admin, 'Doublerliga');
  await addMember(api, league as never, admin, member);
  ({ week, games } = await seedWeek(api, teams, [
    { kickoff: inAnHour() },
    { kickoff: inAnHour() },
  ]));
});

afterAll(async () => {
  await api?.close();
  await database?.stop();
});

beforeEach(async () => {
  await api.dataSource
    .getRepository(BetDoublerEntity)
    .createQueryBuilder()
    .delete()
    .execute();
  await setKickoff(games[0], inAnHour());
  await setKickoff(games[1], inAnHour());
});

describe('setting a doubler', () => {
  it('doubles a game of the week', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);

    expect(await doublersOf(member)).toMatchObject([
      { game: games[0].id, week: week.id },
    ]);
  });

  // #100: findBetDoublers does not load the league relation.
  it.fails('reports the league a doubler belongs to', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);

    expect(await doublersOf(member)).toEqual([
      { game: games[0].id, week: week.id, league: league.id },
    ]);
  });

  it('moves the doubler to another game of the same week', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);

    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[1].id, week: week.id, league: league.id })
      .expect(201);

    expect(await doublersOf(member)).toMatchObject([
      { game: games[1].id, week: week.id },
    ]);
  });

  it('refuses to move a doubler once the doubled game has started', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);
    await setKickoff(games[0], anHourAgo());

    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[1].id, week: week.id, league: league.id })
      .expect(400);
  });

  it('refuses to double a game that has started', async () => {
    await setKickoff(games[0], anHourAgo());

    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(400);
  });

  it('rejects a doubler without a week', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, league: league.id })
      .expect(400);
  });

  it('allows only one doubler per week and league', async () => {
    const repository = api.dataSource.getRepository(BetDoublerEntity);
    const user = await api.dataSource
      .getRepository(UserEntity)
      .findOneBy({ id: member.id });
    await repository.save({ game: games[0], user, week, league });

    await expect(
      repository.insert({ game: games[1], user, week, league }),
    ).rejects.toThrow();
  });
});

describe('removing a doubler', () => {
  it('removes the doubler of the week', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);

    await request(api.server)
      .delete('/bet/doubler')
      .set(auth(member))
      .send({ week: week.id, league: league.id })
      .expect(200);

    expect(await doublersOf(member)).toEqual([]);
  });

  it('refuses to remove a doubler once the doubled game has started', async () => {
    await request(api.server)
      .post('/bet/doubler')
      .set(auth(member))
      .send({ game: games[0].id, week: week.id, league: league.id })
      .expect(201);
    await setKickoff(games[0], anHourAgo());

    await request(api.server)
      .delete('/bet/doubler')
      .set(auth(member))
      .send({ week: week.id, league: league.id })
      .expect(400);
  });

  it('rejects removing a doubler that does not exist', async () => {
    await request(api.server)
      .delete('/bet/doubler')
      .set(auth(member))
      .send({ week: week.id, league: league.id })
      .expect(400);
  });
});
