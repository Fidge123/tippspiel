import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Week.css";
import { stringify } from "querystring";
import { useAuth0 } from "@auth0/auth0-react";

import MatchUp from "./Matchup";
import { AllStats, Game, Tipps, IWeek } from "./types";
import { BASE_URL } from "../api";

function Week({ week, stats, tipps }: Props) {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
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

  const getHeaders = useCallback(
    async (scope: string): Promise<{ [header: string]: string }> => {
      return {
        Authorization: `Bearer ${await getAccessTokenSilently({ scope })}`,
        "Content-Type": "application/json",
      };
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    if (isAuthenticated) {
      setAdmin(
        user["https://nfl-tippspiel.herokuapp.com/auth/roles"].includes("Admin")
      );
    }
  }, [isAuthenticated, user]);

  async function postTipp(payload: string) {
    await fetch(`${BASE_URL}tipp`, {
      method: "POST",
      headers: await getHeaders("read:tipp"),
      body: payload,
    });
  }

  async function reloadWeek(week: number, seasontype: number) {
    await fetch(
      `${BASE_URL}scoreboard?${stringify({
        dates: 2020,
        seasontype,
        week,
      })}`,
      {
        method: "POST",
        headers: await getHeaders("read:tipp"),
      }
    );
    window.location.reload();
  }

  return (
    <article className="week" key={week.label} ref={ref}>
      <div className="weekHeader">
        <span className="label">{week.label}</span>
        {admin && (
          <button
            className="reload"
            onClick={() => {
              reloadWeek(week.id, week.seasontype);
            }}
          >
            Reload
          </button>
        )}
      </div>
      {week.teamsOnBye.length > 0 && (
        <div className="bye">Bye: {week.teamsOnBye.join(", ")}</div>
      )}
      {splitByDate(week.games).map((time) => (
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
