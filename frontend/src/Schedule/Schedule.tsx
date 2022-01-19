import { useEffect, useState, useReducer } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";

import { tokenState, gameBetsState } from "../State/states";
import { Bet } from "../State/response-types";
import { IWeek, Team } from "./types";
import { BASE_URL, fetchFromAPI } from "../api";
import Week from "./Week";
import {
  statsReducer,
  initialStats,
  StatDispatch,
  StatValues,
} from "./reducers/stats.reducer";

function Schedule() {
  const token = useRecoilValue(tokenState);
  const setBet = useRecoilCallback(({ set }) => (gameId: string, bet: Bet) => {
    set(gameBetsState(gameId), bet);
  });

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadedBets, setIsLoadedBets] = useState(false);
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
      dispatchStats({
        type: "init",
        payload: await fetchFromAPI("leaderboard/games?season=2021", token),
      });
    })();
  }, [token]);

  useEffect(() => {
    if (!isLoadedBets) {
      (async () => {
        Object.entries<Bet>(
          await fetchFromAPI("bet?season=2021", token)
        ).forEach(([id, bet]) => setBet(id, bet));
      })();
      setIsLoadedBets(true);
    }
  }, [token, setBet, isLoadedBets]);

  if (isLoaded) {
    if (error) {
      return <div>Error occured... please reload!</div>;
    }
    return (
      <section className="grid gap-x-2 sm:gap-x-4 grid-cols-23 sm:grid-cols-27 md:grid-cols-45 gap-y-12 justify-items-center px-1 pb-8 min-w-min">
        <StatDispatch.Provider value={dispatchStats}>
          <StatValues.Provider value={stats}>
            {weeks.map((week, i) => (
              <Week week={week} teams={teams} key={`Week-${i}`}></Week>
            ))}
          </StatValues.Provider>
        </StatDispatch.Provider>
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default Schedule;
