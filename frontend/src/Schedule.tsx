import React, { useEffect, useState } from "react";
import "./Schedule.css";
// import { useAuth0 } from "@auth0/auth0-react";

function Schedule() {
  // const { user, isAuthenticated } = useAuth0();

  // const [error, setError] = useState(null);
  // const [isLoaded, setIsLoaded] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);

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
        <article>
          <span>week.label</span>
          {week.teamsOnBye && <span>week.teamsOnBye.join(', ')</span>}
          {week.games.map((game) => (
            <span>
              {game.away.name} @ {game.home.name}
            </span>
          ))}
        </article>
      ))}
    </section>
  );
}

interface Game {
  date: string;
  status: string;
  home: {
    name: string;
    score: string;
  };
  away: {
    name: string;
    score: string;
  };
}

interface Week {
  label: string;
  teamsOnBye: string[];
  startDate: string;
  endDate: string;
  games: Game[];
}

export default Schedule;
