export interface Bets {
  [gameId: string]: Bet;
}

export interface Bet {
  bets: Votes;
  selected?: "home" | "away";
  points?: number;
}

export interface ApiBet {
  gameID: string;
  winner?: "home" | "away";
  pointDiff?: number;
}

export interface Votes {
  home: number;
  away: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  color1: string;
  color2: string;
  logo: string;
  wins: number;
  losses: number;
  ties: number;
}

export interface Game {
  id: string;
  date: string;
  status: string;
  homeTeam: { id: string; name: string };
  homeScore: number;
  awayTeam: { id: string; name: string };
  awayScore: number;
}

export interface IWeek {
  id: number;
  seasontype: number;
  label: string;
  teamsOnBye: string[];
  startDate: string;
  endDate: string;
  games: Game[];
}

export interface AllStats {
  [game: string]: IStats;
}

export interface IStats {
  [player: string]: {
    winner: "home" | "away";
    tipp: number;
  };
}

export interface StatProps {
  game: Game;
  home?: Team;
  away?: Team;
  bets: Votes;
  isCompact: boolean;
}

export interface Action {
  type: string;
  payload?: any;
}
