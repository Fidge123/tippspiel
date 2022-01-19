import { useEffect, useState } from "react";
import { useRecoilValue, useRecoilCallback } from "recoil";

import { tokenState, gameBetsState, statsState } from "../State/states";
import { Bet, Stat } from "../State/response-types";
import { IWeek, Team } from "./types";
import { BASE_URL, fetchFromAPI } from "../api";
import Week from "./Week";

function Schedule() {
  const token = useRecoilValue(tokenState);
  const setBet = useRecoilCallback(({ set }) => (gameId: string, bet: Bet) => {
    set(gameBetsState(gameId), bet);
  });
  const setStat = useRecoilCallback(
    ({ set }) =>
      (gameId: string, stat: Stat[]) => {
        set(statsState(gameId), stat);
      }
  );

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadedBets, setIsLoadedBets] = useState(false);
  const [isLoadedStats, setIsLoadedStats] = useState(false);
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
    if (!isLoadedStats) {
      (async () => {
        Object.entries<Stat[]>(
          await fetchFromAPI("leaderboard/games?season=2021", token)
        ).forEach(([id, stat]) => setStat(id, stat));
      })();
      setIsLoadedStats(true);
    }
  }, [token, setStat, isLoadedStats]);

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
        {weeks.map((week, i) => (
          <Week week={week} teams={teams} key={`Week-${i}`}></Week>
        ))}
      </section>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default Schedule;
