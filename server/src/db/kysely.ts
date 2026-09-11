import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { databaseUrl } from '../config';
import type { Database } from './types';

// The live schema already spells its columns in camelCase, so no naming plugin.
let instance: Kysely<Database> | undefined;

export function db(): Kysely<Database> {
  if (!instance) {
    instance = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: databaseUrl, max: 10 }),
      }),
    });
  }
  return instance;
}

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await db()
      .selectNoFrom((eb) => eb.lit(1).as('one'))
      .execute();
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await instance?.destroy();
  instance = undefined;
}
