import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Client } from 'pg';
import { bootGoldenApp, GoldenApp } from './app';
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
let golden: GoldenApp;
let now = new Date(season.asOfDates[0].at);
let leagues: { id: string; name: string; viewer: Viewer }[];
let restoreEspn: () => void;

beforeAll(async () => {
  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(
      `The golden master replays a recorded season out of R2 and cannot run without read access to the bucket. Missing: ${missing.join(', ')}. See backend/test/golden/README.md.`,
    );
  }

  database = await startDatabase();
  await runMigrations(database.url);
  await seedFromBackup(database.url, season.backupKey);

  const corpus = await loadCorpus(season.year);
  restoreEspn = installEspnStub(corpus, () => now);

  golden = await bootGoldenApp(database.url);
  leagues = await leaguesOf(database.url, season.year);
  expect(leagues.length).toBeGreaterThan(0);

  // Only Date is faked, and only once the schema, the fixture and the
  // application are up: TypeORM compares column types against the intrinsic
  // Date, which a fake one is not. Timers stay real so the Postgres driver
  // and Nest's lifecycle are unaffected.
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
  vi.setSystemTime(now);
}, 600_000);

afterAll(async () => {
  restoreEspn?.();
  await golden?.close();
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

  for (const [index, asOf] of season.asOfDates.entries()) {
    describe(asOf.label, () => {
      beforeAll(async () => {
        now = new Date(asOf.at);
        vi.setSystemTime(now);
        await replay(golden, season);
      }, 600_000);

      // The as-of dates run in ascending order against one database, the way
      // the real importer sees the season, so each block builds on the last.
      it('replays without a failed ESPN request', () => {
        // `notify()` is the only thing that mails during an import, and
        // importWeek now swallows a failed load rather than killing the
        // process — so an empty outbox is what says the replay was complete.
        expect(sentEmails).toEqual([]);
      });

      it('matches the committed leaderboards', async () => {
        for (const league of leagues) {
          const response = await request(golden.app.getHttpServer())
            .get('/leaderboard')
            .query({ league: league.id, season: season.year })
            .set('Authorization', `Bearer ${golden.tokenFor(league.viewer)}`);

          expect(response.status).toBe(200);
          expect(normalise(response.body)).toMatchSnapshot(
            `${index}-${asOf.label} — ${league.name} — as seen by ${league.viewer.name}`,
          );
        }
      });
    });
  }
});

/** Runs the real importer over every week of the season at the current clock. */
async function replay(app: GoldenApp, s: Season): Promise<void> {
  await app.schedule.importMasterData();
  for (let week = 1; week <= s.regularWeeks; week++) {
    await app.schedule.importWeek({
      year: s.year,
      seasontype: 2,
      week,
    });
  }
  for (const week of s.postWeeks) {
    await app.schedule.importWeek({ year: s.year, seasontype: 3, week });
  }
}

/**
 * Every league playing `year`, each with the member who will view it. The
 * viewer is fixed (lowest user id) so the reveal rules — a player always sees
 * their own division and Super Bowl bets, never anyone else's before the
 * playoffs — land in the snapshot the same way on every run.
 */
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

/**
 * Sorts everything that the API leaves in database order, so a snapshot diff
 * only ever means a number changed.
 */
function normalise(body: any[]) {
  return [...body]
    .sort(
      (a, b) =>
        b.points.all - a.points.all || a.user.name.localeCompare(b.user.name),
    )
    .map((entry) => ({
      name: entry.user.name,
      points: entry.points,
      bets: [...entry.bets]
        .sort((a, b) => a.game.localeCompare(b.game))
        .map(({ game, bet, doubler, bonus, points }) => ({
          game,
          winner: bet?.winner ?? null,
          pointDiff: bet?.pointDiff ?? null,
          doubler,
          bonus,
          points,
        })),
      divBets: [...entry.divBets]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((bet) => ({
          division: bet.name,
          order: [bet.first, bet.second, bet.third, bet.fourth].map(
            (team) => team?.abbreviation ?? null,
          ),
          points: bet.points,
        })),
      sbBet: {
        team: entry.sbBet.team?.abbreviation ?? null,
        points: entry.sbBet.points,
      },
    }));
}
