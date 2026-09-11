# tippspiel

An NFL prediction game: players bet on every game of the season, double one bet a week, and pick the division winners and the Super Bowl champion before kickoff.
Live at [nfl-tippspiel.de](https://nfl-tippspiel.de/tippspiel/).

| Package | What |
|---|---|
| [`server`](server) | The application: Hono on Bun, server-rendered, Tailwind 4, Kysely on Postgres |
| [`e2e`](e2e) | The browser tests, Playwright against a real server and a real database |

An SPA and a Nest API served this until #85 replaced them one route at a time.
Everything the browser needs is now HTML: no bundle, no client-side routing, and every flow works with JavaScript turned off.

## Getting started

```
cd server
bun install
bun run migrate
bun run build:css
bun run dev
```

`DATABASE_URL` points at Postgres, and `server/deploy/README.md` documents the rest of the environment and how the thing is deployed.
