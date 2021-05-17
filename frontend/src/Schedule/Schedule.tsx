import React, { useEffect, useState, useCallback, useReducer } from "react";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";

import { IWeek } from "./types";
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
} from "./reducers/tipps.reducer";

function Schedule() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tipps, dispatchTipps] = useReducer(tippsReducer, initialTipps);
  const [stats, dispatchStats] = useReducer(statsReducer, initialStats);
  const [weeks, setWeeks] = useState<IWeek[]>([]);

  const getAuthHeader = useCallback(
    async (scope: string): Promise<{ Authorization: string }> => {
      return {
        Authorization: `Bearer ${await getAccessTokenSilently({ scope })}`,
      };
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetch(BASE_URL + "scoreboard/2021")
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
      if (!isLoading && isAuthenticated) {
        const res = await fetch(BASE_URL + "leaderboard/games?season=2021", {
          headers: await getAuthHeader("read:tipp"),
        });
        dispatchStats({ type: "init", payload: await res.json() });
      }
    })();
  }, [isLoading, isAuthenticated, getAuthHeader]);

  useEffect(() => {
    (async () => {
      if (!isLoading && isAuthenticated) {
        const res = await fetch(BASE_URL + "tipp", {
          headers: await getAuthHeader("read:tipp"),
        });
        dispatchTipps({ type: "init", payload: await res.json() });
      }
    })();
  }, [isLoading, isAuthenticated, getAuthHeader]);

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
                  <Week week={week} key={`Week-${i}`}></Week>
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
