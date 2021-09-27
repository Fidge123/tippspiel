import "./Scores.css";
import { Game } from "./types";

function Scores({ game, selected, doubler, setDoubler }: Props) {
  const inProgress = [
    "STATUS_IN_PROGRESS",
    "STATUS_HALFTIME",
    "STATUS_END_PERIOD",
  ].includes(game.status);
  const final = game.status === "STATUS_FINAL";
  const homeScore = game.homeScore;
  const awayScore = game.awayScore;
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
            {game.awayScore}
          </span>
        )}
        {inProgress && <i style={{ color: "#696969" }}>{game.awayScore}</i>}
      </div>
      <div>
        {new Date(game.date) < new Date() ? (
          doubler ? (
            "🌟"
          ) : (
            "@"
          )
        ) : (
          <button className="doubler" onClick={() => setDoubler(game.id)}>
            {doubler ? "🌟" : "@"}
          </button>
        )}
      </div>
      <div>
        {final && (
          <span
            style={{
              fontWeight: homeWon ? 800 : 400,
              color: homeWon && selected === "home" ? "#1b2" : "#212529",
            }}
          >
            {game.homeScore}
          </span>
        )}
        {inProgress && <i style={{ color: "#696969" }}>{game.homeScore}</i>}
      </div>
    </div>
  );
}

interface Props {
  game: Game;
  selected?: "home" | "away";
  doubler: boolean;
  setDoubler: Function;
}

export default Scores;
