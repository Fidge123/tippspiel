import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Matchup.css";

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

function Stats({ stats, game, votes, isCompact }: StatProps) {
  if (game.status === "STATUS_FINAL" && stats) {
    const homeScore = parseInt(game.home.score, 10);
    const awayScore = parseInt(game.away.score, 10);
    const wonBy = Math.abs(homeScore - awayScore);
    const homeWon = homeScore > awayScore;
    const awayWon = awayScore > homeScore;
    const awayVotes = Object.entries(stats)
      .filter(([key, value]) => value.winner === "away")
      .sort(
        ([ak, av], [bk, bv]) =>
          Math.abs(av.tipp - wonBy) - Math.abs(bv.tipp - wonBy)
      );
    const homeVotes = Object.entries(stats)
      .filter(([key, value]) => value.winner === "home")
      .sort(
        ([ak, av], [bk, bv]) =>
          Math.abs(av.tipp - wonBy) - Math.abs(bv.tipp - wonBy)
      );

    return (
      <div className="stats">
        <div className="away">
          {awayVotes.map(([key, value], i) => (
            <div key={i} className="stat-row">
              <span>{key}</span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.tipp}
              </span>
              {awayWon && (
                <span>
                  {isCompact ? "D" : "Distanz: "}
                  {Math.abs(value.tipp - wonBy)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="scores">
          {awayWon && "< "}
          {wonBy}
          {homeWon && " >"}
        </div>
        <div className="home">
          {homeVotes.map(([key, value], i) => (
            <div key={i} className="stat-row">
              <span>{key}</span>
              <span>
                {isCompact ? "T" : "Tipp: "}
                {value.tipp}
              </span>
              {homeWon && (
                <span>
                  {isCompact ? "D" : "Distanz: "}
                  {Math.abs(value.tipp - wonBy)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="stats">
      <div className="away">
        {votes.away} {votes.away === 1 ? "Stimme" : "Stimmen"}
      </div>
      <div className="scores"></div>
      <div className="home">
        {votes.home} {votes.home === 1 ? "Stimme" : "Stimmen"}
      </div>
    </div>
  );
}

function Scores({
  game,
  selected,
}: {
  game: Game;
  selected?: "home" | "away";
}) {
  const final = game.status === "STATUS_FINAL";
  const homeScore = parseInt(game.home.score, 10);
  const awayScore = parseInt(game.away.score, 10);
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  return (
    <div className="scores">
      <div>
        {final && (
          <span
            style={{
              fontWeight: awayWon ? 800 : 400,
              color: awayWon && selected === "away" ? "#1b2" : "#212529",
            }}
          >
            {game.away.score}
          </span>
        )}
      </div>
      <div>
        <span className="at">@</span>
      </div>
      <div>
        {final && (
          <span
            style={{
              fontWeight: homeWon ? 800 : 400,
              color: homeWon && selected === "home" ? "#1b2" : "#212529",
            }}
          >
            {game.home.score}
          </span>
        )}
      </div>
    </div>
  );
}

function styleByTeam(team: Team, selected: boolean) {
  return {
    border: `2px solid #${team.color2}${selected ? "ff" : "55"}`,
    backgroundColor: `#${team.color}${selected ? "99" : "11"}`,
    color: selected ? "#222" : "#888",
    fontWeight: 600,
    boxShadow: "none",
  };
}

interface IStats {
  [player: string]: {
    winner: "home" | "away";
    tipp: number;
  };
}

interface StatProps {
  game: Game;
  stats: IStats;
  votes: Votes;
  isCompact: boolean;
}

interface Props {
  game: Game;
  stats: IStats;
  tipp?: Tipp;
  handleTipp: (payload: string) => void;
}

interface Tipp {
  votes: Votes;
  selected?: "home" | "away";
  points?: number;
}

interface Votes {
  home: number;
  away: number;
}

interface Team {
  name: string;
  shortName: string;
  color: string;
  color2: string;
  score: string;
}

interface Game {
  id: string;
  date: string;
  status: string;
  home: Team;
  away: Team;
}

export default MatchUp;
