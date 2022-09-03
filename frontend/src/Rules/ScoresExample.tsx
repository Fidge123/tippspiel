import { Game } from "../Schedule/types";

function Scores({ game, selected, doubler, setDoubler }: Props) {
  const homeScore = game.homeScore;
  const awayScore = game.awayScore;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  return (
    <div className="flex items-center w-16 text-gray-700 sm:w-20 dark:text-gray-200">
      <span
        className={`sm:w-6 text-center m-auto ${awayWon && "font-extrabold"} ${
          selected === "away" && awayWon && "text-green-500"
        }`}
      >
        {awayScore}
      </span>
      {
        <button onClick={() => setDoubler(doubler ? "" : game.id)}>
          {doubler ? "🌟" : "@"}
        </button>
      }
      <span
        className={`sm:w-6 text-center m-auto ${homeWon && "font-extrabold"} ${
          selected === "home" && homeWon && "text-green-500"
        }`}
      >
        {homeScore}
      </span>
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
