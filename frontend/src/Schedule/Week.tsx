import { useEffect, useRef, useState } from "react";
import "./Week.css";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";

import MatchUp from "./Matchup";
import { Game, IWeek, Team } from "./types";

function Week({ week, teams }: Props) {
  const [token] = useToken();
  const ref = useRef<HTMLElement>(null);
  const [doubler, setDoubler] = useState<string>();
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "bet/doubler?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();
      setDoubler(
        res.find(
          ({ week: w }: any) =>
            w.week === week.week &&
            w.seasontype === week.seasontype &&
            w.year === week.year
        )?.game.id
      );
      setTimeout(() => (loaded.current = true));
    })();
  }, [token, week]);

  useEffect(() => {
    if (token && doubler && week && loaded.current) {
      fetch(BASE_URL + "bet/doubler", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID: doubler,
          week: {
            week: week.week,
            year: week.year,
            seasontype: week.seasontype,
          },
        }),
      });
    }
  }, [token, doubler, week]);

  useEffect(() => {
    if (new Date(week.start) < new Date() && new Date() < new Date(week.end)) {
      ref.current?.scrollIntoView();
    }
  }, [week.end, week.start]);

  return (
    <article className="week" key={week.label} ref={ref}>
      <div className="weekHeader">
        <span className="label">{week.label}</span>
      </div>
      {week.teamsOnBye?.length > 0 && (
        <div className="bye">
          Bye: {week.teamsOnBye.map((t) => t.shortName).join(", ")}
        </div>
      )}
      {splitByDate(week.games).map((time) => (
        <div key={time[0].date}>
          <div className="time">{formatDate(time[0].date)}</div>
          {time.map(
            (g, idx) =>
              g && (
                <MatchUp
                  key={idx}
                  game={g}
                  doubler={doubler === g.id}
                  setDoubler={setDoubler}
                  home={teams.find((t) => t.id === g.homeTeam?.id)}
                  away={teams.find((t) => t.id === g.awayTeam?.id)}
                ></MatchUp>
              )
          )}
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
  teams: Team[];
}

export default Week;
