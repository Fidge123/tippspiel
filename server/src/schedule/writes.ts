import { db } from '../db/kysely';

export type WriteResult =
  | { ok: true }
  | { ok: false; reason: 'late' | 'invalid' | 'not-a-member' | 'no-doubler' };

/** Server clock only: nothing about a deadline may come from the client. */
const now = () => new Date();

async function isMember(leagueId: string, userId: string): Promise<boolean> {
  const row = await db()
    .selectFrom('member')
    .select('userId')
    .where('leagueId', '=', leagueId)
    .where('userId', '=', userId)
    .executeTakeFirst();

  return !!row;
}

export async function setGameBet(
  userId: string,
  leagueId: string,
  gameId: string,
  winner: 'home' | 'away',
  pointDiff: number,
): Promise<WriteResult> {
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }

  const game = await db()
    .selectFrom('game')
    .select(['id', 'date'])
    .where('id', '=', gameId)
    .executeTakeFirst();

  if (!game) {
    return { ok: false, reason: 'invalid' };
  }

  if (now() >= game.date) {
    return { ok: false, reason: 'late' };
  }

  const existing = await db()
    .selectFrom('bet')
    .select('id')
    .where('gameId', '=', gameId)
    .where('userId', '=', userId)
    .where('leagueId', '=', leagueId)
    .executeTakeFirst();

  if (existing) {
    await db()
      .updateTable('bet')
      .set({ winner, pointDiff })
      .where('id', '=', existing.id)
      .execute();
  } else {
    await db()
      .insertInto('bet')
      .values({ gameId, userId, leagueId, winner, pointDiff })
      .execute();
  }

  return { ok: true };
}

export async function setDoubler(
  userId: string,
  leagueId: string,
  weekId: string,
  gameId: string,
): Promise<WriteResult> {
  if (!(await isMember(leagueId, userId))) {
    return { ok: false, reason: 'not-a-member' };
  }

  const game = await db()
    .selectFrom('game')
    .select(['id', 'date'])
    .where('id', '=', gameId)
    .where('weekId', '=', weekId)
    .executeTakeFirst();

  if (!game) {
    return { ok: false, reason: 'invalid' };
  }

  const existing = await db()
    .selectFrom('betDoubler')
    .leftJoin('game', 'game.id', 'betDoubler.gameId')
    .select(['betDoubler.id as id', 'game.date as gameDate'])
    .where('betDoubler.weekId', '=', weekId)
    .where('betDoubler.userId', '=', userId)
    .where('betDoubler.leagueId', '=', leagueId)
    .executeTakeFirst();

  // You may move the doubler only while the game it is currently on has not
  // started, and only onto a game that has not started.
  if (
    now() >= game.date ||
    (existing?.gameDate && now() >= existing.gameDate)
  ) {
    return { ok: false, reason: 'late' };
  }

  if (existing) {
    await db()
      .updateTable('betDoubler')
      .set({ gameId })
      .where('id', '=', existing.id)
      .execute();
  } else {
    await db()
      .insertInto('betDoubler')
      .values({ gameId, userId, leagueId, weekId })
      .execute();
  }

  return { ok: true };
}

export async function removeDoubler(
  userId: string,
  leagueId: string,
  weekId: string,
): Promise<WriteResult> {
  const existing = await db()
    .selectFrom('betDoubler')
    .leftJoin('game', 'game.id', 'betDoubler.gameId')
    .select(['betDoubler.id as id', 'game.date as gameDate'])
    .where('betDoubler.weekId', '=', weekId)
    .where('betDoubler.userId', '=', userId)
    .where('betDoubler.leagueId', '=', leagueId)
    .executeTakeFirst();

  if (!existing) {
    return { ok: false, reason: 'no-doubler' };
  }

  if (!existing.gameDate || now() >= existing.gameDate) {
    return { ok: false, reason: 'late' };
  }

  await db().deleteFrom('betDoubler').where('id', '=', existing.id).execute();

  return { ok: true };
}

export async function setHidden(
  userId: string,
  weekId: string,
  hidden: boolean,
): Promise<void> {
  const row = await db()
    .selectFrom('user')
    .select('settings')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  const settings = (row.settings ?? {}) as {
    hidden?: Record<string, boolean>;
  };

  await db()
    .updateTable('user')
    .set({
      settings: JSON.stringify({
        ...settings,
        hidden: { ...settings.hidden, [weekId]: hidden },
      }),
    })
    .where('id', '=', userId)
    .execute();
}

export async function hiddenSettings(
  userId: string,
): Promise<{ hidden: Record<string, boolean>; hideByDefault: boolean }> {
  const row = await db()
    .selectFrom('user')
    .select('settings')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  const settings = (row.settings ?? {}) as {
    hidden?: Record<string, boolean>;
    hideByDefault?: boolean;
  };

  // Defaults to on, as in the SPA: a user who has never touched the toggle
  // expects not to be shown a score they have not watched yet.
  return {
    hidden: settings.hidden ?? {},
    hideByDefault: settings.hideByDefault ?? true,
  };
}
