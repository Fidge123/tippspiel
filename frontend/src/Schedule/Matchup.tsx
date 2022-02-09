import { Suspense, useState, lazy } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { gameBetsState, teamState } from "../State/states";
import { Game } from "./types";

const Scores = lazy(() => import("./Scores"));
const Stats = lazy(() => import("./Stats"));
const MatchupInput = lazy(() => import("./MatchupInput"));
const TeamButton = lazy(() => import("./TeamButton"));

function MatchUp({ game, weekId }: Props) {
  const [bet, setBet] = useRecoilState(gameBetsState(game.id));
  const [open, setOpen] = useState(false);

  const home = useRecoilValue(teamState(game.homeTeam?.id));
  const away = useRecoilValue(teamState(game.awayTeam?.id));

  function select(homeAway: "home" | "away") {
    const v = { ...bet.bets };
    if (bet.selected && bet.selected !== homeAway) {
      v[bet.selected] = (v[bet.selected] || 0) - 1;
    }
    if (bet.selected !== homeAway) {
      v[homeAway] = (v[homeAway] || 0) + 1;
    }
    setBet({ ...bet, bets: v, selected: homeAway });
  }

  return (
    <div className="w-23r sm:w-27r md:w-39r flex flex-wrap py-1">
      <TeamButton
        team={away}
        selected={bet.selected === "away"}
        setSelected={() => select("away")}
        disabled={new Date(game.date) < new Date()}
      ></TeamButton>
      <Suspense fallback={<div className="w-16 sm:w-20">...</div>}>
        <Scores game={game} selected={bet.selected} weekId={weekId}></Scores>
      </Suspense>
      <TeamButton
        team={home}
        selected={bet.selected === "home"}
        setSelected={() => select("home")}
        disabled={new Date(game.date) < new Date()}
      ></TeamButton>
      <MatchupInput game={game}></MatchupInput>
      <div
        role="button"
        className="flex justify-end items-center p-1 w-6 h-10"
        onClick={() => setOpen(!open)}
      >
        <div
          className={`inline-block h-2 w-2 p-0.5 border-r-2 border-b-2 border-black dark:border-gray-200 ${
            open
              ? "transform duration-200 -rotate-135"
              : "transform duration-200 rotate-45"
          }`}
        ></div>
      </div>
      {open && (
        <Suspense fallback={<div>Loading...</div>}>
          <Stats
            game={game}
            home={home}
            away={away}
            bets={bet.bets}
            weekId={weekId}
          ></Stats>
        </Suspense>
      )}
    </div>
  );
}

interface Props {
  game: Game;
  weekId: string;
}

export default MatchUp;
