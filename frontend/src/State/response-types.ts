import {
  Team as T,
  Bet as B,
  AllStats as C,
  IStats as A,
  IWeek,
} from "../Schedule/types";

export type Week = IWeek;
export type Stat = A;
export type Stats = C;
export type Bet = B;
export type Team = T;

export interface League {
  id: string;
  name: string;
  season: number;
  members: { id: string; name: string }[];
  admins: { id: string; name: string }[];
}

export interface Division {
  name: string;
  teams: T[];
}

export interface DivisionBet {
  name: string;
  teams: (T | null)[];
}

export interface Doubler {
  game: string;
  week: string;
}

export interface UserSettings {
  hidden?: Record<string, boolean>;
  hideByDefault?: boolean;
  sendReminder?: boolean;
  league?: string;
}

export interface DivBet {
  name: string;
  points: number;
  first: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    playoffSeed: number;
  };
  second: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    playoffSeed: number;
  };
  third: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    playoffSeed: number;
  };
  fourth: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    playoffSeed: number;
  };
}

export interface Leaderboard {
  user: {
    id: string;
    name: string;
  };
  points: {
    bets: number;
    divBets: number;
    sbBet: number;
    all: number;
  };
  bets: {
    id: string;
    points: number[];
  }[];
  divBets: DivBet[];
  sbBet: {
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  };
}
