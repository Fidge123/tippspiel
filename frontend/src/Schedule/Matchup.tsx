import { Suspense, useEffect, useState, lazy } from "react";
import { useRecoilState } from "recoil";

import { gameBetsState } from "../State/states";
import { Team, Game } from "./types";

const Scores = lazy(() => import("./Scores"));
const Stats = lazy(() => import("./Stats"));

function MatchUp({ game, home, away, doubler, setDoubler, hidden }: Props) {
  const [bet, setBet] = useRecoilState(gameBetsState(game.id));
  const [points, setPoints] = useState(bet.points);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setInnerWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => setPoints(bet.points), [bet]);

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
      <button
        className="team"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(away, bet.selected === "away")}
        onClick={() => select("away")}
      >
        {away?.logo && (
          <img
            src={process.env.REACT_APP_IMG_URL + away.logo}
            className="h-6 w-6 float-left"
            alt="logo away team"
            onError={(event: any) => (event.target.style.display = "none")}
          ></img>
        )}
        <span
          className={
            bet.selected === "away" ? "font-semibold text-gray-50" : ""
          }
        >
          {innerWidth > 720 && game.awayTeam?.name}
          {innerWidth < 720 && innerWidth > 448 && away?.shortName}
          {innerWidth < 448 && away?.abbreviation}
        </span>
      </button>
      <Suspense fallback={<div className="w-16 sm:w-20">...</div>}>
        <Scores
          game={game}
          selected={bet.selected}
          doubler={doubler}
          setDoubler={setDoubler}
          hidden={hidden}
        ></Scores>
      </Suspense>
      <button
        className="team"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(home, bet.selected === "home")}
        onClick={() => select("home")}
      >
        {home?.logo && (
          <img
            src={process.env.REACT_APP_IMG_URL + home.logo}
            className="h-6 w-6 float-left"
            alt="logo home team"
            onError={(event: any) => (event.target.style.display = "none")}
          ></img>
        )}
        <span
          className={
            bet.selected === "home" ? "font-semibold text-gray-50" : ""
          }
        >
          {innerWidth > 720 && game.homeTeam?.name}
          {innerWidth < 720 && innerWidth > 448 && home?.shortName}
          {innerWidth < 448 && home?.abbreviation}
        </span>
      </button>
      <input
        className={`h-10 w-11 ml-1 p-px text-center border dark:bg-gray-300 dark:disabled:bg-gray-600 border-gray-700 rounded dark:disabled:text-gray-100 ${
          points !== bet.points ? "text-yellow-600" : "text-black"
        }`}
        type="number"
        disabled={!bet.selected || new Date(game.date) < new Date()}
        value={points ?? ""}
        onChange={(ev) => {
          const points = isNaN(parseInt(ev.target.value, 10))
            ? undefined
            : parseInt(ev.target.value, 10);
          setPoints(points);

          if (timeoutID) {
            clearTimeout(timeoutID);
          }
          setTimeoutID(
            setTimeout(() => {
              if (bet.points !== points) {
                setBet({ ...bet, points });
              }
            }, 1500)
          );
        }}
        onBlur={() => setBet({ ...bet, points })}
      ></input>
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
            isCompact={innerWidth < 720}
            hidden={hidden}
          ></Stats>
        </Suspense>
      )}
    </div>
  );
}

function styleByTeam(team: Team | undefined, selected: boolean) {
  return selected
    ? {
        borderColor: `#${team?.color2}ff`,
        backgroundColor: `#${team?.color1}aa`,
      }
    : {
        borderColor: `#${team?.color1 || "000000"}ff`,
      };
}

interface Props {
  game: Game;
  home?: Team;
  away?: Team;
  doubler: boolean;
  setDoubler: Function;
  hidden: boolean;
}

export default MatchUp;
