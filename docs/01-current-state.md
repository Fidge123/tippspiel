# 1. Current state

Assessment written on 2026-09-04 by reading `master` (`e72b2c6`), the closed and open
GitHub issues, and by building both packages locally.

## 1.1 What the application is

A German-language NFL prediction game ("Tippspiel"). Users join *leagues*, predict the
winner of every regular-season and playoff game with a confidence stake of 1–5 points,
nominate one game per week as a *doubler*, and before the season starts they predict the
final order of all eight divisions plus the Super Bowl winner. A leaderboard ranks the
league members.

Game data comes from the public ESPN API. Everything else lives in Postgres.

| | |
|---|---|
| Backend | NestJS 10, TypeORM 0.3, Postgres, Passport (JWT), Postmark, Cloudflare R2 |
| Frontend | Create React App 5, React 18, Recoil, react-router 6, Tailwind 3 |
| Size | 8.2k lines of TypeScript (4.2k backend, 4.0k frontend) |
| Hosting | Single VPS. nginx serves the SPA under `/tippspiel/` and proxies `/nfl/api/` |
| Package manager | Yarn 1.22 (EOL), one lockfile per package |
| CI | One GitHub Actions job: builds the frontend, uploads the artifact |

## 1.2 Verified baseline

Both packages were installed and built from the committed lockfiles:

| Check | Result |
|---|---|
| `backend: yarn install --frozen-lockfile && yarn build` | passes |
| `backend: yarn lint` | **fails** — ESLint 9 requires flat config, repo has `.eslintrc` |
| `frontend: yarn install --frozen-lockfile && yarn build` | passes |
| any test suite | **none exists** — no test files, no runner, no `test` script |

## 1.3 What the closed issues tell us

