import { env } from 'node:process';
import { Client } from 'pg';

export interface TestDatabase {
  url: string;
  stop(): Promise<void>;
}

/**
 * A throwaway Postgres for one golden-master run.
 *
 * Testcontainers gives identical behaviour locally and in CI with no setup.
 * Where Docker is not available, point TEST_DATABASE_URL at a server the test
 * may create and drop databases on.
 */
export async function startDatabase(): Promise<TestDatabase> {
  if (env.TEST_DATABASE_URL) {
    return createScratchDatabase(env.TEST_DATABASE_URL);
  }

  const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  return {
    url: container.getConnectionUri(),
    stop: async () => {
      await container.stop();
    },
  };
}

async function createScratchDatabase(adminUrl: string): Promise<TestDatabase> {
  const name = `golden_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;

  return {
    url: url.toString(),
    async stop() {
      const cleanup = new Client({ connectionString: adminUrl });
      await cleanup.connect();
      await cleanup.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await cleanup.end();
    },
  };
}
