import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";
import { stringify } from "querystring";

const BASE_URL = "https://nfl-tippspiel.herokuapp.com/";
// const BASE_URL = "http://localhost:5000/";

function MatchUp({ game, tipp, handleTipp }: Props) {
  const [selected, setSelected] = useState<"home" | "away" | undefined>();
  const [away, setAway] = useState<string>("");
  const [home, setHome] = useState<string>("");
  const [votes, setVotes] = useState<Votes>({ home: 0, away: 0 });
  const [update, setUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isCompact, setIsCompact] = useState(window.innerWidth < 900);

  useEffect(() => {
    if (tipp) {
      setVotes({ home: tipp.votes.home || 0, away: tipp.votes.away || 0 });
      setSelected(tipp.selected);
      if (tipp.selected === "away") {
        setAway(tipp.points?.toString() || "");
      }
      if (tipp.selected === "home") {
        setHome(tipp.points?.toString() || "");
      }
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
    if (selected === "home") {
      setAway("");
    }
    if (selected === "away") {
      setHome("");
    }
  }, [selected]);

  useEffect(() => {
    setTimeout(() => setUpdate(true), 1500);
  }, [home, away, selected]);

  useEffect(() => {
    const points = {
      home: parseInt(home, 10) || 0,
      away: parseInt(away, 10) || 0,
    };
    const payload = JSON.stringify({
      game: game.id,
      winner: selected,
      pointDiff: selected ? points[selected] : 0,
    });
    if (!update || lastUpdate === payload) {
      return;
    }
    setUpdate(false);
    if (selected === "home") {
      if (tipp?.points?.toString() !== home || tipp?.selected !== selected) {
        setLastUpdate(payload);
        handleTipp(payload);
      }
    }
    if (selected === "away") {
      if (tipp?.points?.toString() !== away || tipp?.selected !== selected) {
        setLastUpdate(payload);
        handleTipp(payload);
      }
    }
  }, [selected, update, handleTipp, home, away, game.id, tipp, lastUpdate]);

  function select(homeAway: "home" | "away") {
    const v = { ...votes };
    if (selected && selected !== homeAway) {
      v[selected] -= 1;
    }
    v[homeAway] += 1;
    setVotes(v);
    setSelected(homeAway);
  }

  return (
    <div className="game">
      <div className="selector">
        <Button
          className="away"
          disabled={new Date(game.date) < new Date()}
          style={styleByTeam(game.away, selected === "away")}
          onClick={() => select("away")}
        >
          {isCompact ? game.away.shortName : game.away.name}
          {gameResults(game.status, game.away, game.home)}
        </Button>
        {votes.away > 0 && <div className="votes">{votes.away}</div>}
      </div>

      <input
        className="input"
        type="number"
        disabled={selected !== "away" || new Date(game.date) < new Date()}
        value={away}
        onChange={(ev) => setAway(ev.target.value)}
      ></input>
      <span className="at">@</span>
      <input
        className="input"
        type="number"
        disabled={selected !== "home" || new Date(game.date) < new Date()}
        value={home}
        onChange={(ev) => setHome(ev.target.value)}
      ></input>
      <div className="selector">
        <Button
          className="home"
          disabled={new Date(game.date) < new Date()}
          style={styleByTeam(game.home, selected === "home")}
          onClick={() => select("home")}
        >
          {isCompact ? game.home.shortName : game.home.name}
          {gameResults(game.status, game.home, game.away)}
        </Button>

        {votes.home > 0 && <div className="votes">{votes.home}</div>}
      </div>
    </div>
  );
}

function Schedule() {
  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [tipps, setTipps] = useState<Tipps>({});
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setAdmin(
        user["https://nfl-tippspiel.herokuapp.com/auth/roles"].includes("Admin")
      );
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetch(BASE_URL + "scoreboard/2020")
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setWeeks(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, []);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        return;
      }

      const token = await getAccessTokenSilently({
        audience: "https://nfl-tippspiel.herokuapp.com/auth",
        scope: "read:tipp",
      });
      const response = await fetch(BASE_URL + "tipp", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTipps(await response.json());
    })();
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  async function postTipp(payload: string) {
    const token = await getAccessTokenSilently({
      audience: "https://nfl-tippspiel.herokuapp.com/auth",
      scope: "write:tipp",
    });

    await fetch(BASE_URL + "tipp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });
  }

  async function reloadWeek(week: number, seasontype: number) {
    let token;
    try {
      token = await getAccessTokenSilently({
        audience: "https://nfl-tippspiel.herokuapp.com/auth",
        scope: "write:schedule",
      });
    } catch (e) {
      token = await getAccessTokenWithPopup({
        audience: "https://nfl-tippspiel.herokuapp.com/auth",
        scope: "write:schedule",
      });
    }

    await fetch(
      `${BASE_URL}scoreboard?${stringify({
        dates: 2020,
        seasontype,
        week,
      })}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    window.location.reload();
  }

  if (isLoaded) {
    if (error) {
      return <span>Error occured... please reload!</span>;
    }
    return (
      <section className="schedule-inner">
        {weeks.map((week) => (
          <article className="week" key={week.label}>
            <div className="weekHeader">
              <span className="label">{week.label}</span>
              {admin && (
                <Button
                  className="reload"
                  size="sm"
                  onClick={() => {
                    reloadWeek(week.id, week.seasontype);
                  }}
                >
                  Reload
                </Button>
              )}
            </div>
            {week.teamsOnBye.length > 0 && (
              <div className="bye">Bye: {week.teamsOnBye.join(", ")}</div>
            )}
            {splitByDate(week.games).map((time, idx) => (
              <div key={time[0].date}>
                <div className="time">{formatDate(time[0].date)}</div>
                {time.map((g, idx) => (
                  <MatchUp
                    key={idx}
                    game={g}
                    tipp={tipps[g.id]}
                    handleTipp={postTipp}
                  ></MatchUp>
                ))}
              </div>
            ))}
          </article>
        ))}
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

function gameResults(status: string, team: Team, oppo: Team) {
  let result = " ";

  if (status === "STATUS_FINAL") {
    result += team.score;

    if (parseInt(team.score) > parseInt(oppo.score)) {
      result += " 👑";
    }
  }
  return result;
}

function styleByTeam(team: Team, selected: boolean) {
  return {
    border: `2px solid #${team.color2}${selected ? "ff" : "55"}`,
    backgroundColor: `#${team.color}${selected ? "99" : "11"}`,
    color: "#333",
    fontWeight: 600,
    boxShadow: "none",
  };
}

function splitByDate(games: Game[]) {
  const result: Game[][] = [];
  return games.reduce((res, game) => {
    const idx = res.findIndex((sub) => sub[0].date === game.date);
    if (idx === -1) {
      res.push([game]);
    } else {
      res[idx].push(game);
    }
    return res;
  }, result);
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleString("de-DE");
}

interface Props {
  game: Game;
  tipp?: Tipp;
  handleTipp: (payload: string) => void;
}

interface Tipps {
  [gameId: string]: Tipp;
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

interface Week {
  id: number;
  seasontype: number;
  label: string;
  teamsOnBye: string[];
  startDate: string;
  endDate: string;
  games: Game[];
}

export default Schedule;
