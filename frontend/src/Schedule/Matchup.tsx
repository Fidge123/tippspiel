import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";
import "./Matchup.css";
import { useBets } from "./reducers/bets.reducer";
import Scores from "./Scores";
import Stats from "./Stats";
import { Team, Game, ApiBet } from "./types";

function MatchUp({ game, home, away, doubler, setDoubler }: Props) {
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
    <div className="game">
      <button
        className="away"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(away, bet.selected === "away")}
        onClick={() => select("away")}
      >
        {away?.logo && (
          <img
            src={process.env.REACT_APP_IMG_URL + away.logo}
            className="logo"
            alt="logo away team"
            onError={(event: any) => (event.target.style.display = "none")}
          ></img>
        )}
        <span className={bet.selected === "away" ? "selected" : ""}>
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
      ></Scores>
      <button
        className="home"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(home, bet.selected === "home")}
        onClick={() => select("home")}
      >
        {home?.logo && (
          <img
            src={process.env.REACT_APP_IMG_URL + home.logo}
            className="logo"
            alt="logo home team"
            onError={(event: any) => (event.target.style.display = "none")}
          ></img>
        )}
        <span className={bet.selected === "home" ? "selected" : ""}>
          {innerWidth > 720 && game.homeTeam?.name}
          {innerWidth < 720 && innerWidth > 448 && home?.shortName}
          {innerWidth < 448 && home?.abbreviation}
        </span>
      </button>
      <input
        className="input"
        style={{ color: busy ? "#d73" : "#000" }}
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
        className="panel-indicator"
        onClick={() => setOpen(!open)}
      >
        <div className={open ? "arrow up" : "arrow down"}></div>
      </div>
      {open && (
        <Stats
          game={game}
          home={home}
          away={away}
          bets={bet.bets}
          isCompact={innerWidth < 720}
        ></Stats>
      )}
    </div>
  );
}

function styleByTeam(team: Team | undefined, selected: boolean) {
  return {
    border: `2px solid #${selected ? team?.color2 : team?.color1 || "000000"}${
      selected ? "ff" : "55"
    }`,
    backgroundColor: selected ? `#${team?.color1}aa` : "#fff",
    boxShadow: "none",
  };
}

interface Props {
  game: Game;
  home?: Team;
  away?: Team;
  doubler: boolean;
  setDoubler: Function;
}

export default MatchUp;
