import { db } from '../db/kysely';

export type LeagueError =
  | 'not-admin'
  | 'no-such-user'
  | 'no-such-league'
  | 'name-too-short'
  | 'already-admin'
  | 'not-a-member'
  | 'not-an-admin'
  | 'already-a-member'
  | 'last-admin'
  | 'last-member';

export type LeagueResult = { ok: true } | { ok: false; reason: LeagueError };

const SEASON = 2026;

async function isAdmin(leagueId: string, userId: string): Promise<boolean> {
  const row = await db()
    .selectFrom('admin')
    .select('userId')
    .where('leagueId', '=', leagueId)
    .where('userId', '=', userId)
    .executeTakeFirst();
  return !!row;
}

async function isMember(leagueId: string, userId: string): Promise<boolean> {
  const row = await db()
    .selectFrom('member')
    .select('userId')
    .where('leagueId', '=', leagueId)
    .where('userId', '=', userId)
    .executeTakeFirst();
  return !!row;
}

async function countOf(
  table: 'admin' | 'member',
  leagueId: string,
): Promise<number> {
  const row = await db()
    .selectFrom(table)
    .select((eb) => eb.fn.countAll<string>().as('n'))
    .where('leagueId', '=', leagueId)
    .executeTakeFirstOrThrow();
  return Number(row.n);
}

export async function createLeague(
  name: string,
  userId: string,
): Promise<LeagueResult & { id?: string }> {
  if (name.trim().length < 3) {
    return { ok: false, reason: 'name-too-short' };
  }

  return db()
    .transaction()
    .execute(async (trx) => {
      const league = await trx
        .insertInto('league')
        .values({ name: name.trim(), season: SEASON })
        .returning('id')
        .executeTakeFirstOrThrow();

      await trx
        .insertInto('member')
        .values({ leagueId: league.id, userId })
        .execute();
      await trx
        .insertInto('admin')
        .values({ leagueId: league.id, userId })
        .execute();

      return { ok: true as const, id: league.id };
    });
}

export async function renameLeague(
  leagueId: string,
  name: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }
  if (name.trim().length < 3) {
    return { ok: false, reason: 'name-too-short' };
  }

  await db()
    .updateTable('league')
    .set({ name: name.trim() })
    .where('id', '=', leagueId)
    .execute();

  return { ok: true };
}

/**
 * The bets are deleted before the league row, in the order the Nest service
 * used, because none of these carry a cascading foreign key.
 */
export async function deleteLeague(
  leagueId: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }

  await db()
    .transaction()
    .execute(async (trx) => {
      for (const table of [
        'betDoubler',
        'bet',
        'divisionBet',
        'superbowlBet',
      ] as const) {
        await trx.deleteFrom(table).where('leagueId', '=', leagueId).execute();
      }
      await trx.deleteFrom('admin').where('leagueId', '=', leagueId).execute();
      await trx.deleteFrom('member').where('leagueId', '=', leagueId).execute();
      await trx.deleteFrom('league').where('id', '=', leagueId).execute();
    });

  return { ok: true };
}

export async function addMember(
  leagueId: string,
  email: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }

  const user = await db()
    .selectFrom('user')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst();

  if (!user) {
    return { ok: false, reason: 'no-such-user' };
  }
  if (await isMember(leagueId, user.id)) {
    return { ok: false, reason: 'already-a-member' };
  }

  await db()
    .insertInto('member')
    .values({ leagueId, userId: user.id })
    .execute();

  return { ok: true };
}

export async function removeMember(
  leagueId: string,
  userId: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }
  if ((await countOf('member', leagueId)) < 2) {
    return { ok: false, reason: 'last-member' };
  }

  // Their bets stay behind, as they do today. See the TODO in removeMember.
  await db()
    .transaction()
    .execute(async (trx) => {
      await trx
        .deleteFrom('admin')
        .where('leagueId', '=', leagueId)
        .where('userId', '=', userId)
        .execute();
      await trx
        .deleteFrom('member')
        .where('leagueId', '=', leagueId)
        .where('userId', '=', userId)
        .execute();
    });

  return { ok: true };
}

export async function promote(
  leagueId: string,
  userId: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }
  if (await isAdmin(leagueId, userId)) {
    return { ok: false, reason: 'already-admin' };
  }
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }

  await db().insertInto('admin').values({ leagueId, userId }).execute();

  return { ok: true };
}

export async function demote(
  leagueId: string,
  userId: string,
  adminId: string,
): Promise<LeagueResult> {
  if (!(await isAdmin(leagueId, adminId))) {
    return { ok: false, reason: 'not-admin' };
  }
  if (!(await isAdmin(leagueId, userId))) {
    return { ok: false, reason: 'not-an-admin' };
  }
  if ((await countOf('admin', leagueId)) < 2) {
    return { ok: false, reason: 'last-admin' };
  }

  await db()
    .deleteFrom('admin')
    .where('leagueId', '=', leagueId)
    .where('userId', '=', userId)
    .execute();

  return { ok: true };
}
