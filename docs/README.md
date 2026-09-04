# Roadmap

Plan for getting this project from "works, but nobody dares touch it" to "a human or an
agent can change it confidently", and then onto a stack worth keeping.

| Document | Contents |
|---|---|
| [`01-current-state.md`](./01-current-state.md) | What the app is, what actually builds, the bugs found while reading, the dead weight |
| [`02-testing-strategy.md`](./02-testing-strategy.md) | A five-tier test strategy built on the DB backups and recorded ESPN responses |
| [`03-stack-modernization.md`](./03-stack-modernization.md) | Which updates are free, which are not worth it before a rewrite, and what to rewrite onto |

## The three findings that shape everything

1. **The 2026 season has started and the code still says 2025.** Four constants. Urgent,
   and independent of everything else here.
2. **A one-word change (`import` → `import type`) broke the data importer for nine days at
   the start of the 2025 season.** It compiled. Nothing in the repository could have caught
   it. That is the case for tests, made by the project itself.
3. **The JavaScript-disabled requirement is an architecture decision, not a preference.**
   It rules out the current SPA, and it rules out incrementally modernizing it. Which is
   fine — it also means most dependency upgrades are not worth doing.

## Sequence

Ordered so that each phase makes the next one safe. Estimates assume familiarity with the
code, i.e. yours or an agent's working from these documents.

### Phase 0 — Season 2026 · ~1 h · do today

Bump the four constants (§1.4). Ship it. Then verify against production that week 1 games
imported and the schedule renders.

Do **not** bundle anything else into this commit.

### Phase 1 — Stop the bleeding · ~4 h

- **Move to Node 24 LTS.** `.nvmrc` pins v20, which went end-of-life in April 2026; CI
  pins Node 18, EOL since April 2025. Update both, and the VPS.
- Fix CI: build **and** typecheck **and** lint the backend too, and run on PRs.
- Replace ESLint + Prettier with Biome, one config for both packages (§3.1).
- Delete the unused dependencies: `vega`, `vega-lite`, `react-vega`, `jwks-rsa` (§1.6).
- Apply the drop-in version bumps (§3.1).
- Fix or delete the fictional root `workspaces` entry.

Nothing here changes behaviour. Everything here carries over to the new stack.

### Phase 2 — Pure-logic tests · ~5 h

- Extract scoring into `backend/src/bet/scoring.ts` as pure functions (§2, tier 1).
- Vitest, and the table of scoring cases in §2.
- **Write the test for the Super Bowl bug (H1) as a failing test and leave it failing** —
  or mark it `.fails()` — so it is documented before it is fixed in Phase 5.

First point where a change to scoring gets caught automatically.

### Phase 3 — Testability refactors + API tests · ~10 h

- `ScheduleService.init()` out of the constructor; `UserDataService.cleanUp()` too (M1, M2).
- `await` the imports in `importSchedule`; make `load()` throw rather than return
  `undefined`.
- `email.ts` / `s3.ts` become Nest providers so tests can override them.
- Testcontainers + MSW + supertest harness; schema created **by running the migrations**,
  which also settles H3.
- Cover auth, bet deadlines, doubler rules, league permissions (§2, tier 2).

### Phase 4 — Golden master · ~8 h

- Pull one completed season's recorded ESPN responses out of the R2 bucket into
  `test/fixtures/espn/2024/`.
- Write `anonymize.sql`, produce `seed.sql` from a real backup. **Review the anonymiser
  carefully — this is the step where real user emails could end up in a public repo.**
- Snapshot the leaderboard at the seven as-of dates in §2, seeded from *current* behaviour
  so the suite starts green with the known bugs encoded in the snapshots.

After this, an agent can refactor the backend and prove nobody's points moved.

### Phase 5 — Fix the bugs · ~5 h

Now that a snapshot diff will show exactly who is affected:

- **H1 / issue #38** — `findSbWinner` must return nothing unless the game is final.
  The snapshot diff is the proof.
- **M4 / issue #10** — throw instead of silently returning `undefined` on a missed
  deadline; surface the error in the UI.
- **M3** — `await` the doubler delete and pass criteria, not an entity.
- **M5** — fix or delete the broken `getWeek` join.
- **M6** — collapse the leaderboard's N+1 into one query. Golden master proves it.
- **M7** — add `ValidationPipe` + DTO validation.
- **L1** — the 290-day cookie.
- **Kill the annual chore**: derive the season from the ESPN scoreboard
  (`Scoreboard.season.year`, `leagues[0].calendar[].entries`) instead of hardcoding it.
  This is a logic change, which is why it lands here and not in Phase 0.

### Phase 6 — Canaries · ~3 h

`/health` with a last-successful-import timestamp, an alert when imports go stale, and
issue #39's backup-failure alert (§2, tier 5).

### Phase 7 — Rewrite, one route at a time · ~40–55 h

The stack in §3.3 — Hono + Hono JSX + Kysely + Postgres, Node 24, pnpm, Biome, Tailwind 4 —
moved in behind nginx route by route: static pages, then leaderboard, then auth, then
betting, then division bets, then delete `frontend/`.

Add the Playwright tier (§2, tier 4) at the start of this phase, and run every flow twice:
once with JavaScript, once with `javaScriptEnabled: false`. That second run is the
acceptance criterion for the whole rewrite.

## Effort

| Phase | Hours | Cumulative |
|---|---|---|
| 0 Season 2026 | 1 | 1 |
| 1 Stop the bleeding | 4 | 5 |
| 2 Pure-logic tests | 5 | 10 |
| 3 Refactors + API tests | 10 | 20 |
| 4 Golden master | 8 | 28 |
| 5 Bug fixes | 5 | 33 |
| 6 Canaries | 3 | 36 |
| 7 Rewrite | 40–55 | 76–91 |

Phases 0–4 (~28 h) are where the confidence comes from. Phase 7 is optional in the sense
that the site keeps working without it — but it is the only path to the JavaScript-disabled
requirement.

## Open questions for you

1. **H3** — do you run `yarn typeorm migration:run` by hand, or rely on `migrationsRun`?
   If the latter, migrations have not been applying in production.
2. **Backups** — how far back does the R2 bucket go? Phase 4 needs one complete season of
   `scoreboard-*` recordings, ideally 2024.
3. **Docker on the VPS/CI** — available? It decides Testcontainers vs. a plain Postgres
   service container in Phase 3.
4. **Kysely or Drizzle** (§3.3) — my recommendation is Kysely for the leaderboard query;
   Drizzle is the more popular choice and not a wrong answer.
5. **Scope of the rewrite** — is issue #36 (league invites, locking, participant limits)
   part of it, or does the rewrite reproduce today's features exactly? Reproducing exactly
   is what makes the golden master useful; adding features mid-rewrite is what makes
   rewrites fail.
