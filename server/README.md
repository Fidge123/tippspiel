# Server

The server-rendered application that replaces the SPA and the Nest API, one route at a time.
See #85 for the plan and #86 for the step that created this package.

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

`DATABASE_URL` has to point at a database that already carries the Nest schema, because `session` references `user(id)`.
`deploy/README.md` lists the rest of the environment.
Set `INSECURE_COOKIES=true` to develop over plain HTTP.

## Layout

| Path | What |
|---|---|
| `src/app.tsx` | The Hono app and its routes. Runtime-agnostic, so the test suite can import it under Node |
| `src/index.tsx` | The Bun entry. Adds static file serving and exports `{ fetch, port }` for `Bun.serve` |
| `src/routes/` | Route handlers, grouped by the page they serve |
| `src/leaderboard/` | The one leaderboard query and the assembly on top of it |
| `src/scoring.ts` | The scoring rules, moved from the Nest app rather than rewritten |
| `src/views/` | Hono JSX components, rendered server-side |
| `src/auth/` | Passwords, sessions, cookies and the SPA bridge |
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
| `./test/smoke.sh` | Boots the real service under Bun and walks the routes over HTTP |

The first two drive `app.request()` directly, which is why `src/app.tsx` must not import `hono/bun`: the Bun-only pieces live in `src/index.tsx`.
The integration suite creates the legacy `user`, `verify` and `reset` tables itself, so it does not need the Nest package.

## The leaderboard

`src/leaderboard/query.ts` reads the whole table in one query. The Nest
controller issued two per league member on top of three collection reads, which
is 43 round trips for a twenty-person league; `leaderboard.integration.test.ts`
pins the new count at five, none of them per member.

The reveal rules are applied after the read rather than folded into it, because
hiding is about who is asking, not about the data.

`src/scoring.ts` is a byte-identical copy of `backend/src/bet/scoring.ts`, and
`scoring.drift.test.ts` fails if the two ever disagree while both exist. The
arithmetic was moved, not retyped, which is what makes the golden master
evidence for the port rather than for a reimplementation.

The route answers JSON when asked for it. That projection exists so the
equivalence can be checked across the runtime split:
`e2e/tests/leaderboard-equivalence.spec.ts` drives both stacks against the same
database and compares them entry for entry.

## No JavaScript

Every page here is a real form with a `303` on success.
The two places the SPA used script are replaced rather than reimplemented:

- The hamburger dropdown is a `<details>` element.
- "Passwort vergessen?" is a second submit button on the login form, with `formaction` and `formnovalidate`, so it reuses the address already typed.
