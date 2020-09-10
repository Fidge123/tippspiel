import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";

const BASE_URL = "https://nfl-tippspiel.herokuapp.com/";
// const BASE_URL = "http://localhost:5000/";

function Schedule() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selected, setSelected] = useState<Selected>({});
  const [isCompact, setIsCompact] = useState(window.innerWidth < 900);

  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth < 900);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
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
        const tipps: Tipp[] = await response.json();
        setSelected(
          tipps
            .filter((r) => isAuthenticated && r.user === user?.email)
            .reduce(
              (r, c) => ({
                ...r,
                [c.game]: {
                  homeAway: c.winner,
                  points: c.pointDiff.toString(),
                },
              }),
              {} as Selected
            )
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  async function updateTipp(
    game: string,
    homeAway: "home" | "away",
    points: string
  ) {
    if (isAuthenticated) {
      const payload = {
        game,
        winner: homeAway,
        pointDiff: parseInt(points, 10) || 0,
      };
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
        body: JSON.stringify(payload),
      });

      setSelected({
        ...selected,
        [game]: {
          homeAway,
          points: points,
        },
      });
    }
  }

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

  if (isLoaded) {
    if (error) {
      window.location.reload();
    }
    return (
      <section className="schedule-inner">
        {weeks.map((week) => (
          <article className="week" key={week.label}>
            <div className="label">{week.label}</div>
            {week.teamsOnBye.length > 0 && (
              <div className="bye">Bye: {week.teamsOnBye.join(", ")}</div>
            )}
            {splitByDate(week.games).map((time, idx) => (
              <div key={time[0].date}>
                <div className="time">{formatDate(time[0].date)}</div>
                {time.map((g, idx) => (
                  <div key={idx} className="game">
                    <Button
                      className="away"
                      disabled={new Date(g.date) < new Date()}
                      style={styleByTeam(
                        g.away,
                        selected[g.id]?.homeAway === "away"
                      )}
                      onClick={() =>
                        setSelected({
                          ...selected,
                          [g.id]: { homeAway: "away" },
                        })
                      }
                    >
                      {isCompact ? g.away.shortName : g.away.name}
                      {gameResults(g.status, g.away, g.home)}
                    </Button>
                    <input
                      className="input"
                      type="number"
                      disabled={
                        selected[g.id]?.homeAway !== "away" ||
                        new Date(g.date) < new Date()
                      }
                      value={
                        selected[g.id]?.homeAway === "away"
                          ? selected[g.id]?.points?.toString()
                          : ""
                      }
                      onChange={(ev) =>
                        updateTipp(g.id, "away", ev.target.value)
                      }
                    ></input>
                    <span className="at">@</span>
                    <input
                      className="input"
                      type="number"
                      disabled={
                        selected[g.id]?.homeAway !== "home" ||
                        new Date(g.date) < new Date()
                      }
                      value={
                        selected[g.id]?.homeAway === "home"
                          ? selected[g.id]?.points?.toString()
                          : ""
                      }
                      onChange={(ev) =>
                        updateTipp(g.id, "home", ev.target.value)
                      }
                    ></input>
                    <Button
                      className="home"
                      disabled={new Date(g.date) < new Date()}
                      style={styleByTeam(
                        g.home,
                        selected[g.id]?.homeAway === "home"
                      )}
                      onClick={() =>
                        setSelected({
                          ...selected,
                          [g.id]: { homeAway: "home" },
                        })
                      }
                    >
                      {isCompact ? g.home.shortName : g.home.name}
                      {gameResults(g.status, g.home, g.away)}
                    </Button>
                  </div>
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

type Selected = { [gameId: string]: GameTipp };
type GameTipp = {
  homeAway: "home" | "away";
  points?: string;
};

interface Tipp {
  user: string;
  game: string;
  winner: "home" | "away";
  pointDiff: number;
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
  label: string;
  teamsOnBye: string[];
  startDate: string;
  endDate: string;
  games: Game[];
}

export default Schedule;
