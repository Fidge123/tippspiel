import { Game } from "../Schedule/types";

function Scores({ game, selected, doubler: d }: Props) {
  const homeScore = game.homeScore;
  const awayScore = game.awayScore;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  const [doubler, setDoubler] = d;

  return (
    <div className="w-16 sm:w-20 flex items-center text-gray-700 dark:text-gray-200">
      <span
        className={`sm:w-6 text-center m-auto ${awayWon && "font-extrabold"} ${
          selected === "away" && awayWon && "text-green-500"
        }`}
      >
        {awayScore}
      </span>
      {
        <button onClick={() => setDoubler(doubler === game.id ? "" : game.id)}>
          {doubler === game.id ? "🌟" : "@"}
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
  doubler: [string | undefined, Function];
}

export default Scores;
