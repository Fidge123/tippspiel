import { randomBytes } from 'node:crypto';
import { db } from '../db/kysely';

const LIFETIME_MS = 29 * 24 * 60 * 60 * 1000;
// Refreshing on every request would write a row per page view.
const SLIDE_AFTER_MS = 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function createSession(
  userId: string,
  userAgent: string | null,
): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + LIFETIME_MS);

  await db()
    .insertInto('session')
    .values({ id, userId, expiresAt, userAgent })
    .execute();

  return { id, expiresAt };
}

export async function readSession(
  id: string,
): Promise<{ user: SessionUser; expiresAt: Date } | undefined> {
  const row = await db()
    .selectFrom('session')
    .innerJoin('user', 'user.id', 'session.userId')
    .select([
      'session.expiresAt as expiresAt',
      'session.lastSeenAt as lastSeenAt',
      'user.id as id',
      'user.name as name',
      'user.email as email',
    ])
    .where('session.id', '=', id)
    .executeTakeFirst();

  if (!row) {
    return undefined;
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    await revokeSession(id);
    return undefined;
  }

  let { expiresAt } = row;
  if (Date.now() - row.lastSeenAt.getTime() > SLIDE_AFTER_MS) {
    expiresAt = new Date(Date.now() + LIFETIME_MS);
    await db()
      .updateTable('session')
      .set({ lastSeenAt: new Date(), expiresAt })
      .where('id', '=', id)
      .execute();
  }

  return {
    user: { id: row.id, name: row.name, email: row.email },
    expiresAt,
  };
}

export async function revokeSession(id: string): Promise<void> {
  await db().deleteFrom('session').where('id', '=', id).execute();
}

export async function revokeExpiredSessions(): Promise<number> {
  const result = await db()
    .deleteFrom('session')
    .where('expiresAt', '<=', new Date())
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
