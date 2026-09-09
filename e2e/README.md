# Browser tests

Seven flows through the built frontend and the real backend, in Chromium.

```
yarn --cwd ../backend build
yarn --cwd ../frontend build
yarn test
```

Postgres comes from a container, so a first run needs [a container runtime](#the-container-runtime).

## What it covers

Only the integration failures the lower tiers cannot see: that the frontend and the API agree on urls, payloads, cookies and deadlines.
Coverage of rules belongs in the unit tests, coverage of the API in `backend/test/api`.
The suite stays at seven flows on purpose, because this tier is the slowest and the first to break on unrelated markup changes.

1. `bets` places a bet on an upcoming game and reloads.
2. `doubler` sets a doubler, moves it to another game of the same week and removes it.
3. `leaderboard` compares the totals in the table against the leaderboard endpoint.
4. `registration` registers an account, follows the verification link and logs in.
5. `spoiler` turns off the spoiler protection of a finished week and reloads.
6. `mobile` renders the schedule on an iPhone sized viewport without horizontal scroll.
7. `mail` registers against a mail sending backend and reads the verification mail out of a real inbox.

Where the application does not behave as intended yet, the test states the intended behaviour and carries `test.fail` with the issue that will fix it named above it.
Fixing the issue turns the test red, which is the reminder to drop the marker.

## Mail

`mail` is the only test that sends a real mail, and it needs two secrets: `SMTP2GO_API_KEY` for the backend to send through SMTP2GO, and `GETTESTMAIL_KEY` for the suite to read the mail out of a throwaway [GetTestMail](https://gettestmail.com) inbox.
Both are set in CI and the test fails without them.

SMTP2GO allows 200 mails a day and GetTestMail 300 a month, so the mailbox is the tighter limit and the flow stays at exactly one mail per run.
That is why it registers against a second backend that only this test starts: the shared backend runs without an API key and records its mail instead of sending it, which is what keeps `registration` and the API tests free.
The same reasoning leaves `EMAIL` unset on that second backend, because the admin alert on a registration would otherwise double the cost.

Keep it that way when adding tests.
A flow that needs to assert on mail belongs in `backend/test/api`, where `sentEmails` holds everything the application tried to send.

## The harness

- **Database.** `startPostgres` from `backend/test/support`, so this suite and the API tests share one testcontainer setup. It needs a container runtime, see below.
- **Backend.** `backend/dist/main.js` as a child process. It applies the migrations on boot, so the schema comes from the migration chain.
- **Frontend.** `frontend/build`, served by the harness under `/tippspiel/` with `/nfl/api/` proxied to the backend. Serving both from one origin is what the deployment does, and it keeps the refresh cookie working.
- **Seed.** Written straight to the database in `harness/seed.ts`: two divisions, a finished week, an upcoming week, two users in one league with their bets on the finished week, and a third user in no league. Kickoffs are placed relative to now, so no test depends on the day it runs.
- **Mailbox.** `harness/gettestmail.ts` creates an inbox that expires after 15 minutes and polls it until the mail arrives.
- **Selectors.** Roles and labels only. The markup is Tailwind heavy and about to be rewritten, so a class based selector would not survive.

The flows share one seeded database and therefore run one after another.
They are not idempotent either, so they need a freshly seeded database: turning on retries would replay them against the state a failed attempt left behind.

## The container runtime

`startPostgres` uses [Testcontainers](https://node.testcontainers.org), so the machine running the suite needs a Docker compatible runtime.
Without one the global setup stops with `Could not find a working container runtime strategy`.
The way out is either a runtime, as below, or `TEST_DATABASE_URL` pointing at a Postgres the tests may create and drop databases on, which is what CI does.

Docker Desktop and Docker Engine need no further setup.
Podman works as well, once its socket is exposed and the resource reaper is turned off.
[Supported container runtimes](https://node.testcontainers.org/supported-container-runtimes/) is the reference for both.

### Podman on Linux

```
sudo apt install podman
systemctl --user enable --now podman.socket

export DOCKER_HOST=unix://$(podman info --format '{{.Host.RemoteSocket.Path}}')
export TESTCONTAINERS_RYUK_DISABLED=true
```

### Podman on macOS

```
brew install podman
podman machine init
podman machine start

export DOCKER_HOST=unix://$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
export TESTCONTAINERS_RYUK_DISABLED=true
```

Rootless Podman cannot run the resource reaper, the container Testcontainers otherwise uses to clean up after a run that died, which is what `TESTCONTAINERS_RYUK_DISABLED` is about.
A normal run leaks nothing either way, because the global setup stops the Postgres container itself.
A run that is killed halfway leaves it behind, so keep `podman ps` and `podman rm` in reach.
Under rootful Podman keep the reaper and set `TESTCONTAINERS_RYUK_PRIVILEGED=true` instead.

Every shell that runs the suite needs those exports, so they belong in a shell profile or in `.envrc`.

## Browser

By default Playwright's own Chromium runs the suite.
Set `PLAYWRIGHT_CHANNEL=chrome` to use a Chrome that is already installed, which is what CI does to avoid downloading a browser.

## When something fails

A failing run keeps a trace and a screenshot under `test-results/`.

```
npx playwright show-trace test-results/<test>/trace.zip
```
