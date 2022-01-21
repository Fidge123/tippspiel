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

export interface Division {
  name: string;
  bets: {
    id: string;
    team: T;
    year: number;
  }[];
  teams: T[];
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
}

export interface Doubler {
  game: string;
  week: string;
}

export interface UserSettings {
  hidden?: Record<string, boolean>;
}
