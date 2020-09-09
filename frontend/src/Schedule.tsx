import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Schedule.css";
// import { useAuth0 } from "@auth0/auth0-react";

function Schedule() {
  // const { user, isAuthenticated } = useAuth0();

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
    fetch("https://nfl-tippspiel.herokuapp.com/scoreboard/2020")
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
                        setSelected({
                          ...selected,
                          [g.id]: {
                            homeAway: "away",
                            points: ev.target.value,
                          },
                        })
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
                        setSelected({
                          ...selected,
                          [g.id]: {
                            homeAway: "home",
                            points: ev.target.value,
                          },
                        })
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
