import { inject } from 'vitest';
import { createDatabase, TestDatabase } from '../support/database';
import { runMigrations } from '../support/migrate';

export async function freshDatabase(): Promise<TestDatabase> {
  const database = await createDatabase(inject('postgresUrl'));
  await runMigrations(database.url);
  return database;
}
