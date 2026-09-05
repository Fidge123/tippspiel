import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  BetDoublerEntity,
  BetEntity,
  DivisionBetEntity,
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
  reload,
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

const auth = (user: TestUser) => ({
  Authorization: `Bearer ${api.tokenFor(user)}`,
});

beforeAll(async () => {
  database = await freshDatabase();
  api = await bootApiApp(database.url);
  teams = await seedTeams(api);
  admin = await createUser(api, { name: 'admin' });
  member = await createUser(api, { name: 'member' });
  stranger = await createUser(api, { name: 'stranger' });
});

afterAll(async () => {
  await api?.close();
  await database?.stop();
});

async function leagueWithMember(name: string) {
  const league = await createLeague(api, admin, name);
  await addMember(api, league, admin, member);
  return league;
}

describe('membership', () => {
  it('makes the creator admin and member', async () => {
    const response = await request(api.server)
      .post('/leagues')
      .set(auth(admin))
      .send({ name: 'Neue Liga' })
      .expect(201);

    expect(response.body.members.map((m: TestUser) => m.id)).toEqual([
      admin.id,
    ]);
    expect(response.body.admins.map((a: TestUser) => a.id)).toEqual([admin.id]);
    expect(response.body.season).toBe(SEASON);
  });

  it('lists only the leagues the user belongs to', async () => {
    const league = await leagueWithMember('Sichtbare Liga');

    const mine = await request(api.server)
      .get('/leagues')
      .set(auth(member))
      .expect(200);
    const theirs = await request(api.server)
      .get('/leagues')
      .set(auth(stranger))
      .expect(200);

    expect(mine.body.map((l: { id: string }) => l.id)).toContain(league.id);
    expect(theirs.body.map((l: { id: string }) => l.id)).not.toContain(
      league.id,
    );
  });

  it('needs an admin to add a member', async () => {
    const league = await leagueWithMember('Fremde Liga');

    await request(api.server)
      .post('/leagues/add')
      .set(auth(member))
      .send({ leagueId: league.id, email: stranger.email })
      .expect(403);
  });

  it('rejects an unknown email address', async () => {
    const league = await leagueWithMember('Unbekannte Mail');

    await request(api.server)
      .post('/leagues/add')
      .set(auth(admin))
      .send({ leagueId: league.id, email: 'nobody@example.invalid' })
      .expect(404);
  });

  it('rejects a member that is already in the league', async () => {
    const league = await leagueWithMember('Doppelte Mitglieder');

    await request(api.server)
      .post('/leagues/add')
      .set(auth(admin))
      .send({ leagueId: league.id, email: member.email })
      .expect(400);
  });

  it('rejects a request without a league or an email', async () => {
    await request(api.server)
      .post('/leagues/add')
      .set(auth(admin))
      .send({ email: member.email })
      .expect(400);
  });

  it('removes a member', async () => {
    const league = await leagueWithMember('Rauswurf');

    await request(api.server)
      .post('/leagues/kick')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: member.id })
      .expect(201);

    expect((await reload(api, league)).members.map((m) => m.id)).toEqual([
      admin.id,
    ]);
  });

  it('needs an admin to remove a member', async () => {
    const league = await leagueWithMember('Kein Rauswurf');

    await request(api.server)
      .post('/leagues/kick')
      .set(auth(member))
      .send({ leagueId: league.id, userId: admin.id })
      .expect(403);
  });

  it('rejects removing someone who is not a member', async () => {
    const league = await leagueWithMember('Kein Mitglied');

    await request(api.server)
      .post('/leagues/kick')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: stranger.id })
      .expect(400);
  });

  it('refuses to remove the last member', async () => {
    const league = await createLeague(api, admin, 'Einsame Liga');

    await request(api.server)
      .post('/leagues/kick')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: admin.id })
      .expect(400);
  });
});

