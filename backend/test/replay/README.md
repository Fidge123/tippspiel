# Season replay

Replays a complete, already-played season through the real importer, into a
real database seeded from a real production backup, then calls the real HTTP
API and snapshots the leaderboard of every league in that season. Any change to
any player's points shows up as a snapshot diff.

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

Nothing about the application is mocked. The schema comes from running the
migration chain, which is also the only check that it applies cleanly to an
empty database. Only two things are substituted:

- **ESPN.** Global `fetch` is served from the recorded corpus in R2, picking
  the newest snapshot at or before the as-of date for each
  `(year, seasontype, week)`.
- **Postmark.** `src/email.ts` records into `sentEmails` when `POSTMARK` is
  unset, so mail can be asserted rather than swallowed.

## Nothing sensitive is committed

The production dump holds real names, email addresses, scrypt hashes and live
password-reset and verification tokens. It is **never written to the repository
and never committed**. The test downloads it, loads it into the throwaway
database, and runs `test/fixtures/anonymize.sql` before anything reads a row.
`seed.ts` then verifies the anonymiser ran and fails the suite if a single user
is still identifiable. The snapshots key on the pseudonyms.

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

`@testcontainers/postgresql` by default. Where Docker is not available, set
`TEST_DATABASE_URL` to a Postgres the test may create and drop a database on:

```
TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/postgres yarn test
```

## What the snapshots contain

Per player: the point totals, a per-week subtotal, and the division and Super
Bowl picks. Games are only spelled out one by one for the weeks listed in
`detailWeeks` — the 2023 regular weeks are structurally identical to one
another, so week 1 stands in for all of them. A scoring change in any other
week still fails the test and still names the week; only its per-game
breakdown is left out.

## Seasons

`season.ts` is a parameter, not a constant — adding a season is adding an entry
there. It also documents which as-of dates 2023 can and cannot support.
