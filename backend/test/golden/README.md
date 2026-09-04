# Golden master: replaying a recorded season

One command replays a complete, already-played season through the real
importer, into a real database seeded from a real production backup, then calls
the real HTTP API and snapshots the leaderboard of every league in that season.
Any change to any player's points shows up as a snapshot diff.

```
yarn test              # run it
yarn test:update       # accept the new numbers, deliberately
```

## What it does

```
given   the 2023 backup loaded into a throwaway Postgres and anonymised
and     the clock frozen at <as-of>
and     ESPN served from the recorded snapshots as of that moment
when    the importer runs every week of the season
and     GET /leaderboard?league=<id>&season=2023 is called for each league
then    the response matches the committed snapshot
```

Nothing about the application is mocked. The schema is created by running the
migration chain — which is also the only check that it applies cleanly to an
empty database — and only two things are substituted:

- **ESPN.** Global `fetch` is served from the recorded corpus in R2,
  `test/golden/espn.ts` choosing the newest snapshot at or before the as-of
  date for each `(year, seasontype, week)`.
- **Postmark.** `src/email.ts` already degrades to a stub when `POSTMARK` is
  unset; it now records into `sentEmails` instead of rejecting, so mail can be
  asserted rather than swallowed.

## Nothing sensitive is committed

The production dump holds real names, email addresses, scrypt hashes and live
password-reset and verification tokens. It is **never written to the repository
and never committed**. The test downloads it, loads it into the throwaway
database, and runs `test/fixtures/anonymize.sql` before anything reads a row:
names become `Player n`, emails `player-n@example.invalid`, credentials become
the scrypt hash of one known test password, and `reset` and `verify` are
truncated. `seed.ts` then verifies that the anonymiser actually ran and fails
the suite if a single user is still identifiable.

Everything the test asserts on — bets, doublers, division and Super Bowl picks,
leagues, games, weeks, teams — is left exactly as it is. The snapshots key on
the pseudonyms, so no real name reaches the repository or CI output.

## Credentials

Read-only access to the `nfl-tippspiel` bucket, from the environment, the same
three variables the application uses:

```
R2_API=https://<account id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

The token needs **Object Read** on that one bucket and nothing else. Downloaded
objects are immutable, so they are cached under `backend/test/.corpus-cache`
(git-ignored) and only the first run pays for the download.

## Database

`@testcontainers/postgresql` by default, so the run is identical locally and in
CI with no setup. Where Docker is not available, set `TEST_DATABASE_URL` to a
Postgres the test may create and drop a database on:

```
TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/postgres yarn test
```

## The as-of dates, and the gap in 2023

`recordToFile()` stopped writing 2023 scoreboards after 2023-10-27 and wrote
none again until 2024-03, so the end of the regular season and the playoff
weeks cannot be replayed for 2023 — there is nothing recorded to replay. The
five as-of dates that the corpus does support are listed, with what each pins,
in `season.ts`. 2024 and 2025 have complete coverage and will take all seven
as soon as there is a database backup to pair them with (issue #39: backups
have been failing silently since 2024-03-03).

`season.ts` is a parameter, not a constant — adding a season is adding an entry
there.
