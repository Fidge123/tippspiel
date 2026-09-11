import type { Generated } from 'kysely';

// Only the tables the Hono app reads. TypeORM still owns their definitions
// until 6/6, so these types describe the live schema rather than declare it.
export interface UserTable {
  id: Generated<string>;
  email: string;
  password: string;
  salt: string;
  name: string;
  settings: unknown;
  verified: Generated<boolean>;
  consentedAt: Date;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface VerifyTable {
  id: Generated<string>;
  userId: string | null;
  token: string;
  createdAt: Generated<Date>;
}

export interface ResetTable {
  id: Generated<string>;
  userId: string | null;
  token: string;
  createdAt: Generated<Date>;
}

export interface SessionTable {
  id: string;
  userId: string;
  createdAt: Generated<Date>;
  expiresAt: Date;
  lastSeenAt: Generated<Date>;
  userAgent: string | null;
}

export interface TeamTable {
  id: string;
  logo: string;
  abbreviation: string;
  shortName: string;
  name: string;
  divisionName: string | null;
  playoffSeed: number | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  streak: number | null;
  color1: string | null;
  color2: string | null;
}

export interface TeamSeasonTable {
  teamId: string;
  year: number;
  logo: string;
  abbreviation: string;
  shortName: string;
  name: string;
  divisionName: string | null;
  playoffSeed: number | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  streak: number | null;
  color1: string | null;
  color2: string | null;
}

export interface WeekTable {
  id: string;
  year: number;
  seasontype: number;
  week: number;
  start: Date;
  end: Date;
  label: string;
}

export interface GameTable {
  id: string;
  date: Date;
  awayScore: number;
  homeScore: number;
  winner: string;
  status: string;
  weekId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
}

export interface BetTable {
  id: Generated<string>;
  winner: string;
  pointDiff: number;
  gameId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export interface BetDoublerTable {
  id: Generated<string>;
  gameId: string | null;
  userId: string | null;
  leagueId: string | null;
  weekId: string | null;
}

export interface DivisionBetTable {
  id: Generated<string>;
  year: number;
  divisionName: string | null;
  firstId: string | null;
  secondId: string | null;
  thirdId: string | null;
  fourthId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export interface SuperbowlBetTable {
  id: Generated<string>;
  year: number;
  teamId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export interface LeagueTable {
  id: Generated<string>;
  name: string;
  season: number;
}

export interface MemberTable {
  leagueId: string;
  userId: string;
}

export interface DivisionTable {
  name: string;
}

export interface ByeTable {
  id: Generated<string>;
  teamId: string | null;
  weekId: string | null;
}

export interface Database {
  user: UserTable;
  verify: VerifyTable;
  reset: ResetTable;
  session: SessionTable;
  team: TeamTable;
  team_season: TeamSeasonTable;
  week: WeekTable;
  game: GameTable;
  bet: BetTable;
  betDoubler: BetDoublerTable;
  divisionBet: DivisionBetTable;
  superbowlBet: SuperbowlBetTable;
  league: LeagueTable;
  member: MemberTable;
  division: DivisionTable;
  bye: ByeTable;
}
