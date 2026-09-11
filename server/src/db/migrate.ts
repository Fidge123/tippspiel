import { Migrator } from 'kysely/migration';
import * as session from './migrations/001-session';
import { closeDatabase, db } from './kysely';

// Kysely books migrations in kysely_migration and TypeORM in migrations, so the
// two runners cannot fight while both stacks are deployed.
const migrations = { '001-session': session };

export async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db: db(),
    provider: { getMigrations: async () => migrations },
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === 'Error') {
      console.error(`migration ${result.migrationName} failed`);
    }
  }

  if (error) {
    throw error;
  }
}

// Run as a deploy step rather than from the request entry, so a failed
// migration is a failed deploy instead of a half-started server.
if (import.meta.main) {
  await migrateToLatest();
  await closeDatabase();
}
