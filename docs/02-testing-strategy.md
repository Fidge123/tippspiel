# 2. Testing strategy

## 2.1 What the tests have to buy us

Not coverage. Two specific things:

1. **A human can change scoring, the importer or the schema and know within 90 seconds
   whether anyone's points moved.** Every recurring bug in the history is of this shape.
2. **A coding agent can refactor without a human reviewing every line.** An agent needs an
   executable definition of "still correct" that it cannot argue with. Snapshot diffs of a
   real season's leaderboard are that definition.

Everything below is sized for an 8k-line hobby project maintained by one person. The
suite must run in under two minutes locally or it will not be run.

## 2.2 The five tiers

```
tier 0  static gates          ~10s   every save
tier 1  pure logic units      ~2s    every save
tier 2  API + real Postgres   ~45s   every commit
tier 3  season golden master  ~60s   every commit
tier 4  browser smoke         ~90s   pull requests only
tier 5  production canaries    n/a   continuously, in prod
```

---

### Tier 0 — Static gates

- `tsc --noEmit` in both packages. The backend has no typecheck script today; `nest build`
  is the only thing that type-checks it.
- One lint/format tool across both packages (see §3 — recommendation is Biome).
- CI runs both packages, on push *and* pull request, on the Node version in `.nvmrc`.

This tier alone would not have caught H2 (the `import type` regression), which is why
tier 2 exists.

---

### Tier 1 — Pure logic units

**The prerequisite is a refactor**: the scoring rules are currently private functions at
the bottom of `bet/leaderboard.controller.ts`, taking TypeORM entities. Extract them into
`backend/src/bet/scoring.ts` as pure functions over plain data:

```ts
export function gamePoints(input: {
  homeScore: number; awayScore: number; status: GameStatus;
  bet?: { winner: 'home' | 'away'; pointDiff: number };
  allBets: { winner: string }[];      // for the underdog bonus
  doubled: boolean;
}): number

export function divisionPoints(bet: DivisionBetInput): number
export function superbowlPoints(pick?: TeamId, winner?: TeamId): number   // <- H1 lives here
export function underdogBonus(winner: string, allBets: { winner: string }[]): boolean
```

Then table-driven tests. The rules to pin, read off the current implementation:

| Case | Expected |
|---|---|
| no bet placed on a finished game | `-1` |
| correct pick | `+pointDiff` |
| wrong pick | `-pointDiff` |
| tie | `0` |
| correct pick, doubler | `pointDiff * 2` |
| correct pick, underdog bonus (`picks * 3 <= total`) | `pointDiff + 1` |
| correct pick, underdog bonus **and** doubler | `(pointDiff + 1) * 2` |
| division: 1st correct | `+7`; 2nd/3rd/4th each `+1`; all four | `10 + 5 = 15` |
| Super Bowl pick correct | `+20` |
| **Super Bowl not yet played** | **`0`** — currently `20` for whoever picked the away team (H1) |

Also pure and worth unit tests: `currentWeekState`'s week-selection reducer
(`frontend/src/State/states.ts:155`, a nine-branch date comparison), `validateToken`
(`frontend/src/api.ts`), and the "games without bets" filter used by the reminder mail
(`findGamesWithoutBets`, whose `!leagues.every(...)` predicate is worth stating explicitly
in a test — it reads as if it might mean `some`).

Runner: **Vitest**. One runner for both packages, no `ts-jest`/babel config, instant watch
mode. `scoring.ts` has no decorators, so esbuild's lack of `emitDecoratorMetadata` does not
matter at this tier.

Expect ~50 assertions and a permanent end to "did I just change everyone's score".

---

### Tier 2 — API tests against a real Postgres

Boot the real Nest application and talk to it over HTTP with `supertest`.

**Database**: `@testcontainers/postgresql` starts a throwaway Postgres per run; identical
behaviour locally and in CI with no setup. Allow `TEST_DATABASE_URL` to override it so the
suite still runs where Docker isn't available.

**Create the schema by running the migrations, not `synchronize`.** That gives you, for
free, the test nothing currently provides: *the migration chain applies cleanly from an
empty database*. Given H3, this is worth having on day one.

**ESPN**: intercept `fetch` with **MSW** (`msw/node`) and serve the recorded responses
from `test/fixtures/espn/` (see §2.4). No test ever touches the network.

**Postmark**: `email.ts` already degrades to a stub when `POSTMARK` is unset. Change the
stub from "reject" to "record into an array" so tests can assert *which* mails were sent —
the reminder mail has had two bugs (`1676f37`, `e1fe3af`).

