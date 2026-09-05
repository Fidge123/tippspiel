import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  BetEntity,
  DivisionBetEntity,
  GameEntity,
  SuperbowlBetEntity,
  TeamEntity,
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
let stranger: TestUser;
let teams: TeamEntity[];
let league: { id: string };
let otherLeague: { id: string };
let game: GameEntity;

const auth = (user: TestUser) => ({
  Authorization: `Bearer ${api.tokenFor(user)}`,
});
const inASecond = () => new Date(Date.now() + 1000);
const aSecondAgo = () => new Date(Date.now() - 1000);

async function setKickoff(at: Date): Promise<void> {
  await api.dataSource
    .getRepository(GameEntity)
    .update({ id: game.id }, { date: at });
}

beforeAll(async () => {
  database = await freshDatabase();
  api = await bootApiApp(database.url);
  teams = await seedTeams(api);
  admin = await createUser(api, { name: 'admin' });
  member = await createUser(api, { name: 'member' });
  stranger = await createUser(api, { name: 'stranger' });
  league = await createLeague(api, admin, 'Wettliga');
  await addMember(api, league as never, admin, member);
  otherLeague = await createLeague(api, stranger, 'Fremde Liga');
  game = (await seedWeek(api, teams, [{ kickoff: inASecond() }])).games[0];
});

afterAll(async () => {
  await api?.close();
  await database?.stop();
});

describe('game bets', () => {
  it('accepts a bet a second before kickoff', async () => {
    await setKickoff(inASecond());

    const response = await request(api.server)
      .post('/bet')
      .set(auth(member))
      .send({
        gameId: game.id,
        leagueId: league.id,
        winner: 'home',
        pointDiff: 3,
      })
      .expect(201);

    expect(response.body.winner).toBe('home');
    expect(response.body.pointDiff).toBe(3);
  });

  it('shows the bet to the whole league', async () => {
    await setKickoff(inASecond());
    await api.bets.setGameBet(
      { gameId: game.id, leagueId: league.id, winner: 'home', pointDiff: 3 },
      member.id,
    );

    const response = await request(api.server)
      .get('/bet')
      .query({ league: league.id, season: SEASON })
      .set(auth(member))
      .expect(200);

    expect(response.body).toContainEqual({
      id: game.id,
      bets: { home: 1, away: 0 },
      selected: 'home',
      points: 3,
    });
  });

  it('stores no bet placed a second after kickoff', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server).post('/bet').set(auth(stranger)).send({
      gameId: game.id,
      leagueId: league.id,
      winner: 'away',
      pointDiff: 1,
    });

    expect(
      await api.dataSource
        .getRepository(BetEntity)
        .countBy({ user: { id: stranger.id } }),
    ).toBe(0);
  });

  // #10: a bet after kickoff resolves undefined instead of throwing.
  it.fails('rejects a bet placed a second after kickoff', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server)
      .post('/bet')
      .set(auth(member))
      .send({
        gameId: game.id,
        leagueId: league.id,
        winner: 'away',
        pointDiff: 1,
      })
      .expect(400);
  });

  it('rejects a stake outside one to five', async () => {
    await setKickoff(inASecond());

    for (const pointDiff of [0, 6]) {
      await request(api.server)
        .post('/bet')
        .set(auth(member))
        .send({
          gameId: game.id,
          leagueId: league.id,
          winner: 'home',
          pointDiff,
        })
        .expect(400);
    }
  });

  it('rejects a bet without a league', async () => {
    await setKickoff(inASecond());

    await request(api.server)
      .post('/bet')
      .set(auth(member))
      .send({ gameId: game.id, winner: 'home', pointDiff: 3 })
      .expect(400);
  });

  it('rejects reading bets without a league', async () => {
    await request(api.server)
      .get('/bet')
      .query({ season: SEASON })
      .set(auth(member))
      .expect(400);
  });

  // #99: no ValidationPipe and no decorators on CreateBetDto, winner is any string.
  it.fails('rejects an unknown winner', async () => {
    await setKickoff(inASecond());

    await request(api.server)
      .post('/bet')
      .set(auth(member))
      .send({
        gameId: game.id,
        leagueId: league.id,
        winner: 'unentschieden',
        pointDiff: 3,
      })
      .expect(400);
  });

  // #99: nothing checks that the better is a member of the league they bet in.
  it.fails('rejects a bet in a league the user is not a member of', async () => {
    await setKickoff(inASecond());

    await request(api.server)
      .post('/bet')
      .set(auth(member))
      .send({
        gameId: game.id,
        leagueId: otherLeague.id,
        winner: 'home',
        pointDiff: 3,
      })
      .expect(400);
  });
});

describe('division bets', () => {
  const divisionBet = () => ({
    division: teams[0].division.name,
    teams: teams.slice(0, 4).map((team) => team.id),
    year: SEASON,
    league: league.id,
  });

  it('accepts a bet a second before the first kickoff of the season', async () => {
    await setKickoff(inASecond());

    const response = await request(api.server)
      .post('/bet/division')
      .set(auth(member))
      .send(divisionBet())
      .expect(201);

    expect(response.body.first.id).toBe(teams[0].id);
  });

  it('stores no bet placed after the first kickoff of the season', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server)
      .post('/bet/division')
      .set(auth(stranger))
      .send(divisionBet());

    expect(
      await api.dataSource
        .getRepository(DivisionBetEntity)
        .countBy({ user: { id: stranger.id } }),
    ).toBe(0);
  });

  // #10: a bet after the deadline resolves undefined instead of throwing.
  it.fails('rejects a bet placed after the first kickoff', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server)
      .post('/bet/division')
      .set(auth(member))
      .send(divisionBet())
      .expect(400);
  });

  it('rejects a bet without a league', async () => {
    await setKickoff(inASecond());

    await request(api.server)
      .post('/bet/division')
      .set(auth(member))
      .send({ ...divisionBet(), league: undefined })
      .expect(400);
  });
});

describe('super bowl bets', () => {
  const sbBet = () => ({
    teamId: teams[0].id,
    leagueId: league.id,
    year: SEASON,
  });

  it('accepts a bet a second before the first kickoff of the season', async () => {
    await setKickoff(inASecond());

    const response = await request(api.server)
      .post('/bet/superbowl')
      .set(auth(member))
      .send(sbBet())
      .expect(201);

    expect(response.body.team.id).toBe(teams[0].id);
  });

  it('stores no bet placed after the first kickoff of the season', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server)
      .post('/bet/superbowl')
      .set(auth(stranger))
      .send(sbBet());

    expect(
      await api.dataSource
        .getRepository(SuperbowlBetEntity)
        .countBy({ user: { id: stranger.id } }),
    ).toBe(0);
  });

  // #10: a bet after the deadline resolves undefined instead of throwing.
  it.fails('rejects a bet placed after the first kickoff', async () => {
    await setKickoff(aSecondAgo());

    await request(api.server)
      .post('/bet/superbowl')
      .set(auth(member))
      .send(sbBet())
      .expect(400);
  });

  it('rejects a bet without a league', async () => {
    await setKickoff(inASecond());

    await request(api.server)
      .post('/bet/superbowl')
      .set(auth(member))
      .send({ ...sbBet(), leagueId: undefined })
      .expect(400);
  });
});
