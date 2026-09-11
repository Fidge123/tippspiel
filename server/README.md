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

## No JavaScript

Every page here is a real form with a `303` on success.
The two places the SPA used script are replaced rather than reimplemented:

- The hamburger dropdown is a `<details>` element.
- "Passwort vergessen?" is a second submit button on the login form, with `formaction` and `formnovalidate`, so it reuses the address already typed.
