import { Team as T, Bet as B, IStats as A, IWeek } from "../Schedule/types";

export type Week = IWeek;
export type Stat = A;
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
