import { env } from 'node:process';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { loadCorpus } from './corpus';
import { installEspnStub } from './espn';
import { missingCredentials } from './r2';
import { type Season, season2023 } from './season';
import { seedFromBackup } from './seed';
import { startDatabase, type TestDatabase } from '../support/database';
import { sentEmails } from '../support/mail';

vi.mock('../../src/email/send', () => import('../support/mail'));

const season: Season = season2023;

interface Viewer {
  id: string;
  name: string;
  email: string;
}

let database: TestDatabase;
let now = new Date(season.asOfDates[0].at);
let leagues: { id: string; name: string; viewer: Viewer }[];
let weekOfGame: Map<string, string>;
let restoreEspn: () => void;

let importer: typeof import('../../src/jobs/importer');
let buildLeaderboard: typeof import('../../src/leaderboard/build').buildLeaderboard;
let closeDatabase: () => Promise<void>;

beforeAll(async () => {
  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(
      `The season replay reads a recorded season out of R2 and cannot run without read access to the bucket. Missing: ${missing.join(', ')}. See server/test/replay/README.md.`,
    );
  }

  database = await startDatabase();
  env.DATABASE_URL = database.url;
  env.SKIP_BACKUP = 'true';

  // Imported after DATABASE_URL is set, because the pool reads it on first use.
  const kysely = await import('../../src/db/kysely');
  closeDatabase = kysely.closeDatabase;
  const migrate = await import('../../src/db/migrate');
  await migrate.migrateToLatest();

  await seedFromBackup(database.url, season.backupKey);

  const corpus = await loadCorpus(season.year);
  restoreEspn = installEspnStub(corpus, () => now);

  importer = await import('../../src/jobs/importer');
  ({ buildLeaderboard } = await import('../../src/leaderboard/build'));

  leagues = await leaguesOf(database.url, season.year);
  expect(leagues.length).toBeGreaterThan(0);

  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
  vi.setSystemTime(now);
}, 600_000);

afterAll(async () => {
  restoreEspn?.();
  await closeDatabase?.();
  await database?.stop();
  vi.useRealTimers();
});

describe(`${season.year} season`, () => {
  it('applies the migration chain to an empty database', async () => {
    const client = new Client({ connectionString: database.url });
    await client.connect();
    const { rows } = await client.query<{ name: string }>(
      'SELECT name FROM kysely_migration ORDER BY name',
    );
    await client.end();
    expect(rows.map((row) => row.name)).toMatchSnapshot('migrations');
  });

  // Each as-of date imports into the database the previous one left behind.
  for (const [index, asOf] of season.asOfDates.entries()) {
    describe(asOf.label, () => {
      beforeAll(async () => {
        now = new Date(asOf.at);
        vi.setSystemTime(now);
        await importSeason(season);
        weekOfGame = await gameWeeks(database.url, season.year);
      }, 600_000);

      it('replays without a failed ESPN request', () => {
        expect(sentEmails).toEqual([]);
      });

      it('matches the committed leaderboards', async () => {
        for (const league of leagues) {
          const board = await buildLeaderboard(
            league.id,
            season.year,
            league.viewer.id,
          );

          expect(board).toBeDefined();
          expect(normalise(board!.entries, season)).toMatchSnapshot(
            `${index}-${asOf.label} / ${league.name} / as seen by ${league.viewer.name}`,
          );
        }
      });
    });
  }
});

async function importSeason(s: Season): Promise<void> {
  await importer.importMasterData(s.year);
  for (let week = 1; week <= s.regularWeeks; week++) {
    await importer.importWeek({ year: s.year, seasontype: 2, week });
  }
  for (const week of s.postWeeks) {
    await importer.importWeek({ year: s.year, seasontype: 3, week });
  }
}

async function gameWeeks(url: string, year: number) {
  const client = new Client({ connectionString: url });
  await client.connect();
  const { rows } = await client.query<{ id: string; weekId: string }>(
    `SELECT id, "weekId" FROM game WHERE "weekId" LIKE $1`,
    [`${year}-%`],
  );
  await client.end();
  return new Map(rows.map((row) => [row.id, row.weekId]));
}

/** `2023-2-7` sorts after `2023-2-18` unless the week number is padded. */
function weekLabel(weekId: string): string {
  const [year, seasontype, week] = weekId.split('-');
  return `${year}-${seasontype}-${week.padStart(2, '0')}`;
}

// A fixed viewer keeps the reveal rules, which depend on who is asking,
// deterministic across runs.
async function leaguesOf(url: string, year: number) {
  const client = new Client({ connectionString: url });
  await client.connect();
  const { rows } = await client.query(
    `SELECT l.id, l.name,
            (SELECT json_build_object('id', u.id, 'name', u.name, 'email', u.email)
               FROM member m JOIN "user" u ON u.id = m."userId"
              WHERE m."leagueId" = l.id
              ORDER BY u.id LIMIT 1) AS viewer
       FROM league l
      WHERE l.season = $1
      ORDER BY l.name, l.id`,
    [year],
  );
  await client.end();
  return rows.filter((row) => row.viewer);
}

function formatBet(b: any): string {
  const bet = b.bet ? `${b.bet.winner} ${b.bet.pointDiff}` : 'no bet';
  return `${bet}${b.doubler ? ' x2' : ''}${b.bonus ? ' bonus' : ''} = ${b.points}`;
}

function normalise(body: any[], s: Season) {
  return [...body]
    .sort(
      (a, b) =>
        b.points.all - a.points.all || a.user.name.localeCompare(b.user.name),
    )
    .map((entry) => {
      const weeks: Record<string, number> = {};
      const bets: Record<string, Record<string, string>> = {};

      for (const bet of entry.bets) {
        const weekId = weekOfGame.get(bet.game) ?? 'unknown';
        const label = weekLabel(weekId);
        weeks[label] = (weeks[label] ?? 0) + bet.points;
        if (s.detailWeeks.includes(weekId)) {
          bets[label] ??= {};
          bets[label][bet.game] = formatBet(bet);
        }
      }

      return {
        name: entry.user.name,
        points: entry.points,
        weeks,
        bets,
        divBets: Object.fromEntries(
          entry.divBets.map((d: any) => [
            d.name,
            `${[d.first, d.second, d.third, d.fourth].map((t: any) => t?.abbreviation ?? '?').join(' ')} = ${d.points}`,
          ]),
        ),
        sbBet: {
          team: entry.sbBet.team?.abbreviation ?? null,
          points: entry.sbBet.points,
        },
      };
    });
}
