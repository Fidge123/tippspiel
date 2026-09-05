# Browser tests

Six flows through the built frontend and the real backend, in Chromium.

```
yarn --cwd ../backend build
yarn --cwd ../frontend build
yarn test
```

## What it covers

Only the integration failures the lower tiers cannot see: that the frontend and the API agree on urls, payloads, cookies and deadlines.
Coverage of rules belongs in the unit tests, coverage of the API in `backend/test/api`.
The suite stays at six flows on purpose, because this tier is the slowest and the first to break on unrelated markup changes.

1. `bets` places a bet on an upcoming game and reloads.
2. `doubler` sets a doubler, moves it to another game of the same week and removes it.
3. `leaderboard` compares the totals in the table against the leaderboard endpoint.
4. `registration` registers an account, follows the verification link and logs in.
5. `spoiler` hides the scores of a finished week and reloads.
6. `mobile` renders the schedule on an iPhone sized viewport without horizontal scroll.

## The harness

- **Database.** `startPostgres` from `backend/test/support`, so this suite and the API tests share one testcontainer setup. Set `TEST_DATABASE_URL` where Docker is not available.
- **Backend.** `backend/dist/main.js` as a child process. It applies the migrations on boot, so the schema comes from the migration chain.
- **Frontend.** `frontend/build`, served by the harness under `/tippspiel/` with `/nfl/api/` proxied to the backend. Serving both from one origin is what the deployment does, and it keeps the refresh cookie working.
- **Seed.** Written straight to the database in `harness/seed.ts`: two divisions, a finished week, an upcoming week, two users in one league and their bets on the finished week. Kickoffs are placed relative to now, so no test depends on the day it runs.
- **Selectors.** Roles and labels only. The markup is Tailwind heavy and about to be rewritten, so a class based selector would not survive.

The flows share one seeded database and therefore run one after another.

## Browser

By default Playwright's own Chromium runs the suite. Set `PLAYWRIGHT_CHANNEL=chrome` to use a Chrome that is already installed, which is what CI does to avoid downloading a browser.

## When something fails

A failing run keeps a trace and a screenshot under `test-results/`.

```
npx playwright show-trace test-results/<test>/trace.zip
```
