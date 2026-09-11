# Operational scripts

Not part of the build, and not run by CI.
Each one talks to a real database, so read what it prints before letting it write.

## `backfill-team-seasons.ts`

Recovers per-season team state for seasons that finished before `team_season` existed (#40).

```
bun run scripts/backfill-team-seasons.ts 2022 2023 2024          # dry run
bun run scripts/backfill-team-seasons.ts 2022 2023 2024 --write  # apply
```

Needs `DATABASE_URL` and read access to the `nfl-tippspiel` bucket: `R2_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

Until it has run, finished seasons are still scored against whatever the last import wrote, because their seeds are not in the database at all.
`applySeasonSeeds` deliberately falls back to that rather than scoring them zero, so running this is what completes #40 rather than what starts it.

It takes each season's standings as recorded shortly after that season's Super Bowl, which is the last point before the next season's first import moves the seeds again.
Check the printed seeds against the real final standings for at least one season before writing.
