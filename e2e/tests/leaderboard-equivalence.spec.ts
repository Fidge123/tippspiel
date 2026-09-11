import { appPath } from '../harness/ports';
import { season, users } from '../harness/seed';
import { activeLeague, expect, login, readApi, test } from './app';

/**
 * The two implementations run against the same database in this harness, so
 * the leaderboard port can be shown equivalent rather than argued to be. The
 * comparison is the same shape the golden master in #49 normalises to: the
 * fields that carry meaning, not the row objects the ORMs happen to build.
 */
interface Entry {
  user: { id: string; name: string };
  bets: {
    game: string;
    bet?: { pointDiff: number; winner: string };
    doubler: boolean;
    bonus: boolean;
    points: number;
  }[];
  divBets: {
    name: string | null;
    first?: { abbreviation: string } | null;
    second?: { abbreviation: string } | null;
    third?: { abbreviation: string } | null;
    fourth?: { abbreviation: string } | null;
    points: number;
  }[];
  sbBet: { team?: { abbreviation?: string } | null; points: number };
  points: { bets: number; divBets: number; sbBet: number; all: number };
}

function normalise(entries: Entry[]) {
  return [...entries]
    .sort(
      (a, b) =>
        b.points.all - a.points.all || a.user.name.localeCompare(b.user.name),
    )
    .map((entry) => ({
      name: entry.user.name,
      points: entry.points,
      bets: [...entry.bets]
        .sort((a, b) => a.game.localeCompare(b.game))
        .map((bet) => ({
          game: bet.game,
          bet: bet.bet ? `${bet.bet.winner} ${bet.bet.pointDiff}` : 'no bet',
          doubler: bet.doubler,
          bonus: bet.bonus,
          points: bet.points,
        })),
      divBets: Object.fromEntries(
        [...entry.divBets]
          .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
          .map((bet) => [
            bet.name,
            `${[bet.first, bet.second, bet.third, bet.fourth]
              .map((team) => team?.abbreviation ?? '?')
              .join(' ')} = ${bet.points}`,
          ]),
      ),
      sbBet: {
        team: entry.sbBet.team?.abbreviation ?? null,
        points: entry.sbBet.points,
      },
    }));
}

test('the Hono leaderboard matches the Nest one entry for entry', async ({
  page,
  request,
}) => {
  await login(page, users.alice);
  const league = await activeLeague(page, request);

  const fromNest = await readApi<Entry[]>(
    page,
    request,
    `leaderboard?season=${season}&league=${league}`,
  );

  // page.request rather than the request fixture: the session cookie the Hono
  // app authenticates with lives in the page's jar.
  const response = await page.request.get(
    `${appPath}/leaderboard?season=${season}&league=${league}`,
    { headers: { accept: 'application/json' } },
  );
  expect(response.status()).toBe(200);
  const fromHono = (await response.json()) as Entry[];

  // A table of empty rows would compare equal to itself.
  expect(fromNest.length).toBeGreaterThan(0);
  expect(fromNest.some((entry) => entry.bets.length > 0)).toBe(true);

  expect(normalise(fromHono)).toEqual(normalise(fromNest));
});
