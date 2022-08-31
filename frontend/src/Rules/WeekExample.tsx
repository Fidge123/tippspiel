import { useState } from "react";
import { Game } from "../Schedule/types";
import MatchUp from "./MatchupExample";

function WeekExample() {
  const doubler = useState<string>();
  const games: Game[] = [
    createGame(1, 24, 12),
    createGame(3, 7, 7),
    createGame(5, 44, 45),
  ];
  return (
    <>
      {games.map((game) => (
        <MatchUp key={game.id} game={game} doubler={doubler}></MatchUp>
      ))}
    </>
  );
}

function createGame(index: number, score1: number, score2: number): Game {
  return {
    id: index.toString(),
    date: "",
    homeTeam: {
      id: (index + 1).toString(),
      name: "",
    },
    awayTeam: {
      id: (index + 2).toString(),
      name: "",
    },
    homeScore: score1,
    awayScore: score2,
    status: "STATUS_FINAL",
  };
}

export default WeekExample;
