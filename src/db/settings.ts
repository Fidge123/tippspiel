import { sql } from 'kysely';
import { db } from './kysely';

/** One statement, so concurrent patches cannot overwrite each other. */
export async function mergeSettings(
  userId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await db()
    .updateTable('user')
    .set({ settings: sql`settings || ${JSON.stringify(patch)}::jsonb` })
    .where('id', '=', userId)
    .execute();
}
