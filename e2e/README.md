# Browser tests

The flows through the real server, in Chromium.

```
bun run test
```

Postgres comes from a container, so a first run needs [a container runtime](#the-container-runtime).

## What it covers

Only the integration failures the lower tiers cannot see: that the rendered pages, the cookies and the deadlines agree once a real browser drives them.

## Projects

| Project | What |
|---|---|
| `desktop` | The flows in a normal browser |
| `mobile` | The schedule at iPhone width |
| `no-js` | `javaScriptEnabled: false` — the acceptance criterion for #85 |

Playwright talks to the server directly on its own port, under the same `/tippspiel` prefix nginx proxies in production.

Rate limiting is disabled here, because every test logs in from 127.0.0.1 and would share one bucket.
The limiter has its own tests in `server/src/routes/auth.integration.test.ts`.
Coverage of rules belongs in the unit tests.
The suite stays small on purpose, because this tier is the slowest and the first to break on unrelated markup changes.

Where the application does not behave as intended yet, the test states the intended behaviour and carries `test.fail` with the issue that will fix it named above it.
Fixing the issue turns the test red, which is the reminder to drop the marker.

## The harness

- **Database.** `startPostgres` from `server/test/support`, so this suite and the golden master share one testcontainer setup. It needs a container runtime, see below.
- **Server.** `bun run src/index.tsx` as a child process, after `bun run migrate` and `bun run build:css`, so the schema comes from the migration chain and the stylesheet is never stale.
- **Seed.** Written straight to the database in `harness/seed.ts`: two divisions, a finished week, an upcoming week, two users in one league with their bets on the finished week, and a third user in no league. Kickoffs are placed relative to now, so no test depends on the day it runs.
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
