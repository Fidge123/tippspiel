import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { gameBetsState } from "../State/states";
import { Game } from "./types";

function MatchupInput({ game }: Props) {
  const [bet, setBet] = useRecoilState(gameBetsState(game.id));
  const [points, setPoints] = useState(bet.points);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  useEffect(() => setPoints(bet.points), [bet]);

  return (
    <input
      className={`h-10 w-11 ml-1 p-px text-center dark:disabled:bg-gray-600 border-gray-700 rounded dark:disabled:text-gray-100 ${
        points !== bet.points ? "text-yellow-600" : "text-black"
      }`}
      type="number"
      disabled={!bet.selected || new Date(game.date) < new Date()}
      value={points ?? ""}
      min={1}
      max={5}
      onChange={(ev) => {
        const points = isNaN(parseInt(ev.target.value, 10))
          ? setPoints(undefined)
          : parseInt(ev.target.value, 10);

        if (points && points <= 5 && points >= 1) {
          setPoints(points);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          setTimeoutId(
            setTimeout(() => {
              if (bet.points !== points) {
                setBet({ ...bet, points });
              }
            }, 1500)
          );
        }
      }}
      onBlur={() => setBet({ ...bet, points })}
    ></input>
  );
}

interface Props {
  game: Game;
}

export default MatchupInput;
