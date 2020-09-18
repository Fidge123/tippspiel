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
  score: string;
}

export interface Game {
  id: string;
  date: string;
  status: string;
  home: Team;
  away: Team;
}

export interface Week {
  id: number;
  seasontype: number;
  label: string;
  teamsOnBye: string[];
  startDate: string;
  endDate: string;
  games: Game[];
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

export interface Props {
  game: Game;
  stats: IStats;
  tipp?: Tipp;
  handleTipp: (payload: string) => void;
}
