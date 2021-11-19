import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";
import { useBets } from "./reducers/bets.reducer";
import Scores from "./Scores";
import Stats from "./Stats";
import { Team, Game, ApiBet } from "./types";

function MatchUp({ game, home, away, doubler, setDoubler, hidden }: Props) {
  const [token] = useToken();

  const [bet, setBet] = useBets(game.id, handleTipp);
  const [timeoutID, setTimeoutID] = useState<any>();
  const [busy, setBusy] = useState(false);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setInnerWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleTipp(payload: ApiBet) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    setBusy(true);
    setTimeoutID(
      setTimeout(async () => {
        if (payload.pointDiff && payload.winner) {
          await fetch(`${BASE_URL}bet`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          setBusy(false);
        }
      }, 1500)
    );
  }

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
      <Scores
        game={game}
        selected={bet.selected}
        doubler={doubler}
        setDoubler={setDoubler}
        hidden={hidden}
      ></Scores>
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
        className={`h-10 w-11 ml-1 p-px text-center border bg-gray-300 disabled:bg-gray-600 border-gray-700 rounded disabled:text-gray-100 ${
          busy ? "text-yellow-600" : "text-black"
        }`}
        type="number"
        disabled={!bet.selected || new Date(game.date) < new Date()}
        value={bet.points ?? ""}
        onChange={(ev) =>
          setBet({
            ...bet,
            points: isNaN(parseInt(ev.target.value, 10))
              ? undefined
              : parseInt(ev.target.value, 10),
          })
        }
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
        <Stats
          game={game}
          home={home}
          away={away}
          bets={bet.bets}
          isCompact={innerWidth < 720}
          hidden={hidden}
        ></Stats>
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