Issues #1–#37 are closed and read as a coherent product history: user management (#18),
email (#17), refresh tokens (#22), multi-league support (#11), the weekly leaderboard
(#26), division/SB bets in the score (#23), statistics (#27), backups to S3 (#21),
monitoring with email alerts (#37).

Two things stand out:

1. **Every feature was shipped without a single test.** The scoring rules — the part
   users actually care about — have been rewritten at least twice (`calculatePoints2021`
   is still commented out at the bottom of `leaderboard.controller.ts`, issue #28 proposed
   a third scheme) with no way to check that a change didn't silently move somebody's points.
2. **Recurring seasonal breakage.** `git log` shows `Fix season start date` twice,
   `Fix post-season leaderboard` twice, `Fix reminder mail`, `Fix post-season leaderboard
   issue`. These are all bugs that only appear at a specific point in the season calendar,
   which is exactly the class of bug a time-travelling test suite catches and manual
   testing never does.

The still-open issues #10 (votes may silently fail to reach the backend), #38 (Super Bowl
points awarded too early) and #39 (no alert when a backup fails) are all in this same
category.

## 1.4 The annual chore

Rolling the season over is four hardcoded constants:

| File | Line | Value |
|---|---|---|
| `backend/src/schedule/schedule.service.ts` | 22 | `regularSeason.year: 2025` |
| `backend/src/schedule/schedule.service.ts` | 27 | `postSeason.year: 2025` |
| `backend/src/database/league.service.ts` | 85 | `league.season = 2025` |
| `backend/src/bet/bet.service.ts` | 18 | `l.season === 2025` |

`git show 958206b` and `e4349d4` confirm this is the whole change each August.
**These still say 2025 and the 2026 season has started.**

The ESPN scoreboard response already carries everything needed to derive this
(`Scoreboard.season.year`, `leagues[0].calendar[].entries`), so the chore can be deleted
outright — see §3 of the modernization plan.

## 1.5 Bugs and hazards found while reading

Ordered by how much they matter. Each is a candidate test case first, a fix second.

### High

**H1 — Super Bowl points awarded before the game (open issue #38).**
`BetDataService.findSbWinner()` (`database/bet.service.ts:282`) ends with

```ts
return game.winner === 'home' ? game.homeTeam : game.awayTeam;
```

There is no check that the game has been played. Before kickoff `winner` is `'none'`, so
the function returns the **away** team and every player who picked it is handed 20 points.
That is the exact symptom reported in #38. Root cause confirmed.

**H2 — A type-only import silently broke the data importer for nine days.**
Commit `958206b` (2025-08-20, "Update to current season") changed
`import { ScheduleDataService }` to `import type { ScheduleDataService }`. With
`emitDecoratorMetadata`, a type-only import erases the constructor parameter's design-time
type, so Nest cannot resolve the dependency. It compiles cleanly and fails at runtime.
It was fixed in `e72b2c6` on 2025-08-29 — nine days into the season, with a commit message
of "Update dependencies". Nothing in the repository could have caught this. This single
incident is the strongest argument for the plan in §2.

**H3 — Migrations almost certainly never run in production.**
`datasource.ts` sets `migrationsRun: true` with
`migrations: [__dirname + '/database/migration/*.ts']`. In `dist/` there are no `.ts`
files other than `.d.ts` declarations, which carry no runtime classes. Entities survive
this because `app.module.ts` passes `autoLoadEntities: true`; migrations have no such
fallback. *Needs confirmation from you — if you run `yarn typeorm migration:run` by hand
via ts-node, this is harmless but misleading; if you rely on `migrationsRun`, the last
migration to actually apply was applied by accident.*

### Medium

**M1 — Unbounded startup work with no error handling.**
`ScheduleService`'s *constructor* calls `init()`, which fetches ESPN master data and then
fires 22 `importWeek()` calls **without awaiting them** (`importSchedule`, line 141).
If `load()` fails it returns `undefined` and `importWeek` immediately dereferences
`response.leagues[0]` → unhandled rejection. Booting the app hits the network; so does
booting it in a test.

**M2 — `UserDataService`'s constructor calls `cleanUp()`**, which *deletes rows*
(expired tokens and unverified users) as a side effect of instantiating the class. Any
test that constructs the service mutates the database.

**M3 — `deleteBetDoubler` is not awaited and passes an entity to `delete()`**
(`database/bet.service.ts:512`): `this.doublerRepo.delete(bet)` — the promise is dropped
and the method returns before the delete completes.

**M4 — Failed writes look like successes.** `setGameBet`, `setDivisionBet` and `setSbBet`
return `undefined` when the deadline has passed instead of throwing. The controller returns
`200` with an empty body, and the frontend posts fire-and-forget (`fetchFromAPI(..., true)`
in `State/states.ts`) without inspecting the result. This is open issue #10, and it is a
backend bug as much as a frontend one.

**M5 — `GET /schedule/:year/:seasontype/:week` is broken.**
`ScheduleDataService.getWeek()` calls `.leftJoinAndSelect('bye.team', 'team')` without ever
joining `week.byes`, so the alias `bye` does not exist. The endpoint is unused by the
frontend, which is why nobody noticed.

**M6 — Leaderboard does N+1 queries.** `LeaderboardController.getAll` issues two queries
*per league member* (`userDivBets`, `userSbBets`) inside a `Promise.all` over users, on top
of three collection queries. For a 20-person league that is 43 round trips to render one
table. `maxQueryExecutionTime: 100` will be logging warnings about it.

**M7 — No request validation.** The DTO classes carry no decorators and no
`ValidationPipe` is registered. `winner` is typed `string` and accepts any value; only
`pointDiff` is range-checked, and only in `setGameBet`.

### Low

- **L1** — Refresh cookie `maxAge: 29 * 24 * 60 * 60 * 10000` (`user.controller.ts`) is
  10× the intended value: 290 days, not 29. The refresh JWT itself is valid for a year.
- **L2** — Password comparison `user.password === (await hash(...))` is a non-constant-time
  string compare; `crypto.timingSafeEqual` is the drop-in fix.
- **L3** — `recordToFile`'s local fallback writes to the literal path `"~/backup"`, which
  the shell never expands here — it creates a directory named `~` in the working directory.
- **L4** — `s3.ts` wraps `new S3Client(...)` in try/catch, but the constructor does not
  throw on bad credentials, so the warning is unreachable and failures surface later.
- **L5** — Swagger UI is served publicly at `/api` with no guard.
- **L6** — `app.enableCors()` with no options allows every origin.

## 1.6 Dead weight

Removable today with no behaviour change:

| What | Where | Note |
|---|---|---|
| `vega`, `vega-lite`, `react-vega` | frontend deps | **Not imported anywhere.** Issue #27 used them; the code no longer does. Three of the ten frontend runtime dependencies. |
| `jwks-rsa` | backend deps | Not imported anywhere. |
| `findBetsByGame`, `votesPerGame`, `deleteUser` | `database/bet.service.ts`, `user.service.ts` | No callers. |
| `UserService` | `user/user.service.ts` | Empty class, injected nowhere meaningful. |
| `calculatePoints2021` and friends | `bet/leaderboard.controller.ts:224-255` | Commented-out 2021 scoring scheme. Git remembers it. |

## 1.7 Configuration problems

- **`package.json` at the root declares `workspaces: ["workspace-a", "workspace-b"]`** —
  neither directory exists. The workspace setup does nothing; each package has its own
  lockfile and they have drifted (`@types/node` ^20 in both, but resolved differently).
- **`.eslintrc` extends `prettier/@typescript-eslint`**, removed in
  `eslint-config-prettier` v8. Combined with ESLint 9's flat-config requirement, backend
  linting has been dead for a while.
- **The frontend `lint` script calls `eslint`, which is not a frontend dependency** — it
  only resolves through `react-scripts`' transitive tree.
- **Node 20 is end-of-life** (last release 2026-03-24; maintenance ended April 2026), yet
  `.nvmrc` still pins `v20` — and **CI pins Node 18**, which has been EOL since April 2025.
  The current Active LTS is **Node 24 "Krypton"**. This is the one item in this list that
  is a security matter rather than a tidiness matter.
- **The backend is neither built nor linted in CI** — only the frontend is.
- **Dependabot reports 39 open vulnerability alerts on `master`** (2 critical, 13 high,
  13 moderate, 11 low), surfaced by the remote on push. I could not enumerate them from
  this environment — check
  <https://github.com/Fidge123/tippspiel/security/dependabot>. For a Create React App
  project most such alerts sit in the webpack/`react-scripts` build tree and never reach a
  browser or the server; some will be real. **Triage them before deciding how much of the
  frontend upgrade path to skip** — the answer changes the CRA→Vite call in §3.2.
- **Formatting is inconsistent**: `schedule/schedule.service.ts` uses tabs and double
  quotes (Biome's defaults); everything else uses Prettier's two-space single-quote style.
