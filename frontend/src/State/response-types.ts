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

export interface Leaderboard {
  name: string;
  points: number;
  correct: number;
  exact: number;
  offThree: number;
  offSix: number;
  doubler: number;
  total: number;
  divBets: {
    logo: string;
    points: number;
  }[];
  sbBet: {
    logo: string;
    points: number;
  };
}

export interface Doubler {
  game: string;
  week: string;
}

export interface UserSettings {
  hidden?: Record<string, boolean>;
  hideByDefault?: boolean;
  league?: string;
}

export interface LBResponse {
  user: string;
  bets: {
    id: string;
    points: number[];
  }[];
  divBets: {
    name: string;
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  }[];
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
