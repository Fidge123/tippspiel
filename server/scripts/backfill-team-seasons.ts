import { closeDatabase, db } from '../src/db/kysely';
import { findStat } from '../src/jobs/espn';
import type { Team } from '../src/jobs/espn.types';
import { newestAtOrBefore, snapshotsOf } from '../test/replay/corpus';
import { getJSON, missingCredentials } from '../test/replay/r2';

/**
 * Recovers per-season team state for seasons that finished before team_season
 * existed. The team row only ever held the newest import, so the seeds those
 * seasons were scored against are not in the database at all; they are in the
 * recorded ESPN responses in R2.
 *
 *   bun run scripts/backfill-team-seasons.ts 2022 2023 2024
 *
 * Dry run by default. Pass --write to apply, and read the diff it prints first:
 * this changes historical scores, which is the point and also the risk.
 */

const AS_OF_MONTH_DAY = '-02-20T00:00:00Z';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const years = args.filter((arg) => /^\d{4}$/.test(arg)).map(Number);

  if (!years.length) {
    throw new Error('Name the seasons to backfill, e.g. 2022 2023 2024.');
  }

  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(
      `Reads the recorded seasons out of R2. Missing: ${missing.join(', ')}.`,
    );
  }

  const teams = await snapshotsOf('teams-');

  for (const year of years) {
    // A season's final standings: after the Super Bowl, before the next
    // season's first import moves the seeds again.
    const asOf = new Date(`${year + 1}${AS_OF_MONTH_DAY}`);
    const divisions = [...new Set(teams.map((snapshot) => snapshot.group))];
    let written = 0;

    for (const division of divisions) {
      const { key } = newestAtOrBefore(teams, division, asOf);
      const responses = await getJSON<{ team: Team }[]>(key);

      for (const { team } of responses) {
        const row = {
          teamId: team.uid,
          year,
          logo: team.logos![0].href.split('/').reverse()[0],
          abbreviation: team.abbreviation,
          shortName: team.shortDisplayName,
          name: team.displayName,
          divisionName: division.replace(/^teams-/, ''),
          playoffSeed: findStat(team, 'playoffSeed'),
          wins: findStat(team, 'wins'),
          losses: findStat(team, 'losses'),
          ties: findStat(team, 'ties'),
          pointsFor: findStat(team, 'pointsFor'),
          pointsAgainst: findStat(team, 'pointsAgainst'),
          streak: findStat(team, 'streak'),
          color1: team.color,
          color2: team.alternateColor,
        };

        console.log(
          `${year} ${row.abbreviation.padEnd(4)} seed ${String(row.playoffSeed).padStart(2)} ${row.wins}-${row.losses}-${row.ties}  (${division})`,
        );

        if (write) {
          const { teamId, year: season, ...state } = row;
          await db()
            .insertInto('team_season')
            .values(row)
            .onConflict((c) => c.columns(['teamId', 'year']).doUpdateSet(state))
            .execute();
          written += 1;
        }
      }
    }

    console.log(
      write
        ? `${year}: wrote ${written} rows.`
        : `${year}: dry run, nothing written. Pass --write to apply.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
