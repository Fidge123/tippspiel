import { Migrator } from 'kysely/migration';
import * as legacy from './migrations/000-legacy-schema';
import * as session from './migrations/001-session';
import { closeDatabase, db } from './kysely';

const migrations = {
  '000-legacy-schema': legacy,
  '001-session': session,
};

export async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db: db(),
    provider: { getMigrations: async () => migrations },
    // 000 sorts before 001 but was written after it, so both orders must apply.
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

// A deploy step, so a failed migration is a failed deploy, not a half-started server.
if (import.meta.main) {
  await migrateToLatest();
  await closeDatabase();
}
