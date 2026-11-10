import { env } from 'node:process';
import { Client } from 'pg';

export interface TestServer {
  adminUrl: string;
  stop(): Promise<void>;
}

export interface TestDatabase {
  url: string;
  stop(): Promise<void>;
}

export async function startPostgres(): Promise<TestServer> {
  if (env.TEST_DATABASE_URL) {
    return { adminUrl: env.TEST_DATABASE_URL, stop: async () => {} };
  }

  const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  return {
    adminUrl: container.getConnectionUri(),
    stop: async () => {
      await container.stop();
    },
  };
}

export async function createDatabase(adminUrl: string): Promise<TestDatabase> {
  const name = `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
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

export async function startDatabase(): Promise<TestDatabase> {
  const server = await startPostgres();
  const database = await createDatabase(server.adminUrl);
  return {
    url: database.url,
    async stop() {
      await database.stop();
      await server.stop();
    },
  };
}
