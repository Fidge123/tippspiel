import { Migrator } from 'kysely/migration';
import * as legacy from './migrations/000-legacy-schema';
import * as session from './migrations/001-session';
import { closeDatabase, db } from './kysely';

// Kysely books migrations in kysely_migration and TypeORM in migrations, so the
// two runners cannot fight while both stacks are deployed.
const migrations = {
  '000-legacy-schema': legacy,
  '001-session': session,
};

export async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db: db(),
    provider: { getMigrations: async () => migrations },
    // 000 was written after 001 and sorts before it, so that a fresh database
    // gets the legacy schema first while the deployed ones keep 001 applied.
    allowUnorderedMigrations: true,
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
