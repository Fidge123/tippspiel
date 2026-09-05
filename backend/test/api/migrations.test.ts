import { afterAll, beforeAll, expect, it } from 'vitest';
import { Client } from 'pg';
import { TestDatabase } from '../support/database';
import { freshDatabase } from './database';
import { migrations } from '../../src/database/migration';

let database: TestDatabase;

beforeAll(async () => {
  database = await freshDatabase();
});

afterAll(async () => {
  await database?.stop();
});

it('applies the migration chain to an empty database', async () => {
  const client = new Client({ connectionString: database.url });
  await client.connect();
  const applied = await client.query<{ name: string }>(
    'SELECT name FROM migrations ORDER BY id',
  );
  const tables = await client.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  await client.end();

  expect(applied.rows.map((row) => row.name)).toEqual(
    migrations.map((migration) => migration.name),
  );
  expect(tables.rows.map((row) => row.tablename)).toContain('reset');
});
