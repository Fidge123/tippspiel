import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Schedule.css";
// import { useAuth0 } from "@auth0/auth0-react";

function Schedule() {
  // const { user, isAuthenticated } = useAuth0();

  // const [error, setError] = useState(null);
  // const [isLoaded, setIsLoaded] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selected, setSelected] = useState<Selected>({});

  // Note: the empty deps array [] means
  // this useEffect will run once
  // similar to componentDidMount()
  useEffect(() => {
    fetch("https://nfl-tippspiel.herokuapp.com/scoreboard/2020")
      .then((res) => res.json())
      .then(
        (result) => {
          // setIsLoaded(true);
          setWeeks(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          // setIsLoaded(true);
          // setError(error);
        }
      );
  }, []);

  return (
    <section className="schedule">
      {weeks.map((week) => (
        <article key={week.label}>
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
                    style={styleByTeam(g.away, selected[g.id] === "away")}
                    onClick={() => setSelected({ ...selected, [g.id]: "away" })}
                  >
                    {g.away.name}
                  </Button>
                  <span className="at">@</span>
                  <Button
                    className="home"
                    style={styleByTeam(g.home, selected[g.id] === "home")}
                    onClick={() => setSelected({ ...selected, [g.id]: "home" })}
                  >
                    {g.home.name}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}

function styleByTeam(team: Team, selected: boolean) {
  return {
    border: "2px solid #" + team.color2,
    backgroundColor: `#${team.color}${selected ? "99" : "22"}`,
    color: "#333",
    fontWeight: 600,
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

type Selected = { [gameId: string]: "home" | "away" };

interface Team {
  name: string;
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
