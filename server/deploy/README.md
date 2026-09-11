# Deploying the Hono server

The server runs as a second service on port 5002, beside the Nest API and the SPA build.
nginx decides which of the two answers a given path, so moving a route across and moving it back are both nginx-only changes.

## URL layout

The server answers under `/tippspiel`, the same prefix the SPA is served from.
That keeps every public URL unchanged as routes move across, which is the point of a strangler migration: `https://nfl-tippspiel.de/tippspiel/impressum` is the same URL before and after.

nginx proxies without rewriting and the app mounts itself at `BASE_PATH`, so links the app generates already carry the prefix.
The alternative, stripping the prefix in nginx, would leave the app generating links it cannot serve.

Two consequences worth knowing before the next steps:

- The session cookie in 2/6 gets `Path=/tippspiel`.
- Two applications cannot both answer one path, so every route moved across needs its own nginx block and leaves the SPA's client-side route for that path unreachable.

## Install

```
useradd --system --home /srv/tippspiel tippspiel
install -d -o tippspiel -g tippspiel /srv/tippspiel
git clone https://github.com/Fidge123/tippspiel /srv/tippspiel
cd /srv/tippspiel/server && bun install --frozen-lockfile
```

`/etc/tippspiel/server.env` should be `0600` and owned by root:

| Variable | What |
|---|---|
| `DATABASE_URL` | The same database the Nest app uses |
| `COOKIE_SECRET` | Signs the session cookie. Rotating it logs everyone out |
| `REFRESH_SECRET` | **Must be byte-identical to the Nest app's**, or the SPA bridge breaks |
| `EMAIL` | Where the admin alerts go |
| `SMTP2GO_API_KEY` | Unset means no mail is sent at all |

`REFRESH_SECRET` is the one that matters for the migration window.
The Hono app signs the legacy `refreshToken` cookie with it so `refresh.strategy.ts` in the Nest app accepts the token and the SPA keeps working unchanged.

```
cp deploy/tippspiel-server.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now tippspiel-server
```

`ExecStartPre` runs the migrations and regenerates the stylesheet on every start, so a failed migration is a failed start rather than a half-running server, and the only generated file is never stale or committed.
The application itself runs from the `.ts` and `.tsx` sources, with no build step.

## Migration ordering

Two runners touch this database during the window, and they book their work in different tables: TypeORM in `migrations`, Kysely in `kysely_migration`.
They cannot fight over the same rows.

They are not independent, though.
`session` references `user(id)`, which TypeORM owns until 6/6, so `bun run migrate` against a database without the Nest schema fails rather than creating a dangling table.
Deploy the Nest app first on a fresh environment.

Confirm it survives a reboot rather than assuming it: `systemctl reboot`, then `curl -sf localhost:5002/tippspiel/health`.

## Cut over

Append the blocks from `nginx.conf.example` to the `server` block that serves `nfl-tippspiel.de`, then:

```
nginx -t && systemctl reload nginx
```

Cut over between Monday night and Thursday night, so a mistake costs nobody a week of bets.

## Roll back

Delete the blocks that were appended and reload nginx.
The SPA's own client-side route for the path takes over again immediately; nothing else has to be touched and the Hono service can keep running.

```
nginx -t && systemctl reload nginx
```

Rehearse this against the live site once, and record here how long it actually took.
A rollback that has never been run is a plan rather than a capability.

| Rehearsed on | Wall-clock time | Notes |
|---|---|---|
| _not yet_ | | |
