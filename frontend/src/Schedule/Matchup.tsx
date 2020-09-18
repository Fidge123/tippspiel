import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Matchup.css";
import Scores from "./Scores";
import Stats from "./Stats";
import { Votes, Team, Game, IStats, Tipp } from "./types";

function MatchUp({ game, tipp, handleTipp, stats }: Props) {
  const [selected, setSelected] = useState<"home" | "away" | undefined>();
  const [winBy, setWinBy] = useState<string>("");
  const [votes, setVotes] = useState<Votes>({ home: 0, away: 0 });
  const [update, setUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isCompact, setIsCompact] = useState(window.innerWidth < 900);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tipp) {
      setVotes({ home: tipp.votes.home || 0, away: tipp.votes.away || 0 });
      setSelected(tipp.selected);
      setWinBy(tipp.points?.toString() || "");
    }
  }, [tipp]);

  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth < 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => setUpdate(true), 1500);
  }, [winBy, selected]);

  useEffect(() => {
    const payload = JSON.stringify({
      game: game.id,
      winner: selected,
      pointDiff: parseInt(winBy, 10) || 0,
    });
    if (!update || lastUpdate === payload) {
      return;
    }
    setUpdate(false);
    if (
      selected &&
      winBy &&
      (tipp?.points?.toString() !== winBy || tipp?.selected !== selected)
    ) {
      setLastUpdate(payload);
      handleTipp(payload);
    }
  }, [selected, update, handleTipp, winBy, game.id, tipp, lastUpdate]);

  function select(homeAway: "home" | "away") {
    const v = { ...votes };
    if (selected && selected !== homeAway) {
      v[selected] -= 1;
    }
    if (selected !== homeAway) {
      v[homeAway] += 1;
    }
    setVotes(v);
    setSelected(homeAway);
  }

  return (
    <div className="game">
      <Button
        className="away"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(game.away, selected === "away")}
        onClick={() => select("away")}
      >
        {isCompact ? game.away.shortName : game.away.name}
      </Button>
      <Scores game={game} selected={selected}></Scores>
      <Button
        className="home"
        disabled={new Date(game.date) < new Date()}
        style={styleByTeam(game.home, selected === "home")}
        onClick={() => select("home")}
      >
        {isCompact ? game.home.shortName : game.home.name}
      </Button>
      <input
        className="input"
        type="number"
        disabled={!selected || new Date(game.date) < new Date()}
        value={winBy}
        onChange={(ev) => setWinBy(ev.target.value)}
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
          stats={stats}
          game={game}
          votes={votes}
          isCompact={isCompact}
        ></Stats>
      )}
    </div>
  );
}

function styleByTeam(team: Team, selected: boolean) {
  return {
    border: `2px solid #${team.color2 || "000000"}${selected ? "ff" : "55"}`,
    backgroundColor: `#${team.color || "ffffff"}${selected ? "99" : "11"}`,
    color: selected ? "#222" : "#888",
    fontWeight: 600,
    boxShadow: "none",
  };
}

interface Props {
  game: Game;
  stats: IStats;
  tipp?: Tipp;
  handleTipp: (payload: string) => void;
}

export default MatchUp;