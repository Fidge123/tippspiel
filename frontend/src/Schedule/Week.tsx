import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Week.css";
import { stringify } from "querystring";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

import MatchUp from "./Matchup";
import { AllStats, Game, Tipps, IWeek } from "./types";
import { BASE_URL } from "../api";

function Week({ week, stats, tipps }: Props) {
  const {
    error: authError,
    user,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();
  const [admin, setAdmin] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      new Date(week.startDate) < new Date() &&
      new Date() < new Date(week.endDate)
    ) {
      ref.current?.scrollIntoView();
    }
  }, [week.endDate, week.startDate]);

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

  return (
    <article className="week" key={week.label} ref={ref}>
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
  );
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

interface Props {
  week: IWeek;
  stats: AllStats;
  tipps: Tipps;
}

export default Week;
