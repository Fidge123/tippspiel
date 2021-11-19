import { Game } from "./types";

function Scores({ game, selected, doubler, setDoubler, hidden }: Props) {
  const inProgress = [
    "STATUS_IN_PROGRESS",
    "STATUS_HALFTIME",
    "STATUS_END_PERIOD",
  ].includes(game.status);
  const final = !hidden && game.status === "STATUS_FINAL";
  const homeScore = game.homeScore;
  const awayScore = game.awayScore;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  if (game.status === "STATUS_CANCELED") {
    return <div className="flex w-16 items-center mx-1">CANCELED</div>;
  }

  return (
    <div className="flex w-16 sm:w-20 items-center mx-1">
      <div className="flex flex-1 justify-center">
        {final && (
          <span
            className={`m-auto ${awayWon ? "font-extrabold" : "font-normal"} ${
              selected === "away" && awayWon
                ? "text-green-500"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {game.awayScore}
          </span>
        )}
        {inProgress && (
          <i className={"text-gray-700 dark:text-gray-200"}>{game.awayScore}</i>
        )}
      </div>
      <div className="flex flex-1 justify-center text-gray-700 dark:text-gray-200">
        {new Date(game.date) < new Date() ? (
          doubler ? (
            "🌟"
          ) : (
            "@"
          )
        ) : (
          <button onClick={() => setDoubler(game.id)}>
            {doubler ? "🌟" : "@"}
          </button>
        )}
      </div>
      <div className="flex flex-1 justify-center">
        {final && (
          <span
            className={`m-auto ${homeWon ? "font-extrabold" : "font-normal"} ${
              selected === "home" && homeWon
                ? "text-green-500"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {game.homeScore}
          </span>
        )}
        {inProgress && (
          <i className={"text-gray-700 dark:text-gray-200"}>{game.homeScore}</i>
        )}
      </div>
    </div>
  );
}

interface Props {
  game: Game;
  selected?: "home" | "away";
  doubler: boolean;
  hidden: boolean;
  setDoubler: Function;
}

export default Scores;
