import React, { useEffect, useState, useCallback } from "react";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";

import { IWeek, Tipps, AllStats } from "./types";
import { BASE_URL } from "../api";
import Week from "./Week";

function Schedule() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tipps, setTipps] = useState<Tipps>({});
  const [stats, setStats] = useState<AllStats>({});
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
      if (isLoading || !isAuthenticated) {
        return;
      }

      const response = await fetch(BASE_URL + "leaderboard/games?season=2020", {
        headers: await getAuthHeader("read:tipp"),
      });
      setStats(await response.json());
    })();
  }, [isLoading, isAuthenticated, getAuthHeader]);

  useEffect(() => {
    (async () => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      const response = await fetch(BASE_URL + "tipp", {
        headers: await getAuthHeader("read:tipp"),
      });
      setTipps(await response.json());
    })();
  }, [isLoading, isAuthenticated, getAuthHeader]);

  if (isLoaded) {
    if (error) {
      return <div>Error occured... please reload!</div>;
    }
    return (
      <section className="schedule">
        {weeks.map((week, i) => (
          <Week
            week={week}
            stats={stats}
            tipps={tipps}
            key={`Week-${i}`}
          ></Week>
        ))}
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default Schedule;
