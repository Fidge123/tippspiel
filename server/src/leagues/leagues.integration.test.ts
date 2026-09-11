import { env } from 'node:process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

env.DATABASE_URL = env.TEST_DATABASE_URL;

const { closeDatabase, db } = await import('../db/kysely');
const { createSchema, truncate } = await import('../db/fixture');
const { hash, newSalt } = await import('../auth/password');
const w = await import('./writes');
const { leaguesOfUser } = await import('./query');

let admin: string;
let member: string;
let stranger: string;
let league: string;

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

beforeAll(createSchema);
beforeEach(async () => {
  await truncate();
  admin = await user('admin');
  member = await user('member');
  stranger = await user('stranger');

  const created = await w.createLeague('Testliga', admin);
  league = created.id!;
  await w.addMember(league, 'member@example.invalid', admin);
});
afterAll(closeDatabase);

describe('creating a league', () => {
  it('makes the creator the first member and admin', async () => {
    const created = await w.createLeague('Neue Liga', stranger);
    expect(created.ok).toBe(true);

    const leagues = await leaguesOfUser(stranger);
    const mine = leagues.find((l) => l.name === 'Neue Liga');

    expect(mine?.amAdmin).toBe(true);
    expect(mine?.members).toEqual([
      { id: stranger, name: 'stranger', isAdmin: true },
    ]);
  });

  it('refuses a name under three characters', async () => {
    expect(await w.createLeague('ab', stranger)).toEqual({
      ok: false,
      reason: 'name-too-short',
    });
  });
});

describe('renaming', () => {
  it('is allowed for an admin', async () => {
    expect(await w.renameLeague(league, 'Andere Liga', admin)).toEqual({
      ok: true,
    });
    expect((await leaguesOfUser(admin))[0].name).toBe('Andere Liga');
  });

  it('is refused for a plain member', async () => {
    expect(await w.renameLeague(league, 'Andere Liga', member)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('is refused for someone outside the league', async () => {
    expect(await w.renameLeague(league, 'Andere Liga', stranger)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('refuses a name under three characters', async () => {
    expect(await w.renameLeague(league, 'ab', admin)).toEqual({
      ok: false,
      reason: 'name-too-short',
    });
  });
});

describe('adding a member', () => {
  it('is refused for a plain member', async () => {
    expect(
      await w.addMember(league, 'stranger@example.invalid', member),
    ).toEqual({ ok: false, reason: 'not-admin' });
  });

  it('is refused for an address with no account', async () => {
    expect(await w.addMember(league, 'nobody@example.invalid', admin)).toEqual({
      ok: false,
      reason: 'no-such-user',
    });
  });

  it('is refused for someone already in the league', async () => {
    expect(await w.addMember(league, 'member@example.invalid', admin)).toEqual({
      ok: false,
      reason: 'already-a-member',
    });
  });
});

describe('removing a member', () => {
  it('is refused for a plain member', async () => {
    expect(await w.removeMember(league, admin, member)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('is refused for someone who is not in the league', async () => {
    expect(await w.removeMember(league, stranger, admin)).toEqual({
      ok: false,
      reason: 'not-a-member',
    });
  });

  it('is refused when it would empty the league', async () => {
    await w.removeMember(league, member, admin);

    expect(await w.removeMember(league, admin, admin)).toEqual({
      ok: false,
      reason: 'last-member',
    });
  });

  it('drops the admin row along with the membership', async () => {
    await w.promote(league, member, admin);

    expect(await w.removeMember(league, member, admin)).toEqual({ ok: true });
    expect(
      await db()
        .selectFrom('admin')
        .selectAll()
        .where('userId', '=', member)
        .execute(),
    ).toEqual([]);
  });

  it('refuses to remove the only admin, leaving nobody able to administer', async () => {
    expect(await w.removeMember(league, admin, admin)).toEqual({
      ok: false,
      reason: 'last-admin',
    });
  });

  it('allows removing an admin once a second one exists', async () => {
    await w.promote(league, member, admin);

    expect(await w.removeMember(league, admin, admin)).toEqual({ ok: true });
    expect((await leaguesOfUser(member))[0].members).toHaveLength(1);
  });

  it('takes the bets of a removed member with them', async () => {
    await db().insertInto('division').values({ name: 'AFC North' }).execute();
    await db()
      .insertInto('superbowlBet')
      .values({ year: 2026, userId: member, leagueId: league })
      .execute();
    await db()
      .insertInto('superbowlBet')
      .values({ year: 2026, userId: admin, leagueId: league })
      .execute();

    await w.removeMember(league, member, admin);

    // Otherwise they keep voting in a league they have left: the vote counts
    // and the underdog bonus are computed over every bet on a game.
    const left = await db().selectFrom('superbowlBet').selectAll().execute();
    expect(left).toHaveLength(1);
    expect(left[0].userId).toBe(admin);
  });
});

describe('promoting', () => {
  it('is refused for a plain member', async () => {
    expect(await w.promote(league, member, member)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('is refused for someone who is not a member', async () => {
    expect(await w.promote(league, stranger, admin)).toEqual({
      ok: false,
      reason: 'not-a-member',
    });
  });

  it('is refused for someone who is already an admin', async () => {
    expect(await w.promote(league, admin, admin)).toEqual({
      ok: false,
      reason: 'already-admin',
    });
  });

  it('works, and shows in the member list', async () => {
    expect(await w.promote(league, member, admin)).toEqual({ ok: true });

    const leagues = await leaguesOfUser(member);
    expect(leagues[0].members.find((m) => m.id === member)?.isAdmin).toBe(true);
    expect(leagues[0].amAdmin).toBe(true);
  });
});

describe('demoting', () => {
  it('is refused for a plain member', async () => {
    expect(await w.demote(league, admin, member)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('is refused for someone who is not an admin', async () => {
    expect(await w.demote(league, member, admin)).toEqual({
      ok: false,
      reason: 'not-an-admin',
    });
  });

  it('refuses to remove the last admin', async () => {
    expect(await w.demote(league, admin, admin)).toEqual({
      ok: false,
      reason: 'last-admin',
    });
  });

  it('works once there is a second admin', async () => {
    await w.promote(league, member, admin);

    expect(await w.demote(league, admin, admin)).toEqual({ ok: true });
    expect((await leaguesOfUser(admin))[0].amAdmin).toBe(false);
  });
});

describe('deleting a league', () => {
  it('is refused for a plain member', async () => {
    expect(await w.deleteLeague(league, member)).toEqual({
      ok: false,
      reason: 'not-admin',
    });
  });

  it('takes the bets with it', async () => {
    await db().insertInto('division').values({ name: 'AFC North' }).execute();
    await db()
      .insertInto('superbowlBet')
      .values({ year: 2026, userId: member, leagueId: league })
      .execute();
    await db()
      .insertInto('divisionBet')
      .values({
        year: 2026,
        divisionName: 'AFC North',
        userId: member,
        leagueId: league,
      })
      .execute();

    expect(await w.deleteLeague(league, admin)).toEqual({ ok: true });

    expect(await db().selectFrom('league').selectAll().execute()).toEqual([]);
    expect(await db().selectFrom('superbowlBet').selectAll().execute()).toEqual(
      [],
    );
    expect(await db().selectFrom('divisionBet').selectAll().execute()).toEqual(
      [],
    );
    expect(await leaguesOfUser(admin)).toEqual([]);
  });
});
