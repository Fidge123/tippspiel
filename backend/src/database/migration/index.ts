import { StartSeason20221662130125888 } from './1662130125888-StartSeason2022';
import { Leagues1662130125999 } from './1662130125999-Leagues';
import { DivisionBet1662283771287 } from './1662283771287-DivisionBet';
import { WeekInteger1662402825392 } from './1662402825392-WeekInteger';
import { WeekId1662404323063 } from './1662404323063-WeekId';
import { Indices1673624598450 } from './1673624598450-Indices';
import { Indices21673625077228 } from './1673625077228-Indices2';

/**
 * Listed rather than globbed. The glob this replaced was `migration/*.ts`,
 * which matches nothing in `dist/`, so `migrationsRun` silently did nothing in
 * production: running the built app against an empty database created the
 * `migrations` table and no application tables at all.
 */
export const migrations = [
  StartSeason20221662130125888,
  Leagues1662130125999,
  DivisionBet1662283771287,
  WeekInteger1662402825392,
  WeekId1662404323063,
  Indices1673624598450,
  Indices21673625077228,
];
