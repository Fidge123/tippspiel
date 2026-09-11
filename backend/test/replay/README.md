# Season replay

Replays a complete, already-played season through the real importer into a real database seeded from an anonymised production snapshot.
It then calls the real HTTP API and snapshots the leaderboard of every league in that season.
Any change to any player's points shows up as a snapshot diff.

```
yarn test:replay       # run it
yarn test:update       # accept the new numbers, deliberately
```

## What it does

```
given   the anonymised 2023 seed loaded into a throwaway Postgres
and     the clock frozen at <as-of>
and     ESPN served from the recorded snapshots as of that moment
when    the importer runs every week of the season
and     GET /leaderboard?league=<id>&season=2023 is called for each league
then    the response matches the committed snapshot
```

Nothing about the application is mocked.
The schema comes from running the migration chain, which is also the only check that it applies cleanly to an empty database.
Only two things are substituted.

- **ESPN.** Global `fetch` is served from the recorded corpus in R2, picking the newest snapshot at or before the as-of date for each `(year, seasontype, week)`.
- **SMTP2GO.** `test/support/mail.ts` replaces `src/email.ts`, so mail can be asserted rather than swallowed.

## Nothing identifiable leaves the publishing machine

The production dump holds real names, email addresses, scrypt hashes and live password-reset and verification tokens.
The replay never reads it.
It reads `replay_seed/2023.gz`, an already anonymised seed, and `seed.ts` still fails the suite if a single user in it is identifiable.
The snapshots key on the pseudonyms.

Publishing that seed is a deliberate step, run by hand with credentials that may read `database_backup/`.

```
yarn replay:publish 2023
```

It loads the backup named by `season.ts` into a throwaway Postgres, runs `test/fixtures/anonymize.sql`, verifies the result, and uploads the anonymised tables as the season's `seedKey`.
Re-run it when the anonymiser or the chosen backup changes.

Keeping the dump out of CI matters because `getObject` caches every download under `backend/test/.corpus-cache`, and the workflow persists that directory in an Actions cache that outlives the run that wrote it.
For the same reason `getObject` refuses to cache anything under `database_backup/`.

## Credentials

Read-only access to the `nfl-tippspiel` bucket, from the environment, using the same three variables the application uses.
The replay reads the ESPN corpus and `replay_seed/`; publishing a seed additionally needs read on `database_backup/` and write on `replay_seed/`.

```
R2_API=https://<account id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

The token CI holds must not reach `database_backup/`, per point 5 of #39.
Downloaded objects are immutable, so they are cached under `backend/test/.corpus-cache` and only the first run pays for the download.

## Database

`@testcontainers/postgresql` by default.
Where Docker is not available, set `TEST_DATABASE_URL` to a Postgres the test may create and drop a database on.

```
TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/postgres yarn test:replay
```

## What the snapshots contain

Per player: the point totals, a per-week subtotal, and the division and Super Bowl picks.
Games are spelled out one by one only for the weeks listed in `detailWeeks`.
The 2023 regular weeks are structurally alike, so week 1 stands in for all of them.
A scoring change in any other week still fails the test and still names the week; only its per-game breakdown is left out.

## Seasons

`season.ts` is a parameter, not a constant, so adding a season means adding an entry there.
It also documents which as-of dates 2023 can and cannot support.
