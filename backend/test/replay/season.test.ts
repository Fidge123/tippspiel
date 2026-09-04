import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Client } from 'pg';
import { bootReplayApp, ReplayApp } from './app';
import { loadCorpus } from './corpus';
import { startDatabase, TestDatabase } from './database';
import { installEspnStub } from './espn';
import { runMigrations } from './migrate';
import { missingCredentials } from './r2';
import { seedFromBackup } from './seed';
import { sentEmails } from '../../src/email';
import { season2023, Season } from './season';

const season: Season = season2023;

interface Viewer {
  id: string;
  name: string;
  email: string;
}

let database: TestDatabase;
let replayApp: ReplayApp;
let now = new Date(season.asOfDates[0].at);
let leagues: { id: string; name: string; viewer: Viewer }[];
let weekOfGame: Map<string, string>;
let restoreEspn: () => void;

beforeAll(async () => {
  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(
      `The season replay reads a recorded season out of R2 and cannot run without read access to the bucket. Missing: ${missing.join(', ')}. See backend/test/replay/README.md.`,
    );
  }

  database = await startDatabase();
  await runMigrations(database.url);
  await seedFromBackup(database.url, season.backupKey);

  const corpus = await loadCorpus(season.year);
  restoreEspn = installEspnStub(corpus, () => now);

  replayApp = await bootReplayApp(database.url);
  leagues = await leaguesOf(database.url, season.year);
  expect(leagues.length).toBeGreaterThan(0);

  // Faking Date must come after the schema, the fixture and the app are up:
  // TypeORM compares column types against the intrinsic Date, which a fake one
  // is not. Only Date is faked, so the Postgres driver keeps its real timers.
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
  vi.setSystemTime(now);
}, 600_000);

afterAll(async () => {
  restoreEspn?.();
  await replayApp?.close();
  await database?.stop();
  vi.useRealTimers();
});

describe(`${season.year} season`, () => {
  it('applies the migration chain to an empty database', async () => {
    const client = new Client({ connectionString: database.url });
    await client.connect();
    const { rows } = await client.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id',
    );
    await client.end();
    expect(rows.map((row) => row.name)).toMatchSnapshot('migrations');
  });

  // The as-of dates run in ascending order against one database, the way the
  // real importer sees the season.
  for (const [index, asOf] of season.asOfDates.entries()) {
    describe(asOf.label, () => {
      beforeAll(async () => {
        now = new Date(asOf.at);
        vi.setSystemTime(now);
        await importSeason(replayApp, season);
        weekOfGame = await gameWeeks(database.url, season.year);
      }, 600_000);

      it('replays without a failed ESPN request', () => {
        // importWeek swallows a failed load, so an empty outbox is what says
        // every week was actually imported.
        expect(sentEmails).toEqual([]);
      });

      it('matches the committed leaderboards', async () => {
        for (const league of leagues) {
          const response = await request(replayApp.app.getHttpServer())
            .get('/leaderboard')
            .query({ league: league.id, season: season.year })
            .set(
              'Authorization',
              `Bearer ${replayApp.tokenFor(league.viewer)}`,
            );

          expect(response.status).toBe(200);
          expect(normalise(response.body, season)).toMatchSnapshot(
            `${index}-${asOf.label} — ${league.name} — as seen by ${league.viewer.name}`,
          );
        }
      });
    });
  }
});

async function importSeason(app: ReplayApp, s: Season): Promise<void> {
  await app.schedule.importMasterData();
  for (let week = 1; week <= s.regularWeeks; week++) {
    await app.schedule.importWeek({ year: s.year, seasontype: 2, week });
  }
  for (const week of s.postWeeks) {
    await app.schedule.importWeek({ year: s.year, seasontype: 3, week });
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

// The viewer is pinned to the lowest user id so the reveal rules — a player
// sees their own division and Super Bowl bets and nobody else's before the
// playoffs — land in the snapshot the same way on every run.
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

/** Keys are sorted by the snapshot serialiser, so a diff means a real change. */
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
          entry.divBets.map((d) => [
            d.name,
            `${[d.first, d.second, d.third, d.fourth].map((t) => t?.abbreviation ?? '-').join(' ')} = ${d.points}`,
          ]),
        ),
        sbBet: {
          team: entry.sbBet.team?.abbreviation ?? null,
          points: entry.sbBet.points,
        },
      };
    });
}