**Prerequisite refactors** (all of them also fix real bugs — M1, M2):

- Move `ScheduleService.init()` out of the constructor into `onModuleInit()`, gated by an
  env flag. Booting the app must not fetch 22 weeks of scoreboards.
- Move `UserDataService.cleanUp()`'s self-invocation out of the constructor. Instantiating
  a service must not delete rows.
- `await` the `importWeek` calls in `importSchedule`, and make `load()` throw instead of
  returning `undefined`.
- Make `email.ts` and `s3.ts` Nest providers instead of module-level singletons, so
  `overrideProvider` works.

**What to cover** — the branches where the app says *no*, because those are the ones with
money (well, pride) attached:

- auth: register → verify → login → refresh → access a guarded route; login with an
  unverified account; expired/invalid token; throttling on `/user/login` and `/user/register`.
- bet deadlines: a bet placed one second before kickoff succeeds; one second after is
  rejected. Same for division and Super Bowl bets against week 1's first kickoff.
- doubler rules: set, move to another game in the same week, delete, and the "cannot move
  it once the originally doubled game has started" rule in `setBetDoubler`.
- league permissions: `league.service.ts` has eleven distinct `Forbidden`/`BadRequest`
  branches (last admin, last member, non-member promoted to admin, …). Cheap and high value.
- `pointDiff` outside 1–5, unknown `winner` string, missing league — see M7.

---

### Tier 3 — Season golden master

**This is the tier that makes agent-driven refactoring safe**, and it is built almost
entirely from assets you already have.

#### The idea

Replay a complete recorded season through the real importer into a real database seeded
from a real (anonymised) backup, then snapshot the full leaderboard for every league at
several points in the season calendar. Any change in any player's points fails the test
with a readable diff.

#### Fixtures

1. **ESPN responses — you already record these.** `recordToFile()` writes
   `groups/…json.gz`, `teams-<division>/…json.gz` and
   `scoreboard-<year>-<seasontype>-<week>/…json.gz` to the `nfl-tippspiel` R2 bucket on
   every import. Pull one snapshot per week of a completed season (2024 is a good choice —
   complete, and it exercises the post-season fixes from `75d0349`) into
   `backend/test/fixtures/espn/2024/`. Public data, ~2–4 MB gzipped; commit it, or ship it
   as one tarball fetched by a `pretest` script if you would rather keep the repo lean.

   Add a second, small set: **one week captured mid-game** (`STATUS_IN_PROGRESS`,
   `STATUS_HALFTIME`) so the "live scores" path is covered, not just finished games.

2. **Database — from your backups, anonymised.** Write
   `backend/test/fixtures/anonymize.sql` so this is reproducible and the real dump never
   touches git:

   - `"user".name` → `'Player ' || row_number`
   - `"user".email` → `'player-' || n || '@example.invalid'`
   - `"user".password`/`salt` → the scrypt hash of a single known test password
   - drop everything in `reset` and `verify`
   - keep `bet`, `betDoubler`, `divisionBet`, `superbowlBet`, `league`, `member`, `admin`
     **exactly as they are** — the bets are the interesting part and they identify nobody
     once names and emails are gone

   Commit the resulting `seed.sql`. Under GDPR this is the difference between a test
   fixture and a data breach in a public repository, so treat the anonymiser as
   production code and review it once, carefully.

#### The test

```
given   seed.sql loaded into a fresh database
and     the system clock frozen at <as-of date>
and     ESPN served from fixtures/espn/2024
when    ScheduleService imports every week up to that date
and     GET /leaderboard?league=…&season=2024 is called for each league
then    the response matches the committed snapshot
```

Run it at these as-of dates, each of which corresponds to a bug that has actually happened:

| As-of | Why |
|---|---|
| before week 1 kickoff | division and SB bets still open and still hidden |
| week 1, mid-game | live scoring, `STATUS_IN_PROGRESS` |
| week 8 | steady state, doublers, underdog bonuses |
| week 18 | end of regular season |
| playoffs week 1 | division bets reveal (`isPlayoffs`), division points score |
| **Super Bowl week, before kickoff** | **H1 / issue #38 — the snapshot must show 0 SB points** |
| after the Super Bowl | final table; the post-season bugs of `0362b9d` / `75d0349` |

#### Seeding the snapshots

