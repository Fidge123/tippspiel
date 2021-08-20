import { useEffect, useState, useReducer } from "react";
import "./Schedule.css";

import { IWeek, Team } from "./types";
import { BASE_URL } from "../api";
import Week from "./Week";
import {
  statsReducer,
  initialStats,
  StatDispatch,
  StatValues,
} from "./reducers/stats.reducer";
import {
  tippsReducer,
  initialTipps,
  TippDispatch,
  TippValues,
} from "./reducers/bets.reducer";
import { useToken } from "../useToken";

function Schedule() {
  const [token] = useToken();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tipps, dispatchTipps] = useReducer(tippsReducer, initialTipps);
  const [stats, dispatchStats] = useReducer(statsReducer, initialStats);
  const [weeks, setWeeks] = useState<IWeek[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(BASE_URL + "schedule/2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
      fetch(BASE_URL + "team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
    ]).then(
      ([weeks, teams]) => {
        setIsLoaded(true);
        setWeeks(weeks);
        setTeams(teams);
      },
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
    );
  }, [token]);

  useEffect(() => {
    (async () => {
      const res = await fetch(BASE_URL + "leaderboard/games?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatchStats({ type: "init", payload: await res.json() });
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      const res = await fetch(BASE_URL + "bet?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatchTipps({ type: "init", payload: await res.json() });
    })();
  }, [token]);

  if (isLoaded) {
    if (error) {
      return <div>Error occured... please reload!</div>;
    }
    return (
      <section className="schedule">
        <StatDispatch.Provider value={dispatchStats}>
          <StatValues.Provider value={stats}>
            <TippDispatch.Provider value={dispatchTipps}>
              <TippValues.Provider value={tipps}>
                {weeks.map((week, i) => (
                  <Week week={week} teams={teams} key={`Week-${i}`}></Week>
                ))}
              </TippValues.Provider>
            </TippDispatch.Provider>
          </StatValues.Provider>
        </StatDispatch.Provider>
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default Schedule;
