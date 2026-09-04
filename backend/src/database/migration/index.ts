import { StartSeason20221662130125888 } from './1662130125888-StartSeason2022';
import { Leagues1662130125999 } from './1662130125999-Leagues';
import { DivisionBet1662283771287 } from './1662283771287-DivisionBet';
import { WeekInteger1662402825392 } from './1662402825392-WeekInteger';
import { WeekId1662404323063 } from './1662404323063-WeekId';
import { Indices1673624598450 } from './1673624598450-Indices';
import { Indices21673625077228 } from './1673625077228-Indices2';

// Listed rather than globbed: dist/ holds no .ts files, so a glob silently matches none.
export const migrations = [
  StartSeason20221662130125888,
  Leagues1662130125999,
  DivisionBet1662283771287,
  WeekInteger1662402825392,
  WeekId1662404323063,
  Indices1673624598450,
  Indices21673625077228,
];