Generate the first snapshots from **current** behaviour so the suite is green on day one.
The known bugs are then *encoded in the snapshot*, with a comment saying so. Fixing H1
becomes a commit whose diff is `-20 → +0` in one snapshot file — visible, reviewable,
intentional. That is exactly the workflow you want, and it is why the snapshots come before
the fixes in the roadmap.

#### Determinism

The code calls `new Date()` in a dozen places. Two options:

- `vi.setSystemTime()` in the tests (zero production changes, works because everything is
  in one process), or
- inject a `Clock` provider and use it in the four places that gate on time
  (`setGameBet`, `setBetDoubler`, `findGamesWithoutBets`, `findCurrentWeek`).

Start with fake timers; introduce the `Clock` only if fake timers fight with the Postgres
driver.

---

### Tier 4 — Browser smoke tests

**Playwright**, five to eight flows, no more. This tier rots fastest and is the least
valuable per line, but it is the only one that proves the SPA and the API agree, and it
gives an agent screenshots to look at.

- log in → schedule renders → place a bet → reload → the bet is still there
- set a doubler, move it, remove it
- leaderboard renders and its total matches `GET /leaderboard`
- register → follow the verification link → log in
- 375px-wide viewport renders without horizontal scroll (the layout is grid-heavy)

Run against the tier-3 seeded database with a frozen-ish clock. Pull requests only.

When the site is rewritten to work without JavaScript (§3), add one more, and it is the
cheapest high-value test in the whole suite: **run the same flows with
`javaScriptEnabled: false`**. That is the acceptance criterion for the new stack, expressed
as a test.

---

### Tier 5 — Production canaries

Tests catch regressions; canaries catch the world changing under you. ESPN can rename a
field at any time and no amount of fixture-based testing will tell you.

- `GET /health` — database reachable, timestamp of the last successful ESPN import,
  count of games imported for the current week. nginx or a free uptime monitor watches it.
- Alert when the last successful import is older than ~2 hours during the season. The
  `notify()` mail already exists for hard failures; this covers silent ones.
- Close issue #39 the same way: alert when a backup upload fails.
- Optional and cheap: a nightly job that recomputes the leaderboard and mails you a diff
  if anyone's total changed for a game that was already final. That is H1's alarm bell.

---

## 2.3 Test layout

```
backend/
  src/bet/scoring.ts                 # extracted pure rules
  src/bet/scoring.test.ts            # tier 1, colocated
  test/
    fixtures/
      espn/2024/…json                #   recorded ESPN responses
      seed.sql                       #   anonymised DB dump
      anonymize.sql                  #   how seed.sql was produced
    helpers/
      app.ts                         #   boot Nest w/ testcontainer + MSW
      clock.ts
    api/*.spec.ts                    # tier 2
    golden/season-2024.spec.ts       # tier 3
    golden/__snapshots__/            #   the leaderboards
frontend/
  src/**/*.test.tsx                  # tier 1 (a handful)
e2e/                                 # tier 4, Playwright
```

## 2.4 CI

```yaml
lint + typecheck        ~30s   both packages, Node from .nvmrc
unit (tier 0/1)          ~5s
integration (tier 2)    ~60s   postgres service container
golden master (tier 3)  ~60s
playwright (tier 4)     ~90s   pull requests only
```

Also fix what is there today: CI pins Node 18 while `.nvmrc` says 20; the backend is
neither built nor linted.

Add a nightly job **on the VPS, not in Actions**: restore last night's real backup into a
scratch database and run tier 2 against it. That catches data-shape drift in production
data that fixtures never will.

## 2.5 The rule for agents (and for you)

Put this in `CLAUDE.md` so it applies to every session:

> Any change to scoring, the importer, or the schema must land in the same commit as
> (a) a tier-1 test for the new behaviour and (b) the updated tier-3 snapshots.
> A snapshot diff is never accepted without a sentence in the commit message explaining
> which points moved and why.

## 2.6 Effort

| | |
|---|---|
| Tier 0 + CI | 2–3 h |
| Tier 1 (incl. extracting `scoring.ts`) | 4–5 h |
| Tier 2 (incl. the M1/M2 refactors) | 8–10 h |
| Tier 3 (fixture extraction + anonymiser + snapshots) | 6–8 h |
| Tier 4 | 3–4 h |
| Tier 5 | 2–3 h |
| **Total** | **~25–33 h** |

Tiers 0–3 are ~20 hours and deliver roughly 90% of the confidence. Tier 4 can wait until
after the stack decision, since the rewrite will change every selector anyway.
