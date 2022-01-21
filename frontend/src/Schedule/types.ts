export interface Bets {
  [gameId: string]: Bet;
}

export interface Bet {
  id: string;
  bets: Votes;
  selected?: "home" | "away";
  points?: number;
}

export interface ApiBet {
  gameId: string;
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
  homeTeam?: { id: string; name: string };
  homeScore: number;
  awayTeam?: { id: string; name: string };
  awayScore: number;
}

export interface IWeek {
  seasontype: number;
  week: number;
  year: number;
  label: string;
  teamsOnBye?: { id: string; name: string; shortName: string }[];
  start: string;
  end: string;
  games?: Game[];
}

export interface AllStats {
  [game: string]: IStats[];
}

export interface IStats {
  name: string;
  winner: "home" | "away";
  doubler: boolean;
  bet: number;
  points: number;
}

export interface StatProps {
  game: Game;
  home?: Team;
  away?: Team;
  bets: Votes;
  hidden: boolean;
  isCompact: boolean;
}

export interface Action {
  type: string;
  payload?: any;
}
