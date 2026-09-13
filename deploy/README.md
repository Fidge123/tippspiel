# Deploying the Hono server

The server answers every path under `/tippspiel` on port 5002.
The SPA build and the Nest API it replaced are gone, so nginx no longer splits traffic between two applications.

## URL layout

nginx proxies without rewriting and the app mounts itself at `BASE_PATH`, so links the app generates already carry the prefix.
The alternative, stripping the prefix in nginx, would leave the app generating links it cannot serve.

The session cookie gets `Path=/tippspiel` for the same reason.

## Install

```
useradd --system --home /srv/tippspiel tippspiel
git clone https://github.com/Fidge123/tippspiel /srv/tippspiel
chown -R tippspiel:tippspiel /srv/tippspiel
cd /srv/tippspiel && bun run deploy
```

`bun run deploy` is `bun install --frozen-lockfile --production`, which installs the seven runtime dependencies and none of the test, lint or type tooling: 50 MB rather than 314 MB.
Tailwind is a runtime dependency rather than a development one because the service builds its own stylesheet on every start, which is what keeps that file from ever being stale.

`/etc/tippspiel/server.env` should be `0600` and owned by root:

| Variable | Required | What |
|---|---|---|
| `DATABASE_URL` | yes | The application database. Must be a `postgres://` or `postgresql://` url |
| `COOKIE_SECRET` | yes | Signs the session cookie. Rotating it logs everyone out |
| `EMAIL` | no | Where the admin alerts go. Unset means a failed import stays silent |
| `SMTP2GO_API_KEY` | no | Unset means no mail is sent at all, so nobody can register or reset a password |
| `SEASON` | no | The season the jobs import and remind for. Defaults to 2026 |
| `R2_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | no | Where the imports record their ESPN responses |
| `JOBS_DISABLED` | no | `true` stops the scheduled jobs from registering. For dev and tests, never production |

The server checks all of these on startup.
A missing `DATABASE_URL` or `COOKIE_SECRET`, or a value it cannot parse, is a `FATAL` line and a refusal to start, because there is no useful way to run without them: an unset `COOKIE_SECRET` would fall back to the development key that ships in the repository, and anyone reading it could forge a session.
Everything else that is missing is a `WARN` line naming what stops working, and the server starts.

The R2 credentials are not optional in practice.
Every ESPN response an import reads is written to that bucket, and the recorded corpus is what the golden master in `test/replay` replays.
Without them the recordings land in `/var/lib/tippspiel/backup` instead and the corpus stops growing.
systemd creates that directory from `StateDirectory`, so it sits outside the checkout and survives a redeploy.

```
cp deploy/tippspiel-server.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now tippspiel-server
```

`ExecStartPre` runs the migrations and regenerates the stylesheet on every start, so a failed migration is a failed start rather than a half-running server, and the only generated file is never stale or committed.
The application itself runs from the `.ts` and `.tsx` sources, with no build step.

## Updating

```
cd /srv/tippspiel && git pull
bun run deploy
systemctl restart tippspiel-server
```

Run `bun install --frozen-lockfile` instead of `bun run deploy` when you need the test tooling on the box, and `bun run deploy` again afterwards to get back to the runtime set.

Confirm it survives a reboot rather than assuming it: `systemctl reboot`, then `curl -sf localhost:5002/tippspiel/health`.

## Scheduled jobs

The five jobs run inside the server process on `Bun.cron`, on the schedules the Nest `@Cron` decorators carried, read in the server's local time zone.

| Job | Runs | What it does |
|---|---|---|
| `import-master-data` | 07:03 daily, Aug to Feb | Teams, divisions and standings |
| `import-schedule` | 07:48 daily, Aug to Feb | Every week of the season |
| `update-games` | every 5 minutes | Scores for games that have kicked off |
| `bet-reminder` | 18:00 daily, Sep to Feb | Mails players about games they have not bet on |
| `clean-up` | hourly | Expired tokens, sessions and unverified users |

A rejected `Bun.cron` handler reaches `unhandledRejection`, which ends the process, and that process is the web server.
Every job is therefore wrapped in a catch that logs and returns, so a failed ESPN request costs one run rather than the site.
`src/jobs/cron.test.ts` pins that.

Bun computes the next fire only once a handler settles, so a run that overruns its interval delays the next one instead of stacking a second copy on top of it.

Run one by hand without waiting for its schedule, in its own process:

```
sudo -u tippspiel BACKUP_DIR=/var/lib/tippspiel/backup \
  bash -c 'set -a; . /etc/tippspiel/server.env; set +a; cd /srv/tippspiel && bun run src/jobs/cli.ts update-games'
```

Read what they did with `journalctl -u tippspiel-server -f`; each run logs its name and duration.
Check after the first full day that all five have appeared there and that new objects are showing up in the bucket.

## Migrations

`bun run migrate` applies everything in `src/db/migrations` and books it in `kysely_migration`.
`000-legacy-schema` builds the schema TypeORM used to own, and does nothing if that schema is already there, so an existing database and an empty one both end up at the same place.

## Cut over

Replace the `/tippspiel` blocks in the `server` block that serves `nfl-tippspiel.de` with `nginx.conf.example`, then:

```
nginx -t && systemctl reload nginx
```

Cut over between Monday night and Thursday night, so a mistake costs nobody a week of bets.

## Roll back

There is no second application to fall back to any more.
Rolling back means checking out the previous commit and restarting:

```
cd /srv/tippspiel && git checkout <previous> && bun run deploy
systemctl restart tippspiel-server
```

Rehearse this against the live site once, and record here how long it actually took.
A rollback that has never been run is a plan rather than a capability.

| Rehearsed on | Wall-clock time | Notes |
|---|---|---|
| _not yet_ | | |
