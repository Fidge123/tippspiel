# Server

The whole application.
It replaced an SPA and a Nest API one route at a time; #85 has the plan and #91 the step that deleted them.

Hono on Bun, Hono JSX rendered to a string, Tailwind 4.
Nothing ships to the browser: every page here works with JavaScript disabled because there is no JavaScript to disable.

## Run it

```
bun install
bun run migrate
bun run build:css
bun run dev
```

Then open http://localhost:5002/tippspiel/impressum.

`DATABASE_URL` can point at an empty database: `bun run migrate` builds the schema from scratch.
`deploy/README.md` lists the rest of the environment.
Set `INSECURE_COOKIES=true` to develop over plain HTTP.

## Layout

| Path | What |
|---|---|
| `src/app.tsx` | The Hono app and its routes. Runtime-agnostic, so the test suite can import it under Node |
| `src/index.tsx` | The Bun entry. Adds static file serving and exports `{ fetch, port }` for `Bun.serve` |
| `src/routes/` | Route handlers, grouped by the page they serve |
| `src/leaderboard/` | The one leaderboard query and the assembly on top of it |
| `src/schedule/` | The schedule read, and the bet, doubler and spoiler writes |
| `src/division/` | Pre-season division and Super Bowl bets |
| `src/leagues/` | League administration and its permission checks |
| `src/account/` | The three account settings |
| `src/scoring.ts` | The scoring rules, moved from the Nest app rather than rewritten |
| `src/jobs/` | The ESPN imports, the bet reminder and the token cleanup, run by systemd timers |
| `src/views/` | Hono JSX components, rendered server-side |
| `src/auth/` | Passwords, sessions and cookies |
| `src/db/` | Kysely, the schema types and the migration runner |
| `src/email/` | SMTP2GO delivery and the templates the auth flows send |
| `styles/app.css` | Tailwind source. `build:css` emits `static/app.css`, which is generated and not committed |
| `deploy/` | systemd unit, nginx blocks, and the cut-over and rollback procedure |

## Tests

Three tiers, all Vitest on Node:

| Command | What |
|---|---|
| `bun run test` | Unit and route tests, no database |
| `bun run test:integration` | The auth flows against a real Postgres, via `TEST_DATABASE_URL` |
| `bun run test:replay` | The golden master: a recorded season imported week by week, see `test/replay` |
| `bun run test:delivery` | One real mail through SMTP2GO, see `test/delivery` |
| `./test/smoke.sh` | Boots the real service under Bun and walks the routes over HTTP |

The first two drive `app.request()` directly, which is why `src/app.tsx` must not import `hono/bun`: the Bun-only pieces live in `src/index.tsx`.

## The leaderboard

`src/leaderboard/query.ts` reads the whole table in one query. The Nest
controller issued two per league member on top of three collection reads, which
is 43 round trips for a twenty-person league; `leaderboard.integration.test.ts`
pins the new count at five, none of them per member.

The reveal rules are applied after the read rather than folded into it, because
hiding is about who is asking, not about the data.

`src/scoring.ts` was moved from the Nest app byte for byte, not retyped, which
is what makes the golden master in `test/replay` evidence for the port rather
than for a reimplementation.

## Scheduled jobs

Nest ran the five jobs inside the web process, on `@Cron` decorators. They are
systemd timers now, one `bun run src/jobs/cli.ts <name>` each, so a restart
cannot drop one mid-flight and a crash in one cannot take the site down.
`deploy/README.md` has the schedule.

## The betting page

Every bet is its own `<form method="post">`: two radios for the winner, a select
for the stake, one submit. The doubler is a radio per game that belongs to a
week-level form through the `form` attribute, because a form cannot be nested
inside the per-game ones.

Every deadline is checked against the server clock and nothing else.
`schedule.integration.test.ts` covers each rejection on its own: a late bet, a
doubler moved onto or off a game that has started, removing one that has
started, and a league the player is not a member of.

The compact layout is CSS. The SPA chose the team label and the statistics
headers from `window.innerWidth`; all the variants are rendered and the
breakpoints choose, which needs no script and cannot go stale on resize.

Spoiler protection defaults to **on**, matching the SPA's `hideByDefault ?? true`.
A user who has never touched the toggle should not be shown a score they have
not watched yet.

## League permissions

`leagues/writes.ts` is the only place that decides who may change a league, and
every branch has a test: who may rename, delete, add, kick, promote and demote,
that a league keeps at least one admin and at least one member, and that a
member must already be in the league to become an admin.

Removing a member takes their bets for that league with them, and refuses when
it would leave the league without an admin. Both were wrong in the Nest service:
a departed member kept skewing the vote counts and the underdog bonus, and
removing the sole admin left a league nobody could administer.

## No JavaScript

Every page here is a real form with a `303` on success.
The two places the SPA used script are replaced rather than reimplemented:

- The hamburger dropdown is a `<details>` element.
- "Passwort vergessen?" is a second submit button on the login form, with `formaction` and `formnovalidate`, so it reuses the address already typed.
