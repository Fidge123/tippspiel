import React, { useEffect, useState, useCallback } from "react";
import Button from "react-bootstrap/Button";
import "./Schedule.css";
import { useAuth0 } from "@auth0/auth0-react";
import { stringify } from "querystring";
import MatchUp from "./Matchup";
import { Week, Tipps, Game } from "./types";

const BASE_URL = "https://nfl-tippspiel.herokuapp.com/";
// const BASE_URL = "http://localhost:5000/";

function Schedule() {
  const {
    error: authError,
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [tipps, setTipps] = useState<Tipps>({});
  const [stats, setStats] = useState<any>({});
  const [admin, setAdmin] = useState(false);

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
    if (isAuthenticated) {
      setAdmin(
        user["https://nfl-tippspiel.herokuapp.com/auth/roles"].includes("Admin")
      );
    }
  }, [isAuthenticated, user]);

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

  async function postTipp(payload: string) {
    const token = await getAccessToken("write:tipp");

    await fetch(BASE_URL + "tipp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });
  }

  async function reloadWeek(week: number, seasontype: number) {
    const token = await getAccessToken("write:schedule");

    await fetch(
      `${BASE_URL}scoreboard?${stringify({
        dates: 2020,
        seasontype,
        week,
      })}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    window.location.reload();
  }

  if (isLoaded) {
    if (error) {
      return <span>Error occured... please reload!</span>;
    }
    return (
      <section className="schedule-inner">
        {weeks.map((week) => (
          <article className="week" key={week.label}>
            <div className="weekHeader">
              <span className="label">{week.label}</span>
              {admin && (
                <Button
                  className="reload"
                  size="sm"
                  onClick={() => {
                    reloadWeek(week.id, week.seasontype);
                  }}
                >
                  Reload
                </Button>
              )}
            </div>
            {week.teamsOnBye.length > 0 && (
              <div className="bye">Bye: {week.teamsOnBye.join(", ")}</div>
            )}
            {splitByDate(week.games).map((time, idx) => (
              <div key={time[0].date}>
                <div className="time">{formatDate(time[0].date)}</div>
                {time.map((g, idx) => (
                  <MatchUp
                    key={idx}
                    game={g}
                    stats={stats[g.id]}
                    tipp={tipps[g.id]}
                    handleTipp={postTipp}
                  ></MatchUp>
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

export default Schedule;
