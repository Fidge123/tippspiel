import { useEffect, useRef } from "react";
import "./Week.css";

import MatchUp from "./Matchup";
import { Game, IWeek, Team } from "./types";

function Week({ week, teams }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      new Date(week.startDate) < new Date() &&
      new Date() < new Date(week.endDate)
    ) {
      ref.current?.scrollIntoView();
    }
  }, [week.endDate, week.startDate]);

  return (
    <article className="week" key={week.label} ref={ref}>
      <div className="weekHeader">
        <span className="label">{week.label}</span>
      </div>
      {week.teamsOnBye?.length > 0 && (
        <div className="bye">Bye: {week.teamsOnBye.join(", ")}</div>
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
