import React from "react";
import "./Scores.css";
import { Game } from "./types";

function Scores({ game, selected }: Props) {
  const final = game.status === "STATUS_FINAL";
  const homeScore = parseInt(game.home.score, 10);
  const awayScore = parseInt(game.away.score, 10);
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  if (game.status === "STATUS_CANCELED") {
    return <div className="scores">CANCELED</div>;
  }

  return (
    <div className="scores">
      <div>
        {final && (
          <span
            style={{
              fontWeight: awayWon ? 800 : 400,
              color: awayWon && selected === "away" ? "#1b2" : "#212529",
            }}
          >
            {game.away.score}
          </span>
        )}
      </div>
      <div>
        <span>@</span>
      </div>
      <div>
        {final && (
          <span
            style={{
              fontWeight: homeWon ? 800 : 400,
              color: homeWon && selected === "home" ? "#1b2" : "#212529",
            }}
          >
            {game.home.score}
          </span>
        )}
      </div>
    </div>
  );
}

interface Props {
  game: Game;
  selected?: "home" | "away";
}

export default Scores;