describe('admins', () => {
  it('promotes a member', async () => {
    const league = await leagueWithMember('Befoerderung');

    await request(api.server)
      .post('/leagues/promote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: member.id })
      .expect(201);

    expect((await reload(api, league)).admins.map((a) => a.id)).toContain(
      member.id,
    );
  });

  it('needs an admin to promote', async () => {
    const league = await leagueWithMember('Keine Befoerderung');

    await request(api.server)
      .post('/leagues/promote')
      .set(auth(member))
      .send({ leagueId: league.id, userId: member.id })
      .expect(403);
  });

  it('promotes only members', async () => {
    const league = await leagueWithMember('Nur Mitglieder');

    await request(api.server)
      .post('/leagues/promote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: stranger.id })
      .expect(400);
  });

  it('rejects promoting an existing admin', async () => {
    const league = await leagueWithMember('Schon Admin');

    await request(api.server)
      .post('/leagues/promote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: admin.id })
      .expect(400);
  });

  it('demotes an admin', async () => {
    const league = await leagueWithMember('Absetzung');
    await api.leagues.addAdmin(league.id, member.id, admin.id);

    await request(api.server)
      .post('/leagues/demote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: member.id })
      .expect(201);

    expect((await reload(api, league)).admins.map((a) => a.id)).toEqual([
      admin.id,
    ]);
  });

  it('rejects demoting someone who is not an admin', async () => {
    const league = await leagueWithMember('Kein Admin');

    await request(api.server)
      .post('/leagues/demote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: member.id })
      .expect(400);
  });

  it('refuses to demote the last admin', async () => {
    const league = await leagueWithMember('Letzter Admin');

    await request(api.server)
      .post('/leagues/demote')
      .set(auth(admin))
      .send({ leagueId: league.id, userId: admin.id })
      .expect(400);
  });
});

describe('renaming', () => {
  it('needs an admin', async () => {
    const league = await leagueWithMember('Alter Name');

    await expect(
      api.leagues.changeLeagueName('Neuer Name', league.id, member.id),
    ).rejects.toThrow('You need to be admin');
  });

  it('needs at least three characters', async () => {
    const league = await leagueWithMember('Zu kurz');

    await expect(
      api.leagues.changeLeagueName('ab', league.id, admin.id),
    ).rejects.toThrow('at least 3 characters');
  });

  it('renames the league', async () => {
    const league = await leagueWithMember('Vorher');

    await api.leagues.changeLeagueName('Nachher', league.id, admin.id);

    expect((await reload(api, league)).name).toBe('Nachher');
  });
});

describe('deleting', () => {
  it('needs an admin', async () => {
    const league = await leagueWithMember('Bleibt bestehen');

    await request(api.server)
      .delete('/leagues')
      .set(auth(member))
      .send({ leagueId: league.id })
      .expect(403);

    expect(await reload(api, league)).not.toBeNull();
  });

  it('deletes the bets of the league along with it', async () => {
    const league = await leagueWithMember('Mit Wetten');
    const { week, games } = await seedWeek(api, teams, [
      { kickoff: new Date(Date.now() + 60 * 60 * 1000) },
    ]);

    await api.bets.setGameBet(
      {
        gameId: games[0].id,
        leagueId: league.id,
        winner: 'home',
        pointDiff: 3,
      },
      member.id,
    );
    await api.bets.setBetDoubler(
      { game: games[0].id, league: league.id, week: week.id },
      member.id,
    );
    await api.bets.setDivisionBet(
      {
        division: teams[0].division.name,
        teams: teams.map((team) => team.id),
        year: SEASON,
        league: league.id,
      },
      member.id,
    );
    await api.bets.setSbBet(
      { teamId: teams[0].id, leagueId: league.id, year: SEASON },
      member.id,
    );

    await request(api.server)
      .delete('/leagues')
      .set(auth(admin))
      .send({ leagueId: league.id })
      .expect(200);

    expect(await reload(api, league)).toBeNull();
    for (const entity of [
      BetEntity,
      BetDoublerEntity,
      DivisionBetEntity,
      SuperbowlBetEntity,
    ]) {
      expect(
        await api.dataSource
          .getRepository(entity)
          .countBy({ league: { id: league.id } }),
      ).toBe(0);
    }
  });
});
