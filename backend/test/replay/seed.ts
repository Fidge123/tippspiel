import { scrypt as scryptCb } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from 'node:process';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import { Client } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { getText, listKeys } from './r2';

const scrypt = promisify(scryptCb);

/** Must stay in step with the hash in fixtures/anonymize.sql. */
export const TEST_PASSWORD = 'replay-test-password';
const TEST_SALT = '00000000000000000000000000000000';

// Owned by the migration chain that already ran; restoring them would conflict.
const SKIP_TABLES = new Set(['migrations', 'typeorm_metadata']);

export interface CopyBlock {
  table: string;
  header: string;
  body: string;
}

export function parseCopyBlocks(dump: string): CopyBlock[] {
  const blocks: CopyBlock[] = [];
  const lines = dump.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const match =
      /^COPY (?:public\.)?"?([A-Za-z_]+)"? \(.*\) FROM stdin;$/.exec(lines[i]);
    if (!match) {
      continue;
    }
    const body: string[] = [];
    let j = i + 1;
    for (; j < lines.length && lines[j] !== '\\.'; j++) {
      body.push(lines[j]);
    }
    blocks.push({
      table: match[1],
      header: lines[i],
      body: body.length ? `${body.join('\n')}\n` : '',
    });
    i = j;
  }

  return blocks;
}

/** The newest `database_backup/<date>.gz` recorded at or before `asOf`. */
export async function findBackup(asOf: Date): Promise<string> {
  const keys = (await listKeys('database_backup'))
    .filter((key) =>
      /^database_backup\/\d{4}-\d{2}-\d{2}(-\d+)?\.gz$/.test(key),
    )
    .sort();
  const usable = keys.filter(
    (key) => new Date(`${key.slice(16, 26)}T00:00:00Z`) <= asOf,
  );
  const chosen = usable[usable.length - 1];
  if (!chosen) {
    throw new Error(
      `No database backup at or before ${asOf.toISOString()}. Backups stopped on 2024-03-03 (see issue #39).`,
    );
  }
  return chosen;
}

/**
 * Loads the backup into an already-migrated database and anonymises it in the
 * same connection, so the real names and hashes never leave that database.
 */
export async function seedFromBackup(
  url: string,
  backupKey: string,
): Promise<string> {
  const key = env.REPLAY_BACKUP_KEY ?? backupKey;
  const dump = await getText(key);
  const blocks = parseCopyBlocks(dump).filter(
    (block) => !SKIP_TABLES.has(block.table),
  );
  if (!blocks.length) {
    throw new Error(`No table data found in ${key}.`);
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    // pg_dump orders its tables alphabetically, which does not respect the
    // foreign keys, so the load runs with triggers off.
    await client.query('SET session_replication_role = replica');
    for (const block of blocks) {
      if (!block.body) {
        continue;
      }
      const stream = client.query(copyFrom(block.header));
      await pipeline(Readable.from([block.body]), stream);
    }
    await client.query('SET session_replication_role = origin');

    const anonymize = await readFile(
      join(__dirname, '..', 'fixtures', 'anonymize.sql'),
      'utf8',
    );
    await client.query(anonymize);

    await assertAnonymised(client);
  } finally {
    await client.end();
  }

  return key;
}

async function assertAnonymised(client: Client): Promise<void> {
  const expected = (
    (await scrypt(
      TEST_PASSWORD.normalize(),
      Buffer.from(TEST_SALT, 'hex'),
      128,
    )) as Buffer
  ).toString('hex');

  const { rows } = await client.query<{
    total: string;
    pseudonymous: string;
    credentialled: string;
    tokens: string;
  }>(
    `SELECT
       (SELECT count(*) FROM "user") AS total,
       (SELECT count(*) FROM "user"
         WHERE name ~ '^Player [0-9]+$'
           AND email ~ '^player-[0-9]+@example\\.invalid$') AS pseudonymous,
       (SELECT count(*) FROM "user"
         WHERE salt = $1 AND password = $2) AS credentialled,
       (SELECT count(*) FROM reset) + (SELECT count(*) FROM verify) AS tokens`,
    [TEST_SALT, expected],
  );

  const [{ total, pseudonymous, credentialled, tokens }] = rows;
  if (total === '0') {
    throw new Error('The backup contained no users.');
  }
  if (pseudonymous !== total) {
    throw new Error(
      `anonymize.sql left ${Number(total) - Number(pseudonymous)} of ${total} users identifiable.`,
    );
  }
  if (credentialled !== total) {
    throw new Error(
      'anonymize.sql and TEST_PASSWORD have drifted apart: the stored hash is not scrypt(TEST_PASSWORD, TEST_SALT).',
    );
  }
  if (tokens !== '0') {
    throw new Error(`anonymize.sql left ${tokens} live tokens in place.`);
  }
}
