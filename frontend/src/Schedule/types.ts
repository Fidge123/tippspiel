export interface Tipps {
  [gameId: string]: Tipp;
}

export interface Tipp {
  votes: Votes;
  selected?: "home" | "away";
  points?: number;
}

export interface Votes {
  home: number;
  away: number;
}

export interface Team {
  name: string;
  shortName: string;
  color: string;
  color2: string;
  logo: string;
  score: string;
}

export interface Game {
  id: string;
  date: string;
  status: string;
  home: Team;
  away: Team;
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
  stats: IStats;
  votes: Votes;
  isCompact: boolean;
}
