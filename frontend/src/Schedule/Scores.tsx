import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { doublerState, gameState, hiddenState } from "../State/states";
import { Game } from "./types";

function Scores({ game, selected, weekId }: Props) {
  const [doubler, setDoubler] = useRecoilState(doublerState(weekId));
  const doublerGame = useRecoilValue(gameState([weekId, doubler]));
  const resetDoubler = useResetRecoilState(doublerState(weekId));
  const hidden = useRecoilValue(hiddenState(weekId));

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
    return <div className="flex items-center w-16 sm:w-20">CANCELED</div>;
  }

  return (
    <div className="flex items-center w-16 text-gray-700 sm:w-20 dark:text-gray-200">
      <span
        className={`sm:w-6 text-center m-auto ${awayWon && "font-extrabold"} ${
          final && selected === "away" && awayWon && "text-green-500"
        } ${inProgress && "italic"}`}
      >
        {!hidden && (inProgress || final) ? game.awayScore : ""}
      </span>
      {new Date(game.date) < new Date() ||
      (doublerGame && new Date(doublerGame.date) < new Date()) ? (
        doubler === game.id ? (
          "🌟"
        ) : (
          "@"
        )
      ) : (
        <button
          onClick={() =>
            doubler === game.id ? resetDoubler() : setDoubler(game.id)
          }
        >
          {doubler === game.id ? "🌟" : "@"}
        </button>
      )}
      <span
        className={`sm:w-6 text-center m-auto ${homeWon && "font-extrabold"} ${
          final && selected === "home" && homeWon && "text-green-500"
        } ${inProgress && "italic"}`}
      >
        {!hidden && (inProgress || final) ? game.homeScore : ""}
      </span>
    </div>
  );
}

interface Props {
  game: Game;
  selected?: "home" | "away";
  weekId: string;
}

export default Scores;
