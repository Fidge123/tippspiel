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
install -d -o tippspiel -g tippspiel /srv/tippspiel /srv/tippspiel/backup
git clone https://github.com/Fidge123/tippspiel /srv/tippspiel
cd /srv/tippspiel/server && bun install --frozen-lockfile
```

`/etc/tippspiel/server.env` should be `0600` and owned by root:

| Variable | What |
|---|---|
| `DATABASE_URL` | The application database |
| `COOKIE_SECRET` | Signs the session cookie. Rotating it logs everyone out |
| `EMAIL` | Where the admin alerts go |
| `SMTP2GO_API_KEY` | Unset means no mail is sent at all |
| `SEASON` | The season the jobs import and remind for. Defaults to 2026 |
| `R2_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Where the imports record their ESPN responses |

The R2 credentials are not optional in practice.
Every ESPN response an import reads is written to that bucket, and the recorded corpus is what the golden master in `test/replay` replays.
Without them the recordings land in `/srv/tippspiel/backup` instead and the corpus stops growing.

```
cp deploy/tippspiel-server.service deploy/tippspiel-job@.service deploy/*.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now tippspiel-server
systemctl enable --now tippspiel-import-master-data.timer tippspiel-import-schedule.timer \
  tippspiel-update-games.timer tippspiel-bet-reminder.timer tippspiel-clean-up.timer
```

`ExecStartPre` runs the migrations and regenerates the stylesheet on every start, so a failed migration is a failed start rather than a half-running server, and the only generated file is never stale or committed.
The application itself runs from the `.ts` and `.tsx` sources, with no build step.

Confirm it survives a reboot rather than assuming it: `systemctl reboot`, then `curl -sf localhost:5002/tippspiel/health`.

## Scheduled jobs

Nest ran these in the web process, so a restart could drop one mid-flight and a crash in one took the site down with it.
They are systemd timers now, one `tippspiel-job@<name>.service` instance each.

| Timer | Runs | What it does |
|---|---|---|
| `tippspiel-import-master-data` | 07:03 daily, Aug to Feb | Teams, divisions and standings |
| `tippspiel-import-schedule` | 07:48 daily, Aug to Feb | Every week of the season |
| `tippspiel-update-games` | every 5 minutes | Scores for games that have kicked off |
| `tippspiel-bet-reminder` | 18:00 daily, Sep to Feb | Mails players about games they have not bet on |
| `tippspiel-clean-up` | hourly | Expired tokens, sessions and unverified users |

Run one by hand with `systemctl start tippspiel-job@update-games`, and read its output with `journalctl -u 'tippspiel-job@update-games'`.

Check after the first full day that all five have run and that new objects are appearing in the bucket:

```
systemctl list-timers 'tippspiel-*'
```

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
cd /srv/tippspiel && git checkout <previous> && cd server && bun install --frozen-lockfile
systemctl restart tippspiel-server
```

Rehearse this against the live site once, and record here how long it actually took.
A rollback that has never been run is a plan rather than a capability.

| Rehearsed on | Wall-clock time | Notes |
|---|---|---|
| _not yet_ | | |
