import { db } from '../db/kysely';
import { revokeExpiredSessions } from '../auth/session';

const DAY = 24 * 60 * 60 * 1000;

export interface CleanupResult {
  resetTokens: number;
  verifyTokens: number;
  users: number;
  sessions: number;
}

/** Never runs on import: instantiating something should not delete rows. */
export async function cleanUp(): Promise<CleanupResult> {
  const now = Date.now();

  const resets = await db()
    .deleteFrom('reset')
    .where('createdAt', '<', new Date(now - DAY))
    .executeTakeFirst();

  const verifies = await db()
    .deleteFrom('verify')
    .where('createdAt', '<', new Date(now - 7 * DAY))
    .executeTakeFirst();

  const users = await db()
    .deleteFrom('user')
    .where('verified', '=', false)
    .where('createdAt', '<', new Date(now - 7 * DAY))
    .executeTakeFirst();

  return {
    resetTokens: Number(resets.numDeletedRows),
    verifyTokens: Number(verifies.numDeletedRows),
    users: Number(users.numDeletedRows),
    sessions: await revokeExpiredSessions(),
  };
}
