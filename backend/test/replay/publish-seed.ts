import { gzip as gzipCb } from 'node:zlib';
import { argv, exit } from 'node:process';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import { Client } from 'pg';
import { to as copyTo } from 'pg-copy-streams';
import { putObject } from './r2';
import { CopyBlock, seedFromBackup } from './seed';
import { season2023, Season } from './season';
import { startDatabase } from '../support/database';
import { runMigrations } from '../support/migrate';

const gzip = promisify(gzipCb);

const SEASONS: Season[] = [season2023];

async function buildSeed(url: string, blocks: CopyBlock[]): Promise<string> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const parts: string[] = [];
    for (const block of blocks) {
      const stream = client.query(
        copyTo(block.header.replace(/ FROM stdin;$/, ' TO STDOUT')),
      );
      const rows: Buffer[] = [];
      await pipeline(stream, async (source) => {
        for await (const chunk of source) {
          rows.push(chunk as Buffer);
        }
      });
      parts.push(
        `${block.header}\n${Buffer.concat(rows).toString('utf8')}\\.\n\n`,
      );
    }
    return parts.join('');
  } finally {
    await client.end();
  }
}

async function publish(season: Season): Promise<void> {
  const database = await startDatabase();
  try {
    await runMigrations(database.url);
    const { key, blocks } = await seedFromBackup(
      database.url,
      season.backupKey,
    );
    const seed = await buildSeed(database.url, blocks);
    await putObject(season.seedKey, await gzip(Buffer.from(seed, 'utf8')));
    console.log(`Published ${season.seedKey} from ${key}.`);
  } finally {
    await database.stop();
  }
}

async function main(): Promise<void> {
  const year = Number(argv[2]);
  const season = SEASONS.find((s) => s.year === year);
  if (!season) {
    throw new Error(
      `Usage: yarn replay:publish <year>, one of ${SEASONS.map((s) => s.year).join(', ')}.`,
    );
  }
  await publish(season);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    exit(1);
  });
}
