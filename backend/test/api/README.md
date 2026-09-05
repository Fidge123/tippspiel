# API tests

Boots the real Nest application against a real Postgres and calls it over HTTP.
Requests go through the real guards, pipes and serialisation; only ESPN and Postmark are substituted.

```
yarn test:api
```

## What it covers

The places where the application says no: deadlines, league permissions, validation and auth.
Where a rule is not enforced today, the test is written for the intended behaviour and marked `it.fails`, with the issue that will fix it named in a comment above it.
Fixing the issue turns the test red, which is the reminder to drop the `it.fails`.

## The harness

- **Database.** `@testcontainers/postgresql` by default, one container for the whole run. Where Docker is not available, set `TEST_DATABASE_URL` to a Postgres the tests may create and drop databases on. Every test file gets its own database.
- **Schema.** Created by running the migration chain, never by `synchronize`. `migrations.test.ts` asserts that the chain applies to an empty database.
- **ESPN.** `espn.ts` serves global `fetch` from generated fixtures and throws on any other host, so a test that reaches the network fails instead of flaking.
- **Postmark.** `src/email.ts` records into `sentEmails` when `POSTMARK` is unset, so mail can be asserted rather than swallowed.
- **Time.** Deadlines are exercised by placing kickoffs a second either side of the current time, so no clock is faked.

```
TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/postgres yarn test:api
```

## One application per file

`bootApiApp` imports `app.module.ts`, which reads `DATABASE_URL` once.
Node caches the module for the lifetime of a test file, so every application booted in the same file talks to the database of the first boot.
Boot a second application in a file only against that same database, as `auth.test.ts` does for the throttled routes.
