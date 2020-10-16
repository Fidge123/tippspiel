import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import "./Matchup.css";
import { useTipps } from "./reducers/tipps.reducer";
import Scores from "./Scores";
import Stats from "./Stats";
import { Team, Game, APITipp } from "./types";

function MatchUp({ game }: Props) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [tipp, setTipp] = useTipps(game.id, handleTipp);
  const [timeoutID, setTimeoutID] = useState<any>();
  const [busy, setBusy] = useState(false);
  const [isCompact, setIsCompact] = useState(window.innerWidth < 900);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth < 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleTipp(payload: APITipp) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    setBusy(true);
    setTimeoutID(
      setTimeout(async () => {
        if (payload.pointDiff && payload.winner) {
          await fetch(`${BASE_URL}tipp`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${await getAccessTokenSilently({
                scope: "write:tipp",
              })}`,
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
    const v = { ...tipp.votes };
    if (tipp.selected && tipp.selected !== homeAway) {
      v[tipp.selected] -= 1;
    }
    if (tipp.selected !== homeAway) {
      v[homeAway] += 1;
    }
    setTipp({ ...tipp, votes: v, selected: homeAway });
  }

  return (
    <div className="game">
      <button
        className="away"
        disabled={new Date(game.date) < new Date() || !isAuthenticated}
        style={styleByTeam(game.away, tipp.selected === "away")}
        onClick={() => select("away")}
      >
        {game.away.logo && (
          <img src={game.away.logo} className="logo" alt="logo home team"></img>
        )}
        <span className={tipp.selected === "away" ? "selected" : ""}>
          {isCompact ? game.away.shortName : game.away.name}
        </span>
      </button>
      <Scores game={game} selected={tipp.selected}></Scores>
      <button
        className="home"
        disabled={new Date(game.date) < new Date() || !isAuthenticated}
        style={styleByTeam(game.home, tipp.selected === "home")}
        onClick={() => select("home")}
      >
        {game.home.logo && (
          <img src={game.home.logo} className="logo" alt="logo home team"></img>
        )}
        <span className={tipp.selected === "home" ? "selected" : ""}>
          {isCompact ? game.home.shortName : game.home.name}
        </span>
      </button>
      <input
        className="input"
        style={{ color: busy ? "#d73" : "#000" }}
        type="number"
        disabled={
          !tipp.selected || !isAuthenticated || new Date(game.date) < new Date()
        }
        value={tipp.points}
        onChange={(ev) =>
          setTipp({
            ...tipp,
            points: parseInt(ev.target.value, 10) || 0,
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
        <Stats game={game} votes={tipp.votes} isCompact={isCompact}></Stats>
      )}
    </div>
  );
}

function styleByTeam(team: Team, selected: boolean) {
  return {
    border: `2px solid #${selected ? team.color2 : team.color || "000000"}${
      selected ? "ff" : "55"
    }`,
    backgroundColor: selected ? `#${team.color}aa` : "#fff",
    boxShadow: "none",
  };
}

interface Props {
  game: Game;
}

export default MatchUp;
