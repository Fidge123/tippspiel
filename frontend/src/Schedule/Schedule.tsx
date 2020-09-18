import React, { useEffect, useState, useCallback } from "react";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";

import { IWeek, Tipps, AllStats } from "./types";
import { BASE_URL } from "../api";
import Week from "./Week";

function Schedule() {
  const {
    error: authError,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tipps, setTipps] = useState<Tipps>({});
  const [stats, setStats] = useState<AllStats>({});
  const [weeks, setWeeks] = useState<IWeek[]>([]);

  const getAccessToken = useCallback(
    async (scope: string) => {
      try {
        const token = await getAccessTokenSilently({ scope });
        if (authError || !token) {
          throw Error("Error getting Token!");
        }
        return token;
      } catch (e) {
        return getAccessTokenWithPopup({ scope });
      }
    },
    [authError, getAccessTokenSilently, getAccessTokenWithPopup]
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

      const token = await getAccessToken("read:tipp");
      const response = await fetch(BASE_URL + "leaderboard/games?season=2020", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(await response.json());
    })();
  }, [isLoading, isAuthenticated, getAccessToken]);

  useEffect(() => {
    (async () => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      const token = await getAccessToken("read:tipp");
      const response = await fetch(BASE_URL + "tipp", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTipps(await response.json());
    })();
  }, [isLoading, isAuthenticated, getAccessToken]);

  if (isLoaded) {
    if (error) {
      return <span>Error occured... please reload!</span>;
    }
    return (
      <section className="schedule-inner">
        {weeks.map((week) => (
          <Week week={week} stats={stats} tipps={tipps} key={week.id}></Week>
        ))}
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default Schedule;
